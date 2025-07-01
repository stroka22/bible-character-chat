import { supabase, type Chat, type ChatMessage } from '../services/supabase';

/**
 * Repository for interacting with chat data in Supabase
 */
export const chatRepository = {
  /**
   * Create a new chat session
   * @param userId - The ID of the user creating the chat
   * @param characterId - The ID of the Bible character
   * @param title - Optional title for the chat (defaults to timestamp)
   * @returns Promise resolving to the created Chat object
   */
  async createChat(
    userId: string,
    characterId: string,
    title?: string
  ): Promise<Chat> {
    try {
      const newChat = {
        user_id: userId,
        character_id: characterId,
        title: title || `Chat ${new Date().toLocaleString()}`,
        is_favorite: false
      };

      const { data, error } = await supabase
        .from('chats')
        .insert(newChat)
        .select()
        .single();

      if (error) {
        throw error;
      }

      return data as Chat;
    } catch (error) {
      console.error('Failed to create chat:', error);
      throw new Error('Failed to create chat. Please try again later.');
    }
  },

  /**
   * Add a message to an existing chat
   * @param chatId - The ID of the chat
   * @param content - The message content
   * @param role - The role of the message sender ('user', 'assistant', or 'system')
   * @returns Promise resolving to the created ChatMessage object
   */
  async addMessage(
    chatId: string,
    content: string,
    role: 'user' | 'assistant' | 'system'
  ): Promise<ChatMessage> {
    try {
      const newMessage = {
        chat_id: chatId,
        content,
        role
      };

      const { data, error } = await supabase
        .from('chat_messages')
        .insert(newMessage)
        .select()
        .single();

      if (error) {
        throw error;
      }

      // Update the chat's updated_at timestamp
      await supabase
        .from('chats')
        .update({ updated_at: new Date().toISOString() })
        .eq('id', chatId);

      return data as ChatMessage;
    } catch (error) {
      console.error('Failed to add message:', error);
      throw new Error('Failed to add message. Please try again later.');
    }
  },

  /**
   * Get all messages for a specific chat
   * @param chatId - The ID of the chat
   * @returns Promise resolving to an array of ChatMessage objects
   */
  async getChatMessages(chatId: string): Promise<ChatMessage[]> {
    try {
      const { data, error } = await supabase
        .from('chat_messages')
        .select('*')
        .eq('chat_id', chatId)
        .order('created_at');

      if (error) {
        throw error;
      }

      return data as ChatMessage[];
    } catch (error) {
      console.error(`Failed to fetch messages for chat ${chatId}:`, error);
      throw new Error('Failed to fetch chat messages. Please try again later.');
    }
  },

  /**
   * Get a specific chat by ID
   * @param chatId - The ID of the chat
   * @returns Promise resolving to a Chat object or null if not found
   */
  async getChatById(chatId: string): Promise<Chat | null> {
    try {
      const { data, error } = await supabase
        .from('chats')
        .select('*')
        .eq('id', chatId)
        .single();

      if (error) {
        if (error.code === 'PGRST116') {
          // PGRST116 is the error code for "no rows returned"
          return null;
        }
        throw error;
      }

      return data as Chat;
    } catch (error) {
      console.error(`Failed to fetch chat with ID ${chatId}:`, error);
      throw new Error('Failed to fetch chat. Please try again later.');
    }
  },

  /**
   * Get all chats for a specific user
   * @param userId - The ID of the user
   * @returns Promise resolving to an array of Chat objects
   */
  async getUserChats(userId: string): Promise<Chat[]> {
    try {
      const { data, error } = await supabase
        .from('chats')
        .select('*')
        .eq('user_id', userId)
        .order('updated_at', { ascending: false });

      if (error) {
        throw error;
      }

      return data as Chat[];
    } catch (error) {
      console.error(`Failed to fetch chats for user ${userId}:`, error);
      throw new Error('Failed to fetch user chats. Please try again later.');
    }
  },

  /**
   * Update chat metadata (e.g., title, favorite status)
   * @param chatId - The ID of the chat
   * @param updates - Object containing the fields to update
   * @returns Promise resolving to the updated Chat object
   */
  async updateChat(
    chatId: string,
    updates: Partial<Omit<Chat, 'id' | 'created_at' | 'updated_at'>>
  ): Promise<Chat> {
    try {
      // Include updated_at in the update
      const updatedData = {
        ...updates,
        updated_at: new Date().toISOString()
      };

      const { data, error } = await supabase
        .from('chats')
        .update(updatedData)
        .eq('id', chatId)
        .select()
        .single();

      if (error) {
        throw error;
      }

      return data as Chat;
    } catch (error) {
      console.error(`Failed to update chat ${chatId}:`, error);
      throw new Error('Failed to update chat. Please try again later.');
    }
  },

  /**
   * Toggle the favorite status of a chat
   * @param chatId - The ID of the chat
   * @param isFavorite - Whether the chat should be marked as favorite
   * @returns Promise resolving to the updated Chat object
   */
  async toggleFavorite(chatId: string, isFavorite: boolean): Promise<Chat> {
    return this.updateChat(chatId, { is_favorite: isFavorite });
  },

  /**
   * Delete a chat and all its messages
   * @param chatId - The ID of the chat to delete
   * @returns Promise resolving when the deletion is complete
   */
  async deleteChat(chatId: string): Promise<void> {
    try {
      // First delete all messages in the chat
      const { error: messagesError } = await supabase
        .from('chat_messages')
        .delete()
        .eq('chat_id', chatId);

      if (messagesError) {
        throw messagesError;
      }

      // Then delete the chat itself
      const { error: chatError } = await supabase
        .from('chats')
        .delete()
        .eq('id', chatId);

      if (chatError) {
        throw chatError;
      }
    } catch (error) {
      console.error(`Failed to delete chat ${chatId}:`, error);
      throw new Error('Failed to delete chat. Please try again later.');
    }
  }
};
