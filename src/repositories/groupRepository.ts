import { supabase, type Character } from '../services/supabase';

/**
 * Type definition for a Character Group.
 * Matches the 'character_groups' table schema.
 */
export type CharacterGroup = {
  id: string;
  name: string;
  description: string | null;
  image_url: string | null;
  icon: string | null;
  sort_order: number;
  created_at: string;
  updated_at: string;
};

/**
 * Type definition for a Character Group Mapping.
 * Matches the 'character_group_mappings' table schema.
 */
export type CharacterGroupMapping = {
  id: string;
  group_id: string;
  character_id: string;
  sort_order: number;
  created_at: string;
  updated_at: string;
};

/**
 * Repository for interacting with Character Group data and mappings in Supabase.
 */
export const groupRepository = {
  /**
   * Creates a new character group.
   * @param groupData - Data for the new group (excluding id, created_at, updated_at).
   * @returns Promise resolving to the newly created CharacterGroup object.
   */
  async createGroup(
    groupData: Omit<CharacterGroup, 'id' | 'created_at' | 'updated_at'>
  ): Promise<CharacterGroup> {
    try {
      const { data, error } = await supabase
        .from('character_groups')
        .insert(groupData)
        .select('*')
        .single();

      if (error) {
        throw error;
      }
      return data as CharacterGroup;
    } catch (error) {
      console.error('Failed to create character group:', error);
      throw new Error('Failed to create character group. Please try again.');
    }
  },

  /**
   * Fetches all character groups.
   * @returns Promise resolving to an array of CharacterGroup objects.
   */
  async getAllGroups(): Promise<CharacterGroup[]> {
    try {
      const { data, error } = await supabase
        .from('character_groups')
        .select('*')
        .order('sort_order')
        .order('name');

      if (error) {
        throw error;
      }
      return data as CharacterGroup[];
    } catch (error) {
      console.error('Failed to fetch character groups:', error);
      throw new Error('Failed to load character groups. Please try again.');
    }
  },

  /**
   * Fetches a single character group by its ID.
   * @param id - The ID of the group.
   * @returns Promise resolving to the CharacterGroup object or null if not found.
   */
  async getGroupById(id: string): Promise<CharacterGroup | null> {
    try {
      const { data, error } = await supabase
        .from('character_groups')
        .select('*')
        .eq('id', id)
        .single();

      if (error) {
        if (error.code === 'PGRST116') {
          return null; // No rows found
        }
        throw error;
      }
      return data as CharacterGroup;
    } catch (error) {
      console.error(`Failed to fetch group with ID ${id}:`, error);
      throw new Error('Failed to fetch group. Please try again.');
    }
  },

  /**
   * Updates an existing character group.
   * @param id - The ID of the group to update.
   * @param updates - Partial data to update the group with.
   * @returns Promise resolving to the updated CharacterGroup object.
   */
  async updateGroup(
    id: string,
    updates: Partial<Omit<CharacterGroup, 'id' | 'created_at' | 'updated_at'>>
  ): Promise<CharacterGroup> {
    try {
      const { data, error } = await supabase
        .from('character_groups')
        .update({ ...updates, updated_at: new Date().toISOString() })
        .eq('id', id)
        .select('*')
        .single();

      if (error) {
        throw error;
      }
      return data as CharacterGroup;
    } catch (error) {
      console.error(`Failed to update group ${id}:`, error);
      throw new Error('Failed to update group. Please try again.');
    }
  },

  /**
   * Deletes a character group by its ID.
   * @param id - The ID of the group to delete.
   * @returns Promise resolving when the deletion is complete.
   */
  async deleteGroup(id: string): Promise<void> {
    try {
      const { error } = await supabase
        .from('character_groups')
        .delete()
        .eq('id', id);

      if (error) {
        throw error;
      }
    } catch (error) {
      console.error(`Failed to delete group ${id}:`, error);
      throw new Error('Failed to delete group. Please try again.');
    }
  },

  /**
   * Adds a character to a group.
   * @param groupId - The ID of the group.
   * @param characterId - The ID of the character.
   * @param sortOrder - Optional sort order for the character within the group.
   * @returns Promise resolving to the new CharacterGroupMapping object.
   */
  async addCharacterToGroup(
    groupId: string,
    characterId: string,
    sortOrder: number = 0
  ): Promise<CharacterGroupMapping> {
    try {
      const { data, error } = await supabase
        .from('character_group_mappings')
        .insert({ group_id: groupId, character_id: characterId, sort_order: sortOrder })
        .select('*')
        .single();

      if (error) {
        throw error;
      }
      return data as CharacterGroupMapping;
    } catch (error) {
      console.error('Failed to add character to group:', error);
      throw new Error('Failed to add character to group. Please try again.');
    }
  },

  /**
   * Removes a character from a group mapping.
   * @param mappingId - The ID of the mapping to delete.
   * @returns Promise resolving when the deletion is complete.
   */
  async removeCharacterFromGroup(mappingId: string): Promise<void> {
    try {
      const { error } = await supabase
        .from('character_group_mappings')
        .delete()
        .eq('id', mappingId);

      if (error) {
        throw error;
      }
    } catch (error) {
      console.error(`Failed to remove character mapping ${mappingId}:`, error);
      throw new Error('Failed to remove character from group. Please try again.');
    }
  },

  /**
   * Fetches all characters within a specific group.
   * Can optionally join with the 'characters' table to get full character details.
   * @param groupId - The ID of the group.
   * @returns Promise resolving to an array of CharacterGroupMapping objects (with joined character data).
   */
  async getCharactersInGroup(groupId: string): Promise<(CharacterGroupMapping & { character: Character })[]> {
    try {
      const { data, error } = await supabase
        .from('character_group_mappings')
        .select('*, character:characters(*)') // Select all mapping fields and join character details
        .eq('group_id', groupId)
        .order('sort_order');

      if (error) {
        throw error;
      }
      return data as (CharacterGroupMapping & { character: Character })[];
    } catch (error) {
      console.error(`Failed to fetch characters in group ${groupId}:`, error);
      throw new Error('Failed to load characters in group. Please try again.');
    }
  },

  /**
   * Fetches all groups a specific character belongs to.
   * @param characterId - The ID of the character.
   * @returns Promise resolving to an array of CharacterGroupMapping objects.
   */
  async getGroupsForCharacter(characterId: string): Promise<CharacterGroupMapping[]> {
    try {
      const { data, error } = await supabase
        .from('character_group_mappings')
        .select('*')
        .eq('character_id', characterId);

      if (error) {
        throw error;
      }
      return data as CharacterGroupMapping[];
    } catch (error) {
      console.error(`Failed to fetch groups for character ${characterId}:`, error);
      throw new Error('Failed to load groups for character. Please try again.');
    }
  },

  /**
   * Updates the sort order of a character within a group.
   * @param mappingId - The ID of the mapping to update.
   * @param newSortOrder - The new sort order value.
   * @returns Promise resolving to the updated CharacterGroupMapping object.
   */
  async updateCharacterMappingSortOrder(mappingId: string, newSortOrder: number): Promise<CharacterGroupMapping> {
    try {
      const { data, error } = await supabase
        .from('character_group_mappings')
        .update({ sort_order: newSortOrder, updated_at: new Date().toISOString() })
        .eq('id', mappingId)
        .select('*')
        .single();

      if (error) {
        throw error;
      }
      return data as CharacterGroupMapping;
    } catch (error) {
      console.error(`Failed to update mapping sort order ${mappingId}:`, error);
      throw new Error('Failed to update character order in group. Please try again.');
    }
  },
};
