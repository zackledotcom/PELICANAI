import React, { useCallback } from "react";

export const MemoryPanel = ({ pinned, messages, vectorMemory, mode, onPin }) => {
  const handlePinLastMessage = useCallback(() => {
    onPin(messages.length - 1);
  }, [messages, onPin]);

  return (
    <div className="memory-panel">
      <h3>Pinned Messages</h3>
      {pinned.length > 0 ? (
        pinned.map((index) => (
          <div key={index} className="memory-item" aria-label={`Pinned message ${index + 1}`}>
            <div className="content">{messages[index].content}</div>
          </div>
        ))
      ) : (
        <p>No pinned messages</p>
      )}

      <h3>Vector Memory</h3>
      <div className="vector-memory" aria-label="Vector memory section">
        {vectorMemory.map((vector, idx) => (
          <div key={idx} className="vector-item" aria-label={`Vector memory item ${idx + 1}`}>
            <div className="content">{vector}</div>
          </div>
        ))}
      </div>

      <h3>Mode: {mode}</h3>
      <button onClick={handlePinLastMessage} aria-label="Pin last message">Pin Last Message</button>
    </div>
  );
};