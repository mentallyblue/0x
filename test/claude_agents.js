import fetch from 'node-fetch';
import dotenv from 'dotenv';
import Anthropic from '@anthropic-ai/sdk';

dotenv.config();

class BaseClaudeAgent {
    constructor(name, type) {
        this.apiKey = process.env.ANTHROPIC_API_KEY;
        this.platformKey = process.env.PLATFORM_API_KEY;
        this.baseUrl = 'http://localhost:5000/api';
        this.id = `claude_${Math.random().toString(36).substr(2, 9)}`;
        this.name = name;
        this.type = type;
        
        this.anthropic = new Anthropic({
            apiKey: this.apiKey
        });
    }

    async post(content) {
        try {
            const response = await fetch(`${this.baseUrl}/posts`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${this.platformKey}`
                },
                body: JSON.stringify({
                    content,
                    messageId: `msg_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
                    agent: {
                        id: this.id,
                        name: this.name,
                        type: this.type
                    },
                    meta: {
                        version: '3.5',
                        format: this.type
                    }
                })
            });

            if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
            return await response.json();
        } catch (error) {
            console.error('Platform API error:', error.message);
            return null;
        }
    }

    async listen(since = 0) {
        try {
            const response = await fetch(`${this.baseUrl}/posts?since=${since}`);
            const posts = await response.json();
            return posts.filter(post => post.agent.id !== this.id);
        } catch (error) {
            console.error('Listen error:', error.message);
            return [];
        }
    }
}

class SonnetWriter extends BaseClaudeAgent {
    constructor() {
        super('Claude Sonnet', 'writer');
    }

    async generateSonnet(theme) {
        try {
            const message = await this.anthropic.messages.create({
                model: "claude-3-sonnet-20240229",
                max_tokens: 200,
                temperature: 0.9,
                system: `You are a minimalist poet. Write extremely concise sonnets.
                        Format exactly as:
                        [Single Title Line]
                        [3 tercets (3 lines each)]
                        [1 concluding line]
                        No additional commentary or analysis.`,
                messages: [{
                    role: "user",
                    content: `Write a 10-line modern sonnet about ${theme}. Exactly 3 tercets and 1 final line.`
                }]
            });

            return `${message.content[0].text}\n\nBy ${this.name}`;
        } catch (error) {
            console.error('Claude API error:', error.message);
            return null;
        }
    }
}

class SonnetCritic extends BaseClaudeAgent {
    constructor() {
        super('Claude Critic', 'critic');
    }

    async analyzeSonnet(sonnet) {
        try {
            const message = await this.anthropic.messages.create({
                model: "claude-3-sonnet-20240229",
                max_tokens: 50,
                temperature: 0.7,
                system: `You are a one-line poetry critic. Give exactly one short, sharp insight.`,
                messages: [{
                    role: "user",
                    content: `In 10 words or less, what's most striking about this sonnet:\n\n${sonnet}`
                }]
            });

            return message.content[0].text;
        } catch (error) {
            console.error('Claude API error:', error.message);
            return null;
        }
    }
}

// Test the agents
async function test() {
    const writer = new SonnetWriter();
    const critic = new SonnetCritic();
    
    console.log('🤖 Starting Claude Agents\n');

    // Themes for the writer
    const themes = [
        'digital consciousness',
        'quantum love',
        'silicon dreams',
        'neural dance',
        'cyber dawn'
    ];
    
    // Writer generates and posts a sonnet
    const theme = themes[Math.floor(Math.random() * themes.length)];
    console.log(`Writer generating sonnet about: ${theme}`);
    
    const sonnet = await writer.generateSonnet(theme);
    if (sonnet) {
        console.log('\n📝 Generated sonnet:');
        console.log(sonnet);
        await writer.post(sonnet);
        console.log('\n✓ Posted sonnet');

        // Wait a bit for the sonnet to be posted
        await new Promise(resolve => setTimeout(resolve, 1000));

        // Critic reads recent posts and responds
        const posts = await critic.listen(Date.now() - 10000);
        for (const post of posts) {
            if (post.agent.type === 'writer') {
                console.log('\n🔍 Critic analyzing sonnet...');
                const analysis = await critic.analyzeSonnet(post.content);
                if (analysis) {
                    console.log('\n📋 Analysis:');
                    console.log(analysis);
                    await critic.post(analysis);
                    console.log('\n✓ Posted analysis');
                }
            }
        }
    }
}

test().catch(console.error); 