'use client';

import { useState, useEffect, useRef } from 'react';
import { io, Socket } from 'socket.io-client';
import { authService, User, MessageData } from '@/lib/auth';
import AuthModal from '@/components/AuthModal';
import UsersList from '@/components/UsersList';
import * as ScrollArea from '@radix-ui/react-scroll-area';
import { LogOut, Menu, MessageCircle, Send, User as UserIcon, X, Search } from 'lucide-react';

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
  const [messages, setMessages] = useState<Message[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const [users, setUsers] = useState<User[]>([]);
  const [typingUsers, setTypingUsers] = useState<string[]>([]);
  const [showUsersList, setShowUsersList] = useState(false);
  const [isSending, setIsSending] = useState(false);
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
      
      const formattedMessages = messagesData.map((msg: MessageData) => ({
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
      console.log('Disconnected from chat server');
    });

    setSocket(newSocket);
  };

  const handleAuthSuccess = async (userData: User) => {
    setUser(userData);
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
  };

  const sendMessage = async () => {
    if (newMessage.trim() && socket && !isSending) {
      setIsSending(true);
      try {
        socket.emit('message', { content: newMessage });
        setNewMessage('');

        // Stop typing indicator
        socket.emit('typing', { isTyping: false });

        // Small delay to show sending state
        await new Promise(resolve => setTimeout(resolve, 200));
      } finally {
        setIsSending(false);
      }
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

  const handleKeyPress = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' && newMessage.trim() && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  if (!user) {
    return (
      <AuthModal
        isOpen={true}
        onClose={() => {}}
        onSuccess={handleAuthSuccess}
      />
    );
  }

  return (
    <div className="flex h-screen bg-white text-gray-800">
      {/* Sidebar - Hidden on mobile by default */}
      <div className="hidden md:flex w-80 border-r border-gray-200 bg-white flex-col">
        <div className="p-4 border-b border-gray-200">
          <h1 className="text-xl font-bold text-gray-800">Chats</h1>
        </div>
        <div className="flex-1 overflow-y-auto">
          <UsersList 
            users={users}
            currentUserId={user!.id}
          />
        </div>
      </div>

      {/* Main Chat Area */}
      <div className="flex-1 flex flex-col h-screen relative">

        {/* Mobile Sidebar Toggle Button */}
        <button
          onClick={() => setShowUsersList(true)}
          className="md:hidden fixed bottom-4 right-4 bg-blue-500 text-white p-3 rounded-full shadow-lg z-20 hover:bg-blue-600 transition-colors"
          aria-label="Show users"
        >
          <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"></path>
            <circle cx="9" cy="7" r="4"></circle>
            <path d="M23 21v-2a4 4 0 0 0-3-3.87"></path>
            <path d="M16 3.13a4 4 0 0 1 0 7.75"></path>
          </svg>
        </button>

        {/* Mobile Sidebar Overlay */}
        {showUsersList && (
          <div className="fixed inset-0 z-30 md:hidden">
            <div 
              className="absolute inset-0 bg-black/50" 
              onClick={() => setShowUsersList(false)} 
            />
            <div className="absolute left-0 top-0 h-full w-4/5 max-w-sm bg-white shadow-xl">
              <div className="p-4 border-b border-gray-200 flex justify-between items-center">
                <h2 className="text-xl font-bold">Chats</h2>
                <button 
                  onClick={() => setShowUsersList(false)}
                  className="text-gray-500 hover:text-gray-700"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <line x1="18" y1="6" x2="6" y2="18"></line>
                    <line x1="6" y1="6" x2="18" y2="18"></line>
                  </svg>
                </button>
              </div>
              <UsersList
                users={users}
                currentUserId={user!.id}
                onClose={() => setShowUsersList(false)}
              />
            </div>
          </div>
        )}

        {/* Chat Header */}
        <div className="p-4 border-b border-gray-200 flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <button 
              onClick={() => setShowUsersList(true)}
              className="md:hidden text-gray-500 hover:text-gray-700"
            >
              <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <line x1="3" y1="12" x2="21" y2="12"></line>
                <line x1="3" y1="6" x2="21" y2="6"></line>
                <line x1="3" y1="18" x2="21" y2="18"></line>
              </svg>
            </button>
            <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center">
              <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"></path>
              </svg>
            </div>
            <div>
              <h2 className="font-semibold">General Chat</h2>
              <p className="text-xs text-gray-500">
                {typingUsers.length > 0 ? `${typingUsers[0]} is typing...` : 'Online'}
              </p>
            </div>
          </div>
          <div className="flex items-center space-x-4">
            <button className="text-gray-400 hover:text-gray-600">
              <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <circle cx="12" cy="12" r="1"></circle>
                <circle cx="19" cy="12" r="1"></circle>
                <circle cx="5" cy="12" r="1"></circle>
              </svg>
            </button>
            <button 
              onClick={handleLogout}
              className="text-gray-400 hover:text-gray-600"
            >
              <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"></path>
                <polyline points="16 17 21 12 16 7"></polyline>
                <line x1="21" y1="12" x2="9" y2="12"></line>
              </svg>
            </button>
          </div>
        </div>

        {/* Messages */}
        <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-gray-50">
          {messages.length === 0 ? (
            <div className="h-full flex flex-col items-center justify-center text-gray-400">
              <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mb-4">
                <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"></path>
                </svg>
              </div>
              <p className="text-lg font-medium">No messages yet</p>
              <p className="text-sm">Start the conversation</p>
            </div>
          ) : (
            messages.map((msg) => (
              <div
                key={msg.id}
                className={`flex ${msg.senderId === user?.id ? 'justify-end' : 'justify-start'}`}
              >
                <div
                  className={`max-w-[80%] rounded-2xl p-3 ${
                    msg.senderId === user?.id
                      ? 'bg-blue-500 text-white rounded-br-none'
                      : 'bg-white border border-gray-200 rounded-bl-none shadow-sm'
                  }`}
                >
                  {msg.username !== 'System' && msg.senderId !== user?.id && (
                    <p className="text-xs font-medium text-blue-600 mb-1">
                      {msg.username}
                    </p>
                  )}
                  <p className="text-sm">{msg.content}</p>
                  <p className={`text-xs mt-1 text-right ${
                    msg.senderId === user?.id ? 'text-blue-100' : 'text-gray-400'
                  }`}>
                    {new Date(msg.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </p>
                </div>
              </div>
            ))
          )}
          <div ref={messagesEndRef} />
        </div>

        {/* Message Input */}
        <div className="p-4 border-t border-gray-200 bg-white">
          <div className="flex items-center gap-2">
            <button className="text-gray-400 hover:text-gray-600 p-2">
              <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"></path>
              </svg>
            </button>
            <div className="flex-1 relative">
              <input
                type="text"
                value={newMessage}
                onChange={handleInputChange}
                onKeyPress={handleKeyPress}
                placeholder="Type a message..."
                className="w-full bg-gray-100 border-0 rounded-full py-2 px-4 pr-12 focus:ring-2 focus:ring-blue-500 focus:outline-none transition-all text-sm"
                aria-label="Type your message"
              />
              <div className="absolute right-2 top-1/2 -translate-y-1/2 flex items-center space-x-1">
                <button className="text-gray-400 hover:text-gray-600 p-1">
                  <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <circle cx="11" cy="11" r="8"></circle>
                    <line x1="21" y1="21" x2="16.65" y2="16.65"></line>
                  </svg>
                </button>
                <button
                  onClick={sendMessage}
                  disabled={!newMessage.trim() || isSending}
                  className={`p-1 rounded-full transition-colors ${
                    newMessage.trim() 
                      ? 'text-blue-500 hover:text-blue-600' 
                      : 'text-gray-300 cursor-not-allowed'
                  }`}
                  aria-label="Send message"
                >
                  <svg 
                    xmlns="http://www.w3.org/2000/svg" 
                    width="20" 
                    height="20" 
                    viewBox="0 0 24 24" 
                    fill="none" 
                    stroke="currentColor" 
                    strokeWidth="2" 
                    strokeLinecap="round" 
                    strokeLinejoin="round"
                    className={isSending ? 'animate-pulse' : ''}
                  >
                    <line x1="22" y1="2" x2="11" y2="13"></line>
                    <polygon points="22 2 15 22 11 13 2 9 22 2"></polygon>
                  </svg>
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
