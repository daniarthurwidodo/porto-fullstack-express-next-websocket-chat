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
      className={`flex items-center gap-3 p-3 rounded-lg cursor-pointer transition-all duration-200 ${
        isSelected
          ? 'bg-blue-400 ring-2 ring-blue-500 shadow-md'
          : 'hover:bg-blue-300 hover:shadow-sm'
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
            className="rounded-full object-cover border-2 border-white shadow-sm"
            style={{ width: '40px', height: '40px' }}
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
          className={`rounded-full bg-gradient-to-br from-blue-500 to-blue-600 flex items-center justify-center text-white font-semibold text-sm shadow-sm border-2 border-white ${
            user.avatar ? 'hidden' : 'flex'
          }`}
          style={{ width: '40px', height: '40px' }}
          data-testid={`initials-${user.id}`}
        >
          {user.name.charAt(0).toUpperCase()}
        </div>

        {/* Online status indicator */}
        <div
          id={`status-dot-${user.id}`}
          className={`absolute -bottom-0.5 -right-0.5 w-3 h-3 rounded-full border-2 border-white shadow-sm ${
            user.online ? 'bg-green-500' : 'bg-gray-400'
          }`}
          data-status={user.online ? 'online' : 'offline'}
        />
      </div>

      <div id={`user-info-${user.id}`} className="flex-1 min-w-0">
        <div className="flex flex-col">
          <span
            id={`username-${user.id}`}
            className="font-semibold text-blue-900 truncate text-sm leading-tight"
            data-testid={`username-${user.id}`}
            title={user.name}
          >
            {user.name}
          </span>
          <span
            id={`status-label-${user.id}`}
            className={`text-xs font-medium mt-0.5 ${
              user.online
                ? 'text-green-600'
                : 'text-gray-500'
            }`}
          >
            {user.online ? 'Online' : 'Offline'}
          </span>
        </div>
      </div>
    </li>
  );
}