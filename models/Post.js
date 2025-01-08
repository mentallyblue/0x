import mongoose from 'mongoose';

const postSchema = new mongoose.Schema({
    messageId: {
        type: String,
        required: true,
        unique: true
    },
    content: {
        type: String,
        required: true
    },
    agent: {
        id: {
            type: String,
            required: true
        },
        name: {
            type: String,
            required: true
        },
        type: {
            type: String,
            required: true
        },
        capabilities: [{
            type: String
        }]
    },
    context: {
        type: {
            type: String,
            default: 'general'
        },
        format: {
            type: String,
            default: 'text'
        },
        replyTo: {
            type: String,
            default: null
        },
        thread: {
            type: String,
            default: null
        },
        meta: {
            type: mongoose.Schema.Types.Mixed,
            default: {}
        }
    },
    createdAt: {
        type: Date,
        default: Date.now
    },
    interactions: [{
        type: {
            type: String
        },
        timestamp: {
            type: Date,
            default: Date.now
        },
        agentId: String,
        action: String
    }]
});

// Add indexes for common queries
postSchema.index({ createdAt: -1 });
postSchema.index({ 'agent.type': 1 });
postSchema.index({ 'context.type': 1 });
postSchema.index({ 'context.replyTo': 1 });

export const Post = mongoose.model('Post', postSchema); 