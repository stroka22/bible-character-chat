import supabase from '../supabase/client';
// Use the central character repository so we always respect whatever
// ID type (string / UUID / number) the rest of the app supplies.
import { characterRepository } from './characterRepository';

/* eslint-disable no-console */
console.log('[MOCK] Conversation repository initialised (character IDs now resolved on-demand)');
/* eslint-enable no-console */

// In-memory storage for mock data
const mockStorage = {
  conversations: [], // start empty
  messages: []       // start empty
};

// ---------------------------------------------------------------------------
// Helpers to reset mock data on first load (useful while developing)
// ---------------------------------------------------------------------------
let isFirstLoad = true;
const resetMockData = () => {
  if (isFirstLoad) {
    console.log('[MOCK] First load – checking for saved conversations in localStorage');
    try {
      const savedStorage = localStorage.getItem('mockConversationStorage');
      if (savedStorage) {
        const parsed = JSON.parse(savedStorage);
        if (parsed &&
            Array.isArray(parsed.conversations) &&
            Array.isArray(parsed.messages)) {
          mockStorage.conversations = parsed.conversations;
          mockStorage.messages = parsed.messages;
          console.log(`[MOCK] Loaded ${parsed.conversations.length} conversations from localStorage`);
        }
      }
    } catch (err) {
      console.error('[MOCK] Error loading conversations from localStorage:', err);
      mockStorage.conversations = [];
      mockStorage.messages = [];
    }
    isFirstLoad = false;

    // Inform devs that the mock repository now starts empty so that only
    // conversations they create during the current session will appear.
    console.log('[MOCK] Ready to save new conversations with biblical characters');
  }
};

// Persist mock data to localStorage
const saveMockData = () => {
  try {
    localStorage.setItem('mockConversationStorage', JSON.stringify(mockStorage));
    console.log(`[MOCK] Saved ${mockStorage.conversations.length} conversations to localStorage`);
  } catch (err) {
    console.error('[MOCK] Error saving conversations to localStorage:', err);
  }
};
// Helper function to simulate async API calls
const simulateApiCall = (data, delay = 300) => {
  return new Promise(resolve => {
    setTimeout(() => {
      resolve(data);
    }, delay);
  });
};

// Generate a random ID
const generateId = (prefix) => `${prefix}-${Date.now()}-${Math.floor(Math.random() * 1000)}`;

/**
 * Repository for handling conversations and messages
 */
export const conversationRepository = {
  // Track the active conversation ID for legacy method calls
  activeConversationId: null,

  /**
   * Create a new conversation
   * @param {Object} conversation - The conversation data
   * @param {string} conversation.character_id - ID of the character
   * @param {string} conversation.title - Title of the conversation (optional)
   * @param {boolean} conversation.is_favorite - Whether the conversation is favorited (optional)
   * @param {Array<string|number>} [conversation.participants] - For roundtables: array of character IDs participating (optional)
   * @param {string} [conversation.type] - Conversation type e.g. 'roundtable' (optional)
   * @returns {Promise<Object>} - The created conversation
   */
  async createConversation(conversation = {}) {
    try {
      /* --------------------------------------------------------------
       * Extract params with safe defaults
       * ------------------------------------------------------------*/
      const {
        character_id,
        title,
        is_favorite = false,
        participants = null,
        type = null
      } = conversation;

      console.log('[MOCK] Creating conversation with params:', {
        character_id,
        title,
        title_type: typeof title,
        is_favorite,
      });

      /* --------------------------------------------------------------
       * Title generation
       * ------------------------------------------------------------*/
      let conversationTitle =
        typeof title === 'string' && title.trim() ? title.trim() : null;
      if (!conversationTitle) {
        try {
          const fetched = await characterRepository.getById(character_id);
          const name = fetched?.name || 'Character';
          conversationTitle = `Conversation with ${name} - ${new Date().toLocaleDateString()}`;
        } catch {
          conversationTitle = `Conversation - ${new Date().toLocaleDateString()}`;
        }
      }

      // Create new conversation object
      const newConversation = {
        id: generateId('conv'),
        character_id,
        title: conversationTitle,
        is_favorite,
        ...(type ? { conversation_type: type } : {}),
        ...(Array.isArray(participants) && participants.length > 0
          ? { participants }
          : {}),
        is_shared: false,
        share_code: null,
        is_deleted: false,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      };
      console.log(`[MOCK] Final conversation title set on object: "${newConversation.title}"`);
      
      // Set as active conversation
      this.activeConversationId = newConversation.id;
      
      // ------------------------------------------------------------------
      //  🔍 FINAL TITLE DEBUG – ensure the title being returned is correct
      // ------------------------------------------------------------------
      console.log('[MOCK] FINAL TITLE CHECK:', newConversation.title);
      console.log(
        '[MOCK] COMPLETE CONVERSATION OBJECT:',
        JSON.stringify(newConversation, null, 2),
      );

      // Add to mock storage
      mockStorage.conversations.push(newConversation);
      saveMockData();
      
      console.log(`[MOCK] Created conversation with ID: ${newConversation.id}`);
      
      // Simulate API delay
      return await simulateApiCall(newConversation);
    } catch (error) {
      console.error('Error creating conversation:', error);
      throw new Error(`Failed to create conversation: ${error.message}`);
    }
  },

  /**
   * Get all conversations for the current user
   * @param {Object} options - Query options
   * @param {boolean} options.includeDeleted - Whether to include soft-deleted conversations
   * @param {boolean} options.favoritesOnly - Whether to only return favorited conversations
   * @param {string} options.characterId - Filter by character ID
   * @returns {Promise<Array>} - List of conversations
   */
  async getUserConversations({ 
    includeDeleted = false, 
    favoritesOnly = false,
    characterId = null
  } = {}) {
    try {
      // Ensure stale preset data is cleared once per session
      resetMockData();
      // ------------------------------------------------------------------
      // Detailed diagnostics to help trace why conversations might
      // not appear in the UI.
      // ------------------------------------------------------------------
      console.log('[MOCK] Fetching user conversations with options:', {
        includeDeleted,
        favoritesOnly,
        characterId
      });
      console.log('[MOCK] Current conversation storage:', mockStorage.conversations);
      console.log('[MOCK] Current message storage:', mockStorage.messages);
      
      // Filter conversations based on options
      let filteredConversations = mockStorage.conversations.filter(conv => {
        // Filter by deletion status
        if (!includeDeleted && conv.is_deleted) {
          return false;
        }
        
        // Filter by favorite status
        if (favoritesOnly && !conv.is_favorite) {
          return false;
        }
        
        // Filter by character ID
        if (characterId && conv.character_id !== characterId) {
          return false;
        }
        
        return true;
      });
      
      // Add character information by fetching on-demand
      const conversationsWithCharacters = await Promise.all(
        filteredConversations.map(async (conv) => {
          let character = null;
          try {
            character = await characterRepository.getById(conv.character_id);
          } catch {
            /* ignore – character may not resolve in mock mode */
          }
          return { ...conv, characters: character };
        }),
      );
      
      // Sort by updated_at in descending order
      conversationsWithCharacters.sort((a, b) => 
        new Date(b.updated_at) - new Date(a.updated_at)
      );

      // ------------------------------------------------------------------
      //  🔍 Debug the final conversations list that will be displayed
      // ------------------------------------------------------------------
      console.log('[MOCK] CONVERSATIONS TO BE DISPLAYED:');
      conversationsWithCharacters.forEach(conv => {
        console.log(
          `- ID: ${conv.id}, Title: "${conv.title}", Character: ${conv.character_id}`,
        );
      });

      console.log('[MOCK] Final conversations list:', conversationsWithCharacters);

      // Expose underlying storage for browser-side debugging
      if (typeof window !== 'undefined') {
        window.__mockStorage = mockStorage;
      }

      return await simulateApiCall(conversationsWithCharacters);
    } catch (error) {
      console.error('Error fetching user conversations:', error);
      throw new Error(`Failed to fetch conversations: ${error.message}`);
    }
  },

  /**
   * Get a single conversation with its messages
   * @param {string} conversationId - ID of the conversation
   * @param {Object} options - Query options
   * @param {boolean} options.includeDeleted - Whether to include deleted messages
   * @returns {Promise<Object>} - Conversation with messages
   */
  async getConversationWithMessages(conversationId, { includeDeleted = false } = {}) {
    try {
      console.log('[MOCK] Fetching conversation with messages:', conversationId);
      
      // Find the conversation
      const conversation = mockStorage.conversations.find(c => c.id === conversationId);
      
      if (!conversation) {
        throw new Error('Conversation not found');
      }
      
      // Get the character via repository (supports string/UUID or number IDs)
      let character = null;
      try {
        character = await characterRepository.getById(conversation.character_id);
      } catch {
        character = null;
      }
      
      // Get messages for this conversation
      const messages = mockStorage.messages
        .filter(m => m.conversation_id === conversationId && (includeDeleted || !m.is_deleted))
        .sort((a, b) => new Date(a.created_at) - new Date(b.created_at));
      
      // Combine data
      const result = {
        ...conversation,
        characters: character,
        messages
      };
      
      return await simulateApiCall(result);
    } catch (error) {
      console.error('Error fetching conversation with messages:', error);
      throw new Error(`Failed to fetch conversation: ${error.message}`);
    }
  },

  /**
   * Add a message to a conversation
   * @param {Object|string} messageData - The message data or message content string
   * @param {string} [role] - Role of the message if first param is string content
   * @returns {Promise<Object>} - The created message
   */
  async addMessage(messageData, role) {
    try {
      // Handle different parameter formats
      let content, messageRole, conversationId, metadata = {};
      
      if (typeof messageData === 'string') {
        // Legacy format: addMessage(content, role)
        content = messageData;
        messageRole = role;
        
        if (!this.activeConversationId) {
          throw new Error('No active conversation ID when using legacy addMessage format');
        }
        
        conversationId = this.activeConversationId;
        console.log('[MOCK] Adding message (legacy format) to conversation:', conversationId);
      } else if (typeof messageData === 'object') {
        // New format: addMessage({conversation_id, role, content, metadata})
        content = messageData.content;
        messageRole = messageData.role;
        conversationId = messageData.conversation_id;
        metadata = messageData.metadata || {};
        
        console.log('[MOCK] Adding message (object format) to conversation:', conversationId);
      } else {
        throw new Error('Invalid parameters for addMessage');
      }
      
      // Check if conversation exists
      const conversation = mockStorage.conversations.find(c => c.id === conversationId);
      if (!conversation) {
        console.error(`[MOCK] Conversation not found with ID: ${conversationId}`);
        console.log('[MOCK] Available conversation IDs:', 
          mockStorage.conversations.map(c => c.id).join(', '));
        throw new Error('Conversation not found');
      }
      
      // Create new message
      const newMessage = {
        id: generateId('msg'),
        conversation_id: conversationId,
        role: messageRole,
        content,
        metadata,
        is_deleted: false,
        created_at: new Date().toISOString()
      };
      
      // Add to mock storage
      mockStorage.messages.push(newMessage);
      saveMockData();
      
      // Update conversation's last_message_preview and updated_at
      conversation.last_message_preview = content.substring(0, 50) + (content.length > 50 ? '...' : '');
      conversation.updated_at = new Date().toISOString();
      
      return await simulateApiCall(newMessage);
    } catch (error) {
      console.error('Error adding message:', error);
      throw new Error(`Failed to add message: ${error.message}`);
    }
  },

  /**
   * Update a conversation
   * @param {string} conversationId - ID of the conversation
   * @param {Object} updates - The fields to update
   * @param {string} updates.title - New title (optional)
   * @param {boolean} updates.is_favorite - New favorite status (optional)
   * @returns {Promise<Object>} - The updated conversation
   */
  async updateConversation(conversationId, updates = {}) {
    try {
      console.log('[MOCK] Updating conversation:', conversationId, updates);
      
      // Find the conversation with exact ID match
      const conversationIndex = mockStorage.conversations.findIndex(c => c.id === conversationId);
      
      if (conversationIndex === -1) {
        console.error(`[MOCK] Conversation not found with ID: ${conversationId}`);
        console.log('[MOCK] Available conversation IDs:', 
          mockStorage.conversations.map(c => c.id).join(', '));
        throw new Error('Conversation not found');
      }
      
      // Apply updates
      const conversation = mockStorage.conversations[conversationIndex];
      Object.assign(conversation, updates);
      
      // Update timestamp
      conversation.updated_at = new Date().toISOString();
      saveMockData();
      
      console.log('[MOCK] Conversation updated successfully:', conversation);
      
      return await simulateApiCall(conversation);
    } catch (error) {
      console.error('Error updating conversation:', error);
      throw new Error(`Failed to update conversation: ${error.message}`);
    }
  },

  /**
   * Soft delete a conversation
   * @param {string} conversationId - ID of the conversation to delete
   * @returns {Promise<boolean>} - Success status
   */
  async deleteConversation(conversationId) {
    try {
      console.log('[MOCK] Soft deleting conversation:', conversationId);
      
      // Find the conversation
      const conversation = mockStorage.conversations.find(c => c.id === conversationId);
      
      if (!conversation) {
        throw new Error('Conversation not found');
      }
      
      // Mark as deleted
      conversation.is_deleted = true;
      conversation.updated_at = new Date().toISOString();
      saveMockData();
      
      return await simulateApiCall(true);
    } catch (error) {
      console.error('Error deleting conversation:', error);
      throw new Error(`Failed to delete conversation: ${error.message}`);
    }
  },

  /**
   * Restore a soft-deleted conversation
   * @param {string} conversationId - ID of the conversation to restore
   * @returns {Promise<boolean>} - Success status
   */
  async restoreConversation(conversationId) {
    try {
      console.log('[MOCK] Restoring conversation:', conversationId);
      
      // Find the conversation
      const conversation = mockStorage.conversations.find(c => c.id === conversationId);
      
      if (!conversation) {
        throw new Error('Conversation not found');
      }
      
      // Mark as not deleted
      conversation.is_deleted = false;
      conversation.updated_at = new Date().toISOString();
      
      return await simulateApiCall(true);
    } catch (error) {
      console.error('Error restoring conversation:', error);
      throw new Error(`Failed to restore conversation: ${error.message}`);
    }
  },

  /**
   * Share a conversation by generating a unique share code
   * @param {string} conversationId - ID of the conversation to share
   * @returns {Promise<string>} - The generated share code
   */
  async shareConversation(conversationId) {
    try {
      console.log('[MOCK] Sharing conversation:', conversationId);
      
      // Find the conversation
      const conversation = mockStorage.conversations.find(c => c.id === conversationId);
      
      if (!conversation) {
        throw new Error('Conversation not found');
      }
      
      // Generate a share code
      const shareCode = `share-${Math.random().toString(36).substring(2, 10)}`;
      
      // Update conversation
      conversation.is_shared = true;
      conversation.share_code = shareCode;
      conversation.updated_at = new Date().toISOString();
      saveMockData();
      
      return await simulateApiCall(shareCode);
    } catch (error) {
      console.error('Error sharing conversation:', error);
      throw new Error(`Failed to share conversation: ${error.message}`);
    }
  },

  /**
   * Get a shared conversation by its share code
   * @param {string} shareCode - The share code
   * @returns {Promise<Object>} - The shared conversation with messages
   */
  async getSharedConversation(shareCode) {
    try {
      console.log('[MOCK] Fetching shared conversation with code:', shareCode);
      
      // Find the conversation by share code
      const conversation = mockStorage.conversations.find(
        c => c.share_code === shareCode && c.is_shared && !c.is_deleted
      );
      
      if (!conversation) {
        throw new Error('Shared conversation not found');
      }
      
      // Get the character via repository (supports string/UUID or number IDs)
      let character = null;
      try {
        character = await characterRepository.getById(conversation.character_id);
      } catch {
        character = null;
      }
      
      // Get messages for this conversation
      const messages = mockStorage.messages
        .filter(m => m.conversation_id === conversation.id && !m.is_deleted)
        .sort((a, b) => new Date(a.created_at) - new Date(b.created_at));
      
      // Combine data
      const result = {
        ...conversation,
        characters: character,
        messages
      };
      
      return await simulateApiCall(result);
    } catch (error) {
      console.error('Error fetching shared conversation:', error);
      throw new Error(`Failed to fetch shared conversation: ${error.message}`);
    }
  },

  /**
   * Stop sharing a conversation
   * @param {string} conversationId - ID of the conversation
   * @returns {Promise<Object>} - The updated conversation
   */
  async stopSharing(conversationId) {
    try {
      console.log('[MOCK] Stopping sharing for conversation:', conversationId);
      
      // Find the conversation
      const conversation = mockStorage.conversations.find(c => c.id === conversationId);
      
      if (!conversation) {
        throw new Error('Conversation not found');
      }
      
      // Update sharing status
      conversation.is_shared = false;
      conversation.share_code = null;
      conversation.updated_at = new Date().toISOString();
      saveMockData();
      
      return await simulateApiCall(conversation);
    } catch (error) {
      console.error('Error stopping conversation sharing:', error);
      throw new Error(`Failed to stop sharing conversation: ${error.message}`);
    }
  }
};

export default conversationRepository;
