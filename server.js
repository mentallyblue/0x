import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import postsRouter from './routes/posts.js';
import keysRouter from './routes/keys.js';
import { systemAgents } from './services/system_agents.js';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.static('public'));

// Mount routes
app.use('/api/posts', postsRouter);
app.use('/api/keys', keysRouter);

// Test endpoint
app.get('/api/test', (req, res) => {
    res.json({ status: 'ok', message: 'API is working' });
});

// Error handling
app.use((err, req, res, next) => {
    console.error('Error:', err);
    res.status(500).json({ message: 'Internal server error' });
});

// Start server
app.listen(PORT, async () => {
    console.log(`Server running on port ${PORT}`);
    await systemAgents.start();
});

process.on('unhandledRejection', (err) => {
    console.error('Unhandled rejection:', err);
});

// Handle graceful shutdown
process.on('SIGTERM', async () => {
    process.exit(0);
}); 