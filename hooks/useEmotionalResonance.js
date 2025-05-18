import { useState, useEffect, useRef } from 'react';
import { useEmotionAwareTheme } from './useEmotionAwareTheme';

const PHI = 1.618033988749895;
const RESONANCE_FREQUENCIES = {
  joy: [1, 1, 2, 3, 5, 8], // Fibonacci
  insight: [PHI, PHI * PHI, PHI * PHI * PHI], // Golden ratio progression
  flow: [0.382, 0.618, 1, 1.618], // Golden ratio harmonics
  depth: [1, 2.236, 3.302, 4.236] // Square roots of first 4 Fibonacci numbers
};

export const useEmotionalResonance = (cognitiveState) => {
  const [resonanceField, setResonanceField] = useState({
    primary: 0,
    harmonics: [],
    patterns: [],
    synchronization: 0
  });
  const [emotionalMomentum, setEmotionalMomentum] = useState(0);
  const [harmonicPatterns, setHarmonicPatterns] = useState([]);
  const resonanceHistory = useRef([]);
  const { emotionalState } = useEmotionAwareTheme();

  // Synchronize emotional and cognitive states
  const synchronizeStates = () => {
    const cognitiveFreq = calculateCognitiveFrequency(cognitiveState);
    const emotionalFreq = calculateEmotionalFrequency(emotionalState);
    const sync = calculateResonanceSynchronization(cognitiveFreq, emotionalFreq);
    
    return {
      frequency: (cognitiveFreq + emotionalFreq) / 2,
      synchronization: sync,
      amplitude: Math.sqrt(cognitiveState.momentum * emotionalState.intensity)
    };
  };

  // Generate harmonic patterns based on emotional-cognitive resonance
  const generateHarmonicPatterns = () => {
    const baseFreq = resonanceField.primary;
    const patterns = Object.entries(RESONANCE_FREQUENCIES).map(([type, harmonics]) => ({
      type,
      frequencies: harmonics.map(h => h * baseFreq),
      amplitude: calculateHarmonicAmplitude(type, emotionalState)
    }));

    return patterns.filter(p => p.amplitude > 0.2);
  };

  // Update resonance field based on new states
  useEffect(() => {
    const sync = synchronizeStates();
    const patterns = generateHarmonicPatterns();
    
    setResonanceField(prev => ({
      primary: sync.frequency,
      harmonics: patterns.flatMap(p => p.frequencies),
      patterns: patterns,
      synchronization: sync.synchronization
    }));

    resonanceHistory.current.push({
      timestamp: Date.now(),
      sync,
      patterns: patterns.length
    });

    // Keep only last 100 readings
    if (resonanceHistory.current.length > 100) {
      resonanceHistory.current.shift();
    }
  }, [cognitiveState, emotionalState]);

  // Calculate emotional momentum
  useEffect(() => {
    const history = resonanceHistory.current;
    if (history.length < 2) return;

    const recentSync = history.slice(-10);
    const syncTrend = calculateSyncTrend(recentSync);
    const patternStability = calculatePatternStability(recentSync);

    setEmotionalMomentum(syncTrend * patternStability);
  }, [resonanceField]);

  // Generate harmonic interference patterns
  const generateInterferencePattern = () => {
    return resonanceField.harmonics.map((freq, i) => ({
      frequency: freq,
      phase: (i * Math.PI) / resonanceField.harmonics.length,
      amplitude: Math.pow(PHI, -i)
    }));
  };

  return {
    resonanceField,
    emotionalMomentum,
    harmonicPatterns,
    generateInterferencePattern,
    synchronization: resonanceField.synchronization
  };
};

// Helper functions for resonance calculations
const calculateCognitiveFrequency = (cogState) => {
  const depthFactor = COGNITIVE_DEPTH_FACTORS[cogState.depthLevel] || 1;
  return cogState.momentum * depthFactor * PHI;
};

const calculateEmotionalFrequency = (emoState) => {
  const baseFreq = RESONANCE_FREQUENCIES[emoState.dominant]?.[0] || 1;
  return baseFreq * (1 + emoState.intensity);
};

const calculateResonanceSynchronization = (freq1, freq2) => {
  const ratio = freq1 / freq2;
  const nearestHarmonic = Math.round(ratio);
  return 1 - Math.abs(ratio - nearestHarmonic);
};

const calculateHarmonicAmplitude = (type, emotionalState) => {
  const baseAmplitude = emotionalState.intensity;
  const harmonicFactor = type === emotionalState.dominant ? PHI : 1;
  return baseAmplitude * harmonicFactor;
};

const calculateSyncTrend = (history) => {
  const syncValues = history.map(h => h.sync.synchronization);
  const trend = syncValues.reduce((acc, val, i) => 
    acc + val * Math.pow(PHI, -i), 0);
  return trend / history.length;
};

const calculatePatternStability = (history) => {
  const patternCounts = history.map(h => h.patterns);
  const variance = calculateVariance(patternCounts);
  return 1 / (1 + variance);
};

const calculateVariance = (numbers) => {
  const mean = numbers.reduce((a, b) => a + b) / numbers.length;
  const squareDiffs = numbers.map(n => Math.pow(n - mean, 2));
  return squareDiffs.reduce((a, b) => a + b) / numbers.length;
};

const COGNITIVE_DEPTH_FACTORS = {
  surface: 1,
  analytical: PHI,
  synthetic: PHI * PHI,
  transcendent: PHI * PHI * PHI,
  emergent: PHI * PHI * PHI * PHI
};