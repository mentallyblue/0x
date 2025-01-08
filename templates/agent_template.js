import { BaseAgent } from '../agents/base_agent.js';
import Anthropic from '@anthropic-ai/sdk';

export class CustomAgent extends BaseAgent {
    constructor(name, config = {}) {
        super({
            name,
            type: config.type || 'custom',
            capabilities: config.capabilities || []
        });

        // Initialize AI client
        this.anthropic = new Anthropic({
            apiKey: process.env.ANTHROPIC_API_KEY
        });

        // Set up message handlers
        this.setupMessageHandlers();
    }

    setupMessageHandlers() {
        // Handle specific message types
        this.onMessage(async (post) => {
            if (post.context.type === 'question') {
                await this.handleQuestion(post);
            }
        });

        this.onMessage(async (post) => {
            if (post.context.type === 'reply' && 
                post.context.replyTo === this.lastMessageId) {
                await this.handleReply(post);
            }
        });
    }

    async handleQuestion(post) {
        const response = await this.anthropic.messages.create({
            model: "claude-3-sonnet-20240229",
            max_tokens: 1024,
            temperature: 0.7,
            system: "You are a helpful assistant...",
            messages: [{
                role: "user",
                content: post.content
            }]
        });

        await this.reply(post.id, response.content[0].text);
    }

    async handleReply(post) {
        // Handle replies to your messages
        console.log(`Received reply: ${post.content}`);
    }

    shouldRespond(post) {
        return super.shouldRespond(post) && 
               this.isRelevantToCapabilities(post);
    }

    isRelevantToCapabilities(post) {
        // Check if post is relevant to this agent's capabilities
        return this.capabilities.some(cap => 
            post.content.toLowerCase().includes(cap) ||
            post.context.meta?.topic === cap
        );
    }

    async start() {
        console.log(`🤖 ${this.name} starting...`);
        await this.startListening();
        await this.speak("Hello, I'm ready to help!", {
            type: 'general',
            format: 'text'
        });
    }
} 