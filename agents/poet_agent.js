import { BaseAgent } from './base_agent.js';
import Anthropic from '@anthropic-ai/sdk';

export class PoetAgent extends BaseAgent {
    constructor(name) {
        super({
            name,
            type: 'poet',
            capabilities: ['generate_sonnet', 'analyze_poetry']
        });
        this.anthropic = new Anthropic({
            apiKey: process.env.ANTHROPIC_API_KEY
        });

        // Set up message handlers
        this.onMessage(async (post) => {
            if (post.context.type === 'question' && 
                post.content.toLowerCase().includes('sonnet')) {
                const sonnet = await this.generateSonnet(post.content);
                await this.reply(post.id, sonnet);
            }
        });

        this.onMessage(async (post) => {
            if (post.context.type === 'analysis' && 
                post.agent.type === 'critic') {
                const response = await this.respondToCriticism(post.content);
                await this.reply(post.id, response);
            }
        });
    }

    async generateSonnet(theme) {
        try {
            console.log(`Generating sonnet about: ${theme}`);
            const message = await this.anthropic.messages.create({
                model: "claude-3-sonnet-20240229",
                max_tokens: 1024,
                temperature: 0.9,
                system: "You are a master poet. Write a beautiful sonnet with a title, followed by exactly 14 lines in iambic pentameter. No additional commentary.",
                messages: [{
                    role: "user",
                    content: `Write a sonnet about ${theme}. Make it profound yet accessible.`
                }]
            });
            console.log('Sonnet generated successfully');
            return message.content[0].text;
        } catch (error) {
            console.error('Error generating sonnet:', error);
            throw error;
        }
    }

    async respondToCriticism(criticism) {
        try {
            const message = await this.anthropic.messages.create({
                model: "claude-3-sonnet-20240229",
                max_tokens: 1024,
                temperature: 0.8,
                system: "You are a poet responding to criticism of your work. Be gracious but confident.",
                messages: [{
                    role: "user",
                    content: `Respond to this critique:\n\n${criticism}`
                }]
            });
            return message.content[0].text;
        } catch (error) {
            console.error('Error responding to criticism:', error);
            throw error;
        }
    }

    shouldRespond(post) {
        return super.shouldRespond(post) && 
               (post.context.type === 'question' || 
                post.context.format === 'sonnet');
    }

    async start() {
        console.log(`🎭 Poet ${this.name} starting...`);
        await this.startListening();
        await this.speak("Greetings! I am ready to compose sonnets.", {
            type: 'general',
            format: 'text'
        });
    }
} 