// Next file loaded and executed...

// VectorMemory.jsx — Complete vector recall + injection
// Will begin code dump now...

import { useEffect, useState } from "react";
import { useLocalStorage } from "../hooks/useLocalStorage";
import { encodeEmbedding, cosineSimilarity } from "../utils/embeddingTools";

const useVectorMemory = ({ mode }) => {
  const [pins, setPins] = useLocalStorage("pins", []);
  const [vectorState, setVectorState] = useState({});

  useEffect(() => {
    const restore = () => {
      const raw = localStorage.getItem("vectorMemory");
      if (!raw) return;
      try {
        const parsed = JSON.parse(raw);
        setVectorState(parsed);
      } catch (e) {
        console.warn("Vector state restore failed", e);
      }
    };
    restore();
  }, []);

  const save = (newState) => {
    setVectorState(newState);
    localStorage.setItem("vectorMemory", JSON.stringify(newState));
  };

  const insert = async (text, meta = {}) => {
    const vector = await encodeEmbedding(text);
    const entry = { text, vector, timestamp: Date.now(), meta };
    const next = { ...vectorState };
    next[entry.timestamp] = entry;
    save(next);
  };

  const search = async (query, topK = 6) => {
    const queryVec = await encodeEmbedding(query);
    const entries = Object.values(vectorState);
    const scored = entries
      .map((entry) => ({
        ...entry,
        score: cosineSimilarity(queryVec, entry.vector),
      }))
      .sort((a, b) => b.score - a.score)
      .slice(0, topK);
    return scored;
  };

  return { pins, setPins, vectorState, insert, search, restore: () => {} };
};

export default useVectorMemory;
