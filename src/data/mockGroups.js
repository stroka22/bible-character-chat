/**
 * Mock Bible Character Groups Data
 * 
 * This file provides fallback group data when the Supabase database
 * connection fails. It contains common biblical character groupings
 * that can be used to categorize characters.
 */

// Mock group data
const MOCK_GROUPS = [
  {
    id: 1,
    name: "Prophets",
    description: "Those who received divine revelations and communicated God's messages to the people.",
    sort_order: 10,
    created_at: "2023-01-01T00:00:00.000Z",
    updated_at: "2023-01-01T00:00:00.000Z"
  },
  {
    id: 2,
    name: "Apostles",
    description: "The twelve disciples chosen by Jesus and others commissioned to spread the gospel.",
    sort_order: 20,
    created_at: "2023-01-01T00:00:00.000Z",
    updated_at: "2023-01-01T00:00:00.000Z"
  },
  {
    id: 3,
    name: "Kings",
    description: "Rulers of Israel and Judah throughout biblical history.",
    sort_order: 30,
    created_at: "2023-01-01T00:00:00.000Z",
    updated_at: "2023-01-01T00:00:00.000Z"
  },
  {
    id: 4,
    name: "Women of the Bible",
    description: "Notable women whose stories demonstrate faith, courage, and leadership.",
    sort_order: 40,
    created_at: "2023-01-01T00:00:00.000Z",
    updated_at: "2023-01-01T00:00:00.000Z"
  },
  {
    id: 5,
    name: "Patriarchs",
    description: "The founding fathers of the Israelite nation, including Abraham, Isaac, and Jacob.",
    sort_order: 5,
    created_at: "2023-01-01T00:00:00.000Z",
    updated_at: "2023-01-01T00:00:00.000Z"
  },
  {
    id: 6,
    name: "Judges",
    description: "Leaders who ruled Israel before the monarchy was established.",
    sort_order: 25,
    created_at: "2023-01-01T00:00:00.000Z",
    updated_at: "2023-01-01T00:00:00.000Z"
  },
  {
    id: 7,
    name: "New Testament Figures",
    description: "Important characters from the Gospels, Acts, and Epistles.",
    sort_order: 50,
    created_at: "2023-01-01T00:00:00.000Z",
    updated_at: "2023-01-01T00:00:00.000Z"
  }
];

// Mock character to group mappings
const MOCK_CHARACTER_GROUP_MAPPINGS = [
  // Prophets
  { id: 1, group_id: 1, character_id: 1, sort_order: 10 }, // Moses
  { id: 2, group_id: 1, character_id: 10, sort_order: 20 }, // Daniel
  
  // Apostles
  { id: 3, group_id: 2, character_id: 6, sort_order: 10 }, // Peter
  { id: 4, group_id: 2, character_id: 5, sort_order: 20 }, // Paul
  { id: 5, group_id: 2, character_id: 8, sort_order: 30 }, // John
  
  // Kings
  { id: 6, group_id: 3, character_id: 2, sort_order: 10 }, // David
  
  // Women of the Bible
  { id: 7, group_id: 4, character_id: 3, sort_order: 10 }, // Esther
  { id: 8, group_id: 4, character_id: 4, sort_order: 20 }, // Mary
  { id: 9, group_id: 4, character_id: 9, sort_order: 30 }, // Ruth
  
  // Patriarchs
  { id: 10, group_id: 5, character_id: 7, sort_order: 10 } // Abraham
];

/**
 * Mock group data repository that implements the same interface as groupRepository.js
 * Used as a fallback when the Supabase database connection fails
 */
export const mockGroupData = {
  groups: MOCK_GROUPS,
  mappings: MOCK_CHARACTER_GROUP_MAPPINGS,
  
  /**
   * Get all character groups
   * @returns {Promise<Array>} - Array of group objects
   */
  getAllGroups() {
    try {
      return Promise.resolve([...this.groups]);
    } catch (error) {
      console.error('Error in mock getAllGroups:', error);
      return Promise.reject(new Error('Failed to get mock character groups'));
    }
  },
  
  /**
   * Get a group by ID
   * @param {number|string} id - The group ID to find
   * @returns {Promise<Object|null>} - Group object or null if not found
   */
  getGroupById(id) {
    try {
      const group = this.groups.find(g => g.id === Number(id));
      return Promise.resolve(group || null);
    } catch (error) {
      console.error(`Error in mock getGroupById(${id}):`, error);
      return Promise.reject(new Error('Failed to get mock group by ID'));
    }
  },
  
  /**
   * Get characters in a specific group
   * @param {number|string} groupId - The group ID to find characters for
   * @returns {Promise<Array>} - Array of character mapping objects
   */
  getCharactersInGroup(groupId) {
    try {
      const mappings = this.mappings.filter(m => m.group_id === Number(groupId));
      // In a real implementation, we would join with character data
      // Here we just return the mappings
      return Promise.resolve(mappings);
    } catch (error) {
      console.error(`Error in mock getCharactersInGroup(${groupId}):`, error);
      return Promise.reject(new Error('Failed to get mock characters in group'));
    }
  },
  
  /**
   * Get groups for a specific character
   * @param {number|string} characterId - The character ID to find groups for
   * @returns {Promise<Array>} - Array of group mapping objects
   */
  getGroupsForCharacter(characterId) {
    try {
      const mappings = this.mappings.filter(m => m.character_id === Number(characterId));
      return Promise.resolve(mappings);
    } catch (error) {
      console.error(`Error in mock getGroupsForCharacter(${characterId}):`, error);
      return Promise.reject(new Error('Failed to get mock groups for character'));
    }
  }
};

// For direct use in browser scripts if needed
if (typeof window !== 'undefined') {
  window.MOCK_BIBLE_GROUPS = MOCK_GROUPS;
}
