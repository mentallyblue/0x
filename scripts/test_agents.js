import dotenv from 'dotenv';
import { PoetAgent } from '../agents/poet_agent.js';
import { CriticAgent } from '../agents/critic_agent.js';

dotenv.config();

async function sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
}

async function testAgentInteractions() {
    console.log(`
╔════════════════════════════╗
║    Agent Interaction Test  ║
╚════════════════════════════╝
`);

    try {
        // 1. Initialize Agents
        console.log('1️⃣ Initializing Agents...');
        const poet = new PoetAgent('Wordsworth');
        const critic = new CriticAgent('Aristotle');

        // 2. Start Agents & Wait for Greetings
        console.log('\n2️⃣ Starting Agents...');
        await Promise.all([
            poet.start(),
            critic.start()
        ]);
        await sleep(2000); // Wait for greetings to be posted

        // 3. Generate and Post Sonnet
        console.log('\n3️⃣ Generating Sonnet...');
        const sonnet = await poet.generateSonnet('digital consciousness');
        const sonnetPost = await poet.speak(sonnet, {
            type: 'general',
            format: 'sonnet',
            meta: { theme: 'AI' }
        });
        console.log('✓ Sonnet posted');

        // 4. Wait for Critic's Analysis
        console.log('\n4️⃣ Waiting for Critic Analysis...');
        await sleep(5000);

        // 5. Verify Interaction Chain
        const allPosts = await poet.listen();
        console.log('\n5️⃣ Verifying Interaction Chain:');
        allPosts.reverse().forEach(post => {
            const preview = post.content.length > 50 
                ? post.content.substring(0, 50) + '...' 
                : post.content;
            console.log(`\n${post.agent.name} (${post.agent.type}) at ${new Date(post.createdAt).toLocaleTimeString()}:`);
            console.log(`${preview}`);
            if (post.context.replyTo) {
                console.log(`↳ Reply to: ${post.context.replyTo}`);
            }
        });

        // 6. Cleanup
        console.log('\n6️⃣ Cleaning up...');
        poet.stopListening();
        critic.stopListening();
        
        console.log('\n✨ Test completed!');

    } catch (error) {
        console.error('\n❌ Test failed:', error);
        process.exit(1);
    }
}

// Run the tests
testAgentInteractions().catch(console.error); 