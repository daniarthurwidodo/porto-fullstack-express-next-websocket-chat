import { Message } from '@/hooks/useChat';

interface ChatMessageProps {
  message: Message;
}

export default function ChatMessage({ message }: ChatMessageProps) {
  const isMe = message.from === "me";
  
  return (
    <div
      id={`message-container-${message.id}`}
      className={`flex ${isMe ? "justify-end" : "justify-start"} group message-enter`}
    >
      <div
        id={`message-${message.id}`}
        className={`relative px-4 py-3 rounded-2xl max-w-xs lg:max-w-md break-words shadow-sm transition-all duration-200 ${
          isMe
            ? "bg-gradient-to-r from-indigo-500 to-purple-600 text-white ml-12"
            : "bg-white border border-slate-200 text-slate-800 mr-12"
        } hover:shadow-md group-hover:scale-[1.02]`}
        data-message-from={message.from}
        data-testid={`message-${message.from}-${message.id}`}
      >
        {/* Message tail */}
        <div
          className={`absolute top-3 w-2 h-2 rotate-45 ${
            isMe
              ? "bg-gradient-to-r from-indigo-500 to-purple-600 -right-1"
              : "bg-white border-l border-b border-slate-200 -left-1"
          }`}
        />
        
        <div id={`message-text-${message.id}`} className="relative z-10">
          {message.text}
        </div>
        
        {message.timestamp && (
          <div
            id={`message-timestamp-${message.id}`}
            className={`text-xs mt-2 opacity-60 relative z-10 ${
              isMe ? "text-indigo-100" : "text-slate-500"
            }`}
          >
            {message.timestamp.toLocaleTimeString([], {
              hour: '2-digit',
              minute: '2-digit'
            })}
          </div>
        )}
        
        {/* Subtle glow effect for sent messages */}
        {isMe && (
          <div className="absolute inset-0 rounded-2xl bg-gradient-to-r from-indigo-500 to-purple-600 opacity-20 blur-sm -z-10" />
        )}
      </div>
    </div>
  );
}
