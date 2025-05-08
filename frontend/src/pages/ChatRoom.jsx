import React, { useEffect, useRef, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import {
  setActiveConversation,
  addMessage,
  setMessages,
  updateMessageStatus,
  setTypingStatus,
  addConversation,
  updateUnreadCount,
  updateConversation,
  clearMessages,
  clearChatData,
} from "../Redux/Features/chat/Chat-Slice";
import MessageList from "../components/MessageList";
import InputField from "../components/InputField";
import UserList from "../components/UserList";
import { useGetMsgsQuery } from "../Redux/Features/api/MsgsSlice";
import { logout } from "../Redux/Features/authSlice";
import { useGetUsersQuery } from "../Redux/Features/api/apiSlice";
import "../styles/ChatRoom.css";

function ChatRoom({ socket }) {
  const userId = JSON.parse(localStorage.getItem("userId"));
  const selectedUser = useSelector((state) => state.auth.selectedUser);
  const activeConversation = useSelector(
    (state) => state.chat.activeConversation
  );
  const { data: users = [] } = useGetUsersQuery();

  const dispatch = useDispatch();
  const [pendingMessages, setPendingMessages] = useState([]);
  const [joinedConversations, setJoinedConversations] = useState(new Set());
  const previousSelectedUser = useRef(null);

  // Get messages for current conversation
  const {
    data: conversationData,
    isLoading: isMessagesLoading,
    refetch,
  } = useGetMsgsQuery(
    { senderId: userId, receiverId: selectedUser },
    { skip: !selectedUser }
  );

  // Track socket connection status
  useEffect(() => {
    if (!socket) return;

    const handleConnect = () => {
      console.log("Socket connected");
      // Re-join user conversations when reconnected
      if (userId) {
        socket.emit("joinUserConversations", { userId });
      }

      // Re-join active conversation if there is one
      if (activeConversation) {
        socket.emit("joinExistingConversation", {
          conversationId: activeConversation,
          userId,
        });
      }
    };

    const handleDisconnect = () => {
      console.log("Socket disconnected");
    };

    socket.on("connect", handleConnect);
    socket.on("disconnect", handleDisconnect);

    return () => {
      socket.off("connect", handleConnect);
      socket.off("disconnect", handleDisconnect);
    };
  }, [socket, userId, activeConversation]);

  useEffect(() => {
    if (previousSelectedUser.current === selectedUser) {
      return;
    }

    // Clean up previous conversation data
    if (previousSelectedUser.current) {
      setPendingMessages([]);
      dispatch(setActiveConversation(null));
      dispatch(clearMessages());
    }

    previousSelectedUser.current = selectedUser;
    refetch();
  }, [selectedUser, dispatch, refetch]);

  // Handle conversation data from API
  useEffect(() => {
    if (!conversationData) {
      return;
    }


    if (conversationData.conversationId) {
      const conversationId = conversationData.conversationId;

      // Join conversation if not already joined
      if (!joinedConversations.has(conversationId) && socket?.connected) {
        socket.emit("joinExistingConversation", {
          conversationId,
          userId,
        });
        setJoinedConversations((prev) => new Set([...prev, conversationId]));
      }

      // Set active conversation and messages
      dispatch(setActiveConversation(conversationId));
      dispatch(
        setMessages({
          conversationId: conversationId,
          messages: conversationData.messages || [],
        })
      );

      // Update conversation
      if (conversationData.messages?.length > 0) {
        const lastMessage =
          conversationData.messages[conversationData.messages.length - 1];
        dispatch(
          updateConversation({
            conversationId,
            updates: {
              lastMessage: {
                content: lastMessage.content,
                sender: lastMessage.sender,
              },
              lastMessageAt: lastMessage.timestamp,
            },
          })
        );

        // Mark messages as read
        const unreadMessages = conversationData.messages.filter(
          (msg) => msg.sender !== userId && msg.status !== "read"
        );

        if (unreadMessages.length > 0) {
          unreadMessages.forEach((msg) => {
            socket.emit("messageStatus", {
              messageId: msg._id,
              status: "read",
              userId,
            });
          });

          // when open chat update unread count
          dispatch(
            updateUnreadCount({
              conversationId,
              increment: false,
            })
          );
        }
      }
    } else {
      dispatch(setActiveConversation(null));
      dispatch(setMessages({ conversationId: "pending", messages: [] }));
      return;
    }
  }, [
    conversationData,
    selectedUser,
    dispatch,
    socket,
    joinedConversations,
    userId,
  ]);

  //socket
  useEffect(() => {
    if (!socket) return;

    // Initialize user conversations
    const initializeUserConversations = () => {
      if (socket && userId) {
        socket.emit("joinUserConversations", { userId });
      }
    };

    if (socket.connected) {
      initializeUserConversations();
    }

    // listen on joinUserConversations emitted
    const handleUserConversationJoined = ({ conversations }) => {
      setJoinedConversations(
        new Set(conversations.map((conv) => conv.conversationId))
      );

      // Add conversations to redux
      conversations.forEach((conv) => {
        if (conv.conversationId) {
          dispatch(
            addConversation({
              _id: conv.conversationId,
              participants: conv.participants,
              lastMessageAt: conv.lastMessageAt,
              lastMessage: conv.lastMessage,
              unreadCount: conv.unreadCount || 0,
            })
          );
        }
      });
    };

    // listen to joinConversation emitted
    const handleConversationJoined = (data) => {
      const { conversationId, messages, participants } = data;

      dispatch(setActiveConversation(conversationId));
      dispatch(
        setMessages({
          conversationId,
          messages,
        })
      );

      setJoinedConversations((prev) => new Set([...prev, conversationId]));

      // Add conversation to state
      const lastMessage =
        messages.length > 0 ? messages[messages.length - 1] : null;
      dispatch(
        addConversation({
          _id: conversationId,
          participants,
          lastMessageAt: lastMessage
            ? lastMessage.timestamp
            : new Date().toISOString(),
          lastMessage: lastMessage
            ? {
                content: lastMessage.content,
                sender: lastMessage.sender,
              }
            : null,
        })
      );

      // Send pending messages
      if (pendingMessages.length > 0) {
        pendingMessages.forEach((msg) => {
          socket.emit("sendMessage", {
            senderId: userId,
            receiverId: selectedUser,
            content: msg.content,
          });
        });
        setPendingMessages([]);
      }
    };

    // Handle existing conversation joined
    const handleExistingConversation = ({ conversationId }) => {
      setJoinedConversations((prev) => new Set([...prev, conversationId]));
    };

    // Handle message sent confirmation
    const handleMessageSent = (message) => {
      dispatch(
        addMessage({
          ...message,
          status: "sent",
        })
      );
      refetch()

      // Update conversation with latest message
      if (message.conversation) {
        dispatch(
          updateConversation({
            conversationId: message.conversation,
            updates: {
              lastMessage: {
                content: message.content,
                sender: message.sender,
              },
              lastMessageAt: message.timestamp,
            },
          })
        );
      }
    };

    // Handle new incoming message
    const handleNewMessage = (message) => {
      const isActiveConversation = message.conversation === activeConversation;

      // Add message to conversation
      dispatch(addMessage(message));

      // Update conversation with latest message
      if (message.conversation) {
        dispatch(
          updateConversation({
            conversationId: message.conversation,
            updates: {
              lastMessage: {
                content: message.content,
                sender: message.sender,
              },
              lastMessageAt: message.timestamp,
            },
          })
        );
      }

      // Update unread count if not active conversation
      if (message.sender !== userId && !isActiveConversation) {
        dispatch(
          updateUnreadCount({
            conversationId: message.conversation,
            increment: true,
          })
        );
      } else if (
        message.sender !== userId &&
        isActiveConversation &&
        socket?.connected
      ) {
        // Mark as read if active conversation
        socket.emit("messageStatus", {
          messageId: message._id,
          status: "read",
          userId,
          conversationId: message.conversation,
        });
      }
    };

    // Handle message status updates
    const handleMessageUpdate = ({ messageId, status, conversationId }) => {
      dispatch(
        updateMessageStatus({
          conversationId,
          messageId,
          status,
        })
      );
    };

    // Handle typing indicator
    const handleTyping = ({
      userId: senderTyping,
      isTyping,
      conversationId,
    }) => {
      if (activeConversation === conversationId && senderTyping !== userId) {

        dispatch(
          setTypingStatus({
            conversationId,
            userId:senderTyping,
            isTyping,
          })
        );

        setTimeout(() => {
          dispatch(
            setTypingStatus({
              conversationId,
              userId: senderTyping,
              isTyping: false,
            })
          );
        }, 5000);
      }
    };

    // Handle new conversation
    const handleNewConversationCreated = ({ conversationId, participants }) => {
      // Join the conversation
      socket.emit("joinExistingConversation", {
        conversationId,
        userId,
      });

      setJoinedConversations((prev) => new Set([...prev, conversationId]));

      // Add to redux
      dispatch(
        addConversation({
          _id: conversationId,
          participants,
          lastMessageAt: new Date().toISOString(),
          lastMessage: null,
          unreadCount: 0,
        })
      );
    };

    // Error handlers
    const handleError = (error) => {
      console.error("Socket error:", error);
    };

    socket.on("connect", initializeUserConversations);
    socket.on("userConversationsJoined", handleUserConversationJoined);
    socket.on("conversationJoined", handleConversationJoined);
    socket.on("existingConversationJoined", handleExistingConversation);
    socket.on("messageSent", handleMessageSent);
    socket.on("newMessage", handleNewMessage);
    socket.on("messageUpdate", handleMessageUpdate);
    socket.on("started-typing", handleTyping);
    socket.on("newConversationCreated", handleNewConversationCreated);
    socket.on("conversationError", handleError);
    socket.on("messageError", handleError);

    // Cleanup on unmount
    return () => {
      socket.off("connect", initializeUserConversations);
      socket.off("userConversationsJoined", handleUserConversationJoined);
      socket.off("existingConversationJoined", handleExistingConversation);
      socket.off("conversationJoined", handleConversationJoined);
      socket.off("messageSent", handleMessageSent);
      socket.off("newMessage", handleNewMessage);
      socket.off("messageUpdate", handleMessageUpdate);
      socket.off("typing", handleTyping);
      socket.off("conversationError", handleError);
      socket.off("messageError", handleError);
      socket.off("newConversationCreated", handleNewConversationCreated);
    };
  }, [
    socket,
    dispatch,
    activeConversation,
    selectedUser,
    pendingMessages,
    userId,
    refetch
  ]);

  // Handle sending a message
  const handleSendMessage = (text) => {
    if (!text.trim() || !socket?.connected || !selectedUser) return;

    if (activeConversation) {
      // Send directly
      socket.emit("sendMessage", {
        senderId: userId,
        receiverId: selectedUser,
        content: text,
      });
    } else {
      // immediate update for UI
      const tempMessage = {
        _id: `temp-${Date.now()}`,
        sender: userId,
        content: text,
        status: "sending",
        timestamp: new Date().toISOString(),
      };


      // Add to pending messages
      setPendingMessages([...pendingMessages, tempMessage]);

      //create conversation
      socket.emit("joinConversation", {
        sender: userId,
        receiver: selectedUser,
        content: text,
      });
    }
  };

  // Handle typing indicator
  const handleTyping = (isTyping) => {
    if (!socket?.connected || !activeConversation) return;

    socket.emit("user-typing", {
      conversationId: activeConversation,
      userId,
      isTyping,
    });
  };

  const selectedUserData = users.find((user) => user._id === selectedUser);
  const isTyping = useSelector(
    (state) =>
      activeConversation &&
      state.chat.typingStatus[activeConversation]?.[selectedUser]
  );

  return (
    <div className="chat-room-container">
      <div className="sidebar">
        <UserList />
      </div>
      <div className="chat-area">
        <div className="chat-header">
          <h2 className="chat-title">
            {selectedUserData
              ? `Chat with ${selectedUserData.username}`
              : "Select a user to chat"}
            {isMessagesLoading && (
              <span className="loading-indicator">Loading...</span>
            )}

            {!socket?.connected && (
              <span className="connection-status">Disconnected</span>
            )}
          </h2>
          <button
            onClick={() => {
              dispatch(logout());
              dispatch(clearChatData());
            }}
            className="logout-btn"
          >
            Logout
          </button>
        </div>

        <div className="messages-container">
          {selectedUser ? (
            isMessagesLoading ? (
              <div className="loading-state">Loading messages...</div>
            ) : (
              <MessageList
                conversationId={activeConversation || "pending"}
                typingIndicator={isTyping}
                socket={socket}
              />
            )
          ) : (
            <div className="empty-state">
              Please select a user from the sidebar to start chatting
            </div>
          )}
        </div>

        {selectedUser && !isMessagesLoading && (
          <div className="input-container">
            <InputField
              onSend={handleSendMessage}
              onTyping={handleTyping}
              disabled={!socket?.connected}
            />
          </div>
        )}
      </div>
    </div>
  );
}

export default ChatRoom;
