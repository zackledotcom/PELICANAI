import React, { useEffect, useState } from "react";
import { MemoryPanel } from "./components/MemoryPanel";
import { InputArea } from "./components/InputArea";
import { ModeSwitch } from "./components/ModeSwitch";
import { HealthStatus } from "./components/HealthStatus";
import { useMemory } from "./hooks/useMemory";
import { StyleWrapper } from "./styles/StyleWrapper";
import "./styles/global.css";

const App = () => {
  const {
    messages,
    sendMessage,
    pinned,
    memoryHits,
    tokenBudget,
    mode,
    setMode,
    health,
  } = useMemory();

  const pulseStyle = {
    animation: "pulse 1.2s infinite ease-in-out",
    transformOrigin: "center center",
  };

  return (
    <StyleWrapper mode={mode}>
      <main className="app-container">
        <HealthStatus health={health} />
        <ModeSwitch mode={mode} setMode={setMode} />
        <MemoryPanel
          hits={memoryHits}
          pinned={pinned}
          tokenBudget={tokenBudget}
          style={pulseStyle}
        />
        <section className="chat-area">
          {messages.map((msg, idx) => (
            <div
              key={idx}
              className={`bubble ${msg.role === "user" ? "user" : "ai"}`}
            >
              {msg.content}
            </div>
          ))}
        </section>
        <InputArea onSend={sendMessage} />
      </main>
    </StyleWrapper>
  );
};

export default App;
