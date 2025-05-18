import React from "react";
import SlideoutControls from "./SlideoutControls";
import MemoryInspector from "./MemoryInspector";
import InputBar from "./InputBar";
import TokenBudgetIndicator from "./TokenBudgetIndicator";
import { useEmotionAwareTheme } from "./useEmotionAwareTheme";
import "./styles/layout.css";

export default function AppLayout() {
  useEmotionAwareTheme();

  return (
    <div className="pelicanai-root">
      <SlideoutControls />
      <main>
        <MemoryInspector />
        <section className="chat-section">
          {/* Chat will render here via MessageBubble/AIResponseBubble */}
        </section>
        <TokenBudgetIndicator />
        <InputBar />
      </main>
    </div>
  );
}
