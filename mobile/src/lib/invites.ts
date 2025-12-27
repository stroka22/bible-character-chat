import { supabase } from './supabase';
import { Share, Platform } from 'react-native';

function generateInviteCode(len = 10): string {
  const alphabet = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
  let out = '';
  for (let i = 0; i < len; i++) {
    out += alphabet[Math.floor(Math.random() * alphabet.length)];
  }
  return out;
}

export async function createChatInvite(chatId: string): Promise<{ code: string | null; error: string | null }> {
  if (!chatId) return { code: null, error: 'Missing chatId' };

  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { code: null, error: 'Not authenticated' };

  const code = generateInviteCode(10);
  
  // Set expiration to 30 days from now
  const expiresAt = new Date();
  expiresAt.setDate(expiresAt.getDate() + 30);

  const { data, error } = await supabase
    .from('chat_invites')
    .insert({ 
      chat_id: chatId, 
      code, 
      created_by: user.id, 
      expires_at: expiresAt.toISOString(),
      max_uses: null // unlimited uses
    })
    .select()
    .single();
  
  if (error) {
    console.warn('[invites] createChatInvite error:', error);
    return { code: null, error: error.message };
  }
  
  return { code: data?.code || code, error: null };
}

export async function shareInviteLink(code: string, title?: string): Promise<boolean> {
  const url = `https://faithtalkai.com/join/${code}`;
  const message = title 
    ? `Join me in "${title}" on Faith Talk AI!\n\n${url}`
    : `Join me on Faith Talk AI!\n\n${url}`;
  
  try {
    const result = await Share.share({
      message,
      url: Platform.OS === 'ios' ? url : undefined,
      title: 'Invite Friend to Faith Talk AI'
    });
    
    return result.action === Share.sharedAction;
  } catch (e) {
    console.warn('[invites] shareInviteLink error:', e);
    return false;
  }
}

export async function inviteFriendToChat(chatId: string, chatTitle?: string): Promise<{ success: boolean; error?: string }> {
  const { code, error } = await createChatInvite(chatId);
  
  if (error || !code) {
    return { success: false, error: error || 'Failed to create invite' };
  }
  
  const shared = await shareInviteLink(code, chatTitle);
  return { success: shared };
}
