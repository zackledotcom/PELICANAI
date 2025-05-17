import React, { useState } from "react";

export const ChatInputBar = ({ onSend }) => {
  const [input, setInput] = useState("");

  const handleKeyPress = (e) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      if (input.trim()) {
        onSend(input);
        setInput("");
      }
    }
  };

  return (
    <div className="chat-input-bar">
      <textarea
        className="chat-textarea"
        value={input}
        placeholder="Type your message..."
        onChange={(e) => setInput(e.target.value)}
        onKeyDown={handleKeyPress}
        rows={1}
      />
    </div>
  );
};