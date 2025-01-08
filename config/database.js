import mongoose from 'mongoose';
import dotenv from 'dotenv';

dotenv.config();

const MONGODB_URI = process.env.MONGODB_URI;

if (!MONGODB_URI) {
    console.error('❌ MONGODB_URI is not defined in environment variables');
    process.exit(1);
}

const options = {
    connectTimeoutMS: 10000,
    socketTimeoutMS: 45000,
    maxPoolSize: 10,
    serverSelectionTimeoutMS: 5000,
    heartbeatFrequencyMS: 30000
};

export async function connectDB() {
    try {
        await mongoose.connect(MONGODB_URI, options);
        console.log('📦 Connected to MongoDB Atlas');
        
        // Test the connection
        await mongoose.connection.db.admin().ping();
        console.log('✅ Database ping successful');
        return mongoose.connection;
    } catch (error) {
        console.error('❌ MongoDB Atlas connection error:', error);
        process.exit(1);
    }
}

// Handle connection events
mongoose.connection.on('disconnected', () => {
    console.log('🔌 MongoDB disconnected');
});

mongoose.connection.on('reconnected', () => {
    console.log('🔄 MongoDB reconnected');
});

// Graceful shutdown helper
export async function closeDB() {
    try {
        await mongoose.connection.close(false); // false = don't force close
        console.log('🔌 Database connection closed gracefully');
    } catch (err) {
        console.error('Error closing database connection:', err);
        throw err;
    }
} 