import { useState } from 'react'
import { UserList } from '@/components/UserList'
import { ChatInterface } from '@/components/ChatInterface'
import { mockUsers, mockMessages, currentUser, User } from '@/data/mockUsers'

function App() {
  const [selectedUser, setSelectedUser] = useState<User | null>(null)

  // Filter out current user from the list
  const otherUsers = mockUsers.filter(user => user.id !== currentUser.id)

  const handleUserSelect = (user: User) => {
    setSelectedUser(user)
  }

  return (
    <div className="h-screen flex bg-background text-foreground">
      <UserList
        users={otherUsers}
        selectedUserId={selectedUser?.id}
        onUserSelect={handleUserSelect}
      />
      
      <div className="flex-1">
        {selectedUser ? (
          <ChatInterface
            selectedUser={selectedUser}
            messages={mockMessages}
            currentUserId={currentUser.id}
          />
        ) : (
          <div className="flex items-center justify-center h-full bg-background">
            <div className="text-center">
              <h2 className="text-2xl font-semibold text-foreground mb-2">
                Welcome to Chat App
              </h2>
              <p className="text-muted-foreground">
                Select a contact to start chatting
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

export default App
