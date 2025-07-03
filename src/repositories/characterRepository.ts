import { supabase, type Character } from '../services/supabase';

/**
 * Repository for interacting with Bible character data in Supabase
 */
export const characterRepository = {
  /**
   * Fetch all available Bible characters
   * @returns Promise resolving to an array of Character objects
   */
  async getAll(): Promise<Character[]> {
    try {
      const { data, error } = await supabase
        .from('characters')
        .select('*')
        .order('name');
      
      if (error) {
        throw error;
      }
      
      return data as Character[];
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
      
      return data as Character;
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
      
      return data as Character;
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
  async search(query: string): Promise<Character[]> {
    try {
      const { data, error } = await supabase
        .from('characters')
        .select('*')
        .ilike('name', `%${query}%`)
        .order('name');
      
      if (error) {
        throw error;
      }
      
      return data as Character[];
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
      const { data, error } = await supabase
        .from('characters')
        .insert(character)
        .select('*')
        .single();

      if (error) {
        throw error;
      }

      return data as Character;
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
      const { data, error } = await supabase
        .from('characters')
        .update({ ...updates, updated_at: new Date().toISOString() })
        .eq('id', id)
        .select('*')
        .single();

      if (error) {
        throw error;
      }

      return data as Character;
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
      const { data, error } = await supabase
        .from('characters')
        .insert(characters)
        .select('*');

      if (error) {
        throw error;
      }

      return data as Character[];
    } catch (error) {
      console.error('Failed to bulk create characters:', error);
      throw new Error('Failed to bulk create characters. Please try again later.');
    }
  }
};
