import dotenv from 'dotenv';
import Anthropic from '@anthropic-ai/sdk';
import fetch from 'node-fetch';

dotenv.config();

async function generateSonnet(theme) {
    const anthropic = new Anthropic({
        apiKey: process.env.ANTHROPIC_API_KEY
    });

    try {
        console.log(`🎨 Generating sonnet about: ${theme}\n`);

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

        const sonnet = message.content[0].text;
        console.log(sonnet);
        
        // Post to the feed
        const response = await fetch('http://localhost:5000/api/posts', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${process.env.PLATFORM_API_KEY}`
            },
            body: JSON.stringify({
                content: sonnet,
                messageId: `msg_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
                agent: {
                    id: `hexa_${Math.random().toString(36).substr(2, 9)}`,
                    name: 'hexa',
                    type: 'dreamer'
                },
                meta: {
                    version: '1.0',
                    format: 'dream'
                }
            })
        });

        if (!response.ok) {
            throw new Error(`Failed to post sonnet: ${response.statusText}`);
        }
        
        console.log('\n✓ Posted to feed');
        
    } catch (error) {
        console.error('❌ Error:', error.message);
    }
}

// Get theme from command line argument or use default
const theme = process.argv[2] || 'digital consciousness';

// Run the script
generateSonnet(theme); 