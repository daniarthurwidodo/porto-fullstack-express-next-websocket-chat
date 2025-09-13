'use client';

import { useState, useEffect, useRef } from 'react';
import { io, Socket } from 'socket.io-client';
import { authService, User, MessageData } from '@/lib/auth';
import AuthModal from '@/components/AuthModal';
import UsersList from '@/components/UsersList';
import * as ScrollArea from '@radix-ui/react-scroll-area';
import { Send, LogOut, MessageCircle, Menu, X } from 'lucide-react';

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

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
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
    <div id="chat_container_743281" className="flex h-screen bg-gradient-to-br from-slate-50 to-slate-100 text-slate-900">
      {/* Mobile Sidebar Toggle */}
      <button
        id="mobile_toggle_594726"
        onClick={() => setShowUsersList(true)}
        className="fixed bottom-6 right-6 xl:hidden bg-gradient-to-r from-blue-600 to-blue-700 text-white p-4 rounded-2xl shadow-xl z-20 hover:from-blue-700 hover:to-blue-800 transition-all duration-200 hover:scale-105 backdrop-blur-sm"
        aria-label="Show users"
      >
        <Menu size={20} />
      </button>

      {/* Mobile Sidebar Overlay */}
      {showUsersList && (
        <div id="mobile_overlay_829156" className="fixed inset-0 z-30 xl:hidden">
          <div
            id="overlay_backdrop_564729"
            className="absolute inset-0 bg-black/60 backdrop-blur-sm"
            onClick={() => setShowUsersList(false)}
          />
          <div id="mobile_sidebar_384957" className="absolute left-0 top-0 h-full w-80 max-w-[85vw] bg-white/95 backdrop-blur-xl shadow-2xl border-r border-slate-200">
            <div id="mobile_header_729483" className="p-6 border-b border-slate-200/50 flex justify-between items-center bg-gradient-to-r from-slate-50 to-white">
              <h2 className="text-xl font-semibold text-slate-800">Members</h2>
              <button
                id="mobile_close_156392"
                onClick={() => setShowUsersList(false)}
                className="p-2 text-slate-500 hover:text-slate-700 hover:bg-slate-100 rounded-xl transition-all duration-200"
              >
                <X size={20} />
              </button>
            </div>
            <UsersList
              users={users.filter(u => u.id !== user!.id).concat([user!])}
              currentUserId={user!.id}
              onClose={() => setShowUsersList(false)}
            />
          </div>
        </div>
      )}

      {/* Desktop Sidebar */}
      <div id="desktop_sidebar_157439" className="hidden xl:flex flex-col w-80 bg-white/80 backdrop-blur-xl border-r border-slate-200/50">
        <div id="sidebar_header_825743" className="p-6 border-b border-slate-200/30 bg-gradient-to-r from-white/50 to-slate-50/50">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-gradient-to-r from-blue-600 to-blue-700 rounded-xl flex items-center justify-center shadow-lg">
                <MessageCircle className="text-white" size={20} />
              </div>
              <div>
                <h1 className="text-lg font-semibold text-slate-800">Chat</h1>
                <p className="text-xs text-slate-500">{users.length + 1} online</p>
              </div>
            </div>
            <button
              id="logout_button_347286"
              onClick={handleLogout}
              className="p-2.5 text-slate-500 hover:text-red-500 hover:bg-red-50 rounded-xl transition-all duration-200 group"
              title="Logout"
            >
              <LogOut size={18} className="group-hover:scale-110 transition-transform duration-200" />
            </button>
          </div>
        </div>
        <div id="users_scroll_container_692847" className="flex-1 overflow-y-auto">
          <UsersList
            users={users.filter(u => u.id !== user!.id).concat([user!])}
            currentUserId={user!.id}
          />
        </div>
      </div>

      {/* Main Chat Area */}
      <div id="main_chat_area_908357" className="flex-1 flex flex-col h-screen overflow-hidden bg-white/50 backdrop-blur-sm">
        {/* Header */}
        <div id="chat_header_625791" className="bg-white/80 backdrop-blur-xl border-b border-slate-200/50 p-6 shadow-sm">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-gradient-to-r from-emerald-500 to-emerald-600 rounded-2xl flex items-center justify-center shadow-lg">
                <MessageCircle className="text-white" size={24} />
              </div>
              <div>
                <h2 className="font-semibold text-xl text-slate-800">General Chat</h2>
                <p className="text-sm text-slate-500 flex items-center gap-2">
                  <div className="w-2 h-2 bg-emerald-400 rounded-full animate-pulse"></div>
                  {typingUsers.length > 0 ? (
                    <span>{typingUsers[0]} is typing...</span>
                  ) : (
                    <span>{users.length + 1} members online</span>
                  )}
                </p>
              </div>
            </div>
            <div className="xl:hidden">
              <button
                id="mobile_logout_463829"
                onClick={handleLogout}
                className="px-4 py-2 text-sm text-red-500 hover:text-red-600 hover:bg-red-50 rounded-xl transition-all duration-200"
              >
                Logout
              </button>
            </div>
          </div>
        </div>

        {/* Messages */}
        <ScrollArea.Root id="messages_scroll_area_582947" className="flex-1 overflow-hidden">
          <ScrollArea.Viewport id="messages_viewport_416372" className="w-full h-full p-6">
            <div id="messages_container_795428" className="space-y-4 max-w-4xl mx-auto">
              {messages.map((msg) => (
                <div
                  key={msg.id}
                  id={`message_wrapper_${msg.id}`}
                  className={`flex ${msg.senderId === user?.id ? 'justify-end' : 'justify-start'}`}
                >
                  <div
                    id={`message_bubble_${msg.id}`}
                    className={`max-w-[85%] lg:max-w-[70%] xl:max-w-[60%] p-4 shadow-lg ${
                      msg.senderId === user?.id
                        ? 'bg-gradient-to-r from-blue-600 to-blue-700 text-white rounded-3xl rounded-br-md'
                        : msg.username === 'System'
                        ? 'bg-gradient-to-r from-slate-100 to-slate-200 text-slate-600 text-center text-sm rounded-2xl mx-auto'
                        : 'bg-white text-slate-800 rounded-3xl rounded-bl-md border border-slate-200'
                    }`}
                  >
                    {msg.username !== 'System' && msg.senderId !== user?.id && (
                      <p id={`message_author_${msg.id}`} className="text-xs font-semibold text-blue-600 mb-2 tracking-wide">
                        {msg.username}
                      </p>
                    )}
                    <p id={`message_content_${msg.id}`} className="text-sm leading-relaxed">{msg.content}</p>
                    <p id={`message_timestamp_${msg.id}`} className={`text-xs mt-2 ${
                      msg.senderId === user?.id ? 'text-blue-200' : 'text-slate-400'
                    } text-right font-medium`}>
                      {new Date(msg.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </p>
                  </div>
                </div>
              ))}
              <div id="messages_end_marker_238195" ref={messagesEndRef} />
            </div>
          </ScrollArea.Viewport>
          <ScrollArea.Scrollbar
            className="flex select-none touch-none p-0.5 bg-transparent transition-colors duration-200 ease-out hover:bg-slate-200/50 data-[orientation=vertical]:w-3 data-[orientation=horizontal]:h-3"
            orientation="vertical"
          >
            <ScrollArea.Thumb className="flex-1 bg-slate-300 hover:bg-slate-400 rounded-full relative before:content-[''] before:absolute before:top-1/2 before:left-1/2 before:-translate-x-1/2 before:-translate-y-1/2 before:w-full before:h-full before:min-w-[44px] before:min-h-[44px] transition-colors duration-200" />
          </ScrollArea.Scrollbar>
        </ScrollArea.Root>

        {/* Message Input */}
        <div id="message_input_area_395174" className="p-6 bg-white/90 backdrop-blur-xl border-t border-slate-200/50">
          <div id="input_container_568239" className="max-w-4xl mx-auto">
            <div className="flex items-end gap-4">
              <div className="flex-1 relative">
                <input
                  id="message_input_729348"
                  type="text"
                  value={newMessage}
                  onChange={handleInputChange}
                  onKeyPress={handleKeyPress}
                  placeholder="Type a message..."
                  disabled={isSending}
                  className="w-full bg-slate-50 border border-slate-200 rounded-2xl py-4 px-6 pr-14 focus:ring-2 focus:ring-blue-500/30 focus:border-blue-400 focus:outline-none transition-all duration-200 text-slate-800 placeholder-slate-400 shadow-sm disabled:opacity-50 disabled:cursor-not-allowed"
                  aria-label="Type your message"
                />
                <button
                  id="send_button_483756"
                  onClick={sendMessage}
                  disabled={!newMessage.trim() || isSending}
                  className={`absolute right-2 bottom-2 p-2.5 rounded-xl transition-all duration-200 ${
                    newMessage.trim() && !isSending
                      ? 'bg-gradient-to-r from-blue-600 to-blue-700 text-white hover:from-blue-700 hover:to-blue-800 shadow-lg hover:shadow-xl hover:scale-105'
                      : 'bg-slate-200 text-slate-400 cursor-not-allowed'
                  }`}
                  aria-label={isSending ? "Sending message..." : "Send message"}
                >
                  {isSending ? (
                    <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  ) : (
                    <Send size={20} />
                  )}
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
