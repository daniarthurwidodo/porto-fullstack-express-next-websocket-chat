import { ChatUser } from '@/hooks/useChat';
import UserCard from './UserCard';

interface UserListSidebarProps {
  users: ChatUser[];
  onlineUsers: ChatUser[];
  offlineUsers: ChatUser[];
  searchQuery: string;
  onSearchChange: (query: string) => void;
  selectedUser: ChatUser | null;
  onUserSelect: (user: ChatUser) => void;
}

export default function UserListSidebar({
  users,
  onlineUsers,
  offlineUsers,
  searchQuery,
  onSearchChange,
  selectedUser,
  onUserSelect
}: UserListSidebarProps) {
  const hasResults = users.length > 0;
  const showSections = !searchQuery.trim();

  return (
    <aside id="user-list-sidebar" className="w-80 bg-white/80 backdrop-blur-xl border-r border-slate-200/60 p-6 flex flex-col overflow-hidden shadow-xl" data-testid="user-sidebar">
      {/* Header */}
      <div className="mb-6">
        <h1 className="text-xl font-semibold text-slate-800 mb-2">Conversations</h1>
        <p className="text-sm text-slate-500">Connect with your team</p>
      </div>

      {/* Search Section */}
      <div id="search-section" className="sticky top-0 bg-white/80 backdrop-blur-xl z-10 pb-4">
        <div className="relative">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <svg className="h-4 w-4 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
          </div>
          <input
            id="user-search-input"
            type="text"
            placeholder="Search conversations..."
            value={searchQuery}
            onChange={(e) => onSearchChange(e.target.value)}
            className="w-full pl-10 pr-4 py-3 rounded-xl bg-slate-50/80 border border-slate-200/60 text-slate-700 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-300 transition-all duration-200"
            aria-label="Search users"
            data-testid="search-input"
          />
        </div>
      </div>

      {/* Users Container */}
      <div id="users-container" className="flex-1 overflow-y-auto custom-scrollbar">
        {!hasResults ? (
          <div id="no-results" className="text-center py-8" data-testid="no-results">
            <div className="w-12 h-12 bg-slate-100 rounded-full flex items-center justify-center mx-auto mb-3">
              <svg className="w-6 h-6 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
            </div>
            <p className="text-slate-500 font-medium">No users found</p>
            {searchQuery && (
              <button
                id="clear-search-button"
                onClick={() => onSearchChange('')}
                className="text-indigo-600 hover:text-indigo-500 font-medium text-sm mt-3 transition-colors"
                data-testid="clear-search"
              >
                Clear search
              </button>
            )}
          </div>
        ) : (
          <>
            {showSections ? (
              <div id="user-sections" className="space-y-6">
                {onlineUsers.length > 0 && (
                  <div id="online-users-section">
                    <h3 id="online-users-header" className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-3 flex items-center gap-2">
                      <div className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse" />
                      Online ({onlineUsers.length})
                    </h3>
                    <ul id="online-users-list" className="space-y-2" data-testid="online-users">
                      {onlineUsers.map((user) => (
                        <UserCard
                          key={user.id}
                          user={user}
                          onClick={() => onUserSelect(user)}
                          isSelected={selectedUser?.id === user.id}
                        />
                      ))}
                    </ul>
                  </div>
                )}

                {offlineUsers.length > 0 && (
                  <div id="offline-users-section">
                    <h3 id="offline-users-header" className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-3 flex items-center gap-2">
                      <div className="w-2 h-2 bg-slate-400 rounded-full" />
                      Offline ({offlineUsers.length})
                    </h3>
                    <ul id="offline-users-list" className="space-y-2" data-testid="offline-users">
                      {offlineUsers.map((user) => (
                        <UserCard
                          key={user.id}
                          user={user}
                          onClick={() => onUserSelect(user)}
                          isSelected={selectedUser?.id === user.id}
                        />
                      ))}
                    </ul>
                  </div>
                )}
              </div>
            ) : (
              <div id="search-results-section">
                <h3 id="search-results-header" className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-3">
                  Search Results ({users.length})
                </h3>
                <ul id="search-results-list" className="space-y-2" data-testid="search-results">
                  {users.map((user) => (
                    <UserCard
                      key={user.id}
                      user={user}
                      onClick={() => onUserSelect(user)}
                      isSelected={selectedUser?.id === user.id}
                    />
                  ))}
                </ul>
              </div>
            )}
          </>
        )}
      </div>
    </aside>
  );
}
