import React, { useEffect, useState, useMemo } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { useConversation } from '../contexts/ConversationContext.jsx';
import { characterRepository } from '../repositories/characterRepository';
import userFavoritesRepository from '../repositories/userFavoritesRepository';
import userSettingsRepository from '../repositories/userSettingsRepository';
import { bibleStudiesRepository } from '../repositories/bibleStudiesRepository';
import conversationRepository from '../repositories/conversationRepository';
import FooterScroll from '../components/FooterScroll';
import PreviewLayout from '../components/PreviewLayout';
import { ScrollWrap, ScrollDivider, ScrollBackground } from '../components/ScrollWrap';

const generateFallbackAvatar = (name) => 
  `https://ui-avatars.com/api/?name=${encodeURIComponent(name || 'User')}&background=random`;

// Character Card for Favorites (scroll themed)
const FavoriteCharacterCard = ({ character, isFeatured, onToggleFavorite, onSetFeatured }) => (
  <div className="bg-white/80 rounded-xl border border-amber-200 p-4 hover:shadow-md transition-all">
    <div className="flex flex-col items-center text-center">
      <div className={`w-16 h-16 rounded-full overflow-hidden mb-2 ${isFeatured ? 'ring-4 ring-amber-400' : 'ring-2 ring-amber-300'}`}>
        <img
          src={character.avatar_url || generateFallbackAvatar(character.name)}
          alt={character.name}
          className="w-full h-full object-cover object-[center_20%]"
        />
      </div>
      <h4 className="font-bold text-amber-900 text-sm" style={{ fontFamily: 'Cinzel, serif' }}>{character.name}</h4>
      <div className="flex gap-1 mt-2">
        <button
          onClick={() => onToggleFavorite(character.id)}
          className="p-1.5 rounded-full bg-amber-100 text-amber-600 hover:bg-amber-200"
          title="Remove from favorites"
        >
          <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
            <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118l-2.8-2.034c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
          </svg>
        </button>
        <button
          onClick={() => onSetFeatured(character)}
          className={`p-1.5 rounded-full ${isFeatured ? 'bg-amber-200 text-amber-700' : 'bg-amber-100 text-amber-500 hover:bg-amber-200'}`}
          title={isFeatured ? "Currently featured" : "Set as featured"}
        >
          <svg className="w-4 h-4" fill={isFeatured ? "currentColor" : "none"} stroke="currentColor" strokeWidth="1.5" viewBox="0 0 20 20">
            <path d="M5 4a2 2 0 012-2h6a2 2 0 012 2v14l-5-2.5L5 18V4z" />
          </svg>
        </button>
        <Link
          to={`/?character=${character.id}`}
          className="p-1.5 rounded-full bg-amber-600 text-white hover:bg-amber-700"
          title="Chat"
        >
          <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M18 10c0 3.866-3.582 7-8 7a8.841 8.841 0 01-4.083-.98L2 17l1.338-3.123C2.493 12.767 2 11.434 2 10c0-3.866 3.582-7 8-7s8 3.134 8 7z" clipRule="evenodd" />
          </svg>
        </Link>
      </div>
    </div>
  </div>
);

const MyWalkPageScroll = () => {
  const { user, loading } = useAuth();
  const {
    conversations = [],
    fetchConversations,
    fetchConversationWithMessages,
    updateConversation,
    deleteConversation,
    isLoading: conversationsLoading,
  } = useConversation() || {};

  // State
  const [favoriteCharacters, setFavoriteCharacters] = useState([]);
  const [favLoading, setFavLoading] = useState(true);
  const [featuredId, setFeaturedId] = useState(null);
  const [hasAttemptedLoad, setHasAttemptedLoad] = useState(false);
  const [userStudies, setUserStudies] = useState([]);
  const [studiesLoading, setStudiesLoading] = useState(false);
  
  // UI State
  const [activeTab, setActiveTab] = useState('chats');
  const [sortMode, setSortMode] = useState('recent');
  const [renamingId, setRenamingId] = useState(null);
  const [newTitle, setNewTitle] = useState('');
  const [editingStudyId, setEditingStudyId] = useState(null);
  const [studyLabel, setStudyLabel] = useState('');
  
  // Selection state
  const [selectedChatIds, setSelectedChatIds] = useState(new Set());
  const [selectedRoundtableIds, setSelectedRoundtableIds] = useState(new Set());
  const [selectedStudyIds, setSelectedStudyIds] = useState(new Set());
  
  // Pagination
  const PAGE_SIZE = 10;
  const [currentPage, setCurrentPage] = useState(1);

  // Load favorites
  useEffect(() => {
    const loadFavorites = async () => {
      try {
        const allCharacters = await characterRepository.getAll();
        const favIds = await userFavoritesRepository.getFavoriteIds(user?.id);
        const favChars = allCharacters.filter(c => favIds.includes(c.id));
        setFavoriteCharacters(favChars);
        const feat = await userSettingsRepository.getFeaturedCharacterId(user?.id);
        setFeaturedId(feat);
      } catch (e) {
        console.error('Failed loading favorites:', e);
      } finally {
        setFavLoading(false);
      }
    };
    if (user?.id) loadFavorites();
  }, [user?.id]);

  // Load conversations
  useEffect(() => {
    if (user && typeof fetchConversations === 'function') {
      fetchConversations().finally(() => setHasAttemptedLoad(true));
    }
  }, [user, fetchConversations]);

  // Load studies
  useEffect(() => {
    const loadStudies = async () => {
      if (!user?.id) return;
      setStudiesLoading(true);
      try {
        const studies = await bibleStudiesRepository.getUserStudiesWithProgress(user.id);
        setUserStudies(studies || []);
      } catch (err) {
        console.error('Error loading studies:', err);
      } finally {
        setStudiesLoading(false);
      }
    };
    loadStudies();
  }, [user?.id]);

  // Failsafe timeout
  useEffect(() => {
    if (!hasAttemptedLoad) {
      const timer = setTimeout(() => setHasAttemptedLoad(true), 3000);
      return () => clearTimeout(timer);
    }
  }, [hasAttemptedLoad]);

  // Helper functions
  const formatDate = (iso) => {
    if (!iso) return '';
    try {
      return new Date(iso).toLocaleDateString(undefined, { year: 'numeric', month: 'short', day: 'numeric' });
    } catch { return ''; }
  };

  const sortList = (list) => {
    const sorted = [...list];
    if (sortMode === 'favorites') {
      sorted.sort((a, b) => {
        const favDelta = Number(!!b.is_favorite) - Number(!!a.is_favorite);
        if (favDelta !== 0) return favDelta;
        return new Date(b.updated_at || 0) - new Date(a.updated_at || 0);
      });
    } else {
      sorted.sort((a, b) => new Date(b.updated_at || 0) - new Date(a.updated_at || 0));
    }
    return sorted;
  };

  // Categorize conversations
  const { regularChats, roundtables } = useMemo(() => ({
    regularChats: sortList((conversations || []).filter(c => !c.study_id && c.conversation_type !== 'roundtable')),
    roundtables: sortList((conversations || []).filter(c => c.conversation_type === 'roundtable')),
  }), [conversations, sortMode]);

  // Pagination
  const totalPages = Math.max(1, Math.ceil(regularChats.length / PAGE_SIZE));
  const pagedChats = regularChats.slice((currentPage - 1) * PAGE_SIZE, currentPage * PAGE_SIZE);

  // Handlers
  const handleToggleFavorite = async (charId) => {
    try {
      const isFav = favoriteCharacters.some(c => c.id === charId);
      await userFavoritesRepository.setFavorite(user?.id, charId, !isFav);
      const allChars = await characterRepository.getAll();
      const favIds = await userFavoritesRepository.getFavoriteIds(user?.id);
      setFavoriteCharacters(allChars.filter(c => favIds.includes(c.id)));
    } catch (e) {
      console.error('Toggle favorite failed:', e);
    }
  };

  const handleSetFeatured = async (char) => {
    try {
      await userSettingsRepository.setFeaturedCharacterId(user?.id, char.id);
      setFeaturedId(char.id);
    } catch (e) {
      console.error('Set featured failed:', e);
    }
  };

  const handleDeleteConversation = async (id) => {
    if (!window.confirm('Delete this conversation? This cannot be undone.')) return;
    try {
      await deleteConversation(id);
      fetchConversations?.();
    } catch (e) {
      console.error('Delete failed:', e);
    }
  };

  const handleRename = async (id) => {
    if (!newTitle.trim()) return;
    try {
      await updateConversation(id, { title: newTitle.trim() });
      setRenamingId(null);
      setNewTitle('');
    } catch (e) {
      console.error('Rename failed:', e);
    }
  };

  const handleToggleFavoriteConv = async (conv) => {
    try {
      await updateConversation(conv.id, { is_favorite: !conv.is_favorite });
      fetchConversations?.();
    } catch (e) {
      console.error('Toggle favorite failed:', e);
    }
  };

  const handleCopyTranscript = async (conv) => {
    try {
      const full = await fetchConversationWithMessages(conv.id);
      if (!full) return;
      const lines = [full.title || 'Conversation', ''];
      const msgs = [...(full.messages || [])].sort((a, b) => new Date(a.created_at) - new Date(b.created_at));
      for (const m of msgs) {
        if (!m?.content) continue;
        lines.push(`${m.role === 'user' ? 'You' : full.characters?.name || 'Assistant'}: ${m.content}`);
      }
      await navigator.clipboard.writeText(lines.join('\n'));
    } catch (e) {
      console.warn('Copy failed:', e);
    }
  };

  const handleBulkDelete = async (ids, type) => {
    if (ids.size === 0) return;
    if (!window.confirm(`Delete ${ids.size} ${type}? This cannot be undone.`)) return;
    for (const id of ids) {
      try { await deleteConversation(id); } catch {}
    }
    if (type === 'chats') setSelectedChatIds(new Set());
    if (type === 'roundtables') setSelectedRoundtableIds(new Set());
    fetchConversations?.();
  };

  const handleDeleteStudyProgress = async (progressId) => {
    if (!window.confirm('Remove this study? Your progress will be deleted.')) return;
    try {
      await bibleStudiesRepository.deleteProgress(progressId);
      setUserStudies(prev => prev.filter(s => s.progressId !== progressId));
    } catch (e) {
      console.error('Delete study failed:', e);
    }
  };

  const handleUpdateStudyLabel = async (progressId) => {
    try {
      await bibleStudiesRepository.updateProgressLabel(progressId, studyLabel.trim() || null);
      setUserStudies(prev => prev.map(s => 
        s.progressId === progressId ? { ...s, progress: { ...s.progress, label: studyLabel.trim() || null } } : s
      ));
      setEditingStudyId(null);
      setStudyLabel('');
    } catch (e) {
      console.error('Update label failed:', e);
    }
  };

  const handleStartStudyAgain = async (studyId, title) => {
    const label = window.prompt(`Starting "${title}" again.\n\nEnter a label (optional):`, '');
    if (label === null) return;
    try {
      await bibleStudiesRepository.saveProgress({
        userId: user.id,
        studyId,
        currentLessonIndex: 0,
        completedLessons: [],
        label: label.trim() || null,
        createNew: true,
      });
      const studies = await bibleStudiesRepository.getUserStudiesWithProgress(user.id);
      setUserStudies(studies || []);
    } catch (e) {
      console.error('Start again failed:', e);
    }
  };

  // Not logged in
  if (!user && !loading && hasAttemptedLoad) {
    return (
      <PreviewLayout>
        <ScrollBackground className="min-h-screen py-8 px-4">
          <ScrollWrap className="max-w-2xl mx-auto text-center">
            <h1 className="text-3xl font-bold text-amber-900 mb-4" style={{ fontFamily: 'Cinzel, serif' }}>Login Required</h1>
            <p className="text-amber-700 mb-6">Please log in to view your faith journey.</p>
            <Link to="/login" className="px-6 py-3 bg-amber-600 text-white rounded-lg font-medium hover:bg-amber-700">Log In</Link>
          </ScrollWrap>
        </ScrollBackground>
        <FooterScroll />
      </PreviewLayout>
    );
  }

  // Loading
  if ((loading || favLoading || conversationsLoading) && !hasAttemptedLoad) {
    return (
      <PreviewLayout>
        <ScrollBackground className="min-h-screen py-8 px-4">
          <ScrollWrap className="max-w-2xl mx-auto text-center">
            <div className="inline-block w-12 h-12 border-4 border-amber-300 border-t-amber-600 rounded-full animate-spin" />
            <p className="mt-4 text-amber-700">Loading your faith journey...</p>
          </ScrollWrap>
        </ScrollBackground>
        <FooterScroll />
      </PreviewLayout>
    );
  }

  return (
    <PreviewLayout>
      <ScrollBackground className="min-h-screen py-6 px-4">
        <ScrollWrap className="max-w-5xl mx-auto">
          {/* Header */}
          <div className="flex items-center justify-between mb-6">
            <h1 className="text-3xl font-bold text-amber-900" style={{ fontFamily: 'Cinzel, serif' }}>My Faith Journey</h1>
            <Link to="/preview" className="px-4 py-2 bg-amber-600 text-white rounded-lg font-medium hover:bg-amber-700">Back to Home</Link>
          </div>

          {/* Favorite Characters */}
          {!favLoading && favoriteCharacters.length > 0 && (
            <section className="mb-8">
              <h2 className="text-xl font-bold text-amber-800 mb-4" style={{ fontFamily: 'Cinzel, serif' }}>Favorite Characters</h2>
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3">
                {favoriteCharacters.map(char => (
                  <FavoriteCharacterCard
                    key={char.id}
                    character={char}
                    isFeatured={featuredId === char.id}
                    onToggleFavorite={handleToggleFavorite}
                    onSetFeatured={handleSetFeatured}
                  />
                ))}
              </div>
            </section>
          )}

          {!favLoading && favoriteCharacters.length === 0 && (
            <section className="mb-8">
              <h2 className="text-xl font-bold text-amber-800 mb-4" style={{ fontFamily: 'Cinzel, serif' }}>Favorite Characters</h2>
              <div className="bg-amber-50/50 rounded-xl p-6 text-center border border-amber-200">
                <p className="text-amber-700 mb-4">You haven't added any characters to your favorites yet.</p>
                <Link to="/chat/preview" className="px-4 py-2 bg-amber-600 text-white rounded-lg font-medium hover:bg-amber-700">Browse Characters</Link>
              </div>
            </section>
          )}

          <ScrollDivider />

          {/* My Walk Section */}
          <section>
            <div className="flex items-center justify-between mb-4 flex-wrap gap-3">
              <h2 className="text-xl font-bold text-amber-800" style={{ fontFamily: 'Cinzel, serif' }}>My Walk</h2>
              <div className="flex items-center gap-2">
                <label className="text-amber-700 text-sm">Sort by</label>
                <select
                  value={sortMode}
                  onChange={(e) => setSortMode(e.target.value)}
                  className="bg-white border border-amber-300 text-amber-800 text-sm rounded-lg px-2 py-1"
                >
                  <option value="recent">Most Recent</option>
                  <option value="favorites">Favorites First</option>
                </select>
              </div>
            </div>

            {/* Tabs */}
            <div className="flex border-b border-amber-300 mb-4">
              {[
                { key: 'chats', label: 'Chats', count: regularChats.length },
                { key: 'roundtables', label: 'Roundtables', count: roundtables.length },
                { key: 'studies', label: 'Bible Studies', count: userStudies.length },
              ].map(tab => (
                <button
                  key={tab.key}
                  onClick={() => { setActiveTab(tab.key); setCurrentPage(1); }}
                  className={`px-4 py-2 text-sm font-medium transition-colors ${
                    activeTab === tab.key
                      ? 'text-amber-800 border-b-2 border-amber-600 -mb-[2px]'
                      : 'text-amber-600 hover:text-amber-800'
                  }`}
                >
                  {tab.label} ({tab.count})
                </button>
              ))}
            </div>

            {/* CHATS TAB */}
            {activeTab === 'chats' && (
              <>
                {selectedChatIds.size > 0 && (
                  <div className="flex items-center gap-3 mb-3 p-2 bg-red-100 border border-red-300 rounded-lg">
                    <span className="text-red-700 text-sm">{selectedChatIds.size} selected</span>
                    <button onClick={() => handleBulkDelete(selectedChatIds, 'chats')} className="px-3 py-1 bg-red-600 text-white text-sm rounded hover:bg-red-700">Delete</button>
                    <button onClick={() => setSelectedChatIds(new Set())} className="px-3 py-1 bg-gray-500 text-white text-sm rounded hover:bg-gray-600">Clear</button>
                  </div>
                )}

                {regularChats.length === 0 ? (
                  <div className="bg-amber-50/50 rounded-xl p-6 text-center border border-amber-200">
                    <p className="text-amber-700 mb-4">No saved conversations yet. Start chatting!</p>
                    <Link to="/chat/preview" className="px-4 py-2 bg-amber-600 text-white rounded-lg font-medium hover:bg-amber-700">Start a Conversation</Link>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {pagedChats.map(conv => (
                      <div
                        key={conv.id}
                        className={`p-4 rounded-xl border transition-colors ${
                          conv.is_favorite ? 'bg-amber-100/50 border-amber-400' : 'bg-white/80 border-amber-200 hover:bg-amber-50'
                        }`}
                      >
                        <div className="flex items-start gap-3">
                          <input
                            type="checkbox"
                            checked={selectedChatIds.has(conv.id)}
                            onChange={() => {
                              const next = new Set(selectedChatIds);
                              next.has(conv.id) ? next.delete(conv.id) : next.add(conv.id);
                              setSelectedChatIds(next);
                            }}
                            className="mt-1 w-4 h-4"
                          />
                          <div className="flex-1 min-w-0">
                            {renamingId === conv.id ? (
                              <div className="flex items-center gap-2 mb-2">
                                <input
                                  type="text"
                                  value={newTitle}
                                  onChange={(e) => setNewTitle(e.target.value)}
                                  className="flex-1 px-2 py-1 border border-amber-300 rounded text-sm"
                                  autoFocus
                                />
                                <button onClick={() => handleRename(conv.id)} className="px-2 py-1 bg-amber-600 text-white rounded text-sm">Save</button>
                                <button onClick={() => { setRenamingId(null); setNewTitle(''); }} className="px-2 py-1 bg-gray-500 text-white rounded text-sm">Cancel</button>
                              </div>
                            ) : (
                              <h3 className="font-bold text-amber-900 flex items-center gap-2 flex-wrap">
                                {conv.title || 'Untitled Conversation'}
                                <button onClick={() => handleToggleFavoriteConv(conv)} className={conv.is_favorite ? 'text-amber-500' : 'text-amber-300 hover:text-amber-500'}>
                                  <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20"><path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118l-2.8-2.034c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" /></svg>
                                </button>
                                <button onClick={() => { setRenamingId(conv.id); setNewTitle(conv.title || ''); }} className="text-amber-600 hover:text-amber-800" title="Rename">
                                  <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20"><path d="M13.586 3.586a2 2 0 112.828 2.828l-.793.793-2.828-2.828.793-.793zM11.379 5.793L3 14.172V17h2.828l8.38-8.379-2.83-2.828z" /></svg>
                                </button>
                                <button onClick={() => handleDeleteConversation(conv.id)} className="text-red-500 hover:text-red-700" title="Delete">
                                  <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M9 2a1 1 0 00-.894.553L7.382 4H4a1 1 0 000 2v10a2 2 0 002 2h8a2 2 0 002-2V6a1 1 0 100-2h-3.382l-.724-1.447A1 1 0 0011 2H9zM7 8a1 1 0 012 0v6a1 1 0 11-2 0V8zm5-1a1 1 0 00-1 1v6a1 1 0 102 0V8a1 1 0 00-1-1z" clipRule="evenodd" /></svg>
                                </button>
                                <button onClick={() => handleCopyTranscript(conv)} className="text-amber-600 hover:text-amber-800 text-xs border border-amber-400 px-2 py-0.5 rounded">Copy</button>
                              </h3>
                            )}
                            <p className="text-amber-700/70 text-sm truncate">{conv.last_message_preview || 'No messages'}</p>
                            <p className="text-amber-600/50 text-xs mt-1">{formatDate(conv.updated_at)}</p>
                          </div>
                          <Link to={`/chat/preview/${conv.id}`} className="text-amber-600 hover:text-amber-800 text-sm font-medium">Continue →</Link>
                        </div>
                      </div>
                    ))}
                  </div>
                )}

                {regularChats.length > PAGE_SIZE && (
                  <div className="flex items-center justify-between mt-4">
                    <button onClick={() => setCurrentPage(p => Math.max(1, p - 1))} disabled={currentPage <= 1} className={`px-3 py-1.5 rounded border ${currentPage <= 1 ? 'border-amber-200 text-amber-300' : 'border-amber-400 text-amber-700 hover:bg-amber-100'}`}>Previous</button>
                    <span className="text-amber-600 text-sm">Page {currentPage} of {totalPages}</span>
                    <button onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))} disabled={currentPage >= totalPages} className={`px-3 py-1.5 rounded border ${currentPage >= totalPages ? 'border-amber-200 text-amber-300' : 'border-amber-400 text-amber-700 hover:bg-amber-100'}`}>Next</button>
                  </div>
                )}
              </>
            )}

            {/* ROUNDTABLES TAB */}
            {activeTab === 'roundtables' && (
              <>
                {selectedRoundtableIds.size > 0 && (
                  <div className="flex items-center gap-3 mb-3 p-2 bg-red-100 border border-red-300 rounded-lg">
                    <span className="text-red-700 text-sm">{selectedRoundtableIds.size} selected</span>
                    <button onClick={() => handleBulkDelete(selectedRoundtableIds, 'roundtables')} className="px-3 py-1 bg-red-600 text-white text-sm rounded hover:bg-red-700">Delete</button>
                    <button onClick={() => setSelectedRoundtableIds(new Set())} className="px-3 py-1 bg-gray-500 text-white text-sm rounded hover:bg-gray-600">Clear</button>
                  </div>
                )}

                {roundtables.length === 0 ? (
                  <div className="bg-amber-50/50 rounded-xl p-6 text-center border border-amber-200">
                    <p className="text-amber-700 mb-4">No roundtable discussions yet.</p>
                    <Link to="/roundtable/setup/preview" className="px-4 py-2 bg-amber-600 text-white rounded-lg font-medium hover:bg-amber-700">Start a Roundtable</Link>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {roundtables.map(conv => (
                      <div
                        key={conv.id}
                        className={`p-4 rounded-xl border transition-colors ${
                          conv.is_favorite ? 'bg-amber-100/50 border-amber-400' : 'bg-white/80 border-amber-200 hover:bg-amber-50'
                        }`}
                      >
                        <div className="flex items-start gap-3">
                          <input
                            type="checkbox"
                            checked={selectedRoundtableIds.has(conv.id)}
                            onChange={() => {
                              const next = new Set(selectedRoundtableIds);
                              next.has(conv.id) ? next.delete(conv.id) : next.add(conv.id);
                              setSelectedRoundtableIds(next);
                            }}
                            className="mt-1 w-4 h-4"
                          />
                          <div className="flex-1 min-w-0">
                            <h4 className="font-bold text-amber-900 flex items-center gap-2">
                              {conv.title || 'Untitled Roundtable'}
                              <button onClick={() => handleToggleFavoriteConv(conv)} className={conv.is_favorite ? 'text-amber-500' : 'text-amber-300 hover:text-amber-500'}>
                                <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20"><path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118l-2.8-2.034c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" /></svg>
                              </button>
                              <button onClick={() => handleDeleteConversation(conv.id)} className="text-red-500 hover:text-red-700" title="Delete">
                                <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M9 2a1 1 0 00-.894.553L7.382 4H4a1 1 0 000 2v10a2 2 0 002 2h8a2 2 0 002-2V6a1 1 0 100-2h-3.382l-.724-1.447A1 1 0 0011 2H9zM7 8a1 1 0 012 0v6a1 1 0 11-2 0V8zm5-1a1 1 0 00-1 1v6a1 1 0 102 0V8a1 1 0 00-1-1z" clipRule="evenodd" /></svg>
                              </button>
                            </h4>
                            {Array.isArray(conv.participants) && conv.participants.length > 0 && (
                              <p className="text-amber-600/60 text-xs">{conv.participants.length + 1} participants</p>
                            )}
                            <p className="text-amber-600/50 text-xs mt-1">{formatDate(conv.updated_at)}</p>
                          </div>
                          <Link to={`/roundtable?conv=${conv.id}`} className="text-amber-600 hover:text-amber-800 text-sm font-medium">Continue →</Link>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </>
            )}

            {/* STUDIES TAB */}
            {activeTab === 'studies' && (
              <>
                {selectedStudyIds.size > 0 && (
                  <div className="flex items-center gap-3 mb-3 p-2 bg-red-100 border border-red-300 rounded-lg">
                    <span className="text-red-700 text-sm">{selectedStudyIds.size} selected</span>
                    <button onClick={async () => {
                      if (!window.confirm(`Remove ${selectedStudyIds.size} studies?`)) return;
                      for (const id of selectedStudyIds) {
                        try { await bibleStudiesRepository.deleteProgress(id); } catch {}
                      }
                      setSelectedStudyIds(new Set());
                      const studies = await bibleStudiesRepository.getUserStudiesWithProgress(user.id);
                      setUserStudies(studies || []);
                    }} className="px-3 py-1 bg-red-600 text-white text-sm rounded hover:bg-red-700">Delete</button>
                    <button onClick={() => setSelectedStudyIds(new Set())} className="px-3 py-1 bg-gray-500 text-white text-sm rounded hover:bg-gray-600">Clear</button>
                  </div>
                )}

                {studiesLoading ? (
                  <div className="bg-amber-50/50 rounded-xl p-6 text-center border border-amber-200">
                    <p className="text-amber-700">Loading studies...</p>
                  </div>
                ) : userStudies.length === 0 ? (
                  <div className="bg-amber-50/50 rounded-xl p-6 text-center border border-amber-200">
                    <p className="text-amber-700 mb-4">No Bible studies in progress.</p>
                    <Link to="/studies/preview" className="px-4 py-2 bg-amber-600 text-white rounded-lg font-medium hover:bg-amber-700">Browse Bible Studies</Link>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {userStudies.map(study => {
                      const completed = Array.isArray(study.progress?.completed_lessons) ? study.progress.completed_lessons.length : 0;
                      const total = study.lesson_count || 0;
                      const percent = total > 0 ? Math.round((completed / total) * 100) : 0;
                      const isComplete = total > 0 && completed >= total;

                      return (
                        <div
                          key={study.progressId || study.id}
                          className={`p-4 rounded-xl border transition-colors ${
                            isComplete ? 'bg-green-50/50 border-green-300' : 'bg-white/80 border-amber-200 hover:bg-amber-50'
                          }`}
                        >
                          <div className="flex items-start gap-3">
                            <input
                              type="checkbox"
                              checked={selectedStudyIds.has(study.progressId)}
                              onChange={() => {
                                const next = new Set(selectedStudyIds);
                                next.has(study.progressId) ? next.delete(study.progressId) : next.add(study.progressId);
                                setSelectedStudyIds(next);
                              }}
                              className="mt-1 w-4 h-4"
                            />
                            <div className="flex-1 min-w-0">
                              {editingStudyId === study.progressId ? (
                                <div className="flex items-center gap-2 mb-2">
                                  <span className="text-amber-900 font-medium">{study.title}</span>
                                  <span className="text-amber-600">-</span>
                                  <input
                                    type="text"
                                    value={studyLabel}
                                    onChange={(e) => setStudyLabel(e.target.value)}
                                    placeholder="e.g., with Sarah"
                                    className="flex-1 px-2 py-1 border border-amber-300 rounded text-sm"
                                    autoFocus
                                  />
                                  <button onClick={() => handleUpdateStudyLabel(study.progressId)} className="px-2 py-1 bg-amber-600 text-white rounded text-sm">Save</button>
                                  <button onClick={() => { setEditingStudyId(null); setStudyLabel(''); }} className="px-2 py-1 bg-gray-500 text-white rounded text-sm">Cancel</button>
                                </div>
                              ) : (
                                <h4 className="font-bold text-amber-900 flex items-center gap-2">
                                  {study.title}
                                  {study.progress?.label && <span className="text-amber-600 font-normal">- {study.progress.label}</span>}
                                  {isComplete && <span className="text-green-600" title="Complete"><svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" /></svg></span>}
                                </h4>
                              )}
                              <div className="mt-2 flex items-center gap-3">
                                <div className="flex-1 max-w-[200px] h-2 bg-amber-200 rounded-full overflow-hidden">
                                  <div className={`h-full ${isComplete ? 'bg-green-500' : 'bg-amber-500'}`} style={{ width: `${percent}%` }} />
                                </div>
                                <span className="text-xs text-amber-600">{completed} of {total} lessons</span>
                              </div>
                              <p className="text-amber-600/50 text-xs mt-1">{study.progress?.last_activity_at ? `Last: ${formatDate(study.progress.last_activity_at)}` : ''}</p>
                            </div>
                            <div className="flex items-center gap-1">
                              <button onClick={() => { setEditingStudyId(study.progressId); setStudyLabel(study.progress?.label || ''); }} className="p-1.5 text-amber-600 hover:text-amber-800" title="Edit label">
                                <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20"><path d="M13.586 3.586a2 2 0 112.828 2.828l-.793.793-2.828-2.828.793-.793zM11.379 5.793L3 14.172V17h2.828l8.38-8.379-2.83-2.828z" /></svg>
                              </button>
                              <button onClick={() => handleStartStudyAgain(study.id, study.title)} className="p-1.5 text-green-600 hover:text-green-800" title="Start again">
                                <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M4 2a1 1 0 011 1v2.101a7.002 7.002 0 0111.601 2.566 1 1 0 11-1.885.666A5.002 5.002 0 005.999 7H9a1 1 0 010 2H4a1 1 0 01-1-1V3a1 1 0 011-1zm.008 9.057a1 1 0 011.276.61A5.002 5.002 0 0014.001 13H11a1 1 0 110-2h5a1 1 0 011 1v5a1 1 0 11-2 0v-2.101a7.002 7.002 0 01-11.601-2.566 1 1 0 01.61-1.276z" clipRule="evenodd" /></svg>
                              </button>
                              <button onClick={() => handleDeleteStudyProgress(study.progressId)} className="p-1.5 text-red-500 hover:text-red-700" title="Remove">
                                <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M9 2a1 1 0 00-.894.553L7.382 4H4a1 1 0 000 2v10a2 2 0 002 2h8a2 2 0 002-2V6a1 1 0 100-2h-3.382l-.724-1.447A1 1 0 0011 2H9zM7 8a1 1 0 012 0v6a1 1 0 11-2 0V8zm5-1a1 1 0 00-1 1v6a1 1 0 102 0V8a1 1 0 00-1-1z" clipRule="evenodd" /></svg>
                              </button>
                              <Link to={`/studies/${study.id}?progress=${study.progressId}`} className="px-3 py-1.5 bg-amber-600 text-white rounded-lg text-sm font-medium hover:bg-amber-700">
                                {isComplete ? 'Review' : 'Continue'}
                              </Link>
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </>
            )}
          </section>
        </ScrollWrap>
      </ScrollBackground>
      <FooterScroll />
    </PreviewLayout>
  );
};

export default MyWalkPageScroll;
