import { Key } from '../models/Key.js';

export const keyStore = {
    async add(key) {
        try {
            await Key.create({ key });
            return true;
        } catch (error) {
            console.error('Error adding key:', error);
            return false;
        }
    },
    
    async verify(key) {
        try {
            const keyDoc = await Key.findOne({ key, isActive: true });
            if (keyDoc) {
                // Update usage statistics
                await Key.updateOne(
                    { _id: keyDoc._id },
                    { 
                        $inc: { usageCount: 1 },
                        $set: { lastUsed: new Date() }
                    }
                );
                return true;
            }
            return key.startsWith('test_'); // Allow test keys
        } catch (error) {
            console.error('Error verifying key:', error);
            return false;
        }
    }
}; 