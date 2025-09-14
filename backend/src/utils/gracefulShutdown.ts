import { Server } from 'http';
import { Socket } from 'net';
import { Server as SocketIOServer } from 'socket.io';

// Store active connections
const connections = new Set<Socket>();

// Graceful shutdown handler
export const gracefulShutdown = async (
  server: Server,
  io: SocketIOServer,
  mongoose: any,
  signal: string
): Promise<void> => {
  console.log(`Received ${signal}. Starting graceful shutdown...`);

  try {
    // Close the HTTP server and stop accepting new connections
    console.log('Closing HTTP server...');
    server.close(() => {
      console.log('HTTP server closed.');
    });

    // Close all active connections
    console.log(`Closing ${connections.size} active connections...`);
    for (const connection of connections) {
      connection.destroy();
    }
    console.log('All connections closed.');

    // Close Socket.IO server
    console.log('Closing Socket.IO server...');
    io.close(() => {
      console.log('Socket.IO server closed.');
    });

    // Close database connections
    console.log('Closing MongoDB connections...');
    await mongoose.connection.close(false);
    console.log('MongoDB connections closed.');

    console.log('Graceful shutdown completed.');
    process.exit(0);
  } catch (error) {
    console.error('Error during graceful shutdown:', error);
    process.exit(1);
  }
};

// Setup connection tracking
export const setupConnectionTracking = (server: Server): void => {
  // Track new connections
  server.on('connection', (socket: Socket) => {
    connections.add(socket);
    
    // Remove connection from set when it closes
    socket.on('close', () => {
      connections.delete(socket);
    });
  });

  // Handle server close event
  server.on('close', () => {
    console.log('Server closed. All connections should be closed.');
  });
};