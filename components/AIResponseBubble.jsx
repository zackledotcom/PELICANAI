import React from "react";
import { motion } from "framer-motion";

export const AIResponseBubble = ({ content }) => {
  return (
    <motion.div
      className="ai-bubble"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, ease: [0.25, 1, 0.5, 1] }}
      role="alert"
      aria-live="polite"
    >
      <div className="bubble-inner">{content}</div>
    </motion.div>
  );
};
