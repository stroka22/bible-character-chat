import React from 'react';
import { type ChatMessage } from '../../services/supabase';

interface ChatBubbleProps {
  message: ChatMessage;
  characterName: string;
  characterAvatar?: string;
  isTyping?: boolean;
}

const ChatBubble: React.FC<ChatBubbleProps> = ({
  message,
  characterName,
  characterAvatar,
  isTyping = false,
}) => {
  const isUser = message.role === 'user';
  
  // Default avatar if none provided
  const avatarUrl = characterAvatar || 
    `https://ui-avatars.com/api/?name=${encodeURIComponent(characterName)}&background=random`;
  
  // Format timestamp
  const timestamp = new Date(message.created_at).toLocaleTimeString([], { 
    hour: '2-digit', 
    minute: '2-digit' 
  });

  return (
    <div className={`flex w-full mb-4 ${isUser ? 'justify-end' : 'justify-start'}`}>
      <div className={`flex max-w-[80%] ${isUser ? 'flex-row-reverse' : 'flex-row'}`}>
        {/* Avatar (only for character messages) */}
        {!isUser && (
          <div className="flex-shrink-0 mr-2">
            <img
              src={avatarUrl}
              alt={characterName}
              className="h-10 w-10 rounded-full object-cover border border-gray-200"
              onError={(e) => {
                // Fallback if image fails to load
                (e.target as HTMLImageElement).src = 
                  `https://ui-avatars.com/api/?name=${encodeURIComponent(characterName)}&background=random`;
              }}
            />
          </div>
        )}
        
        {/* Message content */}
        <div className={`flex flex-col ${isUser ? 'items-end mr-2' : 'items-start'}`}>
          {/* Character name (only for character messages) */}
          {!isUser && (
            <div className="text-sm font-medium text-gray-700 mb-1 ml-1">
              {characterName}
            </div>
          )}
          
          {/* Message bubble */}
          <div
            className={`
              rounded-2xl px-4 py-2 break-words
              ${isUser
                ? 'bg-primary-600 text-white rounded-tr-none'
                : 'bg-gray-100 text-gray-800 rounded-tl-none'
              }
            `}
          >
            <div className="whitespace-pre-wrap">
              {message.content}
              {isTyping && message.content === '' && (
                <span className="inline-flex items-center">
                  <span className="animate-pulse">.</span>
                  <span className="animate-pulse animation-delay-200">.</span>
                  <span className="animate-pulse animation-delay-400">.</span>
                </span>
              )}
            </div>
          </div>
          
          {/* Timestamp */}
          <div className={`text-xs text-gray-500 mt-1 ${isUser ? 'mr-1' : 'ml-1'}`}>
            {timestamp}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ChatBubble;
