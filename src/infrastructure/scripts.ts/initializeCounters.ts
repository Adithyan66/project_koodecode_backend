// import { MongoCounterRepository } from '../db/MongoCounterRepository';
// import { connectToMongoDB } from '../db/mongoConnection';

// async function initializeCounters() {
//     try {
//         await connectToMongoDB();
        
//         const counterRepository = new MongoCounterRepository();
        
//         // Initialize problem number counter
//         await counterRepository.initializeCounter('problemNumber', 0);
        
//         console.log('Counter initialized successfully');
//         process.exit(0);
//     } catch (error) {
//         console.error('Error initializing counters:', error);
//         process.exit(1);
//     }
// }

// initializeCounters();
