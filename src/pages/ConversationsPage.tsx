import React, { useState, useEffect, useCallback } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { useChat } from '../contexts/ChatContext';
import { chatRepository } from '../repositories/chatRepository';
import { characterRepository } from '../repositories/characterRepository';
import { type Chat, type Character } from '../services/supabase';

// Type for extended chat data with character information
interface EnhancedChat extends Chat {
  character?: Character;
}

// Interface for locally stored conversations in bypass mode
interface LocalChat {
  id: string;
  character_name: string;
  conversation_title: string;
  messages: { role: string; content: string }[];
  timestamp: string;
  is_favorite?: boolean;
}

const ConversationsPage: React.FC = () => {
  // State
  const [chats, setChats] = useState<EnhancedChat[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [showFavoritesOnly, setShowFavoritesOnly] = useState<boolean>(false);
  const [editingChatId, setEditingChatId] = useState<string | null>(null);
  const [newTitle, setNewTitle] = useState<string>('');
  const [bypassMode, setBypassMode] = useState<boolean>(false);

  // Hooks
  const { user } = useAuth();
  const { selectCharacter, resumeLocalChat } = useChat();
  const navigate = useNavigate();

  // Check for bypass mode on component mount
  useEffect(() => {
    const bypass = localStorage.getItem('bypass_auth') === 'true';
    setBypassMode(bypass);
  }, []);

  // Fetch user's chats or load from localStorage in bypass mode
  const fetchChats = useCallback(async () => {
    try {
      setIsLoading(true);
      setError(null);

      if (bypassMode) {
        // Load chats from localStorage in bypass mode
        const savedChatsJson = localStorage.getItem('savedChats');
        if (savedChatsJson) {
          const localChats: LocalChat[] = JSON.parse(savedChatsJson);
          
          // Convert local chats to the EnhancedChat format
          const enhancedLocalChats: EnhancedChat[] = localChats.map(localChat => ({
            id: localChat.id,
            user_id: 'local-user',
            character_id: 'local-character',
            title: localChat.conversation_title,
            is_favorite: localChat.is_favorite || false,
            created_at: localChat.timestamp,
            updated_at: localChat.timestamp,
            character: {
              id: 'local-character',
              name: localChat.character_name,
              description: '',
              persona_prompt: '',
              created_at: localChat.timestamp,
              updated_at: localChat.timestamp
            }
          }));
          
          setChats(enhancedLocalChats);
        } else {
          setChats([]);
        }
        setIsLoading(false);
        return;
      }

      // Regular database fetch for authenticated users
      if (!user) {
        setChats([]);
        setIsLoading(false);
        return;
      }

      // Get all chats for the current user
      const userChats = await chatRepository.getUserChats(user.id);

      // Enhance chats with character data
      const enhancedChats = await Promise.all(
        userChats.map(async (chat) => {
          try {
            const character = await characterRepository.getById(chat.character_id);
            return { ...chat, character };
          } catch (error) {
            console.error(`Failed to fetch character for chat ${chat.id}:`, error);
            return chat;
          }
        })
      );

      setChats(enhancedChats);
    } catch (error) {
      console.error('Failed to fetch chats:', error);
      setError('Failed to load your conversations. Please try again.');
    } finally {
      setIsLoading(false);
    }
  }, [user, bypassMode]);

  // Load chats on component mount and when user or bypass mode changes
  useEffect(() => {
    fetchChats();
  }, [fetchChats]);

  // Handle resuming a chat
  const handleResumeChat = async (chat: EnhancedChat) => {
    try {
      if (bypassMode) {
        /* In bypass mode we rely on ChatContext.resumeLocalChat
           which hydrates character and messages directly from
           localStorage. */
        const ok = await resumeLocalChat(chat.id);
        if (ok) {
          navigate('/');
        } else {
          setError('Failed to resume this local conversation.');
        }
        return;
      }

      if (!chat.character) {
        throw new Error('Character information is missing');
      }

      await selectCharacter(chat.character_id);
      navigate('/');
    } catch (error) {
      console.error('Failed to resume chat:', error);
      setError('Failed to resume the conversation. Please try again.');
    }
  };

  // Handle toggling favorite status
  const handleToggleFavorite = async (chatId: string, currentStatus: boolean) => {
    try {
      if (bypassMode) {
        // Handle favoriting in localStorage for bypass mode
        const savedChatsJson = localStorage.getItem('savedChats');
        if (savedChatsJson) {
          const localChats: LocalChat[] = JSON.parse(savedChatsJson);
          const updatedChats = localChats.map(chat => 
            chat.id === chatId ? { ...chat, is_favorite: !currentStatus } : chat
          );
          localStorage.setItem('savedChats', JSON.stringify(updatedChats));
        }
      } else {
        // Regular database update for authenticated users
        await chatRepository.toggleFavorite(chatId, !currentStatus);
      }
      
      // Update local state
      setChats((prevChats) =>
        prevChats.map((chat) =>
          chat.id === chatId ? { ...chat, is_favorite: !currentStatus } : chat
        )
      );
    } catch (error) {
      console.error('Failed to update favorite status:', error);
      setError('Failed to update favorite status. Please try again.');
    }
  };

  // Handle deleting a chat
  const handleDeleteChat = async (chatId: string) => {
    // Ask for confirmation
    const confirmed = window.confirm(
      'Are you sure you want to delete this conversation? This action cannot be undone.'
    );

    if (!confirmed) return;

    try {
      if (bypassMode) {
        // Handle deletion in localStorage for bypass mode
        const savedChatsJson = localStorage.getItem('savedChats');
        if (savedChatsJson) {
          const localChats: LocalChat[] = JSON.parse(savedChatsJson);
          const filteredChats = localChats.filter(chat => chat.id !== chatId);
          localStorage.setItem('savedChats', JSON.stringify(filteredChats));
        }
      } else {
        // Regular database deletion for authenticated users
        await chatRepository.deleteChat(chatId);
      }
      
      // Update local state
      setChats((prevChats) => prevChats.filter((chat) => chat.id !== chatId));
    } catch (error) {
      console.error('Failed to delete chat:', error);
      setError('Failed to delete the conversation. Please try again.');
    }
  };

  // Handle starting chat title editing
  const handleEditTitle = (chat: Chat) => {
    setEditingChatId(chat.id);
    setNewTitle(chat.title);
  };

  // Handle saving the edited title
  const handleSaveTitle = async (chatId: string) => {
    if (!newTitle.trim()) return;

    try {
      if (bypassMode) {
        // Handle title update in localStorage for bypass mode
        const savedChatsJson = localStorage.getItem('savedChats');
        if (savedChatsJson) {
          const localChats: LocalChat[] = JSON.parse(savedChatsJson);
          const updatedChats = localChats.map(chat => 
            chat.id === chatId ? { ...chat, conversation_title: newTitle.trim() } : chat
          );
          localStorage.setItem('savedChats', JSON.stringify(updatedChats));
        }
      } else {
        // Regular database update for authenticated users
        await chatRepository.updateChat(chatId, { title: newTitle.trim() });
      }
      
      // Update local state
      setChats((prevChats) =>
        prevChats.map((chat) =>
          chat.id === chatId ? { ...chat, title: newTitle.trim() } : chat
        )
      );
      
      // Exit edit mode
      setEditingChatId(null);
      setNewTitle('');
    } catch (error) {
      console.error('Failed to update chat title:', error);
      setError('Failed to update the conversation title. Please try again.');
    }
  };

  // Cancel title editing
  const handleCancelEdit = () => {
    setEditingChatId(null);
    setNewTitle('');
  };

  // Filter chats based on favorites toggle
  const filteredChats = showFavoritesOnly
    ? chats.filter((chat) => chat.is_favorite)
    : chats;

  // Format date for display
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString(undefined, {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  };

  // If user is not logged in and not in bypass mode, show a message
  if (!user && !bypassMode) {
    return (
      <div className="container mx-auto px-4 py-8">
        <h1 className="mb-6 text-2xl font-bold text-gray-900">My Conversations</h1>
        <div className="rounded-lg bg-yellow-50 p-6 text-center border border-yellow-200">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            className="h-12 w-12 mx-auto text-yellow-500 mb-4"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M12 15v2m0 0v3m0-3h3m-3 0h-3m-2-5a4 4 0 11-8 0 4 4 0 018 0zM3 20a6 6 0 0112 0v1H3v-1z"
            />
          </svg>
          <h2 className="text-xl font-semibold text-gray-800 mb-2">Sign In to View Your Conversations</h2>
          <p className="text-gray-600 mb-6">
            You need to be signed in to view and manage your saved conversations.
          </p>
          <div className="flex justify-center space-x-4">
            <Link
              to="/login"
              className="rounded-md bg-primary-600 px-4 py-2 text-white hover:bg-primary-700 transition-colors"
            >
              Log In
            </Link>
            <Link
              to="/signup"
              className="rounded-md bg-gray-200 px-4 py-2 text-gray-800 hover:bg-gray-300 transition-colors"
            >
              Sign Up
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <>
    <div className="container mx-auto px-4 py-8">
      <div className="mb-6 flex flex-col md:flex-row md:items-center md:justify-between">
        <h1 className="text-2xl font-bold text-gray-900 mb-4 md:mb-0">My Conversations</h1>
        
        <div className="flex items-center space-x-4">
          {/* Favorites filter toggle */}
          <label className="flex items-center cursor-pointer">
            <div className="relative">
              <input
                type="checkbox"
                className="sr-only"
                checked={showFavoritesOnly}
                onChange={() => setShowFavoritesOnly(!showFavoritesOnly)}
              />
              <div className={`block w-14 h-8 rounded-full ${showFavoritesOnly ? 'bg-primary-600' : 'bg-gray-300'}`}></div>
              <div className={`absolute left-1 top-1 bg-white w-6 h-6 rounded-full transition-transform transform ${showFavoritesOnly ? 'translate-x-6' : ''}`}></div>
            </div>
            <span className="ml-3 text-gray-700">Show Favorites Only</span>
          </label>
          
          {/* New chat button */}
          <Link
            to="/"
            className="rounded-md bg-primary-600 px-4 py-2 text-white hover:bg-primary-700 transition-colors"
          >
            New Chat
          </Link>
        </div>
      </div>

      {/* Error message */}
      {error && (
        <div className="mb-6 rounded-lg bg-red-50 p-4 text-red-800 border border-red-200">
          <div className="flex">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-5 w-5 text-red-500 mr-2"
              viewBox="0 0 20 20"
              fill="currentColor"
            >
              <path
                fillRule="evenodd"
                d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z"
                clipRule="evenodd"
              />
            </svg>
            <span>{error}</span>
          </div>
        </div>
      )}

      {/* Loading state */}
      {isLoading ? (
        <div className="flex justify-center py-12">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary-600"></div>
        </div>
      ) : filteredChats.length === 0 ? (
        // Empty state
        <div className="rounded-lg bg-gray-50 p-12 text-center border border-gray-200">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            className="h-16 w-16 mx-auto text-gray-400 mb-4"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z"
            />
          </svg>
          <h2 className="text-xl font-semibold text-gray-800 mb-2">
            {showFavoritesOnly
              ? "You don't have any favorite conversations yet"
              : "You haven't had any conversations yet"}
          </h2>
          <p className="text-gray-600 mb-6">
            {showFavoritesOnly
              ? "Mark conversations as favorites to see them here"
              : "Start a conversation with a Bible character to see it listed here"}
          </p>
          <Link
            to="/"
            className="inline-block rounded-md bg-primary-600 px-6 py-3 text-white hover:bg-primary-700 transition-colors"
          >
            Start a New Conversation
          </Link>
        </div>
      ) : (
        // Conversation list
        <div className="grid gap-4">
          {filteredChats.map((chat) => (
            <div
              key={chat.id}
              className="rounded-lg border border-gray-200 bg-white p-4 shadow-sm hover:shadow-md transition-shadow"
            >
              <div className="flex flex-col md:flex-row md:items-center md:justify-between">
                {/* Chat info */}
                <div className="mb-4 md:mb-0">
                  {editingChatId === chat.id ? (
                    <div className="flex items-center space-x-2">
                      <input
                        type="text"
                        value={newTitle}
                        onChange={(e) => setNewTitle(e.target.value)}
                        className="rounded-md border border-gray-300 px-3 py-2 focus:border-primary-500 focus:outline-none focus:ring-1 focus:ring-primary-500"
                        placeholder="Enter conversation title"
                        autoFocus
                      />
                      <button
                        onClick={() => handleSaveTitle(chat.id)}
                        className="rounded-md bg-primary-600 px-3 py-2 text-white hover:bg-primary-700 transition-colors"
                      >
                        Save
                      </button>
                      <button
                        onClick={handleCancelEdit}
                        className="rounded-md bg-gray-200 px-3 py-2 text-gray-800 hover:bg-gray-300 transition-colors"
                      >
                        Cancel
                      </button>
                    </div>
                  ) : (
                    <>
                      <h2 className="text-lg font-semibold text-gray-900 flex items-center">
                        {chat.title}
                        <button
                          onClick={() => handleEditTitle(chat)}
                          className="ml-2 text-gray-400 hover:text-gray-600"
                          aria-label="Edit title"
                        >
                          <svg
                            xmlns="http://www.w3.org/2000/svg"
                            className="h-4 w-4"
                            fill="none"
                            viewBox="0 0 24 24"
                            stroke="currentColor"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth={2}
                              d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z"
                            />
                          </svg>
                        </button>
                      </h2>
                      <div className="mt-1 flex items-center text-sm text-gray-500">
                        <span className="font-medium text-gray-700 mr-2">
                          {chat.character?.name || 'Unknown Character'}
                        </span>
                        <span>•</span>
                        <span className="ml-2">{formatDate(chat.updated_at)}</span>
                      </div>
                    </>
                  )}
                </div>

                {/* Action buttons */}
                <div className="flex items-center space-x-2">
                  {/* Resume button */}
                  <button
                    onClick={() => handleResumeChat(chat)}
                    className="rounded-md bg-primary-600 px-3 py-2 text-white hover:bg-primary-700 transition-colors"
                    aria-label="Resume conversation"
                  >
                    <div className="flex items-center">
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        className="h-5 w-5 mr-1"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z"
                        />
                      </svg>
                      Resume
                    </div>
                  </button>

                  {/* Favorite button */}
                  <button
                    onClick={() => handleToggleFavorite(chat.id, chat.is_favorite)}
                    className={`rounded-md p-2 ${
                      chat.is_favorite
                        ? 'bg-yellow-100 text-yellow-600 hover:bg-yellow-200'
                        : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                    } transition-colors`}
                    aria-label={chat.is_favorite ? 'Remove from favorites' : 'Add to favorites'}
                  >
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      className="h-5 w-5"
                      viewBox="0 0 20 20"
                      fill="currentColor"
                    >
                      <path
                        fillRule="evenodd"
                        d="M3.172 5.172a4 4 0 015.656 0L10 6.343l1.172-1.171a4 4 0 115.656 5.656L10 17.657l-6.828-6.829a4 4 0 010-5.656z"
                        clipRule="evenodd"
                      />
                    </svg>
                    <span className="ml-1 text-xs font-medium">
                      {chat.is_favorite ? 'Unfavorite' : 'Favorite'}
                    </span>
                  </button>

                  {/* Delete button */}
                  <button
                    onClick={() => handleDeleteChat(chat.id)}
                    className="rounded-md bg-red-100 p-2 text-red-600 hover:bg-red-200 transition-colors"
                    aria-label="Delete conversation"
                  >
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      className="h-5 w-5"
                      viewBox="0 0 20 20"
                      fill="currentColor"
                    >
                      <path
                        fillRule="evenodd"
                        d="M9 2a1 1 0 00-.894.553L7.382 4H4a1 1 0 000 2v10a2 2 0 002 2h8a2 2 0 002-2V6a1 1 0 100-2h-3.382l-.724-1.447A1 1 0 0011 2H9zM7 8a1 1 0 012 0v6a1 1 0 11-2 0V8zm5-1a1 1 0 00-1 1v6a1 1 0 102 0V8a1 1 0 00-1-1z"
                        clipRule="evenodd"
                      />
                    </svg>
                    <span className="ml-1 text-xs font-medium">Delete</span>
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
    </>
  );
};

export default ConversationsPage;
