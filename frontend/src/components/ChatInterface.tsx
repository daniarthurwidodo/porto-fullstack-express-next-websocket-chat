import { useState } from "react"
import { User, Message } from "@/data/mockUsers"
import { Avatar } from "@/components/ui/Avatar"
import { TypingIndicator } from "@/components/TypingIndicator"
import { formatTime, cn } from "@/lib/utils"

interface ChatInterfaceProps {
  selectedUser: User
  messages: Message[]
  currentUserId: string
  className?: string
}

export function ChatInterface({ selectedUser, messages, currentUserId, className }: ChatInterfaceProps) {
  const [newMessage, setNewMessage] = useState("")
  
  const chatMessages = messages.filter(
    msg => 
      (msg.senderId === currentUserId && msg.receiverId === selectedUser.id) ||
      (msg.senderId === selectedUser.id && msg.receiverId === currentUserId)
  )

  const handleSendMessage = () => {
    if (newMessage.trim()) {
      // In a real app, this would send the message to the server
      console.log("Sending message:", newMessage)
      setNewMessage("")
    }
  }

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault()
      handleSendMessage()
    }
  }

  return (
    <div className={cn("flex flex-col h-full bg-background", className)}>
      {/* Chat Header */}
      <div className="flex items-center p-4 border-b border-border bg-card">
        <Avatar
          src={selectedUser.avatar}
          alt={selectedUser.name}
          fallback={selectedUser.name.charAt(0)}
          isOnline={selectedUser.isOnline}
          className="mr-3"
        />
        <div className="flex-1">
          <h3 className="font-semibold">{selectedUser.name}</h3>
          <p className="text-sm text-muted-foreground">
            {selectedUser.isOnline ? "Online" : "Offline"}
          </p>
        </div>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {chatMessages.length === 0 ? (
          <div className="flex items-center justify-center h-full text-muted-foreground">
            <p>Start a conversation with {selectedUser.name}</p>
          </div>
        ) : (
          chatMessages.map((message) => {
            const isFromCurrentUser = message.senderId === currentUserId
            
            return (
              <div
                key={message.id}
                className={cn(
                  "flex items-end space-x-2 max-w-[70%]",
                  isFromCurrentUser ? "ml-auto flex-row-reverse space-x-reverse" : ""
                )}
              >
                {!isFromCurrentUser && (
                  <Avatar
                    src={selectedUser.avatar}
                    alt={selectedUser.name}
                    fallback={selectedUser.name.charAt(0)}
                    size="sm"
                  />
                )}
                
                <div
                  className={cn(
                    "rounded-lg px-4 py-2 max-w-full",
                    isFromCurrentUser
                      ? "bg-primary text-primary-foreground"
                      : "bg-muted text-foreground"
                  )}
                >
                  <p className="text-sm break-words">{message.content}</p>
                  <p className={cn(
                    "text-xs mt-1",
                    isFromCurrentUser ? "text-primary-foreground/70" : "text-muted-foreground"
                  )}>
                    {formatTime(message.timestamp)}
                  </p>
                </div>
              </div>
            )
          })
        )}
        
        {/* Typing Indicator */}
        {selectedUser.isTyping && (
          <div className="flex items-end space-x-2 max-w-[70%]">
            <Avatar
              src={selectedUser.avatar}
              alt={selectedUser.name}
              fallback={selectedUser.name.charAt(0)}
              size="sm"
            />
            <div className="bg-muted rounded-lg px-4 py-2">
              <TypingIndicator />
            </div>
          </div>
        )}
      </div>

      {/* Message Input */}
      <div className="p-4 border-t border-border bg-card">
        <div className="flex space-x-2">
          <input
            type="text"
            value={newMessage}
            onChange={(e) => setNewMessage(e.target.value)}
            onKeyPress={handleKeyPress}
            placeholder={`Message ${selectedUser.name}...`}
            className="flex-1 px-3 py-2 bg-background border border-input rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-ring"
          />
          <button
            onClick={handleSendMessage}
            disabled={!newMessage.trim()}
            className="px-4 py-2 bg-primary text-primary-foreground rounded-md text-sm font-medium hover:bg-primary/90 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            Send
          </button>
        </div>
      </div>
    </div>
  )
}
