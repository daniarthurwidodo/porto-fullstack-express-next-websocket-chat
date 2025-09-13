# Backend - Chat Application API

Express.js TypeScript backend with Socket.IO for real-time messaging, JWT authentication, and MongoDB integration.

## Features

- **Authentication**: JWT-based user registration and login
- **Real-time Messaging**: Socket.IO WebSocket connections
- **Database**: MongoDB with Mongoose ODM
- **Security**: Password hashing with bcrypt, CORS protection
- **TypeScript**: Full type safety and modern ES features

## Tech Stack

- **Runtime**: Node.js
- **Framework**: Express.js
- **Language**: TypeScript
- **Database**: MongoDB with Mongoose
- **Authentication**: JWT tokens, bcrypt
- **Real-time**: Socket.IO
- **Development**: Nodemon, ts-node

## Quick Start

### Prerequisites
- Node.js 18+
- MongoDB (via Docker or local installation)

### Installation

```bash
# Install dependencies
npm install

# Start MongoDB (from project root)
cd ..
docker-compose up -d

# Seed database with demo users
npm run seed

# Start development server
npm run dev
```

### Environment Variables

Create a `.env` file:

```env
PORT=4001
MONGODB_URI=mongodb://admin:password123@localhost:27017/chatapp?authSource=admin
JWT_SECRET=your-secret-key-change-in-production
```

## Available Scripts

- `npm run dev` - Start development server with hot reload
- `npm run build` - Compile TypeScript to JavaScript
- `npm start` - Start production server
- `npm run seed` - Seed database with demo users

## API Endpoints

### Authentication Routes (`/api/auth`)

#### POST `/api/auth/register`
Register a new user.

**Request Body:**
```json
{
  "username": "string (3-20 chars)",
  "email": "string (valid email)",
  "password": "string (min 6 chars)"
}
```

**Response:**
```json
{
  "message": "User created successfully",
  "token": "jwt_token",
  "user": {
    "id": "user_id",
    "username": "username",
    "email": "email",
    "avatar": "avatar_url",
    "isOnline": true
  }
}
```

#### POST `/api/auth/login`
Authenticate user and get token.

**Request Body:**
```json
{
  "email": "string",
  "password": "string"
}
```

**Response:**
```json
{
  "message": "Login successful",
  "token": "jwt_token",
  "user": {
    "id": "user_id",
    "username": "username",
    "email": "email",
    "avatar": "avatar_url",
    "isOnline": true
  }
}
```

#### GET `/api/auth/me`
Get current authenticated user.

**Headers:**
```
Authorization: Bearer <jwt_token>
```

**Response:**
```json
{
  "user": {
    "id": "user_id",
    "username": "username",
    "email": "email",
    "avatar": "avatar_url",
    "isOnline": true
  }
}
```

#### POST `/api/auth/logout`
Logout user and update offline status.

**Headers:**
```
Authorization: Bearer <jwt_token>
```

#### GET `/api/auth/users`
Get list of all users except current user.

**Headers:**
```
Authorization: Bearer <jwt_token>
```

**Response:**
```json
{
  "users": [
    {
      "id": "user_id",
      "username": "username",
      "email": "email",
      "avatar": "avatar_url",
      "isOnline": boolean,
      "lastSeen": "timestamp"
    }
  ]
}
```

### Message Routes (`/api/messages`)

#### GET `/api/messages`
Get message history (last 100 messages).

**Headers:**
```
Authorization: Bearer <jwt_token>
```

**Response:**
```json
{
  "messages": [
    {
      "_id": "message_id",
      "sender": {
        "_id": "user_id",
        "username": "username",
        "avatar": "avatar_url"
      },
      "content": "message_text",
      "messageType": "text",
      "createdAt": "timestamp"
    }
  ]
}
```

#### POST `/api/messages`
Send a new message.

**Headers:**
```
Authorization: Bearer <jwt_token>
```

**Request Body:**
```json
{
  "content": "string (max 1000 chars)"
}
```

## WebSocket Events

### Client to Server

#### `message`
Send a chat message.
```json
{
  "content": "message_text"
}
```

#### `typing`
Send typing indicator.
```json
{
  "isTyping": boolean
}
```

### Server to Client

#### `message`
Receive a chat message.
```json
{
  "id": "message_id",
  "username": "sender_username",
  "content": "message_text",
  "timestamp": "iso_timestamp",
  "senderId": "sender_id"
}
```

#### `user-joined`
User connected notification.
```json
{
  "userId": "user_id",
  "username": "username"
}
```

#### `user-left`
User disconnected notification.
```json
{
  "userId": "user_id",
  "username": "username"
}
```

#### `user-typing`
Typing indicator from other users.
```json
{
  "userId": "user_id",
  "username": "username",
  "isTyping": boolean
}
```

## Database Models

### User Schema
```typescript
{
  username: string;     // Unique, 3-20 characters
  email: string;        // Unique, valid email
  password: string;     // Hashed with bcrypt
  avatar?: string;      // Profile picture URL
  isOnline: boolean;    // Current online status
  lastSeen: Date;       // Last activity timestamp
  createdAt: Date;      // Account creation
  updatedAt: Date;      // Last update
}
```

### Message Schema
```typescript
{
  sender: ObjectId;     // Reference to User
  content: string;      // Message text (max 1000 chars)
  messageType: string;  // 'text' or 'system'
  isEdited: boolean;    // Edit status
  editedAt?: Date;      // Edit timestamp
  createdAt: Date;      // Message timestamp
  updatedAt: Date;      // Last update
}
```

## Project Structure

```
src/
├── models/
│   ├── User.ts         # User schema and model
│   └── Message.ts      # Message schema and model
├── routes/
│   ├── auth.ts         # Authentication endpoints
│   └── messages.ts     # Message endpoints
├── middleware/
│   └── auth.ts         # JWT authentication middleware
├── server.ts           # Main server file
└── seed.ts             # Database seeding script
```

## Security Features

- **Password Hashing**: bcrypt with salt rounds
- **JWT Authentication**: Secure token-based auth
- **CORS Protection**: Configured for specific origins
- **Input Validation**: Request body validation
- **Rate Limiting**: Ready for implementation

## Development

### Adding New Routes
1. Create route file in `src/routes/`
2. Import and use in `server.ts`
3. Add authentication middleware if needed
4. Update TypeScript interfaces

### Database Operations
```bash
# Reset database
docker-compose down -v
docker-compose up -d
npm run seed

# View logs
docker logs chat-mongodb
```

### Testing
- Use tools like Postman or Thunder Client
- Test WebSocket connections with Socket.IO client
- Multiple browser tabs for real-time testing

## Deployment

### Production Checklist
- [ ] Set strong JWT_SECRET
- [ ] Configure production MongoDB URI
- [ ] Enable HTTPS
- [ ] Set up proper logging
- [ ] Configure rate limiting
- [ ] Set up monitoring

### Environment Setup
```bash
# Build for production
npm run build

# Start production server
npm start
```

## API Testing

### Postman Collection
Import the provided `postman_collection.json` from the project root to test all API endpoints:

1. Import collection into Postman
2. Set environment variables:
   - `baseUrl`: http://localhost:4001
   - `authToken`: (auto-set after login)
3. Use demo login requests for quick testing

### Manual Testing
```bash
# Health check
curl http://localhost:4001/api/health

# Register user
curl -X POST http://localhost:4001/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{"username":"testuser","email":"test@example.com","password":"password123"}'

# Login demo user
curl -X POST http://localhost:4001/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"alice@demo.com","password":"demo123"}'
```

## Troubleshooting

### Common Issues
1. **MongoDB Connection**: Check Docker container status
2. **JWT Errors**: Verify token format and secret
3. **CORS Issues**: Check allowed origins configuration
4. **WebSocket Auth**: Ensure token is passed in handshake
5. **TypeScript Errors**: Run `npx tsc --noEmit` to check types

### Debug Commands
```bash
# Check MongoDB connection
docker exec -it chat-mongodb mongosh

# View server logs
npm run dev

# Check running processes
netstat -an | findstr :4001

# Type checking
npx tsc --noEmit
```
