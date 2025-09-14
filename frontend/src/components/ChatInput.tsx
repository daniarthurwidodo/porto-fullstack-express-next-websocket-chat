import { useState, KeyboardEvent } from 'react';

interface ChatInputProps {
  onSendMessage: (message: string) => void;
  disabled?: boolean;
}

export default function ChatInput({ onSendMessage, disabled = false }: ChatInputProps) {
  const [input, setInput] = useState("");

  const handleSend = () => {
    if (!input.trim() || disabled) return;
    onSendMessage(input);
    setInput("");
  };

  const handleKeyDown = (e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") {
      e.preventDefault();
      handleSend();
    }
  };

  return (
    <div id="chat-input-container" className="flex gap-2">
      <input
        id="chat-message-input"
        value={input}
        onChange={(e) => setInput(e.target.value)}
        onKeyDown={handleKeyDown}
        type="text"
        placeholder="Type a message..."
        className="flex-1 p-2 rounded-lg bg-blue-200 text-blue-900 placeholder-blue-500 disabled:opacity-50"
        aria-label="Type a message"
        data-testid="message-input"
        disabled={disabled}
      />
      <button
        id="send-message-button"
        onClick={handleSend}
        disabled={!input.trim() || disabled}
        className="px-4 py-2 bg-blue-500 rounded-lg hover:bg-blue-400 text-white disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
        aria-label="Send message"
        data-testid="send-button"
      >
        Send
      </button>
    </div>
  );
}