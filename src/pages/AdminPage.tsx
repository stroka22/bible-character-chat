import type { FormEvent } from "react";
import React, { useState, useEffect, useCallback } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { characterRepository } from '../repositories/characterRepository';
import { type Character } from '../services/supabase';
import GroupManagement from '../components/admin/GroupManagement';

// Helper function for basic CSV parsing
const parseCSV = (csvText: string): Array<Record<string, string>> => {
  const lines = csvText.trim().split('\n');
  if (lines.length === 0) return [];

  const headers = lines[0].split(',').map(header => header.trim());
  const data = lines.slice(1).map(line => {
    const values = line.split(',').map(value => value.trim());
    const row: Record<string, string> = {};
    headers.forEach((header, index) => {
      row[header] = values[index];
    });
    return row;
  });
  return data;
};

const AdminPage: React.FC = () => {
  const { user } = useAuth();

  /* ------------------------------------------------------------
   * ADMIN / BYPASS ACCESS CHECK
   * ---------------------------------------------------------- */
  // Read bypass flag once on component render
  const bypassAuth =
    typeof window !== 'undefined' &&
    localStorage.getItem('bypass_auth') === 'true';
  // Simple admin email check (replace with real role‐based logic as needed)
  const isAdmin = bypassAuth || (user && user.email === 'admin@example.com');
  const [characters, setCharacters] = useState<Character[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState<string>('');

  /* ------------------------------------------------------------
   * Top-level Admin Tabs
   * ---------------------------------------------------------- */
  type AdminMainTab = 'characters' | 'groups';
  const [activeTab, setActiveTab] = useState<AdminMainTab>('characters');

  // Form state for manual creation/editing
  const [editingCharacterId, setEditingCharacterId] = useState<string | null>(null);
  const [formName, setFormName] = useState<string>('');
  const [formAvatarUrl, setFormAvatarUrl] = useState<string>('');
  const [formFeatureImageUrl, setFormFeatureImageUrl] = useState<string>('');
  const [formShortBiography, setFormShortBiography] = useState<string>('');
  const [formBibleBook, setFormBibleBook] = useState<string>('');
  const [formOpeningSentence, setFormOpeningSentence] = useState<string>('');
  const [formPersonaPrompt, setFormPersonaPrompt] = useState<string>('');
  const [formScripturalContext, setFormScripturalContext] = useState<string>('');
  const [formDescription, setFormDescription] = useState<string>(''); // Assuming description is also part of the form

  const resetForm = useCallback(() => {
    setEditingCharacterId(null);
    setFormName('');
    setFormAvatarUrl('');
    setFormFeatureImageUrl('');
    setFormShortBiography('');
    setFormBibleBook('');
    setFormOpeningSentence('');
    setFormPersonaPrompt('');
    setFormScripturalContext('');
    setFormDescription('');
  }, []);

  const fetchCharacters = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const fetchedCharacters = await characterRepository.getAll();
      setCharacters(fetchedCharacters);
    } catch (err) {
      console.error('Failed to fetch characters:', err);
      setError('Failed to load characters.');
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Fetch characters after the access flags are set
  useEffect(() => {
    if (isAdmin) fetchCharacters();
  }, [isAdmin, fetchCharacters]);

  if (!isAdmin) {
    return (
      <div className="flex h-full w-full items-center justify-center bg-red-50 p-4">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-red-800 mb-4">Access Denied</h2>
          <p className="text-red-700">You do not have administrative privileges to view this page.</p>
        </div>
      </div>
    );
  }

  // Handle CSV upload
  const handleCSVUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    setIsLoading(true);
    setError(null);
    setSuccessMessage(null);

    try {
      const text = await file.text();
      const parsedData = parseCSV(text);

      const charactersToCreate: Omit<Character, 'id' | 'created_at' | 'updated_at'>[] = parsedData.map(row => ({
        name: row.character_name || '',
        avatar_url: row.avatar_url || '',
        feature_image_url: row.feature_image_url || '',
        short_biography: row.short_biography || '',
        bible_book: row.bible_book || '',
        opening_line: row.opening_sentence || '',
        persona_prompt: row.persona_prompt || '',
        scriptural_context: row.scriptural_context || '',
        description: row.description || '', // Assuming description is also in CSV
      })).filter(char => char.name && char.persona_prompt); // Basic validation

      if (charactersToCreate.length === 0) {
        throw new Error('No valid characters found in CSV. Ensure headers and data are correct.');
      }

      await characterRepository.bulkCreateCharacters(charactersToCreate);
      setSuccessMessage(`Successfully uploaded ${charactersToCreate.length} characters.`);
      fetchCharacters(); // Refresh list
    } catch (err) {
      console.error('CSV upload error:', err);
      setError(err instanceof Error ? err.message : 'Failed to upload CSV.');
    } finally {
      setIsLoading(false);
    }
  };

  // Handle manual form submission
  const handleFormSubmit = async (event: FormEvent) => {
    event.preventDefault();
    setIsLoading(true);
    setError(null);
    setSuccessMessage(null);

    const characterData: Omit<Character, 'id' | 'created_at' | 'updated_at'> = {
      name: formName,
      avatar_url: formAvatarUrl,
      feature_image_url: formFeatureImageUrl,
      short_biography: formShortBiography,
      bible_book: formBibleBook,
      opening_line: formOpeningSentence,
      persona_prompt: formPersonaPrompt,
      scriptural_context: formScripturalContext,
      description: formDescription,
    };

    try {
      if (editingCharacterId) {
        await characterRepository.updateCharacter(editingCharacterId, characterData);
        setSuccessMessage('Character updated successfully!');
      } else {
        await characterRepository.createCharacter(characterData);
        setSuccessMessage('Character created successfully!');
      }
      resetForm();
      fetchCharacters(); // Refresh list
    } catch (err) {
      console.error('Character form submission error:', err);
      setError(err instanceof Error ? err.message : 'Failed to save character.');
    } finally {
      setIsLoading(false);
    }
  };

  // Handle editing a character
  const handleEditCharacter = (character: Character) => {
    setEditingCharacterId(character.id);
    setFormName(character.name);
    setFormAvatarUrl(character.avatar_url || '');
    setFormFeatureImageUrl(character.feature_image_url || '');
    setFormShortBiography(character.short_biography || '');
    setFormBibleBook(character.bible_book || '');
    setFormOpeningSentence(character.opening_line || '');
    setFormPersonaPrompt(character.persona_prompt);
    setFormScripturalContext(character.scriptural_context || '');
    setFormDescription(character.description);
  };

  // Handle deleting a character
  const handleDeleteCharacter = async (id: string) => {
    if (!window.confirm('Are you sure you want to delete this character? This action cannot be undone.')) {
      return;
    }
    setIsLoading(true);
    setError(null);
    setSuccessMessage(null);
    try {
      await characterRepository.deleteCharacter(id);
      setSuccessMessage('Character deleted successfully!');
      fetchCharacters(); // Refresh list
    } catch (err) {
      console.error('Character deletion error:', err);
      setError(err instanceof Error ? err.message : 'Failed to delete character.');
    } finally {
      setIsLoading(false);
    }
  };

  // Filter characters based on search query
  const filteredCharacters = characters.filter(char =>
    char.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    char.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
    (char.short_biography && char.short_biography.toLowerCase().includes(searchQuery.toLowerCase())) ||
    (char.bible_book && char.bible_book.toLowerCase().includes(searchQuery.toLowerCase()))
  );

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold text-gray-900 mb-6">Admin Panel - Character Management</h1>
      <p className="text-gray-700 mb-4">
        Welcome, Admin! Here you can manage Bible characters.
      </p>

      {/* Top-level tab navigation */}
      <div className="mb-8 border-b border-gray-200">
        <nav className="-mb-px flex space-x-8" aria-label="Admin Tabs">
          <button
            onClick={() => setActiveTab('characters')}
            className={`whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm ${
              activeTab === 'characters'
                ? 'border-primary-500 text-primary-600'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
            }`}
          >
            Characters
          </button>
          <button
            onClick={() => setActiveTab('groups')}
            className={`whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm ${
              activeTab === 'groups'
                ? 'border-primary-500 text-primary-600'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
            }`}
          >
            Groups
          </button>
        </nav>
      </div>

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

      {activeTab === 'characters' && (
      <>
      {/* Part A: CSV Upload Tool */}
      <section className="mb-8 p-6 bg-white rounded-lg shadow-md">
        <h2 className="text-2xl font-semibold text-gray-800 mb-4">Bulk Upload Characters (CSV)</h2>
        <p className="text-gray-600 mb-4">
          Upload a CSV file to add or update multiple characters.
          Expected fields: `character_name`, `avatar_url`, `feature_image_url`, `short_biography`,
          `bible_book`, `opening_sentence`, `persona_prompt`, `scriptural_context`, `description`.
        </p>
        <input
          type="file"
          accept=".csv"
          onChange={handleCSVUpload}
          disabled={isLoading}
          className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-primary-50 file:text-primary-700 hover:file:bg-primary-100"
        />
      </section>

      {/* Part B: Manual Character Creation/Edit Form */}
      <section className="p-6 bg-white rounded-lg shadow-md mb-8">
        <h2 className="text-2xl font-semibold text-gray-800 mb-4">
          {editingCharacterId ? 'Edit Character' : 'Create New Character'}
        </h2>
        <form onSubmit={handleFormSubmit} className="space-y-4">
          <div>
            <label htmlFor="name" className="block text-sm font-medium text-gray-700">Character Name</label>
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
            <label htmlFor="avatar_url" className="block text-sm font-medium text-gray-700">Avatar URL</label>
            <input
              type="url"
              id="avatar_url"
              value={formAvatarUrl}
              onChange={(e) => setFormAvatarUrl(e.target.value)}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500"
            />
          </div>
          <div>
            <label htmlFor="feature_image_url" className="block text-sm font-medium text-gray-700">Feature Image URL</label>
            <input
              type="url"
              id="feature_image_url"
              value={formFeatureImageUrl}
              onChange={(e) => setFormFeatureImageUrl(e.target.value)}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500"
            />
          </div>
          <div>
            <label htmlFor="short_biography" className="block text-sm font-medium text-gray-700">Short Biography</label>
            <textarea
              id="short_biography"
              rows={3}
              value={formShortBiography}
              onChange={(e) => setFormShortBiography(e.target.value)}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500"
            ></textarea>
          </div>
          <div>
            <label htmlFor="description" className="block text-sm font-medium text-gray-700">Description (for character card)</label>
            <textarea
              id="description"
              rows={3}
              value={formDescription}
              onChange={(e) => setFormDescription(e.target.value)}
              required
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500"
            ></textarea>
          </div>
          <div>
            <label htmlFor="bible_book" className="block text-sm font-medium text-gray-700">Bible Book</label>
            <input
              type="text"
              id="bible_book"
              value={formBibleBook}
              onChange={(e) => setFormBibleBook(e.target.value)}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500"
            />
          </div>
          <div>
            <label htmlFor="opening_sentence" className="block text-sm font-medium text-gray-700">Opening Sentence</label>
            <textarea
              id="opening_sentence"
              rows={2}
              value={formOpeningSentence}
              onChange={(e) => setFormOpeningSentence(e.target.value)}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500"
            ></textarea>
          </div>
          <div>
            <label htmlFor="persona_prompt" className="block text-sm font-medium text-gray-700">Persona Prompt</label>
            <textarea
              id="persona_prompt"
              rows={5}
              value={formPersonaPrompt}
              onChange={(e) => setFormPersonaPrompt(e.target.value)}
              required
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500"
            ></textarea>
          </div>
          <div>
            <label htmlFor="scriptural_context" className="block text-sm font-medium text-gray-700">Scriptural Context</label>
            <textarea
              id="scriptural_context"
              rows={3}
              value={formScripturalContext}
              onChange={(e) => setFormScripturalContext(e.target.value)}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500"
            ></textarea>
          </div>
          <div className="flex space-x-4">
            <button
              type="submit"
              disabled={isLoading}
              className="px-4 py-2 bg-primary-600 text-white rounded-md hover:bg-primary-700 disabled:bg-gray-400"
            >
              {isLoading ? 'Saving...' : editingCharacterId ? 'Update Character' : 'Create Character'}
            </button>
            {editingCharacterId && (
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

      {/* Character List with Search */}
      <section className="p-6 bg-white rounded-lg shadow-md">
        <h2 className="text-2xl font-semibold text-gray-800 mb-4">Existing Characters</h2>
        
        {/* Search input */}
        <div className="mb-6">
          <label htmlFor="search" className="block text-sm font-medium text-gray-700 mb-1">Search Characters</label>
          <input
            type="text"
            id="search"
            placeholder="Search by name, description, or bible book..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="block w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500"
          />
        </div>
        
        {/* Character list */}
        {filteredCharacters.length === 0 ? (
          <p className="text-gray-500 italic">No characters found.</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Name</th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Description</th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Bible Book</th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {filteredCharacters.map((character) => (
                  <tr key={character.id}>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        {character.avatar_url && (
                          <img
                            src={character.avatar_url}
                            alt={character.name}
                            className="h-10 w-10 rounded-full mr-2 object-cover"
                            onError={(e) => {
                              (e.target as HTMLImageElement).src = `https://ui-avatars.com/api/?name=${encodeURIComponent(character.name)}&background=random`;
                            }}
                          />
                        )}
                        <div className="text-sm font-medium text-gray-900">{character.name}</div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="text-sm text-gray-500 truncate max-w-xs">{character.description}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-500">{character.bible_book || '-'}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      <button
                        onClick={() => handleEditCharacter(character)}
                        className="text-primary-600 hover:text-primary-900 mr-4"
                      >
                        Edit
                      </button>
                      <button
                        onClick={() => handleDeleteCharacter(character.id)}
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
      </>
      )}

      {activeTab === 'groups' && (
        <GroupManagement />
      )}
    </div>
  );
};

export default AdminPage;
