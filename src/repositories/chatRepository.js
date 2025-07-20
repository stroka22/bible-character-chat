import { supabase } from '../services/supabase';
import { mockChatRepository } from './mockChatRepository';

/**
 * After we hit certain Supabase errors (permissions / conflict) we
 * transparently switch to a localStorage-backed mock repository so the
 * front-end keeps working offline or with mis-configured RLS.
 */
let useMock = false;

const FALLBACK_STATUS = [403, 409]; // forbidden / conflict
const FALLBACK_PG_CODES = ['23505']; // duplicate key, etc.

const shouldFallback = (error) => {
    if (!error) return false;
    const httpStatus = error.status || error.code;
    if (FALLBACK_STATUS.includes(httpStatus) ||
        (error.code && FALLBACK_PG_CODES.includes(error.code))) {
        // Switch globally to mock mode
        if (!useMock) {
            useMock = true;
            // eslint-disable-next-line no-console
            console.warn('[chatRepository] Supabase error detected – switching to mockChatRepository for future operations.', error);
        }
        return true;
    }
    return false;
};
export const chatRepository = {
    async createChat(userId, characterId, title) {
        // If already in mock mode, short-circuit
        if (useMock) {
            return mockChatRepository.createChat(userId, characterId, title);
        }

        try {
            const newChat = {
                user_id: userId,
                character_id: characterId,
                title: title || `Chat ${new Date().toLocaleString()}`,
                is_favorite: false,
            };

            const { data, error } = await supabase
                .from('chats')
                .insert(newChat)
                .select()
                .single();

            if (error) throw error;
            return data;
        } catch (error) {
            if (shouldFallback(error)) {
                return mockChatRepository.createChat(userId, characterId, title);
            }
            console.error('Failed to create chat:', error);
            throw new Error('Failed to create chat. Please try again later.');
        }
    },
    async addMessage(chatId, content, role) {
        if (useMock) {
            return mockChatRepository.addMessage(chatId, content, role);
        }
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
            await supabase
                .from('chats')
                .update({ updated_at: new Date().toISOString() })
                .eq('id', chatId);
            return data;
        }
        catch (error) {
            if (shouldFallback(error)) {
                return mockChatRepository.addMessage(chatId, content, role);
            }
            console.error('Failed to add message:', error);
            throw new Error('Failed to add message. Please try again later.');
        }
    },
    async getChatMessages(chatId) {
        if (useMock) {
            return mockChatRepository.getChatMessages(chatId);
        }
        try {
            const { data, error } = await supabase
                .from('chat_messages')
                .select('*')
                .eq('chat_id', chatId)
                .order('created_at');
            if (error) {
                throw error;
            }
            return data;
        }
        catch (error) {
            if (shouldFallback(error)) {
                return mockChatRepository.getChatMessages(chatId);
            }
            console.error(`Failed to fetch messages for chat ${chatId}:`, error);
            throw new Error('Failed to fetch chat messages. Please try again later.');
        }
    },
    async getChatById(chatId) {
        if (useMock) {
            return mockChatRepository.getChatById(chatId);
        }
        try {
            const { data, error } = await supabase
                .from('chats')
                .select('*')
                .eq('id', chatId)
                .single();
            if (error) {
                if (error.code === 'PGRST116') {
                    return null;
                }
                throw error;
            }
            return data;
        }
        catch (error) {
            if (shouldFallback(error)) {
                return mockChatRepository.getChatById(chatId);
            }
            console.error(`Failed to fetch chat with ID ${chatId}:`, error);
            throw new Error('Failed to fetch chat. Please try again later.');
        }
    },
    async getUserChats(userId) {
        if (useMock) {
            return mockChatRepository.getUserChats(userId);
        }
        try {
            const { data, error } = await supabase
                .from('chats')
                .select('*')
                .eq('user_id', userId)
                .order('updated_at', { ascending: false });
            if (error) {
                throw error;
            }
            return data;
        }
        catch (error) {
            if (shouldFallback(error)) {
                return mockChatRepository.getUserChats(userId);
            }
            console.error(`Failed to fetch chats for user ${userId}:`, error);
            throw new Error('Failed to fetch user chats. Please try again later.');
        }
    },
    async updateChat(chatId, updates) {
        if (useMock) {
            return mockChatRepository.updateChat(chatId, updates);
        }
        try {
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
            return data;
        }
        catch (error) {
            if (shouldFallback(error)) {
                return mockChatRepository.updateChat(chatId, updates);
            }
            console.error(`Failed to update chat ${chatId}:`, error);
            throw new Error('Failed to update chat. Please try again later.');
        }
    },
    async toggleFavorite(chatId, isFavorite) {
        return this.updateChat(chatId, { is_favorite: isFavorite });
    },
    async deleteChat(chatId) {
        if (useMock) {
            return mockChatRepository.deleteChat(chatId);
        }
        try {
            const { error: messagesError } = await supabase
                .from('chat_messages')
                .delete()
                .eq('chat_id', chatId);
            if (messagesError) {
                throw messagesError;
            }
            const { error: chatError } = await supabase
                .from('chats')
                .delete()
                .eq('id', chatId);
            if (chatError) {
                throw chatError;
            }
        }
        catch (error) {
            if (shouldFallback(error)) {
                return mockChatRepository.deleteChat(chatId);
            }
            console.error(`Failed to delete chat ${chatId}:`, error);
            throw new Error('Failed to delete chat. Please try again later.');
        }
    }
};
