import { supabase } from './supabase';
import { getOwnerSlug } from './tier';

export type Character = {
  id: string;
  name: string;
  description?: string;
  avatar_url?: string;
  opening_line?: string;
  persona_prompt?: string;
  is_visible?: boolean;
  bible_book?: string;
  owner_slug?: string;
  source_character_id?: string | null;
};

/**
 * Fetch all visible characters for the user's organization
 * Uses copy-on-write: returns org-specific characters merged with defaults
 */
export async function getCharacters(userId?: string, options?: {
  search?: string;
  letter?: string;
  includeHidden?: boolean;
}): Promise<Character[]> {
  const ownerSlug = await getOwnerSlug(userId);
  const { search, letter, includeHidden } = options || {};
  
  // Build query to get both org-specific and default characters
  // Note: owner_slug column may not exist yet (backwards compatibility)
  let query = supabase
    .from('characters')
    .select('id,name,description,avatar_url,opening_line,persona_prompt,is_visible,bible_book,owner_slug,source_character_id');
  
  // Only filter by owner_slug if we're not using 'default' (to handle migration period)
  if (ownerSlug !== 'default') {
    query = query.or(`owner_slug.eq.${ownerSlug},owner_slug.eq.default,owner_slug.is.null`);
  }
  
  // Filter visibility unless includeHidden
  if (!includeHidden) {
    query = query.or('is_visible.is.null,is_visible.eq.true');
  }
  
  // Apply search filter
  if (search && search.trim()) {
    query = query.or(
      `name.ilike.%${search}%,description.ilike.%${search}%,bible_book.ilike.%${search}%`
    ) as any;
  }
  
  // Apply letter filter
  if (letter) {
    query = query.ilike('name', `${letter}%`) as any;
  }
  
  const { data, error } = await query.order('name');
  
  if (error) {
    console.error('[Characters] Failed to fetch:', error);
    return [];
  }
  
  if (!data) return [];
  
  // Merge: org-specific characters override defaults with same name
  const charactersByName = new Map<string, Character>();
  
  // First add all default characters (owner_slug === 'default' or null/undefined for backwards compat)
  for (const char of data) {
    if (!char.owner_slug || char.owner_slug === 'default') {
      charactersByName.set(char.name.toLowerCase(), char);
    }
  }
  
  // Then override with org-specific characters
  if (ownerSlug !== 'default') {
    for (const char of data) {
      if (char.owner_slug === ownerSlug) {
        charactersByName.set(char.name.toLowerCase(), char);
      }
    }
  }
  
  // Convert back to array and sort by name
  return Array.from(charactersByName.values())
    .sort((a, b) => a.name.localeCompare(b.name));
}

/**
 * Get a single character by ID, preferring org-specific version
 */
export async function getCharacterById(characterId: string, userId?: string): Promise<Character | null> {
  const ownerSlug = await getOwnerSlug(userId);
  
  // First get the character to check its name
  const { data: char, error } = await supabase
    .from('characters')
    .select('*')
    .eq('id', characterId)
    .maybeSingle();
  
  if (error || !char) return char;
  
  // If this is a default character and user has an org, check for org-specific version
  if (char.owner_slug === 'default' && ownerSlug !== 'default') {
    const { data: orgChar } = await supabase
      .from('characters')
      .select('*')
      .eq('owner_slug', ownerSlug)
      .ilike('name', char.name)
      .maybeSingle();
    
    if (orgChar) return orgChar;
  }
  
  return char;
}

/**
 * Get a single character by name, preferring org-specific version
 */
export async function getCharacterByName(name: string, userId?: string): Promise<Character | null> {
  const ownerSlug = await getOwnerSlug(userId);
  
  // First try org-specific
  if (ownerSlug !== 'default') {
    const { data: orgChar } = await supabase
      .from('characters')
      .select('*')
      .eq('owner_slug', ownerSlug)
      .ilike('name', name)
      .maybeSingle();
    
    if (orgChar) return orgChar;
  }
  
  // Fall back to default
  const { data: defaultChar } = await supabase
    .from('characters')
    .select('*')
    .eq('owner_slug', 'default')
    .ilike('name', name)
    .maybeSingle();
  
  return defaultChar;
}
