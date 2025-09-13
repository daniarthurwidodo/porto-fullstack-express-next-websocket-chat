import React from 'react';
import { User } from '@/lib/auth';

interface UsersListProps {
  users: User[];
  currentUserId: string;
  onClose?: () => void;
}

// Helper function to format last seen time
function formatLastSeen(timestamp: string | Date): string {
  const date = typeof timestamp === 'string' ? new Date(timestamp) : timestamp;
  const now = new Date();
  const diffInHours = (now.getTime() - date.getTime()) / (1000 * 60 * 60);
  
  if (diffInHours < 1) {
    const diffInMinutes = Math.floor(diffInHours * 60);
    return `${diffInMinutes}m`;
  } else if (diffInHours < 24) {
    return `${Math.floor(diffInHours)}h`;
  } else {
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
  }
}

export default function UsersList({ users, currentUserId, onClose }: UsersListProps) {
  // Sort users: online first, then by username
  const sortedUsers = [...users].sort((a, b) => {
    if (a.isOnline === b.isOnline) {
      return a.username.localeCompare(b.username);
    }
    return a.isOnline ? -1 : 1;
  });

  return (
    <div className="w-full h-full overflow-hidden flex flex-col">
      {/* Search bar */}
      <div className="p-4 border-b border-gray-200">
        <div className="relative">
          <input
            type="text"
            placeholder="Search messages"
            className="w-full bg-gray-100 rounded-lg py-2 pl-10 pr-4 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:bg-white"
          />
          <svg
            className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
            />
          </svg>
        </div>
      </div>

      {/* Users list */}
      <div className="flex-1 overflow-y-auto">
        {sortedUsers.map((user) => (
          <div
            key={user.id}
            className={`flex items-center p-3 hover:bg-gray-50 cursor-pointer transition-colors ${
              user.id === currentUserId ? 'bg-blue-50' : ''
            }`}
          >
            <div className="relative mr-3">
              <div className="w-10 h-10 rounded-full bg-gray-200 flex items-center justify-center text-gray-500 font-medium">
                {user?.username?.charAt(0).toUpperCase() || 'U'}
              </div>
              {user.isOnline && (
                <div className="absolute bottom-0 right-0 w-3 h-3 bg-green-500 rounded-full border-2 border-white"></div>
              )}
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center justify-between">
                <p className="text-sm font-medium text-gray-900 truncate">
                  {user?.username || 'Unknown User'}
                  {user?.id === currentUserId && (
                    <span className="ml-1 text-xs text-gray-500">(You)</span>
                  )}
                </p>
                <span className="text-xs text-gray-400">
                  {user.lastSeen ? formatLastSeen(user.lastSeen) : ''}
                </span>
              </div>
              <p className="text-xs text-gray-500 truncate">
                {user.isOnline ? 'Online' : 'Last seen recently'}
              </p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
