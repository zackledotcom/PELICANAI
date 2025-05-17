import React from "react";

export const MemoryPanel = ({ items }) => {
  return (
    <div className="memory-panel">
      {items.map((item, index) => (
        <div key={index} className="memory-item">
          <div className="content">{item.content}</div>
        </div>
      ))}
    </div>
  );
};