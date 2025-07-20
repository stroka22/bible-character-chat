import { supabase } from '../supabase/client';

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
      const { data: character } = await supabase
        .from('characters')
        .select('name')
        .eq('id', character_id)
        .single();

      // Use character name as default title if available
      const conversationTitle = title === 'New Conversation' && character?.name 
        ? `Conversation with ${character.name}` 
        : title;

      const { data, error } = await supabase
        .from('conversations')
        .insert({
          character_id,
          title: conversationTitle,
          is_favorite
        })
        .select()
        .single();

      if (error) throw error;
      return data;
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
      let query = supabase
        .from('conversations')
        .select(`
          *,
          characters:character_id (
            id,
            name,
            avatar_url
          )
        `)
        .order('updated_at', { ascending: false });

      // Apply filters
      if (!includeDeleted) {
        query = query.eq('is_deleted', false);
      }

      if (favoritesOnly) {
        query = query.eq('is_favorite', true);
      }

      if (characterId) {
        query = query.eq('character_id', characterId);
      }

      const { data, error } = await query;

      if (error) throw error;
      return data;
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
      // First get the conversation
      const { data: conversation, error: conversationError } = await supabase
        .from('conversations')
        .select(`
          *,
          characters:character_id (
            id,
            name,
            avatar_url,
            feature_image_url,
            persona_prompt,
            opening_line,
            description,
            testament,
            bible_book,
            timeline_period,
            historical_context,
            geographic_location,
            key_scripture_references,
            theological_significance,
            relationships,
            study_questions
          )
        `)
        .eq('id', conversationId)
        .single();

      if (conversationError) throw conversationError;

      // Then get the messages
      let messagesQuery = supabase
        .from('messages')
        .select('*')
        .eq('conversation_id', conversationId)
        .order('created_at', { ascending: true });

      if (!includeDeleted) {
        messagesQuery = messagesQuery.eq('is_deleted', false);
      }

      const { data: messages, error: messagesError } = await messagesQuery;

      if (messagesError) throw messagesError;

      // Return combined data
      return {
        ...conversation,
        messages: messages || []
      };
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
      const { data, error } = await supabase
        .from('messages')
        .insert({
          conversation_id,
          role,
          content,
          metadata
        })
        .select()
        .single();

      if (error) throw error;
      return data;
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
      const { data, error } = await supabase
        .from('conversations')
        .update(updates)
        .eq('id', conversationId)
        .select()
        .single();

      if (error) throw error;
      return data;
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
      // Using the database function for soft deletion
      const { data, error } = await supabase
        .rpc('soft_delete_conversation', {
          conversation_uuid: conversationId
        });

      if (error) throw error;
      return data || false;
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
      const { data, error } = await supabase
        .rpc('restore_conversation', {
          conversation_uuid: conversationId
        });

      if (error) throw error;
      return data || false;
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
      const { data, error } = await supabase
        .rpc('generate_share_code', {
          conversation_uuid: conversationId
        });

      if (error) throw error;
      return data;
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
      // First get the conversation by share code
      const { data: conversation, error: conversationError } = await supabase
        .from('conversations')
        .select(`
          *,
          characters:character_id (
            id,
            name,
            avatar_url,
            feature_image_url,
            persona_prompt,
            opening_line,
            description,
            testament,
            bible_book
          )
        `)
        .eq('share_code', shareCode)
        .eq('is_shared', true)
        .single();

      if (conversationError) throw conversationError;

      // Then get the messages
      const { data: messages, error: messagesError } = await supabase
        .from('messages')
        .select('*')
        .eq('conversation_id', conversation.id)
        .eq('is_deleted', false)
        .order('created_at', { ascending: true });

      if (messagesError) throw messagesError;

      // Return combined data
      return {
        ...conversation,
        messages: messages || []
      };
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
      const { data, error } = await supabase
        .from('conversations')
        .update({
          is_shared: false,
          share_code: null
        })
        .eq('id', conversationId)
        .select()
        .single();

      if (error) throw error;
      return data;
    } catch (error) {
      console.error('Error stopping conversation sharing:', error);
      throw new Error(`Failed to stop sharing conversation: ${error.message}`);
    }
  }
};

export default conversationRepository;
