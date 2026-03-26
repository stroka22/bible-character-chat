import { supabase } from './supabase';
import { getSettings } from './tierSettingsService';
import usePremium from '../hooks/usePremium';

/**
 * Generate a short base62 code
 */
export function generateInviteCode(len = 8) {
  const alphabet = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
  let out = '';
  const cryptoObj = (typeof crypto !== 'undefined' && crypto.getRandomValues) ? crypto : null;
  for (let i = 0; i < len; i++) {
    if (cryptoObj) {
      const a = new Uint32Array(1);
      cryptoObj.getRandomValues(a);
      out += alphabet[a[0] % alphabet.length];
    } else {
      out += alphabet[Math.floor(Math.random() * alphabet.length)];
    }
  }
  return out;
}

/**
 * Create a chat invite. Only premium chat owners can create.
 */
export async function createChatInvite(chatId, opts = {}) {
  if (!chatId) return { data: null, error: { message: 'Missing chatId' } };

  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { data: null, error: { message: 'Not authenticated' } };

  // Check premium status - invites are a premium feature
  const { data: profile } = await supabase
    .from('profiles')
    .select('premium_override, stripe_customer_id')
    .eq('id', user.id)
    .single();
  
  // If not premium override, check for active subscription
  if (!profile?.premium_override) {
    // For now, just check if they have a stripe_customer_id as a basic gate
    // The full subscription check happens in usePremium hook
    if (!profile?.stripe_customer_id) {
      return { data: null, error: { message: 'Invites require a premium subscription' } };
    }
  }

  // Compute defaults from tier settings
  let expiresAt = opts.expiresAt ?? null;
  let maxUses = opts.maxUses ?? null;
  let code = opts.code ?? generateInviteCode(10);

  try {
    // Try to fetch tier settings for defaults
    const ts = await getSettings();
    const invite = ts?.inviteSettings || {};
    if (expiresAt == null) {
      const days = invite.invite_expiration_days_premium ?? 30; // UI-only default; server will enforce per-org
      const dt = new Date();
      dt.setDate(dt.getDate() + days);
      expiresAt = dt.toISOString();
    }
    if (maxUses == null) {
      maxUses = (invite.invite_multiuse_premium ? null : 1);
    }
  } catch {}

  const { data, error } = await supabase
    .from('chat_invites')
    .insert({ chat_id: chatId, code, created_by: user.id, expires_at: expiresAt, max_uses: maxUses })
    .select()
    .single();
  return { data, error };
}

export async function listChatInvites(chatId) {
  let q = supabase.from('chat_invites').select('*').order('created_at', { ascending: false });
  if (chatId) q = q.eq('chat_id', chatId);
  const { data, error } = await q;
  return { data, error };
}

export async function revokeChatInvite(inviteId) {
  if (!inviteId) return { error: { message: 'Missing inviteId' } };
  const { error } = await supabase.from('chat_invites').update({ revoked: true }).eq('id', inviteId);
  return { error };
}

export async function redeemChatInvite(code) {
  if (!code) return { data: null, error: { message: 'Missing code' } };
  const { data, error } = await supabase.rpc('redeem_chat_invite', { p_code: code });
  return { data, error };
}

/**
 * Get preview information for a chat invite without redeeming it
 * Returns: inviter name, character name/avatar, conversation topic
 */
export async function getChatInvitePreview(code) {
  console.log('[chatInvitesService] getChatInvitePreview called with code:', code);
  if (!code) return { data: null, error: { message: 'Missing code' } };
  
  // Use RPC function that bypasses RLS
  const { data, error } = await supabase.rpc('get_chat_invite_preview', { p_code: code });
  
  console.log('[chatInvitesService] RPC result:', { data, error });
  
  if (error) {
    console.log('[chatInvitesService] RPC error:', error);
    return { data: null, error: { message: error.message || 'Failed to load invite' } };
  }
  
  // Check if RPC returned an error in the data
  if (data?.error) {
    return { data: null, error: { message: data.error } };
  }
  
  return {
    data: {
      inviteId: data.inviteId,
      chatId: data.chatId,
      chatTitle: data.chatTitle,
      character: data.character,
      inviter: data.inviter,
      isRoundtable: data.isRoundtable,
      roundtableTopic: data.roundtableTopic,
      participants: data.participants || []
    },
    error: null
  };
}
