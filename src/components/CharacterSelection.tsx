import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { characterRepository } from '../repositories/characterRepository';
import { groupRepository } from '../repositories/groupRepository';
import { type Character } from '../services/supabase';
import { useChat } from '../contexts/ChatContext';
import CharacterCard from './CharacterCard';
import CharacterGroupCarousel from './CharacterGroupCarousel';
import type { CharacterGroup } from '../repositories/groupRepository';

type LayoutMode = 'grid' | 'timeline' | 'book';
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

/* ------------------------------------------------------------------ */
/* Utility helpers for Book detection / grouping / sorting            */
/* ------------------------------------------------------------------ */

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
      `${char.description || ''} ${char.short_biography || ''} ${char.scriptural_context || ''}`;
    const book = detectBook(source);
    if (!acc[book]) acc[book] = [];
    acc[book].push(char);
    return acc;
  }, {});
}

/**
 * Sort books in canonical order, with 'Unknown' always last,
 * and alphabetical fallback for any other non-canonical entries.
 */
function sortBooks(a: string, b: string): number {
  if (a === 'Unknown' && b === 'Unknown') return 0;
  if (a === 'Unknown') return 1;
  if (b === 'Unknown') return -1;
  const idxA = BOOK_ORDER.indexOf(a);
  const idxB = BOOK_ORDER.indexOf(b);
  if (idxA !== -1 && idxB !== -1) return idxA - idxB;
  // If one is canonical and the other is not, canonical first
  if (idxA !== -1) return -1;
  if (idxB !== -1) return 1;
  // Neither canonical – alphabetical
  return a.localeCompare(b);
}

/* ------------------------------------------------------------------ */
/* Timeline era helpers                                               */
/* ------------------------------------------------------------------ */

const ERA_ORDER = [
  'Creation to Exodus',
  'Kingdom Period',
  'Post-Exile',
  'Gospels',
  'Early Church',
  'Unknown',
] as const;
type Era = (typeof ERA_ORDER)[number];

function getEra(book: string): Era {
  // Simple mapping based on canonical order
  if (
    [
      'Genesis',
      'Exodus',
      'Leviticus',
      'Numbers',
      'Deuteronomy',
    ].includes(book)
  )
    return 'Creation to Exodus';

  if (
    [
      'Joshua',
      'Judges',
      'Ruth',
      '1 Samuel',
      '2 Samuel',
      '1 Kings',
      '2 Kings',
      '1 Chronicles',
      '2 Chronicles',
    ].includes(book)
  )
    return 'Kingdom Period';

  if (
    [
      'Ezra',
      'Nehemiah',
      'Esther',
      'Job',
      'Psalms',
      'Proverbs',
      'Ecclesiastes',
      'Song of Solomon',
      'Isaiah',
      'Jeremiah',
      'Lamentations',
      'Ezekiel',
      'Daniel',
      'Hosea',
      'Joel',
      'Amos',
      'Obadiah',
      'Jonah',
      'Micah',
      'Nahum',
      'Habakkuk',
      'Zephaniah',
      'Haggai',
      'Zechariah',
      'Malachi',
    ].includes(book)
  )
    return 'Post-Exile';

  if (['Matthew', 'Mark', 'Luke', 'John'].includes(book)) return 'Gospels';

  if (
    [
      'Acts',
      'Romans',
      '1 Corinthians',
      '2 Corinthians',
      'Galatians',
      'Ephesians',
      'Philippians',
      'Colossians',
      '1 Thessalonians',
      '2 Thessalonians',
      '1 Timothy',
      '2 Timothy',
      'Titus',
      'Philemon',
      'Hebrews',
      'James',
      '1 Peter',
      '2 Peter',
      '1 John',
      '2 John',
      '3 John',
      'Jude',
      'Revelation',
    ].includes(book)
  )
    return 'Early Church';

  return 'Unknown';
}

const CharacterSelection: React.FC = () => {
  // State for characters, loading, and errors
  const [characters, setCharacters] = useState<Character[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [layout, setLayout] = useState<LayoutMode>('grid');
  const [testament, setTestament] = useState<TestamentFilter>('all');
  const [bookFilter, setBookFilter] = useState<string>('all');
  const [sortMode, setSortMode] = useState<SortMode>('newest');
  const [selectedGroup, setSelectedGroup] = useState<string | null>(null);
  const [groups, setGroups] = useState<CharacterGroup[]>([]);
  const [featuredCharacter, setFeaturedCharacter] = useState<Character | null>(null);
  
  // Get the chat context
  const { selectCharacter, character: selectedCharacter } = useChat();

  // Fetch characters on component mount or when selectedGroup changes
  const fetchCharacters = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      let data: Character[] = [];
      if (selectedGroup) {
        // Fetch characters for the selected group
        const mappings = await groupRepository.getCharactersInGroup(selectedGroup);
        data = mappings.map(m => m.character);
      } else {
        // Fetch all characters if no group is selected
        data = await characterRepository.getAll();
      }
      setCharacters(data);
      
      // Set a featured character (Jesus if available, otherwise the first character)
      const jesus = data.find(c => c.name.toLowerCase().includes('jesus'));
      setFeaturedCharacter(jesus || (data.length > 0 ? data[0] : null));
    } catch (err) {
      console.error('Failed to fetch characters:', err);
      setError('Failed to load Bible characters. Please try again later.');
    } finally {
      setIsLoading(false);
    }
  }, [selectedGroup]);

  useEffect(() => {
    fetchCharacters();
  }, [fetchCharacters]);

  /* ------------------------------------------------------------------ */
  /* Fetch groups once for filter chips                                  */
  /* ------------------------------------------------------------------ */
  useEffect(() => {
    (async () => {
      try {
        const all = await groupRepository.getAllGroups();
        setGroups(all);
      } catch (e) {
        // silently fail – carousel already has error handling
      }
    })();
  }, []);

  // Handle character selection
  const handleSelectCharacter = async (characterId: string) => {
    try {
      await selectCharacter(characterId);
      setSelectedGroup(null); // Reset selected group when a character is chosen
    } catch (err) {
      console.error('Error selecting character:', err);
      setError('Failed to select character. Please try again.');
    }
  };

  // Filter characters based on search query and filters
  let filtered = characters;

  // Search
  if (searchQuery.trim()) {
    filtered = filtered.filter((c) =>
      `${c.name} ${c.description} ${c.short_biography || ''}`.toLowerCase().includes(searchQuery.toLowerCase())
    );
  }

  // Testament filter (placeholder: assumes character.description or bible_book contains OT/NT keywords)
  if (testament !== 'all') {
    filtered = filtered.filter((c) => {
      const textToSearch = `${c.description || ''} ${c.bible_book || ''} ${c.scriptural_context || ''}`.toLowerCase();
      return testament === 'old'
        ? /(genesis|exodus|leviticus|numbers|deuteronomy|joshua|judges|ruth|samuel|kings|chronicles|ezra|nehemiah|esther|job|psalms|proverbs|ecclesiastes|song of solomon|isaiah|jeremiah|lamentations|ezekiel|daniel|hosea|joel|amos|obadiah|jonah|micah|nahum|habakkuk|zephaniah|haggai|zechariah|malachi|old testament)/i.test(textToSearch)
        : /(matthew|mark|luke|john|acts|romans|corinthians|galatians|ephesians|philippians|colossians|thessalonians|timothy|titus|philemon|hebrews|james|peter|john|jude|revelation|new testament)/i.test(textToSearch);
    });
  }

  // Book filter (only applies if a specific testament is selected)
  if (bookFilter !== 'all' && testament !== 'all') {
    filtered = filtered.filter((c) => {
      const textToSearch = `${c.description || ''} ${c.bible_book || ''} ${c.scriptural_context || ''}`.toLowerCase();
      return textToSearch.includes(bookFilter.toLowerCase());
    });
  }

  // Sorting
  filtered = [...filtered].sort((a, b) => {
    if (sortMode === 'newest') {
      // Assuming 'created_at' exists and is a valid date string
      return (new Date(b.created_at!).getTime()) - (new Date(a.created_at!).getTime());
    }
    // 'popular' is a stub, sorting by name for now
    return a.name.localeCompare(b.name);
  });

  // Group characters by book for "Book View"
  const groupedByBook = groupCharactersByBook(filtered);

  // Group characters by category for circular avatar display
  const charactersByGroup = useMemo(() => {
    const result: Record<string, Character[]> = {};
    
    // Initialize with empty arrays for each group
    groups.forEach(group => {
      result[group.name] = [];
    });
    
    // Add characters to their respective groups
    filtered.forEach(character => {
      // This is a simplified approach - in a real app, you'd use the actual group mappings
      // For now, we'll just use the first matching group based on description
      const matchingGroup = groups.find(group => 
        character.description?.toLowerCase().includes(group.name.toLowerCase())
      );
      
      if (matchingGroup) {
        result[matchingGroup.name].push(character);
      }
    });
    
    return result;
  }, [filtered, groups]);

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
    <div className="min-h-screen bg-gradient-to-b from-blue-900 via-blue-600 to-blue-400 pb-12">
      {/* Heavenly background with light rays and clouds */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        {/* Light rays */}
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-yellow-200 via-transparent to-transparent opacity-30"></div>
        
        {/* Cloud elements */}
        <div className="absolute top-1/4 left-1/4 w-64 h-24 bg-white rounded-full blur-3xl opacity-20 animate-float"></div>
        <div className="absolute top-1/3 right-1/4 w-80 h-32 bg-white rounded-full blur-3xl opacity-15 animate-float-delayed"></div>
        <div className="absolute bottom-1/4 left-1/3 w-72 h-28 bg-white rounded-full blur-3xl opacity-10 animate-float-slow"></div>
      </div>

      <div className="relative container mx-auto px-6 pt-8">
        {/* Brand header with divine glow */}
        <header className="mb-10 text-center relative">
          <div className="absolute inset-0 mx-auto w-64 h-12 bg-yellow-300 blur-xl opacity-30 rounded-full"></div>
          <h1 className="text-5xl font-extrabold text-white tracking-tight drop-shadow-lg relative">
            Ask<span className="text-yellow-300">Jesus</span>AI
          </h1>
          <p className="mt-2 text-blue-100 text-lg font-light">Choose a biblical voice to guide your journey</p>
        </header>

        {/* Featured Character Section */}
        {featuredCharacter && (
          <div className="mb-12 flex flex-col items-center">
            <div className="relative mb-4">
              {/* Halo effect */}
              <div className="absolute -inset-4 rounded-full bg-yellow-300 blur-xl opacity-30"></div>
              
              {/* Circular avatar */}
              <div className="relative h-32 w-32 rounded-full overflow-hidden border-4 border-yellow-300 shadow-xl">
                <img 
                  src={featuredCharacter.avatar_url || `https://ui-avatars.com/api/?name=${encodeURIComponent(featuredCharacter.name)}&background=random`}
                  alt={featuredCharacter.name}
                  className="h-full w-full object-cover"
                />
              </div>
            </div>
            
            <h2 className="text-2xl font-bold text-white mb-2">{featuredCharacter.name}</h2>
            <p className="text-blue-100 max-w-md text-center mb-4">{featuredCharacter.description}</p>
            
            <button
              onClick={() => handleSelectCharacter(featuredCharacter.id)}
              className="bg-yellow-500 hover:bg-yellow-600 text-blue-900 font-bold py-3 px-8 rounded-full shadow-lg transform transition-all hover:scale-105 active:scale-95"
            >
              Chat with {featuredCharacter.name} 🙏
            </button>
            
            <p className="mt-6 text-blue-100 text-sm">Or select another character below</p>
          </div>
        )}

        {/* Group filter chips with golden accent */}
        <div className="mb-8 overflow-x-auto bg-white bg-opacity-10 backdrop-blur-sm rounded-xl p-4">
          <h3 className="text-yellow-300 font-semibold text-lg mb-3 text-center">Character Groups</h3>
          <div className="flex flex-wrap gap-2 justify-center">
            <button
              onClick={() => setSelectedGroup(null)}
              className={`px-4 py-1.5 rounded-full border-2 text-sm font-medium transition-all ${
                selectedGroup === null
                  ? 'border-yellow-400 bg-yellow-400 text-blue-900'
                  : 'border-white/30 text-white hover:border-white/60'
              }`}
            >
              All
            </button>
            {groups.map((g) => (
              <button
                key={g.id}
                onClick={() => setSelectedGroup(g.id)}
                className={`px-4 py-1.5 rounded-full border-2 text-sm font-medium transition-all ${
                  selectedGroup === g.id
                    ? 'border-yellow-400 bg-yellow-400 text-blue-900'
                    : 'border-white/30 text-white hover:border-white/60'
                }`}
              >
                {g.name}
              </button>
            ))}
          </div>
        </div>

        {/* Character Group Carousel with divine light effects */}
        <div className="mb-12 relative">
          <div className="absolute -inset-8 bg-white/5 rounded-3xl backdrop-blur-sm"></div>
          <div className="absolute -inset-1 bg-gradient-to-r from-yellow-300/20 via-white/5 to-yellow-300/20 rounded-3xl"></div>
          <div className="relative">
            <CharacterGroupCarousel onSelectGroup={setSelectedGroup} />
          </div>
        </div>

        {/* Circular avatar display by category */}
        <div className="mb-12">
          {Object.entries(charactersByGroup).map(([groupName, chars]) => {
            if (chars.length === 0) return null;
            
            return (
              <div key={groupName} className="mb-10">
                <h3 className="text-yellow-300 text-xl font-bold mb-4 text-center">{groupName}</h3>
                <div className="flex flex-wrap justify-center gap-6">
                  {chars.slice(0, 8).map(character => (
                    <div 
                      key={character.id} 
                      className="flex flex-col items-center"
                      onClick={() => handleSelectCharacter(character.id)}
                    >
                      <div className={`
                        relative w-20 h-20 mb-2 rounded-full overflow-hidden cursor-pointer
                        transform transition-all hover:scale-110
                        ${selectedCharacter?.id === character.id ? 'ring-4 ring-yellow-400' : 'ring-2 ring-white/30'}
                      `}>
                        {/* Subtle glow effect */}
                        {selectedCharacter?.id === character.id && (
                          <div className="absolute -inset-1 bg-yellow-300 blur-md opacity-40 rounded-full"></div>
                        )}
                        <img
                          src={character.avatar_url || `https://ui-avatars.com/api/?name=${encodeURIComponent(character.name)}&background=random`}
                          alt={character.name}
                          className="h-full w-full object-cover"
                        />
                      </div>
                      <span className="text-white text-sm font-medium text-center">{character.name}</span>
                    </div>
                  ))}
                </div>
              </div>
            );
          })}
        </div>

        {/* Search and filters in an elegant glass panel */}
        <div className="mb-8 bg-white/10 backdrop-blur-md rounded-xl p-6 shadow-xl">
          <div className="flex flex-col md:flex-row gap-6 items-center">
            {/* Search with divine glow */}
            <div className="relative flex-1 w-full max-w-md">
              <div className="absolute inset-0 bg-blue-400/20 rounded-full blur-md"></div>
              <input
                type="text"
                placeholder="Search characters..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full rounded-full border-2 border-white/30 bg-white/20 py-3 pl-12 pr-4 text-white placeholder-blue-100 focus:border-yellow-300 focus:outline-none focus:ring-2 focus:ring-yellow-300/50 backdrop-blur-sm"
              />
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="absolute left-4 top-3.5 h-5 w-5 text-blue-100"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                />
              </svg>
            </div>

            {/* Layout buttons with golden accents */}
            <div className="flex justify-center gap-2">
              {(['grid', 'timeline', 'book'] as LayoutMode[]).map((m) => (
                <button
                  key={m}
                  aria-label={m}
                  onClick={() => setLayout(m)}
                  className={`rounded-full px-5 py-2 text-sm font-medium transition-all ${
                    layout === m
                      ? 'bg-yellow-400 text-blue-900'
                      : 'bg-white/20 text-white hover:bg-white/30'
                  }`}
                >
                  {m.charAt(0).toUpperCase() + m.slice(1)}
                </button>
              ))}
            </div>

            {/* Filters with heavenly styling */}
            <div className="flex gap-2 justify-center">
              <select
                value={testament}
                onChange={(e) => {
                  setTestament(e.target.value as TestamentFilter);
                  setBookFilter('all');
                }}
                className="rounded-full border-2 border-white/30 bg-white/20 py-2 px-4 text-sm text-white focus:border-yellow-300 focus:outline-none focus:ring-2 focus:ring-yellow-300/50 backdrop-blur-sm"
              >
                <option value="all">All Testaments</option>
                <option value="old">Old Testament</option>
                <option value="new">New Testament</option>
              </select>

              <select
                value={bookFilter}
                onChange={(e) => setBookFilter(e.target.value)}
                className="rounded-full border-2 border-white/30 bg-white/20 py-2 px-4 text-sm text-white focus:border-yellow-300 focus:outline-none focus:ring-2 focus:ring-yellow-300/50 backdrop-blur-sm"
              >
                <option value="all">All Books</option>
                <optgroup label="Old Testament">
                  {BIBLE_BOOKS.oldTestament.map((book) => (
                    <option key={book} value={book}>{book}</option>
                  ))}
                </optgroup>
                <optgroup label="New Testament">
                  {BIBLE_BOOKS.newTestament.map((book) => (
                    <option key={book} value={book}>{book}</option>
                  ))}
                </optgroup>
              </select>

              <select
                value={sortMode}
                onChange={(e) => setSortMode(e.target.value as SortMode)}
                className="rounded-full border-2 border-white/30 bg-white/20 py-2 px-4 text-sm text-white focus:border-yellow-300 focus:outline-none focus:ring-2 focus:ring-yellow-300/50 backdrop-blur-sm"
              >
                <option value="newest">Newest</option>
                <option value="popular">Most Popular</option>
              </select>
            </div>
          </div>
        </div>

        {/* No results message */}
        {filtered.length === 0 && (
          <div className="my-12 text-center bg-white/10 backdrop-blur-md rounded-xl p-8 max-w-lg mx-auto">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-12 w-12 mx-auto text-blue-100 mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16l2.879-2.879m0 0a3 3 0 104.243-4.242 3 3 0 00-4.243 4.242zM21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <p className="text-xl text-white mb-4">
              No characters found matching "{searchQuery}"
            </p>
            <button
              onClick={() => setSearchQuery('')}
              className="text-yellow-300 hover:text-yellow-400 font-medium"
            >
              Clear search
            </button>
          </div>
        )}

        {/* Character list with enhanced styling */}
        <div className="bg-white/10 backdrop-blur-md rounded-xl p-6 shadow-xl">
          <AnimatePresence mode="popLayout">
            {layout === 'grid' && (
              <motion.div
                key="grid"
                layout
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6"
              >
                {filtered.map((character) => (
                  <CharacterCard
                    key={character.id}
                    character={character}
                    onSelect={handleSelectCharacter}
                    isSelected={selectedCharacter?.id === character.id}
                  />
                ))}
              </motion.div>
            )}

            {layout === 'timeline' && (
              <motion.div
                key="timeline"
                layout
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="relative ml-2 sm:ml-4"
              >
                {/* Vertical line with divine glow */}
                <div className="absolute left-0 top-0 h-full w-1 bg-gradient-to-b from-yellow-300/80 via-blue-300/50 to-yellow-300/80 rounded-full blur-sm"></div>
                <div className="absolute left-0 top-0 h-full w-0.5 bg-white/70"></div>

                {/* Group characters by era */}
                {ERA_ORDER.map((era) => {
                  // Gather chars for this era
                  const charsInEra = filtered.filter(
                    (c) => getEra(detectBook(`${c.bible_book ?? ''} ${c.description ?? ''}`)) === era,
                  );
                  if (charsInEra.length === 0) return null;

                  return (
                    <div key={era} className="mb-12 last:mb-0 pl-8">
                      {/* Era Header with golden text */}
                      <div className="mb-6 flex items-center gap-3">
                        <span className="relative flex h-5 w-5 -ml-10">
                          <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-yellow-300 opacity-75"></span>
                          <span className="relative inline-flex h-5 w-5 rounded-full bg-yellow-400 border-2 border-white"></span>
                        </span>
                        <h4 className="text-xl font-bold text-yellow-300">{era}</h4>
                      </div>

                      {/* Era Characters */}
                      <div className="space-y-6">
                        {charsInEra.map((character) => (
                          <CharacterCard
                            key={character.id}
                            character={character}
                            onSelect={handleSelectCharacter}
                            isSelected={selectedCharacter?.id === character.id}
                          />
                        ))}
                      </div>
                    </div>
                  );
                })}
              </motion.div>
            )}

            {layout === 'book' && (
              <motion.div
                key="book"
                layout
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="space-y-12"
              >
                {Object.keys(groupedByBook).sort(sortBooks).map((book) => (
                  <div key={book}>
                    <h3 className="mb-6 text-2xl font-bold text-yellow-300 text-center">
                      {book}
                    </h3>
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                      {groupedByBook[book].map((character) => (
                        <CharacterCard
                          key={character.id}
                          character={character}
                          onSelect={handleSelectCharacter}
                          isSelected={selectedCharacter?.id === character.id}
                        />
                      ))}
                    </div>
                  </div>
                ))}
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
};

export default CharacterSelection;
