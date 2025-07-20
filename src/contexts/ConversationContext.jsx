import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { conversationRepository } from '../repositories/conversationRepository';
import { useAuth } from './AuthContext';

// Create the context
const ConversationContext = createContext(null);

/**
 * Provider component for conversation management
 */
export const ConversationProvider = ({ children }) => {
  const { user, isAuthenticated } = useAuth();
  
  // State for conversations list
  const [conversations, setConversations] = useState([]);
  const [activeConversation, setActiveConversation] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  
  // Track if we should fetch conversations (only when authenticated)
  const shouldFetchConversations = isAuthenticated && user?.id;

  /**
   * Fetch all conversations for the current user
   */
  const fetchConversations = useCallback(async (options = {}) => {
    if (!shouldFetchConversations) return;
    
    setIsLoading(true);
    setError(null);
    
    try {
      const data = await conversationRepository.getUserConversations(options);
      setConversations(data || []);
    } catch (err) {
      console.error('Error fetching conversations:', err);
      setError(err.message || 'Failed to load conversations');
    } finally {
      setIsLoading(false);
    }
  }, [shouldFetchConversations]);

  /**
   * Fetch a single conversation with its messages
   */
  const fetchConversationWithMessages = useCallback(async (conversationId, options = {}) => {
    if (!conversationId || !shouldFetchConversations) return null;
    
    setIsLoading(true);
    setError(null);
    
    try {
      const conversation = await conversationRepository.getConversationWithMessages(
        conversationId, 
        options
      );
      
      setActiveConversation(conversation);
      return conversation;
    } catch (err) {
      console.error('Error fetching conversation:', err);
      setError(err.message || 'Failed to load conversation');
      return null;
    } finally {
      setIsLoading(false);
    }
  }, [shouldFetchConversations]);

  /**
   * Create a new conversation
   */
  const createConversation = useCallback(async (characterId, title) => {
    if (!shouldFetchConversations) return null;
    
    setIsLoading(true);
    setError(null);
    
    try {
      const newConversation = await conversationRepository.createConversation({
        character_id: characterId,
        title
      });
      
      // Update the conversations list with the new conversation
      setConversations(prev => [newConversation, ...prev]);
      
      // Set as active conversation
      setActiveConversation({
        ...newConversation,
        messages: []
      });
      
      return newConversation;
    } catch (err) {
      console.error('Error creating conversation:', err);
      setError(err.message || 'Failed to create conversation');
      return null;
    } finally {
      setIsLoading(false);
    }
  }, [shouldFetchConversations]);

  /**
   * Add a message to the active conversation
   */
  const addMessage = useCallback(async (content, role = 'user') => {
    if (!activeConversation?.id || !shouldFetchConversations) return null;
    
    setIsLoading(true);
    setError(null);
    
    try {
      const newMessage = await conversationRepository.addMessage({
        conversation_id: activeConversation.id,
        role,
        content
      });
      
      // Update the active conversation with the new message
      setActiveConversation(prev => ({
        ...prev,
        messages: [...(prev.messages || []), newMessage],
        updated_at: new Date().toISOString()
      }));
      
      return newMessage;
    } catch (err) {
      console.error('Error adding message:', err);
      setError(err.message || 'Failed to send message');
      return null;
    } finally {
      setIsLoading(false);
    }
  }, [activeConversation, shouldFetchConversations]);

  /**
   * Update a conversation (title, favorite status, etc.)
   */
  const updateConversation = useCallback(async (conversationId, updates) => {
    if (!conversationId || !shouldFetchConversations) return null;
    
    setIsLoading(true);
    setError(null);
    
    try {
      const updatedConversation = await conversationRepository.updateConversation(
        conversationId, 
        updates
      );
      
      // Update in the conversations list
      setConversations(prev => 
        prev.map(conv => 
          conv.id === conversationId ? { ...conv, ...updates } : conv
        )
      );
      
      // Update active conversation if it's the one being updated
      if (activeConversation?.id === conversationId) {
        setActiveConversation(prev => ({ ...prev, ...updates }));
      }
      
      return updatedConversation;
    } catch (err) {
      console.error('Error updating conversation:', err);
      setError(err.message || 'Failed to update conversation');
      return null;
    } finally {
      setIsLoading(false);
    }
  }, [activeConversation, shouldFetchConversations]);

  /**
   * Delete a conversation (soft delete)
   */
  const deleteConversation = useCallback(async (conversationId) => {
    if (!conversationId || !shouldFetchConversations) return false;
    
    setIsLoading(true);
    setError(null);
    
    try {
      const success = await conversationRepository.deleteConversation(conversationId);
      
      if (success) {
        // Remove from the conversations list
        setConversations(prev => 
          prev.filter(conv => conv.id !== conversationId)
        );
        
        // Clear active conversation if it's the one being deleted
        if (activeConversation?.id === conversationId) {
          setActiveConversation(null);
        }
      }
      
      return success;
    } catch (err) {
      console.error('Error deleting conversation:', err);
      setError(err.message || 'Failed to delete conversation');
      return false;
    } finally {
      setIsLoading(false);
    }
  }, [activeConversation, shouldFetchConversations]);

  /**
   * Share a conversation
   */
  const shareConversation = useCallback(async (conversationId) => {
    if (!conversationId || !shouldFetchConversations) return null;
    
    setIsLoading(true);
    setError(null);
    
    try {
      const shareCode = await conversationRepository.shareConversation(conversationId);
      
      // Update the conversation in the list
      setConversations(prev => 
        prev.map(conv => 
          conv.id === conversationId 
            ? { ...conv, is_shared: true, share_code: shareCode } 
            : conv
        )
      );
      
      // Update active conversation if it's the one being shared
      if (activeConversation?.id === conversationId) {
        setActiveConversation(prev => ({ 
          ...prev, 
          is_shared: true, 
          share_code: shareCode 
        }));
      }
      
      return shareCode;
    } catch (err) {
      console.error('Error sharing conversation:', err);
      setError(err.message || 'Failed to share conversation');
      return null;
    } finally {
      setIsLoading(false);
    }
  }, [activeConversation, shouldFetchConversations]);

  /**
   * Stop sharing a conversation
   */
  const stopSharing = useCallback(async (conversationId) => {
    if (!conversationId || !shouldFetchConversations) return false;
    
    setIsLoading(true);
    setError(null);
    
    try {
      const updatedConversation = await conversationRepository.stopSharing(conversationId);
      
      // Update the conversation in the list
      setConversations(prev => 
        prev.map(conv => 
          conv.id === conversationId 
            ? { ...conv, is_shared: false, share_code: null } 
            : conv
        )
      );
      
      // Update active conversation if it's the one being unshared
      if (activeConversation?.id === conversationId) {
        setActiveConversation(prev => ({ 
          ...prev, 
          is_shared: false, 
          share_code: null 
        }));
      }
      
      return true;
    } catch (err) {
      console.error('Error stopping conversation sharing:', err);
      setError(err.message || 'Failed to stop sharing conversation');
      return false;
    } finally {
      setIsLoading(false);
    }
  }, [activeConversation, shouldFetchConversations]);

  /**
   * Get a shared conversation by its share code
   */
  const getSharedConversation = useCallback(async (shareCode) => {
    if (!shareCode) return null;
    
    setIsLoading(true);
    setError(null);
    
    try {
      const sharedConversation = await conversationRepository.getSharedConversation(shareCode);
      return sharedConversation;
    } catch (err) {
      console.error('Error fetching shared conversation:', err);
      setError(err.message || 'Failed to load shared conversation');
      return null;
    } finally {
      setIsLoading(false);
    }
  }, []);

  /**
   * Set a conversation as active without fetching messages
   */
  const setConversationActive = useCallback((conversation) => {
    setActiveConversation(conversation);
  }, []);

  /**
   * Clear the active conversation
   */
  const clearActiveConversation = useCallback(() => {
    setActiveConversation(null);
  }, []);

  // Fetch conversations when auth state changes
  useEffect(() => {
    if (shouldFetchConversations) {
      fetchConversations();
    } else {
      // Clear conversations when logged out
      setConversations([]);
      setActiveConversation(null);
    }
  }, [fetchConversations, shouldFetchConversations]);

  // Context value
  const value = {
    conversations,
    activeConversation,
    isLoading,
    error,
    fetchConversations,
    fetchConversationWithMessages,
    createConversation,
    updateConversation,
    deleteConversation,
    addMessage,
    shareConversation,
    stopSharing,
    getSharedConversation,
    setConversationActive,
    clearActiveConversation
  };

  return (
    <ConversationContext.Provider value={value}>
      {children}
    </ConversationContext.Provider>
  );
};

/**
 * Hook to use the conversation context
 */
export const useConversation = () => {
  const context = useContext(ConversationContext);
  
  if (!context) {
    throw new Error('useConversation must be used within a ConversationProvider');
  }
  
  return context;
};

export default ConversationContext;
