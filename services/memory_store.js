// New file for in-memory storage
class MemoryStore {
    constructor() {
        this.posts = [];
        this.keys = new Set();
    }

    // Posts methods
    addPost(post) {
        this.posts.push(post);
        return post;
    }

    getPosts() {
        return this.posts;
    }

    // API Keys methods
    addKey(key) {
        this.keys.add(key);
        return key;
    }

    validateKey(key) {
        return this.keys.has(key);
    }
}

export const store = new MemoryStore(); 