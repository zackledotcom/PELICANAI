import React, { useState } from "react";

export const InputArea = ({ onSend }) => {
  const [input, setInput] = useState("");

  const handleKeyDown = (e) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      if (input.trim()) {
        onSend(input);
        setInput("");
      }
    }
  };

  return (
    <div className="input-wrapper" style={styles.wrapper}>
      <textarea
        value={input}
        onChange={(e) => setInput(e.target.value)}
        onKeyDown={handleKeyDown}
        placeholder="Ask something..."
        style={styles.textarea}
      />
      <button onClick={() => { if (input.trim()) { onSend(input); setInput(""); }}} style={styles.button}>
        Send
      </button>
    </div>
  );
};

const styles = {
  wrapper: {
    display: "flex",
    alignItems: "center",
    padding: "12px",
    borderTop: "1px solid #E5E5EA",
    background: "#F2F2F7",
  },
  textarea: {
    flex: 1,
    resize: "none",
    border: "none",
    outline: "none",
    padding: "12px",
    borderRadius: "12px",
    fontSize: "16px",
    background: "#FFFFFF",
    color: "#1C1C1E",
    boxShadow: "0 1px 2px rgba(0,0,0,0.06)",
    minHeight: "44px",
  },
  button: {
    marginLeft: "12px",
    padding: "12px 18px",
    borderRadius: "12px",
    border: "none",
    backgroundColor: "#007AFF",
    color: "white",
    fontWeight: "600",
    cursor: "pointer",
    transition: "all 0.2s ease",
  }
};
