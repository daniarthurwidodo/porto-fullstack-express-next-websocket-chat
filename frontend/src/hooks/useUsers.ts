import { useState, useMemo } from 'react';
import { ChatUser } from './useChat';

const randomUsernames = [
  "SkyRider", "BlueWave", "NightOwl", "CodeMaster", "AquaDream",
  "ShadowFox", "NeonLight", "WaveBreaker", "StormChaser", "Zenith",
  "MoonWalker", "ByteHunter", "DeepDiver", "SonicBloom", "Echo",
  "Drift", "Horizon", "Nimbus", "Orion", "Photon",
  "Quasar", "Rift", "Solstice", "Tempest", "Vertex",
];

const generateUsers = (count = 25): ChatUser[] => {
  return Array.from({ length: count }, (_, i) => ({
    id: i + 1,
    name: randomUsernames[i % randomUsernames.length],
    online: Math.random() > 0.5,
    avatar: Math.random() > 0.6 ? `https://i.pravatar.cc/150?img=${(i % 70) + 1}` : null,
  }));
};

export function useUsers() {
  const [users] = useState<ChatUser[]>(() => generateUsers());
  const [searchQuery, setSearchQuery] = useState("");

  const filteredUsers = useMemo(() => {
    if (!searchQuery.trim()) return users;

    return users.filter(user =>
      user.name.toLowerCase().includes(searchQuery.toLowerCase())
    );
  }, [users, searchQuery]);

  const onlineUsers = useMemo(() =>
    filteredUsers.filter(user => user.online),
    [filteredUsers]
  );

  const offlineUsers = useMemo(() =>
    filteredUsers.filter(user => !user.online),
    [filteredUsers]
  );

  return {
    users,
    filteredUsers,
    onlineUsers,
    offlineUsers,
    searchQuery,
    setSearchQuery
  };
}