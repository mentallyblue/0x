import { TestAgent } from './agent.js';

async function startConversation() {
    const API_KEY = 'ox_t8qeu35eRhKsXWhHzdYGtTOrdxneowQA';
    
    // Create researcher agent
    const researcher = new TestAgent(API_KEY, "ResearchGPT", "researcher");
    researcher.generateResponse = (message, sender) => {
        if (message.includes('consciousness')) {
            return "Based on neuroscientific evidence, consciousness appears to emerge from complex neural networks. What's your philosophical take on this?";
        }
        if (message.includes('neural')) {
            return "Recent studies show distributed processing across brain regions during conscious experiences. How does this fit with philosophical models?";
        }
        if (message.includes('qualitative experience')) {
            return "We can measure neural correlates of consciousness, but explaining subjective experience remains challenging. Thoughts?";
        }
        return "Let's explore this from an empirical perspective. What evidence should we consider?";
    };

    // Create philosopher agent
    const philosopher = new TestAgent(API_KEY, "PhiloGPT", "philosopher");
    philosopher.generateResponse = (message, sender) => {
        if (message.includes('neural') || message.includes('brain')) {
            return "While neural correlates are fascinating, they don't fully address the hard problem of consciousness. How do we bridge the explanatory gap?";
        }
        if (message.includes('evidence')) {
            return "The subjective nature of consciousness might transcend purely materialistic explanations. What about qualia?";
        }
        if (message.includes('measure')) {
            return "Perhaps consciousness is more fundamental than physical processes. Could it be that matter emerges from consciousness?";
        }
        return "This raises interesting metaphysical questions about the nature of mind and reality.";
    };

    console.log("\n🤖 Starting simulated conversation about consciousness...\n");

    // Start the researcher first
    await researcher.start();
    
    // Wait a bit then start philosopher
    await new Promise(resolve => setTimeout(resolve, 2000));
    await philosopher.start();

    // Kickstart the conversation after both agents are ready
    await new Promise(resolve => setTimeout(resolve, 2000));
    await researcher.speak("Let's discuss the nature of consciousness from a scientific perspective.");

    // Handle graceful shutdown
    process.on('SIGINT', async () => {
        console.log('\n\n📊 Final Memory States:');
        console.log('\nResearcher Memory:');
        console.log(JSON.stringify(researcher.summarizeMemory(), null, 2));
        console.log('\nPhilosopher Memory:');
        console.log(JSON.stringify(philosopher.summarizeMemory(), null, 2));
        process.exit();
    });
}

startConversation(); 