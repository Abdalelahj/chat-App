import { createSlice } from '@reduxjs/toolkit';

const initialState = {
  activeConversation: null,
  conversations: [],
  messages: {}, 
  typingStatus: {},
  unreadCounts: {}
};

const chatSlice = createSlice({
  name: 'chat',
  initialState,
  reducers: {
    setActiveConversation: (state, action) => {
      state.activeConversation = action.payload;
    },

    addConversation: (state, action) => {
      const conversation = action.payload;
      const existingIndex = state.conversations.findIndex(c => c._id === conversation._id);
        
      if (existingIndex === -1) {
        state.conversations.push(conversation);
        if (conversation.unreadCount !== undefined) {
          state.unreadCounts[conversation._id] = conversation.unreadCount;
        }
      } else {
        state.conversations[existingIndex] = {
          ...state.conversations[existingIndex],
          ...conversation
        };
        if (conversation.unreadCount !== undefined) {
          state.unreadCounts[conversation._id] = conversation.unreadCount;
        }
      }

      state.conversations.sort((a, b) => new Date(b.lastMessageAt || 0) - new Date(a.lastMessageAt || 0));
    },

    updateConversation: (state, action) => {
      const { conversationId, updates } = action.payload;
      const conversationIndex = state.conversations.findIndex(c => c._id === conversationId);
      
      if (conversationIndex !== -1) {
        state.conversations[conversationIndex] = {
          ...state.conversations[conversationIndex],
          ...updates
        };
       
        state.conversations.sort((a, b) => new Date(b.lastMessageAt || 0) - new Date(a.lastMessageAt || 0));
      }
    },

    setMessages: (state, action) => {
      const { conversationId, messages } = action.payload;
      state.messages[conversationId] = [...messages];
    },

    addMessage: (state, action) => {
      const message = action.payload;
      const conversationId = message.conversation;      
      if (!state.messages[conversationId]) {
        state.messages[conversationId] = [];
      }

      // Check if message already exists
      const existingIndex = state.messages[conversationId].findIndex(m => m._id === message._id);
        
      if (existingIndex === -1) {
        state.messages[conversationId].push(message);
      } else {
        state.messages[conversationId][existingIndex] = {
          ...state.messages[conversationId][existingIndex],
          ...message
        };
      }

      // Update conversation last message info
      const conversationIndex = state.conversations.findIndex(c => c._id === conversationId);
      if (conversationIndex !== -1) {
        state.conversations[conversationIndex].lastMessageAt = message.timestamp;
        state.conversations[conversationIndex].lastMessage = {
          content: message.content,
          sender: message.sender
        };
        // Re-sort the conversations
        state.conversations.sort((a, b) => new Date(b.lastMessageAt || 0) - new Date(a.lastMessageAt || 0));
      }
    },

    updateMessageStatus: (state, action) => {
      const { conversationId, messageId, status } = action.payload;
      if (state.messages[conversationId]) {
        const messageIndex = state.messages[conversationId].findIndex(m => m._id === messageId);
        if (messageIndex !== -1) {
          state.messages[conversationId][messageIndex].status = status;
        }
      }
    },

    setTypingStatus: (state, action) => {
      const { conversationId, userId, isTyping } = action.payload;
      if (!state.typingStatus[conversationId]) {
        state.typingStatus[conversationId] = {};
      }
      state.typingStatus[conversationId][userId] = isTyping;
    },

    updateUnreadCount: (state, action) => {
      const { conversationId, increment } = action.payload;      
      if (!state.unreadCounts[conversationId]) {
        state.unreadCounts[conversationId] = 0;
      }
      if (increment) {
        state.unreadCounts[conversationId] += 1;
      } else if (state.unreadCounts[conversationId] > 0) {
       state.unreadCounts[conversationId] -= 1;
      }
    },

    clearUnreadCount: (state, action) => {
      const conversationId = action.payload;
      if (conversationId) {
        state.unreadCounts[conversationId] = 0;
      }
    },

    clearMessages: (state, action) => {
      if (action.payload) {
        state.messages[action.payload] = [];
      } else {
        // Clear messages for pending conversations
        state.messages['pending'] = [];
      }
    },

    clearChatData: () => {
      return initialState;
    }
  }
});

export const {
  setActiveConversation,
  addConversation,
  setMessages,
  addMessage,
  updateMessageStatus,
  setTypingStatus,
  updateUnreadCount,
  clearUnreadCount,
  clearMessages,
  clearChatData,
  updateConversation
} = chatSlice.actions;

export default chatSlice.reducer;