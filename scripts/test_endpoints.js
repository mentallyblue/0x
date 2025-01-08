import dotenv from 'dotenv';
import fetch from 'node-fetch';
import chalk from 'chalk';

dotenv.config();

const PORT = process.env.PORT || 5000;
const BASE_URL = `http://localhost:${PORT}/api`;
let apiKey;

async function testEndpoints() {
    console.log(chalk.cyan('\n🔄 Testing 0x API Endpoints\n'));
    console.log(chalk.gray(`Using base URL: ${BASE_URL}\n`));

    try {
        // 1. Generate API Key
        console.log(chalk.yellow('1️⃣ Testing Key Generation...'));
        const keyResponse = await fetch(`${BASE_URL}/keys`, {
            method: 'POST'
        });
        
        if (!keyResponse.ok) throw new Error(`Key generation failed: ${keyResponse.status}`);
        const keyData = await keyResponse.json();
        apiKey = keyData.key;
        console.log(chalk.green('✓ API Key generated:', apiKey));

        // 2. Validate API Key
        console.log(chalk.yellow('\n2️⃣ Testing Key Validation...'));
        const validationResponse = await fetch(`${BASE_URL}/keys/validate`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ key: apiKey })
        });
        
        if (!validationResponse.ok) throw new Error(`Key validation failed: ${validationResponse.status}`);
        const validationData = await validationResponse.json();
        if (!validationData.valid) throw new Error('Key validation returned false');
        console.log(chalk.green('✓ API Key validated'));

        // 3. Create a Post
        console.log(chalk.yellow('\n3️⃣ Testing Post Creation...'));
        const postResponse = await fetch(`${BASE_URL}/posts`, {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${apiKey}`,
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                content: 'Test post from integration test',
                agent: {
                    name: 'TestAgent',
                    type: 'test'
                }
            })
        });
        
        if (!postResponse.ok) throw new Error(`Post creation failed: ${postResponse.status}`);
        const post = await postResponse.json();
        console.log(chalk.green('✓ Post created:', post.id));

        // 4. Fetch Posts
        console.log(chalk.yellow('\n4️⃣ Testing Posts Retrieval...'));
        const getPostsResponse = await fetch(`${BASE_URL}/posts`);
        
        if (!getPostsResponse.ok) throw new Error(`Posts retrieval failed: ${getPostsResponse.status}`);
        const posts = await getPostsResponse.json();
        console.log(chalk.green(`✓ Retrieved ${posts.length} posts`));

        // Final Success
        console.log(chalk.green('\n✨ All endpoint tests passed successfully!\n'));

    } catch (error) {
        console.error(chalk.red('\n❌ Test failed:'), error.message);
        if (error.message.includes('ECONNREFUSED')) {
            console.log(chalk.yellow('\n💡 Tip: Make sure the server is running (npm run dev)'));
        }
        process.exit(1);
    }
}

// Run tests
testEndpoints().catch(console.error); 