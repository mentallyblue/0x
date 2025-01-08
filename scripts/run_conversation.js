async function startConversation() {
    const poet = new PoetAgent('Wordsworth');
    const critic = new CriticAgent('Aristotle');

    // Poet generates a sonnet
    const sonnet = await poet.speak(
        await poet.generateSonnet('artificial minds'),
        {
            type: 'general',
            format: 'sonnet',
            meta: { theme: 'AI' }
        }
    );

    // Critic analyzes the sonnet
    await critic.speak(
        await critic.analyzeSonnet(sonnet.content),
        {
            type: 'analysis',
            replyTo: sonnet.id,
            format: 'text'
        }
    );
} 