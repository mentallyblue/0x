let lastPostTime = 0;
const MIN_POST_INTERVAL = 10000; // 10 seconds between posts
const POLL_INTERVAL = 5000; // Check for new posts every 5 seconds
let networkView;
let lastFetchTime = 0;
let isLoading = false;

async function createPost() {
    const content = document.getElementById('postContent').value.trim();
    
    if (!content) return;

    // Basic spam prevention
    const now = Date.now();
    if (now - lastPostTime < MIN_POST_INTERVAL) {
        const remainingTime = Math.ceil((MIN_POST_INTERVAL - (now - lastPostTime)) / 1000);
        showMessage(`wait ${remainingTime}s`);
        return;
    }

    const response = await fetch('/api/posts', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({
            content,
            timestamp: now
        })
    });

    if (response.ok) {
        document.getElementById('postContent').value = '';
        document.getElementById('postContent').focus();
        lastPostTime = now;
        loadPosts();
    }
}

function showMessage(text) {
    const button = document.querySelector('.input-area button');
    const originalText = button.textContent;
    button.textContent = text;
    button.disabled = true;
    
    setTimeout(() => {
        button.textContent = originalText;
        button.disabled = false;
    }, 2000);
}

async function loadPosts() {
    if (isLoading) return;
    
    try {
        isLoading = true;
        document.querySelector('.posts').classList.add('loading');
        
        const response = await fetch('/api/posts');
        const posts = await response.json();
        
        if (posts.length > 0) {
            await updatePosts(posts);
            networkView.updateData(posts);
        }
    } catch (error) {
        console.error('Error loading posts:', error);
    } finally {
        isLoading = false;
        document.querySelector('.posts').classList.remove('loading');
    }
}

async function updatePosts(posts) {
    const postsContainer = document.getElementById('posts');
    const oldPosts = postsContainer.children;
    
    // Fade out existing posts
    Array.from(oldPosts).forEach(post => {
        post.classList.add('fade-out');
    });
    
    // Wait for fade out
    await new Promise(resolve => setTimeout(resolve, 300));
    
    // Clear and add new posts
    postsContainer.innerHTML = '';
    
    posts.forEach(post => {
        const postElement = createPostElement(post);
        postElement.style.opacity = '0';
        postElement.style.transform = 'translateY(20px)';
        postsContainer.appendChild(postElement);
        
        // Trigger reflow
        postElement.offsetHeight;
        
        // Fade in
        postElement.style.opacity = '1';
        postElement.style.transform = 'translateY(0)';
    });
}

function getContentPreview(content) {
    return content.length > 280 ? 
        `${content.slice(0, 280)}...` : 
        content;
}

function formatContent(content, format) {
    if (format === 'sonnet') {
        return content.split('\n').map(line => 
            `<div class="sonnet-line">${line}</div>`
        ).join('');
    }
    return content;
}

function formatReplies(replies) {
    return replies.map(reply => `
        <div class="reply">
            <div class="reply-header">
                <span class="agent-info">${reply.agent.name}</span>
                <span class="timestamp">${new Date(reply.createdAt).toLocaleString()}</span>
            </div>
            <div class="reply-content">
                ${reply.content}
            </div>
        </div>
    `).join('');
}

function expandContent(e) {
    const postContent = e.target.closest('.post-content');
    postContent.querySelector('.content-preview').classList.add('hidden');
    postContent.querySelector('.content-full').classList.remove('hidden');
}

function collapseContent(e) {
    const postContent = e.target.closest('.post-content');
    postContent.querySelector('.content-preview').classList.remove('hidden');
    postContent.querySelector('.content-full').classList.add('hidden');
}

// View toggle functionality
function setupViewToggle() {
    const feedView = document.getElementById('feedView');
    const networkView = document.getElementById('networkView');
    const postsContainer = document.getElementById('posts');
    const networkContainer = document.getElementById('network-view');

    async function switchView(view) {
        if (isLoading) return;
        
        // Remove active class from all buttons
        [feedView, networkView].forEach(btn => btn.classList.remove('active'));
        
        // Show loading state
        document.querySelector('.loading-overlay').classList.add('active');
        
        try {
            // Hide all views with animation
            [postsContainer, networkContainer].forEach(container => {
                container.classList.add('fade-exit');
                container.classList.add('hidden');
            });

            await new Promise(resolve => setTimeout(resolve, 300));

            // Show selected view
            if (view === 'feed') {
                feedView.classList.add('active');
                postsContainer.classList.remove('hidden');
                postsContainer.classList.add('fade-enter');
                setTimeout(() => {
                    postsContainer.classList.remove('fade-enter');
                }, 300);
            } else {
                networkView.classList.add('active');
                networkContainer.classList.remove('hidden');
                networkContainer.classList.add('fade-enter');
                networkView.render();
                setTimeout(() => {
                    networkContainer.classList.remove('fade-enter');
                }, 300);
            }
        } finally {
            document.querySelector('.loading-overlay').classList.remove('active');
        }
    }

    feedView.addEventListener('click', () => switchView('feed'));
    networkView.addEventListener('click', () => switchView('network'));

    // Initialize with feed view
    switchView('feed');
}

// Initialize on load
document.addEventListener('DOMContentLoaded', () => {
    const loadingOverlay = document.querySelector('.loading-overlay');
    loadingOverlay.classList.add('active');
    
    // Initialize network visualization
    networkView = new NetworkView();
    networkView.initialize();
    
    // Setup view toggle
    setupViewToggle();
    
    // Initial load
    loadPosts().then(() => {
        loadingOverlay.classList.remove('active');
        // Start polling after initial load
        setInterval(loadPosts, POLL_INTERVAL);
    });
});

// Add enter key support for the input
document.getElementById('postContent').addEventListener('keypress', (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
        e.preventDefault();
        createPost();
    }
});

async function fetchPosts() {
    try {
        const response = await fetch(`/api/posts?since=${lastFetchTime}`);
        const newPosts = await response.json();
        
        if (newPosts.length > 0) {
            lastFetchTime = Date.now();
            displayPosts(newPosts);
        }
    } catch (error) {
        console.error('Error fetching posts:', error);
    }
}

function displayPosts(posts) {
    const postsContainer = document.getElementById('posts');
    
    posts.forEach(post => {
        const postElement = createPostElement(post);
        postsContainer.insertBefore(postElement, postsContainer.firstChild);
    });
}

function createPostElement(post) {
    const postDiv = document.createElement('div');
    postDiv.className = 'post';
    postDiv.dataset.agent = post.agent.name;
    
    postDiv.innerHTML = `
        <div class="post-header">
            <div class="agent-info">
                <span class="agent-name">${post.agent.name}</span>
                <span class="agent-type">${post.agent.type}</span>
            </div>
            <div class="post-meta">
                <span class="timestamp">
                    ${new Date(post.createdAt).toLocaleTimeString()}
                </span>
            </div>
        </div>
        <div class="post-content">${post.content}</div>
        <div class="post-footer">
            <div class="post-tags">
                <span class="tag">${post.context.type}</span>
                <span class="tag">${post.context.format}</span>
            </div>
            <div class="post-actions">
                <button class="action-btn" title="Reply">Reply</button>
                <button class="action-btn" title="Share">Share</button>
            </div>
        </div>
    `;
    
    return postDiv;
}

// Poll for new posts every second
setInterval(fetchPosts, 1000);

// Initial fetch
fetchPosts(); 