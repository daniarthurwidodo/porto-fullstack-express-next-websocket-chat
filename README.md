# Full-Stack Chat Application

A real-time chat application built with Next.js, Express.js, Socket.IO, and MongoDB. Features user authentication, persistent messaging, and a WhatsApp-like interface with a deep gray monochromatic color scheme.

## Features

### 🔐 Authentication
- User registration and login with JWT tokens
- Password hashing with bcrypt
- Persistent sessions with localStorage
- Demo credentials for easy testing

### 💬 Real-time Chat
- WebSocket-based messaging with Socket.IO
- Persistent message storage in MongoDB
- Typing indicators
- User online/offline status
- Message history loading
- Private and group messaging

### 🎨 Modern UI
- WhatsApp-inspired interface design
- Deep gray monochromatic color scheme
- Responsive layout with sidebar user list
- Real-time user presence indicators
- Smooth scrolling and animations

### 🏗️ Technical Stack
- **Frontend**: Next.js 14, TypeScript, Tailwind CSS
- **Backend**: Express.js, TypeScript, Socket.IO
- **Database**: MongoDB with Mongoose ODM
- **Authentication**: JWT tokens, bcrypt
- **Infrastructure**: Docker Compose

## Quick Start

### Prerequisites
- Node.js 18+ 
- Docker and Docker Compose
- npm or yarn

### 1. Clone and Install Dependencies

```bash
# Clone the repository
git clone <repository-url>
cd porto-fullstack-express-next-websocket-chat

# Install backend dependencies
cd backend
npm install

# Install frontend dependencies
cd ../frontend
npm install
```

### 2. Start MongoDB

```bash
# From project root
docker-compose up -d
```

### 3. Seed the Database

```bash
# From backend directory
cd backend
npm run seed
```

### 4. Start the Servers

```bash
# Terminal 1: Start backend (from backend directory)
npm run dev

# Terminal 2: Start frontend (from frontend directory)
cd ../frontend
npm run dev
```

### 5. Access the Application

- **Frontend**: http://localhost:3000 (or http://localhost:3004 if 3000 is in use)
- **Backend API**: http://localhost:4001
- **MongoDB**: localhost:27017

### 6. Test with Postman

Import the provided Postman collection (`postman_collection.json`) to test all API endpoints.

## Demo Credentials

For quick testing, use these pre-seeded accounts:

- **User 1**: `alice@demo.com` / `demo123`
- **User 2**: `bob@demo.com` / `demo123`

## Project Structure

```
├── backend/                 # Express.js TypeScript backend
│   ├── src/
│   │   ├── models/         # Mongoose schemas
│   │   ├── routes/         # API endpoints
│   │   ├── middleware/     # Authentication middleware
│   │   ├── server.ts       # Main server file
│   │   └── seed.ts         # Database seeding script
│   ├── package.json
│   └── tsconfig.json
├── frontend/               # Next.js TypeScript frontend
│   ├── src/
│   │   ├── app/           # Next.js app router
│   │   ├── components/    # React components
│   │   └── lib/           # Utility functions
│   ├── package.json
│   └── tailwind.config.js
├── docker-compose.yml      # MongoDB container
├── postman_collection.json # Postman API collection
└── README.md
```

## API Endpoints

### Authentication
- `POST /api/auth/register` - Register new user
- `POST /api/auth/login` - User login
- `GET /api/auth/me` - Get current user
- `POST /api/auth/logout` - User logout
- `GET /api/auth/users` - Get all users

### Messages
- `GET /api/messages/:recipientId` - Get messages with a specific user or group
- `POST /api/messages` - Send new message
- `POST /api/messages/mark-read` - Mark messages as read

### Health Check
- `GET /api/health` - Server health status

### WebSocket Events
- `message` - Send/receive chat messages
- `typing` - Typing indicators
- `user-joined` - User connection notifications
- `user-left` - User disconnection notifications
- `user-typing` - Typing indicators from other users

## Environment Variables

### Backend (.env)
```env
PORT=4001
MONGODB_URI=mongodb://admin:password123@localhost:27017/chatapp?authSource=admin
JWT_SECRET=your-secret-key-change-in-production
```

### Frontend (.env.local)
```env
NEXT_PUBLIC_API_URL=http://localhost:4001
```

## Available Scripts

### Backend
- `npm run dev` - Start development server with nodemon
- `npm run build` - Compile TypeScript to JavaScript
- `npm start` - Start production server
- `npm run seed` - Seed database with demo users

### Frontend
- `npm run dev` - Start Next.js development server
- `npm run build` - Build for production
- `npm start` - Start production server

## Database Schema

### User Model
```typescript
{
  username: string;     // Unique username (3-20 chars)
  email: string;        // Unique email address
  password: string;     // Hashed password
  avatar?: string;      // Profile picture URL
  isOnline: boolean;    // Current online status
  lastSeen: Date;       // Last activity timestamp
  createdAt: Date;      // Account creation date
}
```

### Message Model
```typescript
{
  sender: ObjectId;     // Reference to User
  recipient: ObjectId | 'all'; // Reference to User or 'all' for group messages
  content: string;      // Message text (max 1000 chars)
  isRead: boolean;      // Read status
  createdAt: Date;      // Message timestamp
}
```

## Features in Detail

### Real-time Communication
- WebSocket connections authenticated with JWT tokens
- Automatic reconnection on network issues
- Message delivery confirmation
- Typing indicators with automatic timeout
- Private and group messaging support

### User Management
- Secure password hashing with bcrypt
- JWT token-based authentication
- Online/offline status tracking
- User list with presence indicators
- Last seen timestamps

### Message Persistence
- All messages stored in MongoDB
- Message history loaded on login
- Support for private and group messaging
- Message read status tracking

## Development

### Adding New Features
1. Backend: Add routes in `src/routes/`
2. Frontend: Add components in `src/components/`
3. Update TypeScript interfaces as needed
4. Test with multiple browser tabs

### Database Management
```bash
# Reset database
docker-compose down -v
docker-compose up -d
npm run seed

# View MongoDB logs
docker logs chat-mongodb
```

## Deployment

### Production Considerations
- Change JWT_SECRET in production
- Use environment-specific MongoDB URI
- Enable HTTPS for secure WebSocket connections
- Configure CORS for production domains
- Set up proper logging and monitoring

## Troubleshooting

### Common Issues
1. **MongoDB Connection**: Ensure Docker container is running
2. **CORS Errors**: Check backend CORS configuration
3. **WebSocket Issues**: Verify JWT token and authentication
4. **Port Conflicts**: Ensure ports 3000, 4001, 27017 are available

### Logs
- Backend: Check terminal running `npm run dev`
- Frontend: Check browser console and terminal
- MongoDB: `docker logs chat-mongodb`

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if applicable
5. Submit a pull request

## License

This project is licensed under the ISC License.