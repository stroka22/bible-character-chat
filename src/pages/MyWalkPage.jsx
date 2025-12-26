import React, { useEffect, useState, useMemo } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { useConversation } from '../contexts/ConversationContext.jsx';
import { characterRepository } from '../repositories/characterRepository';
import userFavoritesRepository from '../repositories/userFavoritesRepository';
import userSettingsRepository from '../repositories/userSettingsRepository';
import { bibleStudiesRepository } from '../repositories/bibleStudiesRepository';
import Header from '../components/Header';
import Footer from '../components/Footer';
import CharacterCard from '../components/CharacterCard.jsx';
import conversationRepository from '../repositories/conversationRepository';

const MyWalkPage = () => {
  const { user, loading, isAuthenticated } = useAuth();
  const {
    conversations = [],
    fetchConversations,
    fetchConversationWithMessages,
    updateConversation,
    deleteConversation,
    isLoading: conversationsLoading,
    error: conversationsError,
  } = useConversation() || {};

  // State for favorite characters
  const [favoriteCharacters, setFavoriteCharacters] = useState([]);
  const [favLoading, setFavLoading] = useState(true);
  const [featuredId, setFeaturedId] = useState(null);
  const [importing, setImporting] = useState(false);
  const [importSummary, setImportSummary] = useState(null);
  
  // State to track if we've attempted to load conversations
  const [hasAttemptedLoad, setHasAttemptedLoad] = useState(false);

  // State for Bible studies with progress
  const [userStudies, setUserStudies] = useState([]);
  const [studiesLoading, setStudiesLoading] = useState(false);

  // State for editing study labels
  const [editingStudyId, setEditingStudyId] = useState(null);
  const [studyLabel, setStudyLabel] = useState('');

  // State for renaming conversations
  const [renamingConversationId, setRenamingConversationId] = useState(null);
  const [newTitle, setNewTitle] = useState('');
  const [sortMode, setSortMode] = useState('recent'); // 'recent' | 'favorites'
  const [activeTab, setActiveTab] = useState('chats'); // 'chats' | 'roundtables' | 'studies'
  // Pagination
  const PAGE_SIZE = 10;
  const [currentPage, setCurrentPage] = useState(1);
  // Selection state for bulk actions (chats)
  const [selectedIds, setSelectedIds] = useState(() => new Set());
  // Selection state for roundtables bulk delete
  const [selectedRoundtableIds, setSelectedRoundtableIds] = useState(() => new Set());
  // Selection state for studies bulk delete
  const [selectedStudyIds, setSelectedStudyIds] = useState(() => new Set());

  const visibleIds = useMemo(() => new Set((conversations || []).map(c => c.id)), [conversations]);
  // Note: compute against conversations to avoid referencing sortedConversations before it's defined
  const allVisibleSelected = useMemo(() => {
    const list = Array.isArray(conversations) ? conversations : [];
    if (list.length === 0) return false;
    for (const c of list) if (!selectedIds.has(c.id)) return false;
    return true;
  }, [conversations, selectedIds]);

  const toggleSelect = (id) => {
    setSelectedIds(prev => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id); else next.add(id);
      return next;
    });
  };
  const clearSelection = () => setSelectedIds(new Set());
  const toggleSelectAllVisible = () => {
    const ids = (pagedConversations || []).map(c => c.id);
    setSelectedIds(prev => {
      const next = new Set(prev);
      const allSelected = ids.every(id => next.has(id));
      if (allSelected) {
        ids.forEach(id => next.delete(id));
      } else {
        ids.forEach(id => next.add(id));
      }
      return next;
    });
  };

  // Roundtable selection helpers
  const toggleSelectRoundtable = (id) => {
    setSelectedRoundtableIds(prev => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id); else next.add(id);
      return next;
    });
  };
  const clearRoundtableSelection = () => setSelectedRoundtableIds(new Set());

  // Study selection helpers
  const toggleSelectStudy = (progressId) => {
    setSelectedStudyIds(prev => {
      const next = new Set(prev);
      if (next.has(progressId)) next.delete(progressId); else next.add(progressId);
      return next;
    });
  };
  const clearStudySelection = () => setSelectedStudyIds(new Set());

  // Load favorite characters from server (fallback to localStorage)
  useEffect(() => {
    const loadFavorites = async () => {
      try {
        const allCharacters = await characterRepository.getAll();
        const favIds = await userFavoritesRepository.getFavoriteIds(user?.id);
        const favChars = allCharacters.filter((c) => favIds.includes(c.id));
        setFavoriteCharacters(favChars);
      } catch (e) {
        console.error('Failed loading favorite characters:', e);
      } finally {
        setFavLoading(false);
      }
    };
    loadFavorites();
  }, [user?.id]);

  // Load featured character id from server
  useEffect(() => {
    const run = async () => {
      try {
        const id = await userSettingsRepository.getFeaturedCharacterId(user?.id);
        setFeaturedId(id);
      } catch (e) {
        setFeaturedId(null);
      }
    };
    run();
  }, [user?.id]);

  // Fetch conversations when authenticated
  useEffect(() => {
    console.log('[MyWalkPage] useEffect for fetching conversations', { 
      isAuthenticated, 
      user: !!user,
      fetchConversationsExists: typeof fetchConversations === 'function' 
    });
    
    if (user && typeof fetchConversations === 'function') {
      console.log('[MyWalkPage] Fetching conversations');
      fetchConversations().finally(() => setHasAttemptedLoad(true));
    }
  }, [user, fetchConversations]);

  // Fetch Bible studies with progress when authenticated
  useEffect(() => {
    const loadUserStudies = async () => {
      if (!user?.id) {
        console.log('[MyWalkPage] No user ID, skipping study load');
        setUserStudies([]);
        return;
      }
      console.log('[MyWalkPage] Loading studies for user:', user.id);
      setStudiesLoading(true);
      try {
        const studies = await bibleStudiesRepository.getUserStudiesWithProgress(user.id);
        console.log('[MyWalkPage] Loaded studies:', studies);
        setUserStudies(studies || []);
      } catch (err) {
        console.error('[MyWalkPage] Error loading user studies:', err);
        setUserStudies([]);
      } finally {
        setStudiesLoading(false);
      }
    };
    loadUserStudies();
  }, [user?.id]);

  // Listen for cross-page conversation changes to refresh the list
  useEffect(() => {
    const handler = () => {
      if (typeof fetchConversations === 'function') {
        fetchConversations();
        setHasAttemptedLoad(true);
      }
    };
    window.addEventListener('conversations:changed', handler);
    return () => window.removeEventListener('conversations:changed', handler);
  }, [fetchConversations]);

  // Add a failsafe timeout to ensure hasAttemptedLoad gets set to true
  useEffect(() => {
    if (!hasAttemptedLoad) {
      console.log('[MyWalkPage] Setting up failsafe timeout for hasAttemptedLoad');
      const timer = setTimeout(() => {
        console.log('[MyWalkPage] Failsafe timeout triggered - setting hasAttemptedLoad to true');
        setHasAttemptedLoad(true);
      }, 3000); // 3 seconds timeout
      return () => clearTimeout(timer);
    }
  }, [hasAttemptedLoad]);

  // Toggle a character in favorites
  const handleToggleFavoriteCharacter = async (charId) => {
    try {
      const isFav = favoriteCharacters.some((c) => c.id === charId);
      await userFavoritesRepository.setFavorite(user?.id, charId, !isFav);
      // re-load list from server for truth
      const allCharacters = await characterRepository.getAll();
      const favIds = await userFavoritesRepository.getFavoriteIds(user?.id);
      const favChars = allCharacters.filter((c) => favIds.includes(c.id));
      setFavoriteCharacters(favChars);
    } catch (e) {
      console.error('Failed to toggle favorite:', e);
    }
  };

  // Copy transcript from a conversation (without navigating)
  const handleCopyTranscript = async (conv) => {
    try {
      if (!conv?.id || typeof fetchConversationWithMessages !== 'function') return;
      const full = await fetchConversationWithMessages(conv.id);
      if (!full) return;

      const lines = [];
      if (full.title) {
        lines.push(full.title);
        lines.push('');
      }

      const nameCache = new Map();
      const getNameById = async (id) => {
        const key = String(id);
        if (nameCache.has(key)) return nameCache.get(key);
        try {
          const c = await characterRepository.getById(key);
          const nm = c?.name || 'Assistant';
          nameCache.set(key, nm);
          return nm;
        } catch {
          nameCache.set(key, 'Assistant');
          return 'Assistant';
        }
      };

      const defaultAssistant = full?.characters?.name || 'Assistant';
      const msgs = Array.isArray(full.messages) ? [...full.messages] : [];
      msgs.sort((a, b) => {
        const da = a?.created_at ? new Date(a.created_at).getTime() : 0;
        const db = b?.created_at ? new Date(b.created_at).getTime() : 0;
        return da - db;
      });

      const namePrefixRx = /^\s*([A-Z][A-Za-z\s\-']{1,40})\s*[:\-–—]\s+/;
      for (const m of msgs) {
        if (!m?.content || String(m.content).trim() === '') continue;
        if (m.role === 'user') {
          lines.push(`You: ${m.content}`);
        } else {
          let speaker = defaultAssistant;
          const sid = m?.metadata?.speakerCharacterId || m?.metadata?.speaker_id || m?.metadata?.speakerId;
          if (sid) {
            try { speaker = await getNameById(sid); } catch {}
          } else if (m?.metadata?.speakerName) {
            speaker = m.metadata.speakerName;
          } else if (typeof m.content === 'string') {
            const mm = m.content.match(namePrefixRx);
            if (mm) speaker = mm[1];
          }
          lines.push(`${speaker}: ${m.content}`);
        }
      }

      const text = lines.join('\n');
      await navigator.clipboard.writeText(text);
    } catch (e) {
      console.warn('[MyWalkPage] Copy transcript failed:', e);
    }
  };

  // Handle setting a character as featured
  const handleSetAsFeatured = async (character) => {
    if (!character) return;
    
    try {
      await userSettingsRepository.setFeaturedCharacterId(user?.id, character.id);
      alert(`${character.name} is now your featured character across devices!`);
    } catch (error) {
      console.error('Error setting featured character:', error);
    }
  };

  // Detect local mock conversations for optional import
  const getLocalMockConversations = () => {
    try {
      const raw = localStorage.getItem('mockConversationStorage');
      if (!raw) return { conversations: [], messages: [] };
      const parsed = JSON.parse(raw);
      if (!parsed || !Array.isArray(parsed.conversations)) return { conversations: [], messages: [] };
      return {
        conversations: parsed.conversations || [],
        messages: parsed.messages || []
      };
    } catch {
      return { conversations: [], messages: [] };
    }
  };

  const handleImportLocalConversations = async () => {
    if (!user?.id) {
      alert('Please sign in to import local conversations.');
      return;
    }
    const { conversations: localConvs, messages: localMsgs } = getLocalMockConversations();
    if (!localConvs.length) {
      alert('No local conversations found to import.');
      return;
    }
    if (!window.confirm(`Import ${localConvs.length} local conversation(s) to your account?`)) return;

    setImporting(true);
    const results = { created: 0, failed: 0 };
    try {
      // Ensure we import into the real (Supabase) account by temporarily
      // disabling bypass mode for the duration of the import operation.
      const prevBypass = (() => {
        try { return localStorage.getItem('bypass_auth'); } catch { return null; }
      })();
      try { localStorage.setItem('bypass_auth', 'false'); } catch {}

      for (const conv of localConvs) {
        try {
          const created = await conversationRepository.createConversation({
            character_id: conv.character_id,
            title: conv.title || 'Conversation',
          });
          if (!created?.id) throw new Error('Create returned no id');
          const convMsgs = localMsgs
            .filter((m) => m.conversation_id === conv.id)
            .sort((a,b) => new Date(a.created_at) - new Date(b.created_at));
          for (const m of convMsgs) {
            await conversationRepository.addMessage({
              conversation_id: created.id,
              role: m.role,
              content: m.content,
              metadata: m.metadata || {}
            });
          }
          results.created += 1;
        } catch (e) {
          console.warn('Failed to import one conversation:', e);
          results.failed += 1;
        }
      }
      setImportSummary(results);
      // After import, refresh server list
      await fetchConversations?.();
      // Restore previous bypass mode exactly as it was
      try {
        if (prevBypass === 'true') {
          localStorage.setItem('bypass_auth', 'true');
        } else if (prevBypass === 'false') {
          localStorage.setItem('bypass_auth', 'false');
        } else {
          localStorage.removeItem('bypass_auth');
        }
      } catch {}

      // Offer to clear local storage copy only after a successful import
      const msg = `Import complete. Created: ${results.created}. Failed: ${results.failed}.`;
      if (results.created > 0 && window.confirm(`${msg}\n\nDelete the local copy now? (This cannot be undone)`)) {
        try { localStorage.removeItem('mockConversationStorage'); } catch {}
        alert('Local copy deleted.');
      } else {
        alert(msg);
      }
    } finally {
      setImporting(false);
    }
  };

  // Delete conversation handler
  const handleDeleteConversation = async (conversationId) => {
    if (!conversationId || typeof deleteConversation !== 'function') return;

    if (
      !window.confirm(
        'Are you sure you want to delete this conversation? This action cannot be undone.',
      )
    ) {
      return;
    }

    try {
      await deleteConversation(conversationId);
      // Refresh list
      fetchConversations?.();
    } catch (err) {
      console.error('Error deleting conversation:', err);
    }
  };

  // Delete study progress handler
  const handleDeleteStudyProgress = async (progressId) => {
    if (!progressId) return;
    if (!window.confirm('Remove this study from your list? Your progress will be deleted.')) return;
    try {
      const success = await bibleStudiesRepository.deleteProgress(progressId);
      if (success) {
        setUserStudies(prev => prev.filter(s => s.progressId !== progressId));
      }
    } catch (err) {
      console.error('Error deleting study progress:', err);
    }
  };

  // Update study label handler
  const handleUpdateStudyLabel = async (progressId) => {
    if (!progressId) return;
    try {
      await bibleStudiesRepository.updateProgressLabel(progressId, studyLabel.trim() || null);
      setUserStudies(prev => prev.map(s => 
        s.progressId === progressId 
          ? { ...s, progress: { ...s.progress, label: studyLabel.trim() || null } }
          : s
      ));
      setEditingStudyId(null);
      setStudyLabel('');
    } catch (err) {
      console.error('Error updating study label:', err);
    }
  };

  // Start study again with new progress record
  const handleStartStudyAgain = async (studyId, studyTitle) => {
    if (!user?.id || !studyId) return;
    const label = window.prompt(`Starting "${studyTitle}" again.\n\nEnter a label (e.g., "with Sarah", "January 2025"):`, '');
    if (label === null) return; // cancelled
    try {
      const newProgress = await bibleStudiesRepository.saveProgress({
        userId: user.id,
        studyId: studyId,
        currentLessonIndex: 0,
        completedLessons: [],
        label: label.trim() || null,
        createNew: true,  // Explicitly create a new progress record
      });
      if (newProgress) {
        // Reload studies to show the new one
        const studies = await bibleStudiesRepository.getUserStudiesWithProgress(user.id);
        setUserStudies(studies || []);
      }
    } catch (err) {
      console.error('Error starting study again:', err);
    }
  };

  // Bulk delete handler (chats)
  const handleBulkDelete = async () => {
    if (typeof deleteConversation !== 'function') return;
    const ids = Array.from(selectedIds).filter(id => visibleIds.has(id));
    if (ids.length === 0) return;
    if (!window.confirm(`Delete ${ids.length} conversation${ids.length>1?'s':''}? This cannot be undone.`)) return;
    try {
      for (const id of ids) {
        try { await deleteConversation(id); } catch (e) { console.warn('Failed to delete', id, e); }
      }
      clearSelection();
      await fetchConversations?.();
    } catch (e) {
      console.error('Bulk delete error:', e);
    }
  };

  // Bulk delete handler (roundtables)
  const handleBulkDeleteRoundtables = async () => {
    if (typeof deleteConversation !== 'function') return;
    const ids = Array.from(selectedRoundtableIds);
    if (ids.length === 0) return;
    if (!window.confirm(`Delete ${ids.length} roundtable${ids.length>1?'s':''}? This cannot be undone.`)) return;
    try {
      for (const id of ids) {
        try { await deleteConversation(id); } catch (e) { console.warn('Failed to delete roundtable', id, e); }
      }
      clearRoundtableSelection();
      await fetchConversations?.();
    } catch (e) {
      console.error('Bulk delete roundtables error:', e);
    }
  };

  // Bulk delete handler (studies)
  const handleBulkDeleteStudies = async () => {
    const ids = Array.from(selectedStudyIds);
    if (ids.length === 0) return;
    if (!window.confirm(`Remove ${ids.length} study progress record${ids.length>1?'s':''}? This cannot be undone.`)) return;
    try {
      for (const progressId of ids) {
        try { await bibleStudiesRepository.deleteProgress(progressId); } catch (e) { console.warn('Failed to delete study progress', progressId, e); }
      }
      clearStudySelection();
      // Reload studies
      if (user?.id) {
        const studies = await bibleStudiesRepository.getUserStudiesWithProgress(user.id);
        setUserStudies(studies || []);
      }
    } catch (e) {
      console.error('Bulk delete studies error:', e);
    }
  };

  // Helper: format date
  const formatDate = (iso) => {
    if (!iso) return '';
    try {
      return new Date(iso).toLocaleDateString(undefined, {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
      });
    } catch (e) {
      return 'Invalid date';
    }
  };

  // Helper to sort a list by favorites then date
  const sortList = (list) => {
    const sorted = [...list];
    if (sortMode === 'favorites') {
      sorted.sort((a, b) => {
        const favDelta = Number(!!b.is_favorite) - Number(!!a.is_favorite);
        if (favDelta !== 0) return favDelta;
        const da = new Date(a.updated_at || a.created_at || 0).getTime();
        const db = new Date(b.updated_at || b.created_at || 0).getTime();
        return db - da;
      });
    } else {
      sorted.sort((a, b) => {
        const da = new Date(a.updated_at || a.created_at || 0).getTime();
        const db = new Date(b.updated_at || b.created_at || 0).getTime();
        return db - da;
      });
    }
    return sorted;
  };

  // Separate conversations into three categories
  const { regularChats, roundtables, bibleStudies } = useMemo(() => {
    const all = conversations || [];
    return {
      regularChats: sortList(all.filter(c => !c.study_id && c.conversation_type !== 'roundtable')),
      roundtables: sortList(all.filter(c => c.conversation_type === 'roundtable')),
      bibleStudies: sortList(all.filter(c => c.study_id)),
    };
  }, [conversations, sortMode]);

  // For backward compatibility, keep sortedConversations pointing to regularChats
  const sortedConversations = regularChats;

  // Derive pagination
  const totalPages = useMemo(() => {
    const total = sortedConversations.length;
    return total === 0 ? 1 : Math.ceil(total / PAGE_SIZE);
  }, [sortedConversations.length]);
  const pagedConversations = useMemo(() => {
    const start = (currentPage - 1) * PAGE_SIZE;
    return sortedConversations.slice(start, start + PAGE_SIZE);
  }, [sortedConversations, currentPage]);

  // Clamp current page when data/sort changes
  useEffect(() => {
    const tp = Math.max(1, Math.ceil((sortedConversations.length || 0) / PAGE_SIZE));
    if (currentPage > tp) setCurrentPage(tp);
    if (currentPage < 1) setCurrentPage(1);
  }, [sortedConversations.length]);
  // Reset to page 1 on sort change or when conversations set changes significantly
  useEffect(() => { setCurrentPage(1); }, [sortMode]);

  // Placeholder when not logged in
  if (!user && !loading && hasAttemptedLoad) {
    return (
      <div className="min-h-screen bg-blue-900 text-white">
        <Header />
        <div className="container mx-auto px-4 py-8 pt-24">
          <div className="bg-[rgba(255,255,255,0.05)] rounded-lg p-8 text-center">
            <h3 className="text-xl font-semibold text-yellow-300 mb-4">
              Login Required
            </h3>
            <p className="text-blue-100 mb-6">
              Please log in to view your faith journey.
            </p>
            <Link
              to="/login"
              className="px-4 py-2 bg-yellow-400 text-blue-900 rounded-lg font-semibold hover:bg-yellow-300 transition-colors"
            >
              Log In
            </Link>
          </div>
        </div>
        <Footer />
      </div>
    );
  }

  // Show loading state while auth is still being determined
  if ((loading || favLoading || conversationsLoading) && !hasAttemptedLoad) {
    return (
      <div className="min-h-screen bg-blue-900 text-white">
        <Header />
        <div className="container mx-auto px-4 py-8 pt-24">
          <div className="flex justify-center my-12">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-yellow-400" />
          </div>
          <p className="text-center text-blue-100">Loading your faith journey...</p>
        </div>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-blue-900 text-white">
      <Header />
      <div className="container mx-auto px-4 py-8 pt-24">
        <div className="flex items-center justify-between mb-8">
          <h1 className="text-3xl font-bold text-yellow-300">My Faith Journey</h1>
          <Link
            to="/"
            className="px-4 py-2 bg-yellow-400 text-blue-900 rounded-lg font-semibold hover:bg-yellow-300 transition-colors"
          >
            Back to Home
          </Link>
        </div>

        {/* Local import banner if local mock data exists */}
        {import.meta?.env?.DEV && (() => {
          const { conversations: localConvs } = getLocalMockConversations();
          if (!user || !localConvs.length) return null;
          return (
            <div className="bg-amber-900/40 border border-amber-400/50 rounded-lg p-4 mb-6">
              <div className="flex items-center justify-between gap-3 flex-wrap">
                <div className="text-amber-100">
                  Detected {localConvs.length} local conversation{localConvs.length>1?'s':''}. Import them to your account so they’re available across devices.
                </div>
                <button
                  onClick={handleImportLocalConversations}
                  disabled={importing}
                  className="px-4 py-2 bg-yellow-400 text-blue-900 rounded-lg font-semibold hover:bg-yellow-300 transition-colors disabled:opacity-60"
                >
                  {importing ? 'Importing…' : `Import ${localConvs.length} conversation${localConvs.length>1?'s':''}`}
                </button>
              </div>
            </div>
          );
        })()}

        {/* Error block */}
        {conversationsError && (
          <div className="bg-red-900/50 border border-red-500 rounded-lg p-4 mb-6">
            <p className="text-red-200">{conversationsError}</p>
          </div>
        )}

        {/* Favorite Characters section */}
        {!favLoading && favoriteCharacters.length > 0 && (
          <section className="mb-10">
            <h2 className="text-2xl font-semibold text-yellow-300 mb-4">
              Favorite Characters
            </h2>
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
              {favoriteCharacters.map((char) => (
                <CharacterCard
                  key={char.id}
                  character={char}
                  onSelect={(c) => (window.location.href = `/chat?character=${c.id}`)}
                  isFavorite={true}
                  onToggleFavorite={() => handleToggleFavoriteCharacter(char.id)}
                  isFeatured={featuredId === char.id}
                  onSetAsFeatured={() => handleSetAsFeatured(char)}
                />
              ))}
            </div>
          </section>
        )}

        {/* Empty state for favorite characters */}
        {!favLoading && favoriteCharacters.length === 0 && (
          <section className="mb-10">
            <h2 className="text-2xl font-semibold text-yellow-300 mb-4">
              Favorite Characters
            </h2>
            <div className="bg-[rgba(255,255,255,0.05)] rounded-lg p-6 text-center">
              <p className="text-blue-100 mb-4">
                You haven't added any characters to your favorites yet.
              </p>
              <Link
                to="/"
                className="px-4 py-2 bg-yellow-400 text-blue-900 rounded-lg font-semibold hover:bg-yellow-300 transition-colors"
              >
                Browse Characters
              </Link>
            </div>
          </section>
        )}

        {/* Saved Conversations section */}
        <section>
          <div className="flex items-center justify-between mb-4 gap-3 flex-wrap">
            <h2 className="text-2xl font-semibold text-yellow-300">
              My Walk
            </h2>
            <div className="flex items-center gap-2">
              <label htmlFor="sortMode" className="text-blue-200 text-sm">Sort by</label>
              <select
                id="sortMode"
                value={sortMode}
                onChange={(e) => setSortMode(e.target.value)}
                className="bg-[rgba(255,255,255,0.08)] border border-[rgba(255,255,255,0.2)] text-white text-sm rounded-md px-2 py-1"
              >
                <option value="recent">Most Recent</option>
                <option value="favorites">Favorites First</option>
              </select>
            </div>
          </div>

          {/* Tab selector */}
          <div className="flex border-b border-[rgba(255,255,255,0.2)] mb-6">
            <button
              onClick={() => { setActiveTab('chats'); setCurrentPage(1); }}
              className={`px-4 py-2 text-sm font-medium transition-colors relative ${
                activeTab === 'chats'
                  ? 'text-yellow-300 border-b-2 border-yellow-400 -mb-[2px]'
                  : 'text-blue-200 hover:text-yellow-200'
              }`}
            >
              Chats ({regularChats.length})
            </button>
            <button
              onClick={() => { setActiveTab('roundtables'); setCurrentPage(1); }}
              className={`px-4 py-2 text-sm font-medium transition-colors relative ${
                activeTab === 'roundtables'
                  ? 'text-yellow-300 border-b-2 border-yellow-400 -mb-[2px]'
                  : 'text-blue-200 hover:text-yellow-200'
              }`}
            >
              Roundtables ({roundtables.length})
            </button>
            <button
              onClick={() => { setActiveTab('studies'); setCurrentPage(1); }}
              className={`px-4 py-2 text-sm font-medium transition-colors relative ${
                activeTab === 'studies'
                  ? 'text-yellow-300 border-b-2 border-yellow-400 -mb-[2px]'
                  : 'text-blue-200 hover:text-yellow-200'
              }`}
            >
              Bible Studies ({userStudies.length})
            </button>
          </div>

          {/* ===================== CHATS TAB ===================== */}
          {activeTab === 'chats' && (
            <>
              {/* Bulk actions toolbar */}
              {sortedConversations && sortedConversations.length > 0 && (
                <div className="flex items-center justify-between mb-3 gap-3 flex-wrap">
                  <label className="inline-flex items-center gap-2 text-blue-100 cursor-pointer select-none">
                    <input
                      type="checkbox"
                      checked={(() => {
                        const keys = (pagedConversations || []).map(c => c.id);
                        if (keys.length === 0) return false;
                        return keys.every(id => selectedIds.has(id));
                      })()}
                      onChange={toggleSelectAllVisible}
                      className="w-4 h-4 rounded border-blue-300"
                    />
                    <span className="text-sm">Select all (this page)</span>
                  </label>
                  <div className="flex items-center gap-2">
                    {selectedIds.size > 0 && (
                      <span className="text-blue-200 text-sm">{selectedIds.size} selected</span>
                    )}
                    <button
                      onClick={handleBulkDelete}
                      disabled={selectedIds.size === 0}
                      className={`px-3 py-1.5 rounded-md text-sm font-semibold border transition-colors ${
                        selectedIds.size === 0
                          ? 'border-gray-500 text-gray-400 cursor-not-allowed'
                          : 'border-red-500 text-red-200 hover:bg-red-500 hover:text-white'
                      }`}
                    >
                      Delete Selected
                    </button>
                  </div>
                </div>
              )}

              {/* Empty state for chats */}
              {!conversationsLoading && regularChats.length === 0 && (
            <div className="bg-[rgba(255,255,255,0.05)] rounded-lg p-6 text-center mb-6">
              <p className="text-blue-100 mb-4">
                You haven't saved any conversations yet. Start a chat with a biblical character to begin!
              </p>
              <Link
                to="/"
                className="px-4 py-2 bg-yellow-400 text-blue-900 rounded-lg font-semibold hover:bg-yellow-300 transition-colors"
              >
                Start a Conversation
              </Link>
            </div>
          )}

          {/* Chats list */}
          {sortedConversations && sortedConversations.length > 0 && (
            <div className="space-y-4">
              {pagedConversations.map(conv => (
                <div
                  key={conv.id}
                  className={`p-4 rounded-lg transition-colors ${
                    conv.is_favorite
                      ? 'bg-[rgba(255,223,118,0.08)] hover:bg-[rgba(255,223,118,0.12)] border border-yellow-400/30'
                      : 'bg-[rgba(255,255,255,0.05)] hover:bg-[rgba(255,255,255,0.1)]'
                  }`}
                >
                  {/* Header with title + rename */}
                  <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-1 mb-2">
                    {renamingConversationId === conv.id ? (
                      /* Rename input */
                      <div className="flex-1 flex items-center space-x-2">
                        <input
                          type="text"
                          value={newTitle}
                          onChange={(e) => setNewTitle(e.target.value)}
                          placeholder="Enter new title"
                          className="flex-1 p-1 text-blue-900 rounded border border-blue-400 focus:ring-2 focus:ring-blue-500 focus:outline-none"
                          autoFocus
                        />
                        <button
                          onClick={async () => {
                            if (!newTitle.trim()) return;
                            try {
                              await updateConversation(conv.id, { title: newTitle.trim() });
                            } catch (err) {
                              console.error('Error renaming conversation:', err);
                            } finally {
                              setRenamingConversationId(null);
                              setNewTitle('');
                            }
                          }}
                          className="px-2 py-1 bg-blue-500 text-white rounded hover:bg-blue-600"
                        >
                          Save
                        </button>
                        <button
                          onClick={() => {
                            setRenamingConversationId(null);
                            setNewTitle('');
                          }}
                          className="px-2 py-1 bg-gray-500 text-white rounded hover:bg-gray-600"
                        >
                          Cancel
                        </button>
                      </div>
                    ) : (
                      /* Normal title display */
                      <>
                        <h3 className="flex-1 text-xl font-semibold text-yellow-300 flex items-center">
                          <input
                            type="checkbox"
                            checked={selectedIds.has(conv.id)}
                            onChange={(e) => { e.stopPropagation(); toggleSelect(conv.id); }}
                            className="mr-3 w-4 h-4 rounded border-blue-300"
                            title="Select conversation"
                          />
                          {conv.title || 'Untitled Conversation'}
                          {/* ⭐ Toggle favourite */}
                          <button
                            onClick={async (e) => {
                              e.preventDefault();
                              e.stopPropagation();
                              try {
                                await updateConversation(conv.id, {
                                  is_favorite: !conv.is_favorite,
                                });
                                fetchConversations?.();
                              } catch (err) {
                                console.error(
                                  'Error updating favorite status:',
                                  err,
                                );
                              }
                            }}
                            className={`ml-2 ${
                              conv.is_favorite
                                ? 'text-yellow-400 hover:text-yellow-300'
                                : 'text-gray-400 hover:text-yellow-300'
                            }`}
                            title={
                              conv.is_favorite
                                ? 'Remove from favorites'
                                : 'Add to favorites'
                            }
                          >
                            <svg
                              xmlns="http://www.w3.org/2000/svg"
                              className="h-5 w-5"
                              viewBox="0 0 20 20"
                              fill="currentColor"
                            >
                              <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118l-2.8-2.034c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                            </svg>
                          </button>

                          {/* ✏️ Rename */}
                          <button
                            onClick={() => {
                              setRenamingConversationId(conv.id);
                              setNewTitle(conv.title || '');
                            }}
                            className="ml-2 text-yellow-200 hover:text-white"
                            title="Rename conversation"
                          >
                            <svg
                              xmlns="http://www.w3.org/2000/svg"
                              className="h-4 w-4"
                              viewBox="0 0 20 20"
                              fill="currentColor"
                            >
                              <path d="M13.586 3.586a2 2 0 112.828 2.828l-.793.793-2.828-2.828.793-.793zM11.379 5.793L3 14.172V17h2.828l8.38-8.379-2.83-2.828z" />
                            </svg>
                          </button>
                          <button
                            onClick={() => handleDeleteConversation(conv.id)}
                            className="ml-2 text-red-400 hover:text-red-500"
                            title="Delete conversation"
                          >
                            <svg
                              xmlns="http://www.w3.org/2000/svg"
                              className="h-4 w-4"
                              viewBox="0 0 20 20"
                              fill="currentColor"
                            >
                              <path
                                fillRule="evenodd"
                                d="M9 2a1 1 0 00-.894.553L7.382 4H4a1 1 0 000 2v10a2 2 0 002 2h8a2 2 0 002-2V6a1 1 0 100-2h-3.382l-.724-1.447A1 1 0 0011 2H9zM7 8a1 1 0 012 0v6a1 1 0 11-2 0V8zm5-1a1 1 0 00-1 1v6a1 1 0 102 0V8a1 1 0 00-1-1z"
                                clipRule="evenodd"
                              />
                            </svg>
                          </button>
                          <button
                            onClick={() => handleCopyTranscript(conv)}
                            className="ml-2 px-2 py-1 text-xs rounded border border-yellow-400 text-yellow-300 hover:bg-yellow-400 hover:text-blue-900 transition"
                            title="Copy transcript to clipboard"
                          >
                            Copy Transcript
                          </button>
                        </h3>
                        <div className="flex items-center gap-3 flex-shrink-0 mt-1 sm:mt-0">
                          {/* Participant count indicator */}
                          {Array.isArray(conv.participants) && conv.participants.length > 0 && (
                            <span className="flex items-center gap-1 text-blue-200 text-sm" title={`${conv.participants.length + 1} participants`}>
                              <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
                                <path d="M9 6a3 3 0 11-6 0 3 3 0 016 0zM17 6a3 3 0 11-6 0 3 3 0 016 0zM12.93 17c.046-.327.07-.66.07-1a6.97 6.97 0 00-1.5-4.33A5 5 0 0119 16v1h-6.07zM6 11a5 5 0 015 5v1H1v-1a5 5 0 015-5z" />
                              </svg>
                              {conv.participants.length + 1}
                            </span>
                          )}
                          <span className="text-blue-200 text-sm">
                            {formatDate(conv.updated_at)}
                          </span>
                        </div>
                      </>
                    )}
                  </div>
                  <p className="text-white/70 mb-3 line-clamp-1">
                    {conv.last_message_preview || "No messages"}
                  </p>
                  <Link
                    to={`/chat/${conv.id}`}
                    className="text-yellow-400 hover:text-yellow-300 inline-flex items-center"
                  >
                    Continue conversation
                    <svg 
                      xmlns="http://www.w3.org/2000/svg" 
                      className="h-4 w-4 ml-1" 
                      viewBox="0 0 20 20" 
                      fill="currentColor"
                    >
                      <path 
                        fillRule="evenodd" 
                        d="M12.293 5.293a1 1 0 011.414 0l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414-1.414L14.586 11H3a1 1 0 110-2h11.586l-2.293-2.293a1 1 0 010-1.414z" 
                        clipRule="evenodd" 
                      />
                    </svg>
                  </Link>
                </div>
              ))}
            </div>
          )}

              {/* Pagination controls for Chats */}
              {sortedConversations && sortedConversations.length > PAGE_SIZE && (
                <div className="flex items-center justify-between mt-4">
                  <button
                    onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                    disabled={currentPage <= 1}
                    className={`px-3 py-1.5 rounded-md text-sm font-semibold border transition-colors ${
                      currentPage <= 1
                        ? 'border-gray-500 text-gray-400 cursor-not-allowed'
                        : 'border-blue-400 text-blue-200 hover:bg-blue-500 hover:text-white'
                    }`}
                  >
                    Previous
                  </button>
                  <div className="text-blue-200 text-sm">
                    Page {currentPage} of {totalPages}
                  </div>
                  <button
                    onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                    disabled={currentPage >= totalPages}
                    className={`px-3 py-1.5 rounded-md text-sm font-semibold border transition-colors ${
                      currentPage >= totalPages
                        ? 'border-gray-500 text-gray-400 cursor-not-allowed'
                        : 'border-blue-400 text-blue-200 hover:bg-blue-500 hover:text-white'
                    }`}
                  >
                    Next
                  </button>
                </div>
              )}
            </>
          )}

          {/* ===================== ROUNDTABLES TAB ===================== */}
          {activeTab === 'roundtables' && (
            <>
              {roundtables.length === 0 ? (
                <div className="bg-[rgba(255,255,255,0.05)] rounded-lg p-6 text-center">
                  <p className="text-blue-100 mb-4">
                    No roundtable discussions yet. Start a roundtable to discuss topics with multiple biblical characters!
                  </p>
                  <Link
                    to="/roundtable"
                    className="px-4 py-2 bg-yellow-400 text-blue-900 rounded-lg font-semibold hover:bg-yellow-300 transition-colors"
                  >
                    Start a Roundtable
                  </Link>
                </div>
              ) : (
                <>
                  {/* Bulk delete bar for roundtables */}
                  {selectedRoundtableIds.size > 0 && (
                    <div className="flex items-center gap-3 mb-3 p-2 bg-red-900/30 border border-red-500/30 rounded-lg">
                      <span className="text-red-200 text-sm">{selectedRoundtableIds.size} selected</span>
                      <button
                        onClick={handleBulkDeleteRoundtables}
                        className="px-3 py-1 bg-red-600 hover:bg-red-500 text-white text-sm rounded"
                      >
                        Delete Selected
                      </button>
                      <button
                        onClick={clearRoundtableSelection}
                        className="px-3 py-1 bg-gray-600 hover:bg-gray-500 text-white text-sm rounded"
                      >
                        Clear
                      </button>
                    </div>
                  )}
                  <div className="space-y-3">
                    {roundtables.map(conv => (
                      <div
                        key={conv.id}
                        className={`p-4 rounded-lg transition-colors ${
                          selectedRoundtableIds.has(conv.id)
                            ? 'bg-[rgba(239,68,68,0.15)] border border-red-500/40'
                            : conv.is_favorite
                              ? 'bg-[rgba(255,223,118,0.08)] hover:bg-[rgba(255,223,118,0.12)] border border-yellow-400/30'
                              : 'bg-[rgba(255,255,255,0.05)] hover:bg-[rgba(255,255,255,0.1)]'
                        }`}
                      >
                        <div className="flex items-start gap-3">
                          {/* Checkbox */}
                          <input
                            type="checkbox"
                            checked={selectedRoundtableIds.has(conv.id)}
                            onChange={() => toggleSelectRoundtable(conv.id)}
                            className="mt-1 h-4 w-4 rounded border-gray-300 text-yellow-500 focus:ring-yellow-500"
                          />
                          <div className="flex-1 min-w-0">
                            <h4 className="text-yellow-300 font-medium flex items-center flex-wrap gap-2">
                              {conv.title || 'Untitled Roundtable'}
                            {/* Favorite button */}
                            <button
                              onClick={async (e) => {
                                e.preventDefault();
                                try {
                                  await updateConversation(conv.id, { is_favorite: !conv.is_favorite });
                                  fetchConversations?.();
                                } catch (err) {
                                  console.error('Error updating favorite status:', err);
                                }
                              }}
                              className={`${conv.is_favorite ? 'text-yellow-400 hover:text-yellow-300' : 'text-gray-400 hover:text-yellow-300'}`}
                              title={conv.is_favorite ? 'Remove from favorites' : 'Add to favorites'}
                            >
                              <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
                                <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118l-2.8-2.034c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                              </svg>
                            </button>
                            {/* Rename button */}
                            <button
                              onClick={() => {
                                setRenamingConversationId(conv.id);
                                setNewTitle(conv.title || '');
                              }}
                              className="text-yellow-200 hover:text-white"
                              title="Rename"
                            >
                              <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
                                <path d="M13.586 3.586a2 2 0 112.828 2.828l-.793.793-2.828-2.828.793-.793zM11.379 5.793L3 14.172V17h2.828l8.38-8.379-2.83-2.828z" />
                              </svg>
                            </button>
                            {/* Delete button */}
                            <button
                              onClick={() => handleDeleteConversation(conv.id)}
                              className="text-red-400 hover:text-red-500"
                              title="Delete"
                            >
                              <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
                                <path fillRule="evenodd" d="M9 2a1 1 0 00-.894.553L7.382 4H4a1 1 0 000 2v10a2 2 0 002 2h8a2 2 0 002-2V6a1 1 0 100-2h-3.382l-.724-1.447A1 1 0 0011 2H9zM7 8a1 1 0 012 0v6a1 1 0 11-2 0V8zm5-1a1 1 0 00-1 1v6a1 1 0 102 0V8a1 1 0 00-1-1z" clipRule="evenodd" />
                              </svg>
                            </button>
                          </h4>
                          {/* Rename input (shown when editing) */}
                          {renamingConversationId === conv.id && (
                            <div className="flex items-center gap-2 mt-2">
                              <input
                                type="text"
                                value={newTitle}
                                onChange={(e) => setNewTitle(e.target.value)}
                                placeholder="Enter new title"
                                className="flex-1 p-1 text-blue-900 rounded border border-blue-400 focus:ring-2 focus:ring-blue-500 focus:outline-none text-sm"
                                autoFocus
                              />
                              <button
                                onClick={async () => {
                                  if (!newTitle.trim()) return;
                                  try {
                                    await updateConversation(conv.id, { title: newTitle.trim() });
                                  } catch (err) {
                                    console.error('Error renaming:', err);
                                  } finally {
                                    setRenamingConversationId(null);
                                    setNewTitle('');
                                  }
                                }}
                                className="px-2 py-1 bg-blue-500 text-white rounded hover:bg-blue-600 text-xs"
                              >
                                Save
                              </button>
                              <button
                                onClick={() => { setRenamingConversationId(null); setNewTitle(''); }}
                                className="px-2 py-1 bg-gray-500 text-white rounded hover:bg-gray-600 text-xs"
                              >
                                Cancel
                              </button>
                            </div>
                          )}
                          <div className="flex items-center gap-3 text-blue-200 text-xs mt-1">
                            {Array.isArray(conv.participants) && conv.participants.length > 0 && (
                              <span className="flex items-center gap-1" title={`${conv.participants.length + 1} participants`}>
                                <svg xmlns="http://www.w3.org/2000/svg" className="h-3 w-3" viewBox="0 0 20 20" fill="currentColor">
                                  <path d="M9 6a3 3 0 11-6 0 3 3 0 016 0zM17 6a3 3 0 11-6 0 3 3 0 016 0zM12.93 17c.046-.327.07-.66.07-1a6.97 6.97 0 00-1.5-4.33A5 5 0 0119 16v1h-6.07zM6 11a5 5 0 015 5v1H1v-1a5 5 0 015-5z" />
                                </svg>
                                {conv.participants.length + 1}
                              </span>
                            )}
                            <span>{formatDate(conv.updated_at)}</span>
                          </div>
                        </div>
                          <Link
                            to={`/roundtable?conv=${conv.id}`}
                            className="text-yellow-400 hover:text-yellow-300 text-sm flex-shrink-0"
                          >
                            Continue →
                          </Link>
                        </div>
                      </div>
                    ))}
                  </div>
                </>
              )}
            </>
          )}

          {/* ===================== BIBLE STUDIES TAB ===================== */}
          {activeTab === 'studies' && (
            <>
              {studiesLoading ? (
                <div className="bg-[rgba(255,255,255,0.05)] rounded-lg p-6 text-center">
                  <p className="text-blue-100">Loading your studies...</p>
                </div>
              ) : userStudies.length === 0 ? (
                <div className="bg-[rgba(255,255,255,0.05)] rounded-lg p-6 text-center">
                  <p className="text-blue-100 mb-4">
                    No Bible studies in progress. Start a guided study with biblical characters!
                  </p>
                  <Link
                    to="/studies"
                    className="px-4 py-2 bg-yellow-400 text-blue-900 rounded-lg font-semibold hover:bg-yellow-300 transition-colors"
                  >
                    Browse Bible Studies
                  </Link>
                </div>
              ) : (
                <>
                  {/* Bulk delete bar for studies */}
                  {selectedStudyIds.size > 0 && (
                    <div className="flex items-center gap-3 mb-3 p-2 bg-red-900/30 border border-red-500/30 rounded-lg">
                      <span className="text-red-200 text-sm">{selectedStudyIds.size} selected</span>
                      <button
                        onClick={handleBulkDeleteStudies}
                        className="px-3 py-1 bg-red-600 hover:bg-red-500 text-white text-sm rounded"
                      >
                        Delete Selected
                      </button>
                      <button
                        onClick={clearStudySelection}
                        className="px-3 py-1 bg-gray-600 hover:bg-gray-500 text-white text-sm rounded"
                      >
                        Clear
                      </button>
                    </div>
                  )}
                  <div className="space-y-3">
                    {userStudies.map(study => {
                      const completedCount = Array.isArray(study.progress?.completed_lessons) 
                        ? study.progress.completed_lessons.length 
                        : 0;
                      const totalLessons = study.lesson_count || 0;
                      const progressPercent = totalLessons > 0 
                        ? Math.round((completedCount / totalLessons) * 100) 
                        : 0;
                      const isComplete = totalLessons > 0 && completedCount >= totalLessons;
                      
                      // Find next incomplete lesson
                      const completedSet = new Set(study.progress?.completed_lessons || []);
                      let nextLessonIndex = 0;
                      for (let i = 0; i < totalLessons; i++) {
                        if (!completedSet.has(i)) {
                          nextLessonIndex = i;
                          break;
                        }
                      }
                      
                      return (
                        <div
                          key={study.progressId || study.id}
                          className={`p-4 rounded-lg transition-colors ${
                            selectedStudyIds.has(study.progressId)
                              ? 'bg-[rgba(239,68,68,0.15)] border border-red-500/40'
                              : isComplete
                                ? 'bg-[rgba(34,197,94,0.1)] hover:bg-[rgba(34,197,94,0.15)] border border-green-500/30'
                                : 'bg-[rgba(255,255,255,0.05)] hover:bg-[rgba(255,255,255,0.1)]'
                          }`}
                        >
                          <div className="flex items-start gap-3">
                            {/* Checkbox */}
                            <input
                              type="checkbox"
                              checked={selectedStudyIds.has(study.progressId)}
                              onChange={() => toggleSelectStudy(study.progressId)}
                              className="mt-1 h-4 w-4 rounded border-gray-300 text-yellow-500 focus:ring-yellow-500"
                            />
                            <div className="flex-1 min-w-0">
                            <div className="flex items-start justify-between gap-3">
                              <div className="flex-1">
                                {/* Title with label */}
                                {editingStudyId === study.progressId ? (
                                  <div className="flex items-center gap-2 mb-2">
                                    <span className="text-yellow-300 font-medium">{study.title}</span>
                                    <span className="text-blue-300">-</span>
                                    <input
                                      type="text"
                                      value={studyLabel}
                                      onChange={(e) => setStudyLabel(e.target.value)}
                                      placeholder="e.g., with Sarah"
                                      className="flex-1 px-2 py-1 bg-blue-800/50 border border-blue-600 rounded text-white text-sm"
                                      autoFocus
                                      onKeyDown={(e) => {
                                        if (e.key === 'Enter') handleUpdateStudyLabel(study.progressId);
                                        if (e.key === 'Escape') { setEditingStudyId(null); setStudyLabel(''); }
                                      }}
                                    />
                                    <button
                                      onClick={() => handleUpdateStudyLabel(study.progressId)}
                                      className="px-2 py-1 bg-green-600 hover:bg-green-500 text-white rounded text-sm"
                                    >
                                      Save
                                    </button>
                                    <button
                                      onClick={() => { setEditingStudyId(null); setStudyLabel(''); }}
                                      className="px-2 py-1 bg-gray-600 hover:bg-gray-500 text-white rounded text-sm"
                                    >
                                      Cancel
                                    </button>
                                  </div>
                                ) : (
                                  <h4 className="text-yellow-300 font-medium flex items-center gap-2">
                                    {study.title}
                                    {study.progress?.label && (
                                      <span className="text-blue-300 font-normal">- {study.progress.label}</span>
                                    )}
                                    {isComplete && (
                                      <span className="text-green-400" title="Completed">
                                        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                                          <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                                        </svg>
                                      </span>
                                    )}
                                  </h4>
                                )}
                                
                                {/* Progress bar */}
                                <div className="mt-2 flex items-center gap-3">
                                  <div className="flex-1 max-w-[200px] h-2 bg-blue-900/50 rounded-full overflow-hidden">
                                    <div 
                                      className={`h-full transition-all ${isComplete ? 'bg-green-500' : 'bg-yellow-400'}`}
                                      style={{ width: `${progressPercent}%` }}
                                    />
                                  </div>
                                  <span className="text-xs text-blue-200">
                                    {completedCount} of {totalLessons} lessons
                                  </span>
                                </div>
                                
                                {/* Last activity & started date */}
                                <div className="flex items-center gap-4 mt-1">
                                  {study.progress?.last_activity_at && (
                                    <p className="text-xs text-blue-300/70">
                                      Last activity: {formatDate(study.progress.last_activity_at)}
                                    </p>
                                  )}
                                  {study.progress?.created_at && (
                                    <p className="text-xs text-blue-300/50">
                                      Started: {formatDate(study.progress.created_at)}
                                    </p>
                                  )}
                                </div>
                              </div>
                              
                              {/* Action buttons */}
                              <div className="flex items-center gap-2 flex-shrink-0">
                                {/* Edit label button */}
                                <button
                                  onClick={() => {
                                    setEditingStudyId(study.progressId);
                                    setStudyLabel(study.progress?.label || '');
                                  }}
                                  className="p-1.5 text-blue-300 hover:text-blue-200 rounded"
                                  title="Edit label"
                                >
                                  <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
                                    <path d="M13.586 3.586a2 2 0 112.828 2.828l-.793.793-2.828-2.828.793-.793zM11.379 5.793L3 14.172V17h2.828l8.38-8.379-2.83-2.828z" />
                                  </svg>
                                </button>
                                
                                {/* Start again button */}
                                <button
                                  onClick={() => handleStartStudyAgain(study.id, study.title)}
                                  className="p-1.5 text-green-400 hover:text-green-300 rounded"
                                  title="Start this study again"
                                >
                                  <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
                                    <path fillRule="evenodd" d="M4 2a1 1 0 011 1v2.101a7.002 7.002 0 0111.601 2.566 1 1 0 11-1.885.666A5.002 5.002 0 005.999 7H9a1 1 0 010 2H4a1 1 0 01-1-1V3a1 1 0 011-1zm.008 9.057a1 1 0 011.276.61A5.002 5.002 0 0014.001 13H11a1 1 0 110-2h5a1 1 0 011 1v5a1 1 0 11-2 0v-2.101a7.002 7.002 0 01-11.601-2.566 1 1 0 01.61-1.276z" clipRule="evenodd" />
                                  </svg>
                                </button>
                                
                                {/* Delete button */}
                                <button
                                  onClick={() => handleDeleteStudyProgress(study.progressId)}
                                  className="p-1.5 text-red-400 hover:text-red-300 rounded"
                                  title="Remove from list"
                                >
                                  <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
                                    <path fillRule="evenodd" d="M9 2a1 1 0 00-.894.553L7.382 4H4a1 1 0 000 2v10a2 2 0 002 2h8a2 2 0 002-2V6a1 1 0 100-2h-3.382l-.724-1.447A1 1 0 0011 2H9zM7 8a1 1 0 012 0v6a1 1 0 11-2 0V8zm5-1a1 1 0 00-1 1v6a1 1 0 102 0V8a1 1 0 00-1-1z" clipRule="evenodd" />
                                  </svg>
                                </button>
                                
                                {/* Continue/Review button - go to study details with progress */}
                                <Link
                                  to={`/studies/${study.id}?progress=${study.progressId}`}
                                  className="px-3 py-1.5 bg-yellow-400 hover:bg-yellow-300 text-blue-900 rounded-lg text-sm font-medium"
                                >
                                  {isComplete ? 'Review' : 'Continue'}
                                </Link>
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>
                      );
                    })}
                  </div>
                </>
              )}
            </>
          )}
        </section>
      </div>
      <Footer />
    </div>
  );
};

export default MyWalkPage;
