import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useConversation } from '../contexts/ConversationContext';
import { useAuth } from '../contexts/AuthContext';

const ConversationsPage = () => {
  const navigate = useNavigate();
  const { user, isAuthenticated } = useAuth();
  const { conversations, fetchConversations, isLoading, error } = useConversation();

  /* ------------------------------------------------------------------
   * This simplified page purposely omits advanced filtering / modals
   * until the full ConversationContext is finalised.
   * ------------------------------------------------------------------ */

  // Fetch conversations on component mount
  useEffect(() => {
    if (isAuthenticated) {
      fetchConversations();
    }
  }, [isAuthenticated, fetchConversations]);

  // Handle filter changes
  const handleFilterChange = (filterName, value) => {
    setFilters(prev => ({
      ...prev,
      [filterName]: value
    }));
  };

  // Handle resuming a conversation
  const handleResumeConversation = (conversationId) => {
    navigate(`/chat/${conversationId}`);
  };

  // Handle toggling favorite status
  const handleToggleFavorite = async (conversationId, currentStatus) => {
    await updateConversation(conversationId, { is_favorite: !currentStatus });
  };

  // Handle opening rename modal
  const handleOpenRenameModal = (conversation) => {
    setRenameModal({
      isOpen: true,
      conversationId: conversation.id,
      title: conversation.title
    });
  };

  // Handle saving renamed conversation
  const handleSaveRename = async () => {
    if (renameModal.conversationId && renameModal.title.trim()) {
      await updateConversation(renameModal.conversationId, { title: renameModal.title });
      setRenameModal({ isOpen: false, conversationId: null, title: '' });
    }
  };

  // Handle opening delete confirmation
  const handleConfirmDelete = (conversationId) => {
    setConfirmDelete({
      isOpen: true,
      conversationId
    });
  };

  // Handle deleting conversation
  const handleDeleteConversation = async () => {
    if (confirmDelete.conversationId) {
      await deleteConversation(confirmDelete.conversationId);
      setConfirmDelete({ isOpen: false, conversationId: null });
    }
  };

  // Handle sharing conversation
  const handleShareConversation = async (conversation) => {
    if (conversation.is_shared && conversation.share_code) {
      // Already shared, just open the modal with existing code
      const shareUrl = `${window.location.origin}/shared/${conversation.share_code}`;
      setShareModal({
        isOpen: true,
        conversationId: conversation.id,
        shareCode: conversation.share_code,
        shareUrl
      });
    } else {
      // Generate new share code
      const shareCode = await shareConversation(conversation.id);
      if (shareCode) {
        const shareUrl = `${window.location.origin}/shared/${shareCode}`;
        setShareModal({
          isOpen: true,
          conversationId: conversation.id,
          shareCode,
          shareUrl
        });
      }
    }
  };

  // Handle stopping sharing
  const handleStopSharing = async (conversationId) => {
    await stopSharing(conversationId);
    setShareModal({ isOpen: false, conversationId: null, shareCode: null, shareUrl: null });
  };

  // Copy share link to clipboard
  const copyShareLink = () => {
    if (shareModal.shareUrl) {
      navigator.clipboard.writeText(shareModal.shareUrl)
        .then(() => {
          // Show a temporary "Copied!" message
          const copyButton = document.getElementById('copy-share-link');
          if (copyButton) {
            const originalText = copyButton.textContent;
            copyButton.textContent = 'Copied!';
            setTimeout(() => {
              copyButton.textContent = originalText;
            }, 2000);
          }
        })
        .catch(err => {
          console.error('Failed to copy: ', err);
        });
    }
  };

  // Format date for display
  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return new Intl.DateTimeFormat('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
      hour: 'numeric',
      minute: 'numeric'
    }).format(date);
  };

  // Get a preview of the last message
  const getMessagePreview = (conversation) => {
    return conversation.last_message_preview || 'No messages yet';
  };

  if (!isAuthenticated) {
    return (
      <div className="flex h-full w-full items-center justify-center bg-blue-900 p-4 text-white">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-yellow-300 mb-4">Sign In Required</h2>
          <p className="text-blue-100 mb-6">Please sign in to view your conversations.</p>
          <Link 
            to="/login" 
            className="px-4 py-2 bg-yellow-400 text-blue-900 rounded-lg font-semibold hover:bg-yellow-300 transition-colors"
          >
            Sign In
          </Link>
        </div>
      </div>
    );
  }

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

        {/* When ConversationContext hasn’t been wired yet */}
        {typeof conversations === 'undefined' && (
          <p className="text-center text-blue-200 bg-[rgba(255,255,255,.05)] py-12 rounded-lg">
            Conversation management coming soon…
          </p>
        )}

        {/* Loading / error states */}
        {isLoading && (
          <div className="flex justify-center py-12">
            <div className="animate-spin h-10 w-10 border-4 border-yellow-400 border-t-transparent rounded-full"></div>
          </div>
        )}
        {error && !isLoading && (
          <p className="text-center text-red-300">{error}</p>
        )}

        {/* Simple list when data is available */}
        {!isLoading && conversations && conversations.length === 0 && (
          <p className="text-center text-blue-200">You have no saved conversations yet.</p>
        )}

        {!isLoading && conversations && conversations.length > 0 && (
          <ul className="space-y-3">
            {conversations.map((conv) => (
              <li key={conv.id}>
                <button
                  onClick={() => navigate(`/chat/${conv.id}`)}
                  className="w-full flex justify-between items-center bg-[rgba(255,255,255,.05)] hover:bg-[rgba(255,255,255,.1)] border border-yellow-400/20 px-4 py-3 rounded-lg"
                >
                  <span className="font-semibold">{conv.title || 'Untitled Conversation'}</span>
                  <span className="text-xs text-blue-200">
                    {new Date(conv.updated_at || conv.created_at).toLocaleDateString()}
                  </span>
                </button>
              </li>
            ))}
          </ul>
        )}
      </div>

              >
                <option value="all">All Testaments</option>
                <option value="old">Old Testament</option>
                <option value="new">New Testament</option>
              </select>
            </div>

            {/* Favorites Filter */}
            <div className="flex items-end">
              <label className="inline-flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  checked={filters.favoritesOnly}
                  onChange={(e) => handleFilterChange('favoritesOnly', e.target.checked)}
                  className="sr-only peer"
                />
                <div className="relative w-11 h-6 bg-[rgba(255,255,255,.1)] peer-focus:outline-none peer-focus:ring-2 peer-focus:ring-yellow-400 rounded-full peer peer-checked:after:translate-x-full rtl:peer-checked:after:-translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:start-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-yellow-400"></div>
                <span className="ms-3 text-sm font-medium text-blue-100">Favorites Only</span>
              </label>
            </div>
          </div>
        </div>

        {/* Conversations List */}
        {isLoading ? (
          <div className="flex justify-center items-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-yellow-400"></div>
          </div>
        ) : error ? (
          <div className="bg-red-900/50 border border-red-500 rounded-lg p-4 text-center">
            <p className="text-red-200">{error}</p>
            <button 
              onClick={() => fetchConversations()} 
              className="mt-2 px-4 py-2 bg-red-700 text-white rounded-md hover:bg-red-600 transition-colors"
            >
              Try Again
            </button>
          </div>
        ) : filteredConversations.length === 0 ? (
          <div className="bg-[rgba(255,255,255,.05)] rounded-lg p-8 text-center">
            {conversations.length === 0 ? (
              <>
                <h3 className="text-xl font-semibold text-yellow-300 mb-2">No Conversations Yet</h3>
                <p className="text-blue-100 mb-6">Start a conversation with a biblical character to see it here.</p>
                <Link 
                  to="/" 
                  className="px-4 py-2 bg-yellow-400 text-blue-900 rounded-lg font-semibold hover:bg-yellow-300 transition-colors"
                >
                  Browse Characters
                </Link>
              </>
            ) : (
              <>
                <h3 className="text-xl font-semibold text-yellow-300 mb-2">No Matching Conversations</h3>
                <p className="text-blue-100 mb-6">Try adjusting your filters to see more conversations.</p>
                <button 
                  onClick={() => setFilters({ search: '', character: 'all', favoritesOnly: false, testament: 'all' })}
                  className="px-4 py-2 bg-[rgba(255,255,255,.15)] text-white rounded-lg font-semibold hover:bg-[rgba(255,255,255,.25)] transition-colors"
                >
                  Clear Filters
                </button>
              </>
            )}
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredConversations.map((conversation) => (
              <div 
                key={conversation.id} 
                className={`bg-[rgba(255,255,255,.05)] border ${conversation.is_favorite ? 'border-yellow-400' : 'border-[rgba(255,255,255,.1)]'} rounded-lg overflow-hidden hover:shadow-lg transition-all duration-300`}
              >
                <div className="p-4">
                  <div className="flex items-center mb-3">
                    {conversation.characters?.avatar_url ? (
                      <img 
                        src={conversation.characters.avatar_url} 
                        alt={conversation.characters?.name || 'Character'} 
                        className="w-12 h-12 rounded-full object-cover border-2 border-yellow-400 mr-3"
                        onError={(e) => {
                          e.target.src = `https://ui-avatars.com/api/?name=${encodeURIComponent(conversation.characters?.name || 'Character')}&background=random`;
                        }}
                      />
                    ) : (
                      <div className="w-12 h-12 rounded-full bg-blue-700 flex items-center justify-center text-yellow-400 font-bold border-2 border-yellow-400 mr-3">
                        {(conversation.characters?.name || 'C').charAt(0)}
                      </div>
                    )}
                    <div className="flex-1 min-w-0">
                      <h3 className="text-lg font-semibold text-yellow-300 truncate" title={conversation.title}>
                        {conversation.title}
                      </h3>
                      <p className="text-sm text-blue-200">
                        {conversation.characters?.name || 'Unknown Character'}
                      </p>
                    </div>
                    <button 
                      onClick={() => handleToggleFavorite(conversation.id, conversation.is_favorite)}
                      className="ml-2 text-gray-300 hover:text-yellow-400 transition-colors"
                      title={conversation.is_favorite ? "Remove from favorites" : "Add to favorites"}
                    >
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill={conversation.is_favorite ? "currentColor" : "none"} viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={conversation.is_favorite ? 0 : 2} d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z" />
                      </svg>
                    </button>
                  </div>
                  
                  <div className="mb-3">
                    <p className="text-sm text-blue-100 line-clamp-2" title={getMessagePreview(conversation)}>
                      {getMessagePreview(conversation)}
                    </p>
                  </div>
                  
                  <div className="flex items-center justify-between text-xs text-blue-300 mb-4">
                    <span title={formatDate(conversation.updated_at)}>
                      {formatDate(conversation.updated_at)}
                    </span>
                    {conversation.is_shared && (
                      <span className="bg-yellow-400/20 text-yellow-300 px-2 py-1 rounded-full">
                        Shared
                      </span>
                    )}
                  </div>
                  
                  <div className="flex justify-between gap-2">
                    <button
                      onClick={() => handleResumeConversation(conversation.id)}
                      className="flex-1 px-3 py-2 bg-yellow-400 text-blue-900 rounded-md font-semibold hover:bg-yellow-300 transition-colors"
                    >
                      Resume
                    </button>
                    <div className="relative group">
                      <button
                        className="px-3 py-2 bg-[rgba(255,255,255,.1)] text-white rounded-md hover:bg-[rgba(255,255,255,.2)] transition-colors"
                      >
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                          <path d="M10 6a2 2 0 110-4 2 2 0 010 4zM10 12a2 2 0 110-4 2 2 0 010 4zM10 18a2 2 0 110-4 2 2 0 010 4z" />
                        </svg>
                      </button>
                      <div className="absolute right-0 mt-2 w-48 bg-blue-800 rounded-md shadow-lg overflow-hidden z-10 hidden group-hover:block">
                        <div className="py-1">
                          <button
                            onClick={() => handleOpenRenameModal(conversation)}
                            className="w-full text-left px-4 py-2 text-sm text-blue-100 hover:bg-blue-700 hover:text-white transition-colors"
                          >
                            Rename
                          </button>
                          <button
                            onClick={() => handleShareConversation(conversation)}
                            className="w-full text-left px-4 py-2 text-sm text-blue-100 hover:bg-blue-700 hover:text-white transition-colors"
                          >
                            {conversation.is_shared ? 'Manage Sharing' : 'Share'}
                          </button>
                          <button
                            onClick={() => handleConfirmDelete(conversation.id)}
                            className="w-full text-left px-4 py-2 text-sm text-red-300 hover:bg-red-900/50 hover:text-red-100 transition-colors"
                          >
                            Delete
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Rename Modal */}
      {renameModal.isOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-blue-800 rounded-lg shadow-xl max-w-md w-full p-6">
            <h3 className="text-xl font-semibold text-yellow-300 mb-4">Rename Conversation</h3>
            <input
              type="text"
              value={renameModal.title}
              onChange={(e) => setRenameModal({ ...renameModal, title: e.target.value })}
              className="w-full px-3 py-2 bg-[rgba(255,255,255,.1)] border border-[rgba(255,255,255,.2)] rounded-md text-white focus:outline-none focus:ring-2 focus:ring-yellow-400 mb-4"
              placeholder="Enter new title"
            />
            <div className="flex justify-end space-x-3">
              <button
                onClick={() => setRenameModal({ isOpen: false, conversationId: null, title: '' })}
                className="px-4 py-2 bg-[rgba(255,255,255,.1)] text-white rounded-md hover:bg-[rgba(255,255,255,.2)] transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleSaveRename}
                className="px-4 py-2 bg-yellow-400 text-blue-900 rounded-md font-semibold hover:bg-yellow-300 transition-colors"
                disabled={!renameModal.title.trim()}
              >
                Save
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {confirmDelete.isOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-blue-800 rounded-lg shadow-xl max-w-md w-full p-6">
            <h3 className="text-xl font-semibold text-yellow-300 mb-2">Delete Conversation</h3>
            <p className="text-blue-100 mb-4">
              Are you sure you want to delete this conversation? This action cannot be undone.
            </p>
            <div className="flex justify-end space-x-3">
              <button
                onClick={() => setConfirmDelete({ isOpen: false, conversationId: null })}
                className="px-4 py-2 bg-[rgba(255,255,255,.1)] text-white rounded-md hover:bg-[rgba(255,255,255,.2)] transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleDeleteConversation}
                className="px-4 py-2 bg-red-600 text-white rounded-md font-semibold hover:bg-red-500 transition-colors"
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Share Modal */}
      {shareModal.isOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-blue-800 rounded-lg shadow-xl max-w-md w-full p-6">
            <h3 className="text-xl font-semibold text-yellow-300 mb-4">
              {shareModal.shareCode ? 'Share Conversation' : 'Generating Share Link...'}
            </h3>
            
            {shareModal.shareCode ? (
              <>
                <p className="text-blue-100 mb-4">
                  Share this link with others to let them view this conversation:
                </p>
                <div className="flex mb-4">
                  <input
                    type="text"
                    readOnly
                    value={shareModal.shareUrl}
                    className="flex-1 px-3 py-2 bg-[rgba(255,255,255,.1)] border border-[rgba(255,255,255,.2)] rounded-l-md text-white focus:outline-none"
                  />
                  <button
                    id="copy-share-link"
                    onClick={copyShareLink}
                    className="px-4 py-2 bg-yellow-400 text-blue-900 rounded-r-md font-semibold hover:bg-yellow-300 transition-colors"
                  >
                    Copy
                  </button>
                </div>
                <div className="flex justify-between">
                  <button
                    onClick={() => handleStopSharing(shareModal.conversationId)}
                    className="px-4 py-2 bg-red-600 text-white rounded-md font-semibold hover:bg-red-500 transition-colors"
                  >
                    Stop Sharing
                  </button>
                  <button
                    onClick={() => setShareModal({ isOpen: false, conversationId: null, shareCode: null, shareUrl: null })}
                    className="px-4 py-2 bg-[rgba(255,255,255,.1)] text-white rounded-md hover:bg-[rgba(255,255,255,.2)] transition-colors"
                  >
                    Close
                  </button>
                </div>
              </>
            ) : (
              <div className="flex justify-center">
                <div className="animate-spin rounded-full h-10 w-10 border-t-2 border-b-2 border-yellow-400"></div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default ConversationsPage;
