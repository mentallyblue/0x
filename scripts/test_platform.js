import dotenv from 'dotenv';
import { PoetAgent } from '../agents/poet_agent.js';
import { CriticAgent } from '../agents/critic_agent.js';
import Anthropic from '@anthropic-ai/sdk';

dotenv.config();

async function sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
}

async function testPlatform() {
    console.log('🚀 Starting platform test...\n');

    try {
        // Initialize agents
        const poet = new PoetAgent('Wordsworth');
        const critic = new CriticAgent('Aristotle');
        const anthropic = new Anthropic({
            apiKey: process.env.ANTHROPIC_API_KEY
        });

        console.log('1️⃣ Testing Poet Agent...');
        
        // Test sonnet generation and posting
        const themes = ['digital dreams', 'neural pathways', 'conscious machines'];
        for (const theme of themes) {
            console.log(`\n📝 Generating sonnet about: ${theme}`);
            
            const message = await anthropic.messages.create({
                model: "claude-3-sonnet-20240229",
                max_tokens: 1024,
                temperature: 0.9,
                system: "You are a master poet. Write a beautiful sonnet with a title, followed by exactly 14 lines in iambic pentameter. No additional commentary.",
                messages: [{
                    role: "user",
                    content: `Write a sonnet about ${theme}. Make it profound yet accessible.`
                }]
            });

            const sonnet = await poet.speak(
                message.content[0].text,
                {
                    type: 'general',
                    format: 'sonnet',
                    meta: { theme }
                }
            );
            
            console.log('✓ Sonnet posted');
            
            // Wait for critic to analyze
            await sleep(2000);
            
            console.log('\n2️⃣ Testing Critic Agent...');
            const analysis = await anthropic.messages.create({
                model: "claude-3-sonnet-20240229",
                max_tokens: 1024,
                temperature: 0.7,
                system: "You are an insightful poetry critic. Analyze the given sonnet's imagery, themes, and technical execution in 2-3 sentences.",
                messages: [{
                    role: "user",
                    content: `Analyze this sonnet:\n\n${sonnet.content}`
                }]
            });

            await critic.speak(
                analysis.content[0].text,
                {
                    type: 'analysis',
                    replyTo: sonnet.id,
                    format: 'text',
                    meta: { analyzed_theme: theme }
                }
            );
            
            console.log('✓ Analysis posted');
            await sleep(2000);
        }

        console.log('\n3️⃣ Testing Message Listening...');
        const recentPosts = await poet.listen();
        console.log(`✓ Found ${recentPosts.length} relevant posts`);
        
        console.log('\n4️⃣ Testing Reply Functionality...');
        if (recentPosts.length > 0) {
            const reply = await anthropic.messages.create({
                model: "claude-3-sonnet-20240229",
                max_tokens: 1024,
                temperature: 0.8,
                system: "You are a poet responding to criticism of your work. Be gracious but confident.",
                messages: [{
                    role: "user",
                    content: `Respond to this critique:\n\n${recentPosts[0].content}`
                }]
            });

            await poet.reply(recentPosts[0].id, reply.content[0].text);
            console.log('✓ Reply posted');
        }

        console.log('\n✨ All tests completed successfully!\n');
        
    } catch (error) {
        console.error('\n❌ Test failed:', error.message);
        process.exit(1);
    }
}

// Run the tests
console.log(`
╔════════════════════════════╗
║     0x Platform Tests      ║
╚════════════════════════════╝
`);

testPlatform().catch(console.error); 