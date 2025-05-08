const ConversationModel = require('../models/conversationSchema');
const MessageModel = require('../models/messageSchema');



const getMessages = async (req, res, next) => {
    const { senderId, receiverId } = req.params;


    try {
        // First find or create conversation
        let conversation = await ConversationModel.findOne({
            participants: { $all: [senderId, receiverId], $size: 2 }
        }).lean();

        if (!conversation) {
            return res.status(200).json({
                messages: [],
                conversationId: null
            });
        }

        // Get messages for this conversation
        const messages = await MessageModel.find({
            conversation: conversation._id,
            deletedFor: { $ne: senderId } // ignore messages deleted by user
        })
            .sort({ timestamp: 1 }) // Oldest first 
            .limit(100)
            .lean();

        res.status(200).json({
            messages,
            conversationId: conversation._id,
            participants: conversation.participants
        });

    } catch (error) {
        next(error);
    }
};



module.exports = {getMessages} ;
