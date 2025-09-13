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

// Configure CORS for Express
const corsOptions = {
  origin: [
    'http://localhost:3000',
    'http://localhost:3001',
    'http://localhost:3002',
    'http://localhost:3003',
    'http://localhost:3004',
    'http://localhost:3005'
  ],
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
  credentials: true
};

// Apply CORS to Express
app.use(cors(corsOptions));

// Configure Socket.IO with CORS
const io = new Server(server, {
  cors: {
    origin: corsOptions.origin,
    methods: corsOptions.methods,
    allowedHeaders: corsOptions.allowedHeaders,
    credentials: true
  },
  // Enable HTTP long-polling fallback
  transports: ['websocket', 'polling']
});

const PORT = process.env.PORT || 4001;
const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://admin:password123@localhost:27017/chatapp?authSource=admin';
const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key-change-in-production';

app.use(express.json());

// Handle preflight requests for all routes
app.use((req, res, next) => {
  if (req.method === 'OPTIONS') {
    res.header('Access-Control-Allow-Origin', req.headers.origin || '*');
    res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
    res.header('Access-Control-Allow-Headers', 'Content-Type, Authorization');
    res.header('Access-Control-Allow-Credentials', 'true');
    res.sendStatus(200);
  } else {
    next();
  }
});

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

// Track connected users
const connectedUsers = new Map();

// Helper function to create room name for two users
const createRoomName = (userId1: string, userId2: string): string => {
  const sortedIds = [userId1, userId2].sort();
  return `room_${sortedIds[0]}_${sortedIds[1]}`;
};

// Socket.IO connection handling
io.on('connection', async (socket) => {
  console.log(`User connected: ${socket.username} (${socket.userId})`);

  // Add user to connected users map
  connectedUsers.set(socket.userId, socket.id);

  // Join user to their personal room
  socket.join(`user_${socket.userId}`);

  // Join general room for system notifications
  socket.join('general');

  // Join individual rooms with all existing users
  const allUsers = await User.find({}, '_id');
  for (const user of allUsers) {
    const userIdStr = (user._id as mongoose.Types.ObjectId).toString();
    if (userIdStr !== socket.userId) {
      const roomName = createRoomName(socket.userId, userIdStr);
      socket.join(roomName);
    }
  }

  // Update user online status
  await User.findByIdAndUpdate(socket.userId, {
    isOnline: true,
    lastSeen: new Date()
  });

  // Broadcast user joined to all users in general room
  io.to('general').emit('user-joined', {
    userId: socket.userId,
    username: socket.username
  });

  // Make existing connected users join room with this new user
  for (const [existingUserId, existingSocketId] of connectedUsers) {
    if (existingUserId !== socket.userId) {
      const roomName = createRoomName(socket.userId, existingUserId);
      io.sockets.sockets.get(existingSocketId)?.join(roomName);
    }
  }

  // Send list of online users to the connected user
  const onlineUsers = await User.find(
    { _id: { $in: Array.from(connectedUsers.keys()) } },
    'username avatar isOnline lastSeen'
  );

  socket.emit('online-users', onlineUsers);

  // Handle private messages
  socket.on('private-message', async (data) => {
    try {
      const { content, recipientId } = data;

      if (!content || content.trim().length === 0) {
        return;
      }

      if (!mongoose.Types.ObjectId.isValid(recipientId)) {
        return socket.emit('error', { message: 'Invalid recipient' });
      }

      // Create room name for this user pair
      const roomName = createRoomName(socket.userId, recipientId);

      // Save message to database
      const message = new Message({
        sender: socket.userId,
        recipient: recipientId,
        content: content.trim(),
        isRead: false
      });

      await message.save();
      await message.populate('sender', 'username avatar');
      await message.populate('recipient', 'username avatar');

      const populatedSender = message.sender as unknown as IUser;
      const populatedRecipient = message.recipient as unknown as IUser;

      const messageData = {
        id: message._id,
        content: message.content,
        timestamp: message.createdAt,
        sender: {
          id: populatedSender._id,
          username: populatedSender.username,
          avatar: populatedSender.avatar
        },
        recipient: {
          id: populatedRecipient._id,
          username: populatedRecipient.username,
          avatar: populatedRecipient.avatar
        },
        isRead: message.isRead
      };

      // Emit to both users in their shared room
      io.to(roomName).emit('private-message', messageData);

      console.log(`Private message from ${socket.username} to ${recipientId}: ${content}`);
    } catch (error) {
      console.error('Error handling private message:', error);
      socket.emit('error', { message: 'Failed to send message' });
    }
  });

  // Handle group messages
  socket.on('group-message', async (data) => {
    try {
      const { content } = data;
      
      if (!content || content.trim().length === 0) {
        return;
      }

      // Save message to database
      const message = new Message({
        sender: socket.userId,
        recipient: 'all',
        content: content.trim(),
        isRead: true // Group messages are marked as read by default
      });

      await message.save();
      await message.populate('sender', 'username avatar');

      const populatedSender = message.sender as unknown as IUser;

      const messageData = {
        id: message._id,
        content: message.content,
        timestamp: message.createdAt,
        sender: {
          id: populatedSender._id,
          username: populatedSender.username,
          avatar: populatedSender.avatar
        },
        isRead: true
      };

      // Broadcast to all users in general room
      io.to('general').emit('group-message', messageData);
      
      console.log(`Group message from ${socket.username}: ${content}`);
    } catch (error) {
      console.error('Error handling group message:', error);
      socket.emit('error', { message: 'Failed to send group message' });
    }
  });

  // Handle typing indicators for private messages
  socket.on('private-typing', (data) => {
    const { recipientId, isTyping } = data;

    if (mongoose.Types.ObjectId.isValid(recipientId)) {
      const roomName = createRoomName(socket.userId, recipientId);
      socket.to(roomName).emit('user-typing', {
        userId: socket.userId,
        username: socket.username,
        isTyping,
        isPrivate: true
      });
    }
  });

  // Handle typing indicators for group chat
  socket.on('group-typing', (data) => {
    socket.broadcast.to('general').emit('user-typing', {
      userId: socket.userId,
      username: socket.username,
      isTyping: data.isTyping,
      isPrivate: false
    });
  });

  // Handle message read receipts
  socket.on('message-read', async (data) => {
    try {
      const { messageId } = data;
      
      const message = await Message.findById(messageId);
      if (!message) {
        return socket.emit('error', { message: 'Message not found' });
      }

      // Only mark as read if the current user is the recipient
      if (message.recipient.toString() === socket.userId) {
        message.isRead = true;
        await message.save();
        
        // Notify sender in their shared room
        const roomName = createRoomName(socket.userId, message.sender.toString());
        socket.to(roomName).emit('message-read', { messageId });
      }
    } catch (error) {
      console.error('Error handling read receipt:', error);
    }
  });

  // Handle user disconnect
  socket.on('disconnect', async () => {
    console.log(`User disconnected: ${socket.username}`);
    
    // Remove user from connected users
    connectedUsers.delete(socket.userId);
    
    // Update user offline status
    await User.findByIdAndUpdate(socket.userId, {
      isOnline: false,
      lastSeen: new Date()
    });

    // Broadcast user left to general room
    io.to('general').emit('user-left', {
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
