import React from "react";
import { motion } from "framer-motion";

export const UserPromptBubble = ({ content }) => {
  return (
    <motion.div
      className="user-bubble"
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ duration: 0.3, ease: "easeOut" }}
    >
      <div className="bubble-inner">{content}</div>
    </motion.div>
  );
};
