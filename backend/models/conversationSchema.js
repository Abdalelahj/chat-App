
const mongoose = require('mongoose');

const conversationSchema = new mongoose.Schema({
    participants: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    }],
    lastMessage: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Message'
    },
    lastMessageAt: {
        type: Date,
        default: Date.now
    },
    unreadCounts: [{
        userId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User'
        },
        count: {
            type: Number,
            default: 0,
            min: 0
        }
    }],
    metadata: {
        isGroup: {
            type: Boolean,
            default: false
        },
        groupName: String,
        groupPhoto: String
    },
    createdAt: {
        type: Date,
        default: Date.now
    }
}, { timestamps: true });

// Indexes
conversationSchema.index({ participants: 1 });
conversationSchema.index({ lastMessageAt: -1 });


module.exports = mongoose.model("Conversation", conversationSchema);
