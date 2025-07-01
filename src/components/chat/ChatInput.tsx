import React, { useState, useRef, useEffect } from 'react';
import { useChat } from '../../contexts/ChatContext';

interface ChatInputProps {
  disabled?: boolean;
  placeholder?: string;
}

const ChatInput: React.FC<ChatInputProps> = ({
  disabled = false,
  placeholder = "Ask me anything..."
}) => {
  const [message, setMessage] = useState<string>('');
  const inputRef = useRef<HTMLTextAreaElement>(null);
  const { sendMessage, isTyping, error } = useChat();

  // Auto-focus the input when the component mounts
  useEffect(() => {
    if (inputRef.current) {
      inputRef.current.focus();
    }
  }, []);

  // Auto-resize the textarea as content grows
  const handleInput = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const textarea = e.target;
    setMessage(textarea.value);
    
    // Reset height to auto to get the correct scrollHeight
    textarea.style.height = 'auto';
    
    // Set the height based on scrollHeight (with max-height applied via CSS)
    textarea.style.height = `${Math.min(textarea.scrollHeight, 150)}px`;
  };

  // Handle message submission
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!message.trim() || disabled || isTyping) {
      return;
    }
    
    try {
      await sendMessage(message.trim());
      setMessage('');
      
      // Reset textarea height
      if (inputRef.current) {
        inputRef.current.style.height = 'auto';
        inputRef.current.focus();
      }
    } catch (err) {
      console.error('Error sending message:', err);
    }
  };

  // Handle keyboard shortcuts (Ctrl+Enter or Cmd+Enter to send)
  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if ((e.ctrlKey || e.metaKey) && e.key === 'Enter') {
      handleSubmit(e);
    }
  };

  return (
    <form 
      onSubmit={handleSubmit}
      className="flex w-full items-end border-t border-gray-200 bg-white p-3 shadow-sm"
    >
      <div className="relative flex-grow">
        <textarea
          ref={inputRef}
          value={message}
          onChange={handleInput}
          onKeyDown={handleKeyDown}
          placeholder={placeholder}
          disabled={disabled || isTyping}
          className={`
            w-full resize-none rounded-lg border border-gray-300 py-3 pl-4 pr-12
            focus:border-primary-500 focus:outline-none focus:ring-2 focus:ring-primary-200
            disabled:bg-gray-100 disabled:text-gray-500
            ${error ? 'border-red-300 focus:border-red-500 focus:ring-red-200' : ''}
          `}
          rows={1}
          style={{ minHeight: '50px', maxHeight: '150px' }}
        />
        
        <button
          type="submit"
          disabled={!message.trim() || disabled || isTyping}
          className={`
            absolute bottom-2 right-2 rounded-full p-2
            transition-colors duration-200
            ${message.trim() && !disabled && !isTyping
              ? 'bg-primary-600 text-white hover:bg-primary-700'
              : 'bg-gray-200 text-gray-400 cursor-not-allowed'
            }
          `}
          aria-label="Send message"
        >
          <svg 
            xmlns="http://www.w3.org/2000/svg" 
            viewBox="0 0 24 24" 
            fill="currentColor" 
            className="h-5 w-5"
          >
            <path 
              d="M3.478 2.405a.75.75 0 00-.926.94l2.432 7.905H13.5a.75.75 0 010 1.5H4.984l-2.432 7.905a.75.75 0 00.926.94 60.519 60.519 0 0018.445-8.986.75.75 0 000-1.218A60.517 60.517 0 003.478 2.405z" 
            />
          </svg>
        </button>
      </div>
      
      {/* Optional keyboard shortcut hint */}
      <div className="ml-2 hidden text-xs text-gray-400 md:block">
        Press <kbd className="rounded border border-gray-300 bg-gray-100 px-1 font-sans">Ctrl</kbd> + <kbd className="rounded border border-gray-300 bg-gray-100 px-1 font-sans">Enter</kbd> to send
      </div>
    </form>
  );
};

export default ChatInput;
