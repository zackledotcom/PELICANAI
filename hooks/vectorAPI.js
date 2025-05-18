import { encode } from "gpt-tokenizer";

// Cache for embeddings to avoid redundant API calls
const embeddingCache = new Map();

export const getEmbeddings = async (text) => {
  // Check cache first
  if (embeddingCache.has(text)) {
    return embeddingCache.get(text);
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

export const queryQdrant = async (text, options = {}) => {
  const { limit = 5, threshold = 0.7 } = options;
  
  try {
    const embedding = await getEmbeddings(text);
    
    const response = await fetch("http://localhost:6333/collections/chat_memory/points/search", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        vector: embedding,
        limit,
        with_payload: true,
        score_threshold: threshold
      })
    });
    
    if (!response.ok) {
      throw new Error(`Qdrant responded with status: ${response.status}`);
    }
    
    const data = await response.json();
    
    return data.result.map(hit => ({
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

export const pinQdrant = async (id) => {
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

export const unpinQdrant = async (id) => {
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