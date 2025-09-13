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
    <div id="users_list_container_584729" className="w-full h-full p-6">
      <div id="users_header_927348" className="flex items-center justify-between mb-6">
        <h3 className="text-slate-700 font-semibold text-lg flex items-center gap-3">
          <div className="w-8 h-8 bg-gradient-to-r from-violet-500 to-violet-600 rounded-xl flex items-center justify-center">
            <UserIcon size={16} className="text-white" />
          </div>
          Members
        </h3>
        {onClose && (
          <button
            id="close_users_list_463892"
            onClick={onClose}
            className="xl:hidden text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition-all duration-200 p-2 rounded-xl"
          >
            <X size={18} />
          </button>
        )}
      </div>
      <Separator.Root className="bg-slate-200/50 h-px mb-6" />
      <div id="users_grid_192847" className="space-y-2">
        {users.map((user) => (
          <div
            key={user.id}
            id={`user_card_${user.id}`}
            className={`group flex items-center space-x-4 p-4 rounded-2xl transition-all duration-200 cursor-pointer ${
              user.id === currentUserId
                ? 'bg-gradient-to-r from-blue-50 to-blue-100 border border-blue-200 shadow-lg shadow-blue-200/20'
                : 'hover:bg-slate-50 hover:scale-[1.02] hover:shadow-lg hover:shadow-slate-200/50'
            }`}
            role="button"
            tabIndex={0}
            aria-label={`User ${user.username} - ${user.isOnline ? 'Online' : 'Offline'}`}
          >
            <div id={`user_avatar_container_${user.id}`} className="relative">
              <Avatar.Root id={`user_avatar_${user.id}`} className="w-12 h-12 rounded-2xl overflow-hidden bg-gradient-to-br from-slate-400 to-slate-600 flex items-center justify-center group-hover:scale-110 transition-all duration-200 shadow-lg">
                <Avatar.Fallback className="text-white text-base font-bold">
                  {user.username.charAt(0).toUpperCase()}
                </Avatar.Fallback>
              </Avatar.Root>
              <div id={`status_indicator_${user.id}`} className="absolute -bottom-0.5 -right-0.5 flex items-center justify-center">
                <div className={`w-4 h-4 rounded-full border-2 border-white shadow-sm ${
                  user.isOnline
                    ? 'bg-gradient-to-r from-emerald-400 to-emerald-500 animate-pulse'
                    : 'bg-slate-400'
                } transition-all duration-200`} />
              </div>
            </div>
            <div id={`user_info_${user.id}`} className="flex-1 min-w-0">
              <p id={`username_${user.id}`} className="text-slate-800 text-sm font-semibold truncate group-hover:text-blue-600 transition-colors duration-200">
                {user.username}
                {user.id === currentUserId && (
                  <span className="text-blue-600 text-xs ml-2 font-medium px-2 py-0.5 bg-blue-100 rounded-lg">(You)</span>
                )}
              </p>
              <p id={`status_text_${user.id}`} className={`text-xs font-medium transition-colors duration-200 ${
                user.isOnline
                  ? 'text-emerald-500 group-hover:text-emerald-600'
                  : 'text-slate-400 group-hover:text-slate-500'
              }`}>
                {user.isOnline ? 'Online' : 'Offline'}
              </p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
