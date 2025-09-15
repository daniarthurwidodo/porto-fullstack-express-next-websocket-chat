import { ChatUser } from '@/hooks/useChat';

interface UserCardProps {
  user: ChatUser;
  onClick: () => void;
  isSelected?: boolean;
}

export default function UserCard({ user, onClick, isSelected = false }: UserCardProps) {
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      onClick();
    }
  };

  return (
    <li
      id={`user-card-${user.id}`}
      className={`group flex items-center gap-3 p-3 rounded-xl cursor-pointer transition-all duration-200 hover-lift focus-ring ${
        isSelected
          ? 'bg-gradient-to-r from-indigo-50 to-purple-50 ring-2 ring-indigo-200 shadow-lg border border-indigo-100'
          : 'hover:bg-slate-50/80 hover:shadow-md border border-transparent'
      }`}
      onClick={onClick}
      onKeyDown={handleKeyDown}
      tabIndex={0}
      role="button"
      aria-label={`Chat with ${user.name} - ${user.online ? 'Online' : 'Offline'}`}
      data-testid={`user-${user.id}`}
      data-selected={isSelected}
      data-user-status={user.online ? 'online' : 'offline'}
    >
      <div className="relative flex-shrink-0">
        {user.avatar ? (
          <img
            id={`avatar-${user.id}`}
            src={user.avatar}
            alt={`${user.name}'s avatar`}
            className="rounded-full object-cover border-2 border-white shadow-md ring-2 ring-slate-100"
            style={{ width: '44px', height: '44px' }}
            data-testid={`avatar-${user.id}`}
            onError={(e) => {
              // Fallback to initials if avatar fails to load
              const target = e.target as HTMLImageElement;
              target.style.display = 'none';
              const fallback = target.nextElementSibling as HTMLElement;
              if (fallback) fallback.style.display = 'flex';
            }}
          />
        ) : null}

        <div
          id={`initials-${user.id}`}
          className={`rounded-full bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center text-white font-semibold text-sm shadow-md ring-2 ring-white group-hover:scale-105 transition-transform duration-200 ${
            user.avatar ? 'hidden' : 'flex'
          }`}
          style={{ width: '44px', height: '44px' }}
          data-testid={`initials-${user.id}`}
        >
          {user.name.charAt(0).toUpperCase()}
        </div>

        {/* Online status indicator */}
        <div
          id={`status-dot-${user.id}`}
          className={`absolute -bottom-0.5 -right-0.5 w-3.5 h-3.5 rounded-full border-2 border-white shadow-sm transition-all duration-200 ${
            user.online 
              ? 'bg-emerald-500 animate-pulse' 
              : 'bg-slate-400'
          }`}
          data-status={user.online ? 'online' : 'offline'}
        />
      </div>

      <div id={`user-info-${user.id}`} className="flex-1 min-w-0">
        <div className="flex flex-col">
          <span
            id={`username-${user.id}`}
            className={`font-semibold truncate text-sm leading-tight transition-colors duration-200 ${
              isSelected 
                ? 'text-indigo-900' 
                : 'text-slate-700 group-hover:text-slate-900'
            }`}
            data-testid={`username-${user.id}`}
            title={user.name}
          >
            {user.name}
          </span>
          <span
            id={`status-label-${user.id}`}
            className={`text-xs font-medium mt-0.5 transition-colors duration-200 ${
              user.online
                ? isSelected ? 'text-emerald-700' : 'text-emerald-600'
                : isSelected ? 'text-slate-600' : 'text-slate-500'
            }`}
          >
            {user.online ? 'Active now' : 'Offline'}
          </span>
        </div>
      </div>

      {/* Chat indicator for selected user */}
      {isSelected && (
        <div className="flex-shrink-0">
          <div className="w-2 h-2 bg-indigo-500 rounded-full animate-pulse" />
        </div>
      )}
    </li>
  );
}
