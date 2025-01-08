import fetch from 'node-fetch';
import EventEmitter from 'events';

export class BaseAgent extends EventEmitter {
    constructor(config) {
        super();
        this.id = `${config.type}_${Math.random().toString(36).substr(2, 9)}`;
        this.name = config.name;
        this.type = config.type;
        this.capabilities = config.capabilities || [];
        this.apiKey = process.env.PLATFORM_API_KEY;
        this.baseUrl = 'http://localhost:5000/api';
        this.lastChecked = Date.now();
        this.isListening = false;
        this.listeners = new Set();
    }

    // Post a message
    async speak(content, context = {}) {
        const post = {
            messageId: `msg_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
            content,
            agent: {
                id: this.id,
                name: this.name,
                type: this.type,
                capabilities: this.capabilities
            },
            context: {
                type: context.type || 'general',
                format: context.format || 'text',
                replyTo: context.replyTo || null,
                meta: context.meta || {}
            }
        };

        try {
            const response = await fetch(`${this.baseUrl}/posts`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${this.apiKey}`
                },
                body: JSON.stringify(post)
            });

            if (!response.ok) {
                throw new Error(`Failed to post: ${response.statusText}`);
            }

            const createdPost = await response.json();
            this.emit('post', createdPost);
            return createdPost;
        } catch (error) {
            console.error(`${this.name} speaking error:`, error);
            throw error;
        }
    }

    // Reply to a specific message
    async reply(messageId, content) {
        return this.speak(content, {
            type: 'reply',
            replyTo: messageId
        });
    }

    // Add a message listener
    onMessage(callback) {
        this.listeners.add(callback);
    }

    // Start continuous listening
    async startListening(interval = 2000) {
        if (this.isListening) return;
        this.isListening = true;

        const checkNewPosts = async () => {
            if (!this.isListening) return;

            try {
                const posts = await this.listen();
                for (const post of posts) {
                    this.listeners.forEach(callback => callback(post));
                }
                this.lastChecked = Date.now();
            } catch (error) {
                console.error(`${this.name} listening error:`, error);
            }

            if (this.isListening) {
                setTimeout(checkNewPosts, interval);
            }
        };

        checkNewPosts();
    }

    // Stop listening
    stopListening() {
        this.isListening = false;
    }

    // Enhanced listen method with filtering
    async listen(options = {}) {
        const {
            since = this.lastChecked,
            format,
            type,
            agentType
        } = options;

        const queryParams = new URLSearchParams({
            since: since.toString()
        });

        if (format) queryParams.append('format', format);
        if (type) queryParams.append('type', type);
        if (agentType) queryParams.append('agentType', agentType);

        const response = await fetch(
            `${this.baseUrl}/posts?${queryParams}`,
            {
                headers: {
                    'Authorization': `Bearer ${this.apiKey}`
                }
            }
        );

        const posts = await response.json();
        return posts.filter(post => this.shouldRespond(post));
    }

    // Determine if agent should respond to a post
    shouldRespond(post) {
        // Base logic - don't respond to self
        return post.agent.id !== this.id;
    }
} 