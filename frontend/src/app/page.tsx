'use client';

import { useState, useEffect, useRef } from 'react';
import { io, Socket } from 'socket.io-client';
import { authService, User } from '@/lib/auth';
import AuthModal from '@/components/AuthModal';
import UsersList from '@/components/UsersList';
import * as ScrollArea from '@radix-ui/react-scroll-area';
import { Send, LogOut, MessageCircle, Users, Menu } from 'lucide-react';

interface Message {
  id: string;
  username: string;
  content: string;
  timestamp: string;
  senderId: string;
}

export default function Home() {
  const [socket, setSocket] = useState<Socket | null>(null);
  const [user, setUser] = useState<User | null>(null);
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [messages, setMessages] = useState<Message[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const [users, setUsers] = useState<User[]>([]);
  const [typingUsers, setTypingUsers] = useState<string[]>([]);
  const [showUsersList, setShowUsersList] = useState(false);
  const [isConnected, setIsConnected] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const typingTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  useEffect(() => {
    // Check if user is already authenticated
    const checkAuth = async () => {
      const token = authService.getToken();
      if (token) {
        const currentUser = await authService.getCurrentUser();
        if (currentUser) {
          setUser(currentUser);
          setShowAuthModal(false);
          await loadInitialData();
          connectSocket(token);
        }
      }
    };

    checkAuth();
  }, []);

  const loadInitialData = async () => {
    try {
      const [messagesData, usersData] = await Promise.all([
        authService.getMessages(),
        authService.getUsers()
      ]);
      
      const formattedMessages = messagesData.map((msg: any) => ({
        id: msg._id,
        username: msg.sender.username,
        content: msg.content,
        timestamp: msg.createdAt,
        senderId: msg.sender._id
      }));
      
      setMessages(formattedMessages);
      setUsers(usersData);
    } catch (error) {
      console.error('Error loading initial data:', error);
    }
  };

  const connectSocket = (token: string) => {
    const newSocket = io('http://localhost:4001', {
      auth: { token }
    });
    
    newSocket.on('connect', () => {
      setIsConnected(true);
      console.log('Connected to chat server');
    });

    newSocket.on('message', (messageData: Message) => {
      setMessages(prev => [...prev, messageData]);
    });

    newSocket.on('user-joined', (data: { userId: string; username: string }) => {
      const systemMessage: Message = {
        id: Date.now().toString(),
        username: 'System',
        content: `${data.username} joined the chat`,
        timestamp: new Date().toISOString(),
        senderId: 'system'
      };
      setMessages(prev => [...prev, systemMessage]);
      
      // Refresh users list
      authService.getUsers().then(setUsers);
    });

    newSocket.on('user-left', (data: { userId: string; username: string }) => {
      const systemMessage: Message = {
        id: Date.now().toString(),
        username: 'System',
        content: `${data.username} left the chat`,
        timestamp: new Date().toISOString(),
        senderId: 'system'
      };
      setMessages(prev => [...prev, systemMessage]);
      
      // Refresh users list
      authService.getUsers().then(setUsers);
    });

    newSocket.on('user-typing', (data: { userId: string; username: string; isTyping: boolean }) => {
      if (data.isTyping) {
        setTypingUsers(prev => [...prev.filter(u => u !== data.username), data.username]);
      } else {
        setTypingUsers(prev => prev.filter(u => u !== data.username));
      }
    });

    newSocket.on('disconnect', () => {
      setIsConnected(false);
      console.log('Disconnected from chat server');
    });

    setSocket(newSocket);
  };

  const handleAuthSuccess = async (userData: User) => {
    setUser(userData);
    setShowAuthModal(false);
    await loadInitialData();
    const token = authService.getToken();
    if (token) {
      connectSocket(token);
    }
  };

  const handleLogout = async () => {
    if (socket) {
      socket.disconnect();
    }
    await authService.logout();
    setUser(null);
    setSocket(null);
    setMessages([]);
    setUsers([]);
    setIsConnected(false);
    setShowAuthModal(true);
  };

  const sendMessage = () => {
    if (newMessage.trim() && socket) {
      socket.emit('message', { content: newMessage });
      setNewMessage('');
      
      // Stop typing indicator
      socket.emit('typing', { isTyping: false });
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setNewMessage(e.target.value);
    
    if (socket) {
      // Send typing indicator
      socket.emit('typing', { isTyping: true });
      
      // Clear previous timeout
      if (typingTimeoutRef.current) {
        clearTimeout(typingTimeoutRef.current);
      }
      
      // Set new timeout to stop typing indicator
      typingTimeoutRef.current = setTimeout(() => {
        socket.emit('typing', { isTyping: false });
      }, 1000);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      sendMessage();
    }
  };

  const formatTime = (timestamp: string) => {
    return new Date(timestamp).toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit',
      hour12: false
    });
  };

  if (showAuthModal) {
    return (
      <AuthModal
        isOpen={showAuthModal}
        onClose={() => {}}
        onSuccess={handleAuthSuccess}
      />
    );
  }

  return (
    <div className="flex h-screen bg-gray-900 relative">
      {/* Mobile Users Sidebar Overlay */}
      {showUsersList && (
        <div className="fixed inset-0 z-50 lg:hidden">
          <div className="absolute inset-0 bg-black/50" onClick={() => setShowUsersList(false)} />
          <div className="absolute left-0 top-0 h-full w-80 max-w-[85vw]">
            <UsersList 
              users={[...users, user!]} 
              currentUserId={user!.id} 
              onClose={() => setShowUsersList(false)}
            />
          </div>
        </div>
      )}

      {/* Desktop Users Sidebar */}
      <div className="hidden lg:block">
        {user ? (
          <UsersList users={[...users, user]} currentUserId={user.id} />
        ) : (
          <div className="p-4 text-center text-gray-500">
            Please sign in to see users
          </div>
        )}
      </div>

      {/* Main Chat Area */}
      <div className="flex flex-col flex-1 min-w-0">
        {/* Header */}
        <div className="bg-gray-800 border-b border-gray-700 p-3 sm:p-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2 sm:gap-3">
              <button
                onClick={() => setShowUsersList(true)}
                className="lg:hidden text-gray-400 hover:text-white transition-colors p-2 rounded-lg hover:bg-gray-700"
              >
                <Menu size={20} />
              </button>
              <MessageCircle className="text-blue-400 w-5 h-5 sm:w-6 sm:h-6" />
              <h1 className="text-lg sm:text-xl font-semibold text-white truncate">Chat Room</h1>
            </div>
            <button
              onClick={handleLogout}
              className="bg-red-600 hover:bg-red-700 text-white px-3 py-2 sm:px-4 rounded-lg transition-all flex items-center gap-1 sm:gap-2 hover:scale-105 active:scale-95 text-sm sm:text-base"
            >
              <LogOut size={14} className="sm:w-4 sm:h-4" />
              <span className="hidden sm:inline">Logout</span>
            </button>
          </div>
        </div>

        {/* Messages */}
        <ScrollArea.Root className="flex-1">
          <ScrollArea.Viewport className="w-full h-full p-2 sm:p-4">
            <div className="space-y-3 sm:space-y-4">
              {messages.map((msg) => (
                <div
                  key={msg.id}
                  className={`flex ${
                    msg.senderId === user?.id ? 'justify-end' : 'justify-start'
                  }`}
                >
                  <div
                    className={`max-w-[85%] sm:max-w-xs lg:max-w-md px-3 py-2 sm:px-4 sm:py-3 rounded-lg shadow-lg ${
                      msg.senderId === user?.id
                        ? 'bg-blue-600 text-white rounded-br-none'
                        : msg.username === 'System'
                        ? 'bg-gray-700 text-gray-300 text-center text-sm rounded-lg'
                        : 'bg-gray-700 text-white rounded-bl-none'
                    }`}
                  >
                    {msg.username !== 'System' && msg.senderId !== user?.id && (
                      <p className="text-xs text-blue-300 mb-1 font-medium">{msg.username}</p>
                    )}
                    <p className="text-sm leading-relaxed break-words">{msg.content}</p>
                    <p className="text-xs text-gray-300 mt-1 sm:mt-2 opacity-70">
                      {new Date(msg.timestamp).toLocaleTimeString()}
                    </p>
                  </div>
                </div>
              ))}
              <div ref={messagesEndRef} />
            </div>
          </ScrollArea.Viewport>
          <ScrollArea.Scrollbar className="flex select-none touch-none p-0.5 bg-gray-800 transition-colors duration-[160ms] ease-out hover:bg-gray-700 data-[orientation=vertical]:w-2.5 data-[orientation=horizontal]:flex-col data-[orientation=horizontal]:h-2.5" orientation="vertical">
            <ScrollArea.Thumb className="flex-1 bg-gray-600 rounded-[10px] relative before:content-[''] before:absolute before:top-1/2 before:left-1/2 before:-translate-x-1/2 before:-translate-y-1/2 before:w-full before:h-full before:min-w-[44px] before:min-h-[44px]" />
          </ScrollArea.Scrollbar>
        </ScrollArea.Root>

        {/* Typing Indicator */}
        {typingUsers.length > 0 && (
          <div className="px-2 sm:px-4 pb-2">
            <div className="bg-gray-700 text-gray-300 px-3 py-2 rounded-lg text-sm inline-block">
              {typingUsers.join(', ')} {typingUsers.length === 1 ? 'is' : 'are'} typing...
            </div>
          </div>
        )}

        {/* Message Input */}
        <div className="bg-gray-800 border-t border-gray-700 p-2 sm:p-4 safe-area-inset-bottom">
          <div className="flex space-x-2 sm:space-x-3">
            <input
              type="text"
              value={newMessage}
              onChange={handleInputChange}
              onKeyPress={handleKeyPress}
              placeholder="Type a message..."
              className="flex-1 px-3 py-3 sm:px-4 bg-gray-700 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all text-sm sm:text-base"
            />
            <button
              onClick={sendMessage}
              disabled={!newMessage.trim()}
              className="bg-blue-600 hover:bg-blue-700 disabled:bg-gray-600 disabled:cursor-not-allowed text-white font-medium py-3 px-4 sm:px-6 rounded-lg transition-all flex items-center gap-1 sm:gap-2 hover:scale-105 active:scale-95 min-w-[60px] sm:min-w-auto"
            >
              <Send size={16} className="sm:w-4 sm:h-4" />
              <span className="hidden sm:inline">Send</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
