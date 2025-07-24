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

        {/* When ConversationContext hasn't been wired yet */}
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
    </div>
  );
};

export default ConversationsPage;
