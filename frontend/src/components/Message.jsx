import React from "react";

const Message = ({ message, isOwn }) => {

  const formatTime = (timestamp) => {
    if (!timestamp) return "";
    const date = new Date(timestamp);
    return date.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
  };

  const getMessageContent = () => {
    return message.content;
  };

  const getStatusIcon = () => {
    if (!isOwn) return null;

    switch (message.status) {
      case "sent":
        return (
          <span className="message-status" title="Sent">
            <svg
              width="12"
              height="12"
              viewBox="0 0 24 24"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                d="M5 13L9 17L19 7"
                stroke="#888888"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
          </span>
        );
      case "delivered":
        return (
          <span className="message-status" title="Delivered">
            <svg
              width="12"
              height="12"
              viewBox="0 0 24 24"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                d="M7 12L12 17L22 7M2 12L7 17M12 12L17 7"
                stroke="#888888"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
          </span>
        );
      case "read":
        return (
          <span className="message-status" title="Read">
            <svg
              width="12"
              height="12"
              viewBox="0 0 24 24"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                d="M7 12L12 17L22 7M2 12L7 17M12 12L17 7"
                stroke="#2196F3"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
          </span>
        );
      default:
        return null;
    }
  };

  const renderReactions = () => {
    if (!message.reactions || message.reactions.length === 0) return null;

    return (
      <div className="message-reactions">
        {message.reactions.map((reaction, idx) => (
          <span key={idx} className="reaction">
            {reaction.emoji}
          </span>
        ))}
      </div>
    );
  };

  return (
    <div
      style={{
        textAlign: isOwn ? "right" : "left",
        margin: "8px 0",
        padding: "0 16px",
      }}
    >
      <div
        style={{
          display: "inline-flex",
          flexDirection: "column",
          alignItems: isOwn ? "flex-end" : "flex-start",
          maxWidth: "80%",
        }}
      >
        <div
          style={{
            display: "inline-block",
            padding: "10px 14px",
            backgroundColor: isOwn ? "#DCF8C6" : "#EAEAEA",
            borderRadius: isOwn ? "18px 18px 0 18px" : "18px 18px 18px 0",
            boxShadow: "0 1px 1px rgba(0,0,0,0.1)",
            wordBreak: "break-word",
          }}
        >
          <p style={{ margin: 0 }}>{getMessageContent()}</p>
          {renderReactions()}
          
        </div>
        <div
          style={{
            display: "flex",
            alignItems: "center",
            fontSize: "0.75rem",
            color: "#888",
            marginTop: "4px",
            marginLeft: isOwn ? "0" : "8px",
            marginRight: isOwn ? "8px" : "0",
          }}
        >
          {message.timestamp && (
            <span style={{ marginRight: "4px" }}>
              {formatTime(message.timestamp)}
            </span>
          )}
          {getStatusIcon()}
        </div>
      </div>
    </div>
  );
};

export default Message;
