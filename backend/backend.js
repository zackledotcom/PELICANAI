// ✅ Token Stress Test + Health Check System Injected
// 📌 Component: Backend Service
import { QdrantClient } from "@qdrant/js-client-rest";
import { v4 as uuidv4 } from "uuid";
import { encode } from "gpt-tokenizer";

const qdrant = new QdrantClient({ url: "http://localhost:6333" });

// Storage utilities
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

// Embedding service
  const getEmbedding = async (text) => {
    try {
    const response = await fetch("http://localhost:8001/embed", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ input: text })
    });
    
    if (!response.ok) {
      throw new Error(`Embedding service error: ${response.status}`);
    }
    
    const data = await response.json();
    return data.embedding;
    } catch (error) {
    console.error("Primary embedding service failed:", error);
    
    // Try fallback service
      try {
      const fallbackResponse = await fetch("http://localhost:8001/embed_fallback", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ input: text })
      });
      
      if (!fallbackResponse.ok) {
        throw new Error(`Fallback embedding service error: ${fallbackResponse.status}`);
      }
      
      const fallbackData = await fallbackResponse.json();
      return fallbackData.embedding;
    } catch (fallbackError) {
      console.error("Fallback embedding service also failed:", fallbackError);
      throw fallbackError;
    }
  }
  };

// Qdrant operations
const upsertToQdrant = async (message) => {
  try {
    const vector = await getEmbedding(message.text);
    await qdrant.upsert("chat_memory", {
      points: [{
        id: message.id,
        vector,
        payload: message
      }]
    });
    return true;
  } catch (error) {
    console.error("Failed to upsert to Qdrant:", error);
    return false;
  }
    };

const retrieveSimilar = async (inputText, options = {}) => {
  const { topK = 5, decayFactor = 0.95, mode = "balanced" } = options;
  
  try {
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
  } catch (error) {
    console.error("Error retrieving similar items:", error);
    return [];
  }
  };

const trimContext = (messages, maxTokens = 2048) => {
  const pinned = messages.filter((m) => m.pinned);
  const nonPinned = messages.filter((m) => !m.pinned).sort((a, b) => b.timestamp - a.timestamp);
  const result = [...pinned];
  let total = pinned.reduce((sum, m) => sum + encode(m.text).length, 0);
  
  for (const m of nonPinned) {
    const len = encode(m.text).length;
    if (total + len > maxTokens) break;
    result.push(m);
    total += len;
  }
  
  return result;
  };

const runHealthCheck = async () => {
  try {
    // Check embedding service
    const embedCheck = await fetch("http://localhost:8001/embed", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ input: "ping" })
    }).then(res => res.ok).catch(() => false);

    // Check Qdrant
    const qdrantCheck = await qdrant.getCollections().then(() => true).catch(() => false);
    
    // Check WebSocket
    const wsCheck = await new Promise((resolve) => {
      const test = new WebSocket("ws://localhost:8000/ws");
      test.onopen = () => {
        test.close();
        resolve(true);
  };
      test.onerror = () => resolve(false);
      setTimeout(() => resolve(false), 3000); // Timeout after 3 seconds
    });

    return { 
      embed: embedCheck, 
      qdrant: qdrantCheck, 
      ws: wsCheck,
      timestamp: Date.now()
    };
  } catch (e) {
    console.error("Health check failed:", e);
    return { 
      embed: false, 
      qdrant: false, 
      ws: false,
      error: e.message,
      timestamp: Date.now()
    };
}
};

// Export backend functions
module.exports = {
  saveToStorage,
  loadFromStorage,
  getEmbedding,
  upsertToQdrant,
  retrieveSimilar,
  trimContext,
  runHealthCheck
};