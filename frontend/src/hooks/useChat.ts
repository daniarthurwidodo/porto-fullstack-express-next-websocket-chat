import { useState, useCallback } from 'react';

export interface Message {
  id: number;
  from: "me" | "them";
  text: string;
  timestamp?: Date;
}

export interface ChatUser {
  id: number;
  name: string;
  online: boolean;
  avatar: string | null;
}

export function useChat(user: ChatUser) {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: 1,
      from: "them",
      text: `Hi, I'm ${user.name}!`,
      timestamp: new Date()
    },
    {
      id: 2,
      from: "me",
      text: "Hey, nice to chat with you.",
      timestamp: new Date()
    },
  ]);

  const sendMessage = useCallback((text: string) => {
    if (!text.trim()) return;

    const newMessage: Message = {
      id: Date.now(),
      from: "me",
      text: text.trim(),
      timestamp: new Date()
    };

    setMessages(prev => [...prev, newMessage]);
  }, []);

  const clearMessages = useCallback(() => {
    setMessages([]);
  }, []);

  return {
    messages,
    sendMessage,
    clearMessages
  };
}