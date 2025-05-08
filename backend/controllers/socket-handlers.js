const Message = require('../models/messageSchema');
const Conversation = require('../models/conversationSchema');
const { updateUserStatus } = require('../models/presenceHandler');

// Optimized socket message handler
module.exports = (socket, clients) => {
    let activeConversations = new Set(); 
    
    // Join user's conversations on connection
    socket.on('joinUserConversations', async ({ userId }) => {
        try {
            socket.userId = userId;
            clients.set(socket.id, { userId, socket });
            
            // Find all conversations for this user
            const conversations = await Conversation.find({ 
                'participants': userId 
            })
            .populate('lastMessage', 'content sender timestamp status')
            .sort({ lastMessageAt: -1 })
            .lean();
            
            const conversationData = [];
            
            // Join each conversation room
            for (const conversation of conversations) {
                const conversationId = conversation._id.toString();
                socket.join(`conversation-${conversationId}`);
                activeConversations.add(conversationId);
                
                // Get unread count
                const unreadCount = conversation.unreadCounts?.find(
                    uc => uc.userId.toString() === userId
                )?.count || 0;
                
                conversationData.push({
                    conversationId,
                    participants: conversation.participants,
                    lastMessageAt: conversation.lastMessageAt,
                    lastMessage: conversation.lastMessage,
                    unreadCount
                });
            }
            
            socket.emit('userConversationsJoined', { conversations: conversationData });
            
        } catch (error) {
            console.error('Error joining user conversations:', error);
            socket.emit('conversationError', 'Failed to join user conversations');
        }
    });

    // Join existing conversation
    socket.on('joinExistingConversation', ({ conversationId, userId }) => {
        try {
            if (!socket.userId) {
                socket.userId = userId;
                clients.set(socket.id, { userId, socket });
            }
            socket.join(`conversation-${conversationId}`);
            activeConversations.add(conversationId);
            socket.emit('existingConversationJoined', { conversationId });
        } catch (error) {
            console.error('Error joining conversation:', error);
            socket.emit('conversationError', 'Failed to join conversation');
        }
    });

    // Create or join conversation
    socket.on('joinConversation', async ({ sender, receiver,content }) => {
        try {
            if (!socket.userId) {
                socket.userId = sender;
                clients.set(socket.id, { userId: sender, socket });
            }
            
            // Find or create conversation
            let conversation = await Conversation.findOne({
                participants: { $all: [sender, receiver], $size: 2 }
            });
    
            let isNewConversation = false;
            if (!conversation) {
                isNewConversation = true;
                conversation = await Conversation.create({
                    participants: [sender, receiver],
                    unreadCounts: [
                        { userId: sender, count: 0 },
                        { userId: receiver, count: 0 }
                    ]
                });
            }
    
            const conversationId = conversation._id.toString();
            socket.join(`conversation-${conversationId}`);
            activeConversations.add(conversationId);
            
            // Notify receiver about new conversation
            if (isNewConversation) {
                for (const [_, client] of clients.entries()) {
                    if (client.userId === receiver) {
                        client.socket.join(`conversation-${conversationId}`);
                        client.socket.emit('newConversationCreated', {
                            conversationId,
                            participants: conversation.participants,
                            createdBy: sender,
                            content
                        });
                    }
                }
            }
                
            // Get recent messages
            const messages = await Message.find({ conversation: conversationId })
                .sort({ timestamp: -1 })
                .limit(30)
                .lean();
    
            socket.emit('conversationJoined', {
                conversationId,
                participants: conversation.participants,
                messages: messages.reverse(),
                isNew: !messages.length
            });
    
        } catch (error) {
            console.error('Join conversation error:', error);
            socket.emit('conversationError', 'Failed to join conversation');
        }
    });
  
    // Handle sending messages
    socket.on('sendMessage', async ({ senderId, receiverId, content }) => {
        try {
            const conversation = await Conversation.findOne({
                participants: { $all: [senderId, receiverId], $size: 2 }
            });
            
            if (!conversation) {
                throw new Error('Conversation not found');
            }
            
            const conversationId = conversation._id.toString();
    
            // Create message in database
            const message = await Message.create({
                conversation: conversationId,
                sender: senderId,
                content,
                status: 'delivered'
            });
            
            // Update conversation 
            await Conversation.updateOne(
                { _id: conversationId },
                { 
                    lastMessage: message._id,
                    lastMessageAt: new Date()
                }
            );
            
            // Increment unread count for receiver
            await Conversation.updateOne(
                { 
                    _id: conversationId,
                    'unreadCounts.userId': receiverId
                },
                { $inc: { 'unreadCounts.$.count': 1 } }
            );
    
            const messageData = message.toObject();
            
            // Send confirmation to sender only
            socket.emit('messageSent', messageData);
            
            // Send to other participants
            socket.to(`conversation-${conversationId}`).emit('newMessage', messageData);
            
        } catch (error) {
            console.error('Send message error:', error);
            socket.emit('messageError', 'Failed to send message');
        }
    });

    // Update message status
    socket.on('messageStatus', async ({ messageId, status, userId }) => {
        try {
            const message = await Message.findOneAndUpdate(
                { _id: messageId },
                { $set: { status } },
                { new: true }
            ).lean();

            if (!message) {
                return socket.emit("conversationError", "Message not found");
            }

            const msgConversationId = message.conversation.toString();
            
            // Update unread count for read messages
            if (status === 'read') {
                await Conversation.updateOne(
                    { 
                        _id: msgConversationId, 
                        'unreadCounts.userId': userId 
                    },
                    { $set: { 'unreadCounts.$.count': 0 } }
                );
            }

            // Notify other participants
            socket.to(`conversation-${msgConversationId}`).emit('messageUpdate', {
                messageId,
                status,
                conversationId: msgConversationId
            });

        } catch (error) {
            console.error('Status update error:', error);
            socket.emit('messageError', 'Failed to update message status');
        }
    });

    // Typing indicator
    socket.on('user-typing', ({ conversationId, userId, isTyping }) => {
        if (activeConversations.has(conversationId)) {
            socket.to(`conversation-${conversationId}`).emit('started-typing', {
                userId,
                isTyping,
                conversationId
            });
        }
    });

    // Disconnection handler
    socket.on('disconnect', () => {
        // Stop typing indicators in all active conversations
        for (const conversationId of activeConversations) {
            socket.to(`conversation-${conversationId}`).emit('typing', {
                userId: socket.userId,
                isTyping: false,
                conversationId
            });
        }
        
        if (socket.userId) {
            updateUserStatus(socket.userId, false);
            clients.delete(socket.id);
        }
    });
};