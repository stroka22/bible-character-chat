import React, { useState, useEffect } from 'react';
import { characterRepository } from '../../repositories/characterRepository';
import { bibleStudiesRepository } from '../../repositories/bibleStudiesRepository';
import { supabase } from '../../services/supabase';

/**
 * AI-powered Bible Study Generator
 * Allows admins to generate complete Bible studies from a topic
 */
export default function AIStudyGenerator({ 
  ownerSlug, 
  isSuperAdmin = false,
  allOwners = [],
  onStudyCreated,
  onClose 
}) {
  const [topic, setTopic] = useState('');
  const [lessonCount, setLessonCount] = useState(8);
  const [generating, setGenerating] = useState(false);
  const [error, setError] = useState('');
  const [generatedStudy, setGeneratedStudy] = useState(null);
  const [saving, setSaving] = useState(false);
  
  // Character selection
  const [characters, setCharacters] = useState([]);
  const [loadingCharacters, setLoadingCharacters] = useState(true);
  const [autoSelectCharacters, setAutoSelectCharacters] = useState(true);
  const [selectedCharacterIds, setSelectedCharacterIds] = useState([]);
  
  // Visibility options (super admin only)
  const [visibility, setVisibility] = useState('org'); // 'org', 'all', 'select'
  const [selectedOrgs, setSelectedOrgs] = useState([]);

  useEffect(() => {
    loadCharacters();
  }, [ownerSlug]);

  const loadCharacters = async () => {
    setLoadingCharacters(true);
    try {
      const chars = await characterRepository.listCharacters({ ownerSlug, allOwners: true });
      setCharacters(chars || []);
    } catch (e) {
      console.error('Error loading characters:', e);
    } finally {
      setLoadingCharacters(false);
    }
  };

  const handleGenerate = async () => {
    if (!topic.trim()) {
      setError('Please enter a topic');
      return;
    }

    setGenerating(true);
    setError('');
    setGeneratedStudy(null);

    try {
      const response = await fetch('/api/generate-bible-study', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          topic: topic.trim(),
          lessonCount,
          characterIds: autoSelectCharacters ? [] : selectedCharacterIds,
          autoSelectCharacters
        })
      });

      const data = await response.json();

      if (!response.ok || !data.success) {
        throw new Error(data.error || 'Failed to generate study');
      }

      setGeneratedStudy(data.study);
    } catch (e) {
      console.error('Error generating study:', e);
      setError(e.message || 'Failed to generate study');
    } finally {
      setGenerating(false);
    }
  };

  const handleSave = async () => {
    if (!generatedStudy) return;

    setSaving(true);
    setError('');

    try {
      // Match character names to IDs
      const characterNameToId = {};
      characters.forEach(c => {
        characterNameToId[c.name.toLowerCase()] = c.id;
      });

      // Find character ID for the study's main character (first lesson's character)
      const mainCharacterName = generatedStudy.lessons[0]?.characterName?.toLowerCase();
      const mainCharacterId = characterNameToId[mainCharacterName] || null;

      // Determine target owner_slug(s)
      let targetOwnerSlugs = [ownerSlug];
      if (isSuperAdmin) {
        if (visibility === 'all') {
          targetOwnerSlugs = ['default'];
        } else if (visibility === 'select') {
          targetOwnerSlugs = selectedOrgs.length > 0 ? selectedOrgs : [ownerSlug];
        }
      }

      // Create study for each target org
      for (const targetSlug of targetOwnerSlugs) {
        // Create the study
        const studyPayload = {
          owner_slug: targetSlug,
          title: generatedStudy.title,
          description: generatedStudy.description,
          subject: generatedStudy.subject,
          character_id: mainCharacterId,
          character_instructions: generatedStudy.characterInstructions,
          visibility: 'public',
          is_premium: false,
          study_type: 'introduction'
        };

        const savedStudy = await bibleStudiesRepository.upsertStudy(studyPayload);

        if (!savedStudy?.id) {
          throw new Error('Failed to save study');
        }

        // Create lessons
        for (const lesson of generatedStudy.lessons) {
          const lessonCharacterName = lesson.characterName?.toLowerCase();
          const lessonCharacterId = characterNameToId[lessonCharacterName] || mainCharacterId;

          const lessonPayload = {
            study_id: savedStudy.id,
            order_index: lesson.orderIndex,
            title: lesson.title,
            summary: lesson.summary,
            scripture_refs: lesson.scriptureRefs,
            character_id: lessonCharacterId,
            prompts: lesson.prompts.map(p => typeof p === 'string' ? { text: p } : p)
          };

          await bibleStudiesRepository.upsertLesson(lessonPayload);
        }
      }

      onStudyCreated?.();
      onClose?.();
    } catch (e) {
      console.error('Error saving study:', e);
      setError(e.message || 'Failed to save study');
    } finally {
      setSaving(false);
    }
  };

  const toggleCharacter = (charId) => {
    setSelectedCharacterIds(prev => 
      prev.includes(charId) 
        ? prev.filter(id => id !== charId)
        : [...prev, charId]
    );
  };

  const toggleOrg = (slug) => {
    setSelectedOrgs(prev =>
      prev.includes(slug)
        ? prev.filter(s => s !== slug)
        : [...prev, slug]
    );
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl shadow-2xl max-w-4xl w-full max-h-[90vh] overflow-hidden flex flex-col">
        {/* Header */}
        <div className="px-6 py-4 border-b border-gray-200 flex items-center justify-between bg-gradient-to-r from-amber-500 to-amber-600">
          <h2 className="text-xl font-bold text-white">AI Bible Study Generator</h2>
          <button onClick={onClose} className="text-white/80 hover:text-white">
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-6">
          {!generatedStudy ? (
            <div className="space-y-6">
              {/* Topic Input */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Study Topic *
                </label>
                <input
                  type="text"
                  value={topic}
                  onChange={(e) => setTopic(e.target.value)}
                  placeholder="e.g., Forgiveness, The Fruit of the Spirit, Trusting God"
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-amber-500"
                  disabled={generating}
                />
              </div>

              {/* Lesson Count */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Number of Lessons
                </label>
                <select
                  value={lessonCount}
                  onChange={(e) => setLessonCount(parseInt(e.target.value))}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-amber-500"
                  disabled={generating}
                >
                  {[5, 6, 7, 8, 9, 10, 11, 12].map(n => (
                    <option key={n} value={n}>{n} lessons</option>
                  ))}
                </select>
              </div>

              {/* Character Selection */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Character Guides
                </label>
                <div className="flex items-center gap-4 mb-3">
                  <label className="flex items-center gap-2">
                    <input
                      type="radio"
                      checked={autoSelectCharacters}
                      onChange={() => setAutoSelectCharacters(true)}
                      disabled={generating}
                    />
                    <span className="text-sm">Let AI choose appropriate characters</span>
                  </label>
                  <label className="flex items-center gap-2">
                    <input
                      type="radio"
                      checked={!autoSelectCharacters}
                      onChange={() => setAutoSelectCharacters(false)}
                      disabled={generating}
                    />
                    <span className="text-sm">Select specific characters</span>
                  </label>
                </div>

                {!autoSelectCharacters && (
                  <div className="border border-gray-200 rounded-lg p-3 max-h-48 overflow-y-auto">
                    {loadingCharacters ? (
                      <p className="text-gray-500 text-sm">Loading characters...</p>
                    ) : (
                      <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
                        {characters.slice(0, 30).map(char => (
                          <label key={char.id} className="flex items-center gap-2 text-sm">
                            <input
                              type="checkbox"
                              checked={selectedCharacterIds.includes(char.id)}
                              onChange={() => toggleCharacter(char.id)}
                              disabled={generating}
                            />
                            <span className="truncate">{char.name}</span>
                          </label>
                        ))}
                      </div>
                    )}
                  </div>
                )}
              </div>

              {/* Visibility (Super Admin Only) */}
              {isSuperAdmin && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Visibility
                  </label>
                  <div className="space-y-2">
                    <label className="flex items-center gap-2">
                      <input
                        type="radio"
                        checked={visibility === 'org'}
                        onChange={() => setVisibility('org')}
                        disabled={generating}
                      />
                      <span className="text-sm">My organization only</span>
                    </label>
                    <label className="flex items-center gap-2">
                      <input
                        type="radio"
                        checked={visibility === 'all'}
                        onChange={() => setVisibility('all')}
                        disabled={generating}
                      />
                      <span className="text-sm">All organizations (global)</span>
                    </label>
                    <label className="flex items-center gap-2">
                      <input
                        type="radio"
                        checked={visibility === 'select'}
                        onChange={() => setVisibility('select')}
                        disabled={generating}
                      />
                      <span className="text-sm">Select organizations</span>
                    </label>
                  </div>

                  {visibility === 'select' && allOwners.length > 0 && (
                    <div className="mt-3 border border-gray-200 rounded-lg p-3 max-h-32 overflow-y-auto">
                      <div className="grid grid-cols-2 gap-2">
                        {allOwners.map(owner => (
                          <label key={owner.owner_slug} className="flex items-center gap-2 text-sm">
                            <input
                              type="checkbox"
                              checked={selectedOrgs.includes(owner.owner_slug)}
                              onChange={() => toggleOrg(owner.owner_slug)}
                              disabled={generating}
                            />
                            <span className="truncate">{owner.display_name || owner.owner_slug}</span>
                          </label>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              )}

              {error && (
                <div className="p-3 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm">
                  {error}
                </div>
              )}
            </div>
          ) : (
            /* Preview Generated Study */
            <div className="space-y-6">
              <div className="bg-amber-50 border border-amber-200 rounded-lg p-4">
                <h3 className="text-lg font-bold text-amber-900">{generatedStudy.title}</h3>
                <p className="text-amber-800 mt-1">{generatedStudy.description}</p>
                {generatedStudy.themeScripture && (
                  <p className="text-amber-700 text-sm mt-2 italic">Theme: {generatedStudy.themeScripture}</p>
                )}
              </div>

              <div>
                <h4 className="font-medium text-gray-900 mb-3">Lessons ({generatedStudy.lessons.length})</h4>
                <div className="space-y-3">
                  {generatedStudy.lessons.map((lesson, idx) => (
                    <div key={idx} className="border border-gray-200 rounded-lg p-3">
                      <div className="flex items-start justify-between">
                        <div>
                          <span className="text-xs text-gray-500">Lesson {lesson.orderIndex}</span>
                          <h5 className="font-medium text-gray-900">{lesson.title}</h5>
                          <p className="text-sm text-gray-600 mt-1">{lesson.summary}</p>
                        </div>
                        <span className="text-xs bg-amber-100 text-amber-800 px-2 py-1 rounded">
                          {lesson.characterName}
                        </span>
                      </div>
                      <div className="mt-2 text-xs text-gray-500">
                        Scripture: {lesson.scriptureRefs?.join(', ')}
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {error && (
                <div className="p-3 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm">
                  {error}
                </div>
              )}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="px-6 py-4 border-t border-gray-200 bg-gray-50 flex justify-between">
          {!generatedStudy ? (
            <>
              <button
                onClick={onClose}
                className="px-4 py-2 text-gray-700 hover:bg-gray-200 rounded-lg transition-colors"
                disabled={generating}
              >
                Cancel
              </button>
              <button
                onClick={handleGenerate}
                disabled={generating || !topic.trim()}
                className="px-6 py-2 bg-amber-600 text-white rounded-lg hover:bg-amber-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
              >
                {generating ? (
                  <>
                    <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                    </svg>
                    Generating...
                  </>
                ) : (
                  <>
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                    </svg>
                    Generate Study
                  </>
                )}
              </button>
            </>
          ) : (
            <>
              <button
                onClick={() => setGeneratedStudy(null)}
                className="px-4 py-2 text-gray-700 hover:bg-gray-200 rounded-lg transition-colors"
                disabled={saving}
              >
                ← Back to Edit
              </button>
              <button
                onClick={handleSave}
                disabled={saving}
                className="px-6 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
              >
                {saving ? (
                  <>
                    <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                    </svg>
                    Saving...
                  </>
                ) : (
                  <>
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                    Save Study
                  </>
                )}
              </button>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
