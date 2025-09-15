export interface User {
  id: string;
  name: string;
  username: string;
  avatar?: string;
  isOnline: boolean;
  lastSeen?: Date;
  isTyping?: boolean;
}

export interface Message {
  id: string;
  senderId: string;
  receiverId: string;
  content: string;
  timestamp: Date;
  isRead: boolean;
}

export interface Chat {
  id: string;
  participants: string[];
  lastMessage?: Message;
  unreadCount: number;
}

// Mock avatars using placeholder images
const avatarUrls = [
  "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=100&h=100&fit=crop&crop=face",
  "https://images.unsplash.com/photo-1494790108755-2616b612b47c?w=100&h=100&fit=crop&crop=face",
  "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100&h=100&fit=crop&crop=face",
  "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=100&h=100&fit=crop&crop=face",
  "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=100&h=100&fit=crop&crop=face",
  "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100&h=100&fit=crop&crop=face",
  "https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=100&h=100&fit=crop&crop=face",
  "https://images.unsplash.com/photo-1544723795-3fb6469f5b39?w=100&h=100&fit=crop&crop=face",
];

export const mockUsers: User[] = [
  {
    id: "1",
    name: "Alice Johnson",
    username: "alice_j",
    avatar: avatarUrls[0],
    isOnline: true,
  },
  {
    id: "2",
    name: "Bob Smith",
    username: "bobsmith",
    avatar: avatarUrls[1],
    isOnline: true,
    isTyping: true,
  },
  {
    id: "3",
    name: "Charlie Brown",
    username: "charlie_b",
    avatar: avatarUrls[2],
    isOnline: false,
    lastSeen: new Date(Date.now() - 1000 * 60 * 30), // 30 minutes ago
  },
  {
    id: "4",
    name: "Diana Prince",
    username: "diana_wp",
    avatar: avatarUrls[3],
    isOnline: true,
  },
  {
    id: "5",
    name: "Edward Norton",
    username: "ed_norton",
    isOnline: false,
    lastSeen: new Date(Date.now() - 1000 * 60 * 60 * 2), // 2 hours ago
  },
  {
    id: "6",
    name: "Fiona Green",
    username: "fiona_g",
    avatar: avatarUrls[4],
    isOnline: true,
  },
  {
    id: "7",
    name: "George Wilson",
    username: "george_w",
    isOnline: false,
    lastSeen: new Date(Date.now() - 1000 * 60 * 60 * 24), // 1 day ago
  },
  {
    id: "8",
    name: "Hannah Davis",
    username: "hannah_d",
    avatar: avatarUrls[5],
    isOnline: true,
  },
  {
    id: "9",
    name: "Ian Mitchell",
    username: "ian_m",
    isOnline: false,
    lastSeen: new Date(Date.now() - 1000 * 60 * 15), // 15 minutes ago
  },
  {
    id: "10",
    name: "Julia Roberts",
    username: "julia_r",
    avatar: avatarUrls[6],
    isOnline: true,
  },
  {
    id: "11",
    name: "Kevin Hart",
    username: "kevin_h",
    isOnline: false,
    lastSeen: new Date(Date.now() - 1000 * 60 * 60 * 3), // 3 hours ago
  },
  {
    id: "12",
    name: "Linda Thompson",
    username: "linda_t",
    avatar: avatarUrls[7],
    isOnline: true,
  },
  {
    id: "13",
    name: "Michael Chen",
    username: "michael_c",
    isOnline: true,
  },
  {
    id: "14",
    name: "Nina Rodriguez",
    username: "nina_r",
    isOnline: false,
    lastSeen: new Date(Date.now() - 1000 * 60 * 45), // 45 minutes ago
  },
  {
    id: "15",
    name: "Oscar Lee",
    username: "oscar_l",
    isOnline: true,
  },
  {
    id: "16",
    name: "Paula White",
    username: "paula_w",
    isOnline: false,
    lastSeen: new Date(Date.now() - 1000 * 60 * 60 * 6), // 6 hours ago
  },
  {
    id: "17",
    name: "Quinn Adams",
    username: "quinn_a",
    isOnline: true,
  },
  {
    id: "18",
    name: "Rachel Green",
    username: "rachel_g",
    isOnline: false,
    lastSeen: new Date(Date.now() - 1000 * 60 * 60 * 12), // 12 hours ago
  },
  {
    id: "19",
    name: "Sam Wilson",
    username: "sam_w",
    isOnline: true,
  },
  {
    id: "20",
    name: "Tina Turner",
    username: "tina_t",
    isOnline: false,
    lastSeen: new Date(Date.now() - 1000 * 60 * 20), // 20 minutes ago
  },
  {
    id: "21",
    name: "Uma Thurman",
    username: "uma_t",
    isOnline: true,
  },
  {
    id: "22",
    name: "Victor Hugo",
    username: "victor_h",
    isOnline: false,
    lastSeen: new Date(Date.now() - 1000 * 60 * 60 * 4), // 4 hours ago
  },
  {
    id: "23",
    name: "Wendy Clark",
    username: "wendy_c",
    isOnline: true,
  },
  {
    id: "24",
    name: "Xavier Jones",
    username: "xavier_j",
    isOnline: false,
    lastSeen: new Date(Date.now() - 1000 * 60 * 60 * 8), // 8 hours ago
  },
  {
    id: "25",
    name: "Yuki Tanaka",
    username: "yuki_t",
    isOnline: true,
  },
];

export const mockMessages: Message[] = [
  {
    id: "1",
    senderId: "2",
    receiverId: "1",
    content: "Hey! How are you doing?",
    timestamp: new Date(Date.now() - 1000 * 60 * 10),
    isRead: true,
  },
  {
    id: "2",
    senderId: "1",
    receiverId: "2",
    content: "I'm doing great! Just finished a project. What about you?",
    timestamp: new Date(Date.now() - 1000 * 60 * 8),
    isRead: true,
  },
  {
    id: "3",
    senderId: "2",
    receiverId: "1",
    content: "That's awesome! I'm working on something new too. Would love to hear about your project.",
    timestamp: new Date(Date.now() - 1000 * 60 * 5),
    isRead: true,
  },
  {
    id: "4",
    senderId: "1",
    receiverId: "2",
    content: "Sure! It's a chat application with a really nice green theme. I think you'd like it!",
    timestamp: new Date(Date.now() - 1000 * 60 * 2),
    isRead: false,
  },
  {
    id: "5",
    senderId: "4",
    receiverId: "1",
    content: "Hi there! Are you available for a quick call?",
    timestamp: new Date(Date.now() - 1000 * 60 * 30),
    isRead: false,
  },
  {
    id: "6",
    senderId: "6",
    receiverId: "1",
    content: "Thanks for the help earlier! Really appreciated it.",
    timestamp: new Date(Date.now() - 1000 * 60 * 60),
    isRead: true,
  },
];

export const mockChats: Chat[] = [
  {
    id: "1",
    participants: ["1", "2"],
    lastMessage: mockMessages[3],
    unreadCount: 1,
  },
  {
    id: "2",
    participants: ["1", "4"],
    lastMessage: mockMessages[4],
    unreadCount: 1,
  },
  {
    id: "3",
    participants: ["1", "6"],
    lastMessage: mockMessages[5],
    unreadCount: 0,
  },
];

// Current user (for demo purposes)
export const currentUser: User = {
  id: "1",
  name: "Alice Johnson",
  username: "alice_j",
  avatar: avatarUrls[0],
  isOnline: true,
};
