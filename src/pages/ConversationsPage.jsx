import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { useConversation } from '../contexts/ConversationContext.jsx';

const ConversationsPage = () => {
  console.log('[ConversationsPage] Rendering');
  
  /* ------------------------------------------------------------------
   * Detect SKIP_AUTH flag (query param or env var)
   * When SKIP_AUTH is enabled we treat the user as “virtually” logged in
   * so that developers can test the UI without going through Supabase.
   * ------------------------------------------------------------------ */
  const params = new URLSearchParams(window.location.search);
  const SKIP_AUTH =
    params.get('skipAuth') === '1' ||
    import.meta.env.VITE_SKIP_AUTH === 'true';

  const { user, isAuthenticated } = useAuth();

  // ------------------------------------------------------------------
  // Extra diagnostic logging so we can see what auth / skipAuth flags
  // are active when the page renders.
  // ------------------------------------------------------------------
  console.log('[ConversationsPage] Authentication status:', {
    isAuthenticated,
    skipAuth: SKIP_AUTH,
  });

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
    // Fetch when authenticated OR when auth checks are bypassed
    if ((isAuthenticated || SKIP_AUTH) && typeof fetchConversations === 'function') {
      console.log('[ConversationsPage] Fetching conversations');
      fetchConversations()
        .then((result) => {
          console.log('[ConversationsPage] Fetch result:', result);
          if (!result || result.length === 0) {
            console.log('[ConversationsPage] No conversations found');
          } else {
            console.log(`[ConversationsPage] Found ${result.length} conversations`);
          }
        })
        .catch(err => {
          console.error('[ConversationsPage] Error fetching conversations:', err);
        });
      setHasAttemptedLoad(true);
    } else {
      // Helpful diagnostic when conversations aren't fetched
      console.log('[ConversationsPage] Not fetching conversations:', {
        isAuthenticated,
        skipAuth: SKIP_AUTH,
        hasFetchFunction: typeof fetchConversations === 'function',
      });
    }
  }, [isAuthenticated, fetchConversations, SKIP_AUTH]);

  // Helper: format date
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
  if (!isAuthenticated && !SKIP_AUTH) {
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

  // Log conversations each render for debugging
  console.log('[ConversationsPage] Rendering with conversations:', conversations);

  return (
    <div className="min-h-screen bg-blue-900 text-white">
      <div className="container mx-auto px-4 py-8">
        <div className="flex items-center justify-between mb-8">
          <h1 className="text-3xl font-bold text-yellow-300">Your Conversations</h1>
          <Link
            to="/"
            className="px-4 py-2 bg-yellow-400 text-blue-900 rounded-lg font-semibold hover:bg-yellow-300 transition-colors"
          >
            Back to Home
          </Link>
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

        {/* Empty state */}
        {!isLoading && (!conversations || conversations.length === 0) && (
          <div className="bg-[rgba(255,255,255,0.05)] rounded-lg p-8 text-center">
            <h3 className="text-xl font-semibold text-yellow-300 mb-4">
              No Conversations Yet
            </h3>
            <p className="text-blue-100 mb-6">
              You haven't saved any conversations yet. Start a chat with a biblical character to begin!
            </p>
            <Link
              to="/"
              className="px-4 py-2 bg-yellow-400 text-blue-900 rounded-lg font-semibold hover:bg-yellow-300 transition-colors"
            >
              Browse Characters
            </Link>

            {/* Debug button – helps diagnose why conversations might not appear */}
            <div className="mt-4">
              <button
                onClick={() => {
                  console.log('[ConversationsPage] Manual fetch triggered');
                  if (typeof fetchConversations === 'function') {
                    fetchConversations().then((result) => {
                      console.log(
                        '[ConversationsPage] Manual fetch result:',
                        result,
                      );
                    });
                  } else {
                    console.warn(
                      '[ConversationsPage] fetchConversations is not a function',
                    );
                  }
                }}
                className="px-4 py-2 bg-purple-500 text-white rounded-lg font-semibold hover:bg-purple-600 transition-colors"
              >
                Refresh Conversations
              </button>
            </div>
          </div>
        )}

        {/* Simple conversations list */}
        {conversations && conversations.length > 0 && (
          <div className="space-y-4">
            {conversations.map((conv) => (
              <div 
                key={conv.id}
                className="bg-[rgba(255,255,255,0.05)] p-4 rounded-lg hover:bg-[rgba(255,255,255,0.1)] transition-colors"
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
                        {conv.title || "Untitled Conversation"}
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
      </div>
    </div>
  );
};

export default ConversationsPage;
