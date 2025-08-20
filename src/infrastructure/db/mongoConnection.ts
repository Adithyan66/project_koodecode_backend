import mongoose from 'mongoose';
import { config } from '../config/config';

export async function connectDB(): Promise<void> {
    try {
        await mongoose.connect(config.mongoUri);
        console.log('Connected to MongoDB Atlas');
    } catch (error) {
        console.error('MongoDB connection error:', error);
        process.exit(1);
    }
}
