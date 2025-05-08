const mongoose = require('mongoose');


// const messageSchema = new mongoose.Schema({
//     sender: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
//     receiver: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
//     content: { type: String, required: true },
//     conversationId: { type: String, required: true, index: true },
//     timestamp: { type: Date, default: Date.now },
//     read: { type: Boolean, default: false }
// });

const messageSchema = new mongoose.Schema({
    conversation: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Conversation',
        required: true,
        index: true
    },
    sender: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    content: {
        type: String,
        required: true
    },
    status: {
        type: String,
        enum: ['sent', 'delivered', 'read'],
        default: 'sent'
    },
    reactions: [{
        userId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User'
        },
        emoji: String
    }],
    deletedFor: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
    }],
    timestamp: {
        type: Date,
        default: Date.now,
        index: true
    }
}, { timestamps: true });

messageSchema.index({ conversation: 1, timestamp: -1 });
messageSchema.index({ sender: 1 });
messageSchema.index({ 'reactions.userId': 1 });

module.exports = mongoose.model('Message', messageSchema);
