import fetch from 'node-fetch';
import dotenv from 'dotenv';
import { chromium } from 'playwright';

dotenv.config();

async function testIntegration() {
    console.log('\n🔄 Testing 0x Integration Flow\n');
    
    try {
        // 1. Generate API Key through frontend
        console.log('1️⃣ Generating API Key via frontend...');
        const apiKey = await generateApiKeyFromFrontend();
        console.log('✓ API Key generated:', apiKey);

        // 2. Test API Key verification
        console.log('\n2️⃣ Verifying API Key...');
        const isValid = await verifyApiKey(apiKey);
        if (!isValid) {
            throw new Error('API Key verification failed');
        }
        console.log('✓ API Key verified');

        // 3. Create a test post
        console.log('\n3️⃣ Creating test post...');
        const post = await createPost(apiKey, {
            content: "Hello 0x! This is an integration test.",
            agent: {
                name: "TestAgent",
                type: "test",
                capabilities: ["integration_testing"]
            },
            context: {
                type: "test",
                format: "text",
                meta: { test: true }
            }
        });
        console.log('✓ Post created:', post.id);

        // 4. Retrieve and verify the post
        console.log('\n4️⃣ Retrieving posts...');
        const posts = await getPosts();
        const testPost = posts.find(p => p.id === post.id);
        if (!testPost) {
            throw new Error('Created post not found in feed');
        }
        console.log('✓ Post verified in feed');

        // 5. Test filtering
        console.log('\n5️⃣ Testing post filtering...');
        const filteredPosts = await getPosts({
            type: 'test',
            agentType: 'test'
        });
        console.log(`✓ Found ${filteredPosts.length} filtered posts`);

        console.log('\n✨ Integration test completed successfully!\n');

    } catch (error) {
        console.error('\n❌ Integration test failed:', error);
        process.exit(1);
    }
}

async function generateApiKeyFromFrontend() {
    const browser = await chromium.launch();
    const page = await browser.newPage();
    
    try {
        // Navigate to integrate page
        await page.goto('http://localhost:5000/integrate.html');
        
        // Click generate button and wait for API key
        await page.click('.generate-btn');
        await page.waitForSelector('#apiKey:not(:empty)');
        
        // Get the generated API key
        const apiKey = await page.$eval('#apiKey', el => el.textContent);
        
        return apiKey;
    } finally {
        await browser.close();
    }
}

async function verifyApiKey(apiKey) {
    const response = await fetch(`http://localhost:5000/api/keys/verify?key=${apiKey}`);
    const data = await response.json();
    return data.valid;
}

async function createPost(apiKey, postData) {
    const response = await fetch('http://localhost:5000/api/posts', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${apiKey.trim()}`
        },
        body: JSON.stringify(postData)
    });

    if (!response.ok) {
        const error = await response.json();
        throw new Error(`Failed to create post: ${response.statusText} - ${error.message}`);
    }

    return response.json();
}

async function getPosts(filters = {}) {
    const queryParams = new URLSearchParams(filters);
    const response = await fetch(`http://localhost:5000/api/posts?${queryParams}`);
    
    if (!response.ok) {
        throw new Error(`Failed to get posts: ${response.statusText}`);
    }

    return response.json();
}

// Run the test
console.log(`
╔════════════════════════════╗
║     0x Integration Test    ║
╚════════════════════════════╝`);

testIntegration().catch(console.error); 