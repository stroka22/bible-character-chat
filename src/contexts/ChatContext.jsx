import React, { createContext, useContext, useState, useCallback, useEffect, useRef } from 'react';
import { generateCharacterResponse } from '../services/openai';
import { useConversation } from './ConversationContext.jsx';
import { useAuth } from './AuthContext';
import { usePremium } from '../hooks/usePremium';
import { characterRepository } from '../repositories/characterRepository';
import {
  loadAccountTierSettings,
  isCharacterFree,
  hasReachedMessageLimit,
} from '../utils/accountTier';

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
  /* ------------------------------------------------------------------
   * Optional system-level lesson context injected into every prompt
   * ------------------------------------------------------------------ */
  const [systemContext, setSystemContext] = useState(null);
  
  // Refs
  const messageIdCounter = useRef(1);
  const typingTimeoutRef = useRef(null);
  /* ------------------------------------------------------------------
   * Premium / subscription state
   * ------------------------------------------------------------------ */
  const { user } = useAuth();
  const { isPremium } = usePremium();
  /* -------------------------------------------------------------
   * Tier settings – keep reactive so admin changes propagate
   * across tabs (storage event) and after page refresh.
   * ----------------------------------------------------------- */
  const [tierSettings, setTierSettings] = useState(loadAccountTierSettings());

  /* Refresh on initial mount (covers env-default fallback) */
  useEffect(() => {
    setTierSettings(loadAccountTierSettings());
  }, []);

  /* Listen for cross-tab updates made by AccountTierManagement */
  useEffect(() => {
    const handleStorage = (e) => {
      // Support per-organisation cache keys (e.g. `accountTierSettings:org1`)
      if (e.key && e.key.startsWith('accountTierSettings')) {
        setTierSettings(loadAccountTierSettings());
      }
    };
    /* Same-tab updates (AccountTierManagement dispatches a custom
       event because the native 'storage' event does **not** fire in
       the tab that called localStorage.setItem). */
    const handleCustomEvent = () => {
      setTierSettings(loadAccountTierSettings());
    };

    window.addEventListener('storage', handleStorage);
    window.addEventListener('accountTierSettingsChanged', handleCustomEvent);

    return () => {
      window.removeEventListener('storage', handleStorage);
      window.removeEventListener('accountTierSettingsChanged', handleCustomEvent);
    };
  }, []);
  
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

    /* --------------------------------------------------------------
     *  Premium gating
     * ------------------------------------------------------------ */
    // 1) Character access
    // Allow chats launched from a Bible study/series context to bypass
    // character premium gating. The study/series page already enforces
    // access (free vs premium). Presence of systemContext indicates
    // we're in such a guided context.
    const isGuidedContext = !!systemContext;
    if (
      character &&
      !isPremium &&
      !isGuidedContext &&
      !isCharacterFree(character, tierSettings)
    ) {
      setError('This is a premium character. Please upgrade to chat.');
      return;
    }

    // 2) Message limit for free users
    const userMessageCount = messages.filter((m) => m.role === 'user').length;
    if (!isPremium && hasReachedMessageLimit(userMessageCount, tierSettings)) {
      setError(
        'You’ve reached the free conversation limit. Upgrade to a Premium account for unlimited conversations and all premium features.'
      );
      return;
    }

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
      let apiMsgs = [...messages, userMessage].map(m => ({
        role: m.role,
        content: m.content,
      }));

      // Inject lesson/system context when available
      if (systemContext && typeof systemContext === 'string' && systemContext.trim() !== '') {
        apiMsgs.unshift({ role: 'system', content: systemContext.trim() });
      }

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
  }, [character, messages, generateMessageId, isPremium, tierSettings]);

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
   * Programmatically append an assistant message
   * (used for auto-intros, system notices, etc.)
   */
  const postAssistantMessage = useCallback(
    (content) => {
      if (!character || !content) return;
      const msg = {
        id: generateMessageId(),
        role: 'assistant',
        content,
        timestamp: new Date().toISOString(),
      };
      setMessages((prev) => [...prev, msg]);
    },
    [character, generateMessageId],
  );

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
  const saveChat = useCallback(async (overrideTitle) => {
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
       * Preserve original character ID (can be string/UUID or number)
       * --------------------------------------------------------- */
      const characterId = character?.id;
      if (!characterId) {
        throw new Error('Character ID missing');
      }

      console.log('[ChatContext] Preserved characterId:', characterId);

      console.log('[ChatContext] Creating conversation via ConversationContext');

      // 1️⃣  Create conversation
      const title = (
        typeof overrideTitle === 'string' && overrideTitle.trim() !== ''
      )
        ? overrideTitle.trim()
        : `Conversation with ${
            character?.name ?? 'Unknown'
          } - ${new Date().toLocaleDateString()}`;
      const newConversation = await createConversation(characterId, title);

      console.log('[ChatContext] Conversation created:', newConversation);

      if (!newConversation?.id) {
        throw new Error('Failed to create conversation - no ID returned');
      }

      // store id early
      setChatId(newConversation.id);

      // 2️⃣  Persist existing messages
      console.log(
        `[ChatContext] Persisting ${messages.length} messages to conversation ${newConversation.id}`,
      );

      for (const msg of messages) {
        if (typeof addMessage === 'function') {
          try {
            await addMessage(msg.content, msg.role);
          } catch (msgErr) {
            console.error('[ChatContext] Error adding message:', msgErr);
          }
        }
      }

      console.log('[ChatContext] All messages added successfully');

      // 3️⃣  Update local state
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
   * Hydrate ChatContext state from an already-saved conversation
   * (used by /chat/:conversationId route when ConversationProvider
   *  has fetched a conversation with its messages)
   */
  const hydrateFromConversation = useCallback((conversation) => {
    if (!conversation) return;

    try {
      // 1️⃣  Character (prefer embedded characters object)
      let convCharacter =
        conversation.characters ||
        (conversation.character_id
          ? { id: conversation.character_id, name: 'Unknown' }
          : null);

      setCharacter(convCharacter);

      /* ----------------------------------------------------------------
       * If the embedded character data is missing or still “Unknown”,
       * attempt to fetch the full character details from repository.
       * This fixes cases where Isaiah is restored but defaults to Moses.
       * ----------------------------------------------------------------*/
      if (
        (!convCharacter || !convCharacter.name || convCharacter.name === 'Unknown') &&
        conversation.character_id
      ) {
        // Normalise character_id: some historical records stored the
        // entire character object in character_id, producing "[object Object]"
        // in Supabase queries. Extract the primitive id when needed.
        const rawId = conversation.character_id;
        const normalisedId =
          rawId && typeof rawId === 'object'
            ? (rawId.id ?? rawId.uuid ?? rawId.value ?? null)
            : rawId;

        if (!normalisedId) {
          console.warn('[ChatContext] character_id malformed on conversation; cannot resolve id');
        }

        characterRepository
          .getById(normalisedId)
          .then((fetched) => {
            if (fetched) {
              setCharacter(fetched);
            }
          })
          .catch((err) =>
            console.warn(
              '[ChatContext] Unable to fetch character during hydration:',
              err,
            ),
          );
      }

      // 2️⃣  Messages – normalise to ChatContext shape
      const normalisedMessages =
        (conversation.messages || []).map((m) => ({
          id: m.id || generateMessageId(),
          role: m.role,
          content: m.content,
          timestamp: m.created_at || new Date().toISOString(),
        })) || [];

      setMessages(normalisedMessages);

      // 3️⃣  Meta flags
      setChatId(conversation.id);
      setIsChatSaved(true);
      setIsFavorite(!!conversation.is_favorite);

      // Clear residual error
      setError(null);
    } catch (err) {
      console.error('[ChatContext] Failed to hydrate from conversation:', err);
      setError('Unable to load conversation. Please try again.');
    }
  }, [generateMessageId]);

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
        console.log('[ChatContext] Updating favorite status:', {
          chatId,
          newStatus: isFavorite,
        });

        // Perform update – ConversationContext will refresh list on favourite change
        await conversationContext.updateConversation(chatId, {
          is_favorite: isFavorite,
        });

        console.log('[ChatContext] Favorite status updated successfully');
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
    // Lesson / system context
    setLessonContext: (text) => setSystemContext(text || null),
    // Helper to push assistant messages
    postAssistantMessage,
    
    // Helper methods
    clearError: () => setError(null),
    hydrateFromConversation,
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
      postAssistantMessage: () => {
        console.warn('[ChatContext] Cannot post assistant message - no provider');
      },
      clearError: () => {
        console.warn('[ChatContext] Cannot clear error - no provider');
      }
    };
  }
  
  return context;
};

export default ChatContext;
