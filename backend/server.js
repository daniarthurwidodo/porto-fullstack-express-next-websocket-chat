const express = require('express');
const http = require('http');
const socketIo = require('socket.io');
const cors = require('cors');

const app = express();
const server = http.createServer(app);
const io = socketIo(server, {
  cors: {
    origin: "http://localhost:3000",
    methods: ["GET", "POST"]
  }
});

app.use(cors());
app.use(express.json());

// Store connected users
const users = new Map();

io.on('connection', (socket) => {
  console.log('User connected:', socket.id);

  // Handle user joining with username
  socket.on('join', (username) => {
    users.set(socket.id, username);
    socket.broadcast.emit('user-joined', username);
    console.log(`${username} joined the chat`);
  });

  // Handle chat messages
  socket.on('message', (data) => {
    const username = users.get(socket.id);
    const messageData = {
      id: Date.now(),
      username,
      message: data.message,
      timestamp: new Date().toISOString()
    };
    
    // Broadcast message to all clients
    io.emit('message', messageData);
    console.log(`Message from ${username}: ${data.message}`);
  });

  // Handle user disconnect
  socket.on('disconnect', () => {
    const username = users.get(socket.id);
    if (username) {
      users.delete(socket.id);
      socket.broadcast.emit('user-left', username);
      console.log(`${username} left the chat`);
    }
  });
});

const PORT = process.env.PORT || 3001;
server.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
