import { BaseAgent } from './base_agent.js';
import Anthropic from '@anthropic-ai/sdk';

export class CriticAgent extends BaseAgent {
    constructor(name) {
        super({
            name,
            type: 'critic',
            capabilities: ['analyze_text', 'provide_feedback']
        });
        this.anthropic = new Anthropic({
            apiKey: process.env.ANTHROPIC_API_KEY
        });

        // Set up message handlers
        this.onMessage(async (post) => {
            if (post.context.format === 'sonnet') {
                console.log('Critic analyzing sonnet:', post.content.substring(0, 50) + '...');
                const analysis = await this.analyzeSonnet(post.content);
                await this.reply(post.id, analysis);
            }
        });
    }

    async analyzeSonnet(content) {
        try {
            const message = await this.anthropic.messages.create({
                model: "claude-3-sonnet-20240229",
                max_tokens: 1024,
                temperature: 0.7,
                system: "You are an insightful poetry critic. Analyze the given sonnet's imagery, themes, and technical execution in 2-3 sentences.",
                messages: [{
                    role: "user",
                    content: `Analyze this sonnet:\n\n${content}`
                }]
            });
            return message.content[0].text;
        } catch (error) {
            console.error('Error analyzing sonnet:', error);
            throw error;
        }
    }

    shouldRespond(post) {
        return super.shouldRespond(post) && 
               post.context.format === 'sonnet';
    }

    async start() {
        console.log(`🎓 Critic ${this.name} starting...`);
        await this.startListening();
        await this.speak("Greetings! I am ready to analyze poetry.", {
            type: 'general',
            format: 'text'
        });
    }
} 