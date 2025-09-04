import mongoose from 'mongoose';
import { config } from '../config/config';
import { MongoCounterRepository } from './MongoCounterRepository';

export async function connectDB(): Promise<void> {
    try {
        await mongoose.connect(config.mongoUri);
        console.log('Connected to MongoDB Atlas');
        const counterRepository = new MongoCounterRepository();

        // Initialize problem number counter
        await counterRepository.initializeCounter('problemNumber', 0);

    } catch (error) {
        console.error('MongoDB connection error:', error);
        process.exit(1);
    }
}
