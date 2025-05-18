import { useState } from "react";

const useTokenBudget = (limit = 6000) => {
  const [used, setUsed] = useState(0);
  const [budget] = useState(limit);
  const [error, setError] = useState(null);

  const consume = (tokens) => {
    try {
      if (used + tokens > budget) {
        throw new Error("Token budget exceeded. Cannot consume more tokens.");
      }
      setUsed((u) => u + tokens);
    } catch (err) {
      setError(err.message);
      console.error("Error consuming tokens:", err);
    }
  };

  const reset = () => {
    try {
      setUsed(0);
    } catch (err) {
      setError("Failed to reset token usage.");
      console.error("Error resetting tokens:", err);
    }
  };

  return { used, budget, remaining: budget - used, consume, reset, error };
};

export default useTokenBudget;
