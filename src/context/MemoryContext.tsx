import React, { createContext, useState, useCallback, ReactNode } from 'react';
import { queryQdrant, pinQdrant, unpinQdrant } from '../services/vectorAPI';

export interface MemoryItem {
  id: string;
  content: string;
  timestamp: number;
  pinned: boolean;
  score: number;
  tokenCount: number;
}

interface MemoryContextType {
  memoryHits: MemoryItem[];
  tokenUsage: number;
  maxTokens: number;
  pinMemory: (id: string) => Promise<void>;
  unpinMemory: (id: string) => Promise<void>;
  fetchMemoryHits: (query: string) => Promise<void>;
  setMaxTokens: (tokens: number) => void;
  clearMemory: () => void;
}

export const MemoryContext = createContext<MemoryContextType>({
  memoryHits: [],
  tokenUsage: 0,
  maxTokens: 2048,
  pinMemory: async () => {},
  unpinMemory: async () => {},
  fetchMemoryHits: async () => {},
  setMaxTokens: () => {},
  clearMemory: () => {}
});

interface MemoryProviderProps {
  children: ReactNode;
  initialMaxTokens?: number;
}

export const MemoryProvider: React.FC<MemoryProviderProps> = ({ 
  children, 
  initialMaxTokens = 2048 
}) => {
  const [memoryHits, setMemoryHits] = useState<MemoryItem[]>([]);
  const [tokenUsage, setTokenUsage] = useState(0);
  const [maxTokens, setMaxTokens] = useState(initialMaxTokens);
  
  const pinMemory = useCallback(async (id: string) => {
    try {
      await pinQdrant(id);
      setMemoryHits(prev => 
        prev.map(hit => hit.id === id ? { ...hit, pinned: true } : hit)
      );
    } catch (error) {
      console.error("Error pinning memory:", error);
    }
  }, []);
  
  const unpinMemory = useCallback(async (id: string) => {
    try {
      await unpinQdrant(id);
      setMemoryHits(prev => 
        prev.map(hit => hit.id === id ? { ...hit, pinned: false } : hit)
      );
    } catch (error) {
      console.error("Error unpinning memory:", error);
    }
  }, []);
  
  const fetchMemoryHits = useCallback(async (query: string) => {
    try {
      const hits = await queryQdrant(query);
      setMemoryHits(hits);
      
      // Calculate token usage
      const totalTokens = hits.reduce((sum, hit) => sum + (hit.tokenCount || 0), 0);
      setTokenUsage(totalTokens);
    } catch (error) {
      console.error("Error fetching memory hits:", error);
    }
  }, []);
  
  const clearMemory = useCallback(() => {
    setMemoryHits([]);
    setTokenUsage(0);
  }, []);
  
  const value = {
    memoryHits,
    tokenUsage,
    maxTokens,
    pinMemory,
    unpinMemory,
    fetchMemoryHits,
    setMaxTokens,
    clearMemory
  };
  
  return (
    <MemoryContext.Provider value={value}>
      {children}
    </MemoryContext.Provider>
  );
};