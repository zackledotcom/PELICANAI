import React from "react";

export const ChatInspectorPanel = ({ memory }) => {
  return (
    <div className="inspector-panel" aria-label="Memory Inspector Panel">
      <h3>Memory Inspector</h3>
      <ul>
        {memory.map((item, idx) => (
          <li key={idx} aria-label={`Memory item ${idx + 1}`}>
            <div className="token-count" aria-label={`Token count: ${item.tokens}`}>{item.tokens} tokens</div>
            <div className="pin-status" aria-label={`Pin status: ${item.pinned ? "Pinned" : "Not pinned"}`}>
              {item.pinned ? "📌 Pinned" : "Not pinned"}
            </div>
            <div className="preview" aria-label={`Preview: ${item.preview}`}>{item.preview}</div>
          </li>
        ))}
      </ul>
    </div>
  );
};
