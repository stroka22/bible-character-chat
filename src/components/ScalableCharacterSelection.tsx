import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { VirtuosoGrid } from 'react-virtuoso';
import { motion, AnimatePresence } from 'framer-motion';
import { characterRepository } from '../repositories/characterRepository';
import { groupRepository } from '../repositories/groupRepository';
import type { CharacterGroup } from '../repositories/groupRepository';
import { type Character } from '../services/supabase';
import { useChat } from '../contexts/ChatContext';
import CharacterCard from './CharacterCard';

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

// Bible book imagery mapping
const BOOK_IMAGERY = {
  Genesis: 'https://images.unsplash.com/photo-1501493870936-9c2e41625521?auto=format&fit=crop&q=80&w=400',
  Exodus: 'https://images.unsplash.com/photo-1578645510447-e20b4311e3ce?auto=format&fit=crop&q=80&w=400',
  Psalms: 'https://images.unsplash.com/photo-1519475889208-0968e5438f7d?auto=format&fit=crop&q=80&w=400',
  Isaiah: 'https://images.unsplash.com/photo-1507692049790-de58290a4334?auto=format&fit=crop&q=80&w=400',
  Matthew: 'https://images.unsplash.com/photo-1563841930606-67e2bce48b78?auto=format&fit=crop&q=80&w=400',
  John: 'https://images.unsplash.com/photo-1602526429747-ac387a91d43b?auto=format&fit=crop&q=80&w=400',
  Revelation: 'https://images.unsplash.com/photo-1516450360452-9312f5e86fc7?auto=format&fit=crop&q=80&w=400',
};

// Group imagery mapping
const GROUP_IMAGERY = {
  Prophets: 'https://images.unsplash.com/photo-1470859624578-4bb64151d9c1?auto=format&fit=crop&q=80&w=400',
  Apostles: 'https://images.unsplash.com/photo-1508896694512-1eade558679c?auto=format&fit=crop&q=80&w=400',
  Kings: 'https://images.unsplash.com/photo-1518709268805-4e9042af9f23?auto=format&fit=crop&q=80&w=400',
  Disciples: 'https://images.unsplash.com/photo-1544198365-f5d60b6d8190?auto=format&fit=crop&q=80&w=400',
  Women: 'https://images.unsplash.com/photo-1565505146646-c02f3676d491?auto=format&fit=crop&q=80&w=400',
};

// Flat list of Bible books in canonical order
/*
 * NOTE:
 * The canonical book list isn't currently used in this component.  Leaving the
 * spread lines outside of a comment block caused the TypeScript parser to throw
 * a "Declaration or statement expected" error.  We wrap the entire declaration
 * in a block-comment so it can be re-enabled later without breaking the build.
 *
 * Example usage if needed:
 * const ALL_BOOKS: string[] = [
 *   ...BIBLE_BOOKS.oldTestament,
 *   ...BIBLE_BOOKS.newTestament,
 * ];
 */

// Helper to detect testament from book name
function getTestament(book: string): 'old' | 'new' | 'unknown' {
  if (BIBLE_BOOKS.oldTestament.includes(book)) return 'old';
  if (BIBLE_BOOKS.newTestament.includes(book)) return 'new';
  return 'unknown';
}

// Helper to get book image
function getBookImage(book: string): string {
  return BOOK_IMAGERY[book as keyof typeof BOOK_IMAGERY] || 
    'https://images.unsplash.com/photo-1504052434569-70ad5836ab65?auto=format&fit=crop&q=80&w=400';
}

// Helper to get group image
function getGroupImage(group: string): string {
  return GROUP_IMAGERY[group as keyof typeof GROUP_IMAGERY] || 
    'https://images.unsplash.com/photo-1517021897933-0e0319cfbc28?auto=format&fit=crop&q=80&w=400';
}

// Define navigation levels
type NavigationLevel = 'testaments' | 'groups' | 'books' | 'characters';

// Animation variants for page transitions
const pageVariants = {
  initial: { opacity: 0, y: 20 },
  animate: { opacity: 1, y: 0, transition: { duration: 0.5 } },
  exit: { opacity: 0, y: -20, transition: { duration: 0.3 } }
};

// Card animation variants
const cardVariants = {
  initial: { opacity: 0, scale: 0.9 },
  animate: { opacity: 1, scale: 1, transition: { duration: 0.4 } },
  hover: { scale: 1.05, boxShadow: "0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)" },
  tap: { scale: 0.98 }
};

const ScalableCharacterSelection: React.FC = () => {
  const [characters, setCharacters] = useState<Character[]>([]);
  const [groups, setGroups] = useState<CharacterGroup[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [activeTestament, setActiveTestament] = useState<'all' | 'old' | 'new'>('all');
  const [activeGroup, setActiveGroup] = useState<CharacterGroup | null>(null);
  const [activeBook, setActiveBook] = useState<string | null>(null);
  const [navigationLevel, setNavigationLevel] = useState<NavigationLevel>('testaments'); // Start at top level
  const [featuredCharacter, setFeaturedCharacter] = useState<Character | null>(null);

  const { selectCharacter, character: selectedCharacter } = useChat();

  // Fetch all characters and groups on mount
  useEffect(() => {
    const fetchData = async () => {
      setIsLoading(true);
      setError(null);
      try {
        const fetchedCharacters = await characterRepository.getAll();
        setCharacters(fetchedCharacters);
        
        // Set a featured character (Jesus if available)
        const jesus = fetchedCharacters.find(c => c.name.toLowerCase().includes('jesus'));
        setFeaturedCharacter(jesus || (fetchedCharacters.length > 0 ? fetchedCharacters[0] : null));
        
        const fetchedGroups = await groupRepository.getAllGroups();
        setGroups(fetchedGroups);
      } catch (err) {
        console.error('Failed to fetch data:', err);
        setError('Failed to load data. Please try again later.');
      } finally {
        setIsLoading(false);
      }
    };
    fetchData();
  }, []);

  // Filtered characters based on current navigation/filters
  const filteredCharacters = useMemo(() => {
    let currentChars = characters;

    // Apply testament filter
    if (activeTestament !== 'all') {
      currentChars = currentChars.filter(char => {
        const charBook = char.bible_book || ''; // Assuming bible_book is available
        return getTestament(charBook) === activeTestament;
      });
    }

    // Apply group filter
    if (activeGroup) {
      // This would ideally use character_group_mappings from DB
      // For now, a simple filter based on description containing group name
      currentChars = currentChars.filter(char =>
        char.description?.toLowerCase().includes(activeGroup.name.toLowerCase())
      );
    }

    // Apply book filter
    if (activeBook) {
      currentChars = currentChars.filter(char =>
        char.bible_book?.toLowerCase().includes(activeBook.toLowerCase())
      );
    }

    // Apply search query
    if (searchQuery.trim()) {
      currentChars = currentChars.filter(char =>
        `${char.name} ${char.description} ${char.short_biography || ''}`.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }

    return currentChars;
  }, [characters, activeTestament, activeGroup, activeBook, searchQuery]);

  const handleSelectCharacter = useCallback(async (characterId: string) => {
    try {
      await selectCharacter(characterId);
      // Reset filters/navigation after character selection
      setActiveTestament('all');
      setActiveGroup(null);
      setActiveBook(null);
      setSearchQuery('');
      setNavigationLevel('testaments');
    } catch (err) {
      console.error('Error selecting character:', err);
      setError('Failed to select character. Please try again.');
    }
  }, [selectCharacter]);

  const renderCharacterCard = useCallback((index: number) => {
    const character = filteredCharacters[index];
    return (
      <div className="p-2" key={character.id}>
        <CharacterCard
          character={character}
          onSelect={handleSelectCharacter}
          isSelected={selectedCharacter?.id === character.id}
        />
      </div>
    );
  }, [filteredCharacters, handleSelectCharacter, selectedCharacter]);

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
          <p className="text-white text-lg font-light" style={{ fontFamily: 'Cinzel, serif' }}>Loading Bible characters...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex h-full w-full items-center justify-center bg-gradient-to-b from-blue-900 via-blue-600 to-blue-400">
        <div className="max-w-md rounded-lg bg-white bg-opacity-90 p-8 text-center shadow-2xl">
          <svg xmlns="http://www.w3.org/2000/svg" className="h-16 w-16 mx-auto text-red-500 mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
          </svg>
          <h3 className="mb-2 text-xl font-semibold text-red-800" style={{ fontFamily: 'Cinzel, serif' }}>Error</h3>
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

  const renderContent = () => {
    switch (navigationLevel) {
      case 'testaments':
        return (
          <motion.div 
            className="grid grid-cols-1 md:grid-cols-2 gap-8"
            initial="initial"
            animate="animate"
            exit="exit"
            variants={pageVariants}
          >
            <motion.div
              className="relative overflow-hidden rounded-xl shadow-xl cursor-pointer transition-all duration-300 group h-80"
              variants={cardVariants}
              whileHover="hover"
              whileTap="tap"
              onClick={() => {
                setActiveTestament('old');
                setNavigationLevel('books');
              }}
            >
              {/* Background Image with Overlay */}
              <div className="absolute inset-0 bg-black">
                <img 
                  src="https://images.unsplash.com/photo-1518066000714-cdcd82538122?auto=format&fit=crop&w=800&q=80" 
                  alt="Old Testament"
                  className="w-full h-full object-cover opacity-70 group-hover:scale-105 transition-transform duration-700"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/50 to-transparent"></div>
              </div>
              
              {/* Divine Light Effect */}
              <div className="absolute top-0 right-0 w-40 h-40 bg-yellow-300 rounded-full blur-3xl opacity-20 group-hover:opacity-30 transition-opacity"></div>
              
              {/* Content */}
              <div className="absolute inset-0 flex flex-col justify-end p-8 text-white">
                {/* Icon */}
                <div className="mb-4 text-yellow-300 text-5xl">📜</div>
                
                <h3 className="text-3xl font-bold mb-2 text-yellow-300" style={{ fontFamily: 'Cinzel, serif' }}>Old Testament</h3>
                <div className="h-1 w-24 bg-yellow-300 rounded-full mb-4 group-hover:w-32 transition-all duration-300"></div>
                <p className="text-white/90 text-lg mb-6 max-w-xs">Explore characters from Genesis to Malachi, from creation to the prophets.</p>
                
                <div className="inline-flex items-center text-yellow-300 group-hover:translate-x-2 transition-transform">
                  <span className="mr-2">Explore</span>
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M12.293 5.293a1 1 0 011.414 0l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414-1.414L14.586 11H3a1 1 0 110-2h11.586l-2.293-2.293a1 1 0 010-1.414z" clipRule="evenodd" />
                  </svg>
                </div>
              </div>
            </motion.div>

            <motion.div
              className="relative overflow-hidden rounded-xl shadow-xl cursor-pointer transition-all duration-300 group h-80"
              variants={cardVariants}
              whileHover="hover"
              whileTap="tap"
              onClick={() => {
                setActiveTestament('new');
                setNavigationLevel('books');
              }}
            >
              {/* Background Image with Overlay */}
              <div className="absolute inset-0 bg-black">
                <img 
                  src="https://images.unsplash.com/photo-1528659860103-419421711585?auto=format&fit=crop&w=800&q=80" 
                  alt="New Testament"
                  className="w-full h-full object-cover opacity-70 group-hover:scale-105 transition-transform duration-700"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/50 to-transparent"></div>
              </div>
              
              {/* Divine Light Effect */}
              <div className="absolute top-0 right-0 w-40 h-40 bg-yellow-300 rounded-full blur-3xl opacity-20 group-hover:opacity-30 transition-opacity"></div>
              
              {/* Content */}
              <div className="absolute inset-0 flex flex-col justify-end p-8 text-white">
                {/* Icon */}
                <div className="mb-4 text-yellow-300 text-5xl">🕊️</div>
                
                <h3 className="text-3xl font-bold mb-2 text-yellow-300" style={{ fontFamily: 'Cinzel, serif' }}>New Testament</h3>
                <div className="h-1 w-24 bg-yellow-300 rounded-full mb-4 group-hover:w-32 transition-all duration-300"></div>
                <p className="text-white/90 text-lg mb-6 max-w-xs">Discover figures from Matthew to Revelation, from Jesus to his apostles.</p>
                
                <div className="inline-flex items-center text-yellow-300 group-hover:translate-x-2 transition-transform">
                  <span className="mr-2">Explore</span>
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M12.293 5.293a1 1 0 011.414 0l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414-1.414L14.586 11H3a1 1 0 110-2h11.586l-2.293-2.293a1 1 0 010-1.414z" clipRule="evenodd" />
                  </svg>
                </div>
              </div>
            </motion.div>

            <motion.div
              className="relative overflow-hidden rounded-xl shadow-xl cursor-pointer transition-all duration-300 group h-80 md:col-span-2"
              variants={cardVariants}
              whileHover="hover"
              whileTap="tap"
              onClick={() => setNavigationLevel('groups')}
            >
              {/* Background Image with Overlay */}
              <div className="absolute inset-0 bg-black">
                <img 
                  src="https://images.unsplash.com/photo-1447023029226-ef8f6b52e3ea?auto=format&fit=crop&w=1200&q=80" 
                  alt="Browse by Group"
                  className="w-full h-full object-cover opacity-70 group-hover:scale-105 transition-transform duration-700"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/50 to-transparent"></div>
              </div>
              
              {/* Divine Light Effect */}
              <div className="absolute top-0 right-0 w-40 h-40 bg-yellow-300 rounded-full blur-3xl opacity-20 group-hover:opacity-30 transition-opacity"></div>
              
              {/* Content */}
              <div className="absolute inset-0 flex flex-col justify-end p-8 text-white">
                {/* Icon */}
                <div className="mb-4 text-yellow-300 text-5xl">👥</div>
                
                <h3 className="text-3xl font-bold mb-2 text-yellow-300" style={{ fontFamily: 'Cinzel, serif' }}>Browse by Group</h3>
                <div className="h-1 w-24 bg-yellow-300 rounded-full mb-4 group-hover:w-32 transition-all duration-300"></div>
                <p className="text-white/90 text-lg mb-6 max-w-lg">Find characters organized by roles like Prophets, Apostles, Kings, and other biblical groups.</p>
                
                <div className="inline-flex items-center text-yellow-300 group-hover:translate-x-2 transition-transform">
                  <span className="mr-2">Explore Groups</span>
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M12.293 5.293a1 1 0 011.414 0l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414-1.414L14.586 11H3a1 1 0 110-2h11.586l-2.293-2.293a1 1 0 010-1.414z" clipRule="evenodd" />
                  </svg>
                </div>
              </div>
            </motion.div>
          </motion.div>
        );
      case 'groups':
        return (
          <motion.div 
            className="space-y-8"
            initial="initial"
            animate="animate"
            exit="exit"
            variants={pageVariants}
          >
            <button
              onClick={() => setNavigationLevel('testaments')}
              className="text-blue-100 hover:text-yellow-300 transition-colors flex items-center font-semibold"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" /></svg>
              Back to Testaments
            </button>
            
            <div className="relative text-center mb-12">
              <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-64 h-12 bg-yellow-300 blur-xl opacity-30 rounded-full"></div>
              <h2 className="text-4xl font-bold text-yellow-300 relative" style={{ fontFamily: 'Cinzel, serif' }}>
                Biblical Character Groups
              </h2>
              <p className="text-blue-100 mt-2 max-w-2xl mx-auto">Select a group to discover characters with similar roles and stories</p>
            </div>
            
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              <AnimatePresence>
                {groups.map(group => (
                  <motion.div
                    key={group.id}
                    className="relative overflow-hidden rounded-xl shadow-xl cursor-pointer transition-all duration-300 group h-64"
                    variants={cardVariants}
                    initial="initial"
                    animate="animate"
                    exit="exit"
                    whileHover="hover"
                    whileTap="tap"
                    onClick={() => {
                      setActiveGroup(group);
                      setNavigationLevel('characters');
                    }}
                  >
                    {/* Background Image with Overlay */}
                    <div className="absolute inset-0 bg-black">
                      <img 
                        src={getGroupImage(group.name)} 
                        alt={group.name}
                        className="w-full h-full object-cover opacity-70 group-hover:scale-105 transition-transform duration-700"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/50 to-transparent"></div>
                    </div>
                    
                    {/* Divine Light Effect */}
                    <div className="absolute top-0 right-0 w-32 h-32 bg-yellow-300 rounded-full blur-3xl opacity-20 group-hover:opacity-30 transition-opacity"></div>
                    
                    {/* Content */}
                    <div className="absolute inset-0 flex flex-col justify-end p-6 text-white">
                      <h3 className="text-2xl font-bold mb-2 text-yellow-300" style={{ fontFamily: 'Cinzel, serif' }}>{group.name}</h3>
                      <div className="h-0.5 w-16 bg-yellow-300 rounded-full mb-3 group-hover:w-24 transition-all duration-300"></div>
                      <p className="text-white/90 text-sm mb-4 line-clamp-2">{group.description || `Characters from the ${group.name} group.`}</p>
                      
                      <div className="inline-flex items-center text-yellow-300 text-sm group-hover:translate-x-2 transition-transform">
                        <span className="mr-2">View Characters</span>
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
                          <path fillRule="evenodd" d="M12.293 5.293a1 1 0 011.414 0l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414-1.414L14.586 11H3a1 1 0 110-2h11.586l-2.293-2.293a1 1 0 010-1.414z" clipRule="evenodd" />
                        </svg>
                      </div>
                    </div>
                  </motion.div>
                ))}
              </AnimatePresence>
            </div>
          </motion.div>
        );
      case 'books':
        const booksToDisplay = activeTestament === 'old' ? BIBLE_BOOKS.oldTestament : BIBLE_BOOKS.newTestament;
        return (
          <motion.div 
            className="space-y-8"
            initial="initial"
            animate="animate"
            exit="exit"
            variants={pageVariants}
          >
            <button
              onClick={() => setNavigationLevel('testaments')}
              className="text-blue-100 hover:text-yellow-300 transition-colors flex items-center font-semibold"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" /></svg>
              Back to Testaments
            </button>
            
            <div className="relative text-center mb-12">
              <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-64 h-12 bg-yellow-300 blur-xl opacity-30 rounded-full"></div>
              <h2 className="text-4xl font-bold text-yellow-300 relative" style={{ fontFamily: 'Cinzel, serif' }}>
                {activeTestament === 'old' ? 'Old Testament Books' : 'New Testament Books'}
              </h2>
              <p className="text-blue-100 mt-2 max-w-2xl mx-auto">Select a book to discover its characters</p>
            </div>
            
            {/* --- BOOK LIST -------------------------------------------------- */}
            {/* Limit height & add scroll so long lists don't overflow viewport */}
            <div
              className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4
                         max-h-[60vh] overflow-y-auto pr-1"
            >
              <AnimatePresence>
                {booksToDisplay.map(book => (
                  <motion.div
                    key={book}
                    className="relative overflow-hidden rounded-xl shadow-xl cursor-pointer transition-all duration-300 group h-48"
                    variants={cardVariants}
                    initial="initial"
                    animate="animate"
                    exit="exit"
                    whileHover="hover"
                    whileTap="tap"
                    onClick={() => {
                      setActiveBook(book);
                      setNavigationLevel('characters');
                    }}
                  >
                    {/* Background Image with Overlay */}
                    <div className="absolute inset-0 bg-black">
                      <img 
                        src={getBookImage(book)} 
                        alt={book}
                        className="w-full h-full object-cover opacity-70 group-hover:scale-105 transition-transform duration-700"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/50 to-transparent"></div>
                    </div>
                    
                    {/* Divine Light Effect */}
                    <div className="absolute top-0 right-0 w-24 h-24 bg-yellow-300 rounded-full blur-3xl opacity-20 group-hover:opacity-30 transition-opacity"></div>
                    
                    {/* Content */}
                    <div className="absolute inset-0 flex flex-col justify-center items-center p-4 text-white">
                      {/* Scroll icon */}
                      <div className="text-yellow-300 text-2xl mb-2 opacity-80">📜</div>
                      
                      <h3 className="text-xl font-bold mb-1 text-yellow-300 text-center" style={{ fontFamily: 'Cinzel, serif' }}>{book}</h3>
                      <div className="h-0.5 w-12 bg-yellow-300 rounded-full group-hover:w-16 transition-all duration-300"></div>
                    </div>
                  </motion.div>
                ))}
              </AnimatePresence>
            </div>
          </motion.div>
        );
      case 'characters':
        return (
          <motion.div 
            className="space-y-8"
            initial="initial"
            animate="animate"
            exit="exit"
            variants={pageVariants}
          >
            <button
              onClick={() => {
                if (activeGroup) {
                  setNavigationLevel('groups');
                  setActiveGroup(null);
                } else if (activeBook) {
                  setNavigationLevel('books');
                  setActiveBook(null);
                } else {
                  setNavigationLevel('testaments');
                }
              }}
              className="text-blue-100 hover:text-yellow-300 transition-colors flex items-center font-semibold"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" /></svg>
              Back to {activeGroup ? 'Groups' : activeBook ? 'Books' : 'Testaments'}
            </button>
            
            <div className="relative flex justify-between items-center mb-8">
              <div>
                <h2 className="text-3xl font-bold text-yellow-300" style={{ fontFamily: 'Cinzel, serif' }}>
                  {activeGroup 
                    ? `${activeGroup.name} Characters` 
                    : activeBook 
                      ? `Characters from ${activeBook}` 
                      : 'All Characters'}
                </h2>
                <div className="h-0.5 w-24 bg-yellow-300 rounded-full mt-2"></div>
              </div>
              <div className="text-white text-sm bg-white/10 backdrop-blur-sm px-3 py-1 rounded-full">
                {filteredCharacters.length} character{filteredCharacters.length !== 1 ? 's' : ''} found
              </div>
            </div>
            
            {/* Premium upgrade button above search */}
            <div className="mb-6 flex justify-center">
              <button
                onClick={() => (window.location.href = '/pricing.html')}
                className="animate-pulse rounded-full bg-yellow-400 px-6 py-3 text-lg font-extrabold tracking-wide text-blue-900 shadow-lg ring-2 ring-yellow-300 hover:bg-yellow-300 focus:outline-none focus:ring-4 focus:ring-yellow-200"
              >
                🔓 Unlock all 50+ characters with Premium
              </button>
            </div>
            
            {/* Search bar with divine glow */}
            <div className="relative mb-8 max-w-md mx-auto">
              <div className="absolute -inset-1 bg-gradient-to-r from-yellow-300/30 via-blue-400/20 to-yellow-300/30 rounded-full blur-md"></div>
              <div className="relative">
                <input
                  type="text"
                  placeholder="Search characters..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full rounded-full border-2 border-white/30 bg-white/20 py-3 pl-12 pr-4 text-white placeholder-blue-100 focus:border-yellow-300 focus:outline-none focus:ring-2 focus:ring-yellow-300/50 backdrop-blur-sm"
                />
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="absolute left-4 top-3.5 h-5 w-5 text-yellow-300"
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
            </div>
            
            {/* Virtualized character grid with enhanced styling */}
            <div className="relative">
              <div className="absolute -inset-4 bg-gradient-to-br from-yellow-50/20 via-white/10 to-yellow-100/20 rounded-3xl backdrop-blur-sm"></div>
              <div className="absolute -inset-1 bg-gradient-to-r from-yellow-300/20 via-white/5 to-yellow-300/20 rounded-xl"></div>
              
              <div className="relative bg-gradient-to-br from-yellow-50/20 via-white/10 to-yellow-100/20 backdrop-blur-sm rounded-xl p-6 shadow-xl">
                {filteredCharacters.length === 0 ? (
                  <div className="text-center py-16">
                    <div className="relative w-20 h-20 mx-auto mb-6">
                      <div className="absolute inset-0 bg-yellow-300 rounded-full blur-xl opacity-20"></div>
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-20 w-20 text-yellow-300 opacity-80" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M8 16l2.879-2.879m0 0a3 3 0 104.243-4.242 3 3 0 00-4.243 4.242zM21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                    </div>
                    <p className="text-2xl text-white mb-4" style={{ fontFamily: 'Cinzel, serif' }}>
                      No characters found
                    </p>
                    <p className="text-blue-100 mb-6 max-w-md mx-auto">
                      We couldn't find any characters matching your criteria. Try adjusting your search or filters.
                    </p>
                    <button
                      onClick={() => setSearchQuery('')}
                      className="text-yellow-300 hover:text-yellow-400 font-medium border border-yellow-300/50 hover:border-yellow-300 rounded-full px-6 py-2 transition-colors"
                    >
                      Clear search
                    </button>
                  </div>
                ) : (
                  <div style={{ height: '600px' }}>
                    <VirtuosoGrid
                      totalCount={filteredCharacters.length}
                      overscan={200}
                      listClassName="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6"
                      itemClassName="character-card-container"
                      itemContent={index => renderCharacterCard(index)}
                    />
                  </div>
                )}
              </div>
            </div>
          </motion.div>
        );
      default:
        return null;
    }
  };

  /* use transparent container so global gradient shows */
  return (
    <>
      <div className="relative pb-12">
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
          <h1 className="text-5xl font-extrabold text-white tracking-tight drop-shadow-lg relative" style={{ fontFamily: 'Cinzel, serif' }}>
            Ask<span className="text-yellow-300">Jesus</span>AI
          </h1>
          <p className="mt-2 text-blue-100 text-lg font-light">Choose a biblical voice to guide your journey</p>
        </header>

        {/* Premium upgrade button at the top */}
        <div className="mb-8 flex justify-center">
              <button
                onClick={() => (window.location.href = '/pricing.html')}
            className="animate-pulse rounded-full bg-yellow-400 px-6 py-3 text-lg font-extrabold tracking-wide text-blue-900 shadow-lg ring-2 ring-yellow-300 hover:bg-yellow-300 focus:outline-none focus:ring-4 focus:ring-yellow-200"
          >
            🔓 Upgrade to Premium &nbsp;–&nbsp; Unlock All 50+ Bible Characters
          </button>
        </div>

        {/* Featured Character (when at top level) */}
        {navigationLevel === 'testaments' && featuredCharacter && (
          <div className="mb-16 flex flex-col items-center">
            <div className="relative mb-6">
              {/* Halo effect */}
              <div className="absolute -inset-4 rounded-full bg-yellow-300 blur-xl opacity-30 animate-pulse"></div>
              
              {/* Circular avatar */}
              <div className="relative h-32 w-32 rounded-full overflow-hidden border-4 border-yellow-300 shadow-xl">
                <img 
                  src={featuredCharacter.avatar_url || `https://ui-avatars.com/api/?name=${encodeURIComponent(featuredCharacter.name)}&background=random`}
                  alt={featuredCharacter.name}
                  className="h-full w-full object-cover"
                />
              </div>
            </div>
            
            <h2 className="text-2xl font-bold text-white mb-2" style={{ fontFamily: 'Cinzel, serif' }}>{featuredCharacter.name}</h2>
            <p className="text-blue-100 max-w-md text-center mb-4">{featuredCharacter.description}</p>
            
            <motion.button
              onClick={() => handleSelectCharacter(featuredCharacter.id)}
              className="bg-yellow-500 hover:bg-yellow-600 text-blue-900 font-bold py-3 px-8 rounded-full shadow-lg"
              whileHover={{ scale: 1.05, boxShadow: "0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)" }}
              whileTap={{ scale: 0.98 }}
            >
              Chat with {featuredCharacter.name} 🙏
            </motion.button>
            
            <p className="mt-6 text-blue-100 text-sm">Or select another character below</p>
          </div>
        )}

        {/* Breadcrumb navigation with enhanced styling */}
        {navigationLevel !== 'testaments' && (
          <div className="mb-8 flex items-center text-sm text-blue-100 bg-white/10 backdrop-blur-sm rounded-full px-4 py-2 shadow-md">
          <button
            onClick={() => (window.location.href = '/pricing.html')}
              className="hover:text-yellow-300 transition-colors flex items-center"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
              </svg>
              Home
            </button>

            {/* Premium breadcrumb button */}
            <button
              onClick={() => (window.location.href = '/pricing.html')}
              className="ml-3 flex items-center rounded-full bg-yellow-400 px-3 py-1 font-semibold text-blue-900 shadow hover:bg-yellow-300 transition-colors"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-4 w-4 mr-1"
                viewBox="0 0 24 24"
                fill="currentColor"
              >
                <path
                  fillRule="evenodd"
                  d="M12 1.5a4.5 4.5 0 00-4.5 4.5v1.05A3.001 3.001 0 006 10.5v9a3 3 0 003 3h6a3 3 0 003-3v-9a3.001 3.001 0 00-1.5-2.625V6A4.5 4.5 0 0012 1.5zM9 6a3 3 0 016 0v1.5H9V6z"
                  clipRule="evenodd"
                />
              </svg>
              Premium
            </button>
            
            {navigationLevel === 'groups' && (
              <>
                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mx-2 text-yellow-300/70" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
                <span className="text-yellow-300">Character Groups</span>
              </>
            )}
            
            {navigationLevel === 'books' && (
              <>
                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mx-2 text-yellow-300/70" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
                <span className="text-yellow-300">{activeTestament === 'old' ? 'Old Testament' : 'New Testament'} Books</span>
              </>
            )}
            
            {navigationLevel === 'characters' && (
              <>
                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mx-2 text-yellow-300/70" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
                
                {activeGroup && (
                  <>
                    <button 
                      onClick={() => {
                        setNavigationLevel('groups');
                        setActiveGroup(null);
                      }}
                      className="hover:text-yellow-300 transition-colors"
                    >
                      Character Groups
                    </button>
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mx-2 text-yellow-300/70" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                    </svg>
                    <span className="text-yellow-300">{activeGroup.name}</span>
                  </>
                )}
                
                {activeBook && (
                  <>
                    <button 
                      onClick={() => {
                        setNavigationLevel('books');
                        setActiveBook(null);
                      }}
                      className="hover:text-yellow-300 transition-colors"
                    >
                      {activeTestament === 'old' ? 'Old Testament' : 'New Testament'} Books
                    </button>
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mx-2 text-yellow-300/70" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                    </svg>
                    <span className="text-yellow-300">{activeBook}</span>
                  </>
                )}
              </>
            )}
          </div>
        )}

        {/* Main content based on navigation level with AnimatePresence for transitions */}
        <AnimatePresence mode="wait">
          {renderContent()}
        </AnimatePresence>
      </div>

      {/* Visual indicator that this scalable selector is active */}
      <span
        className="fixed bottom-3 left-3 z-50 rounded-full bg-amber-400/90 px-3 py-1 text-xs font-semibold text-blue-900 shadow-lg select-none"
        title="Scalable selector active"
      >
        Scalable&nbsp;UI
      </span>
    </>
  );
};

export default ScalableCharacterSelection;
