import React, { useState } from "react";

const InputBar = ({ onSend }) => {
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
        aria-label="Chat input"
      />
    </div>
  );
};

export default InputBar;