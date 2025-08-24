import React, {
  useState,
  useEffect,
  useCallback,
  Fragment,
} from 'react';
import type { FormEvent } from 'react';
import { groupRepository } from '../../repositories/groupRepository';
import type {
  CharacterGroup,
  CharacterGroupMapping,
} from '../../repositories/groupRepository';
import { characterRepository } from '../../repositories/characterRepository';
import type { Character } from '../../services/supabase';

const GroupManagement: React.FC = () => {
  /* ------------------------------------------------------ */
  /* Group CRUD state                                       */
  /* ------------------------------------------------------ */
  const [groups, setGroups] = useState<CharacterGroup[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  // State for form management (create/edit)
  const [editingGroupId, setEditingGroupId] = useState<string | null>(null);
  const [formName, setFormName] = useState<string>('');
  const [formDescription, setFormDescription] = useState<string>('');
  const [formImageUrl, setFormImageUrl] = useState<string>('');
  const [formIcon, setFormIcon] = useState<string>('');
  const [formSortOrder, setFormSortOrder] = useState<number>(0);

  /* ------------------------------------------------------ */
  /* Tabs (Groups / Assignment)                             */
  /* ------------------------------------------------------ */
  type AdminTab = 'groups' | 'assignment';
  const [activeTab, setActiveTab] = useState<AdminTab>('groups');

  /* ------------------------------------------------------ */
  /* Character assignment state                             */
  /* ------------------------------------------------------ */
  const [allCharacters, setAllCharacters] = useState<Character[]>([]);
  const [selectedGroupId, setSelectedGroupId] = useState<string | null>(null);
  const [groupCharacters, setGroupCharacters] = useState<
    (CharacterGroupMapping & { character: Character })[]
  >([]);

  /* ------------------------------------------------------ */
  /* Fetch helpers                                          */
  /* ------------------------------------------------------ */
  // Fetch all groups from the database
  const fetchGroups = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const fetchedGroups = await groupRepository.getAllGroups();
      setGroups(fetchedGroups);
    } catch (err) {
      console.error('Failed to fetch groups:', err);
      setError('Failed to load groups. Please try again.');
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Fetch all characters once
  const fetchCharacters = useCallback(async () => {
    try {
      const characters = await characterRepository.getAll();
      setAllCharacters(characters);
    } catch (err) {
      console.error('Failed to fetch characters:', err);
      setError('Failed to load characters. Please try again.');
    }
  }, []);

  // Fetch characters in selected group
  const fetchGroupCharacters = useCallback(
    async (groupId: string) => {
      try {
        const data = await groupRepository.getCharactersInGroup(groupId);
        setGroupCharacters(data);
      } catch (err) {
        console.error('Failed to fetch group characters:', err);
        setError('Failed to load characters for group.');
      }
    },
    [],
  );

  // Load groups on component mount
  useEffect(() => {
    fetchGroups();
    fetchCharacters();
  }, [fetchGroups, fetchCharacters]);

  // When a group is selected, load its characters
  useEffect(() => {
    if (selectedGroupId) {
      fetchGroupCharacters(selectedGroupId);
    } else {
      setGroupCharacters([]);
    }
  }, [selectedGroupId, fetchGroupCharacters]);

  // Reset form fields
  const resetForm = useCallback(() => {
    setEditingGroupId(null);
    setFormName('');
    setFormDescription('');
    setFormImageUrl('');
    setFormIcon('');
    setFormSortOrder(0);
  }, []);

  // Handle form submission (create or update)
  const handleFormSubmit = async (event: FormEvent) => {
    event.preventDefault();
    setIsLoading(true);
    setError(null);
    setSuccessMessage(null);

    if (!formName.trim()) {
      setError('Group Name is required.');
      setIsLoading(false);
      return;
    }

    const groupData = {
      name: formName.trim(),
      description: formDescription.trim() || null,
      image_url: formImageUrl.trim() || null,
      icon: formIcon.trim() || null,
      sort_order: formSortOrder,
    };

    try {
      if (editingGroupId) {
        await groupRepository.updateGroup(editingGroupId, groupData);
        setSuccessMessage('Group updated successfully!');
      } else {
        await groupRepository.createGroup(groupData);
        setSuccessMessage('Group created successfully!');
      }
      resetForm();
      fetchGroups(); // Refresh the list
    } catch (err) {
      console.error('Group form submission error:', err);
      setError(err instanceof Error ? err.message : 'Failed to save group.');
    } finally {
      setIsLoading(false);
    }
  };

  // Handle editing a group
  const handleEditGroup = (group: CharacterGroup) => {
    setEditingGroupId(group.id);
    setFormName(group.name);
    setFormDescription(group.description || '');
    setFormImageUrl(group.image_url || '');
    setFormIcon(group.icon || '');
    setFormSortOrder(group.sort_order);
    // Scroll to form
    document.getElementById('groupFormSection')?.scrollIntoView({ behavior: 'smooth' });
  };

  // Handle deleting a group
  const handleDeleteGroup = async (id: string) => {
    if (!window.confirm('Are you sure you want to delete this group? This action cannot be undone.')) {
      return;
    }
    setIsLoading(true);
    setError(null);
    setSuccessMessage(null);
    try {
      await groupRepository.deleteGroup(id);
      setSuccessMessage('Group deleted successfully!');
      fetchGroups(); // Refresh the list
    } catch (err) {
      console.error('Group deletion error:', err);
      setError(err instanceof Error ? err.message : 'Failed to delete group.');
    } finally {
      setIsLoading(false);
    }
  };

  /* ------------------------------------------------------ */
  /* Character Assignment Handlers                          */
  /* ------------------------------------------------------ */

  const handleAddCharacterToGroup = async (characterId: string) => {
    if (!selectedGroupId) return;
    setIsLoading(true);
    setError(null);
    setSuccessMessage(null);
    try {
      await groupRepository.addCharacterToGroup(selectedGroupId, characterId);
      setSuccessMessage('Character added to group!');
      fetchGroupCharacters(selectedGroupId); // Refresh characters in group
    } catch (err) {
      console.error('Error adding character to group:', err);
      setError(err instanceof Error ? err.message : 'Failed to add character to group.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleRemoveCharacterFromGroup = async (mappingId: string) => {
    if (!selectedGroupId) return;
    setIsLoading(true);
    setError(null);
    setSuccessMessage(null);
    try {
      await groupRepository.removeCharacterFromGroup(mappingId);
      setSuccessMessage('Character removed from group!');
      fetchGroupCharacters(selectedGroupId); // Refresh characters in group
    } catch (err) {
      console.error('Error removing character from group:', err);
      setError(err instanceof Error ? err.message : 'Failed to remove character from group.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleReorderCharacterInGroup = async (mappingId: string, newSortOrder: number) => {
    if (!selectedGroupId) return;
    setIsLoading(true);
    setError(null);
    setSuccessMessage(null);
    try {
      await groupRepository.updateCharacterMappingSortOrder(mappingId, newSortOrder);
      setSuccessMessage('Character order updated!');
      fetchGroupCharacters(selectedGroupId); // Refresh characters in group
    } catch (err) {
      console.error('Error reordering character:', err);
      setError(err instanceof Error ? err.message : 'Failed to reorder character.');
    } finally {
      setIsLoading(false);
    }
  };

  // Filter characters not yet in the selected group
  const charactersNotInGroup = allCharacters.filter(
    (char) => !groupCharacters.some((gc) => gc.character_id === char.id),
  );

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold text-gray-900 mb-6">Manage Character Groups</h1>

      {isLoading && (
        <div className="mb-4 p-3 bg-blue-100 text-blue-700 rounded">
          Loading...
        </div>
      )}
      {error && (
        <div className="mb-4 p-3 bg-red-100 text-red-700 rounded">
          Error: {error}
        </div>
      )}
      {successMessage && (
        <div className="mb-4 p-3 bg-green-100 text-green-700 rounded">
          Success: {successMessage}
        </div>
      )}

      {/* Tab Navigation */}
      <div className="mb-6 border-b border-gray-200">
        <nav className="-mb-px flex space-x-8" aria-label="Tabs">
          <button
            onClick={() => setActiveTab('groups')}
            className={`whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm ${
              activeTab === 'groups'
                ? 'border-primary-500 text-primary-600'
                : 'border-transparent text-gray-900 hover:text-gray-900 hover:border-gray-300'
            }`}
          >
            Groups
          </button>
          <button
            onClick={() => setActiveTab('assignment')}
            className={`whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm ${
              activeTab === 'assignment'
                ? 'border-primary-500 text-primary-600'
                : 'border-transparent text-gray-900 hover:text-gray-900 hover:border-gray-300'
            }`}
          >
            Character Assignment
          </button>
        </nav>
      </div>

      {/* Groups Tab Content */}
      {activeTab === 'groups' && (
        <Fragment>
          {/* Group Creation/Edit Form */}
          <section id="groupFormSection" className="mb-8 p-6 bg-white rounded-lg shadow-md">
            <h2 className="text-2xl font-semibold text-gray-800 mb-4">
              {editingGroupId ? 'Edit Group' : 'Create New Group'}
            </h2>
            <form onSubmit={handleFormSubmit} className="space-y-4">
              <div>
                <label htmlFor="name" className="block text-sm font-medium text-gray-700">Group Name</label>
                <input
                  type="text"
                  id="name"
                  value={formName}
                  onChange={(e) => setFormName(e.target.value)}
                  required
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500"
                />
              </div>
              <div>
                <label htmlFor="description" className="block text-sm font-medium text-gray-700">Description</label>
                <textarea
                  id="description"
                  rows={3}
                  value={formDescription}
                  onChange={(e) => setFormDescription(e.target.value)}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500"
                ></textarea>
              </div>
              <div>
                <label htmlFor="imageUrl" className="block text-sm font-medium text-gray-700">Image URL</label>
                <input
                  type="url"
                  id="imageUrl"
                  value={formImageUrl}
                  onChange={(e) => setFormImageUrl(e.target.value)}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500"
                />
              </div>
              <div>
                <label htmlFor="icon" className="block text-sm font-medium text-gray-700">Icon (e.g., FontAwesome class)</label>
                <input
                  type="text"
                  id="icon"
                  value={formIcon}
                  onChange={(e) => setFormIcon(e.target.value)}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500"
                />
              </div>
              <div>
                <label htmlFor="sortOrder" className="block text-sm font-medium text-gray-700">Sort Order</label>
                <input
                  type="number"
                  id="sortOrder"
                  value={formSortOrder}
                  onChange={(e) => setFormSortOrder(Number(e.target.value))}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500"
                />
              </div>
              <div className="flex space-x-4">
                <button
                  type="submit"
                  disabled={isLoading}
                  className="px-4 py-2 bg-primary-600 text-white rounded-md hover:bg-primary-700 disabled:bg-gray-400"
                >
                  {isLoading ? 'Saving...' : editingGroupId ? 'Update Group' : 'Create Group'}
                </button>
                {editingGroupId && (
                  <button
                    type="button"
                    onClick={resetForm}
                    className="px-4 py-2 bg-gray-200 text-gray-700 rounded-md hover:bg-gray-300"
                  >
                    Cancel Edit
                  </button>
                )}
              </div>
            </form>
          </section>

          {/* Existing Groups List */}
          <section className="p-6 bg-white rounded-lg shadow-md">
            <h2 className="text-2xl font-semibold text-gray-800 mb-4">Existing Groups</h2>
            {groups.length === 0 ? (
              <p className="text-gray-500 italic">No character groups found. Create one above!</p>
            ) : (
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-900 uppercase tracking-wider">Name</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-900 uppercase tracking-wider">Description</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-900 uppercase tracking-wider">Sort Order</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-900 uppercase tracking-wider">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {groups.map((group) => (
                      <tr key={group.id}>
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{group.name}</td>
                        <td className="px-6 py-4 text-sm text-gray-500 truncate max-w-xs">{group.description || '-'}</td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{group.sort_order}</td>
                        <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                          <button
                            onClick={() => handleEditGroup(group)}
                            className="text-primary-600 hover:text-primary-900 mr-4"
                          >
                            Edit
                          </button>
                          <button
                            onClick={() => handleDeleteGroup(group.id)}
                            className="text-red-600 hover:text-red-900"
                          >
                            Delete
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </section>
        </Fragment>
      )}

      {/* Character Assignment Tab Content */}
      {activeTab === 'assignment' && (
        <div className="space-y-8">
          {/* Group Selection */}
          <section className="p-6 bg-white rounded-lg shadow-md">
            <h2 className="text-2xl font-semibold text-gray-800 mb-4">Select a Group</h2>
            <div className="max-w-md">
              <select
                value={selectedGroupId || ''}
                onChange={(e) => setSelectedGroupId(e.target.value || null)}
                className="block w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500 text-gray-900"
              >
                <option value="">-- Select a group --</option>
                {groups.map((group) => (
                  <option key={group.id} value={group.id}>
                    {group.name}
                  </option>
                ))}
              </select>
            </div>
          </section>

          {selectedGroupId && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Available Characters */}
              <section className="p-6 bg-white rounded-lg shadow-md">
                <h2 className="text-xl font-semibold text-gray-800 mb-4">Available Characters</h2>
                {charactersNotInGroup.length === 0 ? (
                  <p className="text-gray-500 italic">All characters have been added to this group.</p>
                ) : (
                  <div className="space-y-3 max-h-96 overflow-y-auto pr-2">
                    {charactersNotInGroup.map((character) => (
                      <div 
                        key={character.id} 
                        className="flex items-center justify-between p-3 border border-gray-200 rounded-md hover:bg-gray-50"
                      >
                        <div className="flex items-center">
                          <img
                            src={character.avatar_url || `https://ui-avatars.com/api/?name=${encodeURIComponent(character.name)}`}
                            alt={character.name}
                            className="h-10 w-10 rounded-full object-cover mr-3"
                            onError={(e) => {
                              (e.target as HTMLImageElement).src = `https://ui-avatars.com/api/?name=${encodeURIComponent(character.name)}`;
                            }}
                          />
                          <span className="font-medium">{character.name}</span>
                        </div>
                        <button
                          onClick={() => handleAddCharacterToGroup(character.id)}
                          className="p-1 bg-green-100 text-green-700 rounded-full hover:bg-green-200"
                          title="Add to group"
                        >
                          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                            <path fillRule="evenodd" d="M10 5a1 1 0 011 1v3h3a1 1 0 110 2h-3v3a1 1 0 11-2 0v-3H6a1 1 0 110-2h3V6a1 1 0 011-1z" clipRule="evenodd" />
                          </svg>
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </section>

              {/* Characters in Group */}
              <section className="p-6 bg-white rounded-lg shadow-md">
                <h2 className="text-xl font-semibold text-gray-800 mb-4">Characters in Group</h2>
                {groupCharacters.length === 0 ? (
                  <p className="text-gray-500 italic">No characters in this group yet.</p>
                ) : (
                  <div className="space-y-3 max-h-96 overflow-y-auto pr-2">
                    {groupCharacters.map((mapping, index) => (
                      <div 
                        key={mapping.id} 
                        className="flex items-center justify-between p-3 border border-gray-200 rounded-md hover:bg-gray-50"
                      >
                        <div className="flex items-center">
                          <div className="text-gray-500 mr-2 w-6 text-center">{mapping.sort_order}</div>
                          <img
                            src={mapping.character.avatar_url || `https://ui-avatars.com/api/?name=${encodeURIComponent(mapping.character.name)}`}
                            alt={mapping.character.name}
                            className="h-10 w-10 rounded-full object-cover mr-3"
                            onError={(e) => {
                              (e.target as HTMLImageElement).src = `https://ui-avatars.com/api/?name=${encodeURIComponent(mapping.character.name)}`;
                            }}
                          />
                          <span className="font-medium">{mapping.character.name}</span>
                        </div>
                        <div className="flex items-center space-x-1">
                          {/* Move Up */}
                          <button
                            onClick={() => handleReorderCharacterInGroup(mapping.id, mapping.sort_order - 1)}
                            disabled={index === 0}
                            className={`p-1 rounded-full ${
                              index === 0
                                ? 'text-gray-300 cursor-not-allowed'
                                : 'text-gray-600 hover:bg-gray-200'
                            }`}
                            title="Move up"
                          >
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                              <path fillRule="evenodd" d="M5.293 9.707a1 1 0 010-1.414l4-4a1 1 0 011.414 0l4 4a1 1 0 01-1.414 1.414L11 7.414V15a1 1 0 11-2 0V7.414L6.707 9.707a1 1 0 01-1.414 0z" clipRule="evenodd" />
                            </svg>
                          </button>
                          
                          {/* Move Down */}
                          <button
                            onClick={() => handleReorderCharacterInGroup(mapping.id, mapping.sort_order + 1)}
                            disabled={index === groupCharacters.length - 1}
                            className={`p-1 rounded-full ${
                              index === groupCharacters.length - 1
                                ? 'text-gray-300 cursor-not-allowed'
                                : 'text-gray-600 hover:bg-gray-200'
                            }`}
                            title="Move down"
                          >
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                              <path fillRule="evenodd" d="M14.707 10.293a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 111.414-1.414L9 12.586V5a1 1 0 012 0v7.586l2.293-2.293a1 1 0 011.414 0z" clipRule="evenodd" />
                            </svg>
                          </button>
                          
                          {/* Remove */}
                          <button
                            onClick={() => handleRemoveCharacterFromGroup(mapping.id)}
                            className="p-1 text-red-600 rounded-full hover:bg-red-100"
                            title="Remove from group"
                          >
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                              <path fillRule="evenodd" d="M9 2a1 1 0 00-.894.553L7.382 4H4a1 1 0 000 2v10a2 2 0 002 2h8a2 2 0 002-2V6a1 1 0 100-2h-3.382l-.724-1.447A1 1 0 0011 2H9zM7 8a1 1 0 012 0v6a1 1 0 11-2 0V8zm5-1a1 1 0 00-1 1v6a1 1 0 102 0V8a1 1 0 00-1-1z" clipRule="evenodd" />
                            </svg>
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </section>
            </div>
          )}

          {!selectedGroupId && (
            <div className="p-6 bg-gray-50 rounded-lg border border-gray-200 text-center">
              <p className="text-gray-600">Please select a group to manage its characters.</p>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default GroupManagement;
