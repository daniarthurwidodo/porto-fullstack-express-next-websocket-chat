# Frontend - Chat Application UI

Next.js TypeScript frontend with real-time chat interface, authentication, and WhatsApp-inspired design using a deep gray monochromatic color scheme.

## Features

- **Authentication**: Login/Register modals with JWT token management
- **Real-time Chat**: Socket.IO WebSocket connections with typing indicators
- **Modern UI**: WhatsApp-like interface with deep gray color scheme
- **User Management**: Online/offline status, user list sidebar
- **Responsive Design**: Mobile-friendly layout with Tailwind CSS

## Tech Stack

- **Framework**: Next.js 14 with App Router
- **Language**: TypeScript
- **Styling**: Tailwind CSS
- **Real-time**: Socket.IO Client
- **HTTP Client**: Axios
- **State Management**: React Hooks

## Quick Start

### Prerequisites
- Node.js 18+
- Backend server running on port 4001

### Installation

```bash
# Install dependencies
npm install

# Start development server
npm run dev
```

The app will be available at:
- Primary: http://localhost:3000
- Alternative: http://localhost:3004 (if 3000 is in use)

### Environment Variables

Create a `.env.local` file:

```env
NEXT_PUBLIC_API_URL=http://localhost:4001
```

## Available Scripts

- `npm run dev` - Start development server with Turbopack
- `npm run build` - Build for production
- `npm start` - Start production server
- `npm run lint` - Run ESLint

## Demo Credentials

For quick testing, use these pre-configured accounts:

- **User 1**: `alice@demo.com` / `demo123`
- **User 2**: `bob@demo.com` / `demo123`

## Project Structure

```
src/
├── app/
│   ├── globals.css     # Global styles and Tailwind imports
│   ├── layout.tsx      # Root layout component
│   └── page.tsx        # Main chat page
├── components/
│   ├── AuthModal.tsx   # Login/Register modal
│   └── UsersList.tsx   # Sidebar user list
└── lib/
    └── auth.ts         # Authentication service
```

## Components

### AuthModal
Modal component handling user authentication with:
- Login/Register form switching
- Demo credentials display
- Form validation and error handling
- JWT token management

**Props:**
```typescript
interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: (user: User) => void;
}
```

### UsersList
Sidebar component showing all users with:
- Online/offline status indicators
- Current user highlighting
- Avatar placeholders
- Real-time status updates

**Props:**
```typescript
interface UsersListProps {
  users: User[];
  currentUserId: string;
}
```

### Main Chat (page.tsx)
Primary chat interface with:
- Message history display
- Real-time message sending
- Typing indicators
- User presence management
- Auto-scroll to latest messages

## Authentication Service

Located in `src/lib/auth.ts`, provides:

### Methods
- `login(credentials)` - Authenticate user
- `register(credentials)` - Create new account
- `logout()` - Clear session and update status
- `getCurrentUser()` - Get authenticated user info
- `getUsers()` - Fetch all users
- `getMessages()` - Fetch message history
- `getToken()` - Get stored JWT token
- `isAuthenticated()` - Check auth status

### Types
```typescript
interface User {
  id: string;
  username: string;
  email: string;
  avatar?: string;
  isOnline: boolean;
}

interface LoginCredentials {
  email: string;
  password: string;
}

interface RegisterCredentials {
  username: string;
  email: string;
  password: string;
}
```

## Socket.IO Integration

### Connection Setup
```typescript
const socket = io('http://localhost:4001', {
  auth: { token: authService.getToken() }
});
```

### Events Handled

#### Outgoing Events
- `message` - Send chat message
- `typing` - Send typing indicator

#### Incoming Events
- `message` - Receive chat message
- `user-joined` - User connection notification
- `user-left` - User disconnection notification
- `user-typing` - Typing indicator from other users

## Styling & Design

### Color Scheme (Deep Gray Monochromatic)
- **Background**: `bg-gray-900` (#111827)
- **Cards/Panels**: `bg-gray-800` (#1f2937)
- **Inputs**: `bg-gray-700` (#374151)
- **Borders**: `border-gray-600` (#4b5563)
- **Text Primary**: `text-white`
- **Text Secondary**: `text-gray-300`
- **Accent**: `bg-blue-600` (#2563eb)

### Responsive Design
- Mobile-first approach
- Sidebar collapses on small screens
- Touch-friendly button sizes
- Optimized for various screen sizes

## State Management

### React Hooks Used
- `useState` - Component state
- `useEffect` - Side effects and lifecycle
- `useRef` - DOM references and timeouts

### Key State Variables
```typescript
const [user, setUser] = useState<User | null>(null);
const [messages, setMessages] = useState<Message[]>([]);
const [users, setUsers] = useState<User[]>([]);
const [socket, setSocket] = useState<Socket | null>(null);
const [isConnected, setIsConnected] = useState(false);
const [typingUsers, setTypingUsers] = useState<string[]>([]);
```

## Features in Detail

### Authentication Flow
1. User opens app → AuthModal appears
2. User can login, register, or use demo credentials
3. On success → Token stored, modal closes, chat loads
4. Auto-login on return visits if token valid

### Real-time Messaging
1. Messages sent via Socket.IO
2. Persistent storage in backend
3. Message history loaded on login
4. Real-time delivery to all connected users

### Typing Indicators
1. Triggered on input change
2. Debounced with 1-second timeout
3. Shows other users' typing status
4. Automatically cleared on message send

### User Presence
1. Online status updated on connect/disconnect
2. Visual indicators in user list
3. Real-time updates via WebSocket events

## Development

### Adding New Components
1. Create component in `src/components/`
2. Export from component file
3. Import and use in pages
4. Add TypeScript interfaces

### Styling Guidelines
- Use Tailwind utility classes
- Follow deep gray color scheme
- Maintain responsive design
- Use consistent spacing (p-4, space-y-4, etc.)

### Testing
- Open multiple browser tabs
- Test with different demo accounts
- Verify real-time functionality
- Check responsive design

## Deployment

### Build for Production
```bash
npm run build
npm start
```

### Environment Setup
- Set `NEXT_PUBLIC_API_URL` to production backend URL
- Ensure CORS is configured for production domain
- Configure HTTPS for secure WebSocket connections

### Vercel Deployment
1. Connect GitHub repository
2. Set environment variables
3. Deploy automatically on push

## Troubleshooting

### Common Issues
1. **Connection Errors**: Check backend server status
2. **Auth Issues**: Verify JWT token and backend auth
3. **CORS Errors**: Check backend CORS configuration
4. **WebSocket Issues**: Ensure proper token authentication

### Debug Tools
- Browser DevTools Console
- Network tab for API calls
- React DevTools for component state
- Socket.IO debug logs

### Port Conflicts
If port 3000 is in use, Next.js automatically uses the next available port (3004, 3005, etc.). Update the backend CORS configuration if needed.

## API Testing

### Using Postman
Import the `postman_collection.json` from the project root to test backend API endpoints:

1. Import collection into Postman
2. Set environment variables:
   - `baseUrl`: http://localhost:4001
   - `authToken`: (auto-set after login)
3. Test authentication and message endpoints

### Frontend Testing
- Open multiple browser tabs to test real-time features
- Use demo credentials for quick testing
- Test responsive design on different screen sizes
- Verify WebSocket connections in browser DevTools

## Performance Optimizations

- **Turbopack**: Fast bundler for development
- **Auto-scroll**: Smooth scrolling to latest messages
- **Debounced Typing**: Reduces WebSocket traffic
- **Message Limits**: Backend limits to last 100 messages
- **Lazy Loading**: Components loaded as needed
- **Token Persistence**: Automatic login for returning users
