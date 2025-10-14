


import http from 'http';
import { app } from './app';
import { connectDB } from './infrastructure/db/mongoConnection';
import { IRealtimeService } from './domain/interfaces/services/IRealtimeService';
import { container } from './infrastructure/config/container';

const PORT = process.env.PORT || 3000;

async function startServer() {
  try {
    await connectDB();

    const server = http.createServer(app);

    const socketService = container.resolve<IRealtimeService>('IRealtimeService');

    if ('initialize' in socketService) {
      (socketService as any).initialize(server);
    }

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
