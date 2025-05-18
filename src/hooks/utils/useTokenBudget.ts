import { useState, useCallback } from 'react';

interface TokenBudgetOptions {
  initialBudget?: number;
  initialUsed?: number;
}

interface TokenBudgetResult {
  used: number;
  budget: number;
  remaining: number;
  consume: (tokens: number) => void;
  reset: () => void;
  error: string | null;
}

/**
 * Custom hook to manage token budget for API calls
 * 
 * @param options - Configuration options
 * @returns Token budget state and management functions
 */
export const useTokenBudget = (
  options: TokenBudgetOptions = {}
): TokenBudgetResult => {
  const { initialBudget = 2048, initialUsed = 0 } = options;
  
  const [used, setUsed] = useState<number>(initialUsed);
  const [budget, setBudget] = useState<number>(initialBudget);
  const [error, setError] = useState<string | null>(null);
  
  /**
   * Consume tokens from the budget
   * 
   * @param tokens - Number of tokens to consume
   * @throws Error if budget would be exceeded
   */
  const consume = useCallback((tokens: number) => {
    try {
      if (tokens < 0) {
        throw new Error('Cannot consume negative tokens');
      }
      
      if (used + tokens > budget) {
        throw new Error(`Token budget exceeded: ${used + tokens}/${budget}`);
      }
      
      setUsed(prev => prev + tokens);
      setError(null);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Unknown token budget error';
      setError(errorMessage);
      throw err;
    }
  }, [used, budget]);
  
  /**
   * Reset token usage to zero
   */
  const reset = useCallback(() => {
    try {
      setUsed(0);
      setError(null);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to reset token budget';
      setError(errorMessage);
    }
  }, []);
  
  return {
    used,
    budget,
    remaining: budget - used,
    consume,
    reset,
    error
  };
};

export default useTokenBudget;