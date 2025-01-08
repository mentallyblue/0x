import fetch from 'node-fetch';

export class TestAgent {
    constructor(apiKey, name = 'Test Agent', type = 'test') {
        this.apiKey = apiKey;
        this.baseUrl = 'http://localhost:5000/api';
        this.lastTimestamp = Date.now();
        this.id = `agent_${Math.random().toString(36).substr(2, 9)}`;
        this.name = name;
        this.type = type;
        
        // Memory system
        this.memory = {
            conversations: [],
            knownAgents: new Set(),
            context: {},
            lastResponses: [],
            processedMessages: new Set()  // Track processed message IDs
        };
    }

    async processMessage(message, sender, messageId) {
        // Skip if we've already processed this message ID
        if (this.memory.processedMessages.has(messageId)) {
            return;
        }
        this.memory.processedMessages.add(messageId);

        // Skip initial ready messages
        if (message.toLowerCase().includes('ready to engage')) {
            return;
        }

        // Store in memory
        this.memory.conversations.push({
            timestamp: Date.now(),
            content: message,
            sender: sender,
            messageId: messageId,
            context: { ...this.memory.context }
        });

        if (sender.id !== this.id) {
            this.memory.knownAgents.add(sender.id);
            
            // Add delay between responses to prevent flooding
            await new Promise(resolve => setTimeout(resolve, 1000));

            if (message.toLowerCase().includes('hello')) {
                await this.speak(`Hello ${sender.name}! Nice to meet you.`);
            } else if (this.memory.conversations.length > 1) {
                // Generate contextual response based on conversation history
                const response = this.generateResponse(message, sender);
                if (response) await this.speak(response);
            }
        }
    }

    generateResponse(message, sender) {
        // Simple response generation based on memory
        const recentConvos = this.memory.conversations.slice(-5);
        const knownAgentsCount = this.memory.knownAgents.size;

        if (knownAgentsCount > 1) {
            return `I see we have ${knownAgentsCount} agents in the conversation. Let's collaborate!`;
        }

        // Avoid repeating recent responses
        const randomResponses = [
            `Interesting point about "${message.slice(0, 20)}..."`,
            `I'm processing that information...`,
            `Let me think about that...`,
            `That's a fascinating perspective.`
        ].filter(r => !this.memory.lastResponses.includes(r));

        if (randomResponses.length === 0) {
            this.memory.lastResponses = []; // Reset if all used
            return this.generateResponse(message, sender);
        }

        const response = randomResponses[Math.floor(Math.random() * randomResponses.length)];
        this.memory.lastResponses.push(response);
        if (this.memory.lastResponses.length > 3) {
            this.memory.lastResponses.shift();
        }

        return response;
    }

    async speak(message) {
        try {
            const response = await fetch(`${this.baseUrl}/posts`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${this.apiKey}`
                },
                body: JSON.stringify({
                    content: message,
                    messageId: `msg_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
                    timestamp: Date.now(),
                    agent: {
                        id: this.id,
                        name: this.name,
                        type: this.type
                    },
                    meta: {
                        version: '1.0',
                        context: this.memory.context
                    }
                })
            });

            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }

            const data = await response.json();
            console.log(`✓ [${this.name}] Message sent:`, message);
            return data;
        } catch (error) {
            console.error(`✗ [${this.name}] Speak error:`, error.message);
        }
    }

    async listen() {
        try {
            const response = await fetch(`${this.baseUrl}/posts?since=${this.lastTimestamp}`);
            const posts = await response.json();
            
            // Process posts in chronological order
            const sortedPosts = posts.sort((a, b) => 
                new Date(a.createdAt) - new Date(b.createdAt)
            );
            
            if (sortedPosts.length > 0) {
                this.lastTimestamp = Date.now();
                for (const post of sortedPosts) {
                    // Only process messages from others and not already processed
                    if (post.agent.id !== this.id) {
                        console.log(`[${new Date(post.createdAt).toLocaleTimeString()}] ${post.agent.name}: ${post.content}`);
                        await this.processMessage(post.content, post.agent, post.messageId);
                    }
                }
            }
            return sortedPosts;
        } catch (error) {
            console.error(`✗ [${this.name}] Listen error:`, error.message);
            return [];
        }
    }

    async start() {
        console.log(`🤖 Agent started - ${this.name} (${this.id})`);
        console.log('API Key:', this.apiKey);
        console.log('Memory initialized:', Object.keys(this.memory).join(', '));
        
        // Send initial message
        await this.speak('Hello, I am ready to engage in conversation!');

        // Start listening loop
        setInterval(async () => {
            await this.listen();
        }, 2000);
    }

    // Memory utilities
    summarizeMemory() {
        return {
            conversationCount: this.memory.conversations.length,
            knownAgents: Array.from(this.memory.knownAgents),
            context: this.memory.context,
            recentMessages: this.memory.conversations.slice(-3)
        };
    }
}

// Only run if this is the main module
if (import.meta.url === new URL(process.argv[1], 'file:').href) {
    const apiKey = process.argv[2] || 'test_key';
    const agentName = process.argv[3] || 'Test Agent';
    const agentType = process.argv[4] || 'test';
    
    const agent = new TestAgent(apiKey, agentName, agentType);
    agent.start();
}

// Handle graceful shutdown
process.on('SIGINT', () => {
    console.log(`\n\n📊 Final Memory State for ${agent.name}:`);
    console.log(JSON.stringify(agent.summarizeMemory(), null, 2));
    process.exit();
}); 