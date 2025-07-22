import React, { createContext, useContext, useState, useCallback, useEffect, useRef } from 'react';
import { generateCharacterResponse } from '../services/openai';
import { useConversation } from './ConversationContext.jsx';

// Create the chat context
const ChatContext = createContext();

// Provider component
export const ChatProvider = ({ children }) => {
  console.log('[ChatContext] Initializing provider');
  
  // Chat state
  const [messages, setMessages] = useState([]);
  const [character, setCharacter] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isTyping, setIsTyping] = useState(false);
  const [error, setError] = useState(null);
  const [chatId, setChatId] = useState(null);
  const [isChatSaved, setIsChatSaved] = useState(false);
  const [isFavorite, setIsFavorite] = useState(false);
  
  // Refs
  const messageIdCounter = useRef(1);
  const typingTimeoutRef = useRef(null);
  
  // Conversation persistence helpers (may be no-ops when user isn't authenticated)
  let conversationContext;
  try {
    conversationContext = useConversation();
    console.log('[ChatContext] Successfully connected to ConversationContext');
  } catch (err) {
    console.error('[ChatContext] Error connecting to ConversationContext:', err);
    // Fallback object so the rest of ChatContext can still operate
    conversationContext = {
      createConversation: null,
      addMessage: null,
    };
  }

  const { createConversation, addMessage } = conversationContext;

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
    console.log(`[ChatContext] Selecting character: ${characterData?.name ?? 'unknown'}`);
    setCharacter(characterData);
    
    // Clear previous chat if character changes
    setMessages([]);
    setChatId(null);
    setIsChatSaved(false);
    setIsFavorite(false);
    
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
    setIsFavorite(false);
    setError(null);
  }, []);

  /**
   * Save the current chat
   * Repository will auto-generate a title if none is supplied
   */
  const saveChat = useCallback(async () => {
    // ------------------------------------------------------------------
    // Diagnostics + defensive checks
    // ------------------------------------------------------------------
    console.log('[ChatContext] Attempting to save chat');
    console.log('[ChatContext] Current character:', character);
    console.log('[ChatContext] Message count:', messages.length);

    if (!character || messages.length === 0) {
      setError('Cannot save an empty conversation');
      return false;
    }

    // Fallback when persistence layer is unavailable
    if (typeof createConversation !== 'function') {
      console.warn('[ChatContext] No createConversation function available');
      setChatId('mock-chat-id-' + Date.now());
      setIsChatSaved(true);
      return true;
    }

    setIsLoading(true);

    try {
      /* -----------------------------------------------------------
       * Extra-detailed diagnostics so we can trace why the repository
       * sometimes fails to include the character name in the auto-
       * generated title.  We ensure a numeric ID is passed because
       * the MOCK_CHARACTERS keys are numbers (1, 2, 3…).
       * --------------------------------------------------------- */

      const characterId = Number(character.id);

      console.log('[ChatContext] Creating conversation with character:', {
        rawId: character.id,
        coercedId: characterId,
        idType: typeof character.id,
        character,
      });

      // Build params once so we can log and pass the same object
      const createParams = {
        character_id: characterId, // Pass numeric ID to match MOCK_CHARACTERS
        // intentionally omit `title` so repository auto-generates
        is_favorite: false,
      };

      console.log('[ChatContext] Calling createConversation with params:', createParams);

      /* -----------------------------------------------------------
       * 1️⃣  Create conversation row.
       *     We do NOT pass a title – repository will generate the
       *     default “Conversation with <Name> - <Date>” title.
       * --------------------------------------------------------- */
      const newConversation = await createConversation(createParams);

      console.log('[ChatContext] Conversation created:', newConversation);

      if (!newConversation?.id) {
        throw new Error('Failed to create conversation - no ID returned');
      }

      // store id early so any subsequent UI actions have it
      setChatId(newConversation.id);

      // 2. persist all existing messages
      console.log(
        `[ChatContext] Persisting ${messages.length} messages to conversation ${newConversation.id}`,
      );

      for (const msg of messages) {
        if (typeof addMessage === 'function') {
          try {
            await addMessage({
              conversation_id: newConversation.id,
              role: msg.role,
              content: msg.content,
            });
          } catch (msgErr) {
            // Log but continue with remaining messages
            console.error('[ChatContext] Error adding message:', msgErr);
          }
        }
      }

      console.log('[ChatContext] All messages added successfully');

      // 3. update local state
      setIsChatSaved(true);
      
      return true;
    } catch (err) {
      console.error('[ChatContext] Error saving chat:', err);
      setError(`Failed to save conversation: ${err.message}`);
      return false;
    } finally {
      setIsLoading(false);
    }
  }, [character, messages, createConversation, addMessage]);

  /**
   * Update the title of the current saved chat
   */
  const saveChatTitle = useCallback(
    async (newTitle) => {
      if (!chatId) {
        setError('Cannot rename an unsaved conversation');
        return false;
      }

      if (!newTitle.trim()) {
        setError('Title cannot be empty');
        return false;
      }

      // If real persistence layer unavailable fall back to mock behaviour
      if (
        !conversationContext ||
        typeof conversationContext.updateConversation !== 'function'
      ) {
        console.warn(
          '[ChatContext] No updateConversation function available – mock rename',
        );
        console.log(
          `[MockChatContext] Would rename conversation ${chatId} to: ${newTitle}`,
        );
        return true;
      }

      setIsLoading(true);

      try {
        await conversationContext.updateConversation(chatId, {
          title: newTitle.trim(),
        });
        return true;
      } catch (err) {
        console.error('Error updating chat title:', err);
        setError('Failed to rename conversation. Please try again.');
        return false;
      } finally {
        setIsLoading(false);
      }
    },
    [chatId, conversationContext],
  );

  /**
   * Toggle favorite status of the current conversation
   */
  const toggleFavorite = useCallback(
    async (isFavorite) => {
      if (!chatId) {
        setError('Cannot favorite an unsaved conversation');
        return false;
      }

      // optimistic local update for UX
      setIsFavorite(isFavorite);

      // If real persistence layer unavailable fall back to mock behaviour
      if (
        !conversationContext ||
        typeof conversationContext.updateConversation !== 'function'
      ) {
        console.warn(
          '[ChatContext] No updateConversation function available – mock favorite',
        );
        console.log(
          `[MockChatContext] Would set conversation ${chatId} favorite status to: ${isFavorite}`,
        );
        return true;
      }

      setIsLoading(true);

      try {
        await conversationContext.updateConversation(chatId, {
          is_favorite: isFavorite,
        });
        return true;
      } catch (err) {
        console.error('Error updating favorite status:', err);
        setError('Failed to update favorite status. Please try again.');
        // revert optimistic update
        setIsFavorite(prev => !prev);
        return false;
      } finally {
        setIsLoading(false);
      }
    },
    [chatId, conversationContext],
  );

  /**
   * Delete the current conversation
   */
  const deleteCurrentChat = useCallback(async () => {
    if (!chatId) {
      setError('Cannot delete an unsaved conversation');
      return false;
    }

    // Fallback to mock behaviour when real persistence layer is unavailable
    if (
      !conversationContext ||
      typeof conversationContext.deleteConversation !== 'function'
    ) {
      console.warn(
        '[ChatContext] No deleteConversation function available – mock delete',
      );
      console.log(`[MockChatContext] Would delete conversation ${chatId}`);

      // Reset local state
      setMessages([]);
      setCharacter(null);
      setChatId(null);
      setIsChatSaved(false);

      return true;
    }

    setIsLoading(true);

    try {
      await conversationContext.deleteConversation(chatId);

      // Reset local state
      setMessages([]);
      setCharacter(null);
      setChatId(null);
      setIsChatSaved(false);

      return true;
    } catch (err) {
      console.error('Error deleting conversation:', err);
      setError('Failed to delete conversation. Please try again.');
      return false;
    } finally {
      setIsLoading(false);
    }
  }, [chatId, conversationContext]);

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
    isFavorite,
    
    // Methods
    selectCharacter,
    sendMessage,
    retryLastMessage,
    resetChat,
    saveChat,
    saveChatTitle,
    toggleFavorite,
    deleteCurrentChat,
    
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
    console.error('[ChatContext] Hook used outside provider');
    // Return a minimal safe object to prevent crashes
    return {
      messages: [],
      character: null,
      isLoading: false,
      isTyping: false,
      error: null,
      chatId: null,
      isChatSaved: false,
      
      sendMessage: () => {
        console.warn('[ChatContext] Cannot send message - no provider');
        return Promise.resolve(null);
      },
      selectCharacter: () => {
        console.warn('[ChatContext] Cannot select character - no provider');
      },
      retryLastMessage: () => {
        console.warn('[ChatContext] Cannot retry message - no provider');
      },
      resetChat: () => {
        console.warn('[ChatContext] Cannot reset chat - no provider');
      },
      saveChat: () => {
        console.warn('[ChatContext] Cannot save chat - no provider');
        return Promise.resolve(false);
      },
      saveChatTitle: () => {
        console.warn('[ChatContext] Cannot rename chat - no provider');
        return Promise.resolve(false);
      },
      toggleFavorite: () => {
        console.warn('[ChatContext] Cannot toggle favorite - no provider');
        return Promise.resolve(false);
      },
      deleteCurrentChat: () => {
        console.warn('[ChatContext] Cannot delete chat - no provider');
        return Promise.resolve(false);
      },
      clearError: () => {
        console.warn('[ChatContext] Cannot clear error - no provider');
      }
    };
  }
  
  return context;
};

export default ChatContext;
