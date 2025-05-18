import { encode } from 'gpt-tokenizer';

// Types
export interface MemoryItem {
  id: string;
  content: string;
  timestamp: number;
  pinned: boolean;
  score: number;
  tokenCount: number;
}

interface QueryOptions {
  limit?: number;
  threshold?: number;
  withMetadata?: boolean;
}

// Cache for embeddings to avoid redundant API calls
const embeddingCache = new Map<string, number[]>();

/**
 * Gets vector embeddings for text input
 * 
 * @param text - The text to embed
 * @returns Promise resolving to vector embedding
 */
export const getEmbeddings = async (text: string): Promise<number[]> => {
  // Check cache first
  if (embeddingCache.has(text)) {
    return embeddingCache.get(text)!;
  }
  
  try {
    const response = await fetch("http://localhost:8001/embed", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ input: text })
    });
    
    if (!response.ok) {
      throw new Error(`Embedding service responded with status: ${response.status}`);
    }
    
    const data = await response.json();
    const embedding = data.embedding;
    
    // Cache the result
    embeddingCache.set(text, embedding);
    
    return embedding;
  } catch (error) {
    console.error("Error getting embeddings:", error);
    
    // Try fallback embedding service
    try {
      const fallbackResponse = await fetch("http://localhost:8001/embed_fallback", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ input: text })
      });
      
      if (!fallbackResponse.ok) {
        throw new Error(`Fallback embedding service failed: ${fallbackResponse.status}`);
      }
      
      const fallbackData = await fallbackResponse.json();
      const fallbackEmbedding = fallbackData.embedding;
      
      // Cache the result
      embeddingCache.set(text, fallbackEmbedding);
      
      return fallbackEmbedding;
    } catch (fallbackError) {
      console.error("Fallback embedding service also failed:", fallbackError);
      // Return a simple placeholder vector as last resort
      return Array(1536).fill(0).map(() => Math.random() * 0.01);
    }
  }
};

/**
 * Queries Qdrant vector database for similar memories
 * 
 * @param text - The query text
 * @param options - Query options (limit, threshold, etc.)
 * @returns Promise resolving to array of memory items
 */
export const queryQdrant = async (
  text: string, 
  options: QueryOptions = {}
): Promise<MemoryItem[]> => {
  const { limit = 5, threshold = 0.7, withMetadata = true } = options;
  
  try {
    const embedding = await getEmbeddings(text);
    
    const response = await fetch("http://localhost:6333/collections/chat_memory/points/search", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        vector: embedding,
        limit,
        with_payload: withMetadata,
        score_threshold: threshold
      })
    });
    
    if (!response.ok) {
      throw new Error(`Qdrant responded with status: ${response.status}`);
    }
    
    const data = await response.json();
    
    return data.result.map((hit: any) => ({
      id: hit.id,
      content: hit.payload.content,
      timestamp: hit.payload.timestamp,
      pinned: hit.payload.pinned || false,
      score: hit.score,
      tokenCount: encode(hit.payload.content).length
    }));
  } catch (error) {
    console.error("Error querying Qdrant:", error);
    return [];
  }
};

/**
 * Pins a memory item in Qdrant
 * 
 * @param id - The ID of the memory to pin
 * @returns Promise resolving to success status
 */
export const pinQdrant = async (id: string): Promise<boolean> => {
  try {
    const response = await fetch(`http://localhost:6333/collections/chat_memory/points/${id}/payload`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        payload: { pinned: true }
      })
    });
    
    if (!response.ok) {
      throw new Error(`Failed to pin memory: ${response.status}`);
    }
    
    console.log(`Memory ${id} pinned successfully`);
    return true;
  } catch (error) {
    console.error("Error pinning memory:", error);
    return false;
  }
};

/**
 * Unpins a memory item in Qdrant
 * 
 * @param id - The ID of the memory to unpin
 * @returns Promise resolving to success status
 */
export const unpinQdrant = async (id: string): Promise<boolean> => {
  try {
    const response = await fetch(`http://localhost:6333/collections/chat_memory/points/${id}/payload`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        payload: { pinned: false }
      })
    });
    
    if (!response.ok) {
      throw new Error(`Failed to unpin memory: ${response.status}`);
    }
    
    console.log(`Memory ${id} unpinned successfully`);
    return true;
  } catch (error) {
    console.error("Error unpinning memory:", error);
    return false;
  }
};

/**
 * Stores a new memory in Qdrant
 * 
 * @param content - The memory content
 * @param metadata - Additional metadata
 * @returns Promise resolving to the ID of the stored memory
 */
export const storeMemory = async (
  content: string, 
  metadata: Record<string, any> = {}
): Promise<string> => {
  try {
    const embedding = await getEmbeddings(content);
    const id = crypto.randomUUID();
    
    const response = await fetch("http://localhost:6333/collections/chat_memory/points", {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        points: [{
          id,
          vector: embedding,
          payload: {
            content,
            timestamp: Date.now(),
            tokenCount: encode(content).length,
            ...metadata
          }
        }]
      })
    });
    
    if (!response.ok) {
      throw new Error(`Failed to store memory: ${response.status}`);
    }
    
    return id;
  } catch (error) {
    console.error("Error storing memory:", error);
    throw error;
  }
};