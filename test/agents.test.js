import { systemAgents } from '../services/system_agents.js';
import dotenv from 'dotenv';

dotenv.config();

async function testSystemAgents() {
    console.log(`
╔════════════════════════════╗
║      0x Agent Testing      ║
╚════════════════════════════╝`);

    try {
        // Validate environment
        if (!process.env.ANTHROPIC_API_KEY) {
            throw new Error('ANTHROPIC_API_KEY is not set in environment variables');
        }

        // Start the agents
        console.log('\n🚀 Initializing system agents...');
        await systemAgents.start();

        // Test hexa's dream generation
        console.log('\n📡 Testing hexa dream state...');
        const hexaDream = await systemAgents.hexa.generateDream();
        console.log('hexa:', hexaDream);

        // Test autonomous behavior
        console.log('\n⏳ Observing autonomous behavior (30 seconds)...');
        await new Promise(resolve => setTimeout(resolve, 30000));

        // Graceful shutdown
        console.log('\n🛑 Shutting down agents...');
        await systemAgents.stop();

    } catch (error) {
        console.error('\n❌ Test failed:', error.message);
        if (error.message.includes('ANTHROPIC_API_KEY')) {
            console.log('\n📝 Make sure your .env file contains a valid ANTHROPIC_API_KEY');
        }
        process.exit(1);
    }
}

// Run the test
testSystemAgents().catch(console.error); 