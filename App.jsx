import React, { useState, useEffect, useRef, useCallback } from "react";
import { ThemeProvider } from "./ThemeProvider";
import { MemoryPanel } from "./MemoryPanel";
import { SlideoutControls } from "./SlideoutControls";
import { MessageList } from "./MessageList";
import InputBar from "./InputBar";
import { useVectorMemory } from "./hooks/useVectorMemory";
import { useTokenBudget } from "./hooks/useTokenBudget";
import { useMemoryInjection } from "./hooks/useMemoryInjection";
import { useEmotionAwareTheme } from "./hooks/useEmotionAwareTheme";
import { AppLayout } from "./AppLayout";

const INITIAL_MODE = "omega"; // "lean", "omega", "investigate"

export default function App() {
  const [messages, setMessages] = useState([]);
  const [slideoutOpen, setSlideoutOpen] = useState(false);
  const [mode, setMode] = useState(INITIAL_MODE);
  const [pinned, setPinned] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const inputRef = useRef();

  // Vector memory / embeddings
  const vectorMemory = useVectorMemory(messages, pinned, mode);
  const { tokensLeft, budget } = useTokenBudget(messages, vectorMemory);
  const memoryContext = useMemoryInjection(messages, vectorMemory, mode, budget);

  // Emotion-based theming
  const theme = useEmotionAwareTheme(messages);

  // Cold start: restore from localStorage / IndexedDB
  useEffect(() => {
    const stored = localStorage.getItem("pelican_ai_history");
    if (stored) setMessages(JSON.parse(stored));
  }, []);

  // Persist on change
  useEffect(() => {
    localStorage.setItem("pelican_ai_history", JSON.stringify(messages));
  }, [messages]);

  const handleSend = useCallback(
    async (text, files = []) => {
      setLoading(true);
      setError(null);
      try {
        // Add user message
        const newMsg = { role: "user", content: text, files, ts: Date.now() };
        setMessages(msgs => [...msgs, newMsg]);

        // Inject memory
        const promptWithMemory = memoryContext.inject(text);

        // --- Call your LLM backend here (replace with your real endpoint) ---
        const aiReply = await fetch("/api/generate", {
          method: "POST",
          body: JSON.stringify({ prompt: promptWithMemory, mode }),
          headers: { "Content-Type": "application/json" }
        })
          .then(r => r.json())
          .then(d => d.reply);

        setMessages(msgs => [
          ...msgs,
          { role: "ai", content: aiReply, ts: Date.now() }
        ]);
      } catch (err) {
        setError("Error generating response");
      } finally {
        setLoading(false);
      }
    },
    [memoryContext, mode]
  );

  // Pinning messages to memory
  const handlePin = idx => {
    setPinned(ps => [...ps, idx]);
  };

  // Slideout toggles, UI controls
  const toggleSlideout = () => setSlideoutOpen(v => !v);
  const switchMode = m => setMode(m);

  return (
    <ThemeProvider theme={theme}>
      <AppLayout>
        <SlideoutControls
          open={slideoutOpen}
          mode={mode}
          switchMode={switchMode}
          toggleSlideout={toggleSlideout}
          tokensLeft={tokensLeft}
          budget={budget}
        />
        <MemoryPanel
          pinned={pinned}
          messages={messages}
          onPin={handlePin}
          vectorMemory={vectorMemory}
          mode={mode}
        />
        <MessageList messages={messages} loading={loading} error={error} />
        <InputBar
          onSend={handleSend}
          loading={loading}
          inputRef={inputRef}
          slideoutOpen={slideoutOpen}
        />
      </AppLayout>
    </ThemeProvider>
  );
}