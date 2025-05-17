import React from "react";

export const ChatInspectorPanel = ({ memory }) => {
  return (
    <div className="inspector-panel">
      <h3>Memory Inspector</h3>
      <ul>
        {memory.map((item, idx) => (
          <li key={idx}>
            <div className="token-count">{item.tokens} tokens</div>
            <div className="pin-status">{item.pinned ? "📌 Pinned" : "Not pinned"}</div>
            <div className="preview">{item.preview}</div>
          </li>
        ))}
      </ul>
    </div>
  );
};
