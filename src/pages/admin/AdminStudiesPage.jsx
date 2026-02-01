import { jsx as _jsx, jsxs as _jsxs, Fragment as _Fragment } from "react/jsx-runtime";
import React, { useState, useEffect, useCallback } from 'react';
import { bibleStudiesRepository, bibleStudyCategoriesRepository, bibleStudiesAdminRepository } from '../../repositories/bibleStudiesRepository';
import { characterRepository } from '../../repositories/characterRepository';
import { getOwnerSlug, listOwnerSlugs } from '../../services/tierSettingsService';
import { supabase } from '../../services/supabase';
import { useAuth } from '../../contexts/AuthContext';
import { toCsv, parseCsv, download } from '../../utils/csv';
import { cloneStudyToOwners } from '../../repositories/bibleStudiesRepository';

/**
 * Category Manager Component for Bible Studies
 */
const CategoryManager = ({ categories, onUpdate, onDelete, onCreate }) => {
  const [editingId, setEditingId] = useState(null);
  const [editForm, setEditForm] = useState({ name: '', icon: '', description: '' });
  const [showNew, setShowNew] = useState(false);
  const [newForm, setNewForm] = useState({ name: '', slug: '', icon: '', description: '' });

  const handleEdit = (cat) => {
    setEditingId(cat.id);
    setEditForm({ name: cat.name, icon: cat.icon || '', description: cat.description || '' });
  };

  const handleSave = async (id) => {
    await onUpdate(id, editForm);
    setEditingId(null);
  };

  const handleCreate = async () => {
    if (!newForm.name || !newForm.slug) return;
    await onCreate({
      ...newForm,
      slug: newForm.slug.toLowerCase().replace(/\s+/g, '-'),
    });
    setNewForm({ name: '', slug: '', icon: '', description: '' });
    setShowNew(false);
  };

  return _jsxs("div", {
    className: "space-y-3",
    children: [
      ...categories.map(cat => _jsx("div", {
        key: cat.id,
        className: "flex items-center gap-3 p-3 bg-gray-50 rounded-lg",
        children: editingId === cat.id ? _jsxs(_Fragment, {
          children: [
            _jsx("input", {
              type: "text",
              value: editForm.icon,
              onChange: (e) => setEditForm({ ...editForm, icon: e.target.value }),
              className: "w-12 text-center border border-gray-300 rounded px-2 py-1",
              placeholder: "Icon"
            }),
            _jsx("input", {
              type: "text",
              value: editForm.name,
              onChange: (e) => setEditForm({ ...editForm, name: e.target.value }),
              className: "flex-1 border border-gray-300 rounded px-2 py-1",
              placeholder: "Name"
            }),
            _jsx("input", {
              type: "text",
              value: editForm.description,
              onChange: (e) => setEditForm({ ...editForm, description: e.target.value }),
              className: "flex-1 border border-gray-300 rounded px-2 py-1",
              placeholder: "Description"
            }),
            _jsx("button", { onClick: () => handleSave(cat.id), className: "px-3 py-1 bg-green-600 text-white rounded text-sm", children: "Save" }),
            _jsx("button", { onClick: () => setEditingId(null), className: "px-3 py-1 bg-gray-300 text-gray-700 rounded text-sm", children: "Cancel" })
          ]
        }) : _jsxs(_Fragment, {
          children: [
            _jsx("span", { className: "text-xl w-8", children: cat.icon }),
            _jsxs("div", {
              className: "flex-1",
              children: [
                _jsx("span", { className: "font-medium", children: cat.name }),
                _jsxs("span", { className: "text-gray-500 text-sm ml-2", children: ["(", cat.slug, ")"] }),
                cat.description && _jsx("p", { className: "text-sm text-gray-500", children: cat.description })
              ]
            }),
            _jsxs("span", { className: "text-sm text-gray-400", children: ["Order: ", cat.display_order] }),
            _jsx("button", {
              onClick: () => handleEdit(cat),
              className: "p-1 text-blue-600 hover:bg-blue-100 rounded",
              children: _jsx("svg", { className: "w-4 h-4", fill: "none", stroke: "currentColor", viewBox: "0 0 24 24", children: _jsx("path", { strokeLinecap: "round", strokeLinejoin: "round", strokeWidth: 2, d: "M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" }) })
            }),
            _jsx("button", {
              onClick: () => onDelete(cat.id),
              className: "p-1 text-red-600 hover:bg-red-100 rounded",
              children: _jsx("svg", { className: "w-4 h-4", fill: "none", stroke: "currentColor", viewBox: "0 0 24 24", children: _jsx("path", { strokeLinecap: "round", strokeLinejoin: "round", strokeWidth: 2, d: "M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" }) })
            })
          ]
        })
      })),
      showNew ? _jsxs("div", {
        className: "flex items-center gap-3 p-3 bg-blue-50 rounded-lg border-2 border-dashed border-blue-300",
        children: [
          _jsx("input", {
            type: "text",
            value: newForm.icon,
            onChange: (e) => setNewForm({ ...newForm, icon: e.target.value }),
            className: "w-12 text-center border border-gray-300 rounded px-2 py-1",
            placeholder: "Icon"
          }),
          _jsx("input", {
            type: "text",
            value: newForm.name,
            onChange: (e) => setNewForm({ ...newForm, name: e.target.value }),
            className: "flex-1 border border-gray-300 rounded px-2 py-1",
            placeholder: "Category Name"
          }),
          _jsx("input", {
            type: "text",
            value: newForm.slug,
            onChange: (e) => setNewForm({ ...newForm, slug: e.target.value }),
            className: "w-32 border border-gray-300 rounded px-2 py-1",
            placeholder: "slug"
          }),
          _jsx("button", { onClick: handleCreate, className: "px-3 py-1 bg-green-600 text-white rounded text-sm", children: "Create" }),
          _jsx("button", { onClick: () => setShowNew(false), className: "px-3 py-1 bg-gray-300 text-gray-700 rounded text-sm", children: "Cancel" })
        ]
      }) : _jsx("button", {
        onClick: () => setShowNew(true),
        className: "w-full p-3 border-2 border-dashed border-gray-300 rounded-lg text-gray-500 hover:border-blue-400 hover:text-blue-600 transition-colors",
        children: "+ Add Category"
      })
    ]
  });
};

/**
 * AdminStudiesPage
 *
 * Renders Bible-study administration UI.  When used inside the main
 * Admin tabs it can be embedded (`embedded` prop) so we skip the
 * full-screen gradient scaffolding and header.  When rendered as a
 * standalone page (default) we keep the existing look and also show
 * a breadcrumb back-link.
 */
const AdminStudiesPage = ({ embedded = false }) => {
  const { role } = useAuth();
  // Main data states
  const [studies, setStudies] = useState([]);
  const [characters, setCharacters] = useState([]);
  const [selectedStudy, setSelectedStudy] = useState(null);
  const [lessons, setLessons] = useState([]);
  const [selectedLesson, setSelectedLesson] = useState(null);
  
  // UI states
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showStudyForm, setShowStudyForm] = useState(false);
  const [showLessonForm, setShowLessonForm] = useState(false);
  const [showDistributeModal, setShowDistributeModal] = useState(false);
  const [ownerSlug, setOwnerSlug] = useState(getOwnerSlug());
  const [ownerOptions, setOwnerOptions] = useState(['__ALL__', (getOwnerSlug() || '').toLowerCase(), 'faithtalkai', 'default']);
  const [orgOptions, setOrgOptions] = useState([]);
  const [distributeBusy, setDistributeBusy] = useState(false);
  const [distributeForm, setDistributeForm] = useState({ all: false, includeLessons: true, ownersSelected: [] });
  const [distributeResult, setDistributeResult] = useState(null);
  // Series UI deprecated – keep studies-only admin
  const [showImportModal, setShowImportModal] = useState(false);
  const [importPreview, setImportPreview] = useState({ studies: [], lessons: [], errors: [] });
  const [importBusy, setImportBusy] = useState(false);
  
  // Category management state
  const [categories, setCategories] = useState([]);
  const [activeTab, setActiveTab] = useState('studies'); // 'studies' | 'categories'
  const [searchQuery, setSearchQuery] = useState('');
  const [filterCategory, setFilterCategory] = useState('');
  const [dragIndex, setDragIndex] = useState(null);
  
  // Form states
  const [studyForm, setStudyForm] = useState({
    id: null,
    owner_slug: ownerSlug,
    title: '',
    description: '',
    subject: '',
    character_instructions: '',
    character_id: '',
    cover_image_url: '',
    study_type: 'standalone',
    visibility: 'public',
    is_premium: false,
    is_featured: false,
    is_visible: true,
    category: '',
    display_order: 0
  });
  
  const [lessonForm, setLessonForm] = useState({
    id: null,
    study_id: '',
    order_index: 0,
    title: '',
    scripture_refs: [],
    summary: '',
    prompts: [],
    character_id: ''
  });
  
  // Load studies on mount
  useEffect(() => {
    fetchStudies();
    fetchCharacters();
    fetchOwnerOptions();
    fetchCategories();
  }, []);
  
  // Fetch categories
  const fetchCategories = async () => {
    try {
      const data = await bibleStudyCategoriesRepository.getCategories();
      setCategories(data || []);
    } catch (err) {
      console.error('Error fetching categories:', err);
    }
  };

  // Load canonical org list for distribution
  useEffect(() => {
    (async () => {
      try {
        const owners = await listOwnerSlugs();
        setOrgOptions(Array.isArray(owners) ? owners : []);
      } catch {}
    })();
  }, []);
  
  // Load lessons when a study is selected
  useEffect(() => {
    if (selectedStudy) {
      fetchLessons(selectedStudy.id);
    } else {
      setLessons([]);
    }
  }, [selectedStudy]);
  
  // Fetch all studies for current owner
  const fetchStudies = async (slugOverride) => {
    setIsLoading(true);
    try {
      const wantAll = (slugOverride || ownerSlug) === '__ALL__';
      const data = await bibleStudiesRepository.listStudies({ 
        ownerSlug: slugOverride || ownerSlug, 
        includePrivate: true,
        allOwners: wantAll,
        includeHidden: true, // Admin sees all studies
      });
      // Extra safety: when viewing all owners, dedupe by normalized title (strip -N suffix)
      if (wantAll && Array.isArray(data)) {
        const norm = (t) => String(t || '').trim().toLowerCase().replace(/-\d+$/,'');
        const seen = new Set();
        const uniq = [];
        for (const s of data) {
          const key = norm(s?.title);
          if (!seen.has(key)) { seen.add(key); uniq.push(s); }
        }
        setStudies(uniq);
      } else {
        setStudies(data);
      }
      setError(null);
    } catch (err) {
      console.error('Error fetching studies:', err);
      setError('Failed to load studies. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  // Fetch distinct owner slugs from existing rows to populate selector
  const fetchOwnerOptions = async () => {
    try {
      const { data, error } = await supabase
        .from('bible_studies')
        .select('owner_slug');
      if (!error && Array.isArray(data)) {
        const uniques = Array.from(new Set([
          '__ALL__',
          (ownerSlug || '').toLowerCase(),
          'faithtalkai',
          'default',
          ...data
            .map(r => (r?.owner_slug || '').trim().toLowerCase())
            .filter(Boolean),
        ]));
        setOwnerOptions(uniques);
      }
    } catch (e) {
      // Non-fatal; keep defaults
    }
  };
  
  // Fetch characters for dropdown
  const fetchCharacters = async () => {
    try {
      const data = await characterRepository.getAll();
      setCharacters(data);
    } catch (err) {
      console.error('Error fetching characters:', err);
    }
  };
  
  // Fetch lessons for a study
  const fetchLessons = async (studyId) => {
    try {
      const data = await bibleStudiesRepository.listLessons(studyId);
      setLessons(data);
    } catch (err) {
      console.error('Error fetching lessons:', err);
    }
  };

  // Export: download two CSVs for current owner selection
  const handleExportCsv = async () => {
    try {
      setIsLoading(true);
      const wantAll = ownerSlug === '__ALL__';
      const exportStudies = await bibleStudiesRepository.listStudies({ ownerSlug, includePrivate: true, allOwners: wantAll });
      const studyIds = exportStudies.map(s => s.id);
      // Fetch all lessons for these studies
      let exportLessons = [];
      if (studyIds.length) {
        const { data, error } = await supabase
          .from('bible_study_lessons')
          .select('*')
          .in('study_id', studyIds)
          .order('study_id')
          .order('order_index');
        if (!error && Array.isArray(data)) exportLessons = data;
      }

      const charMap = new Map((await characterRepository.getAll()).map(c => [c.id, c.name]));

      const studiesRows = exportStudies.map(s => ({
        id: s.id || '',
        study_key: '', // optional external key for linking on import
        owner_slug: s.owner_slug || ownerSlug || '',
        title: s.title || '',
        description: s.description || '',
        subject: s.subject || '',
        study_type: s.study_type || 'standalone',
        character_id: s.character_id || '',
        character_name: s.character_id ? (charMap.get(s.character_id) || '') : '',
        visibility: s.visibility || 'public',
        is_premium: !!s.is_premium,
        cover_image_url: s.cover_image_url || '',
        character_instructions: s.character_instructions || ''
      }));

      const lessonsRows = exportLessons.map(l => ({
        id: l.id || '',
        study_id: l.study_id || '',
        study_key: '', // optional external key alternative to study_id
        order_index: l.order_index ?? 0,
        title: l.title || '',
        scripture_refs_json: JSON.stringify(Array.isArray(l.scripture_refs) ? l.scripture_refs : []),
        summary: l.summary || '',
        prompts_json: JSON.stringify(Array.isArray(l.prompts) ? l.prompts : []),
        character_id: l.character_id || '',
        character_name: l.character_id ? (charMap.get(l.character_id) || '') : ''
      }));

      const ts = new Date().toISOString().slice(0,19).replace(/[:T]/g,'-');
      download(`studies-${ts}.csv`, toCsv(studiesRows));
      download(`lessons-${ts}.csv`, toCsv(lessonsRows));
    } catch (e) {
      console.error('Export failed:', e);
      setError('Export failed: ' + (e?.message || e));
    } finally {
      setIsLoading(false);
    }
  };

  const handleImportChooseFiles = async (filesMap) => {
    try {
      const errs = [];
      const prev = importPreview || { studies: [], lessons: [] };
      const readFile = (f) => new Promise((res, rej) => {
        const fr = new FileReader();
        fr.onload = () => res(String(fr.result || ''));
        fr.onerror = (ev) => rej(ev);
        fr.readAsText(f);
      });
      const isBlobLike = (f) => !!(f && typeof f === 'object' && typeof f.size === 'number');

      let studiesRows = prev.studies;
      let lessonsRows = prev.lessons;

      if (isBlobLike(filesMap.studies)) {
        const csv = await readFile(filesMap.studies);
        studiesRows = csv ? await parseCsv(csv) : [];
      }
      if (isBlobLike(filesMap.lessons)) {
        const csv = await readFile(filesMap.lessons);
        lessonsRows = csv ? await parseCsv(csv) : [];
      }

      setImportPreview({ studies: studiesRows, lessons: lessonsRows, errors: errs });
    } catch (e) {
      console.error('Parse failed:', e);
      setImportPreview({ studies: [], lessons: [], errors: ['Failed to parse CSV files'] });
    }
  };

  const handleRunImport = async () => {
    if (!importPreview || importBusy) return;
    setImportBusy(true);
    const errors = [];
    try {
      // Character name fallback map
      const allChars = await characterRepository.getAll();
      const nameToId = new Map(allChars.map(c => [String(c.name || '').toLowerCase(), c.id]));

      // 1) Upsert studies
      const keyToId = new Map();
      for (const row of importPreview.studies) {
        try {
          const payload = {
            id: row.id || null,
            owner_slug: row.owner_slug || ownerSlug,
            title: row.title || '',
            description: row.description || '',
            subject: row.subject || '',
            study_type: (row.study_type || 'standalone').toLowerCase(),
            character_id: row.character_id || '',
            visibility: row.visibility || 'public',
            is_premium: String(row.is_premium) === 'true' || row.is_premium === true,
            cover_image_url: row.cover_image_url || '',
            character_instructions: row.character_instructions || ''
          };
          if (!payload.character_id && row.character_name) {
            const id = nameToId.get(String(row.character_name).toLowerCase());
            if (id) payload.character_id = id;
          }
          const saved = await bibleStudiesRepository.upsertStudy(payload);
          const savedId = saved?.id;
          if (row.study_key && savedId) keyToId.set(String(row.study_key), savedId);
        } catch (e) {
          errors.push(`Study failed: ${row.title || row.id || '(no id)'} – ${e.message || e}`);
        }
      }

      // 2) Upsert lessons
      for (const row of importPreview.lessons) {
        try {
          // Normalize keys for flexible header matching
          const normalize = (k) => String(k || '').trim().toLowerCase().replace(/[^a-z0-9]+/g, '_');
          const rowNorm = {};
          for (const [k, v] of Object.entries(row)) rowNorm[normalize(k)] = v;
          const get = (...keys) => {
            for (const k of keys) {
              const kk = normalize(k);
              if (kk in rowNorm) return rowNorm[kk];
            }
            return undefined;
          };

          let studyId = get('study_id') || '';
          const studyKey = get('study_key', 'study external key', 'study-external-key');
          if (!studyId && studyKey) {
            studyId = keyToId.get(String(studyKey)) || '';
          }
          if (!studyId) {
            errors.push(`Lesson "${row.title}" skipped: missing study_id/study_key`);
            continue;
          }
          let scripture = [];
          // Prefer PLAIN column if provided (user wants to type text)
          const sPlain = get(
            'scripture_refs',
            'scriptures',
            'scripture',
            'scripture_references',
            'scripture references',
            'verses'
          );
          if (sPlain && String(sPlain).trim()) {
            const raw = String(sPlain).trim();
            if (raw.startsWith('[') && raw.endsWith(']')) {
              // Try JSON first; if it fails, strip brackets and split
              try {
                const arr = JSON.parse(raw);
                if (Array.isArray(arr)) scripture = arr.map(x => String(x).trim()).filter(Boolean);
              } catch {
                const inner = raw.slice(1, -1);
                scripture = inner.split(/[,;\n]/).map(s => s.trim()).filter(Boolean);
              }
            } else {
              // Split on common delimiters; if none, single entry
              const parts = raw.split(/[,;\n]/).map(s => s.trim()).filter(Boolean);
              scripture = parts.length ? parts : [raw];
            }
          } else {
            // Otherwise, allow JSON alias columns; if not valid JSON, treat as plain text
            const sJson = get(
              'scripture_refs_json',
              'scriptures_json',
              'scripture_json',
              'scripture_references_json',
              'scripture references json'
            );
            if (sJson && String(sJson).trim()) {
              const raw = String(sJson).trim();
              if (raw.startsWith('[') || raw.startsWith('"[')) {
                // Looks like JSON
                try {
                  const arr = JSON.parse(raw);
                  if (Array.isArray(arr)) scripture = arr.map(x => String(x).trim()).filter(Boolean);
                } catch {
                  // JSON-ish but failed: strip outer brackets then split
                  const inner = raw.replace(/^"?\[/, '').replace(/\]"?$/, '');
                  scripture = inner.split(/[,;\n]/).map(s => s.trim().replace(/^"|"$/g, '')).filter(Boolean);
                }
              } else {
                // Plain string in a *_json column
                scripture = raw.split(/[,;\n]/).map(s => s.trim()).filter(Boolean);
              }
            }
          }

          let prompts = [];
          const pPlain = get('prompts', 'prompt', 'questions', 'discussion_questions', 'lesson_prompts');
          if (pPlain && String(pPlain).trim()) {
            const raw = String(pPlain).trim();
            if (raw.startsWith('[')) {
              // Looks like JSON; try parsing
              try {
                const pj = JSON.parse(raw);
                if (Array.isArray(pj)) prompts = pj;
              } catch {
                // Not valid JSON; treat as single-line prompt
                prompts = [raw];
              }
            } else {
              // Split by common separators; if none, single prompt
              const parts = raw.split(/[|;\n]/).map(s => s.trim()).filter(Boolean);
              prompts = parts.length ? parts : [raw];
            }
          } else {
            // Otherwise, allow JSON alias columns; if not valid JSON, treat as plain text
            const pJson = get('prompts_json', 'prompt_json', 'questions_json');
            if (pJson && String(pJson).trim()) {
              const raw = String(pJson).trim();
              if (raw.startsWith('[')) {
                try {
                  const p = JSON.parse(raw);
                  prompts = Array.isArray(p) ? p : [];
                } catch {
                  // JSON-ish but failed: treat as single/multi-line text
                  const parts = raw
                    .replace(/^\[/, '').replace(/\]$/, '')
                    .split(/[|;\n]/)
                    .map(s => s.trim().replace(/^"|"$/g, ''))
                    .filter(Boolean);
                  prompts = parts.length ? parts : [raw];
                }
              } else {
                const parts = raw.split(/[|;\n]/).map(s => s.trim()).filter(Boolean);
                prompts = parts.length ? parts : [raw];
              }
            }
          }
          // Normalize prompts to [{text}]
          prompts = prompts.map(x => (typeof x === 'string' ? { text: x } : x));

          const lessonPayload = {
            id: get('id') || null,
            study_id: studyId,
            order_index: parseInt(get('order_index') ?? 0, 10),
            title: get('title') || '',
            scripture_refs: scripture,
            summary: get('summary') || '',
            prompts,
            character_id: get('character_id') || ''
          };
          const characterName = get('character_name', 'lesson_character', 'guide_name');
          if (!lessonPayload.character_id && characterName) {
            const id = nameToId.get(String(characterName).toLowerCase());
            if (id) lessonPayload.character_id = id;
          }
          await bibleStudiesRepository.upsertLesson(lessonPayload);
        } catch (e) {
          errors.push(`Lesson failed: ${row.title || row.id || '(no id)'} – ${e.message || e}`);
        }
      }

      if (errors.length) {
        setImportPreview(prev => ({ ...prev, errors }));
        setError('Import completed with errors. See details in the dialog.');
      } else {
        setImportPreview({ studies: [], lessons: [], errors: [] });
        setShowImportModal(false);
      }
      await fetchStudies();
      if (selectedStudy) await fetchLessons(selectedStudy.id);
    } finally {
      setImportBusy(false);
    }
  };
  
  // Create or update a study
  const handleSaveStudy = async () => {
    try {
      const payload = { ...studyForm };
      
      // Convert boolean string to actual boolean
      if (typeof payload.is_premium === 'string') {
        payload.is_premium = payload.is_premium === 'true';
      }
      // ------------------------------------------------------------------
      // Ensure RLS-required field is present.  If the form omitted it (or
      // a legacy study row has it null), default to the current ownerSlug.
      // This prevents “row-level security” insert/update failures.
      // ------------------------------------------------------------------
      payload.owner_slug = payload.owner_slug || ownerSlug;
      
      await bibleStudiesRepository.upsertStudy(payload);
      await fetchStudies();
      setShowStudyForm(false);
      resetStudyForm();
    } catch (err) {
      console.error('Error saving study:', err);
      setError('Failed to save study: ' + err.message);
    }
  };

  // When the owner changes, refresh studies and reset selection/forms
  const handleOwnerChange = async (e) => {
    const value = e?.target ? e.target.value : String(e || '').trim();
    setOwnerSlug(value);
    setSelectedStudy(null);
    setSelectedLesson(null);
    await fetchStudies(value);
  };
  
  // Create or update a lesson
  const handleSaveLesson = async () => {
    try {
      const payload = { ...lessonForm };
      
      // Ensure order_index is a number
      payload.order_index = parseInt(payload.order_index, 10);
      
      // Convert scripture_refs string to array if needed
      if (typeof payload.scripture_refs === 'string') {
        payload.scripture_refs = payload.scripture_refs
          .split(',')
          .map(ref => ref.trim())
          .filter(ref => ref);
      }
      
      // Handle prompts as array of objects
      if (typeof payload.prompts === 'string') {
        try {
          payload.prompts = JSON.parse(payload.prompts);
        } catch (e) {
          // If not valid JSON, convert to array of text objects
          payload.prompts = payload.prompts
            .split('\n')
            .map(line => line.trim())
            .filter(line => line)
            .map(text => ({ text }));
        }
      }
      
      await bibleStudiesRepository.upsertLesson(payload);
      await fetchLessons(selectedStudy.id);
      setShowLessonForm(false);
      resetLessonForm();
    } catch (err) {
      console.error('Error saving lesson:', err);
      setError('Failed to save lesson: ' + err.message);
    }
  };
  
  // Delete a study
  const handleDeleteStudy = async (studyId) => {
    if (!window.confirm('Are you sure you want to delete this study? This action cannot be undone.')) {
      return;
    }
    
    try {
      const success = await bibleStudiesRepository.deleteStudy(studyId);
      if (success) {
        if (selectedStudy && selectedStudy.id === studyId) {
          setSelectedStudy(null);
        }
        await fetchStudies();
      } else {
        setError('Failed to delete study. You may not have permission.');
      }
    } catch (err) {
      console.error('Error deleting study:', err);
      setError('Failed to delete study: ' + err.message);
    }
  };

  // Distribute study to selected organizations
  const handleRunDistribute = async () => {
    try {
      if (!selectedStudy) return;
      setDistributeBusy(true);
      setDistributeResult(null);
      let targets = [];
      if (distributeForm.all) {
        targets = orgOptions.slice();
      } else {
        targets = distributeForm.ownersSelected.slice();
      }
      targets = Array.from(new Set((targets || []).map(s => String(s || '').trim().toLowerCase()).filter(Boolean)));
      if (!targets.length) {
        setDistributeResult({ ok: false, error: 'Select at least one organization' });
        return;
      }
      const res = await cloneStudyToOwners(selectedStudy.id, targets, { includeLessons: distributeForm.includeLessons });
      setDistributeResult(res);
    } catch (e) {
      setDistributeResult({ ok: false, error: e?.message || String(e) });
    } finally {
      setDistributeBusy(false);
    }
  };
  
  // Delete a lesson
  const handleDeleteLesson = async (lessonId) => {
    if (!window.confirm('Are you sure you want to delete this lesson? This action cannot be undone.')) {
      return;
    }
    
    try {
      const success = await bibleStudiesRepository.deleteLesson(lessonId);
      if (success) {
        if (selectedLesson && selectedLesson.id === lessonId) {
          setSelectedLesson(null);
        }
        await fetchLessons(selectedStudy.id);
      } else {
        setError('Failed to delete lesson. You may not have permission.');
      }
    } catch (err) {
      console.error('Error deleting lesson:', err);
      setError('Failed to delete lesson: ' + err.message);
    }
  };
  
  // Reset study form to defaults
  const resetStudyForm = () => {
    setStudyForm({
      id: null,
      owner_slug: ownerSlug,
      title: '',
      description: '',
      subject: '',
      character_instructions: '',
      character_id: '',
      cover_image_url: '',
      study_type: 'standalone',
      visibility: 'public',
      is_premium: false,
      is_featured: false,
      is_visible: true,
      category: '',
      display_order: 0
    });
  };
  
  // ============================================
  // Category, Featured, Visible, Drag-Drop handlers
  // ============================================
  
  const handleToggleFeatured = async (studyId, isFeatured) => {
    try {
      await bibleStudiesAdminRepository.toggleFeatured(studyId, isFeatured);
      setStudies(studies.map(s => s.id === studyId ? { ...s, is_featured: isFeatured } : s));
    } catch (err) {
      console.error('Error toggling featured:', err);
      setError('Failed to update featured status');
    }
  };

  const handleToggleVisible = async (studyId, isVisible) => {
    try {
      await bibleStudiesAdminRepository.toggleVisible(studyId, isVisible);
      setStudies(studies.map(s => s.id === studyId ? { ...s, is_visible: isVisible } : s));
    } catch (err) {
      console.error('Error toggling visibility:', err);
      setError('Failed to update visibility');
    }
  };

  const handleChangeCategory = async (studyId, category) => {
    try {
      await bibleStudiesAdminRepository.updateStudyCategory(studyId, category);
      setStudies(studies.map(s => s.id === studyId ? { ...s, category } : s));
    } catch (err) {
      console.error('Error updating category:', err);
      setError('Failed to update category');
    }
  };

  // Drag and drop handlers
  const handleDragStart = (e, index) => {
    setDragIndex(index);
    e.dataTransfer.effectAllowed = 'move';
  };

  const handleDragOver = (e, index) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
  };

  const handleDrop = async (e, dropIndex) => {
    e.preventDefault();
    if (dragIndex === null || dragIndex === dropIndex) return;

    const filteredStudies = getFilteredStudies();
    const newOrder = [...filteredStudies];
    const [removed] = newOrder.splice(dragIndex, 1);
    newOrder.splice(dropIndex, 0, removed);

    // Update display_order for all reordered studies
    try {
      await bibleStudiesAdminRepository.updateStudiesOrder(newOrder);
      await fetchStudies();
    } catch (err) {
      console.error('Error updating order:', err);
      setError('Failed to update order');
    }

    setDragIndex(null);
  };

  // Category CRUD handlers
  const handleCreateCategory = async (category) => {
    try {
      await bibleStudyCategoriesRepository.createCategory(category);
      await fetchCategories();
    } catch (err) {
      console.error('Error creating category:', err);
      setError('Failed to create category');
    }
  };

  const handleUpdateCategory = async (id, updates) => {
    try {
      await bibleStudyCategoriesRepository.updateCategory(id, updates);
      await fetchCategories();
    } catch (err) {
      console.error('Error updating category:', err);
      setError('Failed to update category');
    }
  };

  const handleDeleteCategory = async (id) => {
    if (!window.confirm('Delete this category? Studies in this category will become uncategorized.')) return;
    try {
      await bibleStudyCategoriesRepository.deleteCategory(id);
      await fetchCategories();
    } catch (err) {
      console.error('Error deleting category:', err);
      setError('Failed to delete category');
    }
  };

  // Filter studies by search and category
  const getFilteredStudies = () => {
    return studies.filter(s => {
      const matchesSearch = !searchQuery || 
        s.title?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        s.description?.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesCategory = !filterCategory || s.category === filterCategory;
      return matchesSearch && matchesCategory;
    });
  };
  
  // Reset lesson form to defaults
  const resetLessonForm = () => {
    setLessonForm({
      id: null,
      study_id: selectedStudy ? selectedStudy.id : '',
      order_index: lessons.length,
      title: '',
      scripture_refs: [],
      summary: '',
      prompts: [],
      character_id: ''
    });
  };
  
  // Edit an existing study
  const handleEditStudy = (study) => {
    setStudyForm({
      ...study,
      subject: study.subject || '',
      character_instructions: study.character_instructions || '',
      study_type: study.study_type || 'standalone',
      is_premium: study.is_premium ? 'true' : 'false',
      is_featured: study.is_featured || false,
      is_visible: study.is_visible !== false, // default to true if undefined
      category: study.category || '',
      display_order: study.display_order || 0
    });
    setShowStudyForm(true);
  };
  
  // Edit an existing lesson
  const handleEditLesson = (lesson) => {
    // Format prompts for editing
    let formattedPrompts = lesson.prompts;
    if (Array.isArray(lesson.prompts)) {
      if (lesson.prompts.length > 0 && typeof lesson.prompts[0] === 'object') {
        formattedPrompts = lesson.prompts
          .map(p => p.text || '')
          .join('\n');
      }
    }
    
    setLessonForm({
      ...lesson,
      prompts: formattedPrompts,
      character_id: lesson.character_id || ''
    });
    setShowLessonForm(true);
  };
  
  // Create a new study
  const handleNewStudy = () => {
    resetStudyForm();
    setShowStudyForm(true);
  };
  
  // Create a new lesson
  const handleNewLesson = () => {
    resetLessonForm();
    setShowLessonForm(true);
  };
  
  /* ------------------------------------------------------------------
   *  Render helpers
   * ------------------------------------------------------------------ */
  const inner = (
    _jsxs("div", {
      className: "max-w-6xl mx-auto",
      children: [
        /* Optional breadcrumb when standalone */
        !embedded && (
          _jsx("div", {
            className: "mb-4",
            children: _jsx("a", {
              href: "/admin",
              className: "text-blue-200 hover:text-yellow-300",
              children: "← Back to Admin"
            })
          })
        ),

        /* Header */
        _jsxs("div", {
          className: "mb-8",
          children: [
            _jsx("h1", {
              className: `text-3xl md:text-4xl font-extrabold ${embedded ? 'text-gray-800' : 'text-yellow-400'} mb-2 tracking-tight drop-shadow-lg`,
              style: { fontFamily: 'Cinzel, serif' },
              children: "Bible Studies Administration"
            }),
            _jsx("p", {
              className: `${embedded ? 'text-gray-600' : 'text-blue-100'}`,
              children: "Manage character-directed Bible studies and lessons"
            })
          ]
        }),

        /* Owner selector (visible only to superadmin) */
        _jsx("div", {
          className: embedded ? "mb-6 bg-white rounded-lg p-4 border border-gray-200 shadow-md" : "mb-6 bg-white/10 backdrop-blur-sm rounded-xl p-4 border border-white/15 shadow-lg",
          children: (role === 'superadmin') && _jsxs("div", { className: "flex items-center gap-2", children: [
            _jsx("label", { className: embedded ? "text-sm text-gray-700" : "text-sm text-blue-200", children: "Owner" }),
            _jsxs("select", {
              value: ownerSlug,
              onChange: handleOwnerChange,
              className: embedded
                ? "text-sm bg-white border border-gray-300 text-gray-900 rounded-md py-1 px-2"
                : "text-sm bg-white/80 text-blue-900 rounded-md py-1 px-2",
              children: ownerOptions.map(opt => (
                _jsx("option", { value: opt, children: opt === '__ALL__' ? 'All owners' : opt }, `owner-${opt}`)
              ))
            })
          ] })
        }),
        
        /* Error message – enhanced visibility + RLS guidance */
        error &&
          (() => {
            const lower = String(error).toLowerCase();
            const isRls =
              lower.includes('row level security') ||
              lower.includes('permission') ||
              lower.includes('rls');
            const baseClasses = embedded
              ? 'bg-red-100 border border-red-300 text-red-700'
              : 'bg-red-500/20 border border-red-500/50 text-red-200';

            return (
              _jsxs("div", {
                className: `${baseClasses} px-4 py-3 rounded-lg mb-6`,
                children: [
                  _jsx("p", { children: error }),
                  isRls && (
                    _jsxs("div", {
                      className: `${
                        embedded
                          ? 'bg-red-50 text-red-700'
                          : 'bg-red-900/30 text-red-200'
                      } mt-4 p-3 rounded-lg`,
                      children: [
                        _jsx("h4", {
                          className: "font-semibold mb-2",
                          children: "Permission help"
                        }),
                        _jsxs("ul", {
                          className: "list-disc list-inside space-y-1 text-sm",
                          children: [
                            _jsx("li", {
                              children:
                                "Ensure you are logged in as an admin with the correct organization"
                            }),
                            _jsx("li", {
                              children:
                                "Set owner_slug in the form to your organization (e.g., grace-church)"
                            }),
                            _jsx("li", {
                              children:
                                "In Supabase, add an INSERT policy on bible_studies allowing admins to insert rows where owner_slug = auth.jwt() ->> 'owner_slug' OR matches the user's profile"
                            }),
                            _jsx("li", {
                              children:
                                "After updating policies, reload this page"
                            })
                          ]
                        })
                      ]
                    })
                  )
                ]
              })
            );
          })(),
        
        /* Main content area */
        _jsxs("div", {
          className: "grid grid-cols-1 lg:grid-cols-3 gap-6",
          children: [
            /* Studies list panel */
            _jsxs("div", {
              className: embedded ? "bg-white rounded-lg p-6 border border-gray-200 shadow-md" : "bg-white/10 backdrop-blur-sm rounded-xl p-6 border border-white/15 shadow-lg",
              children: [
                /* Tabs for Studies vs Categories */
                _jsxs("div", {
                  className: "flex gap-2 mb-4 border-b border-gray-200",
                  children: [
                    _jsx("button", {
                      onClick: () => setActiveTab('studies'),
                      className: `px-4 py-2 text-sm font-medium border-b-2 ${
                        activeTab === 'studies' 
                          ? 'border-blue-500 text-blue-600' 
                          : 'border-transparent text-gray-500 hover:text-gray-700'
                      }`,
                      children: "Studies"
                    }),
                    _jsx("button", {
                      onClick: () => setActiveTab('categories'),
                      className: `px-4 py-2 text-sm font-medium border-b-2 ${
                        activeTab === 'categories' 
                          ? 'border-blue-500 text-blue-600' 
                          : 'border-transparent text-gray-500 hover:text-gray-700'
                      }`,
                      children: "Categories"
                    })
                  ]
                }),
                
                /* Categories Tab Content */
                activeTab === 'categories' ? (
                  _jsxs("div", {
                    children: [
                      _jsx("h3", {
                        className: `text-lg font-bold mb-4 ${embedded ? 'text-gray-800' : 'text-yellow-400'}`,
                        children: "Manage Categories"
                      }),
                      _jsx(CategoryManager, {
                        categories: categories,
                        onUpdate: handleUpdateCategory,
                        onDelete: handleDeleteCategory,
                        onCreate: handleCreateCategory
                      })
                    ]
                  })
                ) : (
                  _jsxs(_Fragment, {
                    children: [
                      _jsxs("div", {
                        className: "flex justify-between items-center mb-4",
                        children: [
                          _jsx("h2", {
                            className: `text-xl font-bold ${embedded ? 'text-gray-800' : 'text-yellow-400'}`,
                            children: "Bible Studies"
                          }),
                          _jsxs("div", { className: "flex gap-2", children: [
                            _jsx("button", {
                              onClick: handleExportCsv,
                              className: `${embedded ? 'bg-primary-50 border border-primary-300 text-primary-700 hover:bg-primary-100' : 'bg-yellow-500/20 border border-yellow-500/40 text-yellow-300 hover:bg-yellow-500/30'} px-3 py-1 rounded-lg text-sm`,
                              children: "Export CSV"
                            }),
                            _jsx("button", {
                              onClick: () => setShowImportModal(true),
                              className: `${embedded ? 'bg-primary-50 border border-primary-300 text-primary-700 hover:bg-primary-100' : 'bg-yellow-500/20 border border-yellow-500/40 text-yellow-300 hover:bg-yellow-500/30'} px-3 py-1 rounded-lg text-sm`,
                              children: "Import CSV"
                            }),
                            _jsx("button", {
                              onClick: handleNewStudy,
                              className: `${embedded ? 'bg-primary-600 hover:bg-primary-700' : 'bg-green-600 hover:bg-green-700'} text-white px-3 py-1 rounded-lg text-sm flex items-center`,
                              children: _jsxs(_Fragment, {
                                children: [
                                  _jsx("svg", {
                                    xmlns: "http://www.w3.org/2000/svg",
                                    className: "h-4 w-4 mr-1",
                                    viewBox: "0 0 20 20",
                                    fill: "currentColor",
                                    children: _jsx("path", {
                                      fillRule: "evenodd",
                                      d: "M10 5a1 1 0 011 1v3h3a1 1 0 110 2h-3v3a1 1 0 11-2 0v-3H6a1 1 0 110-2h3V6a1 1 0 011-1z",
                                      clipRule: "evenodd"
                                    })
                                  }),
                                  "New Study"
                                ]
                              })
                            })
                          ] })
                        ]
                      }),
                      
                      /* Search and filter */
                      _jsxs("div", {
                        className: "flex gap-2 mb-4",
                        children: [
                          _jsx("input", {
                            type: "text",
                            placeholder: "Search studies...",
                            value: searchQuery,
                            onChange: (e) => setSearchQuery(e.target.value),
                            className: `flex-1 px-3 py-2 text-sm border rounded-lg ${
                              embedded 
                                ? 'bg-white border-gray-300 text-gray-900' 
                                : 'bg-white/10 border-white/20 text-white placeholder-gray-400'
                            }`
                          }),
                          categories.length > 0 && _jsx("select", {
                            value: filterCategory,
                            onChange: (e) => setFilterCategory(e.target.value),
                            className: `px-3 py-2 text-sm border rounded-lg ${
                              embedded 
                                ? 'bg-white border-gray-300 text-gray-900' 
                                : 'bg-white/10 border-white/20 text-white'
                            }`,
                            children: [
                              _jsx("option", { value: '', children: 'All Categories' }),
                              ...categories.map(cat => _jsx("option", { key: cat.id, value: cat.slug, children: cat.name }))
                            ]
                          })
                        ]
                      }),
                
                /* Studies list */
                isLoading ? (
                  _jsx("div", {
                    className: "flex justify-center py-8",
                    children: _jsx("div", {
                      className: "animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-yellow-400"
                    })
                  })
                ) : studies.length === 0 ? (
                  _jsx("div", {
                    className: `text-center py-8 ${embedded ? 'text-gray-600' : 'text-blue-100'}`,
                    children: "No studies found. Create your first study!"
                  })
                ) : (
                  _jsx("div", {
                    className: "space-y-3 max-h-[60vh] overflow-y-auto pr-2",
                    children: getFilteredStudies().map(study => (
                      _jsxs("div", {
                        className: `
                          p-4 rounded-lg border transition-all cursor-pointer
                          ${selectedStudy?.id === study.id 
                            ? embedded ? 'bg-blue-50 border-primary-400' : 'bg-blue-700/50 border-yellow-400/50' 
                            : embedded ? 'bg-white border-gray-200 hover:bg-gray-50' : 'bg-white/5 border-white/10 hover:bg-white/10'}
                        `,
                        onClick: () => setSelectedStudy(study),
                        children: [
                          _jsxs("div", {
                            className: "flex justify-between items-start",
                            children: [
                              _jsx("h3", {
                                className: `font-semibold ${embedded ? 'text-gray-800' : 'text-yellow-300'} mb-1`,
                                children: study.title
                              }),
                              _jsxs("div", {
                                className: "flex space-x-1",
                                children: [
                                  _jsx("button", {
                                    onClick: (e) => {
                                      e.stopPropagation();
                                      handleEditStudy(study);
                                    },
                                    className: `${embedded ? 'text-blue-600 hover:text-blue-800' : 'text-blue-300 hover:text-blue-200'} p-1`,
                                    title: "Edit study",
                                    children: _jsx("svg", {
                                      xmlns: "http://www.w3.org/2000/svg",
                                      className: "h-4 w-4",
                                      viewBox: "0 0 20 20",
                                      fill: "currentColor",
                                      children: _jsx("path", {
                                        d: "M13.586 3.586a2 2 0 112.828 2.828l-.793.793-2.828-2.828.793-.793zM11.379 5.793L3 14.172V17h2.828l8.38-8.379-2.83-2.828z"
                                      })
                                    })
                                  }),
                                  (role === 'admin' || role === 'superadmin') && _jsx("button", {
                                    onClick: (e) => {
                                      e.stopPropagation();
                                      setSelectedStudy(study);
                                      setDistributeResult(null);
                                      setDistributeForm({ all: false, includeLessons: true, ownersSelected: [] });
                                      setShowDistributeModal(true);
                                    },
                                    className: `${embedded ? 'text-green-700 hover:text-green-900' : 'text-green-300 hover:text-green-200'} p-1`,
                                    title: "Distribute to organizations",
                                    children: _jsx("svg", {
                                      xmlns: "http://www.w3.org/2000/svg",
                                      className: "h-4 w-4",
                                      viewBox: "0 0 20 20",
                                      fill: "currentColor",
                                      children: _jsx("path", { d: "M3 10a1 1 0 011-1h3V6a1 1 0 112 0v3h3a1 1 0 110 2h-3v3a1 1 0 11-2 0v-3H4a1 1 0 01-1-1z" })
                                    })
                                  }),
                                  _jsx("button", {
                                    onClick: (e) => {
                                      e.stopPropagation();
                                      handleDeleteStudy(study.id);
                                    },
                                    className: "text-red-400 hover:text-red-300 p-1",
                                    title: "Delete study",
                                    children: _jsx("svg", {
                                      xmlns: "http://www.w3.org/2000/svg",
                                      className: "h-4 w-4",
                                      viewBox: "0 0 20 20",
                                      fill: "currentColor",
                                      children: _jsx("path", {
                                        fillRule: "evenodd",
                                        d: "M9 2a1 1 0 00-.894.553L7.382 4H4a1 1 0 000 2v10a2 2 0 002 2h8a2 2 0 002-2V6a1 1 0 100-2h-3.382l-.724-1.447A1 1 0 0011 2H9zM7 8a1 1 0 012 0v6a1 1 0 11-2 0V8zm5-1a1 1 0 00-1 1v6a1 1 0 102 0V8a1 1 0 00-1-1z",
                                        clipRule: "evenodd"
                                      })
                                    })
                                  })
                                ]
                              })
                            ]
                          }),
                          _jsx("p", {
                            className: `text-sm ${embedded ? 'text-gray-600' : 'text-blue-100'} line-clamp-2 mb-2`,
                            children: study.description
                          }),
                          _jsxs("div", {
                            className: "flex flex-wrap gap-2 mt-2",
                            children: [
                              _jsx("span", {
                                className: `text-xs px-2 py-0.5 rounded-full ${
                                  embedded 
                                    ? (study.visibility === 'public' 
                                        ? 'bg-blue-100 text-blue-800 border border-blue-200' 
                                        : 'bg-gray-100 text-gray-800 border border-gray-200')
                                    : (study.visibility === 'public'
                                        ? 'bg-green-500/20 text-green-300 border border-green-500/30'
                                        : 'bg-blue-500/20 text-blue-300 border border-blue-500/30')
                                }`,
                                children: study.visibility
                              }),
                              study.is_premium && (
                                _jsx("span", {
                                  className: `text-xs px-2 py-0.5 rounded-full ${
                                    embedded 
                                      ? 'bg-blue-100 text-blue-800 border border-blue-200' 
                                      : 'bg-yellow-500/20 text-yellow-300 border border-yellow-500/30'
                                  }`,
                                  children: "Premium"
                                })
                              ),
                              study.is_featured && (
                                _jsx("span", {
                                  className: `text-xs px-2 py-0.5 rounded-full ${
                                    embedded 
                                      ? 'bg-yellow-100 text-yellow-800 border border-yellow-200' 
                                      : 'bg-yellow-500/30 text-yellow-200 border border-yellow-400/40'
                                  }`,
                                  children: "Featured"
                                })
                              ),
                              study.is_visible === false && (
                                _jsx("span", {
                                  className: `text-xs px-2 py-0.5 rounded-full ${
                                    embedded 
                                      ? 'bg-red-100 text-red-800 border border-red-200' 
                                      : 'bg-red-500/30 text-red-200 border border-red-400/40'
                                  }`,
                                  children: "Hidden"
                                })
                              ),
                              study.category && (
                                _jsx("span", {
                                  className: `text-xs px-2 py-0.5 rounded-full ${
                                    embedded 
                                      ? 'bg-purple-100 text-purple-800 border border-purple-200' 
                                      : 'bg-purple-500/30 text-purple-200 border border-purple-400/40'
                                  }`,
                                  children: study.category
                                })
                              )
                            ]
                          }),
                          /* Quick action buttons for organizing */
                          _jsxs("div", {
                            className: "flex items-center gap-2 mt-2 pt-2 border-t border-gray-200/20",
                            children: [
                              _jsx("button", {
                                onClick: (e) => {
                                  e.stopPropagation();
                                  handleToggleFeatured(study.id, !study.is_featured);
                                },
                                className: `text-xs px-2 py-1 rounded ${
                                  study.is_featured 
                                    ? 'bg-yellow-500 text-white' 
                                    : embedded ? 'bg-gray-100 text-gray-600 hover:bg-yellow-100' : 'bg-white/10 text-gray-300 hover:bg-yellow-500/30'
                                }`,
                                title: study.is_featured ? 'Remove from Featured' : 'Mark as Featured',
                                children: study.is_featured ? '★ Featured' : '☆ Feature'
                              }),
                              _jsx("button", {
                                onClick: (e) => {
                                  e.stopPropagation();
                                  handleToggleVisible(study.id, study.is_visible === false);
                                },
                                className: `text-xs px-2 py-1 rounded ${
                                  study.is_visible === false 
                                    ? 'bg-red-500 text-white' 
                                    : embedded ? 'bg-gray-100 text-gray-600 hover:bg-green-100' : 'bg-white/10 text-gray-300 hover:bg-green-500/30'
                                }`,
                                title: study.is_visible === false ? 'Make Visible' : 'Hide',
                                children: study.is_visible === false ? '👁 Show' : '👁 Visible'
                              }),
                              categories.length > 0 && _jsx("select", {
                                value: study.category || '',
                                onClick: (e) => e.stopPropagation(),
                                onChange: (e) => {
                                  e.stopPropagation();
                                  handleChangeCategory(study.id, e.target.value);
                                },
                                className: `text-xs px-2 py-1 rounded border ${
                                  embedded 
                                    ? 'bg-white border-gray-300 text-gray-700' 
                                    : 'bg-white/10 border-white/20 text-gray-200'
                                }`,
                                children: [
                                  _jsx("option", { value: '', children: 'No Category' }),
                                  ...categories.map(cat => _jsx("option", { key: cat.id, value: cat.slug, children: cat.name }))
                                ]
                              })
                            ]
                          })
                        ]
                      }, study.id)
                    ))
                  })
                )
                    ]
                  })
                )
              ]
            }),
            
            /* Lessons panel (shows when study is selected) */
            _jsxs("div", {
              className: "lg:col-span-2",
              children: [
                selectedStudy ? (
                  _jsxs("div", {
                    className: embedded ? "bg-white rounded-lg p-6 border border-gray-200 shadow-md" : "bg-white/10 backdrop-blur-sm rounded-xl p-6 border border-white/15 shadow-lg",
                    children: [
                      _jsxs("div", {
                        className: "flex justify-between items-center mb-6",
                        children: [
                          _jsxs("div", {
                            children: [
                              _jsx("h2", {
                                className: `text-xl font-bold ${embedded ? 'text-gray-800' : 'text-yellow-400'}`,
                                children: "Lessons"
                              }),
                              _jsxs("p", {
                                className: `${embedded ? 'text-gray-500' : 'text-blue-200'}`,
                                children: [
                                  "Study: ",
                                  _jsx("span", {
                                    className: "font-semibold",
                                    children: selectedStudy.title
                                  })
                                ]
                              })
                            ]
                          }),
                          _jsx("button", {
                            onClick: handleNewLesson,
                            className: `${embedded ? 'bg-primary-600 hover:bg-primary-700' : 'bg-green-600 hover:bg-green-700'} text-white px-3 py-1 rounded-lg text-sm flex items-center`,
                            children: _jsxs(_Fragment, {
                              children: [
                                _jsx("svg", {
                                  xmlns: "http://www.w3.org/2000/svg",
                                  className: "h-4 w-4 mr-1",
                                  viewBox: "0 0 20 20",
                                  fill: "currentColor",
                                  children: _jsx("path", {
                                    fillRule: "evenodd",
                                    d: "M10 5a1 1 0 011 1v3h3a1 1 0 110 2h-3v3a1 1 0 11-2 0v-3H6a1 1 0 110-2h3V6a1 1 0 011-1z",
                                    clipRule: "evenodd"
                                  })
                                }),
                                "New Lesson"
                              ]
                            })
                          })
                        ]
                      }),
                      
                      /* Lessons list */
                      lessons.length === 0 ? (
                        _jsx("div", {
                          className: `text-center py-8 ${embedded ? 'text-gray-600' : 'text-blue-100'}`,
                          children: "No lessons found. Create your first lesson!"
                        })
                      ) : (
                        _jsx("div", {
                          className: "space-y-4 max-h-[60vh] overflow-y-auto pr-2",
                          children: lessons
                            .sort((a, b) => a.order_index - b.order_index)
                            .map(lesson => (
                            _jsxs("div", {
                              className: embedded ? "bg-gray-50 rounded-lg p-4 border border-gray-200" : "bg-white/5 rounded-lg p-4 border border-white/10",
                              children: [
                                _jsxs("div", {
                                  className: "flex justify-between items-start",
                                  children: [
                                    _jsxs("h3", {
                                      className: `font-semibold ${embedded ? 'text-gray-800' : 'text-yellow-300'} mb-1`,
                                      children: [
                                        "Lesson ", lesson.order_index + 1, ": ", lesson.title,
                                        lesson.character_id ? _jsx("span", { className: embedded ? "ml-2 text-xs text-blue-700" : "ml-2 text-xs text-blue-300", children: "(Has guide)" }) : null
                                      ]
                                    }),
                                    _jsxs("div", {
                                      className: "flex space-x-1",
                                      children: [
                                        _jsx("button", {
                                          onClick: () => handleEditLesson(lesson),
                                          className: `${embedded ? 'text-blue-600 hover:text-blue-800' : 'text-blue-300 hover:text-blue-200'} p-1`,
                                          title: "Edit lesson",
                                          children: _jsx("svg", {
                                            xmlns: "http://www.w3.org/2000/svg",
                                            className: "h-4 w-4",
                                            viewBox: "0 0 20 20",
                                            fill: "currentColor",
                                            children: _jsx("path", {
                                              d: "M13.586 3.586a2 2 0 112.828 2.828l-.793.793-2.828-2.828.793-.793zM11.379 5.793L3 14.172V17h2.828l8.38-8.379-2.83-2.828z"
                                            })
                                          })
                                        }),
                                        _jsx("button", {
                                          onClick: () => handleDeleteLesson(lesson.id),
                                          className: "text-red-400 hover:text-red-300 p-1",
                                          title: "Delete lesson",
                                          children: _jsx("svg", {
                                            xmlns: "http://www.w3.org/2000/svg",
                                            className: "h-4 w-4",
                                            viewBox: "0 0 20 20",
                                            fill: "currentColor",
                                            children: _jsx("path", {
                                              fillRule: "evenodd",
                                              d: "M9 2a1 1 0 00-.894.553L7.382 4H4a1 1 0 000 2v10a2 2 0 002 2h8a2 2 0 002-2V6a1 1 0 100-2h-3.382l-.724-1.447A1 1 0 0011 2H9zM7 8a1 1 0 012 0v6a1 1 0 11-2 0V8zm5-1a1 1 0 00-1 1v6a1 1 0 102 0V8a1 1 0 00-1-1z",
                                              clipRule: "evenodd"
                                            })
                                          })
                                        })
                                      ]
                                    })
                                  ]
                                }),
                                
                                /* Scripture references */
                                lesson.scripture_refs && lesson.scripture_refs.length > 0 && (
                                  _jsxs("div", {
                                    className: "mt-2",
                                    children: [
                                      _jsx("span", {
                                        className: `text-xs ${embedded ? 'text-blue-600' : 'text-blue-300'}`,
                                        children: "Scripture:"
                                      }),
                                      _jsx("div", {
                                        className: "flex flex-wrap gap-1 mt-1",
                                        children: lesson.scripture_refs.map((ref, idx) => (
                                          _jsx("span", {
                                            className: embedded ? "bg-blue-100 text-blue-800 text-xs px-2 py-0.5 rounded-full border border-blue-200" : "bg-blue-500/20 text-blue-200 text-xs px-2 py-0.5 rounded-full",
                                            children: ref
                                          }, `ref-${idx}`)
                                        ))
                                      })
                                    ]
                                  })
                                ),
                                
                                /* Summary */
                                _jsx("p", {
                                  className: `text-sm ${embedded ? 'text-gray-600' : 'text-blue-100'} mt-2 line-clamp-2`,
                                  children: lesson.summary
                                }),
                                
                                /* Prompts count */
                                _jsxs("div", {
                                  className: `mt-2 text-xs ${embedded ? 'text-gray-500' : 'text-blue-300'}`,
                                  children: [
                                    "Prompts: ",
                                    Array.isArray(lesson.prompts) ? lesson.prompts.length : 0
                                  ]
                                })
                              ]
                            }, lesson.id)
                          ))
                        })
                      )
                    ]
                  })
                ) : (
                  _jsx("div", {
                    className: embedded ? "bg-white rounded-lg p-8 border border-gray-200 shadow-md flex items-center justify-center h-full" : "bg-white/10 backdrop-blur-sm rounded-xl p-8 border border-white/15 shadow-lg flex items-center justify-center h-full",
                    children: _jsx("p", {
                      className: `${embedded ? 'text-gray-500' : 'text-blue-200'} text-center`,
                      children: "Select a study to manage its lessons"
                    })
                  })
                )
              ]
            })
          ]
        })
      ]
    })
  );

  const page = embedded 
    ? inner 
    : (_jsx("div", {
        className: "min-h-screen bg-gradient-to-b from-blue-900 via-blue-800 to-blue-700 py-8 px-4 md:px-6",
        children: inner
      }));

  return (
    _jsxs(_Fragment, {
      children: [
        page,
        /* Import CSV Modal */
        showImportModal ? (
          _jsx("div", { className: "fixed inset-0 bg-black/70 flex items-center justify-center z-50 p-4", children: _jsxs("div", { className: "bg-blue-900 rounded-xl p-6 w-full max-w-3xl max-h-[90vh] overflow-y-auto", children: [
            _jsxs("div", { className: "flex justify-between items-center mb-6", children: [
              _jsx("h2", { className: "text-2xl font-bold text-yellow-400", children: "Import Studies & Lessons (CSV)" }),
              _jsx("button", { onClick: () => setShowImportModal(false), className: "text-white hover:text-yellow-300", children: _jsx("svg", { xmlns: "http://www.w3.org/2000/svg", className: "h-6 w-6", fill: "none", viewBox: "0 0 24 24", stroke: "currentColor", children: _jsx("path", { strokeLinecap: "round", strokeLinejoin: "round", strokeWidth: 2, d: "M6 18L18 6M6 6l12 12" }) }) })
            ] }),
            _jsx("p", { className: "text-blue-100 mb-4", children: "Upload two files: studies.csv and lessons.csv. For new records, leave 'id' blank. You can link lessons to new studies using a shared 'study_key'. Character can be set via 'character_id' or 'character_name'." }),
            _jsxs("div", { className: "grid grid-cols-1 md:grid-cols-2 gap-4", children: [
              _jsxs("div", { children: [
                _jsx("label", { className: "block text-blue-200 mb-1", children: "studies.csv" }),
                _jsx("input", { type: "file", accept: ".csv", onChange: async (e) => { await handleImportChooseFiles({ studies: e.target.files?.[0], lessons: null }); } , className: "w-full" })
              ] }),
              _jsxs("div", { children: [
                _jsx("label", { className: "block text-blue-200 mb-1", children: "lessons.csv" }),
                _jsx("input", { type: "file", accept: ".csv", onChange: async (e) => { await handleImportChooseFiles({ studies: importPreview.studies.length ? { name: 'kept' } : null, lessons: e.target.files?.[0] }); }, className: "w-full" })
              ] })
            ] }),
            _jsxs("div", { className: "mt-6 grid grid-cols-1 md:grid-cols-3 gap-4 text-sm", children: [
              _jsxs("div", { className: "bg-white/5 border border-white/10 rounded p-3", children: [ _jsx("div", { className: "text-blue-300", children: "Studies" }), _jsx("div", { className: "text-yellow-300 text-xl font-bold", children: importPreview.studies?.length || 0 }) ] }),
              _jsxs("div", { className: "bg-white/5 border border-white/10 rounded p-3", children: [ _jsx("div", { className: "text-blue-300", children: "Lessons" }), _jsx("div", { className: "text-yellow-300 text-xl font-bold", children: importPreview.lessons?.length || 0 }) ] }),
              _jsxs("div", { className: "bg-white/5 border border-white/10 rounded p-3", children: [ _jsx("div", { className: "text-blue-300", children: "Errors" }), _jsx("div", { className: "text-red-300 text-xl font-bold", children: importPreview.errors?.length || 0 }) ] })
            ] }),
            (importPreview.errors?.length ? _jsx("div", { className: "mt-4 bg-red-900/40 border border-red-600 rounded p-3 text-sm text-red-100 max-h-40 overflow-auto", children: _jsx("ul", { className: "list-disc list-inside", children: importPreview.errors.map((e,i) => _jsx("li", { children: e }, `err-${i}`)) }) }) : null),
            _jsxs("div", { className: "mt-6 flex justify-end gap-3", children: [
              _jsx("button", { onClick: () => setShowImportModal(false), className: "px-4 py-2 bg-gray-600 hover:bg-gray-700 text-white rounded-lg", children: "Cancel" }),
              _jsx("button", { onClick: handleRunImport, disabled: importBusy || (!importPreview.studies.length && !importPreview.lessons.length), className: `px-4 py-2 ${importBusy ? 'bg-yellow-500/40' : 'bg-yellow-400 hover:bg-yellow-300'} text-blue-900 rounded-lg font-semibold`, children: importBusy ? 'Importing…' : 'Run Import' })
            ] })
          ] }) })
        ) : null,
        showStudyForm ? (
          _jsx("div", {
            className: "fixed inset-0 bg-black/70 flex items-center justify-center z-50 p-4",
            children: _jsxs("div", {
              className: "bg-blue-900 rounded-xl p-6 w-full max-w-2xl max-h-[90vh] overflow-y-auto",
              children: [
                _jsxs("div", {
                  className: "flex justify-between items-center mb-6",
                  children: [
                    _jsx("h2", {
                      className: "text-2xl font-bold text-yellow-400",
                      children: studyForm.id ? "Edit Study" : "Create New Study"
                    }),
                    _jsx("button", {
                      onClick: () => setShowStudyForm(false),
                      className: "text-white hover:text-yellow-300",
                      children: _jsx("svg", {
                        xmlns: "http://www.w3.org/2000/svg",
                        className: "h-6 w-6",
                        fill: "none",
                        viewBox: "0 0 24 24",
                        stroke: "currentColor",
                        children: _jsx("path", {
                          strokeLinecap: "round",
                          strokeLinejoin: "round",
                          strokeWidth: 2,
                          d: "M6 18L18 6M6 6l12 12"
                        })
                      })
                    })
                  ]
                }),
                
                _jsxs("form", {
                  onSubmit: (e) => {
                    e.preventDefault();
                    handleSaveStudy();
                  },
                  className: "space-y-4",
                  children: [
                    _jsxs("div", {
                      children: [
                        _jsx("label", {
                          className: "block text-blue-200 mb-1",
                          children: "Title"
                        }),
                        _jsx("input", {
                          type: "text",
                          value: studyForm.title,
                          onChange: (e) => setStudyForm({...studyForm, title: e.target.value}),
                          className: "w-full bg-white border border-gray-300 text-gray-900 rounded-lg py-2 px-3 focus:border-primary-500 focus:ring-primary-500",
                          required: true
                        })
                      ]
                    }),
                    
                    _jsxs("div", {
                      children: [
                        _jsx("label", {
                          className: "block text-blue-200 mb-1",
                          children: "Description"
                        }),
                        _jsx("textarea", {
                          value: studyForm.description,
                          onChange: (e) => setStudyForm({...studyForm, description: e.target.value}),
                          className: "w-full bg-white border border-gray-300 text-gray-900 rounded-lg py-2 px-3 focus:border-primary-500 focus:ring-primary-500 h-24",
                          required: true
                        })
                      ]
                    }),
                    
                    /* Subject */
                    _jsxs("div", {
                      children: [
                        _jsx("label", {
                          className: "block text-blue-200 mb-1",
                          children: "Subject"
                        }),
                        _jsx("input", {
                          type: "text",
                          value: studyForm.subject,
                          onChange: (e) => setStudyForm({...studyForm, subject: e.target.value}),
                          className: "w-full bg-white border border-gray-300 text-gray-900 rounded-lg py-2 px-3 focus:border-primary-500 focus:ring-primary-500",
                          placeholder: "e.g., Sermon on the Mount"
                        })
                      ]
                    }),
                    
                    /* Study Prompt (Character Instructions) */
                    _jsxs("div", {
                      children: [
                        _jsx("label", {
                          className: "block text-blue-200 mb-1",
                          children: "Study Prompt (chat instructions)"
                        }),
                        _jsx("textarea", {
                          value: studyForm.character_instructions,
                          onChange: (e) => setStudyForm({...studyForm, character_instructions: e.target.value}),
                          className: "w-full bg-white border border-gray-300 text-gray-900 rounded-lg py-2 px-3 focus:border-primary-500 focus:ring-primary-500 h-24",
                          placeholder: "Special guidance or persona prompt for the guiding character"
                        })
                      ]
                    }),

                    /* Study Type */
                    _jsxs("div", {
                      children: [
                        _jsx("label", {
                          className: "block text-blue-200 mb-1",
                          children: "Study Type"
                        }),
                        _jsxs("select", {
                          value: studyForm.study_type || 'standalone',
                          onChange: (e) => setStudyForm({ ...studyForm, study_type: e.target.value }),
                          className: "w-full bg-white border border-gray-300 text-gray-900 rounded-lg py-2 px-3 focus:border-primary-500 focus:ring-primary-500",
                          children: [
                            _jsx("option", { value: "standalone", children: "Standalone" }),
                            _jsx("option", { value: "introduction", children: "Introduction (with lessons)" })
                          ]
                        }),
                        _jsx("p", { className: "text-xs text-blue-300 mt-1", children: "Standalone: 0+ lessons. Introduction: requires 1+ lessons (enforced when launching)." })
                      ]
                    }),
                    
                    _jsxs("div", {
                      children: [
                        _jsx("label", {
                          className: "block text-blue-200 mb-1",
                          children: "Character Guide"
                        }),
                        _jsxs("select", {
                          value: studyForm.character_id || '',
                          onChange: (e) => setStudyForm({...studyForm, character_id: e.target.value}),
                          className: "w-full bg-white border border-gray-300 text-gray-900 rounded-lg py-2 px-3 focus:border-primary-500 focus:ring-primary-500",
                          children: [
                            _jsx("option", { value: "", children: "-- Select a character --" }),
                            characters.map(character => (
                              _jsx("option", {
                                value: character.id,
                                children: character.name
                              }, character.id)
                            ))
                          ]
                        })
                      ]
                    }),
                    
                    _jsxs("div", {
                      children: [
                        _jsx("label", {
                          className: "block text-blue-200 mb-1",
                          children: "Cover Image URL"
                        }),
                        _jsx("input", {
                          type: "text",
                          value: studyForm.cover_image_url || '',
                          onChange: (e) => setStudyForm({...studyForm, cover_image_url: e.target.value}),
                          className: "w-full bg-white border border-gray-300 text-gray-900 rounded-lg py-2 px-3 focus:border-primary-500 focus:ring-primary-500",
                          placeholder: "https://example.com/image.jpg"
                        })
                      ]
                    }),
                    
                    _jsxs("div", {
                      className: "flex gap-6",
                      children: [
                        _jsxs("div", {
                          className: "flex-1",
                          children: [
                            _jsx("label", {
                              className: "block text-blue-200 mb-1",
                              children: "Visibility"
                            }),
                            _jsxs("select", {
                              value: studyForm.visibility,
                              onChange: (e) => setStudyForm({...studyForm, visibility: e.target.value}),
                              className: "w-full bg-white border border-gray-300 text-gray-900 rounded-lg py-2 px-3 focus:border-primary-500 focus:ring-primary-500",
                              children: [
                                _jsx("option", { value: "public", children: "Public" }),
                                _jsx("option", { value: "private", children: "Private" })
                              ]
                            })
                          ]
                        }),
                        
                        _jsxs("div", {
                          className: "flex-1",
                          children: [
                            _jsx("label", {
                              className: "block text-blue-200 mb-1",
                              children: "Premium"
                            }),
                            _jsxs("select", {
                              value: String(studyForm.is_premium),
                              onChange: (e) => setStudyForm({...studyForm, is_premium: e.target.value}),
                              className: "w-full bg-white border border-gray-300 text-gray-900 rounded-lg py-2 px-3 focus:border-primary-500 focus:ring-primary-500",
                              children: [
                                _jsx("option", { value: "false", children: "Free" }),
                                _jsx("option", { value: "true", children: "Premium Only" })
                              ]
                            })
                          ]
                        })
                      ]
                    }),
                    
                    _jsxs("div", {
                      className: "flex justify-end gap-3 pt-4",
                      children: [
                        _jsx("button", {
                          type: "button",
                          onClick: () => setShowStudyForm(false),
                          className: "px-4 py-2 bg-gray-600 hover:bg-gray-700 text-white rounded-lg",
                          children: "Cancel"
                        }),
                        _jsx("button", {
                          type: "submit",
                          className: "px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg",
                          children: "Save Study"
                        })
                      ]
                    })
                  ]
                })
              ]
            })
          })
        ) : null,
        
        showLessonForm ? (
          _jsx("div", {
            className: "fixed inset-0 bg-black/70 flex items-center justify-center z-50 p-4",
            children: _jsxs("div", {
              className: "bg-blue-900 rounded-xl p-6 w-full max-w-2xl max-h-[90vh] overflow-y-auto",
              children: [
                _jsxs("div", {
                  className: "flex justify-between items-center mb-6",
                  children: [
                    _jsx("h2", {
                      className: "text-2xl font-bold text-yellow-400",
                      children: lessonForm.id ? "Edit Lesson" : "Create New Lesson"
                    }),
                    _jsx("button", {
                      onClick: () => setShowLessonForm(false),
                      className: "text-white hover:text-yellow-300",
                      children: _jsx("svg", {
                        xmlns: "http://www.w3.org/2000/svg",
                        className: "h-6 w-6",
                        fill: "none",
                        viewBox: "0 0 24 24",
                        stroke: "currentColor",
                        children: _jsx("path", {
                          strokeLinecap: "round",
                          strokeLinejoin: "round",
                          strokeWidth: 2,
                          d: "M6 18L18 6M6 6l12 12"
                        })
                      })
                    })
                  ]
                }),
                
                _jsxs("form", {
                  onSubmit: (e) => {
                    e.preventDefault();
                    handleSaveLesson();
                  },
                  className: "space-y-4",
                  children: [
                    _jsxs("div", {
                      className: "flex gap-4",
                      children: [
                        _jsxs("div", {
                          className: "flex-1",
                          children: [
                            _jsx("label", {
                              className: "block text-blue-200 mb-1",
                              children: "Title"
                            }),
                            _jsx("input", {
                              type: "text",
                              value: lessonForm.title,
                              onChange: (e) => setLessonForm({...lessonForm, title: e.target.value}),
                              className: "w-full bg-white border border-gray-300 text-gray-900 rounded-lg py-2 px-3 focus:border-primary-500 focus:ring-primary-500",
                              required: true
                            })
                          ]
                        }),
                        
                        _jsxs("div", {
                          className: "w-24",
                          children: [
                            _jsx("label", {
                              className: "block text-blue-200 mb-1",
                              children: "Order"
                            }),
                            _jsx("input", {
                              type: "number",
                              min: "0",
                              value: lessonForm.order_index,
                              onChange: (e) => setLessonForm({...lessonForm, order_index: e.target.value}),
                              className: "w-full bg-white border border-gray-300 text-gray-900 rounded-lg py-2 px-3 focus:border-primary-500 focus:ring-primary-500",
                              required: true
                            })
                          ]
                        })
                      ]
                    }),
                    
                    _jsxs("div", {
                      children: [
                        _jsx("label", {
                          className: "block text-blue-200 mb-1",
                          children: "Scripture References (comma separated)"
                        }),
                        _jsx("input", {
                          type: "text",
                          value: Array.isArray(lessonForm.scripture_refs) 
                            ? lessonForm.scripture_refs.join(', ')
                            : lessonForm.scripture_refs || '',
                          onChange: (e) => setLessonForm({...lessonForm, scripture_refs: e.target.value}),
                          className: "w-full bg-white border border-gray-300 text-gray-900 rounded-lg py-2 px-3 focus:border-primary-500 focus:ring-primary-500",
                          placeholder: "Matthew 5:1-12, John 3:16"
                        })
                      ]
                    }),
                    
                    _jsxs("div", {
                      children: [
                        _jsx("label", {
                          className: "block text-blue-200 mb-1",
                          children: "Summary"
                        }),
                        _jsx("textarea", {
                          value: lessonForm.summary || '',
                          onChange: (e) => setLessonForm({...lessonForm, summary: e.target.value}),
                          className: "w-full bg-white border border-gray-300 text-gray-900 rounded-lg py-2 px-3 focus:border-primary-500 focus:ring-primary-500 h-24",
                          required: true
                        })
                      ]
                    }),

                    /* Lesson Character (optional; overrides study's guide) */
                    _jsxs("div", {
                      children: [
                        _jsx("label", { className: "block text-blue-200 mb-1", children: "Lesson Character (optional)" }),
                        _jsxs("select", {
                          value: lessonForm.character_id || '',
                          onChange: (e) => setLessonForm({ ...lessonForm, character_id: e.target.value }),
                          className: "w-full bg-white border border-gray-300 text-gray-900 rounded-lg py-2 px-3 focus:border-primary-500 focus:ring-primary-500",
                          children: [
                            _jsx("option", { value: "", children: "-- Inherit from study --" }),
                            characters.map(character => (
                              _jsx("option", { value: character.id, children: character.name }, character.id)
                            ))
                          ]
                        }),
                        _jsx("p", { className: "text-xs text-blue-300 mt-1", children: "If set, this lesson will be led by the selected character. Otherwise it inherits the study's character." })
                      ]
                    }),
                    
                    _jsxs("div", {
                      children: [
                        _jsxs("label", {
                          className: "block text-blue-200 mb-1",
                          children: [
                            "Prompts (one per line, or JSON array of objects with 'text' property)"
                          ]
                        }),
                        _jsx("textarea", {
                          value: typeof lessonForm.prompts === 'string'
                            ? lessonForm.prompts
                            : Array.isArray(lessonForm.prompts)
                              ? lessonForm.prompts.map(p => typeof p === 'object' ? p.text : p).join('\n')
                              : '',
                          onChange: (e) => setLessonForm({...lessonForm, prompts: e.target.value}),
                          className: "w-full bg-white border border-gray-300 text-gray-900 rounded-lg py-2 px-3 focus:border-primary-500 focus:ring-primary-500 h-32 font-mono text-sm",
                          placeholder: "What does this passage teach us about God?\nHow can we apply this to our lives today?"
                        }),
                        _jsx("p", {
                          className: "text-xs text-blue-300 mt-1",
                          children: "These will be used as suggested questions for the character to discuss with the user."
                        })
                      ]
                    }),
                    
                    _jsxs("div", {
                      className: "flex justify-end gap-3 pt-4",
                      children: [
                        _jsx("button", {
                          type: "button",
                          onClick: () => setShowLessonForm(false),
                          className: "px-4 py-2 bg-gray-600 hover:bg-gray-700 text-white rounded-lg",
                          children: "Cancel"
                        }),
                        _jsx("button", {
                          type: "submit",
                          className: "px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg",
                          children: "Save Lesson"
                        })
                      ]
                    })
                  ]
                })
              ]
            })
          })
        ) : null,
        
        /* Distribute Modal */
        showDistributeModal ? (
          _jsx("div", { className: "fixed inset-0 bg-black/70 flex items-center justify-center z-50 p-4", children: _jsxs("div", { className: "bg-blue-900 rounded-xl p-6 w-full max-w-2xl max-h-[90vh] overflow-y-auto", children: [
            _jsxs("div", { className: "flex justify-between items-center mb-6", children: [
              _jsx("h2", { className: "text-2xl font-bold text-yellow-400", children: "Distribute Study to Organizations" }),
              _jsx("button", { onClick: () => setShowDistributeModal(false), className: "text-white hover:text-yellow-300", children: _jsx("svg", { xmlns: "http://www.w3.org/2000/svg", className: "h-6 w-6", fill: "none", viewBox: "0 0 24 24", stroke: "currentColor", children: _jsx("path", { strokeLinecap: "round", strokeLinejoin: "round", strokeWidth: 2, d: "M6 18L18 6M6 6l12 12" }) }) })
            ] }),
            selectedStudy && _jsx("p", { className: "text-blue-100 mb-4", children: `Study: ${selectedStudy.title}` }),
            _jsxs("div", { className: "space-y-4", children: [
              _jsxs("label", { className: "flex items-center gap-2 text-blue-100", children: [
                _jsx("input", { type: "checkbox", checked: distributeForm.all, onChange: (e) => setDistributeForm(f => ({ ...f, all: e.target.checked })) }),
                _jsx("span", { children: "All organizations" })
              ] }),
              _jsxs("div", { children: [
                _jsx("div", { className: "text-blue-200 text-sm mb-1", children: "Select organizations" }),
                _jsx("div", { className: "max-h-48 overflow-auto bg-white/5 border border-white/10 rounded p-2", children: (orgOptions || []).map(slug => (
                  _jsxs("label", { className: `flex items-center gap-2 text-blue-100 py-1 ${distributeForm.all ? 'opacity-50' : ''}`, children: [
                    _jsx("input", { type: "checkbox", disabled: distributeForm.all, checked: distributeForm.ownersSelected.includes(slug), onChange: (e) => {
                      const checked = e.target.checked;
                      setDistributeForm(f => {
                        const set = new Set(f.ownersSelected);
                        if (checked) set.add(slug); else set.delete(slug);
                        return { ...f, ownersSelected: Array.from(set) };
                      });
                    } }),
                    _jsx("span", { children: slug })
                  ] }, `org-${slug}`)
                )) })
              ] }),
              _jsxs("label", { className: "flex items-center gap-2 text-blue-100", children: [
                _jsx("input", { type: "checkbox", checked: distributeForm.includeLessons, onChange: (e) => setDistributeForm(f => ({ ...f, includeLessons: e.target.checked })) }),
                _jsx("span", { children: "Include lessons" })
              ] })
            ] }),
            distributeResult && _jsxs("div", { className: "mt-4 bg-white/5 border border-white/10 rounded p-3 text-sm", children: [
              !distributeResult.ok && _jsx("div", { className: "text-red-300 mb-2", children: distributeResult.error || 'Failed' }),
              Array.isArray(distributeResult.results) && _jsx("div", { className: "space-y-1", children: distributeResult.results.map((r, i) => (
                _jsxs("div", { className: `flex justify-between ${r.ok ? 'text-green-300' : 'text-red-300'}`, children: [
                  _jsx("span", { children: r.owner }),
                  _jsx("span", { children: r.ok ? `Created (${r.title})` : r.error })
                ] }, `res-${i}`)
              )) })
            ] }),
            _jsxs("div", { className: "mt-6 flex justify-end gap-3", children: [
              _jsx("button", { onClick: () => setShowDistributeModal(false), className: "px-4 py-2 bg-gray-600 hover:bg-gray-700 text-white rounded-lg", children: "Close" }),
              _jsx("button", { onClick: handleRunDistribute, disabled: distributeBusy, className: `px-4 py-2 ${distributeBusy ? 'bg-yellow-500/40' : 'bg-yellow-400 hover:bg-yellow-300'} text-blue-900 rounded-lg font-semibold`, children: distributeBusy ? 'Distributing…' : 'Run' })
            ] })
          ] }) })
        ) : null
      ]
    })
  );
};

export default AdminStudiesPage;
