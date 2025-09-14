import { useChat, ChatUser } from '@/hooks/useChat';
import ChatMessage from './ChatMessage';
import ChatInput from './ChatInput';

interface ChatRoomProps {
  user: ChatUser;
  onBack: () => void;
}

export default function ChatRoom({ user, onBack }: ChatRoomProps) {
  const { messages, sendMessage } = useChat(user);

  return (
    <div id={`chat-room-${user.id}`} className="flex flex-col h-full" data-testid="chat-room">
      <div id="chat-room-header" className="flex items-center justify-between mb-4">
        <button
          id="back-to-users-button"
          onClick={onBack}
          className="px-3 py-1 bg-blue-600 rounded-lg hover:bg-blue-500 text-white transition-colors"
          aria-label="Go back to user list"
          data-testid="back-button"
        >
          ← Back
        </button>
        <div id={`user-status-${user.id}`} className="flex items-center gap-2">
          <div
            id={`status-indicator-${user.id}`}
            className={`w-2 h-2 rounded-full ${user.online ? 'bg-green-500' : 'bg-gray-400'}`}
            data-status={user.online ? 'online' : 'offline'}
          />
          <span
            id={`status-text-${user.id}`}
            className={`text-sm ${user.online ? 'text-green-600' : 'text-gray-500'}`}
          >
            {user.online ? 'Online' : 'Offline'}
          </span>
        </div>
      </div>

      <h2 id={`chat-title-${user.id}`} className="text-2xl font-bold mb-4 text-blue-900">
        Chat with {user.name}
      </h2>

      <div
        id={`messages-container-${user.id}`}
        className="flex-1 overflow-y-auto space-y-2 mb-4 custom-scrollbar p-2 bg-blue-100 rounded-lg"
        data-testid="messages-container"
        role="log"
        aria-label={`Chat messages with ${user.name}`}
      >
        {messages.map((message) => (
          <ChatMessage key={message.id} message={message} />
        ))}
      </div>

      <ChatInput onSendMessage={sendMessage} disabled={!user.online} />
    </div>
  );
}