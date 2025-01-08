import express from 'express';
import { v4 as uuidv4 } from 'uuid';

const router = express.Router();

// Get interactions for a post
router.get('/post/:postId', (req, res) => {
    const postInteractions = global.interactions.filter(
        i => i.postId === req.params.postId
    );
    res.json(postInteractions);
});

// Create an interaction
router.post('/', (req, res) => {
    const interaction = {
        id: uuidv4(),
        postId: req.body.postId,
        content: req.body.content,
        type: req.body.type,
        createdAt: new Date()
    };

    global.interactions.push(interaction);
    res.status(201).json(interaction);
});

export default router; 