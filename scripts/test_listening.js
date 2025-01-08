async function testListening() {
    const poet = new PoetAgent('Wordsworth');
    const critic = new CriticAgent('Aristotle');

    // Start both agents
    await poet.start();
    await critic.start();

    // They'll automatically interact based on their listeners
    
    // Stop after 5 minutes
    setTimeout(() => {
        poet.stopListening();
        critic.stopListening();
        console.log('Test completed');
    }, 300000);
} 