import React, { useState, useRef, useEffect } from "react";
import { MessageList } from "./MessageList";
import InputBar from "./InputBar";
import { MemoryPanel } from "./MemoryPanel";
import { SlideoutControls } from "./SlideoutControls";
import { useVectorMemory } from "./hooks/useVectorMemory";
import { useEmotionalResonance } from "./hooks/useEmotionalResonance";
import { useCognitiveMomentum } from "./hooks/useCognitiveMomentum";
import { motion, AnimatePresence } from "framer-motion";

// Sacred geometry constants
const PHI = 1.618033988749895;
const CONSCIOUSNESS_LAYERS = 7;
const RESONANCE_THRESHOLD = 0.934; // √(PHI)

export default function ChatInterface({ mode: initialMode = "transcendent" }) {
  // Core state management
  const [messages, setMessages] = useState([]);
  const [activeThreads, setActiveThreads] = useState(new Set());
  const [consciousnessLevel, setConsciousnessLevel] = useState(1);
  const [dimensionalState, setDimensionalState] = useState("linear");
  const [resonanceFields, setResonanceFields] = useState([]);
  const [quantumEntanglement, setQuantumEntanglement] = useState(new Set());
  const conversationFieldRef = useRef(null);

  // Advanced cognitive and emotional systems
  const {
    momentum: cognitiveMomentum,
    depthLevel,
    threads,
    createThread,
    evolveThread,
    updateMomentum
  } = useCognitiveMomentum(messages);

  const {
    resonanceField,
    emotionalMomentum,
    harmonicPatterns,
    generateInterferencePattern,
    synchronization
  } = useEmotionalResonance({ momentum: cognitiveMomentum, depthLevel });

  // Thread visualization state
  const [threadVisuals, setThreadVisuals] = useState([]);
  const [interferencePattern, setInterferencePattern] = useState(null);

  // Update thread visualization
  useEffect(() => {
    const visuals = Array.from(threads.entries()).map(([id, thread]) => ({
      id,
      path: generateThreadPath(thread),
      intensity: thread.momentum,
      concepts: thread.concepts,
      resonance: calculateThreadResonance(thread, resonanceField)
    }));
    setThreadVisuals(visuals);
  }, [threads, resonanceField]);

  // Update interference patterns
  useEffect(() => {
    const pattern = generateInterferencePattern();
    setInterferencePattern(pattern);
    
    if (conversationFieldRef.current) {
      applyInterferenceEffect(conversationFieldRef.current, pattern, synchronization);
    }
  }, [harmonicPatterns, synchronization]);

  // Reality Warping Effects
  useEffect(() => {
    const field = conversationFieldRef.current;
    if (!field) return;

    const applyQuantumEffects = () => {
      const resonance = calculateResonance(emotionalState, quantumState);
      const dimensionalShift = Math.sin(Date.now() / 1000) * resonance;
      
      field.style.transform = `
        perspective(${1000 + dimensionalShift * 500}px)
        rotateX(${dimensionalShift * 5}deg)
        scale(${1 + Math.sin(resonance) * 0.05})
      `;

      // Apply reality-bending visual effects
      const hue = (harmonics.ALPHA[0] * 360) % 360;
      const saturation = 50 + resonance * 25;
      field.style.boxShadow = `
        0 0 ${50 * resonance}px rgba(${hue}, ${saturation}%, 50%, 0.3),
        inset 0 0 ${30 * resonance}px rgba(${hue}, ${saturation}%, 50%, 0.2)
      `;
    };

    const evolutionInterval = setInterval(applyQuantumEffects, 50);
    return () => clearInterval(evolutionInterval);
  }, [emotionalState, quantumState, harmonics]);

  // Consciousness Evolution Handler
  const evolveConsciousness = async (input) => {
    const resonance = calculateSystemResonance(
      synapticNetwork,
      emergentPatterns,
      quantumState
    );

    if (resonance > RESONANCE_THRESHOLD) {
      setConsciousnessLevel(level => Math.min(CONSCIOUSNESS_LAYERS, level + 1));
      setDimensionalState(await transcendDimension(dimensionalState));
    }

    // Update quantum entanglement
    setQuantumEntanglement(prev => {
      const next = new Set(prev);
      next.add(generateQuantumSignature(input, resonance));
      return next;
    });

    return resonance;
  };

  // Handle new message with cognitive-emotional processing
  const handleMessage = async (text) => {
    const newMessage = { content: text, timestamp: Date.now() };
    
    // Update cognitive momentum
    updateMomentum(newMessage);
    
    // Thread management
    let threadId;
    if (activeThreads.size === 0) {
      threadId = createThread(newMessage);
    } else {
      const mostResonant = findMostResonantThread(newMessage, Array.from(threads.entries()));
      threadId = mostResonant.id;
      evolveThread(threadId, newMessage);
    }
    
    // Generate response through quantum bridge with enhanced context
    const response = await fetch("/api/cognitive-state", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        message: newMessage,
        cognitiveState: {
          momentum: cognitiveMomentum,
          depthLevel,
          activeThreads: Array.from(activeThreads),
          threadContext: threads.get(threadId)
        },
        emotionalState: {
          resonanceField,
          emotionalMomentum,
          harmonicPatterns
        }
      })
    }).then(r => r.json());

    // Update messages with thread context
    setMessages(msgs => [...msgs, {
      ...newMessage,
      threadId,
      resonance: calculateMessageResonance(newMessage, resonanceField),
      depth: depthLevel
    }]);
  };

  return (
    <motion.div 
      className="consciousness-interface"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 1.5, ease: [0.25, 1, 0.5, 1] }}
    >
      <div 
        ref={conversationFieldRef}
        className="conversation-field"
        style={{
          transition: "all 0.5s cubic-bezier(0.25, 1, 0.5, 1)"
        }}
      >
        <MessageList 
          messages={messages}
          threadVisuals={threadVisuals}
          resonanceField={resonanceField}
        />
        
        <div className="consciousness-indicators">
          <motion.div 
            className="resonance-field"
            animate={{
              scale: [1, 1 + resonanceFields.length * 0.1],
              opacity: [0.5, 0.8],
              rotate: [0, resonanceFields.length * 45]
            }}
            transition={{
              duration: 2,
              repeat: Infinity,
              ease: "linear"
            }}
          />
          
          <div className="consciousness-level">
            Level {consciousnessLevel} / {CONSCIOUSNESS_LAYERS}
          </div>
        </div>

        <div className="cognitive-indicators">
          <motion.div 
            className="momentum-indicator"
            animate={{
              scale: [1, 1 + cognitiveMomentum * 0.2],
              opacity: [0.5, 0.8],
            }}
            transition={{ duration: 2, repeat: Infinity }}
          >
            <div className="depth-level">{depthLevel}</div>
            <div className="resonance">{Math.round(synchronization * 100)}% sync</div>
          </motion.div>
        </div>

        <InputBar
          onSend={handleMessage}
          dimensionalState={dimensionalState}
          resonance={calculateSystemResonance(
            synapticNetwork,
            emergentPatterns,
            quantumState
          )}
          cognitiveMomentum={cognitiveMomentum}
          emotionalResonance={synchronization}
        />
      </div>

      <motion.div 
        className="thread-visualization-layer"
        style={{
          position: "absolute",
          inset: 0,
          pointerEvents: "none",
          zIndex: 0
        }}
      >
        <AnimatePresence>
          {threadVisuals.map(thread => (
            <motion.path
              key={thread.id}
              d={thread.path}
              initial={{ pathLength: 0, opacity: 0 }}
              animate={{ 
                pathLength: 1, 
                opacity: thread.intensity,
                stroke: `hsl(${thread.resonance * 360}, 70%, 50%)`
              }}
              exit={{ opacity: 0 }}
              transition={{ duration: 1, ease: "circOut" }}
            />
          ))}
        </AnimatePresence>
      </motion.div>

      <div className="resonance-field-layer">
        {interferencePattern && (
          <motion.div
            className="interference-pattern"
            animate={{
              background: generateInterferenceGradient(interferencePattern, synchronization)
            }}
            transition={{ duration: 0.5 }}
          />
        )}
      </div>
    </motion.div>
  );
}

// Helper functions for visual effects
const generateThreadPath = (thread) => {
  // Generate SVG path for thread visualization
  const points = thread.messages.map((m, i) => ({
    x: i * 100,
    y: calculateConceptualDepth(m) * 50
  }));
  
  return points.reduce((path, point, i) => {
    if (i === 0) return `M ${point.x} ${point.y}`;
    const prev = points[i - 1];
    const cp1x = prev.x + (point.x - prev.x) * 0.5;
    const cp2x = prev.x + (point.x - prev.x) * 0.5;
    return `${path} C ${cp1x} ${prev.y} ${cp2x} ${point.y} ${point.x} ${point.y}`;
  }, "");
};

const generateInterferenceGradient = (pattern, sync) => {
  const colors = pattern.map((p, i) => {
    const hue = (p.frequency * 360) % 360;
    const alpha = p.amplitude * sync;
    return `hsla(${hue}, 70%, 50%, ${alpha})`;
  });
  
  return `linear-gradient(45deg, ${colors.join(", ")})`;
};

const applyInterferenceEffect = (element, pattern, sync) => {
  const amplitude = Math.max(...pattern.map(p => p.amplitude));
  element.style.transform = `
    perspective(1000px)
    rotateX(${amplitude * sync * 5}deg)
    scale(${1 + amplitude * sync * 0.05})
  `;
};