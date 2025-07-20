import { supabase } from '../services/supabase';
// Local fallback when Supabase is unavailable
import { mockGroupData } from '../data/mockGroups';
export const groupRepository = {
    async createGroup(groupData) {
        try {
            const { data, error } = await supabase
                .from('character_groups')
                .insert(groupData)
                .select('*')
                .single();
            if (error) {
                throw error;
            }
            return data;
        }
        catch (error) {
            console.error('Failed to create character group:', error);
            throw new Error('Failed to create character group. Please try again.');
        }
    },
    async getAllGroups() {
        try {
            const { data, error } = await supabase
                .from('character_groups')
                .select('*')
                .order('sort_order')
                .order('name');
            if (error) {
                throw error;
            }
            return data;
        }
        catch (error) {
            console.error('Failed to fetch character groups from Supabase. Falling back to mock data...', error);
            try {
                const data = await mockGroupData.getAllGroups();
                return data;
            }
            catch (mockErr) {
                console.error('Fallback to mock group data failed:', mockErr);
                throw new Error('Failed to load character groups. Please try again.');
            }
        }
    },
    async getGroupById(id) {
        try {
            const { data, error } = await supabase
                .from('character_groups')
                .select('*')
                .eq('id', id)
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
            console.error(`Failed to fetch group with ID ${id} from Supabase. Falling back to mock data...`, error);
            try {
                const data = await mockGroupData.getGroupById(id);
                return data;
            }
            catch (mockErr) {
                console.error('Fallback to mock group data failed:', mockErr);
                throw new Error('Failed to fetch group. Please try again.');
            }
        }
    },
    async updateGroup(id, updates) {
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
            return data;
        }
        catch (error) {
            console.error(`Failed to update group ${id}:`, error);
            throw new Error('Failed to update group. Please try again.');
        }
    },
    async deleteGroup(id) {
        try {
            const { error } = await supabase
                .from('character_groups')
                .delete()
                .eq('id', id);
            if (error) {
                throw error;
            }
        }
        catch (error) {
            console.error(`Failed to delete group ${id}:`, error);
            throw new Error('Failed to delete group. Please try again.');
        }
    },
    async addCharacterToGroup(groupId, characterId, sortOrder = 0) {
        try {
            const { data, error } = await supabase
                .from('character_group_mappings')
                .insert({ group_id: groupId, character_id: characterId, sort_order: sortOrder })
                .select('*')
                .single();
            if (error) {
                throw error;
            }
            return data;
        }
        catch (error) {
            console.error('Failed to add character to group:', error);
            throw new Error('Failed to add character to group. Please try again.');
        }
    },
    async removeCharacterFromGroup(mappingId) {
        try {
            const { error } = await supabase
                .from('character_group_mappings')
                .delete()
                .eq('id', mappingId);
            if (error) {
                throw error;
            }
        }
        catch (error) {
            console.error(`Failed to remove character mapping ${mappingId}:`, error);
            throw new Error('Failed to remove character from group. Please try again.');
        }
    },
    async getCharactersInGroup(groupId) {
        try {
            const { data, error } = await supabase
                .from('character_group_mappings')
                .select('*, character:characters(*)')
                .eq('group_id', groupId)
                .order('sort_order');
            if (error) {
                throw error;
            }
            return data;
        }
        catch (error) {
            console.error(`Failed to fetch characters in group ${groupId} from Supabase. Falling back to mock data...`, error);
            try {
                const data = await mockGroupData.getCharactersInGroup(groupId);
                return data;
            }
            catch (mockErr) {
                console.error('Fallback to mock group data failed:', mockErr);
                throw new Error('Failed to load characters in group. Please try again.');
            }
        }
    },
    async getGroupsForCharacter(characterId) {
        try {
            const { data, error } = await supabase
                .from('character_group_mappings')
                .select('*')
                .eq('character_id', characterId);
            if (error) {
                throw error;
            }
            return data;
        }
        catch (error) {
            console.error(`Failed to fetch groups for character ${characterId} from Supabase. Falling back to mock data...`, error);
            try {
                const data = await mockGroupData.getGroupsForCharacter(characterId);
                return data;
            }
            catch (mockErr) {
                console.error('Fallback to mock group data failed:', mockErr);
                throw new Error('Failed to load groups for character. Please try again.');
            }
        }
    },
    async updateCharacterMappingSortOrder(mappingId, newSortOrder) {
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
            return data;
        }
        catch (error) {
            console.error(`Failed to update mapping sort order ${mappingId}:`, error);
            throw new Error('Failed to update character order in group. Please try again.');
        }
    },
};
