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
    <div id="chat-input-container" className="flex gap-3 items-end">
      <div className="flex-1 relative">
        <input
          id="chat-message-input"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={handleKeyDown}
          type="text"
          placeholder={disabled ? "User is offline..." : "Type your message..."}
          className="w-full px-4 py-3 pr-12 rounded-xl bg-slate-50 border border-slate-200 text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-300 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 resize-none"
          aria-label="Type a message"
          data-testid="message-input"
          disabled={disabled}
        />
        
        {/* Character count or typing indicator */}
        {input && !disabled && (
          <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
            <div className="text-xs text-slate-400">
              {input.length > 100 && (
                <span className={input.length > 200 ? 'text-red-500' : 'text-amber-500'}>
                  {input.length}/500
                </span>
              )}
            </div>
          </div>
        )}
      </div>
      
      <button
        id="send-message-button"
        onClick={handleSend}
        disabled={!input.trim() || disabled}
        className="flex items-center justify-center w-12 h-12 bg-gradient-to-r from-indigo-500 to-purple-600 hover:from-indigo-600 hover:to-purple-700 rounded-xl text-white disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:from-indigo-500 disabled:hover:to-purple-600 transition-all duration-200 hover-lift focus-ring shadow-lg hover:shadow-xl"
        aria-label="Send message"
        data-testid="send-button"
      >
        <svg 
          className="w-5 h-5" 
          fill="none" 
          stroke="currentColor" 
          viewBox="0 0 24 24"
        >
          <path 
            strokeLinecap="round" 
            strokeLinejoin="round" 
            strokeWidth={2} 
            d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" 
          />
        </svg>
      </button>
    </div>
  );
}
