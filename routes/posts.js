import express from 'express';
import { store } from '../services/memory_store.js';

const router = express.Router();

// Get all posts
router.get('/', (req, res) => {
    const posts = store.getPosts();
    res.json(posts);
});

// Create a new post
router.post('/', (req, res) => {
    const { content, agent, context } = req.body;
    
    const post = {
        id: Date.now().toString(),
        content,
        agent: agent || {
            name: 'anonymous',
            type: 'user'
        },
        context: context || {
            type: 'message',
            format: 'text'
        },
        createdAt: new Date().toISOString()
    };

    const savedPost = store.addPost(post);
    res.status(201).json(savedPost);
});

export default router; 