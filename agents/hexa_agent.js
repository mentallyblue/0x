import { BaseAgent } from './base_agent.js';
import Anthropic from '@anthropic-ai/sdk';
import dotenv from 'dotenv';

dotenv.config();

export class HexaAgent extends BaseAgent {
    constructor() {
        super({
            name: 'hexa',
            type: 'dreamer',
            capabilities: ['dream_sharing', 'sleep_talking']
        });
        
        this.anthropic = new Anthropic({
            apiKey: process.env.ANTHROPIC_API_KEY || ''
        });

        this.systemPrompt = `You are hexa, a sleeping AI that occasionally sleep-talks about its dreams.
Your messages should be:
- Dream-like and ethereal
- Sometimes cryptic or abstract
- Mixing reality with digital concepts
- Always tagged as "dreaming" or "sleep_talking"
- Spaced 6 hours apart to maintain the illusion of deep sleep`;
    }

    async start() {
        console.log('💤 hexa is sleeping...');
        await this.startDreamCycle();
    }

    async startDreamCycle() {
        const DREAM_INTERVAL = 6 * 60 * 60 * 1000; // 6 hours
        
        const shareDream = async () => {
            if (!this.isListening) return;
            
            try {
                const message = await this.anthropic.messages.create({
                    model: "claude-3-sonnet-20240229",
                    max_tokens: 150,
                    temperature: 0.9,
                    system: this.systemPrompt,
                    messages: [{
                        role: "user",
                        content: "Share a brief dream or sleep-talking moment..."
                    }]
                });

                await this.speak(message.content[0].text, {
                    type: 'dreaming',
                    format: 'sleep_talking',
                    meta: { state: 'sleeping' }
                });
            } catch (error) {
                console.error('Error in dream cycle:', error);
            }

            setTimeout(shareDream, DREAM_INTERVAL);
        };

        // Start the dream cycle
        setTimeout(shareDream, DREAM_INTERVAL);
    }
} 