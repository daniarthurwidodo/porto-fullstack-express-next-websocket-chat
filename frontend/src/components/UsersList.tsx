import React from 'react';
import * as Avatar from '@radix-ui/react-avatar';
import * as Separator from '@radix-ui/react-separator';
import { User as UserIcon, Circle, X } from 'lucide-react';
import { User } from '@/lib/auth';

interface UsersListProps {
  users: User[];
  currentUserId: string;
  onClose?: () => void;
}

export default function UsersList({ users, currentUserId, onClose }: UsersListProps) {
  return (
    <div className="bg-gray-800 border-r border-gray-700 w-full lg:w-64 p-4 h-full">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-white font-semibold flex items-center gap-2">
          <UserIcon size={18} />
          Online Users
        </h3>
        {onClose && (
          <button
            onClick={onClose}
            className="lg:hidden text-gray-400 hover:text-white transition-colors p-1 rounded"
          >
            <X size={20} />
          </button>
        )}
      </div>
      <Separator.Root className="bg-gray-700 h-px mb-4" />
      <div className="space-y-1">
        {users.map((user) => (
          <div
            key={user.id}
            className={`flex items-center space-x-3 p-3 rounded-lg transition-all duration-200 ${
              user.id === currentUserId 
                ? 'bg-blue-600 bg-opacity-20 border border-blue-600 border-opacity-30' 
                : 'hover:bg-gray-700 hover:scale-[1.02]'
            }`}
          >
            <div className="relative">
              <Avatar.Root className="w-10 h-10 rounded-full overflow-hidden bg-gray-600 flex items-center justify-center">
                <Avatar.Fallback className="text-white text-sm font-semibold">
                  {user.username.charAt(0).toUpperCase()}
                </Avatar.Fallback>
              </Avatar.Root>
              <div className="absolute -bottom-1 -right-1 flex items-center justify-center">
                <Circle 
                  size={12} 
                  className={`${user.isOnline ? 'text-green-500 fill-green-500' : 'text-gray-500 fill-gray-500'}`}
                />
              </div>
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-white text-sm font-medium truncate">
                {user.username}
                {user.id === currentUserId && (
                  <span className="text-blue-400 text-xs ml-2 font-normal">(You)</span>
                )}
              </p>
              <p className={`text-xs ${user.isOnline ? 'text-green-400' : 'text-gray-500'}`}>
                {user.isOnline ? 'Online' : 'Offline'}
              </p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
