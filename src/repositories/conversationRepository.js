import supabase from '../supabase/client';

// Mock data for characters – align with actual characters used in the app
const MOCK_CHARACTERS = {
  jesus: {
    id: 'jesus',
    name: 'Jesus',
    avatar_url: '/characters/jesus.jpg',
    testament: 'new',
    bible_book: 'Gospels'
  },
  peter: {
    id: 'peter',
    name: 'Peter',
    avatar_url: '/characters/peter.jpg',
    testament: 'new',
    bible_book: 'Acts'
  },
  john: {
    id: 'john',
    name: 'John',
    avatar_url: '/characters/john.jpg',
    testament: 'new',
    bible_book: 'Revelation'
  },
  mary: {
    id: 'mary',
    name: 'Mary',
    avatar_url: '/characters/mary.jpg',
    testament: 'new',
    bible_book: 'Luke'
  }
};

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
    console.log('[MOCK] First load – clearing preset mock data');
    mockStorage.conversations = [];
    mockStorage.messages = [];
    isFirstLoad = false;
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
  /**
   * Create a new conversation
   * @param {Object} conversation - The conversation data
   * @param {string} conversation.character_id - ID of the character
   * @param {string} conversation.title - Title of the conversation (optional)
   * @param {boolean} conversation.is_favorite - Whether the conversation is favorited (optional)
   * @returns {Promise<Object>} - The created conversation
   */
  async createConversation({ character_id, title = 'New Conversation', is_favorite = false }) {
    try {
      console.log('[MOCK] Creating conversation for character:', character_id);
      
      // Get character info if available
      const character = MOCK_CHARACTERS[character_id];
      
      // Use character name as default title if available
      const conversationTitle = title === 'New Conversation' && character?.name 
        ? `Conversation with ${character.name}` 
        : title;

      // Create new conversation object
      const newConversation = {
        id: generateId('conv'),
        character_id,
        title: conversationTitle,
        is_favorite,
        is_shared: false,
        share_code: null,
        is_deleted: false,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      };
      
      // Add to mock storage
      mockStorage.conversations.push(newConversation);
      
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
      console.log('[MOCK] Fetching user conversations');
      
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
      
      // Add character information
      const conversationsWithCharacters = filteredConversations.map(conv => ({
        ...conv,
        characters: MOCK_CHARACTERS[conv.character_id]
      }));
      
      // Sort by updated_at in descending order
      conversationsWithCharacters.sort((a, b) => 
        new Date(b.updated_at) - new Date(a.updated_at)
      );
      
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
      
      // Get the character
      const character = MOCK_CHARACTERS[conversation.character_id];
      
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
   * @param {Object} message - The message data
   * @param {string} message.conversation_id - ID of the conversation
   * @param {string} message.role - Role of the message sender ('user' or 'assistant')
   * @param {string} message.content - Content of the message
   * @param {Object} message.metadata - Additional metadata (optional)
   * @returns {Promise<Object>} - The created message
   */
  async addMessage({ conversation_id, role, content, metadata = {} }) {
    try {
      console.log('[MOCK] Adding message to conversation:', conversation_id);
      
      // Check if conversation exists
      const conversation = mockStorage.conversations.find(c => c.id === conversation_id);
      if (!conversation) {
        throw new Error('Conversation not found');
      }
      
      // Create new message
      const newMessage = {
        id: generateId('msg'),
        conversation_id,
        role,
        content,
        metadata,
        is_deleted: false,
        created_at: new Date().toISOString()
      };
      
      // Add to mock storage
      mockStorage.messages.push(newMessage);
      
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
      
      // Find the conversation
      const conversation = mockStorage.conversations.find(c => c.id === conversationId);
      
      if (!conversation) {
        throw new Error('Conversation not found');
      }
      
      // Apply updates
      Object.assign(conversation, updates);
      
      // Update timestamp
      conversation.updated_at = new Date().toISOString();
      
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
      
      // Get the character
      const character = MOCK_CHARACTERS[conversation.character_id];
      
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
      
      return await simulateApiCall(conversation);
    } catch (error) {
      console.error('Error stopping conversation sharing:', error);
      throw new Error(`Failed to stop sharing conversation: ${error.message}`);
    }
  }
};

export default conversationRepository;
