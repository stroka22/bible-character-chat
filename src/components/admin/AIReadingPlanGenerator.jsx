import React, { useState } from 'react';
import { supabase } from '../../services/supabase';

/**
 * AI-powered Reading Plan Generator
 * Allows admins to generate complete reading plans from a subject
 */
export default function AIReadingPlanGenerator({ 
  ownerSlug, 
  isSuperAdmin = false,
  allOwners = [],
  onPlanCreated,
  onClose 
}) {
  const [subject, setSubject] = useState('');
  const [duration, setDuration] = useState(7);
  const [generating, setGenerating] = useState(false);
  const [error, setError] = useState('');
  const [generatedPlan, setGeneratedPlan] = useState(null);
  const [saving, setSaving] = useState(false);
  
  // Visibility options (super admin only)
  const [visibility, setVisibility] = useState('org'); // 'org', 'all', 'select'
  const [selectedOrgs, setSelectedOrgs] = useState([]);

  const durations = [
    { value: 3, label: '3 days' },
    { value: 5, label: '5 days' },
    { value: 7, label: '7 days (1 week)' },
    { value: 14, label: '14 days (2 weeks)' },
    { value: 21, label: '21 days (3 weeks)' },
    { value: 30, label: '30 days (1 month)' }
  ];

  const handleGenerate = async () => {
    if (!subject.trim()) {
      setError('Please enter a subject');
      return;
    }

    setGenerating(true);
    setError('');
    setGeneratedPlan(null);

    try {
      const response = await fetch('/api/generate-reading-plan', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          subject: subject.trim(),
          duration
        })
      });

      const data = await response.json();

      if (!response.ok || !data.success) {
        throw new Error(data.error || 'Failed to generate reading plan');
      }

      setGeneratedPlan(data.plan);
    } catch (e) {
      console.error('Error generating reading plan:', e);
      setError(e.message || 'Failed to generate reading plan');
    } finally {
      setGenerating(false);
    }
  };

  const handleSave = async () => {
    if (!generatedPlan) return;

    setSaving(true);
    setError('');

    try {
      // Determine target owner_slug(s)
      let targetOwnerSlugs = [ownerSlug];
      if (isSuperAdmin) {
        if (visibility === 'all') {
          targetOwnerSlugs = [null]; // null = global/shared
        } else if (visibility === 'select') {
          targetOwnerSlugs = selectedOrgs.length > 0 ? selectedOrgs : [ownerSlug];
        }
      }

      // Create plan for each target org
      for (const targetSlug of targetOwnerSlugs) {
        // Create the reading plan
        const planPayload = {
          owner_slug: targetSlug,
          title: generatedPlan.title,
          description: generatedPlan.description,
          slug: generatedPlan.slug + (targetSlug ? `-${targetSlug}` : '') + `-${Date.now()}`,
          duration_days: duration,
          visibility: 'public',
          is_premium: false
        };

        const { data: savedPlan, error: planError } = await supabase
          .from('reading_plans')
          .insert(planPayload)
          .select()
          .single();

        if (planError) {
          throw new Error(planError.message || 'Failed to save plan');
        }

        // Create daily readings
        for (const day of generatedPlan.days) {
          const dayPayload = {
            plan_id: savedPlan.id,
            day_number: day.dayNumber,
            title: day.title,
            scripture_ref: day.scriptureRef,
            context: day.context,
            reflection_prompts: day.reflectionPrompts
          };

          const { error: dayError } = await supabase
            .from('reading_plan_days')
            .insert(dayPayload);

          if (dayError) {
            console.error('Error saving day:', dayError);
          }
        }
      }

      onPlanCreated?.();
      onClose?.();
    } catch (e) {
      console.error('Error saving reading plan:', e);
      setError(e.message || 'Failed to save reading plan');
    } finally {
      setSaving(false);
    }
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
        <div className="px-6 py-4 border-b border-gray-200 flex items-center justify-between bg-gradient-to-r from-emerald-500 to-emerald-600">
          <h2 className="text-xl font-bold text-white">AI Reading Plan Generator</h2>
          <button onClick={onClose} className="text-white/80 hover:text-white">
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-6">
          {!generatedPlan ? (
            <div className="space-y-6">
              {/* Subject Input */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Reading Plan Subject *
                </label>
                <input
                  type="text"
                  value={subject}
                  onChange={(e) => setSubject(e.target.value)}
                  placeholder="e.g., Prayer, The Psalms, Jesus' Parables, Faith"
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
                  disabled={generating}
                />
              </div>

              {/* Duration */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Duration
                </label>
                <select
                  value={duration}
                  onChange={(e) => setDuration(parseInt(e.target.value))}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
                  disabled={generating}
                >
                  {durations.map(d => (
                    <option key={d.value} value={d.value}>{d.label}</option>
                  ))}
                </select>
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
            /* Preview Generated Plan */
            <div className="space-y-6">
              <div className="bg-emerald-50 border border-emerald-200 rounded-lg p-4">
                <h3 className="text-lg font-bold text-emerald-900">{generatedPlan.title}</h3>
                <p className="text-emerald-800 mt-1">{generatedPlan.description}</p>
                <p className="text-emerald-700 text-sm mt-2">{duration} days</p>
              </div>

              <div>
                <h4 className="font-medium text-gray-900 mb-3">Daily Readings ({generatedPlan.days.length})</h4>
                <div className="space-y-3 max-h-96 overflow-y-auto">
                  {generatedPlan.days.map((day, idx) => (
                    <div key={idx} className="border border-gray-200 rounded-lg p-3">
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <span className="text-xs text-gray-500">Day {day.dayNumber}</span>
                          <h5 className="font-medium text-gray-900">{day.title}</h5>
                          <p className="text-sm text-emerald-700 font-medium mt-1">{day.scriptureRef}</p>
                          <p className="text-sm text-gray-600 mt-1">{day.context}</p>
                        </div>
                      </div>
                      {day.reflectionPrompts?.length > 0 && (
                        <div className="mt-2 text-xs text-gray-500">
                          <span className="font-medium">Reflection:</span> {day.reflectionPrompts[0]}
                        </div>
                      )}
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
          {!generatedPlan ? (
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
                disabled={generating || !subject.trim()}
                className="px-6 py-2 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
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
                    Generate Plan
                  </>
                )}
              </button>
            </>
          ) : (
            <>
              <button
                onClick={() => setGeneratedPlan(null)}
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
                    Save Plan
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
