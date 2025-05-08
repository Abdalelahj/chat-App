import React, {  useMemo, useState } from "react";
import { useGetUsersQuery } from "../Redux/Features/api/apiSlice";
import { setSelected } from "../Redux/Features/authSlice";
import { useDispatch, useSelector } from "react-redux";
import {
  clearUnreadCount,
  setActiveConversation,
} from "../Redux/Features/chat/Chat-Slice";
import "../styles/user-list.css";

function UserList() {
  const { data: users = [], isLoading, isError } = useGetUsersQuery();
  const currentUserId = JSON.parse(localStorage.getItem("userId"));
  const dispatch = useDispatch();
  const selectedUserId = useSelector((state) => state.auth.selectedUser);
  const conversations = useSelector((state) => state.chat.conversations);
  const unreadCounts = useSelector((state) => state.chat.unreadCounts);
  const [searchTerm, setSearchTerm] = useState("");


  const userConversations = useMemo(() => {
    return conversations.reduce((acc, conv) => {
      const otherUserId = conv.participants.find((id) => id !== currentUserId);
      if (otherUserId) {
        acc[otherUserId] = {
          ...conv,
          unreadCount: unreadCounts[conv._id] || 0,
        };
      }
      return acc;
    }, {});
  }, [conversations, unreadCounts, currentUserId]);

  const loggedInUser = users.find((user) => user._id === currentUserId);

  const filteredUsers = useMemo(() => {
    return users
      .filter((user) => currentUserId !== user._id)
      .filter((user) =>
        user.username.toLowerCase().includes(searchTerm.toLowerCase())
      );
  }, [users, currentUserId, searchTerm]);

  const sortedUsers = useMemo(() => {
    return [...filteredUsers].sort((a, b) => {
      const convA = userConversations[a._id];
      const convB = userConversations[b._id];

      if (!convA && !convB) return 0;
      if (!convA) return 1;
      if (!convB) return -1;

      return (
        new Date(convB.lastMessageAt || 0) - new Date(convA.lastMessageAt || 0)
      );
    });
  }, [filteredUsers, userConversations]);

  const getUserLastMessage = (userId) => {
    const conv = userConversations[userId];
    return conv?.lastMessage
      ? {
          content: conv.lastMessage.content,
          timestamp: conv.lastMessageAt,
          senderId: conv.lastMessage.sender,
        }
      : null;
  };

  const getUnreadCount = (userId) => {
    return userConversations[userId]?.unreadCount || 0;
  };

  const handleUserSelect = (userId) => {
    dispatch(setActiveConversation(null));
    dispatch(setSelected(userId));
    const conv = userConversations[userId];
    if (conv && conv.unreadCount > 0) {
      dispatch(clearUnreadCount(conv._id));
    }
  };

  const formatTime = (timestamp) => {
    if (!timestamp) return "";

    const date = new Date(timestamp);
    const now = new Date();
    const diffDays = Math.floor((now - date) / (1000 * 60 * 60 * 24));

    if (diffDays === 0) {
      return date.toLocaleTimeString([], {
        hour: "2-digit",
        minute: "2-digit",
      });
    } else if (diffDays === 1) {
      return "Yesterday";
    } else if (diffDays < 7) {
      return date.toLocaleDateString([], { weekday: "short" });
    } else {
      return date.toLocaleDateString([], { month: "short", day: "numeric" });
    }
  };

  const truncateMessage = (message, maxLength = 30) => {
    if (!message) return "";
    return message.length > maxLength
      ? `${message.substring(0, maxLength)}...`
      : message;
  };

  if (isLoading) {
    return (
      <div className="user-list-loading">
        <div className="loading">Loading users...</div>
      </div>
    );
  }

  return (
    <div className="user-list-container">
      <div className="user-list-header">
        <h3>Welcome {loggedInUser?.username || "User"}</h3>
        <h5>Messages</h5>
        <div className="search-container">
          <input
            type="text"
            placeholder="Search users..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
          {searchTerm && <button onClick={() => setSearchTerm("")}>✕</button>}
        </div>
      </div>

      {isError ? (
        <div className="error-message">Error loading users</div>
      ) : sortedUsers.length > 0 ? (
        <ul className="user-list">
          {sortedUsers.map((user) => {
            const lastMessage = getUserLastMessage(user._id);
            const unreadCount = getUnreadCount(user._id);
            const isSelected = selectedUserId === user._id;
            const isCurrentUserLastSender =
              lastMessage?.senderId === currentUserId;

            return (
              <li
                key={user._id}
                onClick={() => handleUserSelect(user._id)}
                className={`user-item ${isSelected ? "selected" : ""}`}
              >
                <div className="user-item-header">
                  <span
                    className={`username ${unreadCount > 0 ? "unread" : ""}`}
                  >
                    {user.username}
                  </span>
                  {lastMessage && (
                    <span className="message-time">
                      {formatTime(lastMessage.timestamp)}
                    </span>
                  )}
                </div>

                {lastMessage ? (
                  <div className="message-preview">
                    <span className="message-content">
                      {isCurrentUserLastSender && (
                        <span className="you-indicator">You: </span>
                      )}
                      {truncateMessage(lastMessage.content)}
                    </span>
                    {unreadCount > 0 && !isSelected && (
                      <span className="unread-badge">{unreadCount}</span>
                    )}
                  </div>
                ) : (
                  <div className="no-messages">No messages yet</div>
                )}
              </li>
            );
          })}
        </ul>
      ) : (
        <div className="empty-state">
          {searchTerm ? (
            <>
              <div>No users match your search</div>
              <button onClick={() => setSearchTerm("")}>Clear search</button>
            </>
          ) : (
            <div>No other users available</div>
          )}
        </div>
      )}
    </div>
  );
}

export default UserList;
