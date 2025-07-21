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
  const params = new URLSearchParams(window.location.search);
  const SKIP_AUTH =
    params.get('skipAuth') === '1' ||
    import.meta.env.VITE_SKIP_AUTH === 'true';

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
    if (!isAuthenticated && !SKIP_AUTH) {
      console.warn('Cannot fetch conversations: User is not authenticated');
      return [];
    }

    setIsLoading(true);
    setError(null);
    
    try {
      const data = await conversationRepository.getUserConversations(options);
      setConversations(data || []);
      return data;
    } catch (err) {
      console.error('Error fetching conversations:', err);
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
  const createConversation = useCallback(async (characterId, title) => {
    if (!isAuthenticated && !SKIP_AUTH) {
      console.warn('Cannot create conversation: User is not authenticated');
      return null;
    }

    if (!characterId) {
      console.warn('Cannot create conversation: No character ID provided');
      return null;
    }

    setIsSaving(true);
    setError(null);
    
    try {
      const data = await conversationRepository.createConversation({
        character_id: characterId,
        title: title || undefined
      });
      
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
    if (!activeConversation) {
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
        conversation_id: activeConversation.id,
        role,
        content
      });
      
      // Update the active conversation with the new message
      setActiveConversation(prev => {
        if (!prev) return prev;
        
        const updatedMessages = prev.messages ? [...prev.messages, message] : [message];
        return {
          ...prev,
          messages: updatedMessages,
          updated_at: new Date().toISOString()
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
      
      return updatedConversation;
    } catch (err) {
      console.error('Error updating conversation:', err);
      setError('Failed to update conversation. Please try again.');
      return null;
    } finally {
      setIsSaving(false);
    }
  }, [isAuthenticated, conversations, activeConversation, SKIP_AUTH]);

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
