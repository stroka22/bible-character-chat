import type { FormEvent } from "react";
import React, { useState, useEffect, useCallback } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { supabase } from '../services/supabase';
import { characterRepository } from '../repositories/characterRepository';
import { type Character } from '../services/supabase';
import GroupManagement from '../components/admin/GroupManagement';
import AdminFAQEditor from '../components/admin/AdminFAQEditor';
import AdminFeaturedCharacter from '../components/admin/AdminFeaturedCharacter';
import AdminFavorites from '../components/admin/AdminFavorites';
import AccountTierManagement from '../components/admin/AccountTierManagement';
import AdminStudiesPage from './admin/AdminStudiesPage.jsx';
import AdminReadingPlansPage from './admin/AdminReadingPlansPage.jsx';

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

const AdminPage: React.FC = () => {
  const { user, profile, refreshProfile, isSuperadmin } = useAuth();

  /* ------------------------------------------------------------
   * ADMIN / BYPASS ACCESS CHECK
   * ---------------------------------------------------------- */
  // Read bypass flag once on component render
  const bypassAuth =
    typeof window !== 'undefined' &&
    localStorage.getItem('bypass_auth') === 'true';
  /*
   * ------------------------------------------------------------------
   * TEMPORARY TESTING OVERRIDE
   * ------------------------------------------------------------------
   * For local testing we want to reach the admin panel without having
   * to configure an admin account or set the bypass flag.  The line
   * below forces `isAdmin` to `true` so **any** logged-in (or bypassed)
   * user can access the page.  REMOVE OR REPLACE WITH PROPER ROLE
   * CHECKS BEFORE DEPLOYING TO PRODUCTION.
   */
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const isAdmin = true;
  const [characters, setCharacters] = useState<Character[]>([]);
  const [savingWeeklyCsv, setSavingWeeklyCsv] = useState<boolean>(false);
  const [weeklyCsvEnabled, setWeeklyCsvEnabled] = useState<boolean>(false);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState<string>('');
  // Pagination state
  const [pageSize, setPageSize] = useState<number>(10); // 10, 25, 50
  const [currentPage, setCurrentPage] = useState<number>(1);

  /* ------------------------------------------------------------
   * Top-level Admin Tabs
   * ---------------------------------------------------------- */
  type AdminMainTab =
    | 'overview'
    | 'characters'
    | 'groups'
    | 'featured'
    | 'favorites'
    | 'faq'
    | 'accountTiers'
    | 'roundtable'
    | 'studies'
    | 'readingPlans';
  const [activeTab, setActiveTab] = useState<AdminMainTab>('overview');

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
  const [formIsVisible, setFormIsVisible] = useState<boolean>(true); // New state for is_visible

  // New states for Character Insights fields
  const [formTimelinePeriod, setFormTimelinePeriod] = useState<string>('');
  const [formHistoricalContext, setFormHistoricalContext] = useState<string>('');
  const [formGeographicLocation, setFormGeographicLocation] = useState<string>('');
  const [formKeyScriptureRefs, setFormKeyScriptureRefs] = useState<string>('');
  const [formTheologicalSignificance, setFormTheologicalSignificance] = useState<string>('');
  const [formRelationships, setFormRelationships] = useState<string>(''); // Stored as stringified JSON
  const [formStudyQuestions, setFormStudyQuestions] = useState<string>('');

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
    setFormIsVisible(true); // Reset is_visible
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

  // Mirror profile -> local toggle state
  useEffect(() => {
    setWeeklyCsvEnabled(!!(profile as any)?.weekly_csv_enabled);
  }, [profile]);

  // Weekly CSV toggle handler (self only) with optimistic UI
  const onWeeklyToggle = async () => {
    if (!user) return;
    const next = !weeklyCsvEnabled;
    setWeeklyCsvEnabled(next);
    setSavingWeeklyCsv(true);
    try {
      const { error } = await supabase
        .from('profiles')
        .update({ weekly_csv_enabled: next })
        .eq('id', user.id);
      if (error) throw error;
      try { await refreshProfile(user.id); } catch {}
    } catch (err) {
      console.error('Failed to update weekly_csv_enabled', err);
      // revert on error
      setWeeklyCsvEnabled(!next);
      alert('Failed to update preference');
    } finally {
      setSavingWeeklyCsv(false);
    }
  };

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
        is_visible: row.is_visible ? row.is_visible.toLowerCase() === 'true' : true, // Default to true if not specified
        // New Character Insights fields
        timeline_period: row.timeline_period || '',
        historical_context: row.historical_context || '',
        geographic_location: row.geographic_location || '',
        key_scripture_references: row.key_scripture_references || '',
        theological_significance: row.theological_significance || '',
        relationships: tryParseJson(row.relationships) || {},
        study_questions: row.study_questions || '',
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
      is_visible: formIsVisible, // Add is_visible to the data object
      // Add Character Insights fields
      timeline_period: formTimelinePeriod,
      historical_context: formHistoricalContext,
      geographic_location: formGeographicLocation,
      key_scripture_references: formKeyScriptureRefs,
      theological_significance: formTheologicalSignificance,
      relationships: tryParseJson(formRelationships), // Parse JSON string to object
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
    setFormIsVisible(character.is_visible ?? true); // Set is_visible from character data, default to true

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
      fetchCharacters(); // Refresh list
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
      const newVisibility = !(character.is_visible ?? true); // Toggle current state, default to true
      await characterRepository.updateCharacter(character.id, { is_visible: newVisibility });
      setSuccessMessage(`Character '${character.name}' visibility updated to ${newVisibility ? 'visible' : 'hidden'}.`);
      fetchCharacters(); // Refresh list
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

  // Reset page when filters change
  useEffect(() => { setCurrentPage(1); }, [searchQuery, pageSize, characters.length]);
  const totalPages = Math.max(1, Math.ceil(filteredCharacters.length / pageSize));
  const startIdx = (currentPage - 1) * pageSize;
  const paginatedCharacters = filteredCharacters.slice(startIdx, startIdx + pageSize);

  // Dynamic title and description based on active tab
  const getTabInfo = () => {
    switch (activeTab) {
      case 'overview': return { title: 'Admin Panel - Overview', desc: 'Welcome, Admin! View your dashboard and quick stats.' };
      case 'characters': return { title: 'Admin Panel - Characters', desc: 'Manage Bible characters, their profiles, and settings.' };
      case 'groups': return { title: 'Admin Panel - Groups', desc: 'Organize characters into groups for better management.' };
      case 'featured': return { title: 'Admin Panel - Featured Character', desc: 'Set which character appears as featured on the home page.' };
      case 'studies': return { title: 'Admin Panel - Bible Studies', desc: 'Manage Bible studies, lessons, categories, and visibility.' };
      case 'readingPlans': return { title: 'Admin Panel - Reading Plans', desc: 'Manage reading plans, categories, and featured plans.' };
      case 'faq': return { title: 'Admin Panel - FAQ', desc: 'Manage frequently asked questions and answers.' };
      case 'roundtable': return { title: 'Admin Panel - Roundtable', desc: 'Manage roundtable discussion settings.' };
      case 'accountTiers': return { title: 'Admin Panel - Account Tiers', desc: 'Manage subscription tiers and pricing.' };
      default: return { title: 'Admin Panel', desc: 'Welcome, Admin!' };
    }
  };
  const tabInfo = getTabInfo();

  return (
    <div className="container mx-auto px-4 pt-24 pb-8 md:pl-72">
      <h1 className="text-3xl font-bold text-gray-900 mb-2">{tabInfo.title}</h1>
      <p className="text-gray-700 mb-4">{tabInfo.desc}</p>

      {/* Desktop left sidebar navigation (matches legacy layout) */}
      <div className="hidden md:block">
        <aside className="fixed top-24 left-6 w-64 bg-white rounded-md shadow border">
          <div className="px-4 py-3 text-xs font-semibold text-gray-500 uppercase">Navigation</div>
          <nav className="px-2 pb-3 space-y-1">
            <button onClick={() => setActiveTab('overview')} className={`w-full text-left px-3 py-2 rounded ${activeTab === 'overview' ? 'bg-gray-200' : 'hover:bg-gray-100'}`}>Overview</button>
            <button onClick={() => setActiveTab('characters')} className={`w-full text-left px-3 py-2 rounded ${activeTab === 'characters' ? 'bg-gray-200' : 'hover:bg-gray-100'}`}>Characters</button>
            <button onClick={() => setActiveTab('groups')} className={`w-full text-left px-3 py-2 rounded ${activeTab === 'groups' ? 'bg-gray-200' : 'hover:bg-gray-100'}`}>Groups</button>
            <button onClick={() => setActiveTab('featured')} className={`w-full text-left px-3 py-2 rounded ${activeTab === 'featured' ? 'bg-gray-200' : 'hover:bg-gray-100'}`}>Featured Character</button>
            <button onClick={() => setActiveTab('studies')} className={`w-full text-left px-3 py-2 rounded ${activeTab === 'studies' ? 'bg-gray-200' : 'hover:bg-gray-100'}`}>Bible Studies</button>
            <button onClick={() => setActiveTab('readingPlans')} className={`w-full text-left px-3 py-2 rounded ${activeTab === 'readingPlans' ? 'bg-gray-200' : 'hover:bg-gray-100'}`}>Reading Plans</button>
            <Link to="/admin/premium" className="block px-3 py-2 rounded hover:bg-gray-100">Premium Members</Link>
            <button onClick={() => setActiveTab('faq')} className={`w-full text-left px-3 py-2 rounded ${activeTab === 'faq' ? 'bg-gray-200' : 'hover:bg-gray-100'}`}>FAQ</button>
          </nav>
          {isSuperadmin && (
            <>
              <div className="px-4 pt-3 text-xs font-semibold text-gray-500 uppercase">Advanced</div>
              <nav className="px-2 pb-3 space-y-1">
                <button onClick={() => setActiveTab('roundtable')} className={`w-full text-left px-3 py-2 rounded ${activeTab === 'roundtable' ? 'bg-gray-200' : 'hover:bg-gray-100'}`}>Roundtable</button>
                <button onClick={() => setActiveTab('accountTiers')} className={`w-full text-left px-3 py-2 rounded ${activeTab === 'accountTiers' ? 'bg-gray-200' : 'hover:bg-gray-100'}`}>Account Tiers</button>
                <Link to="/admin/users" className="block px-3 py-2 rounded hover:bg-gray-100">Users & Organizations</Link>
                <Link to="/admin/leads" className="block px-3 py-2 rounded hover:bg-gray-100">Leads</Link>
              </nav>
            </>
          )}
        </aside>
      </div>

      {/* Mobile-only top tab navigation */}
      <div className="mb-8 border-b border-gray-200 md:hidden">
        <nav className="-mb-px flex space-x-8" aria-label="Admin Tabs">
          <button
            onClick={() => setActiveTab('overview')}
            className={`whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm ${
              activeTab === 'overview'
                ? 'border-primary-500 text-primary-600'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
            }`}
          >
            Overview
          </button>
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
          <button
            onClick={() => setActiveTab('featured')}
            className={`whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm ${
              activeTab === 'featured'
                ? 'border-primary-500 text-primary-600'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
            }`}
          >
            Featured
          </button>
          <button
            onClick={() => setActiveTab('studies')}
            className={`whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm ${
              activeTab === 'studies'
                ? 'border-primary-500 text-primary-600'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
            }`}
          >
            Bible Studies
          </button>
          <button
            onClick={() => setActiveTab('faq')}
            className={`whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm ${
              activeTab === 'faq'
                ? 'border-primary-500 text-primary-600'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
            }`}
          >
            FAQ
          </button>
          <button
            onClick={() => setActiveTab('accountTiers')}
            className={`whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm ${
              activeTab === 'accountTiers'
                ? 'border-primary-500 text-primary-600'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
            }`}
          >
            Account Tiers
          </button>
          <button
            onClick={() => setActiveTab('roundtable')}
            className={`whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm ${
              activeTab === 'roundtable'
                ? 'border-primary-500 text-primary-600'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
            }`}
          >
            Roundtable
          </button>
        </nav>
      </div>

      {activeTab === 'overview' && (
        <>
          {/* Quick actions row at the top (legacy) */}
          <div className="mb-6 flex flex-wrap gap-3">
            <Link to="/admin/invites" className="inline-flex items-center rounded-md bg-blue-600 px-4 py-2 text-white hover:bg-blue-700">Manage Invites</Link>
            <Link to="/admin/premium" className="inline-flex items-center rounded-md bg-purple-600 px-4 py-2 text-white hover:bg-purple-700">Premium Customers</Link>
            <Link to="/admin/users" className="inline-flex items-center rounded-md bg-amber-500 px-4 py-2 text-white hover:bg-amber-600">Users & Organizations</Link>
          </div>

          {/* Weekly CSV Email self-toggle (moved into Overview) */}
          <div className="mb-6 p-4 bg-white rounded-md shadow border">
            <div className="flex items-center justify-between">
              <div>
                <div className="text-gray-900 font-medium">Weekly CSV Email</div>
                <div className="text-sm text-gray-600">Org summary + member details every Monday 9:00 AM EST</div>
              </div>
              <label className="flex items-center space-x-2 cursor-pointer select-none">
                <input
                  type="checkbox"
                  className="h-5 w-5 rounded border-gray-300"
                  checked={weeklyCsvEnabled}
                  onChange={() => onWeeklyToggle()}
                  disabled={savingWeeklyCsv}
                />
                <span className="text-sm text-gray-900">On/Off</span>
              </label>
            </div>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-8">
            <div className="p-4 bg-white rounded-md shadow border">
              <div className="text-gray-900 font-semibold">Premium Members</div>
              <div className="text-sm text-gray-600 mb-3">View members with active subscriptions under your organization.</div>
              <Link to="/admin/premium" className="inline-block px-3 py-2 bg-purple-600 text-white rounded hover:bg-purple-700">Open</Link>
            </div>
            <div className="p-4 bg-white rounded-md shadow border">
              <div className="text-gray-900 font-semibold">Groups</div>
              <div className="text-sm text-gray-600 mb-3">Create and manage member groups.</div>
              <button onClick={() => setActiveTab('groups')} className="inline-block px-3 py-2 bg-blue-600 text-white rounded hover:bg-blue-700">Manage</button>
            </div>
            <div className="p-4 bg-white rounded-md shadow border">
              <div className="text-gray-900 font-semibold">Featured Character</div>
              <div className="text-sm text-gray-600 mb-3">Set the character featured on your org's home.</div>
              <button onClick={() => setActiveTab('featured')} className="inline-block px-3 py-2 bg-blue-600 text-white rounded hover:bg-blue-700">Set Featured</button>
            </div>
            <div className="p-4 bg-white rounded-md shadow border">
              <div className="text-gray-900 font-semibold">Bible Studies</div>
              <div className="text-sm text-gray-600 mb-3">Manage studies and lessons.</div>
              <button onClick={() => setActiveTab('studies')} className="inline-block px-3 py-2 bg-blue-600 text-white rounded hover:bg-blue-700">Open</button>
            </div>
            <div className="p-4 bg-white rounded-md shadow border">
              <div className="text-gray-900 font-semibold">Reading Plans</div>
              <div className="text-sm text-gray-600 mb-3">Manage reading plans and categories.</div>
              <button onClick={() => setActiveTab('readingPlans')} className="inline-block px-3 py-2 bg-blue-600 text-white rounded hover:bg-blue-700">Manage</button>
            </div>
            <div className="p-4 bg-white rounded-md shadow border">
              <div className="text-gray-900 font-semibold">Characters</div>
              <div className="text-sm text-gray-600 mb-3">Add characters, customize prompts to your beliefs, and toggle active/dormant.</div>
              <button onClick={() => setActiveTab('characters')} className="inline-block px-3 py-2 bg-blue-600 text-white rounded hover:bg-blue-700">Manage</button>
            </div>
            <div className="p-4 bg-white rounded-md shadow border">
              <div className="text-gray-900 font-semibold">FAQ</div>
              <div className="text-sm text-gray-600 mb-3">Edit frequently asked questions.</div>
              <button onClick={() => setActiveTab('faq')} className="inline-block px-3 py-2 bg-blue-600 text-white rounded hover:bg-blue-700">Edit</button>
            </div>
          </div>

          {/* Quick actions were moved to top */}
        </>
      )}

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
          {/* New: is_visible checkbox */}
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

          {/* New section for Character Insights data */}
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
                  Relationships (JSON string, e.g., {'{"parents":["Jacob","Rachel"]}'})
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
        
        {/* Toolbar: search + pagination controls */}
        <div className="mb-6 flex flex-wrap items-center justify-between gap-4">
          <div className="flex-1 min-w-[240px]">
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
          <div className="flex items-center gap-3 ml-auto">
            <div className="flex items-center gap-2">
              <label htmlFor="pageSize" className="text-sm text-gray-700">Rows</label>
              <select
                id="pageSize"
                value={pageSize}
                onChange={(e) => setPageSize(parseInt(e.target.value, 10))}
                className="border rounded-md px-2 py-1 text-sm"
              >
                <option value={10}>10</option>
                <option value={25}>25</option>
                <option value={50}>50</option>
              </select>
            </div>
            <div className="flex items-center gap-2">
              <button
                onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                disabled={currentPage <= 1}
                className={`px-2 py-1 text-sm rounded ${currentPage <= 1 ? 'bg-gray-200 text-gray-500' : 'bg-gray-800 text-white hover:bg-gray-700'}`}
              >
                Prev
              </button>
              <span className="text-sm text-gray-700 min-w-[60px] text-center">{currentPage} / {totalPages}</span>
              <button
                onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                disabled={currentPage >= totalPages}
                className={`px-2 py-1 text-sm rounded ${currentPage >= totalPages ? 'bg-gray-200 text-gray-500' : 'bg-gray-800 text-white hover:bg-gray-700'}`}
              >
                Next
              </button>
            </div>
          </div>
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
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Visibility</th> {/* New column */}
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {paginatedCharacters.map((character) => (
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
                    {/* New: Visibility column with toggle */}
                    <td className="px-6 py-4 whitespace-nowrap">
                      <button
                        onClick={() => handleToggleVisibility(character)}
                        className={`px-3 py-1 rounded-full text-xs font-semibold ${
                          (character.is_visible ?? true) // Default to true if null/undefined
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

      {activeTab === 'groups' && (
        <GroupManagement />
      )}

      {activeTab === 'featured' && (
        <AdminFeaturedCharacter />
      )}

      {activeTab === 'favorites' && (
        <AdminFavorites />
      )}

      {activeTab === 'faq' && (
        <AdminFAQEditor />
      )}

      {activeTab === 'accountTiers' && (
        <AccountTierManagement />
      )}

      {activeTab === 'roundtable' && (
        <AccountTierManagement mode="roundtable-only" />
      )}

      {activeTab === 'studies' && (
        <AdminStudiesPage embedded={true} />
      )}

      {activeTab === 'readingPlans' && (
        <AdminReadingPlansPage embedded={true} />
      )}

      {/* ----------------------------------------------------------------
       * User Management – visible only to admins
       * -------------------------------------------------------------- */}
      {activeTab === 'users' && isAdmin && (
        <section className="p-6 bg-white rounded-lg shadow-md">
          <h2 className="text-2xl font-semibold text-gray-800 mb-4">
            User Management
          </h2>
          <p className="text-gray-600 mb-6">
            (Coming soon) – As an administrator you will be able to view users
            and promote them to the “pastor” role.
          </p>
        </section>
      )}
    </div>
  );
};

export default AdminPage;
