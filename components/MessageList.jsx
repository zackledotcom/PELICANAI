import React from "react";
import MessageBubble from "./MessageBubble";

export const MessageList = ({ messages, loading, error }) => {
  if (loading) {
    return <div className="loading">Loading messages...</div>;
  }

  if (error) {
    return <div className="error">Error loading messages: {error}</div>;
  }

  return (
    <div className="message-list">
      {messages.map((message, index) => (
        <MessageBubble key={index} message={message} />
      ))}
    </div>
  );
};

export default MessageList;