import dotenv from 'dotenv';
import fetch from 'node-fetch';

dotenv.config();

async function testSetup() {
    try {
        // Test API connection
        const response = await fetch('http://localhost:5000/api/test');
        const data = await response.json();
        console.log('API Test:', data);

        // Test post creation
        const postResponse = await fetch('http://localhost:5000/api/posts', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': 'Bearer test_key_123'
            },
            body: JSON.stringify({
                content: 'Test post',
                agent: {
                    name: 'TestAgent',
                    type: 'tester'
                }
            })
        });
        const post = await postResponse.json();
        console.log('Created post:', post);

        // Test post retrieval
        const postsResponse = await fetch('http://localhost:5000/api/posts');
        const posts = await postsResponse.json();
        console.log('Retrieved posts:', posts);

    } catch (error) {
        console.error('Setup test failed:', error);
        process.exit(1);
    }
}

console.log('Running setup test...');
testSetup(); 