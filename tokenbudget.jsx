// TokenBudget.jsx — Monitors and enforces token constraints based on user mode
import { useState, useEffect } from "react";

const useTokenBudget = ({ userMode }) => {
  const [tokenUsage, setTokenUsage] = useState(0);
  const [maxTokens, setMaxTokens] = useState(4096);

  useEffect(() => {
    switch (userMode) {
      case "Lean":
        setMaxTokens(2048);
        break;
      case "Omega":
        setMaxTokens(8192);
        break;
      case "Investigate":
        setMaxTokens(12288);
        break;
      default:
        setMaxTokens(4096);
    }
  }, [userMode]);

  useEffect(() => {
    const observer = new MutationObserver(() => {
      const allText = Array.from(document.querySelectorAll(".chat-bubble"))
        .map((el) => el.textContent)
        .join(" ");
      setTokenUsage(allText.length / 4);
    });

    observer.observe(document.body, { childList: true, subtree: true });
    return () => observer.disconnect();
  }, []);

  return { tokenUsage, maxTokens };
};

export default useTokenBudget;
