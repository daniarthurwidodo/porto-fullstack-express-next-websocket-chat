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
    <aside id="user-list-sidebar" className="w-80 bg-blue-200 p-4 flex flex-col overflow-hidden" data-testid="user-sidebar">
      <div id="search-section" className="sticky top-0 bg-blue-200 z-10 pb-2">
        <input
          id="user-search-input"
          type="text"
          placeholder="Search users..."
          value={searchQuery}
          onChange={(e) => onSearchChange(e.target.value)}
          className="w-full p-2 rounded-lg bg-blue-100 text-blue-900 placeholder-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500"
          aria-label="Search users"
          data-testid="search-input"
        />
      </div>

      <div id="users-container" className="flex-1 overflow-y-auto custom-scrollbar mt-2">
        {!hasResults ? (
          <div id="no-results" className="text-center text-blue-600 py-4" data-testid="no-results">
            <p>No users found</p>
            {searchQuery && (
              <button
                id="clear-search-button"
                onClick={() => onSearchChange('')}
                className="text-blue-500 hover:text-blue-400 underline text-sm mt-2"
                data-testid="clear-search"
              >
                Clear search
              </button>
            )}
          </div>
        ) : (
          <>
            {showSections ? (
              <div id="user-sections" className="">
                {onlineUsers.length > 0 && (
                  <div id="online-users-section">
                    <h3 id="online-users-header" className="text-sm font-semibold text-blue-700 mb-2 flex items-center gap-2">
                      <div className="w-2 h-2 bg-green-500 rounded-full" />
                      Online ({onlineUsers.length})
                    </h3>
                    <ul id="online-users-list" className="space-y-1" data-testid="online-users">
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
                    <h3 id="offline-users-header" className="text-sm font-semibold text-blue-700 mb-2 flex items-center gap-2">
                      <div className="w-2 h-2 bg-gray-400 rounded-full" />
                      Offline ({offlineUsers.length})
                    </h3>
                    <ul id="offline-users-list" className="space-y-1" data-testid="offline-users">
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
                <h3 id="search-results-header" className="text-sm font-semibold text-blue-700 mb-2">
                  Search Results ({users.length})
                </h3>
                <ul id="search-results-list" className="space-y-1" data-testid="search-results">
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