import React, { useEffect, useState, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useChat } from '../../contexts/ChatContext.jsx';
import { useCharacters } from '../../contexts/CharacterContext.jsx';
import MessageList from '../messages/MessageList.jsx';
import MessageInput from '../messages/MessageInput.jsx';
import ChatHeader from './ChatHeader.jsx';
import ChatActions from './ChatActions.js';
import CharacterSelection from '../characters/CharacterSelection.jsx';

const Chat = () => {
  const { id: conversationId } = useParams();
  const navigate = useNavigate();
  
  // Get characters from context
  const { characters, isLoading: charactersLoading } = useCharacters();
  
  // Chat context for the current conversation
  const { 
    messages, 
    character, 
    selectCharacter, 
    sendMessage, 
    retryLastMessage,
    isLoading,
    isTyping,
    error,
    chatId,
    isChatSaved,
    resetChat
  } = useChat();
  
  // Local state for character selection
  const [showCharacterSelection, setShowCharacterSelection] = useState(!character && !conversationId);
  
  // Ref for scrolling to bottom
  const messagesEndRef = useRef(null);
  
  // Scroll to bottom when messages change
  useEffect(() => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages]);
  
  // Load conversation if ID is provided
  useEffect(() => {
    if (conversationId) {
      // Would fetch conversation here in a real app
      console.log(`Would load conversation with ID: ${conversationId}`);
    }
  }, [conversationId]);
  
  // Reset chat when component unmounts
  useEffect(() => {
    return () => {
      if (!isChatSaved) {
        resetChat();
      }
    };
  }, [isChatSaved, resetChat]);
  
  // Handle character selection
  const handleCharacterSelect = (selectedCharacter) => {
    console.log('Character selected:', selectedCharacter);
    console.log(
      'Character ID type:',
      selectedCharacter ? typeof selectedCharacter.id : 'undefined character'
    );
    console.log(
      'Character ID value:',
      selectedCharacter ? selectedCharacter.id : 'undefined character'
    );
    console.log('Full character object:', JSON.stringify(selectedCharacter, null, 2));
    
    selectCharacter(selectedCharacter);
    setShowCharacterSelection(false);
  };
  
  // Handle new chat button
  const handleNewChat = () => {
    resetChat();
    setShowCharacterSelection(true);
  };
  
  // If we're loading characters and don't have a conversation ID, show loading
  if (charactersLoading && !conversationId) {
    return (
      <div className="flex h-screen items-center justify-center">
        <div className="text-center">
          <div className="mb-4 h-12 w-12 animate-spin rounded-full border-t-2 border-b-2 border-blue-500 mx-auto"></div>
          <p className="text-lg text-gray-600">Loading characters...</p>
        </div>
      </div>
    );
  }
  
  // Show character selection if needed
  if (showCharacterSelection) {
    return (
      <CharacterSelection 
        characters={characters || []} 
        onSelect={handleCharacterSelect}
        isLoading={charactersLoading}
      />
    );
  }
  
  return (
    <div className="flex h-screen flex-col bg-gray-50">
      {/* Chat header with character info */}
      <ChatHeader 
        character={character} 
        onNewChat={handleNewChat}
        isSaved={isChatSaved}
        conversationId={chatId || conversationId}
      />
      
      {/* Main chat area with messages */}
      <div className="flex-1 overflow-y-auto p-4">
        {messages.length === 0 ? (
          <div className="flex h-full items-center justify-center">
            <div className="text-center">
              <h2 className="mb-2 text-xl font-semibold text-gray-700">
                Start Your Conversation
              </h2>
              <p className="text-gray-500">
                Send a message to begin chatting with {character?.name}
              </p>
            </div>
          </div>
        ) : (
          <MessageList 
            messages={messages} 
            character={character}
            onRetry={messages.length > 0 ? retryLastMessage : null}
          />
        )}
        <div ref={messagesEndRef} />
      </div>
      
      {/* Message input area */}
      <div className="border-t border-gray-200 bg-white p-4">
        <MessageInput 
          onSendMessage={sendMessage} 
          isLoading={isLoading || isTyping}
          disabled={!character}
          error={error}
        />
        
        {/* Chat actions (save, share, etc.) */}
        <ChatActions className="mt-4" />
      </div>
    </div>
  );
};

export default Chat;
