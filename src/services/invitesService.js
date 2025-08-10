import { supabase } from './supabase';

/**
 * Get a list of invites, optionally filtered by owner slug
 * @param {Object} options - Options
 * @param {string} [options.ownerSlug] - Filter by owner slug
 * @returns {Promise<{data: Array, error: Object}>} - Invites data or error
 */
export async function listInvites({ ownerSlug } = {}) {
  let query = supabase.from('invites').select(`
    id,
    code,
    owner_slug,
    role,
    created_by,
    expires_at,
    max_uses,
    use_count,
    used_at,
    used_by,
    created_at,
    updated_at
  `).order('created_at', { ascending: false });

  // Filter by owner slug if provided
  if (ownerSlug) {
    query = query.eq('owner_slug', ownerSlug);
  }

  const { data, error } = await query;
  return { data, error };
}

/**
 * Generate a random invite code
 * @returns {string} - Random invite code
 */
function generateInviteCode() {
  // Generate a random string using crypto if available, or Math.random as fallback
  let randomValue;
  if (typeof crypto !== 'undefined' && crypto.getRandomValues) {
    const array = new Uint32Array(2);
    crypto.getRandomValues(array);
    randomValue = array[0].toString(36) + array[1].toString(36);
  } else {
    randomValue = Math.random().toString(36).substring(2) + 
                 Math.random().toString(36).substring(2);
  }
  
  // Format as XXXX-XXXX-XXXX
  const code = randomValue.substring(0, 12).toUpperCase();
  return `${code.substring(0, 4)}-${code.substring(4, 8)}-${code.substring(8, 12)}`;
}

/**
 * Create a new invite
 * @param {Object} options - Invite options
 * @param {string} options.ownerSlug - Owner slug
 * @param {string} [options.role='admin'] - Role to assign ('admin' or 'user')
 * @param {Date|null} [options.expiresAt=null] - Expiration date
 * @param {number} [options.maxUses=1] - Maximum number of uses
 * @param {string} [options.code] - Custom invite code (generated if not provided)
 * @returns {Promise<{data: Object, error: Object}>} - Created invite or error
 */
export async function createInvite({ 
  ownerSlug, 
  role = 'admin', 
  expiresAt = null, 
  maxUses = 1,
  code = null
}) {
  // Validate role
  if (role !== 'admin' && role !== 'user') {
    return { 
      data: null, 
      error: { message: "Role must be either 'admin' or 'user'" } 
    };
  }

  // Generate code if not provided
  if (!code) {
    code = generateInviteCode();
  }

  // Get current user ID
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) {
    return { 
      data: null, 
      error: { message: "Authentication required" } 
    };
  }

  // Create invite
  const { data, error } = await supabase.from('invites').insert({
    code,
    owner_slug: ownerSlug,
    role,
    created_by: user.id,
    expires_at: expiresAt,
    max_uses: maxUses,
    use_count: 0
  }).select().single();

  return { data, error };
}

/**
 * Redeem an invite code
 * @param {string} code - Invite code to redeem
 * @returns {Promise<{data: Object, error: Object}>} - Result of redemption
 */
export async function redeemInvite(code) {
  const { data, error } = await supabase.rpc('redeem_invite', { p_code: code });
  return { data, error };
}

/**
 * Get the current user's profile
 * @returns {Promise<{data: Object, error: Object}>} - User profile or error
 */
export async function getMyProfile() {
  const { data: { user } } = await supabase.auth.getUser();
  
  if (!user) {
    return { 
      data: null, 
      error: { message: "Not authenticated" } 
    };
  }

  const { data, error } = await supabase
    .from('profiles')
    .select(`
      id,
      role,
      owner_slug
    `)
    .eq('id', user.id)
    .maybeSingle();

  /* If no profile row yet, create one with sane defaults */
  if (!data) {
    const insertRes = await supabase
      .from('profiles')
      .insert({
        id: user.id,
        email: user.email,
        role: 'user'
      })
      .select(`
        id,
        role,
        owner_slug
      `)
      .single();

    // insertRes already in { data, error } shape
    return insertRes;
  }

  /* Row existed */
  return { data, error };
}

/**
 * Check if the current user is a superadmin
 * @returns {Promise<boolean>} - True if user is superadmin
 */
export async function isSuperAdmin() {
  const { data, error } = await getMyProfile();
  if (error || !data) return false;
  return data.role === 'superadmin';
}

/**
 * Check if the current user is an admin (either admin or superadmin)
 * @returns {Promise<boolean>} - True if user is admin or superadmin
 */
export async function isAdmin() {
  const { data, error } = await getMyProfile();
  if (error || !data) return false;
  return data.role === 'admin' || data.role === 'superadmin';
}
