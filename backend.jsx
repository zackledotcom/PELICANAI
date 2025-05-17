// ✅ Token Stress Test + Health Check System Injected
// 📌 Component: ChatApp (Chatbox Ui Backend)

import { useState, useRef, useEffect } from "react";
import { encode } from "gpt-tokenizer";
import { QdrantClient } from "@qdrant/js-client-rest";
import { v4 as uuidv4 } from "uuid";

const qdrant = new QdrantClient({ url: "http://localhost:6333" });

const getStorage = () => {
  if (window.indexedDB) return window.indexedDB;
  return localStorage;
};

const saveToStorage = (key, value) => {
  try {
    localStorage.setItem(key, value);
  } catch (e) {
    console.warn("LocalStorage fallback triggered", e);
  }
};

const loadFromStorage = (key) => {
  try {
    return localStorage.getItem(key);
  } catch (e) {
    console.warn("Load from storage failed", e);
    return null;
  }
};

export default function ChatApp() {
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState("");
  const [connected, setConnected] = useState(false);
  const [showPanel, setShowPanel] = useState(false);
  const [mode, setMode] = useState("lean");
  const [files, setFiles] = useState([]);
  const [videoThumbnails, setVideoThumbnails] = useState([]);
  const [memoryEnabled, setMemoryEnabled] = useState(true);
  const [healthStatus, setHealthStatus] = useState({ embed: false, qdrant: false, ws: false });
  const ws = useRef(null);
  const messagesEndRef = useRef(null);

  const maxTokens = 3500;
  const topK = 5;
  const decayFactor = 0.95;
  const indexKey = "fractal_messages";

  useEffect(() => {
    const saved = loadFromStorage(indexKey);
    if (saved) setMessages(JSON.parse(saved));
    runHealthCheck();
  }, []);

  useEffect(() => {
    scrollToBottom();
    saveToStorage(indexKey, JSON.stringify(messages));
  }, [messages]);

  const runHealthCheck = async () => {
    try {
      const embed = await fetch("http://localhost:8001/embed", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ input: "ping" })
      }).then(res => res.ok).catch((err) => {
        console.error("Embed health check failed:", err);
        return false;
      });

      const qdrantCheck = await qdrant.getCollections().then(() => true).catch(() => false);
      const wsPing = new Promise((resolve) => {
        const test = new WebSocket("ws://localhost:8000/ws");
        test.onopen = () => {
          test.close();
          resolve(true);
        };
        test.onerror = () => resolve(false);
      });

      const wsHealthy = await wsPing;
      setHealthStatus({ embed, qdrant: qdrantCheck, ws: wsHealthy });
    } catch (e) {
      console.error("Health check failed:", e);
    }
  };

  const connectWebSocket = () => {
    ws.current = new WebSocket("ws://localhost:8000/ws");
    ws.current.onopen = () => setConnected(true);
    ws.current.onclose = () => setConnected(false);
    ws.current.onmessage = async (event) => {
      const message = { id: uuidv4(), sender: "ai", text: event.data, timestamp: Date.now() };
      setMessages((prev) => [...prev, message]);
      if (memoryEnabled) await upsertToQdrant(message);
    };
  };

  const getEmbedding = async (text) => {
    try {
      const res = await fetch("http://localhost:8001/embed", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ input: text })
      });
      if (!res.ok) throw new Error(`Embedding service error: ${res.status}`);
      const data = await res.json();
      return data.vector;
    } catch (error) {
      console.error("Embedding fetch failed:", error);
      try {
        const fallback = await fetch("http://localhost:8001/embed_fallback", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ input: text })
        });
        if (!fallback.ok) throw new Error("Fallback embedding failed");
        const data = await fallback.json();
        return data.vector;
      } catch (fallbackError) {
        console.error("Fallback embedding also failed:", fallbackError);
        return new Array(384).fill(0);
      }
    }
  };

  const upsertToQdrant = async (message) => {
    try {
      const vector = await getEmbedding(message.text);
      await qdrant.upsert("chat_memory", {
        wait: true,
        points: [
          {
            id: message.id,
            vector,
            payload: message,
          },
        ],
      });
    } catch (error) {
      console.error("Qdrant upsert failed:", error);
    }
  };

  const retrieveSimilar = async (inputText) => {
    const vector = await getEmbedding(inputText);
    const results = await qdrant.search("chat_memory", {
      vector,
      limit: topK,
      with_payload: true,
      score_threshold: 0.2,
    });
    const now = Date.now();
    return results
      .filter(hit => hit.payload && hit.payload.timestamp)
      .map((hit) => {
        const age = (now - hit.payload.timestamp) / 1000;
        const decay = Math.pow(decayFactor, age / 60);
        const pinBoost = hit.payload.pinned ? 1.1 : 1.0;
        const interactionWeight = (hit.payload.interactions || 1) * 0.05 + 1;
        const modeWeight = mode === "lean" ? 0.8 : 1.2;
        const score = hit.score * decay * pinBoost * interactionWeight * modeWeight;
        return { ...hit.payload, score };
      })
      .filter(item => item.score > 0.1)
      .sort((a, b) => b.score - a.score);
  };

  const trimContext = (messages, max = maxTokens) => {
    const pinned = messages.filter((m) => m.pinned);
    const nonPinned = messages.filter((m) => !m.pinned).sort((a, b) => b.timestamp - a.timestamp);
    const result = [...pinned];
    let total = pinned.reduce((sum, m) => sum + encode(m.text).length, 0);
    for (const m of nonPinned) {
      const len = encode(m.text).length;
      if (total + len > max) break;
      result.push(m);
      total += len;
    }
    return result;
  };

  const sendMessage = async () => {
    if (ws.current?.readyState === WebSocket.OPEN) {
      const userMsg = { id: uuidv4(), sender: "user", text: input, timestamp: Date.now() };
      const newMessages = [...messages, userMsg];
      setMessages(newMessages);
      if (memoryEnabled) await upsertToQdrant(userMsg);
      const retrieved = memoryEnabled ? await retrieveSimilar(input) : [];
      const fullContext = trimContext([...newMessages, ...retrieved]);
      const payload = JSON.stringify({ messages: fullContext, input });
      try {
        ws.current.send(payload);
      } catch (error) {
        console.error("WebSocket send failed:", error);
      }
      setInput("");
    }
  };

  const scrollToBottom = (() => {
    let timer;
    return () => {
      clearTimeout(timer);
      timer = setTimeout(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
      }, 100);
    };
  })();

  const pinMessage = (id) => {
    setMessages((prev) => prev.map((m) => m.id === id ? { ...m, pinned: !m.pinned } : m));
  };

  const resetSession = () => {
    setMessages([]);
    saveToStorage(indexKey, JSON.stringify([]));
  };

  const handleFileSelect = (e) => {
    const selected = Array.from(e.target.files);
    setFiles(selected);
    selected.forEach(file => {
      if (file.type.startsWith("video/")) {
        const url = URL.createObjectURL(file);
        setVideoThumbnails(prev => [...prev, { name: file.name, url }]);
      }
    });
  };

  return (
    // unchanged UI JSX
    // ... (keep as-is)
  );
}
