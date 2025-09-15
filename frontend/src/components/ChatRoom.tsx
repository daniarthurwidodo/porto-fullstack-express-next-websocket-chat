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
    <div id={`chat-room-${user.id}`} className="flex flex-col h-full bg-white/70 backdrop-blur-sm rounded-2xl shadow-xl border border-white/20" data-testid="chat-room">
      {/* Header */}
      <div id="chat-room-header" className="flex items-center justify-between p-6 border-b border-slate-200/60 bg-white/80 backdrop-blur-xl rounded-t-2xl">
        <div className="flex items-center gap-4">
          <button
            id="back-to-users-button"
            onClick={onBack}
            className="flex items-center gap-2 px-4 py-2 bg-slate-100 hover:bg-slate-200 rounded-xl text-slate-700 transition-all duration-200 hover-lift focus-ring"
            aria-label="Go back to user list"
            data-testid="back-button"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
            Back
          </button>
          
          <div className="flex items-center gap-3">
            <div className="relative">
              {user.avatar ? (
                <img
                  src={user.avatar}
                  alt={`${user.name}'s avatar`}
                  className="rounded-full object-cover border-2 border-white shadow-md"
                  style={{ width: '40px', height: '40px' }}
                />
              ) : (
                <div
                  className="rounded-full bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center text-white font-semibold text-sm shadow-md"
                  style={{ width: '40px', height: '40px' }}
                >
                  {user.name.charAt(0).toUpperCase()}
                </div>
              )}
              <div
                className={`absolute -bottom-0.5 -right-0.5 w-3 h-3 rounded-full border-2 border-white shadow-sm ${
                  user.online ? 'bg-emerald-500 animate-pulse' : 'bg-slate-400'
                }`}
              />
            </div>
            
            <div>
              <h2 className="text-lg font-semibold text-slate-800">{user.name}</h2>
              <div id={`user-status-${user.id}`} className="flex items-center gap-1">
                <span
                  className={`text-xs font-medium ${user.online ? 'text-emerald-600' : 'text-slate-500'}`}
                >
                  {user.online ? 'Active now' : 'Offline'}
                </span>
              </div>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button className="p-2 hover:bg-slate-100 rounded-lg transition-colors">
            <svg className="w-5 h-5 text-slate-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 5v.01M12 12v.01M12 19v.01M12 6a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2z" />
            </svg>
          </button>
        </div>
      </div>

      {/* Messages Area */}
      <div
        id={`messages-container-${user.id}`}
        className="flex-1 overflow-y-auto space-y-3 p-6 custom-scrollbar"
        data-testid="messages-container"
        role="log"
        aria-label={`Chat messages with ${user.name}`}
        style={{
          background: 'linear-gradient(180deg, rgba(248, 250, 252, 0.4) 0%, rgba(241, 245, 249, 0.2) 100%)'
        }}
      >
        {messages.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full text-center py-12">
            <div className="w-16 h-16 bg-slate-100 rounded-full flex items-center justify-center mb-4">
              <svg className="w-8 h-8 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
              </svg>
            </div>
            <h3 className="text-lg font-medium text-slate-700 mb-2">Start a conversation</h3>
            <p className="text-slate-500 text-sm">Send a message to begin chatting with {user.name}</p>
          </div>
        ) : (
          messages.map((message) => (
            <ChatMessage key={message.id} message={message} />
          ))
        )}
      </div>

      {/* Input Area */}
      <div className="p-6 border-t border-slate-200/60 bg-white/80 backdrop-blur-xl rounded-b-2xl">
        <ChatInput onSendMessage={sendMessage} disabled={!user.online} />
      </div>
    </div>
  );
}
