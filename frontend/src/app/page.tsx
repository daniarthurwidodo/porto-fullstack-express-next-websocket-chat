'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import { io, Socket } from 'socket.io-client';
import { authService, User as AuthUser } from '@/lib/auth';
import AuthModal from '@/components/AuthModal';
import UsersList from '@/components/UsersList';
import * as ScrollArea from '@radix-ui/react-scroll-area';
import { LogOut, Menu, MessageCircle, Send, User as UserIcon, X, Search, Users } from 'lucide-react';

// Extend the User type to include _id
type User = AuthUser & { _id: string; };

interface Message {
  _id: string;
  id: string;
  content: string;
  sender: User;
  senderId: string;
  recipient?: User;
  recipientId?: string;
  isGroup: boolean;
  isRead: boolean;
  createdAt: string | Date;
  updatedAt?: string | Date;
  timestamp?: string | Date;
}

interface ActiveChat {
  id: string;
  name: string;
  isGroup: boolean;
  avatar?: string;
  lastSeen?: string;
}

export default function Home() {
  const [socket, setSocket] = useState<Socket | null>(null);
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const [users, setUsers] = useState<User[]>([]);
  const [typingUsers, setTypingUsers] = useState<Array<{
    userId: string;
    username: string;
    isPrivate: boolean;
  }>>([]);
  const [showUsersList, setShowUsersList] = useState(false);
  const [isSending, setIsSending] = useState(false);
  const [activeChat, setActiveChat] = useState<ActiveChat | null>(null);
  const [isTyping, setIsTyping] = useState(false);
  const [onlineUsers, setOnlineUsers] = useState<Set<string>>(new Set());
  const [isConnected, setIsConnected] = useState(false);
  
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const typingTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const messageInputRef = useRef<HTMLInputElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  // Format message for display
  const formatMessage = useCallback((messageData: any): Message => {
    const sender = messageData.sender || {
      _id: messageData.senderId,
      id: messageData.senderId,
      username: messageData.username || 'Unknown',
      email: messageData.email || '',
      avatar: messageData.avatar,
      isOnline: false
    };
    
    const isGroup = messageData.recipient === 'all' || messageData.isGroup;
    
    return {
      _id: messageData._id || messageData.id,
      id: messageData._id || messageData.id,
      content: messageData.content,
      sender,
      senderId: messageData.senderId,
      recipient: messageData.recipient,
      recipientId: messageData.recipientId,
      isGroup,
      isRead: messageData.isRead || false,
      createdAt: messageData.createdAt || new Date(),
      updatedAt: messageData.updatedAt,
      timestamp: messageData.timestamp || messageData.createdAt || new Date()
    };
  }, []);

  // Handle new incoming messages
  const handleNewMessage = useCallback((messageData: any) => {
    const formattedMessage = formatMessage(messageData);
    setMessages(prev => [...prev, formattedMessage]);
    
    // Mark as read if it's a private message to the current user
    if (formattedMessage.recipientId && 
        formattedMessage.recipientId === currentUser?._id) {
      socket?.emit('message-read', { messageId: formattedMessage.id });
    }
  }, [formatMessage, socket, currentUser?._id]);

  // Handle typing indicators
  const handleTyping = useCallback((data: { userId: string; username: string; isTyping: boolean; isPrivate: boolean }) => {
    setTypingUsers(prev => {
      if (data.isTyping) {
        // Add to typing users if not already present
        if (!prev.some(u => u.userId === data.userId && u.isPrivate === data.isPrivate)) {
          return [...prev, { 
            userId: data.userId, 
            username: data.username, 
            isPrivate: data.isPrivate 
          }];
        }
        return prev;
      } else {
        // Remove from typing users
        return prev.filter(u => u.userId !== data.userId || u.isPrivate !== data.isPrivate);
      }
    });
  }, []);

  // Handle user status changes
  const handleUserStatus = useCallback((data: { userId: string; username: string }, status: 'joined' | 'left') => {
    setUsers(prev =>
      prev.map(user =>
        user.id === data.userId
          ? { ...user, isOnline: status === 'joined' }
          : user
      )
    );

    if (status === 'joined') {
      setOnlineUsers(prev => new Set([...prev, data.userId]));
    } else {
      setOnlineUsers(prev => {
        const newSet = new Set(prev);
        newSet.delete(data.userId);
        return newSet;
      });
    }
  }, []);

  // Connect to WebSocket
  const connectSocket = useCallback((token: string) => {
    const newSocket = io('http://localhost:4001', {
      auth: { token },
      transports: ['websocket', 'polling']
    });

    newSocket.on('connect', () => {
      console.log('Connected to WebSocket server');
      setIsConnected(true);
    });

    newSocket.on('disconnect', () => {
      setIsConnected(false);
    });

    // Set up event listeners
    const onPrivateMessage = (data: any) => handleNewMessage({ ...data, isGroup: false });
    const onGroupMessage = (data: any) => handleNewMessage({ ...data, isGroup: true });
    
    newSocket.on('private-message', onPrivateMessage);
    newSocket.on('group-message', onGroupMessage);
    newSocket.on('user-typing', handleTyping);
    newSocket.on('user-joined', (data: any) => handleUserStatus(data, 'joined'));
    newSocket.on('user-left', (data: any) => handleUserStatus(data, 'left'));
    newSocket.on('online-users', (users: any[]) => {
      const userIds = users.filter(u => u.isOnline).map(u => u._id || u.id);
      setOnlineUsers(new Set(userIds));
    });
    newSocket.on('message-read', (data: { messageId: string }) => {
      setMessages(prev => 
        prev.map(msg => 
          msg.id === data.messageId ? { ...msg, isRead: true } : msg
        )
      );
    });

    setSocket(newSocket);
    
    // Cleanup function
    return () => {
      newSocket.off('private-message', onPrivateMessage);
      newSocket.off('group-message', onGroupMessage);
      newSocket.off('user-typing', handleTyping);
      newSocket.off('user-joined');
      newSocket.off('user-left');
      newSocket.off('online-users');
      newSocket.off('message-read');
      newSocket.disconnect();
    };
  }, [handleNewMessage, handleTyping, handleUserStatus]);

  // Load initial data
  const loadInitialData = useCallback(async () => {
    try {
      const [usersData, messagesData] = await Promise.all([
        authService.getUsers(),
        authService.getMessages()
      ]);
      
      // Transform users to include _id and ensure they match our User type
      const typedUsers = usersData.map(user => ({
        ...user,
        _id: user.id,
        isOnline: onlineUsers.has(user.id)
      } as User));
      
      setUsers(typedUsers);
      
      if (messagesData) {
        // Transform messages to include proper types
        const formattedMessages = messagesData.map((msg: any) => {
          const sender = typedUsers.find(u => u._id === msg.senderId) || 
            { _id: msg.senderId, id: msg.senderId, username: 'Unknown', email: '', isOnline: false } as User;
          
          const recipient = msg.recipientId === 'all' ? 'all' : 
            (typedUsers.find(u => u._id === msg.recipientId) || 
              { _id: msg.recipientId, id: msg.recipientId, username: 'Unknown', email: '', isOnline: false } as User);
          
          return {
            _id: msg.id || msg._id,
            id: msg.id || msg._id,
            content: msg.content,
            sender,
            senderId: msg.senderId,
            recipient,
            recipientId: msg.recipientId,
            isGroup: msg.recipientId === 'all' || msg.isGroup,
            isRead: msg.isRead || false,
            createdAt: msg.createdAt || new Date(),
            updatedAt: msg.updatedAt,
            timestamp: msg.timestamp || msg.createdAt || new Date()
          } as Message;
        });
        
        setMessages(formattedMessages);
      }
    } catch (error) {
      console.error('Error loading initial data:', error);
    }
  }, [onlineUsers]);

  // Check authentication and load data
  useEffect(() => {
    const checkAuth = async () => {
      const token = authService.getToken();
      if (token) {
        try {
          const userData = await authService.getCurrentUser();
          if (userData) {
            // Ensure user has _id
            const currentUser = { ...userData, _id: userData._id || userData.id } as User;
            setCurrentUser(currentUser);
            await loadInitialData();
            
            // Connect to WebSocket
            const newSocket = io('http://localhost:4001', {
              auth: { token },
              transports: ['websocket', 'polling']
            });
            
            newSocket.on('connect', () => {
              console.log('Connected to WebSocket server');
              setIsConnected(true);
            });
            
            newSocket.on('disconnect', () => {
              setIsConnected(false);
            });
            
            // Set up event listeners
            newSocket.on('private-message', (data: any) => handleNewMessage({ ...data, isGroup: false }));
            newSocket.on('group-message', (data: any) => handleNewMessage({ ...data, isGroup: true }));
            newSocket.on('user-typing', handleTyping);
            newSocket.on('user-joined', (data: any) => handleUserStatus(data, 'joined'));
            newSocket.on('user-left', (data: any) => handleUserStatus(data, 'left'));
            newSocket.on('online-users', (users: any[]) => {
              const userIds = users.filter(u => u.isOnline).map(u => u._id || u.id);
              setOnlineUsers(new Set(userIds));
            });
            newSocket.on('message-read', (data: { messageId: string }) => {
              setMessages(prev => 
                prev.map(msg => 
                  msg.id === data.messageId ? { ...msg, isRead: true } : msg
                )
              );
            });
            
            setSocket(newSocket);
          }
        } catch (error) {
          console.error('Authentication error:', error);
          authService.logout();
        }
      }
    };

    checkAuth();
    
    // Cleanup on unmount
    return () => {
      if (socket) {
        socket.disconnect();
      }
    };
  }, [loadInitialData, handleNewMessage]);

  // Handle sending a new message
  const sendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newMessage.trim() || !socket || !currentUser) return;

    try {
      setIsSending(true);
      
      const messageData = {
        content: newMessage,
        senderId: currentUser._id,
        recipientId: activeChat?.isGroup ? 'all' : activeChat?.id,
        isGroup: activeChat?.isGroup || false
      };

      if (activeChat?.isGroup) {
        socket.emit('group-message', messageData);
      } else if (activeChat) {
        socket.emit('private-message', {
          ...messageData,
          recipientId: activeChat.id
        });
      }

      setNewMessage('');
    } catch (error) {
      console.error('Error sending message:', error);
    } finally {
      setIsSending(false);
    }
  };

  // Handle user typing indicator
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const message = e.target.value;
    setNewMessage(message);

    if (!socket || !currentUser || !activeChat) return;

    // Clear any existing timeout
    if (typingTimeoutRef.current) {
      clearTimeout(typingTimeoutRef.current);
    }

    // Emit typing event
    socket.emit('typing', {
      isTyping: true,
      isPrivate: !activeChat.isGroup,
      recipientId: activeChat.isGroup ? null : activeChat.id
    });

    // Set timeout to stop typing indicator after 2 seconds of inactivity
    typingTimeoutRef.current = setTimeout(() => {
      if (socket) {
        socket.emit('typing', {
          isTyping: false,
          isPrivate: !activeChat?.isGroup,
          recipientId: activeChat?.isGroup ? null : activeChat?.id
        });
      }
    }, 2000);
  };

  const handleKeyPress = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendMessage(e as any);
    }
  };

  const handleAuthSuccess = (userData: AuthUser) => {
    // Convert AuthUser to local User type with _id
    const user: User = { ...userData, _id: userData._id || userData.id };
    setCurrentUser(user);

    // Run async operations
    (async () => {
      await loadInitialData();
      const token = authService.getToken();
      if (token) {
        connectSocket(token);
      }
    })();
  };

  const handleLogout = async () => {
    if (socket) {
      socket.disconnect();
    }
    await authService.logout();
    setCurrentUser(null);
    setSocket(null);
    setMessages([]);
    setUsers([]);
  };

  if (!currentUser) {
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
            currentUserId={currentUser.id}
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
                currentUserId={currentUser.id}
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
                className={`flex ${msg.senderId === currentUser?.id ? 'justify-end' : 'justify-start'}`}
              >
                <div
                  className={`max-w-[80%] rounded-2xl p-3 ${
                    msg.senderId === currentUser?.id
                      ? 'bg-blue-500 text-white rounded-br-none'
                      : 'bg-white border border-gray-200 rounded-bl-none shadow-sm'
                  }`}
                >
                  {msg.sender?.username !== 'System' && msg.senderId !== currentUser?.id && (
                    <p className="text-xs font-medium text-blue-600 mb-1">
                      {msg.sender?.username}
                    </p>
                  )}
                  <p className="text-sm">{msg.content}</p>
                  <p className={`text-xs mt-1 text-right ${
                    msg.senderId === currentUser?.id ? 'text-blue-100' : 'text-gray-400'
                  }`}>
                    {msg.timestamp ? new Date(msg.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : ''}
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
