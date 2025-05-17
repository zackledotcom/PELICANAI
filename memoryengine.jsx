// MemoryEngine.jsx — Handles vector embedding, retrieval, scoring, and injection
import { useEffect, useState, useCallback } from "react";
import { useEmbedding } from "../hooks/useEmbedding";
import { useVectorStore } from "../hooks/useVectorStore";
import { useTokenBudget } from "../hooks/useTokenBudget";

const MAX_TOKENS = 6000;

export const MemoryEngine = ({ userMessages, onInject }) => {
  const { getEmbedding } = useEmbedding();
  const { searchMemory, addToMemory, clearMemory } = useVectorStore();
  const { remainingTokens, updateTokenUsage } = useTokenBudget(MAX_TOKENS);
  const [injected, setInjected] = useState([]);

  const buildContext = useCallback(async () => {
    if (!userMessages.length) return;

    const latest = userMessages[userMessages.length - 1];
    const vector = await getEmbedding(latest.content);
    if (!vector) return;

    await addToMemory({ ...latest, vector });
    const topMatches = await searchMemory(vector, { topK: 10 });

    const scored = topMatches
      .filter(item => !item.pinned)
      .map(item => ({
        ...item,
        score: item.similarity - (Date.now() - item.timestamp) / 1e8
      }))
      .sort((a, b) => b.score - a.score);

    let budget = remainingTokens;
    const context = [];
    for (let mem of scored) {
      const tokenCost = mem.content.split(" ").length; // naive estimate
      if (budget - tokenCost > 0) {
        context.push(mem);
        budget -= tokenCost;
      }
    }

    setInjected(context);
    onInject(context);
    updateTokenUsage(MAX_TOKENS - budget);
  }, [userMessages, getEmbedding, searchMemory, addToMemory, remainingTokens, updateTokenUsage]);

  useEffect(() => {
    buildContext();
  }, [buildContext]);

  return null;
};
