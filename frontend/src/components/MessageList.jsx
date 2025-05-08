import React, { useEffect, useMemo, useRef } from 'react';
import Message from './Message';
import { useSelector } from 'react-redux';
import "../styles/messageList.css"
const MessageList = ({ conversationId, typingIndicator, socket }) => {

  const senderId = JSON.parse(localStorage.getItem("userId"));
  const selectedUserId = useSelector((state) => state.auth.selectedUser);

  const messages = useSelector((state) =>
    conversationId ? state.chat.messages[conversationId] || [] : []
  );

  const scrollToLastRef = useRef(null);

  // Sort messages by timestamp
  const sortedMessages = useMemo(() => {
    const uniqueMessages = messages

    // Sort by timestamp
    return [...uniqueMessages].sort((a, b) =>
      new Date(a.timestamp) - new Date(b.timestamp)
    );

  }, [messages]);



  useEffect(() => {
    if (scrollToLastRef.current) {
      scrollToLastRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [sortedMessages, typingIndicator]);

  useEffect(() => {
    if (!socket || !conversationId || conversationId === 'pending') return;

    const unreadMessages = sortedMessages.filter(
      msg => msg.sender !== senderId && msg.status !== 'read'
    );

    if (unreadMessages.length > 0) {
      unreadMessages.forEach(msg => {
        socket.emit('messageStatus', {
          messageId: msg._id,
          status: 'read',
          userId: senderId,
          conversationId
        });
      });
    }
  }, [sortedMessages, socket, conversationId, senderId]);

  if (!selectedUserId) {
    return (
      <div className="empty-state">
        <p>Please select a user to start chatting</p>
      </div>
    );
  }

  if (!conversationId) {
    return (
      <div className="loading-state">
        <div className="spinner"></div>
        <p>Loading conversation...</p>
      </div>
    );
  }

  return (
    <div className="messages-container">
      {sortedMessages.length > 0 ? (
        <>
          {sortedMessages.map((message, index) => (
            <div
              key={message._id || `temp-${index}`}
              ref={index === sortedMessages.length - 1 ? scrollToLastRef : null}
            >
              <Message
                message={message}
                isOwn={message.sender === senderId}
              />
            </div>
          ))}

          {typingIndicator && (
            <div className="typing-indicator-bubble" ref={scrollToLastRef}>
              <div className="typing-dots">
                <div className="dot pulse"></div>
                <div className="dot pulse"></div>
                <div className="dot pulse"></div>
              </div>
              <span className="typing-text">typing</span>
            </div>
          )}
        </>
      ) : (
        <div className="empty-state">
          <p>No messages yet. Start the conversation!</p>
        </div>
      )}
    </div>
  );
};

export default MessageList;