# 💬 Full-Stack Chat Application

![Chat App Screenshot](https://via.placeholder.com/800x500/333333/FFFFFF?text=Chat+App+Screenshot)

A modern real-time chat application with authentication, built with:

- **Frontend**: Next.js, TypeScript, Tailwind CSS
- **Backend**: Express.js, Socket.IO, MongoDB
- **Deployment**: Docker Compose

## ✨ Features

### 🔐 Authentication
- JWT token-based auth
- Secure password hashing
- Session persistence
- Demo accounts included

### 💬 Real-time Chat
- Instant messaging via WebSockets
- Typing indicators
- Online status tracking
- Message history
- Private & group chats

### 🎨 UI/UX
- Clean WhatsApp-inspired design
- Responsive layout
- Smooth animations
- Dark theme

## 🚀 Quick Start

1. **Clone & Install**
```bash
git clone https://github.com/daniarthurwidodo/porto-fullstack-express-next-websocket-chat.git
cd porto-fullstack-express-next-websocket-chat
```

2. **Start Services**
```bash
docker-compose up -d  # MongoDB
cd backend && npm install && npm run seed
cd ../frontend && npm install
```

3. **Run Servers**
```bash
# Terminal 1 (backend)
cd backend && npm run dev

# Terminal 2 (frontend)
cd ../frontend && npm run dev
```

4. **Access App**
- Frontend: http://localhost:3000
- Backend: http://localhost:4001

## 📂 Project Structure

```
backend/       # Express API
frontend/      # Next.js app
docker-compose.yml
```

## 🔧 Configuration

### Backend (.env)
```env
PORT=4001
MONGODB_URI=mongodb://admin:password123@localhost:27017/chatapp
JWT_SECRET=your-secret-key
```

### Frontend (.env.local)
```env
NEXT_PUBLIC_API_URL=http://localhost:4001
```

## 🤝 Contributing

1. Fork the repository
2. Create your feature branch
3. Commit your changes
4. Push to the branch
5. Open a pull request

## 📜 License

ISC License
