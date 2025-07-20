/**
 * mockChatRepository.js
 * 
 * A localStorage-based implementation of the chatRepository
 * that allows the app to function offline or when database operations fail.
 */

// Storage keys
const STORAGE_KEYS = {
  CHATS: 'bible_character_chat_chats',
  MESSAGES: 'bible_character_chat_messages',
};

// Helper to generate UUIDs similar to Supabase
const generateUUID = () => {
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
    const r = Math.random() * 16 | 0, v = c === 'x' ? r : (r & 0x3 | 0x8);
    return v.toString(16);
  });
};

// Helper to get data from localStorage with default fallback
const getStorageData = (key, defaultValue = []) => {
  try {
    const data = localStorage.getItem(key);
    return data ? JSON.parse(data) : defaultValue;
  } catch (error) {
    console.error(`Error reading from localStorage (${key}):`, error);
    return defaultValue;
  }
};

// Helper to save data to localStorage
const setStorageData = (key, data) => {
  try {
    localStorage.setItem(key, JSON.stringify(data));
    return true;
  } catch (error) {
    console.error(`Error writing to localStorage (${key}):`, error);
    return false;
  }
};

export const mockChatRepository = {
  async createChat(userId, characterId, title) {
    try {
      const chats = getStorageData(STORAGE_KEYS.CHATS);
      const newChat = {
        id: generateUUID(),
        user_id: userId,
        character_id: characterId,
        title: title || `Chat ${new Date().toLocaleString()}`,
        is_favorite: false,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      };
      
      chats.push(newChat);
      setStorageData(STORAGE_KEYS.CHATS, chats);
      
      return newChat;
    } catch (error) {
      console.error('Failed to create chat (mock):', error);
      throw new Error('Failed to create chat. Please try again later.');
    }
  },
  
  async addMessage(chatId, content, role) {
    try {
      const messages = getStorageData(STORAGE_KEYS.MESSAGES);
      const newMessage = {
        id: generateUUID(),
        chat_id: chatId,
        content,
        role,
        created_at: new Date().toISOString()
      };
      
      messages.push(newMessage);
      setStorageData(STORAGE_KEYS.MESSAGES, messages);
      
      // Update the chat's updated_at timestamp
      const chats = getStorageData(STORAGE_KEYS.CHATS);
      const chatIndex = chats.findIndex(chat => chat.id === chatId);
      
      if (chatIndex !== -1) {
        chats[chatIndex].updated_at = new Date().toISOString();
        setStorageData(STORAGE_KEYS.CHATS, chats);
      }
      
      return newMessage;
    } catch (error) {
      console.error('Failed to add message (mock):', error);
      throw new Error('Failed to add message. Please try again later.');
    }
  },
  
  async getChatMessages(chatId) {
    try {
      const messages = getStorageData(STORAGE_KEYS.MESSAGES);
      return messages
        .filter(message => message.chat_id === chatId)
        .sort((a, b) => new Date(a.created_at) - new Date(b.created_at));
    } catch (error) {
      console.error(`Failed to fetch messages for chat ${chatId} (mock):`, error);
      throw new Error('Failed to fetch chat messages. Please try again later.');
    }
  },
  
  async getChatById(chatId) {
    try {
      const chats = getStorageData(STORAGE_KEYS.CHATS);
      const chat = chats.find(chat => chat.id === chatId);
      
      if (!chat) {
        return null;
      }
      
      return chat;
    } catch (error) {
      console.error(`Failed to fetch chat with ID ${chatId} (mock):`, error);
      throw new Error('Failed to fetch chat. Please try again later.');
    }
  },
  
  async getUserChats(userId) {
    try {
      const chats = getStorageData(STORAGE_KEYS.CHATS);
      return chats
        .filter(chat => chat.user_id === userId)
        .sort((a, b) => new Date(b.updated_at) - new Date(a.updated_at));
    } catch (error) {
      console.error(`Failed to fetch chats for user ${userId} (mock):`, error);
      throw new Error('Failed to fetch user chats. Please try again later.');
    }
  },
  
  async updateChat(chatId, updates) {
    try {
      const chats = getStorageData(STORAGE_KEYS.CHATS);
      const chatIndex = chats.findIndex(chat => chat.id === chatId);
      
      if (chatIndex === -1) {
        throw new Error(`Chat with ID ${chatId} not found`);
      }
      
      const updatedChat = {
        ...chats[chatIndex],
        ...updates,
        updated_at: new Date().toISOString()
      };
      
      chats[chatIndex] = updatedChat;
      setStorageData(STORAGE_KEYS.CHATS, chats);
      
      return updatedChat;
    } catch (error) {
      console.error(`Failed to update chat ${chatId} (mock):`, error);
      throw new Error('Failed to update chat. Please try again later.');
    }
  },
  
  async toggleFavorite(chatId, isFavorite) {
    return this.updateChat(chatId, { is_favorite: isFavorite });
  },
  
  async deleteChat(chatId) {
    try {
      // Delete messages first
      const messages = getStorageData(STORAGE_KEYS.MESSAGES);
      const filteredMessages = messages.filter(message => message.chat_id !== chatId);
      setStorageData(STORAGE_KEYS.MESSAGES, filteredMessages);
      
      // Then delete the chat
      const chats = getStorageData(STORAGE_KEYS.CHATS);
      const filteredChats = chats.filter(chat => chat.id !== chatId);
      setStorageData(STORAGE_KEYS.CHATS, filteredChats);
      
      return true;
    } catch (error) {
      console.error(`Failed to delete chat ${chatId} (mock):`, error);
      throw new Error('Failed to delete chat. Please try again later.');
    }
  },
  
  // Additional helper methods for offline mode
  
  clearAllData() {
    localStorage.removeItem(STORAGE_KEYS.CHATS);
    localStorage.removeItem(STORAGE_KEYS.MESSAGES);
  },
  
  isAvailable() {
    try {
      // Test if localStorage is available
      localStorage.setItem('test', 'test');
      localStorage.removeItem('test');
      return true;
    } catch (e) {
      return false;
    }
  }
};
