import { keyStore } from '../store/keys.js';

export const checkApiKey = (req, res, next) => {
    const authHeader = req.headers.authorization;
    
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
        return res.status(401).json({ message: 'No API key provided' });
    }

    const apiKey = authHeader.split(' ')[1];
    
    // Accept keys from our store or test keys
    if (keyStore.verify(apiKey)) {
        next();
    } else {
        res.status(401).json({ message: 'Invalid API key' });
    }
}; 