import { supabase, type Character } from '../services/supabase';
import { getSafeAvatarUrl } from '../utils/imageUtils';

// Extend Character type to include new fields
type CharacterWithOrg = Character & {
  owner_slug?: string;
  source_character_id?: string | null;
};

/**
 * Repository for interacting with Bible character data in Supabase
 * Supports copy-on-write for organization-specific customizations
 */
export const characterRepository = {
  /**
   * Sanitizes character data by replacing unsafe URLs with fallbacks
   * @param character - The character object to sanitize
   * @returns The sanitized character object
   */
  sanitizeCharacter(character: Character): Character {
    if (!character) return character;
    
    // Create a copy to avoid mutating the original
    const sanitized = { ...character };
    
    // Sanitize avatar URL if present
    if (sanitized.avatar_url) {
      sanitized.avatar_url = getSafeAvatarUrl(sanitized.name, sanitized.avatar_url);
    }
    
    // Sanitize feature image URL if present
    if (sanitized.feature_image_url) {
      sanitized.feature_image_url = getSafeAvatarUrl(sanitized.name, sanitized.feature_image_url);
    }
    
    return sanitized;
  },
  
  /**
   * Sanitizes an array of character objects
   * @param characters - Array of character objects
   * @returns Array of sanitized character objects
   */
  sanitizeCharacters(characters: Character[]): Character[] {
    return characters.map(char => this.sanitizeCharacter(char));
  },

  /**
   * Fetch all available Bible characters for an organization
   * Uses copy-on-write: returns org-specific characters merged with defaults
   * @param ownerSlug - Organization slug (defaults to 'default')
   * @param isAdmin - Whether to include hidden characters
   * @returns Promise resolving to an array of Character objects
   */
  async getAll(isAdmin: boolean = false, ownerSlug: string = 'default'): Promise<Character[]> {
    try {
      // Fetch both org-specific and default characters
      let query = supabase
        .from('characters')
        .select('*')
        .or(`owner_slug.eq.${ownerSlug},owner_slug.eq.default`);
      
      // Hide non-visible characters unless admin
      if (!isAdmin) {
        query = query.or('is_visible.is.null,is_visible.eq.true');
      }
      
      const { data, error } = await query.order('name');
      
      if (error) {
        throw error;
      }
      
      // Merge: org-specific characters override defaults with same name
      const charactersByName = new Map<string, CharacterWithOrg>();
      
      // First add all default characters
      for (const char of (data as CharacterWithOrg[])) {
        if (char.owner_slug === 'default') {
          charactersByName.set(char.name.toLowerCase(), char);
        }
      }
      
      // Then override with org-specific characters
      for (const char of (data as CharacterWithOrg[])) {
        if (char.owner_slug === ownerSlug && ownerSlug !== 'default') {
          charactersByName.set(char.name.toLowerCase(), char);
        }
      }
      
      // Convert back to array and sort by name
      const mergedCharacters = Array.from(charactersByName.values())
        .sort((a, b) => a.name.localeCompare(b.name));
      
      return this.sanitizeCharacters(mergedCharacters);
    } catch (error) {
      console.error('Failed to fetch characters:', error);
      throw new Error('Failed to fetch characters. Please try again later.');
    }
  },

  /**
   * Fetch a specific Bible character by ID
   * @param id - The unique identifier of the character
   * @returns Promise resolving to a Character object or null if not found
   */
  async getById(id: string): Promise<Character | null> {
    try {
      const { data, error } = await supabase
        .from('characters')
        .select('*')
        .eq('id', id)
        .single();
      
      if (error) {
        if (error.code === 'PGRST116') {
          // PGRST116 is the error code for "no rows returned"
          return null;
        }
        throw error;
      }
      
      // Sanitize URLs in character data before returning
      return this.sanitizeCharacter(data as Character);
    } catch (error) {
      console.error(`Failed to fetch character with ID ${id}:`, error);
      throw new Error('Failed to fetch character. Please try again later.');
    }
  },

  /**
   * Fetch a specific Bible character by name for an organization
   * Prefers org-specific version, falls back to default
   * @param name - The name of the character
   * @param ownerSlug - Organization slug (defaults to 'default')
   * @returns Promise resolving to a Character object or null if not found
   */
  async getByName(name: string, ownerSlug: string = 'default'): Promise<Character | null> {
    try {
      // First try to find org-specific character
      if (ownerSlug !== 'default') {
        const { data: orgChar, error: orgError } = await supabase
          .from('characters')
          .select('*')
          .ilike('name', name)
          .eq('owner_slug', ownerSlug)
          .maybeSingle();
        
        if (!orgError && orgChar) {
          return this.sanitizeCharacter(orgChar as Character);
        }
      }
      
      // Fall back to default character
      const { data, error } = await supabase
        .from('characters')
        .select('*')
        .ilike('name', name)
        .eq('owner_slug', 'default')
        .maybeSingle();
      
      if (error) {
        throw error;
      }
      
      if (!data) return null;
      
      return this.sanitizeCharacter(data as Character);
    } catch (error) {
      console.error(`Failed to fetch character with name ${name}:`, error);
      throw new Error('Failed to fetch character. Please try again later.');
    }
  },

  /**
   * Search for Bible characters by name
   * @param query - The search query
   * @returns Promise resolving to an array of Character objects
   */
  async search(query: string, isAdmin: boolean = false): Promise<Character[]> {
    try {
      const { data, error } = await supabase
        .from('characters')
        .select('*')
        .ilike('name', `%${query}%`)
        .modify((builder) => {
          if (!isAdmin) {
            builder.or('is_visible.is.null,is_visible.eq.true');
          }
        })
        .order('name');
      
      if (error) {
        throw error;
      }
      
      // Sanitize URLs in character data before returning
      return this.sanitizeCharacters(data as Character[]);
    } catch (error) {
      console.error(`Failed to search characters with query ${query}:`, error);
      throw new Error('Failed to search characters. Please try again later.');
    }
  },

  /**
   * Create a new Bible character for an organization
   * @param character - Data for the new character (excluding id/created_at/updated_at)
   * @param ownerSlug - Organization slug (defaults to 'default')
   * @returns Promise resolving to the newly-created Character object
   */
  async createCharacter(
    character: Omit<
      Character,
      'id' | 'created_at' | 'updated_at'
    >,
    ownerSlug: string = 'default'
  ): Promise<Character> {
    try {
      // Sanitize URLs before storing in the database
      const sanitizedCharacter = {
        ...character,
        owner_slug: ownerSlug,
        avatar_url: character.avatar_url ? 
          getSafeAvatarUrl(character.name, character.avatar_url) : 
          character.avatar_url,
        feature_image_url: character.feature_image_url ? 
          getSafeAvatarUrl(character.name, character.feature_image_url) : 
          character.feature_image_url
      };

      const { data, error } = await supabase
        .from('characters')
        .insert(sanitizedCharacter)
        .select('*')
        .single();

      if (error) {
        throw error;
      }

      return this.sanitizeCharacter(data as Character);
    } catch (error) {
      console.error('Failed to create character:', error);
      throw new Error('Failed to create character. Please try again later.');
    }
  },

  /**
   * Update an existing character with copy-on-write for org customizations
   * If the character belongs to 'default' and ownerSlug is different,
   * creates a copy for the org first, then updates the copy.
   * @param id - Character ID
   * @param updates - Partial character fields to update
   * @param ownerSlug - Organization slug (defaults to 'default')
   * @returns Promise resolving to the updated Character object
   */
  async updateCharacter(
    id: string,
    updates: Partial<
      Omit<Character, 'id' | 'created_at' | 'updated_at'>
    >,
    ownerSlug: string = 'default'
  ): Promise<Character> {
    try {
      // First, fetch the existing character to check its owner_slug
      const { data: existing, error: fetchError } = await supabase
        .from('characters')
        .select('*')
        .eq('id', id)
        .single();
      
      if (fetchError) throw fetchError;
      
      const existingChar = existing as CharacterWithOrg;
      
      // Sanitize URLs in updates before storing
      const sanitizedUpdates = { ...updates };
      const charName = updates.name || existingChar.name;
      
      if (updates.avatar_url) {
        sanitizedUpdates.avatar_url = getSafeAvatarUrl(charName, updates.avatar_url);
      }
      
      if (updates.feature_image_url) {
        sanitizedUpdates.feature_image_url = getSafeAvatarUrl(charName, updates.feature_image_url);
      }

      // Copy-on-write: if editing a default character from a different org, create a copy
      if (existingChar.owner_slug === 'default' && ownerSlug !== 'default') {
        // Check if an org-specific copy already exists
        const { data: existingCopy } = await supabase
          .from('characters')
          .select('*')
          .eq('owner_slug', ownerSlug)
          .ilike('name', existingChar.name)
          .maybeSingle();
        
        if (existingCopy) {
          // Update the existing copy
          const { data, error } = await supabase
            .from('characters')
            .update({ ...sanitizedUpdates, updated_at: new Date().toISOString() })
            .eq('id', existingCopy.id)
            .select('*')
            .single();
          
          if (error) throw error;
          return this.sanitizeCharacter(data as Character);
        }
        
        // Create a new copy for this org
        const { id: _oldId, created_at: _ca, updated_at: _ua, ...charData } = existingChar;
        const newCharacter = {
          ...charData,
          ...sanitizedUpdates,
          owner_slug: ownerSlug,
          source_character_id: id, // Track which character this was copied from
        };
        
        const { data, error } = await supabase
          .from('characters')
          .insert(newCharacter)
          .select('*')
          .single();
        
        if (error) throw error;
        return this.sanitizeCharacter(data as Character);
      }
      
      // Direct update (either editing own org's character or superadmin editing default)
      const { data, error } = await supabase
        .from('characters')
        .update({ ...sanitizedUpdates, updated_at: new Date().toISOString() })
        .eq('id', id)
        .select('*')
        .single();

      if (error) throw error;
      return this.sanitizeCharacter(data as Character);
    } catch (error: any) {
      console.error(`Failed to update character ${id}:`, error);
      console.error('Supabase error details:', error?.message, error?.code, error?.details, error?.hint);
      throw new Error(error?.message || 'Failed to update character. Please try again later.');
    }
  },

  /**
   * Delete a character by ID
   * @param id - Character ID
   */
  async deleteCharacter(id: string): Promise<void> {
    try {
      const { error } = await supabase
        .from('characters')
        .delete()
        .eq('id', id);

      if (error) {
        throw error;
      }
    } catch (error) {
      console.error(`Failed to delete character ${id}:`, error);
      throw new Error('Failed to delete character. Please try again later.');
    }
  },

  /**
   * Bulk create characters (e.g., via CSV upload)
   * @param characters - Array of character objects (same shape as createCharacter input)
   * @returns Promise resolving to the array of created Character objects
   */
  async bulkCreateCharacters(
    characters: Omit<
      Character,
      'id' | 'created_at' | 'updated_at'
    >[],
    ownerSlug: string = 'default'
  ): Promise<Character[]> {
    if (characters.length === 0) return [];

    try {
      // Sanitize URLs in all characters before storing
      const sanitizedCharacters = characters.map(char => ({
        ...char,
        owner_slug: ownerSlug,
        avatar_url: char.avatar_url ? 
          getSafeAvatarUrl(char.name, char.avatar_url) : 
          char.avatar_url,
        feature_image_url: char.feature_image_url ? 
          getSafeAvatarUrl(char.name, char.feature_image_url) : 
          char.feature_image_url
      }));

      const { data, error } = await supabase
        .from('characters')
        .insert(sanitizedCharacters)
        .select('*');

      if (error) {
        throw error;
      }

      return this.sanitizeCharacters(data as Character[]);
    } catch (error) {
      console.error('Failed to bulk create characters:', error);
      throw new Error('Failed to bulk create characters. Please try again later.');
    }
  },

  /**
   * Copy all default characters to a new organization
   * Used by superadmins when setting up a new org
   * @param targetOwnerSlug - The organization to copy characters to
   * @returns Promise resolving to the number of characters copied
   */
  async copyAllCharactersToOrg(targetOwnerSlug: string): Promise<number> {
    if (!targetOwnerSlug || targetOwnerSlug === 'default') {
      throw new Error('Cannot copy characters to default organization');
    }

    try {
      // Get all default characters
      const { data: defaultChars, error: fetchError } = await supabase
        .from('characters')
        .select('*')
        .eq('owner_slug', 'default');
      
      if (fetchError) throw fetchError;
      if (!defaultChars || defaultChars.length === 0) return 0;
      
      // Check which characters already exist in target org
      const { data: existingChars } = await supabase
        .from('characters')
        .select('name')
        .eq('owner_slug', targetOwnerSlug);
      
      const existingNames = new Set((existingChars || []).map((c: { name: string }) => c.name.toLowerCase()));
      
      // Filter out characters that already exist in target org
      const charsToCopy = defaultChars.filter(
        (c: CharacterWithOrg) => !existingNames.has(c.name.toLowerCase())
      );
      
      if (charsToCopy.length === 0) return 0;
      
      // Create copies for the target org
      const newCharacters = charsToCopy.map((char: CharacterWithOrg) => {
        const { id, created_at, updated_at, owner_slug, ...charData } = char;
        return {
          ...charData,
          owner_slug: targetOwnerSlug,
          source_character_id: id,
        };
      });
      
      const { error: insertError } = await supabase
        .from('characters')
        .insert(newCharacters);
      
      if (insertError) throw insertError;
      
      return newCharacters.length;
    } catch (error) {
      console.error('Failed to copy characters to org:', error);
      throw new Error('Failed to copy characters. Please try again later.');
    }
  },

  /**
   * Get all characters for a specific org only (not merged with defaults)
   * Used by superadmins to see what an org has customized
   * @param ownerSlug - Organization slug
   * @returns Promise resolving to an array of Character objects
   */
  async getOrgOnlyCharacters(ownerSlug: string): Promise<Character[]> {
    try {
      const { data, error } = await supabase
        .from('characters')
        .select('*')
        .eq('owner_slug', ownerSlug)
        .order('name');
      
      if (error) throw error;
      return this.sanitizeCharacters(data as Character[]);
    } catch (error) {
      console.error('Failed to fetch org characters:', error);
      throw new Error('Failed to fetch org characters. Please try again later.');
    }
  },

  /**
   * Reset an org's character back to default (delete the org's copy)
   * @param characterId - The org-specific character ID to delete
   * @param ownerSlug - Organization slug
   */
  async resetCharacterToDefault(characterId: string, ownerSlug: string): Promise<void> {
    if (ownerSlug === 'default') {
      throw new Error('Cannot reset default characters');
    }

    try {
      const { error } = await supabase
        .from('characters')
        .delete()
        .eq('id', characterId)
        .eq('owner_slug', ownerSlug);

      if (error) throw error;
    } catch (error) {
      console.error('Failed to reset character:', error);
      throw new Error('Failed to reset character. Please try again later.');
    }
  }
};
