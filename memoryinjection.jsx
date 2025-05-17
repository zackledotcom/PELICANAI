// MemoryInjection.jsx — Injects vector recall into token-safe prompt context
import { useEffect, useState } from "react";
import { calculateTokenLength } from "../utils/tokens";

const useMemoryInjection = ({ vectorState, pins, tokenLimit, mode, setEmbeddingActive }) => {
  const [memoryContext, setMemoryContext] = useState("");

  useEffect(() => {
    const inject = async () => {
      try {
        setEmbeddingActive(true);
        const all = [...pins, ...Object.values(vectorState)].sort(
          (a, b) => (b.meta?.pinned ? 1 : 0) - (a.meta?.pinned ? 1 : 0) ||
            b.timestamp - a.timestamp
        );

        let result = "";
        let totalTokens = 0;

        for (const item of all) {
          const content = `\n• ${item.text.trim()}`;
          const cost = calculateTokenLength(content);
          if (totalTokens + cost > tokenLimit * 0.75) break;
          result += content;
          totalTokens += cost;
        }

        setMemoryContext(result);
      } finally {
        setEmbeddingActive(false);
      }
    };

    inject();
  }, [vectorState, pins, tokenLimit, mode]);

  return memoryContext;
};

export default useMemoryInjection;
