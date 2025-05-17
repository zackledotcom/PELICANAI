import React from "react";
import { motion } from "framer-motion";
import "../styles/modeSwitch.css";

const modes = [
  { id: "lean", label: "Lean", description: "Fast & minimal" },
  { id: "omega", label: "Omega", description: "Full recall & depth" },
  { id: "investigate", label: "Investigate", description: "Trace & track logic" },
];

export const ModeSwitch = ({ mode, setMode }) => {
  return (
    <div className="mode-switch">
      {modes.map((m) => (
        <motion.button
          key={m.id}
          onClick={() => setMode(m.id)}
          className={`mode-button ${mode === m.id ? "active" : ""}`}
          whileTap={{ scale: 0.96 }}
          whileHover={{ scale: 1.03 }}
          aria-pressed={mode === m.id}
        >
          <div className="label">{m.label}</div>
          <div className="desc">{m.description}</div>
        </motion.button>
      ))}
    </div>
  );
};
