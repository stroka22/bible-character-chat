import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { characterRepository } from '../repositories/characterRepository';
import { groupRepository } from '../repositories/groupRepository';
import { type Character } from '../services/supabase';
import { useChat } from '../contexts/ChatContext';
import { useAuth } from '../contexts/AuthContext';
import CharacterCard from './CharacterCard';
import type { CharacterGroup } from '../repositories/groupRepository';
import { isCharacterFree } from '../utils/accountTier';
import { usePremium } from '../hooks/usePremium';
import { getOwnerSlug, getSettings as getTierSettings } from '../services/tierSettingsService';
import UpgradeModal from './UpgradeModal';

// View modes: grid or list (replacing the previous grid/timeline/book)
type ViewMode = 'grid' | 'list';
type TestamentFilter = 'all' | 'old' | 'new';
type SortMode = 'newest' | 'popular';

// Define Bible books for filtering
const BIBLE_BOOKS = {
  oldTestament: [
    'Genesis', 'Exodus', 'Leviticus', 'Numbers', 'Deuteronomy',
    'Joshua', 'Judges', 'Ruth', '1 Samuel', '2 Samuel', '1 Kings', '2 Kings',
    '1 Chronicles', '2 Chronicles', 'Ezra', 'Nehemiah', 'Esther', 'Job',
    'Psalms', 'Proverbs', 'Ecclesiastes', 'Song of Solomon', 'Isaiah',
    'Jeremiah', 'Lamentations', 'Ezekiel', 'Daniel', 'Hosea', 'Joel',
    'Amos', 'Obadiah', 'Jonah', 'Micah', 'Nahum', 'Habakkuk', 'Zephaniah',
    'Haggai', 'Zechariah', 'Malachi'
  ],
  newTestament: [
    'Matthew', 'Mark', 'Luke', 'John', 'Acts', 'Romans', '1 Corinthians',
    '2 Corinthians', 'Galatians', 'Ephesians', 'Philippians', 'Colossians',
    '1 Thessalonians', '2 Thessalonians', '1 Timothy', '2 Timothy', 'Titus',
    'Philemon', 'Hebrews', 'James', '1 Peter', '2 Peter', '1 John', '2 John',
    '3 John', 'Jude', 'Revelation'
  ]
};

// Flat list of Bible books in canonical order
const BOOK_ORDER: string[] = [
  ...BIBLE_BOOKS.oldTestament,
  ...BIBLE_BOOKS.newTestament,
];

/**
 * Try to detect which Bible book is referenced in a block of text.
 * Falls back to 'Unknown' when no match is found.
 */
function detectBook(text: string | undefined): string {
  if (!text) return 'Unknown';
  const lower = text.toLowerCase();
  for (const book of BOOK_ORDER) {
    if (lower.includes(book.toLowerCase())) {
      return book;
    }
  }
  return 'Unknown';
}

/**
 * Group characters by detected Bible book.
 */
function groupCharactersByBook(chars: Character[]): Record<string, Character[]> {
  return chars.reduce<Record<string, Character[]>>((acc, char) => {
    const source =
      char.bible_book ??
      `${char.description || ''} ${char.scriptural_context || ''}`;
    const book = detectBook(source);
    if (!acc[book]) acc[book] = [];
    acc[book].push(char);
    return acc;
  }, {});
}

const CharacterSelection: React.FC = () => {
  // State for characters, loading, and errors
  const [characters, setCharacters] = useState<Character[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [viewMode, setViewMode] = useState<ViewMode>('grid');
  const [testament, setTestament] = useState<TestamentFilter>('all');
  const [bookFilter, setBookFilter] = useState<string>('all');
  const [groupFilter, setGroupFilter] = useState<string>('all');
  const [currentPage, setCurrentPage] = useState<number>(1);
  const [currentLetter, setCurrentLetter] = useState<string>('all');
  const [groups, setGroups] = useState<CharacterGroup[]>([]);
  const [activeFilters, setActiveFilters] = useState<{type: string, value: string}[]>([]);
  const { isPremium } = usePremium();
  const { profile } = useAuth();
  const [tierSettings, setTierSettings] = useState<any>(null);
  const [upgradeOpen, setUpgradeOpen] = useState(false);

  // Pagination settings
  const itemsPerPage = 20;
  
  // Get the chat context
  const { selectCharacter, character: selectedCharacter } = useChat();

  // Fetch characters on component mount
  const fetchCharacters = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const data = await characterRepository.getAll();
      setCharacters(data);
    } catch (err) {
      console.error('Failed to fetch characters:', err);
      setError('Failed to load Bible characters. Please try again later.');
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchCharacters();
  }, [fetchCharacters]);

  // Load org-scoped tier settings (remote-first)
  useEffect(() => {
    (async () => {
      try {
        const owner = getOwnerSlug();
        const settings = await getTierSettings(owner);
        setTierSettings(settings);
      } catch (e) {
        console.warn('CharacterSelection: failed to load tier settings; falling back to utils cache');
        setTierSettings(null);
      }
    })();
  }, []);

  // Fetch groups for filtering
  useEffect(() => {
    (async () => {
      try {
        const all = await groupRepository.getAllGroups();
        setGroups(all);
      } catch (e) {
        console.error('Failed to fetch character groups:', e);
      }
    })();
  }, []);

  // Handle character selection
  const handleSelectCharacter = async (characterId: string) => {
    try {
      await selectCharacter(characterId);
    } catch (err) {
      console.error('Error selecting character:', err);
      setError('Failed to select character. Please try again.');
    }
  };

  // Update active filters when filters change
  useEffect(() => {
    const newFilters = [];
    
    if (testament !== 'all') {
      newFilters.push({
        type: 'testament',
        value: testament === 'old' ? 'Old Testament' : 'New Testament'
      });
    }
    
    if (bookFilter !== 'all') {
      newFilters.push({
        type: 'book',
        value: bookFilter
      });
    }
    
    if (groupFilter !== 'all') {
      newFilters.push({
        type: 'group',
        value: groupFilter
      });
    }
    
    if (searchQuery) {
      newFilters.push({
        type: 'search',
        value: `"${searchQuery}"`
      });
    }
    
    if (currentLetter !== 'all') {
      newFilters.push({
        type: 'letter',
        value: `Starting with "${currentLetter}"`
      });
    }
    
    setActiveFilters(newFilters);
  }, [testament, bookFilter, groupFilter, searchQuery, currentLetter]);

  // Remove a specific filter
  const removeFilter = (type: string) => {
    switch(type) {
      case 'testament':
        setTestament('all');
        break;
      case 'book':
        setBookFilter('all');
        break;
      case 'group':
        setGroupFilter('all');
        break;
      case 'search':
        setSearchQuery('');
        break;
      case 'letter':
        setCurrentLetter('all');
        break;
    }
    setCurrentPage(1); // Reset to first page when filters change
  };

  // Filter characters based on all criteria
  const filteredCharacters = useMemo(() => {
    let result = [...characters];
    
    // Search filter
    if (searchQuery.trim()) {
      result = result.filter((c) =>
        c.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (c.description || '').toLowerCase().includes(searchQuery.toLowerCase())
      );
    }
    
    // Testament filter
    if (testament !== 'all') {
      result = result.filter((c) => {
        const textToSearch = `${c.description || ''} ${c.bible_book || ''} ${c.scriptural_context || ''}`.toLowerCase();
        return testament === 'old'
          ? /(genesis|exodus|leviticus|numbers|deuteronomy|joshua|judges|ruth|samuel|kings|chronicles|ezra|nehemiah|esther|job|psalms|proverbs|ecclesiastes|song of solomon|isaiah|jeremiah|lamentations|ezekiel|daniel|hosea|joel|amos|obadiah|jonah|micah|nahum|habakkuk|zephaniah|haggai|zechariah|malachi|old testament)/i.test(textToSearch)
          : /(matthew|mark|luke|john|acts|romans|corinthians|galatians|ephesians|philippians|colossians|thessalonians|timothy|titus|philemon|hebrews|james|peter|john|jude|revelation|new testament)/i.test(textToSearch);
      });
    }
    
    // Book filter
    if (bookFilter !== 'all') {
      result = result.filter((c) => {
        const textToSearch = `${c.description || ''} ${c.bible_book || ''} ${c.scriptural_context || ''}`.toLowerCase();
        return textToSearch.includes(bookFilter.toLowerCase());
      });
    }
    
    // Group filter
    if (groupFilter !== 'all') {
      result = result.filter((c) => {
        const textToSearch = `${c.description || ''}`.toLowerCase();
        return textToSearch.includes(groupFilter.toLowerCase());
      });
    }
    
    // Alphabetical filter
    if (currentLetter !== 'all') {
      result = result.filter(c => 
        c.name.toUpperCase().startsWith(currentLetter)
      );
    }
    
    // Sort alphabetically by default
    result.sort((a, b) => a.name.localeCompare(b.name));
    
    return result;
  }, [characters, searchQuery, testament, bookFilter, groupFilter, currentLetter]);

  // Paginate the filtered results
  const paginatedCharacters = useMemo(() => {
    const startIndex = (currentPage - 1) * itemsPerPage;
    return filteredCharacters.slice(startIndex, startIndex + itemsPerPage);
  }, [filteredCharacters, currentPage, itemsPerPage]);

  // Calculate total pages
  const totalPages = Math.ceil(filteredCharacters.length / itemsPerPage);

  // Generate pagination controls
  const renderPagination = () => {
    if (totalPages <= 1) return null;
    
    const maxVisiblePages = 5;
    let startPage = Math.max(1, currentPage - Math.floor(maxVisiblePages / 2));
    let endPage = Math.min(totalPages, startPage + maxVisiblePages - 1);
    
    if (endPage - startPage + 1 < maxVisiblePages) {
      startPage = Math.max(1, endPage - maxVisiblePages + 1);
    }
    
    const pages = [];
    
    // Previous button
    pages.push(
      <button 
        key="prev" 
        onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
        disabled={currentPage === 1}
        className="w-10 h-10 rounded-lg flex items-center justify-center bg-white/10 text-white disabled:opacity-50 disabled:cursor-not-allowed"
        aria-label="Previous page"
      >
        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
          <path fillRule="evenodd" d="M12.707 5.293a1 1 0 010 1.414L9.414 10l3.293 3.293a1 1 0 01-1.414 1.414l-4-4a1 1 0 010-1.414l4-4a1 1 0 011.414 0z" clipRule="evenodd" />
        </svg>
      </button>
    );
    
    // First page
    if (startPage > 1) {
      pages.push(
        <button 
          key="1" 
          onClick={() => setCurrentPage(1)}
          className="w-10 h-10 rounded-lg flex items-center justify-center bg-white/10 text-white hover:bg-white/20"
        >
          1
        </button>
      );
      
      // Ellipsis if needed
      if (startPage > 2) {
        pages.push(
          <span key="ellipsis1" className="w-10 h-10 flex items-center justify-center text-white">...</span>
        );
      }
    }
    
    // Page numbers
    for (let i = startPage; i <= endPage; i++) {
      pages.push(
        <button 
          key={i} 
          onClick={() => setCurrentPage(i)}
          className={`w-10 h-10 rounded-lg flex items-center justify-center ${
            currentPage === i 
              ? 'bg-yellow-400 text-blue-900 font-bold' 
              : 'bg-white/10 text-white hover:bg-white/20'
          }`}
        >
          {i}
        </button>
      );
    }
    
    // Ellipsis if needed
    if (endPage < totalPages - 1) {
      pages.push(
        <span key="ellipsis2" className="w-10 h-10 flex items-center justify-center text-white">...</span>
      );
    }
    
    // Last page
    if (endPage < totalPages) {
      pages.push(
        <button 
          key={totalPages} 
          onClick={() => setCurrentPage(totalPages)}
          className="w-10 h-10 rounded-lg flex items-center justify-center bg-white/10 text-white hover:bg-white/20"
        >
          {totalPages}
        </button>
      );
    }
    
    // Next button
    pages.push(
      <button 
        key="next" 
        onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
        disabled={currentPage === totalPages}
        className="w-10 h-10 rounded-lg flex items-center justify-center bg-white/10 text-white disabled:opacity-50 disabled:cursor-not-allowed"
        aria-label="Next page"
      >
        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
          <path fillRule="evenodd" d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z" clipRule="evenodd" />
        </svg>
      </button>
    );
    
    return (
      <div className="flex items-center justify-center gap-2 mt-8">
        {pages}
      </div>
    );
  };

  // Generate alphabetical navigation
  const renderAlphaNav = () => {
    const letters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ'.split('');
    
    return (
      <div className="fixed right-4 top-1/2 transform -translate-y-1/2 bg-white/5 backdrop-blur-sm rounded-full py-4 px-2 hidden lg:flex flex-col gap-1 border border-white/10">
        <button
          onClick={() => {
            setCurrentLetter('all');
            setCurrentPage(1);
          }}
          className={`w-8 h-8 rounded-full flex items-center justify-center text-sm ${
            currentLetter === 'all' 
              ? 'bg-yellow-400 text-blue-900 font-bold' 
              : 'text-white hover:bg-white/10'
          }`}
        >
          All
        </button>
        
        {letters.map(letter => (
          <button
            key={letter}
            onClick={() => {
              setCurrentLetter(letter);
              setCurrentPage(1);
            }}
            className={`w-8 h-8 rounded-full flex items-center justify-center text-sm ${
              currentLetter === letter 
                ? 'bg-yellow-400 text-blue-900 font-bold' 
                : 'text-white hover:bg-white/10'
            }`}
          >
            {letter}
          </button>
        ))}
      </div>
    );
  };

  // Render loading state with divine light spinner
  if (isLoading) {
    return (
      <div className="flex h-full w-full items-center justify-center bg-gradient-to-b from-blue-900 via-blue-600 to-blue-400">
        <div className="text-center">
          <div className="relative mb-6">
            <div className="absolute inset-0 rounded-full bg-yellow-300 blur-xl opacity-30 animate-pulse"></div>
            <div className="relative h-16 w-16 mx-auto animate-spin rounded-full border-4 border-yellow-200 border-t-yellow-400"></div>
            <div className="absolute inset-0 flex items-center justify-center">
              <span className="text-white text-xl">✝</span>
            </div>
          </div>
          <p className="text-white text-lg font-light">Loading Bible characters...</p>
        </div>
      </div>
    );
  }

  // Render error state
  if (error) {
    return (
      <div className="flex h-full w-full items-center justify-center bg-gradient-to-b from-blue-900 via-blue-600 to-blue-400">
        <div className="max-w-md rounded-lg bg-white bg-opacity-90 p-8 text-center shadow-2xl">
          <svg xmlns="http://www.w3.org/2000/svg" className="h-16 w-16 mx-auto text-red-500 mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
          </svg>
          <h3 className="mb-2 text-xl font-semibold text-red-800">Error</h3>
          <p className="text-red-700 mb-4">{error}</p>
          <button 
            onClick={() => window.location.reload()}
            className="rounded-md bg-red-600 px-6 py-2 text-white hover:bg-red-700 transition-colors shadow-md"
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-[#0a0a2a] via-[#1a1a4a] to-[#2a2a6a] py-10 px-4 md:px-6">
      {/* Alphabetical navigation */}
      {renderAlphaNav()}
      
      <div className="max-w-7xl mx-auto bg-white/8 backdrop-blur-sm rounded-2xl p-6 border border-white/15 shadow-xl">
        <h1 className="text-4xl md:text-5xl font-extrabold text-center text-yellow-400 mb-8 tracking-tight drop-shadow-lg">
          Choose Your Biblical Guide
        </h1>
        
        {/* Filter section */}
        <div className="bg-white/5 backdrop-blur-sm rounded-xl p-4 mb-6">
          <div className="flex flex-col md:flex-row gap-4 items-center">
            {/* Search */}
            <div className="w-full md:flex-1">
              <input
                type="text"
                placeholder="Search characters..."
                value={searchQuery}
                onChange={(e) => {
                  setSearchQuery(e.target.value);
                  setCurrentPage(1);
                }}
                className="w-full bg-white/10 border border-white/30 rounded-full py-2 px-4 text-white placeholder-blue-100 focus:outline-none focus:ring-2 focus:ring-yellow-400/50"
              />
            </div>
            
            {/* Testament filter */}
            <div className="flex gap-2">
              <button
                onClick={() => {
                  setTestament('all');
                  setCurrentPage(1);
                }}
                className={`px-4 py-2 rounded-full ${
                  testament === 'all' 
                    ? 'bg-yellow-400 text-blue-900 font-bold' 
                    : 'bg-white/10 text-white hover:bg-white/20'
                }`}
              >
                All
              </button>
              <button
                onClick={() => {
                  setTestament('old');
                  setCurrentPage(1);
                }}
                className={`px-4 py-2 rounded-full ${
                  testament === 'old' 
                    ? 'bg-yellow-400 text-blue-900 font-bold' 
                    : 'bg-white/10 text-white hover:bg-white/20'
                }`}
              >
                Old
              </button>
              <button
                onClick={() => {
                  setTestament('new');
                  setCurrentPage(1);
                }}
                className={`px-4 py-2 rounded-full ${
                  testament === 'new' 
                    ? 'bg-yellow-400 text-blue-900 font-bold' 
                    : 'bg-white/10 text-white hover:bg-white/20'
                }`}
              >
                New
              </button>
            </div>
            
            {/* Book filter */}
            <div className="w-full md:w-auto">
              <select
                value={bookFilter}
                onChange={(e) => {
                  setBookFilter(e.target.value);
                  setCurrentPage(1);
                }}
                className="w-full md:w-auto bg-white/10 border border-white/30 rounded-full py-2 px-4 text-white focus:outline-none focus:ring-2 focus:ring-yellow-400/50"
              >
                <option value="all">All Books</option>
                <optgroup label="Old Testament">
                  {BIBLE_BOOKS.oldTestament.map(book => (
                    <option key={book} value={book}>{book}</option>
                  ))}
                </optgroup>
                <optgroup label="New Testament">
                  {BIBLE_BOOKS.newTestament.map(book => (
                    <option key={book} value={book}>{book}</option>
                  ))}
                </optgroup>
              </select>
            </div>
            
            {/* Group filter */}
            <div className="w-full md:w-auto">
              <select
                value={groupFilter}
                onChange={(e) => {
                  setGroupFilter(e.target.value);
                  setCurrentPage(1);
                }}
                className="w-full md:w-auto bg-white/10 border border-white/30 rounded-full py-2 px-4 text-white focus:outline-none focus:ring-2 focus:ring-yellow-400/50"
              >
                <option value="all">All Groups</option>
                <option value="Prophets">Prophets</option>
                <option value="Apostles">Apostles</option>
                <option value="Kings">Kings</option>
                <option value="Women">Women of the Bible</option>
                {groups.map(group => (
                  <option key={group.id} value={group.name}>{group.name}</option>
                ))}
              </select>
            </div>
            
            {/* View toggle */}
            <div className="flex gap-2">
              <button
                onClick={() => setViewMode('grid')}
                className={`w-10 h-10 rounded-lg flex items-center justify-center ${
                  viewMode === 'grid' 
                    ? 'bg-yellow-400 text-blue-900' 
                    : 'bg-white/10 text-white hover:bg-white/20'
                }`}
                aria-label="Grid view"
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                  <path d="M5 3a2 2 0 00-2 2v2a2 2 0 002 2h2a2 2 0 002-2V5a2 2 0 00-2-2H5zM5 11a2 2 0 00-2 2v2a2 2 0 002 2h2a2 2 0 002-2v-2a2 2 0 00-2-2H5zM11 5a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V5zM11 13a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z" />
                </svg>
              </button>
              <button
                onClick={() => setViewMode('list')}
                className={`w-10 h-10 rounded-lg flex items-center justify-center ${
                  viewMode === 'list' 
                    ? 'bg-yellow-400 text-blue-900' 
                    : 'bg-white/10 text-white hover:bg-white/20'
                }`}
                aria-label="List view"
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M3 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm0 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm0 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm0 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1z" clipRule="evenodd" />
                </svg>
              </button>
            </div>
          </div>
        </div>
        
        {/* Active filters */}
        {activeFilters.length > 0 && (
          <div className="flex flex-wrap gap-2 mb-6 bg-white/5 p-3 rounded-lg">
            <span className="text-white/70 text-sm">Active Filters:</span>
            {activeFilters.map((filter, index) => (
              <div 
                key={index} 
                className="flex items-center gap-1 bg-yellow-400/20 text-yellow-300 px-3 py-1 rounded-full border border-yellow-400/50"
              >
                <span>{filter.value}</span>
                <button 
                  onClick={() => removeFilter(filter.type)}
                  className="w-5 h-5 rounded-full bg-white/10 flex items-center justify-center hover:bg-white/20"
                >
                  ×
                </button>
              </div>
            ))}
            <button 
              onClick={() => {
                setTestament('all');
                setBookFilter('all');
                setGroupFilter('all');
                setSearchQuery('');
                setCurrentLetter('all');
                setCurrentPage(1);
              }}
              className="text-sm text-blue-300 hover:text-blue-200 ml-auto"
            >
              Clear All
            </button>
          </div>
        )}
        
        {/* Results count */}
        <div className="text-center text-white/80 mb-6">
          Showing {paginatedCharacters.length} of {filteredCharacters.length} characters
        </div>
        
        {/* No results message */}
        {filteredCharacters.length === 0 && (
          <div className="bg-white/5 backdrop-blur-sm rounded-xl p-8 text-center">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-16 w-16 mx-auto text-white/50 mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
            <p className="text-xl text-white mb-4">No characters found matching your criteria.</p>
            <button
              onClick={() => {
                setTestament('all');
                setBookFilter('all');
                setGroupFilter('all');
                setSearchQuery('');
                setCurrentLetter('all');
                setCurrentPage(1);
              }}
              className="text-yellow-400 hover:text-yellow-300 font-medium"
            >
              Clear all filters
            </button>
          </div>
        )}
        
        {/* Character grid/list view */}
        {filteredCharacters.length > 0 && (
          <div className={viewMode === 'grid' ? 'grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6' : 'space-y-4'}>
            {paginatedCharacters.map(character => (
              viewMode === 'grid' ? (
                <CharacterCard
                  key={character.id}
                  character={character}
                  onSelect={handleSelectCharacter}
                  isSelected={selectedCharacter?.id === character.id}
                  canChat={!!profile?.premium_override || isPremium || isCharacterFree(character, tierSettings || undefined)}
                  onRequireUpgrade={() => setUpgradeOpen(true)}
                />
              ) : (
                <div 
                  key={character.id}
                  className={`
                    flex items-center gap-4 bg-white/10 backdrop-blur-sm rounded-xl p-4 border border-white/15
                    transition-all duration-300 hover:bg-white/15 cursor-pointer
                    ${selectedCharacter?.id === character.id ? 'border-yellow-400 ring-2 ring-yellow-400/30' : ''}
                  `}
                  onClick={() => handleSelectCharacter(character.id)}
                >
                  <img 
                    src={character.avatar_url || `https://ui-avatars.com/api/?name=${encodeURIComponent(character.name)}&background=random`}
                    alt={character.name}
                    className={`
                      h-16 w-16 rounded-full object-cover object-[center_20%] border-2
                      ${selectedCharacter?.id === character.id ? 'border-yellow-400' : 'border-white/30'}
                    `}
                  />
                  <div className="flex-1">
                    <h3 className="text-xl font-bold text-yellow-400">{character.name}</h3>
                    <p className="text-white/80 line-clamp-2">{character.description}</p>
                    <div className="text-xs text-white/50 mt-1">
                      {character.bible_book && `${character.bible_book} • `}
                      {testament === 'old' ? 'Old Testament' : testament === 'new' ? 'New Testament' : ''}
                    </div>
                  </div>
                  <button
                    className={`
                      px-4 py-2 rounded-lg text-sm font-medium
                      ${(isPremium || isCharacterFree(character, tierSettings || undefined))
                        ? (selectedCharacter?.id === character.id 
                            ? 'bg-yellow-400 text-blue-900' 
                            : 'bg-white/10 text-white hover:bg-white/20')
                        : 'bg-gray-400 text-gray-800'}
                    `}
                    onClick={(e) => {
                      const canChat = isPremium || isCharacterFree(character, tierSettings || undefined);
                      if (!canChat) {
                        e.stopPropagation();
                        setUpgradeOpen(true);
                      }
                    }}
                  >
                    {(isPremium || isCharacterFree(character, tierSettings || undefined)) ? (selectedCharacter?.id === character.id ? 'Continue' : 'Chat') : 'Upgrade'}
                  </button>
                </div>
              )
            ))}
          </div>
        )}
        
        {/* Pagination */}
        {renderPagination()}
      </div>
      <UpgradeModal open={upgradeOpen} onClose={() => setUpgradeOpen(false)} />
    </div>
  );
};

export default CharacterSelection;
