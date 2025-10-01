import React, { createContext, useContext, useState, useCallback, useEffect } from 'react';
import conversationRepository from '../repositories/conversationRepository';
import { useAuth } from './AuthContext';

// Create the conversation context
const ConversationContext = createContext();

// Provider component
export const ConversationProvider = ({ children }) => {
  // Debug: track provider initialization
  console.log('[ConversationContext] Initializing provider');

  /* ------------------------------------------------------------------
   * Detect SKIP_AUTH flag
   * Allows bypassing Supabase auth in development/demo mode.
   * ------------------------------------------------------------------ */
  /* ------------------------------------------------------------------
   * Unified auth-bypass detection
   * ------------------------------------------------------------------
   * 1.  URL param  ?skipAuth=1
   * 2.  Env var    VITE_SKIP_AUTH=true   (Vercel preview/CI)
   * 3.  LocalStorage flag  bypass_auth=true (toggled in dev tools / UI)
   * ------------------------------------------------------------------ */
  const params = new URLSearchParams(window.location.search);

  let localBypass = false;
  try {
    localBypass =
      typeof window !== 'undefined' &&
      window.localStorage &&
      window.localStorage.getItem('bypass_auth') === 'true';
  } catch {
    /* ignore storage access errors */
  }

  const SKIP_AUTH =
    params.get('skipAuth') === '1' ||
    import.meta.env.VITE_SKIP_AUTH === 'true' ||
    localBypass;

  const { user, isAuthenticated } = useAuth();
  
  // State for conversations list
  const [conversations, setConversations] = useState([]);
  
  // State for active conversation
  const [activeConversation, setActiveConversation] = useState(null);
  
  // Loading states
  const [isLoading, setIsLoading] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  
  // Error state
  const [error, setError] = useState(null);

  // Clear error after 5 seconds
  useEffect(() => {
    if (error) {
      const timer = setTimeout(() => setError(null), 5000);
      return () => clearTimeout(timer);
    }
  }, [error]);

  // Reset active conversation when user changes
  useEffect(() => {
    setActiveConversation(null);
  }, [user]);

  /**
   * Fetch all conversations for the current user
   * @param {Object} options - Query options
   */
  const fetchConversations = useCallback(async (options = {}) => {
    // ---------- enhanced diagnostic logging ----------
    console.log(
      '[ConversationContext] fetchConversations called with options:',
      options,
    );
    console.log('[ConversationContext] Auth state:', {
      isAuthenticated,
      skipAuth: SKIP_AUTH,
    });

    // In local/mock mode allow fetching even when not authenticated
    if (!isAuthenticated && !SKIP_AUTH) {
      console.warn(
        '[ConversationContext] User is not authenticated – attempting to fetch conversations in bypass/mock mode',
      );
    }

    setIsLoading(true);
    setError(null);

    try {
      console.log(
        '[ConversationContext] Calling repository.getUserConversations()',
      );
      const data = await conversationRepository.getUserConversations(options);
      console.log(
        '[ConversationContext] Conversations received from repository:',
        data,
      );

      setConversations(data || []);
      return data;
    } catch (err) {
      console.error('[ConversationContext] Error fetching conversations:', err);
      setError('Failed to load conversations. Please try again.');
      return [];
    } finally {
      setIsLoading(false);
    }
  }, [isAuthenticated, SKIP_AUTH]);

  /**
   * Fetch a single conversation with its messages
   * @param {string} conversationId - ID of the conversation
   */
  const fetchConversationWithMessages = useCallback(async (conversationId) => {
    if (!conversationId) {
      console.warn('Cannot fetch conversation: No conversation ID provided');
      return null;
    }

    setIsLoading(true);
    setError(null);
    
    try {
      const data = await conversationRepository.getConversationWithMessages(conversationId);
      setActiveConversation(data);
      return data;
    } catch (err) {
      console.error('Error fetching conversation:', err);
      setError('Failed to load conversation. Please try again.');
      return null;
    } finally {
      setIsLoading(false);
    }
  }, []);

  /**
   * Create a new conversation
   * @param {string} characterId - ID of the character
   * @param {string} title - Optional title for the conversation
   */
  const createConversation = useCallback(async (characterIdOrOptions, maybeTitle) => {
    // Allow unauthenticated users to create mock-mode conversations so that
    // ChatContext.saveChat works in bypass/local mode. We still log a warning
    // for visibility but do NOT block the flow.
    if (!isAuthenticated && !SKIP_AUTH) {
      console.warn(
        '[ConversationContext] User is not authenticated – proceeding to create conversation in bypass mode',
      );
    }

    // Support both legacy signature (characterId, title) and
    // new object signature ({ character_id, title, type, participants })
    let payload;
    if (
      characterIdOrOptions &&
      typeof characterIdOrOptions === 'object' &&
      !Array.isArray(characterIdOrOptions)
    ) {
      payload = { ...characterIdOrOptions };
    } else {
      payload = {
        character_id: characterIdOrOptions,
        title: maybeTitle || undefined,
      };
    }

    if (!payload.character_id) {
      console.warn('Cannot create conversation: No character ID provided');
      return null;
    }

    setIsSaving(true);
    setError(null);
    
    try {
      const data = await conversationRepository.createConversation(payload);
      
      // Update the conversations list if we have it
      if (conversations.length > 0) {
        setConversations(prevConversations => [data, ...prevConversations]);
      }
      
      setActiveConversation(data);
      return data;
    } catch (err) {
      console.error('Error creating conversation:', err);
      setError('Failed to create conversation. Please try again.');
      return null;
    } finally {
      setIsSaving(false);
    }
  }, [isAuthenticated, conversations, SKIP_AUTH]);

  /**
   * Add a message to the active conversation
   * @param {string} content - Message content
   * @param {string} role - Message role ('user' or 'assistant')
   */
  const addMessage = useCallback(async (content, role) => {
    // Determine which conversation to append to.
    let targetConversationId = activeConversation?.id;
    // Fallback: the repo sets this synchronously when we create a conversation
    if (!targetConversationId) {
      targetConversationId = conversationRepository.activeConversationId;
    }
    if (!targetConversationId) {
      console.warn('Cannot add message: No active conversation');
      return null;
    }

    if (!content) {
      console.warn('Cannot add empty message');
      return null;
    }

    setIsSaving(true);
    
    try {
      const message = await conversationRepository.addMessage({
        conversation_id: targetConversationId,
        role,
        content
      });
      
      // Update the active conversation with the new message
      setActiveConversation(prev => {
        // If prev is missing or refers to another conversation, build a minimal base.
        const base =
          prev && prev.id === targetConversationId
            ? prev
            : { id: targetConversationId, messages: [] };

        const updatedMessages = base.messages
          ? [...base.messages, message]
          : [message];
        return {
          ...base,
          messages: updatedMessages,
          updated_at: new Date().toISOString(),
        };
      });
      
      return message;
    } catch (err) {
      console.error('Error adding message:', err);
      setError('Failed to save message. Please try again.');
      return null;
    } finally {
      setIsSaving(false);
    }
  }, [activeConversation]);

  /**
   * Update a conversation's properties
   * @param {string} conversationId - ID of the conversation
   * @param {Object} updates - Properties to update
   */
  const updateConversation = useCallback(async (conversationId, updates) => {
    if (!isAuthenticated && !SKIP_AUTH) {
      console.warn('Cannot update conversation: User is not authenticated');
      return null;
    }

    if (!conversationId) {
      console.warn('Cannot update conversation: No conversation ID provided');
      return null;
    }

    setIsSaving(true);
    
    try {
      const updatedConversation = await conversationRepository.updateConversation(conversationId, updates);
      
      // Update conversations list if it exists
      if (conversations.length > 0) {
        setConversations(prevConversations => 
          prevConversations.map(conv => 
            conv.id === conversationId ? updatedConversation : conv
          )
        );
      }
      
      // Update active conversation if it's the one being updated
      if (activeConversation && activeConversation.id === conversationId) {
        setActiveConversation(prev => ({
          ...prev,
          ...updatedConversation
        }));
      }

      /* ------------------------------------------------------------------
       * Keep different parts of the UI in-sync
       * ------------------------------------------------------------------
       * If the caller updated the `is_favorite` flag we want the
       * Conversations list (and any other components that rely on the
       * conversations array) to immediately reflect the change, even
       * when the update originated from the Chat page.
       *
       * We achieve this by triggering a fresh fetch after a favourite
       * status change.  This guarantees consistency between the Chat
       * view heart icon and the star shown on the My Conversations page.
       * ------------------------------------------------------------------ */
      if (Object.prototype.hasOwnProperty.call(updates, 'is_favorite')) {
        console.log(
          '[ConversationContext] Favourite status changed – refreshing list',
        );
        // Fire and forget – we don't need to await because UI will re-render
        fetchConversations().catch(err =>
          console.error(
            '[ConversationContext] Error refreshing conversations after favourite toggle:',
            err,
          ),
        );
      }
      
      return updatedConversation;
    } catch (err) {
      console.error('Error updating conversation:', err);
      setError('Failed to update conversation. Please try again.');
      return null;
    } finally {
      setIsSaving(false);
    }
  }, [
    isAuthenticated,
    conversations,
    activeConversation,
    SKIP_AUTH,
    fetchConversations,
  ]);

  /**
   * Delete a conversation
   * @param {string} conversationId - ID of the conversation to delete
   */
  const deleteConversation = useCallback(async (conversationId) => {
    if (!isAuthenticated && !SKIP_AUTH) {
      console.warn('Cannot delete conversation: User is not authenticated');
      return false;
    }

    if (!conversationId) {
      console.warn('Cannot delete conversation: No conversation ID provided');
      return false;
    }

    setIsSaving(true);
    
    try {
      const success = await conversationRepository.deleteConversation(conversationId);
      
      if (success) {
        // Remove from conversations list
        setConversations(prevConversations => 
          prevConversations.filter(conv => conv.id !== conversationId)
        );
        
        // Clear active conversation if it's the one being deleted
        if (activeConversation && activeConversation.id === conversationId) {
          setActiveConversation(null);
        }
      }
      
      return success;
    } catch (err) {
      console.error('Error deleting conversation:', err);
      setError('Failed to delete conversation. Please try again.');
      return false;
    } finally {
      setIsSaving(false);
    }
  }, [isAuthenticated, activeConversation, SKIP_AUTH]);

  /**
   * Share a conversation by generating a share code
   * @param {string} conversationId - ID of the conversation to share
   */
  const shareConversation = useCallback(async (conversationId) => {
    if (!isAuthenticated && !SKIP_AUTH) {
      console.warn('Cannot share conversation: User is not authenticated');
      return null;
    }

    if (!conversationId) {
      console.warn('Cannot share conversation: No conversation ID provided');
      return null;
    }

    setIsSaving(true);
    
    try {
      const shareCode = await conversationRepository.shareConversation(conversationId);
      
      // Update conversations list
      if (conversations.length > 0) {
        setConversations(prevConversations => 
          prevConversations.map(conv => 
            conv.id === conversationId 
              ? { ...conv, is_shared: true, share_code: shareCode }
              : conv
          )
        );
      }
      
      // Update active conversation if it's the one being shared
      if (activeConversation && activeConversation.id === conversationId) {
        setActiveConversation(prev => ({
          ...prev,
          is_shared: true,
          share_code: shareCode
        }));
      }
      
      return shareCode;
    } catch (err) {
      console.error('Error sharing conversation:', err);
      setError('Failed to share conversation. Please try again.');
      return null;
    } finally {
      setIsSaving(false);
    }
  }, [isAuthenticated, conversations, activeConversation, SKIP_AUTH]);

  /**
   * Stop sharing a conversation
   * @param {string} conversationId - ID of the conversation
   */
  const stopSharing = useCallback(async (conversationId) => {
    if (!isAuthenticated && !SKIP_AUTH) {
      console.warn('Cannot stop sharing conversation: User is not authenticated');
      return false;
    }

    if (!conversationId) {
      console.warn('Cannot stop sharing conversation: No conversation ID provided');
      return false;
    }

    setIsSaving(true);
    
    try {
      const updatedConversation = await conversationRepository.stopSharing(conversationId);
      
      // Update conversations list
      if (conversations.length > 0) {
        setConversations(prevConversations => 
          prevConversations.map(conv => 
            conv.id === conversationId 
              ? { ...conv, is_shared: false, share_code: null }
              : conv
          )
        );
      }
      
      // Update active conversation if it's the one being updated
      if (activeConversation && activeConversation.id === conversationId) {
        setActiveConversation(prev => ({
          ...prev,
          is_shared: false,
          share_code: null
        }));
      }
      
      return true;
    } catch (err) {
      console.error('Error stopping conversation sharing:', err);
      setError('Failed to stop sharing conversation. Please try again.');
      return false;
    } finally {
      setIsSaving(false);
    }
  }, [isAuthenticated, conversations, activeConversation, SKIP_AUTH]);

  /**
   * Get a shared conversation by share code
   * @param {string} shareCode - The share code
   */
  const getSharedConversation = useCallback(async (shareCode) => {
    if (!shareCode) {
      console.warn('Cannot get shared conversation: No share code provided');
      return null;
    }

    setIsLoading(true);
    setError(null);
    
    try {
      const data = await conversationRepository.getSharedConversation(shareCode);
      setActiveConversation(data);
      return data;
    } catch (err) {
      console.error('Error fetching shared conversation:', err);
      setError('Failed to load shared conversation. It may have been deleted or made private.');
      return null;
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Create the context value object
  const contextValue = {
    // State
    conversations,
    activeConversation,
    isLoading,
    isSaving,
    error,
    
    // Methods
    fetchConversations,
    fetchConversationWithMessages,
    createConversation,
    addMessage,
    updateConversation,
    deleteConversation,
    shareConversation,
    stopSharing,
    getSharedConversation,
    
    // Helper methods
    clearError: () => setError(null),
    clearActiveConversation: () => setActiveConversation(null)
  };

  // ------------------------------------------------------------------
  // Expose conversations for debugging purposes
  // ------------------------------------------------------------------
  useEffect(() => {
    if (typeof window !== 'undefined') {
      window.__debugConversations = conversations;
    }
  }, [conversations]);

  return (
    <ConversationContext.Provider value={contextValue}>
      {children}
    </ConversationContext.Provider>
  );
};

// Custom hook for using the conversation context
export const useConversation = () => {
  console.log('[ConversationContext] Hook called');

  try {
    const context = useContext(ConversationContext);

    if (!context) {
      console.error('[ConversationContext] No context found – provider missing?');
      // Safe fallback object with no-op methods
      const noop = () => {
        /* no-op */
      };
      const noopAsync = () => Promise.resolve(null);
      return {
        conversations: [],
        activeConversation: null,
        isLoading: false,
        isSaving: false,
        error: null,
        fetchConversations: noopAsync,
        fetchConversationWithMessages: noopAsync,
        createConversation: noopAsync,
        addMessage: noopAsync,
        updateConversation: noopAsync,
        deleteConversation: noopAsync,
        shareConversation: noopAsync,
        stopSharing: noopAsync,
        getSharedConversation: noopAsync,
        clearError: noop,
        clearActiveConversation: noop,
      };
    }

    return context;
  } catch (err) {
    console.error('[ConversationContext] Error in hook:', err);
    // Return fallback to avoid runtime crash
    const noop = () => {
      /* no-op */
    };
    const noopAsync = () => Promise.resolve(null);
    return {
      conversations: [],
      activeConversation: null,
      isLoading: false,
      isSaving: false,
      error: null,
      fetchConversations: noopAsync,
      fetchConversationWithMessages: noopAsync,
      createConversation: noopAsync,
      addMessage: noopAsync,
      updateConversation: noopAsync,
      deleteConversation: noopAsync,
      shareConversation: noopAsync,
      stopSharing: noopAsync,
      getSharedConversation: noopAsync,
      clearError: noop,
      clearActiveConversation: noop,
    };
  }
};

export default ConversationContext;
