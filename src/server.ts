// import { app } from './app';

// import { connectDB } from './infrastructure/db/mongoConnection';

// const PORT = process.env.PORT;


// connectDB()

// app.listen(PORT, () => {
//     console.log(`✅ KoodeCode backend running at http://localhost:${PORT}`);
// });




import http from 'http';
import {app} from './app';
import { connectDB } from './infrastructure/db/mongoConnection';
import { SocketService } from './infrastructure/services/SocketService';

import { MongoRoomRepository } from './infrastructure/db/MongoRoomRepository';
import { MongoRoomActivityRepository } from './infrastructure/db/MongoRoomActivityRepository';
import { MongoProblemRepository } from './infrastructure/db/MongoProblemRepository';

const PORT = process.env.PORT || 3000;

async function startServer() {

  try {

    await connectDB();
    
    const server = http.createServer(app);
    
    const roomRepository = new MongoRoomRepository();
    const roomActivityRepository = new MongoRoomActivityRepository();
    const problemRepository = new MongoProblemRepository();
    
    const socketService = new SocketService(
      server,
      roomRepository,
      problemRepository,
      roomActivityRepository
    );
    
    server.listen(PORT, () => {
      console.log(`Server is running on port ${PORT}`);
      console.log(`Socket.IO server initialized`);
    });
    
  } catch (error) {
    console.error('Failed to start server:', error);
    process.exit(1);
  }
}

startServer();
