import { User } from "@/data/mockUsers"
import { Avatar } from "@/components/ui/Avatar"
import { TypingIndicator } from "@/components/TypingIndicator"
import { formatLastSeen } from "@/lib/utils"
import { cn } from "@/lib/utils"

interface UserListProps {
  users: User[]
  selectedUserId?: string
  onUserSelect: (user: User) => void
  className?: string
}

export function UserList({ users, selectedUserId, onUserSelect, className }: UserListProps) {
  return (
    <div className={cn("w-80 bg-card border-r border-border", className)}>
      <div className="p-4 border-b border-border">
        <h2 className="text-lg font-semibold">Contacts</h2>
        <p className="text-sm text-muted-foreground">{users.filter(u => u.isOnline).length} online</p>
      </div>
      
      <div className="overflow-y-auto h-full">
        {users.map((user) => (
          <div
            key={user.id}
            onClick={() => onUserSelect(user)}
            className={cn(
              "flex items-center p-4 hover:bg-accent cursor-pointer transition-colors",
              selectedUserId === user.id && "bg-accent"
            )}
          >
            <Avatar
              src={user.avatar}
              alt={user.name}
              fallback={user.name.charAt(0)}
              isOnline={user.isOnline}
              className="mr-3"
            />
            
            <div className="flex-1 min-w-0">
              <div className="flex items-center justify-between">
                <h3 className="font-medium truncate">{user.name}</h3>
                {user.isOnline ? (
                  <span className="text-xs text-green-500 font-medium">Online</span>
                ) : (
                  user.lastSeen && (
                    <span className="text-xs text-muted-foreground">
                      {formatLastSeen(user.lastSeen)}
                    </span>
                  )
                )}
              </div>
              
              <div className="flex items-center mt-1">
                <p className="text-sm text-muted-foreground truncate">@{user.username}</p>
                {user.isTyping && (
                  <TypingIndicator className="ml-2" />
                )}
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
