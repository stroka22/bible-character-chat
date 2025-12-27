import { supabase } from './supabase';

export type Chat = {
  id: string;
  user_id: string;
  character_id: string;
  title: string | null;
  is_favorite: boolean | null;
  created_at: string;
  updated_at: string;
  study_id?: string | null;
  lesson_id?: string | null;
  progress_id?: string | null;
  conversation_type?: string | null;
  participants?: string[] | null;
};

export type ChatMessage = {
  id: string;
  chat_id: string;
  content: string;
  role: 'user' | 'assistant' | 'system';
  created_at: string;
};

export const chat = {
  async getChat(chatId: string): Promise<Chat | null> {
    const { data, error } = await supabase.from('chats').select('*').eq('id', chatId).maybeSingle();
    if (error) throw error;
    return (data as any) || null;
  },

  async getUserChats(userId: string, options?: { limit?: number; offset?: number }): Promise<{ chats: Chat[]; hasMore: boolean }> {
    const limit = options?.limit || 25;
    const offset = options?.offset || 0;
    
    const { data, error } = await supabase
      .from('chats')
      .select('*')
      .eq('user_id', userId)
      .order('updated_at', { ascending: false })
      .range(offset, offset + limit);
    
    if (error) throw error;
    const chats = (data || []) as Chat[];
    return { 
      chats, 
      hasMore: chats.length > limit 
    };
  },

  async createChat(
    userId: string, 
    characterId: string, 
    title?: string,
    options?: { studyId?: string; lessonId?: string; progressId?: string; conversationType?: string; participants?: string[] }
  ): Promise<Chat> {
    const payload: Record<string, any> = {
      user_id: userId,
      character_id: characterId,
      title: title || null,
      is_favorite: false,
    };
    if (options?.studyId) payload.study_id = options.studyId;
    if (options?.lessonId) payload.lesson_id = options.lessonId;
    if (options?.progressId) payload.progress_id = options.progressId;
    if (options?.conversationType) payload.conversation_type = options.conversationType;
    if (options?.participants) payload.participants = options.participants;
    
    const { data, error } = await supabase
      .from('chats')
      .insert(payload)
      .select('*')
      .single();
    if (error) throw error;
    return data as Chat;
  },

  async getChatsByProgress(progressId: string): Promise<Chat[]> {
    if (!progressId) return [];
    const { data, error } = await supabase
      .from('chats')
      .select('*')
      .eq('progress_id', progressId)
      .order('updated_at', { ascending: false });
    if (error) {
      console.warn('[chat] getChatsByProgress error:', error);
      return [];
    }
    return (data || []) as Chat[];
  },

  async getChatMessages(chatId: string): Promise<ChatMessage[]> {
    const { data, error } = await supabase
      .from('chat_messages')
      .select('*')
      .eq('chat_id', chatId)
      .order('created_at');
    if (error) throw error;
    return (data || []) as ChatMessage[];
  },

  async addMessage(chatId: string, content: string, role: ChatMessage['role'], metadata?: { speakerCharacterId?: string }): Promise<ChatMessage> {
    const baseMessage = { chat_id: chatId, content, role };
    const newMessage = metadata ? { ...baseMessage, metadata } : baseMessage;
    
    let { data, error } = await supabase
      .from('chat_messages')
      .insert(newMessage)
      .select('*')
      .single();
    
    // If metadata column doesn't exist, retry without it
    if (error && error.message?.toLowerCase().includes('metadata')) {
      ({ data, error } = await supabase
        .from('chat_messages')
        .insert(baseMessage)
        .select('*')
        .single());
    }
    
    if (error) throw error;
    // bump parent chat timestamp
    await supabase.from('chats').update({ updated_at: new Date().toISOString() }).eq('id', chatId);
    return data as ChatMessage;
  },

  async toggleFavorite(chatId: string, isFavorite: boolean): Promise<void> {
    const { error } = await supabase
      .from('chats')
      .update({ is_favorite: isFavorite, updated_at: new Date().toISOString() })
      .eq('id', chatId);
    if (error) throw error;
  },

  async updateTitle(chatId: string, title: string): Promise<void> {
    const { error } = await supabase
      .from('chats')
      .update({ title: title || null, updated_at: new Date().toISOString() })
      .eq('id', chatId);
    if (error) throw error;
  },
};

export default chat;
