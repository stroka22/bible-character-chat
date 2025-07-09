import { supabase, type Character } from '../services/supabase';
import { getSafeAvatarUrl } from '../utils/imageUtils';

/**
 * Repository for interacting with Bible character data in Supabase
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
   * Fetch all available Bible characters
   * @returns Promise resolving to an array of Character objects
   */
  async getAll(isAdmin: boolean = false): Promise<Character[]> {
    try {
      const { data, error } = await supabase
        .from('characters')
        .select('*')
        // Hide characters that are not marked as visible **unless** this
        // method is called by an admin user.
        .modify((query) => {
          if (!isAdmin) {
            // Either `is_visible` is true *or* the column is NULL
            // (NULL means legacy rows created before the column existed)
            query.or('is_visible.is.null,is_visible.eq.true');
          }
        })
        .order('name');
      
      if (error) {
        throw error;
      }
      
      // Sanitize URLs in character data before returning
      return this.sanitizeCharacters(data as Character[]);
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
   * Fetch a specific Bible character by name
   * @param name - The name of the character
   * @returns Promise resolving to a Character object or null if not found
   */
  async getByName(name: string): Promise<Character | null> {
    try {
      const { data, error } = await supabase
        .from('characters')
        .select('*')
        .ilike('name', name)
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
   * Create a new Bible character
   * @param character - Data for the new character (excluding id/created_at/updated_at)
   * @returns Promise resolving to the newly-created Character object
   */
  async createCharacter(
    character: Omit<
      Character,
      'id' | 'created_at' | 'updated_at'
    >
  ): Promise<Character> {
    try {
      // Sanitize URLs before storing in the database
      const sanitizedCharacter = {
        ...character,
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
   * Update an existing character
   * @param id - Character ID
   * @param updates - Partial character fields to update
   * @returns Promise resolving to the updated Character object
   */
  async updateCharacter(
    id: string,
    updates: Partial<
      Omit<Character, 'id' | 'created_at' | 'updated_at'>
    >
  ): Promise<Character> {
    try {
      // Sanitize URLs in updates before storing
      const sanitizedUpdates = { ...updates };
      
      if (updates.avatar_url && updates.name) {
        sanitizedUpdates.avatar_url = getSafeAvatarUrl(updates.name, updates.avatar_url);
      }
      
      if (updates.feature_image_url && updates.name) {
        sanitizedUpdates.feature_image_url = getSafeAvatarUrl(updates.name, updates.feature_image_url);
      }

      const { data, error } = await supabase
        .from('characters')
        .update({ ...sanitizedUpdates, updated_at: new Date().toISOString() })
        .eq('id', id)
        .select('*')
        .single();

      if (error) {
        throw error;
      }

      return this.sanitizeCharacter(data as Character);
    } catch (error) {
      console.error(`Failed to update character ${id}:`, error);
      throw new Error('Failed to update character. Please try again later.');
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
    >[]
  ): Promise<Character[]> {
    if (characters.length === 0) return [];

    try {
      // Sanitize URLs in all characters before storing
      const sanitizedCharacters = characters.map(char => ({
        ...char,
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
  }
};
