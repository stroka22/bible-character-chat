import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { useConversation } from '../contexts/ConversationContext.jsx';
import Header from '../components/Header';
import Footer from '../components/Footer';
import { characterRepository } from '../repositories/characterRepository';
import CharacterCard from '../components/CharacterCard';

const ConversationsPage = () => {
  console.log('[ConversationsPage] Rendering');
  
  const { user, loading, isAuthenticated } = useAuth();
  console.log('[ConversationsPage] Auth state:', { user: !!user, loading, isAuthenticated });

  const {
    conversations = [],
    fetchConversations,
    updateConversation,
    deleteConversation,
    isLoading,
    error,
  } = useConversation() || {};

  // State to track if we've tried loading
  const [hasAttemptedLoad, setHasAttemptedLoad] = useState(false);

  // ------------------------------------------------------------------
  // Local UI state for renaming a conversation
  // ------------------------------------------------------------------
  const [renamingConversationId, setRenamingConversationId] = useState(null);
  const [newTitle, setNewTitle] = useState('');

  // ------------------------------------------------------------------
  // Show only favorites toggle
  // ------------------------------------------------------------------
  const [showOnlyFavorites, setShowOnlyFavorites] = useState(false);

  /* ------------------------------------------------------------------
   * Favorite characters for quick access
   * ------------------------------------------------------------------ */
  const [favoriteCharacters, setFavoriteCharacters] = useState([]);
  const [favLoading, setFavLoading] = useState(true);

  useEffect(() => {
    // Load favorite characters once on mount
    const loadFavorites = async () => {
      try {
        const allCharacters = await characterRepository.getAll();
        const saved = localStorage.getItem('favoriteCharacters');
        const favIds = saved ? JSON.parse(saved) : [];
        const favChars = allCharacters.filter((c) => favIds.includes(c.id));
        setFavoriteCharacters(favChars);
      } catch (e) {
        console.error('Failed loading favorite characters:', e);
      } finally {
        setFavLoading(false);
      }
    };
    loadFavorites();
  }, []);

  /* ------------------------------------------------------------------
   * Toggle a character in the favourites list (and persist to storage)
   * ------------------------------------------------------------------ */
  const handleToggleFavoriteCharacter = (charId) => {
    setFavoriteCharacters((prev) => {
      let updated;
      if (prev.some((c) => c.id === charId)) {
        // remove
        updated = prev.filter((c) => c.id !== charId);
      } else {
        // add – find character details from repository-loaded list first
        const charObj =
          favoriteCharacters.find((c) => c.id === charId) ||
          null; /* fallback if not in current list */;
        if (charObj) {
          updated = [...prev, charObj];
        } else {
          // character not present locally – leave list unchanged
          updated = prev;
        }
      }

      // Persist ID list (not full objects) to localStorage
      try {
        localStorage.setItem(
          'favoriteCharacters',
          JSON.stringify(updated.map((c) => c.id)),
        );
        /* Manual StorageEvent for cross-tab sync */
        window.dispatchEvent(
          new StorageEvent('storage', {
            key: 'favoriteCharacters',
            newValue: JSON.stringify(updated.map((c) => c.id)),
          }),
        );
      } catch (e) {
        console.error('Failed to update favoriteCharacters in localStorage', e);
      }

      return updated;
    });
  };

  /* ------------------------------------------------------------------
   * Delete conversation helper
   * ------------------------------------------------------------------ */
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

  // Fetch conversations when authenticated
  useEffect(() => {
    console.log('[ConversationsPage] useEffect for fetching conversations', { 
      isAuthenticated, 
      user: !!user,
      fetchConversationsExists: typeof fetchConversations === 'function' 
    });
    
    if (user && typeof fetchConversations === 'function') {
      console.log('[ConversationsPage] Fetching conversations');
      fetchConversations().finally(() => setHasAttemptedLoad(true));
    }
  }, [user, fetchConversations]);

  // Add a failsafe timeout to ensure hasAttemptedLoad gets set to true
  useEffect(() => {
    if (!hasAttemptedLoad) {
      console.log('[ConversationsPage] Setting up failsafe timeout for hasAttemptedLoad');
      const timer = setTimeout(() => {
        console.log('[ConversationsPage] Failsafe timeout triggered - setting hasAttemptedLoad to true');
        setHasAttemptedLoad(true);
      }, 3000); // 3 seconds timeout
      return () => clearTimeout(timer);
    }
  }, [hasAttemptedLoad]);

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

  /* ------------------------------------------------------------------
   * Replace "Unknown" in conversation titles with actual character name
   * ------------------------------------------------------------------ */
  const fixTitle = (title, characterId) => {
    // Short-circuit if nothing to fix
    if (!title || !title.includes('Unknown')) return title;

    // Static lookup map (keep in sync with mock data)
    const characterNames = {
      1: 'Moses',
      2: 'David',
      3: 'Esther',
      4: 'Mary',
      5: 'Paul',
      6: 'Peter',
      7: 'Abraham',
      8: 'John',
      9: 'Ruth',
      10: 'Daniel',
    };

    /* --------------------------------------------------------------
     * Robust extraction of numeric ID or usable title
     * ------------------------------------------------------------*/
    let numericId = null;

    // Handle object variant e.g. { character_id: 1, title: 'Conversation …' }
    if (characterId && typeof characterId === 'object') {
      // 1) If nested title exists and is already correct, use it.
      if (
        typeof characterId.title === 'string' &&
        !characterId.title.includes('Unknown')
      ) {
        return characterId.title;
      }
      // 2) Otherwise pick the nested numeric ID
      if (characterId.character_id !== undefined) {
        numericId = Number(characterId.character_id);
      }
    } else if (!Number.isNaN(Number(characterId))) {
      numericId = Number(characterId);
    }

    const characterName = characterNames[numericId] || 'Unknown';
    return title.replace('Unknown', characterName);
  };

  // Placeholder when not logged in - using improved check that's more reliable
  if (!user && !loading && hasAttemptedLoad) {
    console.log('[ConversationsPage] Showing login required message');
    return (
      <div className="min-h-screen bg-blue-900 text-white">
        <div className="container mx-auto px-4 py-8">
          <div className="bg-[rgba(255,255,255,0.05)] rounded-lg p-8 text-center">
            <h3 className="text-xl font-semibold text-yellow-300 mb-4">
              Login Required
            </h3>
            <p className="text-blue-100 mb-6">
              Please log in to view your saved conversations.
            </p>
            <Link
              to="/login"
              className="px-4 py-2 bg-yellow-400 text-blue-900 rounded-lg font-semibold hover:bg-yellow-300 transition-colors"
            >
              Log In
            </Link>
          </div>
        </div>
      </div>
    );
  }

  // Show loading state while auth is still being determined
  if (loading && !hasAttemptedLoad) {
    console.log('[ConversationsPage] Showing loading state while auth is being determined');
    return (
      <div className="min-h-screen bg-blue-900 text-white">
        <div className="container mx-auto px-4 py-8">
          <div className="flex justify-center my-12">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-yellow-400" />
          </div>
          <p className="text-center text-blue-100">Loading your conversations...</p>
        </div>
      </div>
    );
  }

  console.log('[ConversationsPage] Rendering main content');
  return (
    <div className="min-h-screen bg-blue-900 text-white">
      {/* Site header */}
      <Header />

      <div className="container mx-auto px-4 py-8 pt-24">

        {/* Favorite Characters quick-access */}
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
                  /* dummy handlers to satisfy props */
                  onToggleFavorite={() => handleToggleFavoriteCharacter(char.id)}
                  isFeatured={false}
                  onSetAsFeatured={() => {}}
                />
              ))}
            </div>
          </section>
        )}

        <div className="flex items-center justify-between mb-8">
          <h1 className="text-3xl font-bold text-yellow-300">Your Conversations</h1>

          <div className="flex items-center gap-3">
            {/* Toggle favorites filter */}
            <button
              onClick={() => setShowOnlyFavorites(prev => !prev)}
              className={`px-3 py-1 rounded-md flex items-center text-sm font-semibold transition-colors ${
                showOnlyFavorites
                  ? 'bg-yellow-500 text-blue-900 hover:bg-yellow-400'
                  : 'bg-gray-700 text-gray-200 hover:bg-gray-600'
              }`}
              title={showOnlyFavorites ? 'Show all conversations' : 'Show only favorites'}
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-4 w-4 mr-1"
                viewBox="0 0 20 20"
                fill="currentColor"
              >
                <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118l-2.8-2.034c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
              </svg>
              {showOnlyFavorites ? 'Show All' : 'Show Favorites'}
            </button>

            <Link
              to="/"
              className="px-4 py-2 bg-yellow-400 text-blue-900 rounded-lg font-semibold hover:bg-yellow-300 transition-colors"
            >
              Back to Home
            </Link>
          </div>
        </div>

        {/* Loading spinner */}
        {isLoading && !hasAttemptedLoad && (
          <div className="flex justify-center my-12">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-yellow-400" />
          </div>
        )}

        {/* Error block */}
        {error && (
          <div className="bg-red-900/50 border border-red-500 rounded-lg p-4 mb-6">
            <p className="text-red-200">{error}</p>
          </div>
        )}

        {/* Wrap adjacent conditional renders in a React Fragment */}
        <>
          {/* Empty state (handles both no conversations and no favourites) */}
          {!isLoading &&
            ((!conversations || conversations.length === 0) ||
              (showOnlyFavorites &&
                conversations &&
                !conversations.some(c => c.is_favorite))) && (
            <div className="bg-[rgba(255,255,255,0.05)] rounded-lg p-8 text-center">
              <h3 className="text-xl font-semibold text-yellow-300 mb-4">
                {showOnlyFavorites && conversations && conversations.length > 0
                  ? 'No Favorite Conversations'
                  : 'No Conversations Yet'}
              </h3>
              <p className="text-blue-100 mb-6">
                {showOnlyFavorites && conversations && conversations.length > 0
                  ? "You haven't marked any conversations as favorites yet."
                  : "You haven't saved any conversations yet. Start a chat with a biblical character to begin!"}
              </p>
              {showOnlyFavorites && conversations && conversations.length > 0 ? (
                <button
                  onClick={() => setShowOnlyFavorites(false)}
                  className="px-4 py-2 bg-yellow-400 text-blue-900 rounded-lg font-semibold hover:bg-yellow-300 transition-colors"
                >
                  Show All Conversations
                </button>
              ) : (
                <Link
                  to="/"
                  className="px-4 py-2 bg-yellow-400 text-blue-900 rounded-lg font-semibold hover:bg-yellow-300 transition-colors"
                >
                  Browse Characters
                </Link>
              )}
            </div>
          )}

          {/* Simple conversations list */}
          {conversations &&
            conversations.length > 0 &&
            (!showOnlyFavorites || conversations.some(c => c.is_favorite)) && (
            <div className="space-y-4">
              {conversations
                .filter(conv => !showOnlyFavorites || conv.is_favorite)
                .map(conv => (
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
                          {fixTitle(conv.title, conv.character_id) || 'Untitled Conversation'}

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
        </>
      </div>
    </div>
  );
};

export default ConversationsPage;
