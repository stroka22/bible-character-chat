import React, { createContext, useContext, useState, useCallback, useEffect, useRef } from 'react';
import { generateCharacterResponse } from '../services/openai';

// Create the chat context
const ChatContext = createContext();

// Provider component
export const ChatProvider = ({ children }) => {
  // Chat state
  const [messages, setMessages] = useState([]);
  const [character, setCharacter] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isTyping, setIsTyping] = useState(false);
  const [error, setError] = useState(null);
  const [chatId, setChatId] = useState(null);
  const [isChatSaved, setIsChatSaved] = useState(false);
  
  // Refs
  const messageIdCounter = useRef(1);
  const typingTimeoutRef = useRef(null);
  
  // Clear error after 5 seconds
  useEffect(() => {
    if (error) {
      const timer = setTimeout(() => setError(null), 5000);
      return () => clearTimeout(timer);
    }
  }, [error]);

  /**
   * Generate a unique message ID
   */
  const generateMessageId = useCallback(() => {
    const id = `msg-${Date.now()}-${messageIdCounter.current}`;
    messageIdCounter.current += 1;
    return id;
  }, []);

  /**
   * Load a conversation by ID
   */
  const loadConversation = useCallback(async (id) => {
    console.log('[MockChatContext] Would load conversation:', id);
    // In mock implementation, we don't actually load anything
    return null;
  }, []);

  /**
   * Load a shared conversation by share code
   */
  const loadSharedConversation = useCallback(async (code) => {
    console.log('[MockChatContext] Would load shared conversation:', code);
    // In mock implementation, we don't actually load anything
    return null;
  }, []);

  /**
   * Select a character to chat with
   */
  const selectCharacter = useCallback((characterData) => {
    setCharacter(characterData);
    
    // Clear previous chat if character changes
    setMessages([]);
    setChatId(null);
    setIsChatSaved(false);
    
    // Add greeting message if character has an opening line
    if (characterData?.opening_line) {
      const greeting = {
        id: generateMessageId(),
        role: 'assistant',
        content: characterData.opening_line,
        timestamp: new Date().toISOString()
      };
      
      setMessages([greeting]);
    }
  }, [generateMessageId]);

  /**
   * Send a message and get a mock response
   */
  const sendMessage = useCallback(async (content) => {
    if (!content || !character) return;

    // 1. append user message
    const userMessage = {
      id: generateMessageId(),
      role: 'user',
      content,
      timestamp: new Date().toISOString(),
    };
    setMessages(prev => [...prev, userMessage]);

    // 2. placeholder assistant message
    const assistantId = generateMessageId();
    setMessages(prev => [...prev, {
      id: assistantId,
      role: 'assistant',
      content: '',
      timestamp: new Date().toISOString(),
    }]);
    setIsTyping(true);

    try {
      // prepare message history for API (include newest user msg)
      const apiMsgs = [...messages, userMessage].map(m => ({
        role: m.role,
        content: m.content,
      }));

      const persona = character.description ||
        `a biblical figure known for ${character.scriptural_context || 'wisdom'}`;

      const reply = await generateCharacterResponse(
        character.name,
        persona,
        apiMsgs
      );

      // update assistant content
      setMessages(prev =>
        prev.map(m => m.id === assistantId ? { ...m, content: reply } : m)
      );
    } catch (err) {
      console.error('Error generating response:', err);
      setError('Failed to generate response. Please try again.');
      setMessages(prev =>
        prev.map(m =>
          m.id === assistantId
            ? { ...m, content: 'I apologize, but I am unable to respond at this moment.' }
            : m)
      );
    } finally {
      setIsTyping(false);
    }

    return userMessage;
  // include messages to ensure latest history is sent
  }, [character, messages, generateMessageId]);

  /**
   * Retry the last message (regenerate response)
   */
  const retryLastMessage = useCallback(() => {
    // Find the last user message
    const lastUserMessageIndex = [...messages].reverse().findIndex(msg => msg.role === 'user');
    
    if (lastUserMessageIndex === -1) {
      return;
    }
    
    // Get the actual index in the array (reverse the reverse index)
    const userMessageIndex = messages.length - 1 - lastUserMessageIndex;
    const userMessage = messages[userMessageIndex];
    
    // Remove all messages after the user message
    setMessages(prev => prev.slice(0, userMessageIndex + 1));
    
    // Re-send the message
    sendMessage(userMessage.content);
  }, [messages, sendMessage]);

  /**
   * Reset the chat
   */
  const resetChat = useCallback(() => {
    setMessages([]);
    setCharacter(null);
    setChatId(null);
    setIsChatSaved(false);
    setError(null);
  }, []);

  /**
   * Save the current chat
   */
  const saveChat = useCallback(async (title) => {
    if (!character || messages.length === 0) {
      setError('Cannot save an empty conversation');
      return false;
    }
    
    setIsLoading(true);
    
    try {
      // In mock implementation, we just log the action
      console.log('[MockChatContext] Would save chat with title:', title);
      
      // Simulate a delay
      await new Promise(resolve => setTimeout(resolve, 500));
      
      // Update local state as if save was successful
      setChatId('mock-chat-id-' + Date.now());
      setIsChatSaved(true);
      
      return true;
    } catch (err) {
      console.error('Error saving chat:', err);
      setError('Failed to save conversation. Please try again.');
      return false;
    } finally {
      setIsLoading(false);
    }
  }, [character, messages]);

  // Create the context value
  const contextValue = {
    // State
    messages,
    character,
    isLoading,
    isTyping,
    error,
    chatId,
    isChatSaved,
    
    // Methods
    selectCharacter,
    sendMessage,
    retryLastMessage,
    resetChat,
    saveChat,
    
    // Helper methods
    clearError: () => setError(null)
  };

  return (
    <ChatContext.Provider value={contextValue}>
      {children}
    </ChatContext.Provider>
  );
};

// Custom hook for using the chat context
export const useChat = () => {
  const context = useContext(ChatContext);
  
  if (!context) {
    throw new Error('useChat must be used within a ChatProvider');
  }
  
  return context;
};

export default ChatContext;
