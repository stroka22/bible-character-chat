import type { FormEvent } from "react";
import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { characterRepository } from '../repositories/characterRepository';
import { type Character } from '../services/supabase';
import GroupManagement from '../components/admin/GroupManagement';
import { supabase } from '../services/supabase';

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

// Helper to safely parse JSON
function tryParseJson(str: string) {
  try {
    return JSON.parse(str);
  } catch (e) {
    return null;
  }
}

// Interface for profile management
interface UserProfile {
  id: string;
  email: string;
  display_name: string | null;
  role: 'admin' | 'pastor' | 'user';
  created_at: string;
}

const SecureAdminPage: React.FC = () => {
  const navigate = useNavigate();
  const { user, loading: authLoading, isAdmin, isPastor, role, refreshProfile } = useAuth();

  /* ------------------------------------------------------------
   * Top-level Admin Tabs
   * ---------------------------------------------------------- */
  type AdminMainTab = 'characters' | 'groups' | 'users';
  const [activeTab, setActiveTab] = useState<AdminMainTab>('characters');
  const [characters, setCharacters] = useState<Character[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [userProfiles, setUserProfiles] = useState<UserProfile[]>([]);
  const [showDebugInfo, setShowDebugInfo] = useState<boolean>(false);

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
  const [formDescription, setFormDescription] = useState<string>('');
  const [formIsVisible, setFormIsVisible] = useState<boolean>(true);

  // States for Character Insights fields
  const [formTimelinePeriod, setFormTimelinePeriod] = useState<string>('');
  const [formHistoricalContext, setFormHistoricalContext] = useState<string>('');
  const [formGeographicLocation, setFormGeographicLocation] = useState<string>('');
  const [formKeyScriptureRefs, setFormKeyScriptureRefs] = useState<string>('');
  const [formTheologicalSignificance, setFormTheologicalSignificance] = useState<string>('');
  const [formRelationships, setFormRelationships] = useState<string>('');
  const [formStudyQuestions, setFormStudyQuestions] = useState<string>('');

  // Debug logging for authentication and role status
  useEffect(() => {
    console.log('=== AUTH DEBUG INFO ===');
    console.log('User:', user?.email);
    console.log('Role:', role);
    console.log('Is Admin?', isAdmin());
    console.log('Is Pastor?', isPastor());
    console.log('Auth Loading:', authLoading);
    console.log('=====================');
  }, [user, role, isAdmin, isPastor, authLoading]);

  // Handle manual profile refresh for debugging
  const handleRefreshProfile = async () => {
    console.log('Manually refreshing profile...');
    await refreshProfile();
    console.log('Profile refreshed. New role:', role);
    console.log('Is Admin?', isAdmin());
    console.log('Is Pastor?', isPastor());
  };

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
    setFormIsVisible(true);
    // Reset Character Insights fields
    setFormTimelinePeriod('');
    setFormHistoricalContext('');
    setFormGeographicLocation('');
    setFormKeyScriptureRefs('');
    setFormTheologicalSignificance('');
    setFormRelationships('');
    setFormStudyQuestions('');
  }, []);

  const fetchCharacters = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      // Pass isAdmin=true to fetch all characters for admin view
      const fetchedCharacters = await characterRepository.getAll(true);
      setCharacters(fetchedCharacters);
    } catch (err) {
      console.error('Failed to fetch characters:', err);
      setError('Failed to load characters.');
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Fetch user profiles (admin only)
  const fetchUserProfiles = useCallback(async () => {
    if (!isAdmin()) {
      console.log('Skipping user profile fetch - not an admin');
      return;
    }
    
    setIsLoading(true);
    setError(null);
    try {
      console.log('Fetching user profiles as admin');
      const { data, error } = await supabase
        .from('profiles')
        .select<'*', UserProfile>('id, email, display_name, role, created_at')
        .order('created_at', { ascending: false });
      
      if (error) throw error;
      setUserProfiles(data || []);
      console.log(`Fetched ${data?.length || 0} user profiles`);
    } catch (err) {
      console.error('Failed to fetch user profiles:', err);
      setError('Failed to load user profiles.');
    } finally {
      setIsLoading(false);
    }
  }, [isAdmin]);

  // Handle promoting a user to pastor role (admin only)
  const handlePromoteUser = async (userId: string, newRole: 'pastor' | 'user') => {
    if (!isAdmin()) {
      console.warn('Attempted to promote user without admin privileges');
      return;
    }
    
    setIsLoading(true);
    setError(null);
    setSuccessMessage(null);
    
    try {
      console.log(`Promoting user ${userId} to ${newRole} role`);
      const { error } = await supabase
        .from('profiles')
        .update({ role: newRole })
        .eq('id', userId);
      
      if (error) throw error;
      setSuccessMessage(`User role updated to ${newRole} successfully!`);
      fetchUserProfiles();
    } catch (err) {
      console.error('Failed to update user role:', err);
      setError('Failed to update user role.');
    } finally {
      setIsLoading(false);
    }
  };

  // Fetch characters after authentication is confirmed
  useEffect(() => {
    if (!authLoading) {
      console.log('Auth loading complete, checking permissions...');
      if (isPastor()) {
        console.log('User has pastor/admin privileges, fetching data...');
        fetchCharacters();
        if (activeTab === 'users' && isAdmin()) {
          fetchUserProfiles();
        }
      } else {
        console.log('User lacks pastor/admin privileges, redirecting...');
        // Redirect non-admin/pastor users
        navigate('/access-denied');
      }
    }
  }, [authLoading, isPastor, isAdmin, fetchCharacters, fetchUserProfiles, activeTab, navigate]);

  // Fetch appropriate data when tab changes
  useEffect(() => {
    if (activeTab === 'characters') {
      fetchCharacters();
    } else if (activeTab === 'users' && isAdmin()) {
      fetchUserProfiles();
    }
  }, [activeTab, fetchCharacters, fetchUserProfiles, isAdmin]);

  // Show loading state while checking authentication
  if (authLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-500"></div>
      </div>
    );
  }

  // Redirect non-admin/pastor users (this is a backup to the useEffect redirect)
  if (!isPastor()) {
    console.log('isPastor() check failed, redirecting to access denied');
    navigate('/access-denied');
    return null;
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
        description: row.description || '',
        is_visible: row.is_visible ? row.is_visible.toLowerCase() === 'true' : true,
        // New Character Insights fields
        timeline_period: row.timeline_period || '',
        historical_context: row.historical_context || '',
        geographic_location: row.geographic_location || '',
        key_scripture_references: row.key_scripture_references || '',
        theological_significance: row.theological_significance || '',
        relationships: tryParseJson(row.relationships) || {},
        study_questions: row.study_questions || '',
      })).filter(char => char.name && char.persona_prompt);

      if (charactersToCreate.length === 0) {
        throw new Error('No valid characters found in CSV. Ensure headers and data are correct.');
      }

      await characterRepository.bulkCreateCharacters(charactersToCreate);
      setSuccessMessage(`Successfully uploaded ${charactersToCreate.length} characters.`);
      fetchCharacters();
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
      is_visible: formIsVisible,
      // Add Character Insights fields
      timeline_period: formTimelinePeriod,
      historical_context: formHistoricalContext,
      geographic_location: formGeographicLocation,
      key_scripture_references: formKeyScriptureRefs,
      theological_significance: formTheologicalSignificance,
      relationships: tryParseJson(formRelationships),
      study_questions: formStudyQuestions,
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
      fetchCharacters();
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
    setFormIsVisible(character.is_visible ?? true);

    // Populate insight fields
    setFormTimelinePeriod(character.timeline_period || '');
    setFormHistoricalContext(character.historical_context || '');
    setFormGeographicLocation(character.geographic_location || '');
    setFormKeyScriptureRefs(character.key_scripture_references || '');
    setFormTheologicalSignificance(character.theological_significance || '');
    setFormRelationships(
      character.relationships ? JSON.stringify(character.relationships, null, 2) : ''
    );
    setFormStudyQuestions(character.study_questions || '');
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
      fetchCharacters();
    } catch (err) {
      console.error('Character deletion error:', err);
      setError(err instanceof Error ? err.message : 'Failed to delete character.');
    } finally {
      setIsLoading(false);
    }
  };

  // Handle toggling character visibility
  const handleToggleVisibility = async (character: Character) => {
    setIsLoading(true);
    setError(null);
    setSuccessMessage(null);
    try {
      const newVisibility = !(character.is_visible ?? true);
      await characterRepository.updateCharacter(character.id, { is_visible: newVisibility });
      setSuccessMessage(`Character '${character.name}' visibility updated to ${newVisibility ? 'visible' : 'hidden'}.`);
      fetchCharacters();
    } catch (err) {
      console.error('Character visibility toggle error:', err);
      setError(err instanceof Error ? err.message : 'Failed to toggle character visibility.');
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
      <h1 className="text-3xl font-bold text-gray-900 mb-6">Admin Panel</h1>
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-4">
        <p className="text-gray-700 mb-2 md:mb-0">
          Welcome, {user?.email}! Your role: <span className="font-semibold capitalize">{role}</span>
        </p>
        
        {/* Debug controls */}
        <div className="flex space-x-2">
          <button 
            onClick={handleRefreshProfile}
            className="px-3 py-1 bg-blue-100 text-blue-700 rounded hover:bg-blue-200 text-sm"
          >
            Refresh Profile
          </button>
          <button 
            onClick={() => setShowDebugInfo(!showDebugInfo)}
            className="px-3 py-1 bg-gray-100 text-gray-700 rounded hover:bg-gray-200 text-sm"
          >
            {showDebugInfo ? 'Hide Debug' : 'Show Debug'}
          </button>
        </div>
      </div>
      
      {/* Debug information panel */}
      {showDebugInfo && (
        <div className="mb-6 p-4 bg-gray-100 rounded-lg text-sm">
          <h3 className="font-medium mb-2">Authentication Debug Info</h3>
          <div className="grid grid-cols-2 gap-2">
            <div><span className="font-medium">User ID:</span> {user?.id || 'Not logged in'}</div>
            <div><span className="font-medium">Email:</span> {user?.email || 'N/A'}</div>
            <div><span className="font-medium">Role:</span> {role}</div>
            <div><span className="font-medium">Is Admin:</span> {isAdmin() ? 'Yes' : 'No'}</div>
            <div><span className="font-medium">Is Pastor:</span> {isPastor() ? 'Yes' : 'No'}</div>
            <div><span className="font-medium">Auth Loading:</span> {authLoading ? 'Yes' : 'No'}</div>
          </div>
        </div>
      )}

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
          {/* User Management tab - only visible to admins */}
          {isAdmin() && (
            <button
              onClick={() => setActiveTab('users')}
              className={`whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm ${
                activeTab === 'users'
                  ? 'border-primary-500 text-primary-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              User Management
            </button>
          )}
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

      {/* Character Management Tab */}
      {activeTab === 'characters' && (
      <>
      {/* Part A: CSV Upload Tool */}
      <section className="mb-8 p-6 bg-white rounded-lg shadow-md">
        <h2 className="text-2xl font-semibold text-gray-800 mb-4">Bulk Upload Characters (CSV)</h2>
        <p className="text-gray-600 mb-4">
          Upload a CSV file to add or update multiple characters.
          Expected fields: `character_name`, `avatar_url`, `feature_image_url`, `short_biography`,
          `bible_book`, `opening_sentence`, `persona_prompt`, `scriptural_context`, `description`, `is_visible` (true/false).
          For Character Insights, also include: `timeline_period`, `historical_context`, `geographic_location`, `key_scripture_references`, `theological_significance`, `relationships` (JSON string), `study_questions`.
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
          <div className="flex items-center">
            <input
              type="checkbox"
              id="is_visible"
              checked={formIsVisible}
              onChange={(e) => setFormIsVisible(e.target.checked)}
              className="h-4 w-4 text-primary-600 focus:ring-primary-500 border-gray-300 rounded"
            />
            <label htmlFor="is_visible" className="ml-2 block text-sm font-medium text-gray-700">
              Is Visible to Users
            </label>
          </div>

          {/* Character Insights section */}
          <div className="mt-6 border-t border-gray-300 pt-6">
            <h3 className="text-xl font-semibold text-gray-800 mb-4">Character Insights</h3>
            
            <div className="space-y-4">
              <div>
                <label htmlFor="timeline_period" className="block text-sm font-medium text-gray-700">Time Period</label>
                <input
                  type="text"
                  id="timeline_period"
                  value={formTimelinePeriod}
                  onChange={(e) => setFormTimelinePeriod(e.target.value)}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500"
                />
              </div>
              <div>
                <label htmlFor="historical_context" className="block text-sm font-medium text-gray-700">Historical Context</label>
                <textarea
                  id="historical_context"
                  rows={3}
                  value={formHistoricalContext}
                  onChange={(e) => setFormHistoricalContext(e.target.value)}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500"
                ></textarea>
              </div>
              <div>
                <label htmlFor="geographic_location" className="block text-sm font-medium text-gray-700">Geographic Location</label>
                <input
                  type="text"
                  id="geographic_location"
                  value={formGeographicLocation}
                  onChange={(e) => setFormGeographicLocation(e.target.value)}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500"
                />
              </div>
              <div>
                <label htmlFor="key_scripture_references" className="block text-sm font-medium text-gray-700">Key Scripture References (comma or semicolon separated)</label>
                <textarea
                  id="key_scripture_references"
                  rows={3}
                  value={formKeyScriptureRefs}
                  onChange={(e) => setFormKeyScriptureRefs(e.target.value)}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500"
                ></textarea>
              </div>
              <div>
                <label htmlFor="theological_significance" className="block text-sm font-medium text-gray-700">Theological Significance</label>
                <textarea
                  id="theological_significance"
                  rows={3}
                  value={formTheologicalSignificance}
                  onChange={(e) => setFormTheologicalSignificance(e.target.value)}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500"
                ></textarea>
              </div>
              <div>
                <label
                  htmlFor="relationships"
                  className="block text-sm font-medium text-gray-700"
                >
                  Relationships (JSON string, e.g., {'{\"parents\":[\"Jacob\",\"Rachel\"]}'})
                </label>
                <textarea
                  id="relationships"
                  rows={5}
                  value={formRelationships}
                  onChange={(e) => setFormRelationships(e.target.value)}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500"
                ></textarea>
              </div>
              <div>
                <label htmlFor="study_questions" className="block text-sm font-medium text-gray-700">Study Questions (one per line)</label>
                <textarea
                  id="study_questions"
                  rows={5}
                  value={formStudyQuestions}
                  onChange={(e) => setFormStudyQuestions(e.target.value)}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500"
                ></textarea>
              </div>
            </div>
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
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Visibility</th>
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
                    <td className="px-6 py-4 whitespace-nowrap">
                      <button
                        onClick={() => handleToggleVisibility(character)}
                        className={`px-3 py-1 rounded-full text-xs font-semibold ${
                          (character.is_visible ?? true)
                            ? 'bg-green-100 text-green-800'
                            : 'bg-red-100 text-red-800'
                        } hover:opacity-75 transition-opacity`}
                      >
                        {(character.is_visible ?? true) ? 'Visible' : 'Hidden'}
                      </button>
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

      {/* Group Management Tab */}
      {activeTab === 'groups' && (
        <GroupManagement />
      )}

      {/* User Management Tab - Admin Only */}
      {activeTab === 'users' && isAdmin() && (
        <section className="p-6 bg-white rounded-lg shadow-md">
          <h2 className="text-2xl font-semibold text-gray-800 mb-4">
            User Management
          </h2>
          <p className="text-gray-600 mb-6">
            As an administrator, you can view all users and promote regular users to the "pastor" role.
            Pastors can manage characters and groups but cannot manage other users.
          </p>
          
          {/* User list */}
          {userProfiles.length === 0 ? (
            <p className="text-gray-500 italic">No users found.</p>
          ) : (
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Email</th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Display Name</th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Role</th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Created</th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {userProfiles.map((profile) => (
                    <tr key={profile.id}>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm font-medium text-gray-900">{profile.email}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-500">{profile.display_name || '-'}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`px-3 py-1 rounded-full text-xs font-semibold ${
                          profile.role === 'admin' 
                            ? 'bg-purple-100 text-purple-800' 
                            : profile.role === 'pastor'
                              ? 'bg-blue-100 text-blue-800'
                              : 'bg-gray-100 text-gray-800'
                        }`}>
                          {profile.role}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-500">
                          {new Date(profile.created_at).toLocaleDateString()}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                        {profile.role === 'user' && (
                          <button
                            onClick={() => handlePromoteUser(profile.id, 'pastor')}
                            className="text-blue-600 hover:text-blue-900 mr-4"
                          >
                            Promote to Pastor
                          </button>
                        )}
                        {profile.role === 'pastor' && (
                          <button
                            onClick={() => handlePromoteUser(profile.id, 'user')}
                            className="text-gray-600 hover:text-gray-900"
                          >
                            Demote to User
                          </button>
                        )}
                        {profile.role === 'admin' && (
                          <span className="text-gray-400">Admin (cannot modify)</span>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </section>
      )}
    </div>
  );
};

export default SecureAdminPage;
