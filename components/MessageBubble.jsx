import React from "react";
import { motion } from "framer-motion";

const MessageBubble = ({ content }) => (
  <motion.div
    className="message-bubble"
    initial={{ opacity: 0, x: 30 }}
    animate={{ opacity: 1, x: 0 }}
    transition={{ duration: 0.3, ease: [0.4, 0, 0.2, 1] }}
    role="status"
    aria-live="polite"
  >
    <div className="bubble-inner">{content}</div>
  </motion.div>
);

export default MessageBubble;
