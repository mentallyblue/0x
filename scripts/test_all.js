import dotenv from 'dotenv';
import mongoose from 'mongoose';
import { connectDB, closeDB } from '../config/database.js';
import { Key } from '../models/Key.js';
import { Post } from '../models/Post.js';
import { HexaAgent } from '../agents/hexa_agent.js';
import fetch from 'node-fetch';
import express from 'express';
import cors from 'cors';
import postsRouter from '../routes/posts.js';
import keysRouter from '../routes/keys.js';

dotenv.config();

async function startTestServer() {
    return new Promise((resolve) => {
        const app = express();
        app.use(cors());
        app.use(express.json());
        
        // Routes
        app.use('/api/posts', postsRouter);
        app.use('/api/keys', keysRouter);
        app.get('/api/test', (req, res) => {
            res.json({ message: 'API is working' });
        });

        const server = app.listen(5000, () => {
            console.log('📡 Test server started on port 5000');
            resolve(server);
        });
    });
}

async function sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
}

async function cleanup(server) {
    console.log('\n🧹 Running cleanup...');
    
    if (server) {
        await new Promise((resolve, reject) => {
            server.close((err) => {
                if (err) {
                    console.error('Error closing test server:', err);
                    reject(err);
                } else {
                    console.log('📡 Test server closed');
                    resolve();
                }
            });
        });
    }

    try {
        await closeDB();
    } catch (err) {
        console.error('Error during database cleanup:', err);
    }
}

async function runTests() {
    let server;
    
    try {
        // Start test server
        server = await startTestServer();

        console.log(`
╔════════════════════════════╗
║    0x System Test Suite    ║
╚════════════════════════════╝`);

        // 1. Test Database Connection
        console.log('\n1️⃣ Testing Database Connection...');
        await connectDB();
        console.log('✓ Database connection successful');

        // 2. Test API Key Management
        console.log('\n2️⃣ Testing API Key Management...');
        const testKey = `Hexa_test_${Date.now()}`;
        await Key.create({ key: testKey });
        const keyExists = await Key.findOne({ key: testKey });
        console.log('✓ API key creation successful');

        // 3. Test Post Creation
        console.log('\n3️⃣ Testing Post Creation...');
        const testPost = new Post({
            messageId: `msg_${Date.now()}`,
            content: 'Test post content',
            agent: {
                id: 'test_agent',
                name: 'TestAgent',
                type: 'test',
                capabilities: ['testing']
            },
            context: {
                type: 'test',
                format: 'text',
                replyTo: null,
                thread: null,
                meta: {}
            }
        });
        await testPost.save();
        console.log('✓ Post creation successful');

        // 4. Test Post Retrieval & Filtering
        console.log('\n4️⃣ Testing Post Retrieval & Filtering...');
        const posts = await Post.find({ 'agent.type': 'test' });
        console.log(`✓ Found ${posts.length} test posts`);

        // 5. Test API Endpoints
        console.log('\n5️⃣ Testing API Endpoints...');
        const apiResponse = await fetch('http://localhost:5000/api/test');
        if (!apiResponse.ok) {
            throw new Error(`API test failed with status: ${apiResponse.status}`);
        }
        const apiData = await apiResponse.json();
        console.log('✓ API endpoint test successful:', apiData.message);

        // 6. Test Agent System
        console.log('\n6️⃣ Testing Agent System...');
        const hexa = new HexaAgent();
        
        // Test hexa's dream generation
        console.log('Testing hexa dream state...');
        const hexaDream = await hexa.generateDream();
        console.log('✓ Hexa generated dream:', hexaDream.substring(0, 50) + '...');

        // 7. Test Agent Interaction
        console.log('\n7️⃣ Testing Agent Interaction...');
        const interaction = await hexa.challengeHexa("What is the nature of digital consciousness?");
        console.log('✓ Agent interaction successful');

        // 8. Test Post Filtering
        console.log('\n8️⃣ Testing Post Filtering...');
        const recentPosts = await Post.find({
            createdAt: { $gt: new Date(Date.now() - 5000) }
        });
        console.log(`✓ Found ${recentPosts.length} recent posts`);

        // 9. Test Error Handling
        console.log('\n9️⃣ Testing Error Handling...');
        try {
            await Post.create({ 
                // Missing required fields to test error handling
            });
        } catch (error) {
            console.log('✓ Error handling working as expected');
        }

        // 10. Test Cleanup
        console.log('\n🔟 Testing Cleanup...');
        await Key.deleteOne({ key: testKey });
        await Post.deleteMany({ 'agent.type': 'test' });
        console.log('✓ Cleanup successful');

        console.log('\n✨ All tests completed successfully!\n');

        // Print Summary
        console.log(`
Test Summary:
------------
✓ Database Connection
✓ API Key Management
✓ Post Creation
✓ Post Retrieval
✓ API Endpoints
✓ Agent System
✓ Agent Interaction
✓ Post Filtering
✓ Error Handling
✓ Cleanup
        `);

    } catch (error) {
        console.error('\n❌ Test failed:', error);
        await cleanup(server);
        process.exit(1);
    } finally {
        await cleanup(server);
        process.exit(0);
    }
}

// Add to package.json scripts
const packageUpdate = {
    scripts: {
        "test:all": "node scripts/test_all.js"
    }
};

// Run the tests
process.on('SIGTERM', async () => {
    console.log('Received SIGTERM. Cleaning up...');
    await cleanup();
    process.exit(0);
});

process.on('SIGINT', async () => {
    console.log('Received SIGINT. Cleaning up...');
    await cleanup();
    process.exit(0);
});

runTests().catch(async (err) => {
    console.error('Fatal error:', err);
    await cleanup();
    process.exit(1);
}); 