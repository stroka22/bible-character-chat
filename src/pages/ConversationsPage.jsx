import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { useConversation } from '../contexts/ConversationContext.jsx';

const ConversationsPage = () => {
  const { user, isAuthenticated } = useAuth();

  const {
    conversations,
    fetchConversations,
    isLoading,
    error,
  } = useConversation();

  // Track first load to decide whether to show spinner
  const [isFirstLoad, setIsFirstLoad] = useState(true);

  // Fetch conversations on mount / when auth state changes
  useEffect(() => {
    if (isAuthenticated) {
      fetchConversations();
      setIsFirstLoad(false);
    }
  }, [isAuthenticated, fetchConversations]);

  // Helper: avatar URL
  const getAvatarUrl = (character) => {
    if (!character) return `https://ui-avatars.com/api/?name=Unknown&background=random`;
    return (
      character.avatar_url ||
      `https://ui-avatars.com/api/?name=${encodeURIComponent(
        character.name,
      )}&background=random`
    );
  };

  // Helper: format date
  const formatDate = (iso) => {
    if (!iso) return '';
    return new Date(iso).toLocaleDateString(undefined, {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  };

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
        {isLoading && isFirstLoad && (
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
        {!isLoading && conversations.length === 0 && (
          <div className="bg-[rgba(255,255,255,0.05)] rounded-lg p-8 text-center">
            <h3 className="text-xl font-semibold text-yellow-300 mb-4">
              No Conversations Yet
            </h3>
            <p className="text-blue-100 mb-6">
              You haven&apos;t saved any conversations yet. Start a chat with a biblical character to begin!
            </p>
            <Link
              to="/"
              className="px-4 py-2 bg-yellow-400 text-blue-900 rounded-lg font-semibold hover:bg-yellow-300 transition-colors"
            >
              Browse Characters
            </Link>
          </div>
        )}

        {/* Conversations grid */}
        {conversations.length > 0 && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {conversations.map((conv) => (
              <div
                key={conv.id}
                className="bg-[rgba(255,255,255,0.05)] backdrop-blur-sm rounded-lg border border-[rgba(255,255,255,0.1)] overflow-hidden hover:border-yellow-400/50 transition-all duration-300"
              >
                {/* header */}
                <div className="p-4 flex items-center space-x-3 border-b border-[rgba(255,255,255,0.1)]">
                  <img
                    src={getAvatarUrl(conv.characters)}
                    alt={conv.characters?.name || 'Character'}
                    className="h-10 w-10 rounded-full object-cover border-2 border-yellow-400/50"
                  />
                  <div className="flex-1 min-w-0">
                    <h3 className="text-yellow-300 font-bold truncate">
                      {conv.title ||
                        `Conversation with ${conv.characters?.name || 'Unknown'}`}
                    </h3>
                    <p className="text-blue-200 text-sm">
                      {formatDate(conv.updated_at)}
                    </p>
                  </div>
                  {conv.is_favorite && (
                    <span className="text-yellow-400">
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        className="h-5 w-5"
                        viewBox="0 0 20 20"
                        fill="currentColor"
                      >
                        <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118l-2.8-2.034c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                      </svg>
                    </span>
                  )}
                </div>

                {/* body */}
                <div className="p-4">
                  <p className="text-white/70 text-sm line-clamp-2 mb-4">
                    {conv.last_message_preview || 'No messages yet'}
                  </p>
                  <Link
                    to={`/chat/${conv.id}`}
                    className="inline-flex items-center text-sm text-yellow-400 hover:text-yellow-300"
                  >
                    <span>Continue conversation</span>
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
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default ConversationsPage;
