import { useState, useEffect, useRef } from 'react';

const MOMENTUM_DECAY = 0.95;
const THREAD_MERGE_THRESHOLD = 0.85;
const COGNITIVE_DEPTH_LEVELS = [
  'surface',
  'analytical',
  'synthetic',
  'transcendent',
  'emergent'
];

export const useCognitiveMomentum = (messages, emotionalState) => {
  const [threads, setThreads] = useState(new Map());
  const [momentum, setMomentum] = useState(0);
  const [depthLevel, setDepthLevel] = useState(COGNITIVE_DEPTH_LEVELS[0]);
  const timeoutRef = useRef(null);

  // Track conversation velocity and momentum
  const updateMomentum = (newMessage) => {
    const velocity = calculateMessageVelocity(newMessage);
    const intellectualDepth = analyzeIntellectualDepth(newMessage);
    const emotionalResonance = calculateEmotionalAlignment(newMessage, emotionalState);

    setMomentum(prev => {
      const newMomentum = prev * MOMENTUM_DECAY + velocity * intellectualDepth * emotionalResonance;
      return Math.min(Math.max(newMomentum, 0), 1);
    });
  };

  // Manage thought threads
  const createThread = (message) => {
    const threadId = generateThreadId();
    const concepts = extractCoreConcepts(message);
    
    setThreads(prev => {
      const newThreads = new Map(prev);
      newThreads.set(threadId, {
        concepts,
        messages: [message],
        momentum: 0,
        branchPoints: [],
        mergePoints: []
      });
      return newThreads;
    });
    
    return threadId;
  };

  // Thread merging based on conceptual resonance
  const attemptThreadMerge = () => {
    const threadArray = Array.from(threads.entries());
    for (let i = 0; i < threadArray.length; i++) {
      for (let j = i + 1; j < threadArray.length; j++) {
        const [id1, thread1] = threadArray[i];
        const [id2, thread2] = threadArray[j];
        
        const resonance = calculateThreadResonance(thread1, thread2);
        if (resonance > THREAD_MERGE_THRESHOLD) {
          mergeThreads(id1, id2);
        }
      }
    }
  };

  // Dynamic depth adjustment
  useEffect(() => {
    const depth = calculateCognitiveDepth(momentum, threads);
    const newLevel = COGNITIVE_DEPTH_LEVELS[Math.floor(depth * (COGNITIVE_DEPTH_LEVELS.length - 1))];
    setDepthLevel(newLevel);
  }, [momentum, threads]);

  // Momentum decay over time
  useEffect(() => {
    const decayMomentum = () => {
      setMomentum(prev => prev * MOMENTUM_DECAY);
    };

    clearTimeout(timeoutRef.current);
    timeoutRef.current = setTimeout(decayMomentum, 5000);

    return () => clearTimeout(timeoutRef.current);
  }, [momentum]);

  // Thread evolution
  const evolveThread = (threadId, newContent) => {
    setThreads(prev => {
      const thread = prev.get(threadId);
      if (!thread) return prev;

      const evolvedConcepts = evolveConcepts(thread.concepts, newContent);
      const newThreads = new Map(prev);
      newThreads.set(threadId, {
        ...thread,
        concepts: evolvedConcepts,
        messages: [...thread.messages, newContent]
      });
      
      return newThreads;
    });
  };

  return {
    momentum,
    depthLevel,
    threads,
    createThread,
    evolveThread,
    updateMomentum
  };
};

// Helper functions for cognitive analysis
const calculateMessageVelocity = (message) => {
  const wordCount = message.content.split(/\s+/).length;
  const complexity = analyzeTextComplexity(message.content);
  return Math.min(wordCount * complexity / 100, 1);
};

const analyzeIntellectualDepth = (message) => {
  const concepts = extractCoreConcepts(message);
  const relationships = findConceptualRelationships(concepts);
  return Math.min(concepts.length * relationships.length / 25, 1);
};

const calculateEmotionalAlignment = (message, emotionalState) => {
  const messageEmotion = analyzeEmotionalContent(message);
  return calculateEmotionalResonance(messageEmotion, emotionalState);
};

const analyzeTextComplexity = (text) => {
  // Analyze sentence structure, vocabulary, logical connections
  const sentences = text.split(/[.!?]+/);
  const avgLength = sentences.reduce((sum, s) => sum + s.length, 0) / sentences.length;
  const uniqueWords = new Set(text.toLowerCase().split(/\s+/)).size;
  
  return Math.min((avgLength * uniqueWords) / 1000, 1);
};

const extractCoreConcepts = (message) => {
  // Extract key concepts and their relationships
  const words = message.content.toLowerCase().split(/\s+/);
  const concepts = new Set();
  
  for (let i = 0; i < words.length - 1; i++) {
    if (isSignificantWord(words[i])) {
      concepts.add(words[i]);
      if (isSignificantWord(words[i + 1])) {
        concepts.add(`${words[i]} ${words[i + 1]}`);
      }
    }
  }
  
  return Array.from(concepts);
};

const findConceptualRelationships = (concepts) => {
  const relationships = [];
  for (let i = 0; i < concepts.length; i++) {
    for (let j = i + 1; j < concepts.length; j++) {
      if (areConceptsRelated(concepts[i], concepts[j])) {
        relationships.push([concepts[i], concepts[j]]);
      }
    }
  }
  return relationships;
};

const isSignificantWord = (word) => {
  // Filter out common stop words and require minimum length
  const stopWords = new Set(['the', 'and', 'or', 'but', 'in', 'on', 'at', 'to']);
  return !stopWords.has(word) && word.length > 3;
};

const areConceptsRelated = (concept1, concept2) => {
  // Check for semantic or contextual relationships
  const words1 = concept1.split(/\s+/);
  const words2 = concept2.split(/\s+/);
  return words1.some(w1 => words2.includes(w1)) || 
         calculateConceptSimilarity(concept1, concept2) > 0.7;
};

const calculateConceptSimilarity = (concept1, concept2) => {
  // Implement semantic similarity calculation
  const sharedChars = concept1.split('').filter(c => concept2.includes(c)).length;
  return sharedChars / Math.max(concept1.length, concept2.length);
};