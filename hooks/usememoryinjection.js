import { useEffect, useState } from "react";
import useVectorMemory from "./useVectorMemory";
import useTokenBudget from "./useTokenBudget";

const useMemoryInjection = (messages) => {
  const { memories } = useVectorMemory();
  const { budget, consume, error: tokenError } = useTokenBudget();
  const [memory, setMemory] = useState([]);
  const [error, setError] = useState(null);

  const addMemory = (newMemory) => {
    try {
      setMemory((prev) => [...prev, newMemory]);
    } catch (err) {
      setError("Failed to add memory.");
      console.error("Error adding memory:", err);
    }
  };

  const clearMemory = () => {
    try {
      setMemory([]);
    } catch (err) {
      setError("Failed to clear memory.");
      console.error("Error clearing memory:", err);
    }
  };

  useEffect(() => {
    console.log("Memory updated:", memory);
  }, [memory]);

  useEffect(() => {
    try {
      if (tokenError) {
        throw new Error(tokenError);
      }

      let tokensUsed = 0;
      memories.forEach((mem) => {
        if (tokensUsed + mem.tokenCount < budget) {
          // inject this memory
          tokensUsed += mem.tokenCount;
          consume(mem.tokenCount);
        } else {
          console.warn("Memory injection skipped due to token budget constraints.");
        }
      });
    } catch (err) {
      setError("Error during memory injection.");
      console.error("Error during memory injection:", err);
    }
  }, [messages, memories, budget, consume, tokenError]);

  return { memory, addMemory, clearMemory, error };
};

export default useMemoryInjection;
