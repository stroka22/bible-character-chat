import React, { useState, useEffect } from 'react';
import { supabase } from '../../services/supabase';
import { characterRepository } from '../../repositories/characterRepository';
import { bibleStudiesRepository } from '../../repositories/bibleStudiesRepository';
import {
  getSettings as getTierSettings,
  setSettings as setTierSettings,
  getOwnerSlug,
} from '../../services/tierSettingsService';

/**
 * Consolidated Subscription Settings Component
 * 
 * All Free vs Premium settings in one place:
 * - Organization selector (superadmin only)
 * - Featured character selection
 * - Premium feature gates (My Walk, Saving, Roundtable)
 * - Free tier limits (messages, characters)
 * - Free characters selection
 * - Premium studies selection
 */
const SubscriptionSettings = ({ ownerSlug: propOwnerSlug, isSuperAdmin = false }) => {
  // Settings state
  const [settings, setSettings] = useState({
    myWalkRequiresPremium: true,
    roundtableRequiresPremium: true,
    messageLimitEnabled: false,
    freeMessageLimit: 50,
    freeCharacterLimit: 10,
    freeCharacters: [],
    premiumStudyIds: [],
  });
  
  // UI state
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [message, setMessage] = useState({ type: '', text: '' });
  const [ownerSlug, setOwnerSlug] = useState(propOwnerSlug || 'default');
  const [owners, setOwners] = useState([]);
  
  // Data for selection
  const [characters, setCharacters] = useState([]);
  const [studies, setStudies] = useState([]);
  
  // Featured character
  const [featuredId, setFeaturedId] = useState('');
  const [featuredSaving, setFeaturedSaving] = useState(false);
  
  // UI helpers
  const [characterSearch, setCharacterSearch] = useState('');
  const [studySearch, setStudySearch] = useState('');
  const [activeSection, setActiveSection] = useState('gates'); // gates, limits, characters, studies, featured

  // Load owners list for superadmin
  useEffect(() => {
    if (isSuperAdmin) {
      supabase
        .from('owners')
        .select('owner_slug, display_name')
        .order('display_name')
        .then(({ data }) => setOwners(data || []))
        .catch(console.error);
    }
  }, [isSuperAdmin]);

  // Load settings and data
  useEffect(() => {
    const loadData = async () => {
      setIsLoading(true);
      try {
        const slug = ownerSlug || getOwnerSlug() || 'default';
        
        // Load tier settings
        const tierSettings = await getTierSettings(slug);
        if (tierSettings) {
          setSettings({
            myWalkRequiresPremium: tierSettings?.premiumRoundtableGates?.myWalkRequiresPremium !== false,
            roundtableRequiresPremium: tierSettings?.premiumRoundtableGates?.premiumOnly !== false,
            messageLimitEnabled: tierSettings?.messageLimitEnabled === true,
            freeMessageLimit: tierSettings?.freeMessageLimit || 50,
            freeCharacterLimit: tierSettings?.freeCharacterLimit || 10,
            freeCharacters: tierSettings?.freeCharacters || [],
            premiumStudyIds: tierSettings?.premiumStudyIds || [],
          });
        }
        
        // Load characters
        const chars = await characterRepository.getAll(true, slug);
        setCharacters(chars || []);
        
        // Load studies
        const studyList = await bibleStudiesRepository.listStudies({ ownerSlug: slug });
        setStudies(studyList || []);
        
        // Load featured character
        loadFeaturedCharacter(slug);
        
      } catch (err) {
        console.error('Error loading subscription settings:', err);
        setMessage({ type: 'error', text: 'Failed to load settings' });
      } finally {
        setIsLoading(false);
      }
    };
    
    loadData();
  }, [ownerSlug]);

  // Load featured character from localStorage
  const loadFeaturedCharacter = (slug) => {
    try {
      const key = `featuredCharacter:${slug}`;
      const raw = localStorage.getItem(key);
      if (!raw) {
        setFeaturedId('');
        return;
      }
      try {
        const parsed = JSON.parse(raw);
        if (parsed?.id) {
          setFeaturedId(parsed.id);
        }
      } catch {
        setFeaturedId('');
      }
    } catch {
      setFeaturedId('');
    }
  };

  // Save featured character
  const saveFeaturedCharacter = () => {
    setFeaturedSaving(true);
    try {
      const key = `featuredCharacter:${ownerSlug}`;
      if (!featuredId) {
        localStorage.removeItem(key);
        setMessage({ type: 'success', text: 'Featured character removed' });
      } else {
        const character = characters.find(c => c.id === featuredId);
        if (character) {
          const data = JSON.stringify({ id: character.id, name: character.name });
          localStorage.setItem(key, data);
          setMessage({ type: 'success', text: `${character.name} set as featured character` });
        }
      }
      setTimeout(() => setMessage({ type: '', text: '' }), 3000);
    } catch (err) {
      setMessage({ type: 'error', text: 'Failed to save featured character' });
    } finally {
      setFeaturedSaving(false);
    }
  };

  // Save settings
  const handleSave = async () => {
    setIsSaving(true);
    setMessage({ type: '', text: '' });
    
    try {
      const currentSettings = await getTierSettings(ownerSlug) || {};
      
      // Build free character names for fallback matching
      const freeNames = characters
        .filter(char => settings.freeCharacters.includes(char.id))
        .map(char => char.name);
      
      const updatedSettings = {
        ...currentSettings,
        messageLimitEnabled: settings.messageLimitEnabled,
        freeMessageLimit: settings.freeMessageLimit,
        freeCharacterLimit: settings.freeCharacterLimit,
        freeCharacters: settings.freeCharacters,
        freeCharacterNames: freeNames,
        premiumStudyIds: settings.premiumStudyIds,
        premiumRoundtableGates: {
          ...(currentSettings.premiumRoundtableGates || {}),
          myWalkRequiresPremium: settings.myWalkRequiresPremium,
          premiumOnly: settings.roundtableRequiresPremium,
        },
        lastUpdated: new Date().toISOString(),
      };
      
      await setTierSettings(updatedSettings, ownerSlug);
      
      // Notify other components
      try {
        window.dispatchEvent(new Event('accountTierSettingsChanged'));
      } catch {}
      
      setMessage({ type: 'success', text: 'Settings saved successfully!' });
      setTimeout(() => setMessage({ type: '', text: '' }), 3000);
    } catch (err) {
      console.error('Error saving settings:', err);
      setMessage({ type: 'error', text: 'Failed to save settings' });
    } finally {
      setIsSaving(false);
    }
  };

  // Toggle character free status
  const toggleFreeCharacter = (charId) => {
    setSettings(prev => ({
      ...prev,
      freeCharacters: prev.freeCharacters.includes(charId)
        ? prev.freeCharacters.filter(id => id !== charId)
        : [...prev.freeCharacters, charId]
    }));
  };

  // Select/deselect all visible characters
  const selectAllCharacters = () => {
    const allIds = filteredCharacters.map(c => c.id);
    setSettings(prev => ({
      ...prev,
      freeCharacters: [...new Set([...prev.freeCharacters, ...allIds])]
    }));
  };

  const deselectAllCharacters = () => {
    const visibleIds = new Set(filteredCharacters.map(c => c.id));
    setSettings(prev => ({
      ...prev,
      freeCharacters: prev.freeCharacters.filter(id => !visibleIds.has(id))
    }));
  };

  // Toggle study premium status
  const togglePremiumStudy = (studyId) => {
    setSettings(prev => ({
      ...prev,
      premiumStudyIds: prev.premiumStudyIds.includes(studyId)
        ? prev.premiumStudyIds.filter(id => id !== studyId)
        : [...prev.premiumStudyIds, studyId]
    }));
  };

  // Filter characters
  const filteredCharacters = characters.filter(c => 
    c.name?.toLowerCase().includes(characterSearch.toLowerCase())
  );

  // Filter studies
  const filteredStudies = studies.filter(s =>
    s.title?.toLowerCase().includes(studySearch.toLowerCase())
  );

  if (isLoading) {
    return (
      <div className="p-8 text-center">
        <div className="inline-block w-8 h-8 border-4 border-amber-300 border-t-amber-600 rounded-full animate-spin" />
        <p className="mt-2 text-gray-600">Loading settings...</p>
      </div>
    );
  }

  const sections = [
    { id: 'gates', label: 'Feature Gates', icon: '🔐' },
    { id: 'limits', label: 'Free Limits', icon: '📊' },
    { id: 'characters', label: 'Free Characters', icon: '👥' },
    { id: 'studies', label: 'Premium Studies', icon: '📖' },
    { id: 'featured', label: 'Featured Character', icon: '⭐' },
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Subscription Settings</h2>
          <p className="text-gray-600 mt-1">Configure free vs premium access for your organization</p>
        </div>
        <button
          onClick={handleSave}
          disabled={isSaving}
          className="px-6 py-2.5 bg-amber-600 text-white rounded-lg font-medium hover:bg-amber-700 disabled:opacity-50 flex items-center justify-center gap-2 shadow-sm"
        >
          {isSaving ? (
            <>
              <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
              Saving...
            </>
          ) : (
            <>
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
              Save All Changes
            </>
          )}
        </button>
      </div>

      {/* Message */}
      {message.text && (
        <div className={`p-4 rounded-lg flex items-center gap-3 ${
          message.type === 'success' ? 'bg-green-50 text-green-800 border border-green-200' : 
          message.type === 'error' ? 'bg-red-50 text-red-800 border border-red-200' :
          'bg-blue-50 text-blue-800 border border-blue-200'
        }`}>
          {message.type === 'success' && <span>✓</span>}
          {message.type === 'error' && <span>✕</span>}
          {message.text}
        </div>
      )}

      {/* Organization Selector (Superadmin only) */}
      {isSuperAdmin && (
        <div className="bg-gradient-to-r from-purple-50 to-indigo-50 rounded-xl border border-purple-200 p-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-purple-100 rounded-full flex items-center justify-center">
              <svg className="w-5 h-5 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
              </svg>
            </div>
            <div className="flex-1">
              <label className="block text-sm font-medium text-purple-900 mb-1">
                Managing Organization
              </label>
              <select
                value={ownerSlug}
                onChange={(e) => setOwnerSlug(e.target.value)}
                className="w-full sm:w-64 px-3 py-2 bg-white border border-purple-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
              >
                <option value="default">Default (FaithTalkAI)</option>
                {owners.filter(o => o.owner_slug !== 'default').map(o => (
                  <option key={o.owner_slug} value={o.owner_slug}>
                    {o.display_name || o.owner_slug}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </div>
      )}

      {/* Section Navigation */}
      <div className="flex flex-wrap gap-2 border-b border-gray-200 pb-2">
        {sections.map(section => (
          <button
            key={section.id}
            onClick={() => setActiveSection(section.id)}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
              activeSection === section.id
                ? 'bg-amber-100 text-amber-800'
                : 'text-gray-600 hover:bg-gray-100'
            }`}
          >
            <span className="mr-1.5">{section.icon}</span>
            {section.label}
          </button>
        ))}
      </div>

      {/* Feature Gates Section */}
      {activeSection === 'gates' && (
        <section className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
          <div className="px-6 py-4 bg-gradient-to-r from-amber-500 to-amber-600">
            <h3 className="text-lg font-bold text-white">Premium Feature Gates</h3>
            <p className="text-amber-100 text-sm">Toggle which features require premium subscription</p>
          </div>
          
          <div className="p-6 space-y-4">
            {/* My Walk */}
            <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 bg-amber-100 rounded-xl flex items-center justify-center">
                  <svg className="w-6 h-6 text-amber-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                  </svg>
                </div>
                <div>
                  <p className="font-semibold text-gray-900">My Walk Dashboard</p>
                  <p className="text-sm text-gray-500">Progress tracking, conversation history, study stats</p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setSettings(prev => ({ ...prev, myWalkRequiresPremium: !prev.myWalkRequiresPremium }))}
                className={`relative w-14 h-7 rounded-full transition-colors ${settings.myWalkRequiresPremium ? 'bg-amber-500' : 'bg-gray-300'}`}
              >
                <span className={`absolute top-1 w-5 h-5 bg-white rounded-full shadow transition-transform ${settings.myWalkRequiresPremium ? 'left-8' : 'left-1'}`} />
                <span className="sr-only">{settings.myWalkRequiresPremium ? 'Premium' : 'Free'}</span>
              </button>
            </div>

            {/* Roundtable */}
            <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 bg-purple-100 rounded-xl flex items-center justify-center">
                  <svg className="w-6 h-6 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                  </svg>
                </div>
                <div>
                  <p className="font-semibold text-gray-900">Roundtable Discussions</p>
                  <p className="text-sm text-gray-500">Multi-character group discussions</p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setSettings(prev => ({ ...prev, roundtableRequiresPremium: !prev.roundtableRequiresPremium }))}
                className={`relative w-14 h-7 rounded-full transition-colors ${settings.roundtableRequiresPremium ? 'bg-amber-500' : 'bg-gray-300'}`}
              >
                <span className={`absolute top-1 w-5 h-5 bg-white rounded-full shadow transition-transform ${settings.roundtableRequiresPremium ? 'left-8' : 'left-1'}`} />
              </button>
            </div>
          </div>
        </section>
      )}

      {/* Free Tier Limits Section */}
      {activeSection === 'limits' && (
        <section className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
          <div className="px-6 py-4 bg-gray-100 border-b border-gray-200">
            <h3 className="text-lg font-bold text-gray-900">Free Tier Limits</h3>
            <p className="text-gray-600 text-sm">Set usage limits for free accounts</p>
          </div>
          
          {/* Message Limit Toggle */}
          <div className="p-6 border-b border-gray-200">
            <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center">
                  <svg className="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                  </svg>
                </div>
                <div>
                  <p className="font-semibold text-gray-900">Message Limit</p>
                  <p className="text-sm text-gray-500">Show upgrade prompt after X messages per conversation</p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setSettings(prev => ({ ...prev, messageLimitEnabled: !prev.messageLimitEnabled }))}
                className={`relative w-14 h-7 rounded-full transition-colors ${settings.messageLimitEnabled ? 'bg-amber-500' : 'bg-gray-300'}`}
              >
                <span className={`absolute top-1 w-5 h-5 bg-white rounded-full shadow transition-transform ${settings.messageLimitEnabled ? 'left-8' : 'left-1'}`} />
              </button>
            </div>
            
            {/* Message limit number input - only show when enabled */}
            {settings.messageLimitEnabled && (
              <div className="mt-4 ml-16 max-w-xs">
                <label className="block text-sm font-medium text-gray-700 mb-2">Messages before upgrade prompt</label>
                <input
                  type="number"
                  min="5"
                  max="1000"
                  value={settings.freeMessageLimit}
                  onChange={(e) => setSettings(prev => ({ ...prev, freeMessageLimit: parseInt(e.target.value) || 50 }))}
                  className="w-full px-4 py-2 text-lg font-bold text-center border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-amber-500"
                />
              </div>
            )}
          </div>
        </section>
      )}

      {/* Free Characters Section */}
      {activeSection === 'characters' && (
        <section className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
          <div className="px-6 py-4 bg-gray-100 border-b border-gray-200">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-lg font-bold text-gray-900">Free Characters</h3>
                <p className="text-gray-600 text-sm">{settings.freeCharacters.length} of {characters.length} characters are free</p>
              </div>
              <div className="flex gap-2">
                <button
                  onClick={selectAllCharacters}
                  className="px-3 py-1.5 text-xs font-medium bg-green-100 text-green-700 rounded-lg hover:bg-green-200"
                >
                  Select All
                </button>
                <button
                  onClick={deselectAllCharacters}
                  className="px-3 py-1.5 text-xs font-medium bg-red-100 text-red-700 rounded-lg hover:bg-red-200"
                >
                  Deselect All
                </button>
              </div>
            </div>
          </div>
          
          <div className="p-6">
            <input
              type="text"
              placeholder="Search characters..."
              value={characterSearch}
              onChange={(e) => setCharacterSearch(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg mb-4 focus:ring-2 focus:ring-amber-500 focus:border-amber-500"
            />
            
            <div className="max-h-96 overflow-y-auto border border-gray-200 rounded-lg">
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2 p-3">
                {filteredCharacters.map(char => (
                  <label
                    key={char.id}
                    className={`flex items-center gap-3 p-3 rounded-lg cursor-pointer transition-all ${
                      settings.freeCharacters.includes(char.id) 
                        ? 'bg-green-50 border-2 border-green-300 shadow-sm' 
                        : 'bg-gray-50 border-2 border-transparent hover:bg-gray-100'
                    }`}
                  >
                    <input
                      type="checkbox"
                      checked={settings.freeCharacters.includes(char.id)}
                      onChange={() => toggleFreeCharacter(char.id)}
                      className="w-4 h-4 text-green-600 rounded focus:ring-green-500"
                    />
                    <img
                      src={char.avatar_url || `https://ui-avatars.com/api/?name=${encodeURIComponent(char.name)}&background=random`}
                      alt=""
                      className="w-10 h-10 rounded-full object-cover border-2 border-white shadow"
                    />
                    <div className="flex-1 min-w-0">
                      <p className="font-medium text-gray-900 truncate">{char.name}</p>
                      <p className="text-xs text-gray-500">{settings.freeCharacters.includes(char.id) ? '✓ Free' : 'Premium'}</p>
                    </div>
                  </label>
                ))}
              </div>
            </div>
          </div>
        </section>
      )}

      {/* Premium Studies Section */}
      {activeSection === 'studies' && (
        <section className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
          <div className="px-6 py-4 bg-gray-100 border-b border-gray-200">
            <h3 className="text-lg font-bold text-gray-900">Premium Bible Studies</h3>
            <p className="text-gray-600 text-sm">{settings.premiumStudyIds.length} studies require premium ({studies.length - settings.premiumStudyIds.length} are free)</p>
          </div>
          
          <div className="p-6">
            <input
              type="text"
              placeholder="Search studies..."
              value={studySearch}
              onChange={(e) => setStudySearch(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg mb-4 focus:ring-2 focus:ring-amber-500 focus:border-amber-500"
            />
            
            <div className="max-h-96 overflow-y-auto border border-gray-200 rounded-lg divide-y divide-gray-100">
              {filteredStudies.map(study => (
                <label
                  key={study.id}
                  className={`flex items-center justify-between p-4 cursor-pointer transition-colors ${
                    settings.premiumStudyIds.includes(study.id) ? 'bg-amber-50' : 'hover:bg-gray-50'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <input
                      type="checkbox"
                      checked={settings.premiumStudyIds.includes(study.id)}
                      onChange={() => togglePremiumStudy(study.id)}
                      className="w-4 h-4 text-amber-600 rounded focus:ring-amber-500"
                    />
                    <div>
                      <p className="font-medium text-gray-900">{study.title}</p>
                      <p className="text-xs text-gray-500">{study.lesson_count || 0} lessons</p>
                    </div>
                  </div>
                  <span className={`px-3 py-1 text-xs rounded-full font-medium ${
                    settings.premiumStudyIds.includes(study.id) 
                      ? 'bg-amber-200 text-amber-800' 
                      : 'bg-green-100 text-green-700'
                  }`}>
                    {settings.premiumStudyIds.includes(study.id) ? 'Premium' : 'Free'}
                  </span>
                </label>
              ))}
              {filteredStudies.length === 0 && (
                <p className="p-6 text-gray-500 text-center">No studies found</p>
              )}
            </div>
          </div>
        </section>
      )}

      {/* Featured Character Section */}
      {activeSection === 'featured' && (
        <section className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
          <div className="px-6 py-4 bg-gradient-to-r from-yellow-400 to-amber-500">
            <h3 className="text-lg font-bold text-white">Featured Character</h3>
            <p className="text-yellow-100 text-sm">This character appears prominently on your home page</p>
          </div>
          
          <div className="p-6">
            <div className="flex flex-col sm:flex-row gap-4">
              <select
                value={featuredId}
                onChange={(e) => setFeaturedId(e.target.value)}
                className="flex-1 px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-amber-500"
              >
                <option value="">No featured character</option>
                {characters.map(char => (
                  <option key={char.id} value={char.id}>{char.name}</option>
                ))}
              </select>
              <button
                onClick={saveFeaturedCharacter}
                disabled={featuredSaving}
                className="px-6 py-3 bg-amber-600 text-white rounded-lg font-medium hover:bg-amber-700 disabled:opacity-50"
              >
                {featuredSaving ? 'Saving...' : 'Set Featured'}
              </button>
            </div>
            
            {featuredId && (
              <div className="mt-6 flex items-center gap-4 p-4 bg-amber-50 rounded-xl border border-amber-200">
                {(() => {
                  const char = characters.find(c => c.id === featuredId);
                  if (!char) return null;
                  return (
                    <>
                      <img
                        src={char.avatar_url || `https://ui-avatars.com/api/?name=${encodeURIComponent(char.name)}&background=random`}
                        alt={char.name}
                        className="w-16 h-16 rounded-full object-cover border-4 border-amber-300 shadow-lg"
                      />
                      <div>
                        <p className="font-bold text-amber-900 text-lg">{char.name}</p>
                        <p className="text-amber-700 text-sm">Currently featured on home page</p>
                      </div>
                    </>
                  );
                })()}
              </div>
            )}
          </div>
        </section>
      )}
    </div>
  );
};

export default SubscriptionSettings;
