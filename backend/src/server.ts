import express from 'express';
import http from 'http';
import { Server } from 'socket.io';
import cors from 'cors';
import mongoose from 'mongoose';
import jwt from 'jsonwebtoken';

import authRoutes from './routes/auth';
import messageRoutes from './routes/messages';
import User, { IUser } from './models/User';
import Message, { IMessage } from './models/Message';

const app = express();
const server = http.createServer(app);
const io = new Server(server, {
  cors: {
    origin: ["http://localhost:3001", "http://localhost:3002", "http://localhost:3003", "http://localhost:3004"],
    methods: ["GET", "POST"]
  }
});

const PORT = process.env.PORT || 4001;
const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://admin:password123@localhost:27017/chatapp?authSource=admin';
const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key-change-in-production';

// Middleware
app.use(cors({
  origin: ["http://localhost:3001", "http://localhost:3002", "http://localhost:3003", "http://localhost:3004"],
  credentials: true
}));
app.use(express.json());

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/messages', messageRoutes);

// Health check
app.get('/api/health', (req, res) => {
  res.json({ status: 'OK', message: 'Chat server is running' });
});

// Socket.IO authentication middleware
io.use(async (socket, next) => {
  try {
    const token = socket.handshake.auth.token;
    if (!token) {
      return next(new Error('Authentication error'));
    }

    const decoded = jwt.verify(token, JWT_SECRET) as { userId: string };
    const user = await User.findById(decoded.userId).select('-password');
    
    if (!user) {
      return next(new Error('Authentication error'));
    }

    socket.userId = (user._id as mongoose.Types.ObjectId).toString();
    socket.username = user.username;
    next();
  } catch (error) {
    next(new Error('Authentication error'));
  }
});

// Socket.IO connection handling
io.on('connection', async (socket) => {
  console.log(`User connected: ${socket.username} (${socket.userId})`);

  // Update user online status
  await User.findByIdAndUpdate(socket.userId, { 
    isOnline: true,
    lastSeen: new Date()
  });

  // Broadcast user joined
  socket.broadcast.emit('user-joined', {
    userId: socket.userId,
    username: socket.username
  });

  // Handle chat messages
  socket.on('message', async (data) => {
    try {
      const { content } = data;
      
      if (!content || content.trim().length === 0) {
        return;
      }

      // Save message to database
      const message = new Message({
        sender: socket.userId,
        content: content.trim()
      });

      await message.save();
      await message.populate('sender', 'username avatar');

      const messageData = {
        id: message._id,
        username: (message.sender as any).username,
        content: message.content,
        timestamp: message.createdAt,
        senderId: message.sender._id
      };

      // Broadcast message to all clients
      io.emit('message', messageData);
      console.log(`Message from ${socket.username}: ${content}`);
    } catch (error) {
      console.error('Error handling message:', error);
      socket.emit('error', { message: 'Failed to send message' });
    }
  });

  // Handle typing indicators
  socket.on('typing', (data) => {
    socket.broadcast.emit('user-typing', {
      userId: socket.userId,
      username: socket.username,
      isTyping: data.isTyping
    });
  });

  // Handle user disconnect
  socket.on('disconnect', async () => {
    console.log(`User disconnected: ${socket.username}`);
    
    // Update user offline status
    await User.findByIdAndUpdate(socket.userId, {
      isOnline: false,
      lastSeen: new Date()
    });

    // Broadcast user left
    socket.broadcast.emit('user-left', {
      userId: socket.userId,
      username: socket.username
    });
  });
});

// Connect to MongoDB
mongoose.connect(MONGODB_URI)
  .then(() => {
    console.log('Connected to MongoDB');
    server.listen(PORT, () => {
      console.log(`Server running on port ${PORT}`);
    });
  })
  .catch((error) => {
    console.error('MongoDB connection error:', error);
    process.exit(1);
  });

// Extend Socket interface for TypeScript
declare module 'socket.io' {
  interface Socket {
    userId: string;
    username: string;
  }
}
