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
 * Brings together all Free vs Premium settings in one place:
 * - My Walk premium toggle
 * - Conversation saving premium toggle
 * - Roundtable premium toggle
 * - Character access limits
 * - Message limits
 * - Premium studies selection
 */
const SubscriptionSettings = ({ ownerSlug: propOwnerSlug }) => {
  // Settings state
  const [settings, setSettings] = useState({
    // Feature Gates
    myWalkRequiresPremium: true,
    savingRequiresPremium: true,
    roundtableRequiresPremium: true,
    
    // Limits
    freeMessageLimit: 50,
    freeCharacterLimit: 10,
    
    // Free Characters
    freeCharacters: [],
    
    // Premium Studies
    premiumStudyIds: [],
  });
  
  // UI state
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [message, setMessage] = useState({ type: '', text: '' });
  const [ownerSlug, setOwnerSlug] = useState(propOwnerSlug || 'default');
  
  // Data for selection
  const [characters, setCharacters] = useState([]);
  const [studies, setStudies] = useState([]);
  
  // UI helpers
  const [characterSearch, setCharacterSearch] = useState('');
  const [studySearch, setStudySearch] = useState('');

  // Load settings and data
  useEffect(() => {
    const loadData = async () => {
      setIsLoading(true);
      try {
        const slug = propOwnerSlug || getOwnerSlug() || 'default';
        setOwnerSlug(slug);
        
        // Load tier settings
        const tierSettings = await getTierSettings(slug);
        if (tierSettings) {
          setSettings({
            myWalkRequiresPremium: tierSettings?.premiumRoundtableGates?.myWalkRequiresPremium !== false,
            savingRequiresPremium: tierSettings?.premiumRoundtableGates?.savingRequiresPremium !== false,
            roundtableRequiresPremium: tierSettings?.premiumRoundtableGates?.premiumOnly !== false,
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
        
      } catch (err) {
        console.error('Error loading subscription settings:', err);
        setMessage({ type: 'error', text: 'Failed to load settings' });
      } finally {
        setIsLoading(false);
      }
    };
    
    loadData();
  }, [propOwnerSlug]);

  // Save settings
  const handleSave = async () => {
    setIsSaving(true);
    setMessage({ type: '', text: '' });
    
    try {
      // Get current settings to merge with
      const currentSettings = await getTierSettings(ownerSlug) || {};
      
      // Build updated settings
      const updatedSettings = {
        ...currentSettings,
        freeMessageLimit: settings.freeMessageLimit,
        freeCharacterLimit: settings.freeCharacterLimit,
        freeCharacters: settings.freeCharacters,
        premiumStudyIds: settings.premiumStudyIds,
        premiumRoundtableGates: {
          ...(currentSettings.premiumRoundtableGates || {}),
          myWalkRequiresPremium: settings.myWalkRequiresPremium,
          savingRequiresPremium: settings.savingRequiresPremium,
          premiumOnly: settings.roundtableRequiresPremium,
        },
        lastUpdated: new Date().toISOString(),
      };
      
      await setTierSettings(ownerSlug, updatedSettings);
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

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Subscription & Access Settings</h2>
          <p className="text-gray-600 mt-1">Configure what features require premium access</p>
        </div>
        <button
          onClick={handleSave}
          disabled={isSaving}
          className="px-6 py-2 bg-amber-600 text-white rounded-lg font-medium hover:bg-amber-700 disabled:opacity-50 flex items-center gap-2"
        >
          {isSaving ? (
            <>
              <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
              Saving...
            </>
          ) : (
            'Save Changes'
          )}
        </button>
      </div>

      {/* Message */}
      {message.text && (
        <div className={`p-4 rounded-lg ${message.type === 'success' ? 'bg-green-50 text-green-800 border border-green-200' : 'bg-red-50 text-red-800 border border-red-200'}`}>
          {message.text}
        </div>
      )}

      {/* Premium Feature Gates */}
      <section className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
        <div className="px-6 py-4 bg-gradient-to-r from-amber-500 to-amber-600">
          <h3 className="text-lg font-bold text-white">Premium Feature Gates</h3>
          <p className="text-amber-100 text-sm">Choose which features require a premium subscription</p>
        </div>
        
        <div className="p-6 space-y-4">
          {/* My Walk */}
          <label className="flex items-center justify-between p-4 bg-gray-50 rounded-lg hover:bg-gray-100 cursor-pointer">
            <div className="flex items-center gap-4">
              <div className="w-10 h-10 bg-amber-100 rounded-full flex items-center justify-center">
                <svg className="w-5 h-5 text-amber-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                </svg>
              </div>
              <div>
                <p className="font-medium text-gray-900">My Walk Dashboard</p>
                <p className="text-sm text-gray-500">Personal progress tracking, conversation history, and study stats</p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <span className={`text-sm ${settings.myWalkRequiresPremium ? 'text-amber-600 font-medium' : 'text-gray-400'}`}>
                {settings.myWalkRequiresPremium ? 'Premium' : 'Free'}
              </span>
              <button
                type="button"
                onClick={() => setSettings(prev => ({ ...prev, myWalkRequiresPremium: !prev.myWalkRequiresPremium }))}
                className={`relative w-12 h-6 rounded-full transition-colors ${settings.myWalkRequiresPremium ? 'bg-amber-500' : 'bg-gray-300'}`}
              >
                <span className={`absolute top-1 w-4 h-4 bg-white rounded-full transition-transform ${settings.myWalkRequiresPremium ? 'left-7' : 'left-1'}`} />
              </button>
            </div>
          </label>

          {/* Saving Conversations */}
          <label className="flex items-center justify-between p-4 bg-gray-50 rounded-lg hover:bg-gray-100 cursor-pointer">
            <div className="flex items-center gap-4">
              <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                <svg className="w-5 h-5 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7H5a2 2 0 00-2 2v9a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-3m-1 4l-3 3m0 0l-3-3m3 3V4" />
                </svg>
              </div>
              <div>
                <p className="font-medium text-gray-900">Saving Conversations</p>
                <p className="text-sm text-gray-500">Ability to save and access past conversations</p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <span className={`text-sm ${settings.savingRequiresPremium ? 'text-amber-600 font-medium' : 'text-gray-400'}`}>
                {settings.savingRequiresPremium ? 'Premium' : 'Free'}
              </span>
              <button
                type="button"
                onClick={() => setSettings(prev => ({ ...prev, savingRequiresPremium: !prev.savingRequiresPremium }))}
                className={`relative w-12 h-6 rounded-full transition-colors ${settings.savingRequiresPremium ? 'bg-amber-500' : 'bg-gray-300'}`}
              >
                <span className={`absolute top-1 w-4 h-4 bg-white rounded-full transition-transform ${settings.savingRequiresPremium ? 'left-7' : 'left-1'}`} />
              </button>
            </div>
          </label>

          {/* Roundtable */}
          <label className="flex items-center justify-between p-4 bg-gray-50 rounded-lg hover:bg-gray-100 cursor-pointer">
            <div className="flex items-center gap-4">
              <div className="w-10 h-10 bg-purple-100 rounded-full flex items-center justify-center">
                <svg className="w-5 h-5 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                </svg>
              </div>
              <div>
                <p className="font-medium text-gray-900">Roundtable Discussions</p>
                <p className="text-sm text-gray-500">Multi-character group discussions</p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <span className={`text-sm ${settings.roundtableRequiresPremium ? 'text-amber-600 font-medium' : 'text-gray-400'}`}>
                {settings.roundtableRequiresPremium ? 'Premium' : 'Free'}
              </span>
              <button
                type="button"
                onClick={() => setSettings(prev => ({ ...prev, roundtableRequiresPremium: !prev.roundtableRequiresPremium }))}
                className={`relative w-12 h-6 rounded-full transition-colors ${settings.roundtableRequiresPremium ? 'bg-amber-500' : 'bg-gray-300'}`}
              >
                <span className={`absolute top-1 w-4 h-4 bg-white rounded-full transition-transform ${settings.roundtableRequiresPremium ? 'left-7' : 'left-1'}`} />
              </button>
            </div>
          </label>
        </div>
      </section>

      {/* Free Tier Limits */}
      <section className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
        <div className="px-6 py-4 bg-gray-100 border-b border-gray-200">
          <h3 className="text-lg font-bold text-gray-900">Free Tier Limits</h3>
          <p className="text-gray-600 text-sm">Set limits for free accounts</p>
        </div>
        
        <div className="p-6 grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Messages per Conversation
            </label>
            <input
              type="number"
              min="1"
              max="1000"
              value={settings.freeMessageLimit}
              onChange={(e) => setSettings(prev => ({ ...prev, freeMessageLimit: parseInt(e.target.value) || 50 }))}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-amber-500"
            />
            <p className="text-xs text-gray-500 mt-1">Max messages before prompting upgrade</p>
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Free Character Access Count
            </label>
            <input
              type="number"
              min="1"
              max="100"
              value={settings.freeCharacterLimit}
              onChange={(e) => setSettings(prev => ({ ...prev, freeCharacterLimit: parseInt(e.target.value) || 10 }))}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-amber-500"
            />
            <p className="text-xs text-gray-500 mt-1">Number of characters free users can access</p>
          </div>
        </div>
      </section>

      {/* Free Characters Selection */}
      <section className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
        <div className="px-6 py-4 bg-gray-100 border-b border-gray-200">
          <h3 className="text-lg font-bold text-gray-900">Free Characters</h3>
          <p className="text-gray-600 text-sm">Select which characters are available to free users ({settings.freeCharacters.length} selected)</p>
        </div>
        
        <div className="p-6">
          <input
            type="text"
            placeholder="Search characters..."
            value={characterSearch}
            onChange={(e) => setCharacterSearch(e.target.value)}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg mb-4 focus:ring-2 focus:ring-amber-500 focus:border-amber-500"
          />
          
          <div className="max-h-64 overflow-y-auto border border-gray-200 rounded-lg">
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-2 p-2">
              {filteredCharacters.map(char => (
                <label
                  key={char.id}
                  className={`flex items-center gap-2 p-2 rounded-lg cursor-pointer transition-colors ${
                    settings.freeCharacters.includes(char.id) ? 'bg-amber-100 border border-amber-300' : 'hover:bg-gray-50 border border-transparent'
                  }`}
                >
                  <input
                    type="checkbox"
                    checked={settings.freeCharacters.includes(char.id)}
                    onChange={() => toggleFreeCharacter(char.id)}
                    className="w-4 h-4 text-amber-600 rounded"
                  />
                  <img
                    src={char.avatar_url || `https://ui-avatars.com/api/?name=${encodeURIComponent(char.name)}&background=random`}
                    alt=""
                    className="w-6 h-6 rounded-full object-cover"
                  />
                  <span className="text-sm truncate">{char.name}</span>
                </label>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Premium Studies */}
      <section className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
        <div className="px-6 py-4 bg-gray-100 border-b border-gray-200">
          <h3 className="text-lg font-bold text-gray-900">Premium Bible Studies</h3>
          <p className="text-gray-600 text-sm">Select which studies require premium access ({settings.premiumStudyIds.length} selected)</p>
        </div>
        
        <div className="p-6">
          <input
            type="text"
            placeholder="Search studies..."
            value={studySearch}
            onChange={(e) => setStudySearch(e.target.value)}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg mb-4 focus:ring-2 focus:ring-amber-500 focus:border-amber-500"
          />
          
          <div className="max-h-64 overflow-y-auto border border-gray-200 rounded-lg divide-y divide-gray-100">
            {filteredStudies.map(study => (
              <label
                key={study.id}
                className={`flex items-center justify-between p-3 cursor-pointer transition-colors ${
                  settings.premiumStudyIds.includes(study.id) ? 'bg-amber-50' : 'hover:bg-gray-50'
                }`}
              >
                <div className="flex items-center gap-3">
                  <input
                    type="checkbox"
                    checked={settings.premiumStudyIds.includes(study.id)}
                    onChange={() => togglePremiumStudy(study.id)}
                    className="w-4 h-4 text-amber-600 rounded"
                  />
                  <div>
                    <p className="font-medium text-gray-900">{study.title}</p>
                    <p className="text-xs text-gray-500">{study.lesson_count || 0} lessons</p>
                  </div>
                </div>
                {settings.premiumStudyIds.includes(study.id) && (
                  <span className="px-2 py-1 bg-amber-200 text-amber-800 text-xs rounded-full font-medium">Premium</span>
                )}
              </label>
            ))}
            {filteredStudies.length === 0 && (
              <p className="p-4 text-gray-500 text-center">No studies found</p>
            )}
          </div>
        </div>
      </section>
    </div>
  );
};

export default SubscriptionSettings;
