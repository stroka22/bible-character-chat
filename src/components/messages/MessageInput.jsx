import React, { useState, useRef, useEffect } from 'react';
import { FaPaperPlane } from 'react-icons/fa';

const MessageInput = ({ onSendMessage, isLoading, disabled, error }) => {
  const [message, setMessage] = useState('');
  const textareaRef = useRef(null);

  // Focus the textarea when the component mounts
  useEffect(() => {
    if (textareaRef.current && !disabled) {
      textareaRef.current.focus();
    }
  }, [disabled]);

  // Also focus after sending a message
  useEffect(() => {
    if (!isLoading && textareaRef.current) {
      textareaRef.current.focus();
    }
  }, [isLoading]);

  const handleSubmit = (e) => {
    e.preventDefault();
    
    if (!message.trim() || isLoading || disabled) return;
    
    onSendMessage(message);
    setMessage('');
  };

  const handleKeyDown = (e) => {
    // Submit on Enter (without Shift)
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSubmit(e);
    }
  };

  return (
    <div className="relative">
      {error && (
        <div className="mb-2 rounded bg-red-100 p-2 text-sm text-red-700">
          {error}
        </div>
      )}
      
      <form onSubmit={handleSubmit} className="flex items-end">
        <textarea
          ref={textareaRef}
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder={disabled ? "Select a character to start chatting" : "Type your message..."}
          disabled={disabled || isLoading}
          className="flex-1 resize-none rounded-l-lg border border-gray-300 p-3 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
          rows="2"
          style={{ 
            caretColor: 'black', // Ensure cursor is visible
            cursor: 'text'       // Show text cursor on hover
          }}
        />
        
        <button
          type="submit"
          disabled={!message.trim() || isLoading || disabled}
          className={`flex h-full items-center justify-center rounded-r-lg px-4 ${
            !message.trim() || isLoading || disabled
              ? 'bg-gray-300 text-gray-500'
              : 'bg-blue-600 text-white hover:bg-blue-700'
          }`}
        >
          {isLoading ? (
            <div className="h-5 w-5 animate-spin rounded-full border-2 border-t-transparent border-white"></div>
          ) : (
            <FaPaperPlane />
          )}
        </button>
      </form>
    </div>
  );
};

export default MessageInput;
