import React, { useEffect, useState, useRef } from "react";
import SlideoutControls from "./SlideoutControls.jsx";
import ThemeProvider from "../providers/ThemeProvider.jsx";
import { cn } from "../utils/classnames";
import MemoryInspector from "./MemoryInspector.jsx";
import useColdStartRecovery from "../hooks/useColdStartRecovery";
import useTokenBudget from "../hooks/useTokenBudget";
import useEmotionAwareTheme from "../hooks/useEmotionAwareTheme";
import useVectorMemory from "../hooks/useVectorMemory";
import useMemoryInjection from "../hooks/useMemoryInjection";
import { preloadFonts } from "../utils/perf";

const AppLayout = ({ children, themeOverride }) => {
  const isUpdatingRef = useRef(false);
  const [isControlsOpen, setIsControlsOpen] = useState(false);
  const [theme, setTheme] = useState(themeOverride || "light");
  const [userMode, setUserMode] = useState("Lean");
  const [semanticMemoryEnabled, setSemanticMemoryEnabled] = useState(true);
  const [emotionUIEnabled, setEmotionUIEnabled] = useState(true);
  const [showInspector, setShowInspector] = useState(false);
  const [embeddingActive, setEmbeddingActive] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");

  let tokenUsage = 0;
  let maxTokens = 0;
  let vectorState = {};
  let pins = [];
  let memoryContext = {};

  try {
    const tokenBudget = useTokenBudget({ userMode });
    tokenUsage = tokenBudget.tokenUsage;
    maxTokens = tokenBudget.maxTokens;
  } catch (err) {
    setErrorMsg("Token budget error: " + err.message);
  }

  try {
    const vectorMemory = useVectorMemory({ mode: userMode });
    vectorState = vectorMemory.vectorState;
    pins = vectorMemory.pins;
  } catch (err) {
    setErrorMsg("Vector memory error: " + err.message);
  }

  try {
    memoryContext = useMemoryInjection({
      vectorState,
      pins,
      tokenLimit: maxTokens,
      mode: userMode,
      setEmbeddingActive,
    });
  } catch (err) {
    setErrorMsg("Memory injection error: " + err.message);
  }

  useColdStartRecovery({
    setTheme,
    setUserMode,
    setSemanticMemoryEnabled,
    setEmotionUIEnabled,
    restoreVectorState: () => {
      try {
        vectorState?.restore?.();
      } catch (e) {
        setErrorMsg("Vector restore failed: " + e.message);
      }
    },
  });

  useEmotionAwareTheme({ emotionUIEnabled, userMode, setTheme });
