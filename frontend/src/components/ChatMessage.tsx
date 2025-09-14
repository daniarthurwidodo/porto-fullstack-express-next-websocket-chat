import { Message } from '@/hooks/useChat';

interface ChatMessageProps {
  message: Message;
}

export default function ChatMessage({ message }: ChatMessageProps) {
  return (
    <div
      id={`message-container-${message.id}`}
      className={`flex ${message.from === "me" ? "justify-end" : "justify-start"}`}
    >
      <div
        id={`message-${message.id}`}
        className={`px-3 py-2 rounded-2xl max-w-xs break-words ${
          message.from === "me"
            ? "bg-blue-500 text-white"
            : "bg-blue-200 text-blue-900"
        }`}
        data-message-from={message.from}
        data-testid={`message-${message.from}-${message.id}`}
      >
        <div id={`message-text-${message.id}`}>
          {message.text}
        </div>
        {message.timestamp && (
          <div
            id={`message-timestamp-${message.id}`}
            className={`text-xs mt-1 opacity-70 ${
              message.from === "me" ? "text-blue-100" : "text-blue-700"
            }`}
          >
            {message.timestamp.toLocaleTimeString([], {
              hour: '2-digit',
              minute: '2-digit'
            })}
          </div>
        )}
      </div>
    </div>
  );
}