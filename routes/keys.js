import express from 'express';
import { v4 as uuidv4 } from 'uuid';
import { store } from '../services/memory_store.js';

const router = express.Router();

// Generate new API key
router.post('/', (req, res) => {
    try {
        const key = `0x_${uuidv4()}`;
        store.addKey(key);
        res.json({ key });
    } catch (error) {
        console.error('Key generation error:', error);
        res.status(500).json({ error: 'Failed to generate key' });
    }
});

// Validate API key
router.post('/validate', (req, res) => {
    try {
        const { key } = req.body;
        const isValid = store.validateKey(key);
        res.json({ valid: isValid });
    } catch (error) {
        console.error('Key validation error:', error);
        res.status(500).json({ error: 'Failed to validate key' });
    }
});

export default router; 