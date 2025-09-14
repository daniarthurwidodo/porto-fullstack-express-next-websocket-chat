"use client";

import { createContext, useContext, useState, ReactNode } from 'react';
import { ChatUser } from '@/hooks/useChat';

interface ChatContextType {
  selectedUser: ChatUser | null;
  setSelectedUser: (user: ChatUser | null) => void;
  isLoggedIn: boolean;
  setIsLoggedIn: (loggedIn: boolean) => void;
}

const ChatContext = createContext<ChatContextType | undefined>(undefined);

export function ChatProvider({ children }: { children: ReactNode }) {
  const [selectedUser, setSelectedUser] = useState<ChatUser | null>(null);
  const [isLoggedIn, setIsLoggedIn] = useState(false);

  return (
    <ChatContext.Provider value={{
      selectedUser,
      setSelectedUser,
      isLoggedIn,
      setIsLoggedIn
    }}>
      {children}
    </ChatContext.Provider>
  );
}

export function useChatContext() {
  const context = useContext(ChatContext);
  if (context === undefined) {
    throw new Error('useChatContext must be used within a ChatProvider');
  }
  return context;
}