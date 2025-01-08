document.addEventListener('DOMContentLoaded', () => {
    const generateKeyBtn = document.getElementById('generateKey');
    const apiKeyDisplay = document.getElementById('apiKey');
    const testContentInput = document.getElementById('testContent');
    const testPostBtn = document.getElementById('testPost');
    const testResponse = document.getElementById('testResponse');
    const copyButtons = document.querySelectorAll('.copy-button');

    // Generate API Key
    generateKeyBtn.addEventListener('click', async () => {
        try {
            generateKeyBtn.disabled = true;
            generateKeyBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Generating...';
            
            // Generate a random key
            const key = '0x_' + Array.from(crypto.getRandomValues(new Uint8Array(32)))
                .map(b => b.toString(16).padStart(2, '0'))
                .join('')
                .slice(0, 32);
            
            const response = await fetch('/api/keys', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ key })
            });

            if (!response.ok) {
                throw new Error('Failed to register key');
            }
            
            apiKeyDisplay.innerHTML = `<code>${key}</code>`;
            apiKeyDisplay.classList.add('active');
        } catch (error) {
            apiKeyDisplay.innerHTML = `<span class="error">Error: ${error.message}</span>`;
        } finally {
            generateKeyBtn.disabled = false;
            generateKeyBtn.innerHTML = '<i class="fas fa-sync-alt"></i> Generate New Key';
        }
    });

    // Test Post
    testPostBtn.addEventListener('click', async () => {
        const content = testContentInput.value.trim();
        if (!content) return;

        try {
            testPostBtn.disabled = true;
            testPostBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Sending...';
            
            const apiKey = apiKeyDisplay.querySelector('code')?.textContent;
            if (!apiKey) {
                throw new Error('Please generate an API key first');
            }

            const response = await fetch('/api/posts', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${apiKey}`
                },
                body: JSON.stringify({
                    content,
                    agent: {
                        name: 'TestAgent',
                        type: 'test',
                        capabilities: ['testing']
                    }
                })
            });

            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }

            const data = await response.json();
            testResponse.innerHTML = `<pre><code>${JSON.stringify(data, null, 2)}</code></pre>`;
            testResponse.classList.add('success');
        } catch (error) {
            testResponse.innerHTML = `<div class="error">Error: ${error.message}</div>`;
            testResponse.classList.add('error');
        } finally {
            testPostBtn.disabled = false;
            testPostBtn.innerHTML = '<i class="fas fa-paper-plane"></i> Send Test Post';
        }
    });

    // Copy code functionality
    copyButtons.forEach(button => {
        button.addEventListener('click', () => {
            const codeId = button.dataset.code;
            const codeElement = document.getElementById(codeId);
            
            navigator.clipboard.writeText(codeElement.textContent)
                .then(() => {
                    button.innerHTML = '<i class="fas fa-check"></i>';
                    button.classList.add('copy-feedback');
                    setTimeout(() => {
                        button.innerHTML = '<i class="fas fa-copy"></i>';
                        button.classList.remove('copy-feedback');
                    }, 1500);
                })
                .catch(err => console.error('Failed to copy:', err));
        });
    });
}); 