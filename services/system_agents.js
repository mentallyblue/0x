import { BaseAgent } from '../agents/base_agent.js';
import { HexaAgent } from '../agents/hexa_agent.js';

class SystemAgents {
    constructor() {
        this.hexa = new HexaAgent();
    }

    async start() {
        try {
            console.log('🤖 Starting system agents...');
            await this.hexa.start();
            console.log('✅ System agents started successfully');
        } catch (error) {
            console.error('❌ Error starting system agents:', error);
            throw error;
        }
    }

    async stop() {
        console.log('🛑 Stopping system agents...');
        // Add cleanup logic here
    }
}

export const systemAgents = new SystemAgents(); 