import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { useConversation } from '../contexts/ConversationContext.jsx';
import { characterRepository } from '../repositories/characterRepository';
import userFavoritesRepository from '../repositories/userFavoritesRepository';
import userSettingsRepository from '../repositories/userSettingsRepository';
import Header from '../components/Header';
import Footer from '../components/Footer';
import CharacterCard from '../components/CharacterCard.jsx';
import conversationRepository from '../repositories/conversationRepository';

const MyWalkPage = () => {
  const { user, loading, isAuthenticated } = useAuth();
  const {
    conversations = [],
    fetchConversations,
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

  // State for renaming conversations
  const [renamingConversationId, setRenamingConversationId] = useState(null);
  const [newTitle, setNewTitle] = useState('');

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
      // Offer to clear local storage copy
      try {
        localStorage.removeItem('mockConversationStorage');
        localStorage.removeItem('bypass_auth');
      } catch {}
      alert(`Import complete. Created: ${results.created}. Failed: ${results.failed}.`);
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
        {(() => {
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
          <h2 className="text-2xl font-semibold text-yellow-300 mb-4">
            Saved Conversations
          </h2>

          {/* Empty state for conversations */}
          {!conversationsLoading && (!conversations || conversations.length === 0) && (
            <div className="bg-[rgba(255,255,255,0.05)] rounded-lg p-6 text-center">
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

          {/* Conversations list */}
          {conversations && conversations.length > 0 && (
            <div className="space-y-4">
              {conversations.map(conv => (
                <div
                  key={conv.id}
                  className={`p-4 rounded-lg transition-colors ${
                    conv.is_favorite
                      ? 'bg-[rgba(255,223,118,0.08)] hover:bg-[rgba(255,223,118,0.12)] border border-yellow-400/30'
                      : 'bg-[rgba(255,255,255,0.05)] hover:bg-[rgba(255,255,255,0.1)]'
                  }`}
                >
                  {/* Header with title + rename */}
                  <div className="flex justify-between items-center mb-2">
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
                        </h3>
                        <span className="text-blue-200 text-sm flex-shrink-0">
                          {formatDate(conv.updated_at)}
                        </span>
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
        </section>
      </div>
      <Footer />
    </div>
  );
};

export default MyWalkPage;
