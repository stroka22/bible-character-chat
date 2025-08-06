import { jsx as _jsx, jsxs as _jsxs, Fragment as _Fragment } from "react/jsx-runtime";
import { useState, useEffect, useCallback, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { VirtuosoGrid } from 'react-virtuoso';
import { characterRepository } from '../repositories/characterRepository';
import { groupRepository } from '../repositories/groupRepository';
// Use the mock chat context so we don't hit the real Supabase APIs
import { useChat } from '../contexts/ChatContext.jsx';
import CharacterCard from './CharacterCard.jsx';
console.log('🚀🚀🚀 ScalableCharacterSelection MODULE LOADED! 🚀🚀🚀');
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
const ScalableCharacterSelection = () => {
    console.log('⚡ ScalableCharacterSelection RENDER START ⚡');
    const navigate = useNavigate();
    const [characters, setCharacters] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState(null);
    const [searchQuery, setSearchQuery] = useState('');
    const [viewMode, setViewMode] = useState('grid');
    const [testament, setTestament] = useState('all');
    const [bookFilter, setBookFilter] = useState('all');
    const [groupFilter, setGroupFilter] = useState('all');
    const [currentPage, setCurrentPage] = useState(1);
    const [currentLetter, setCurrentLetter] = useState('all');
    const [groups, setGroups] = useState([]);
    const [activeFilters, setActiveFilters] = useState([]);
    const [featuredCharacter, setFeaturedCharacter] = useState(null);
    const [isSelecting, setIsSelecting] = useState(false);
    const [favoriteCharacters, setFavoriteCharacters] = useState([]);
    const [showOnlyFavorites, setShowOnlyFavorites] = useState(false);
    const itemsPerPage = 20;
    const { selectCharacter, character: selectedCharacter } = useChat();
    
    // Load saved favorites from localStorage on component mount
    useEffect(() => {
        try {
            const savedFavorites = localStorage.getItem('favoriteCharacters');
            if (savedFavorites) {
                setFavoriteCharacters(JSON.parse(savedFavorites));
            }
        } catch (error) {
            console.error('Error loading favorite characters:', error);
        }
    }, []);
    
    // Save favorites to localStorage whenever they change
    useEffect(() => {
        try {
            localStorage.setItem('favoriteCharacters', JSON.stringify(favoriteCharacters));
        } catch (error) {
            console.error('Error saving favorite characters:', error);
        }
    }, [favoriteCharacters]);
    
    // Handle setting a character as featured
    const handleSetAsFeatured = useCallback((character) => {
        if (!character) return;
        
        try {
            // Save to localStorage
            localStorage.setItem('featuredCharacter', character.name);
            setFeaturedCharacter(character);
            
            // Show confirmation
            alert(`${character.name} is now your featured character!`);
        } catch (error) {
            console.error('Error setting featured character:', error);
        }
    }, []);
    
    const fetchCharacters = useCallback(async () => {
        setIsLoading(true);
        setError(null);
        try {
            const data = await characterRepository.getAll();
            setCharacters(data);
            
            // 1. Check URL parameter for featured character
            const urlParams = new URLSearchParams(window.location.search);
            const featuredParam = urlParams.get('featured');
            
            let featured = null;
            
            if (featuredParam) {
                // Try to find character by name (case insensitive)
                featured = data.find(c => 
                    c.name.toLowerCase() === featuredParam.toLowerCase() ||
                    c.name.toLowerCase().includes(featuredParam.toLowerCase())
                );
                
                if (featured) {
                    console.log(`Found featured character from URL: ${featured.name}`);
                    setFeaturedCharacter(featured);
                    return;
                }
            }
            
            // 2. Check localStorage for saved featured character
            const savedFeatured = localStorage.getItem('featuredCharacter');
            if (savedFeatured) {
                featured = data.find(c => 
                    c.name.toLowerCase() === savedFeatured.toLowerCase() ||
                    c.name.toLowerCase().includes(savedFeatured.toLowerCase())
                );
                
                if (featured) {
                    console.log(`Found featured character from localStorage: ${featured.name}`);
                    setFeaturedCharacter(featured);
                    return;
                }
            }
            
            // 3. Fallback to Jesus or first character (existing logic)
            const jesus = data.find(c => c.name.toLowerCase().includes('jesus'));
            setFeaturedCharacter(jesus || (data.length > 0 ? data[0] : null));
        }
        catch (err) {
            console.error('Failed to fetch characters:', err);
            setError('Failed to load Bible characters. Please try again later.');
        }
        finally {
            setIsLoading(false);
        }
    }, []);
    useEffect(() => {
        console.log('🪄 ScalableCharacterSelection useEffect (mount) fired');
        fetchCharacters();
    }, [fetchCharacters]);
    useEffect(() => {
        console.log('📚 ScalableCharacterSelection fetching groups list');
        (async () => {
            try {
                const all = await groupRepository.getAllGroups();
                setGroups(all);
            }
            catch (e) {
                console.error('Failed to fetch character groups:', e);
            }
        })();
    }, []);
    /**
     * Handle when a user chooses a character card.
     * Depending on the caller we may receive either:
     *   1) the full character object   – when `CharacterCard` calls
     *   2) a character ID (string/number) – when the list view button calls
     *
     * Support both forms to avoid mismatches that lead to the
     * "Character not found" error.
     */
    const handleSelectCharacter = useCallback(
        async (characterIdOrObject) => {
            try {
                setIsSelecting(true);

                // Determine if we already have the full object or just an ID
                let characterObj =
                    typeof characterIdOrObject === 'object'
                        ? characterIdOrObject
                        : characters.find((c) => `${c.id}` === `${characterIdOrObject}`);

                if (!characterObj) {
                    console.error(
                        'Character not found for ID:',
                        characterIdOrObject,
                        '\nAvailable IDs:',
                        characters.map((c) => c.id)
                    );
                    throw new Error('Character not found');
                }

                await selectCharacter(characterObj);
            } catch (err) {
                console.error('Error selecting character:', err);
                setError('Failed to select character. Please try again.');
            } finally {
                setIsSelecting(false);
            }
        },
        [selectCharacter, characters]
    );
    
    // Handle toggling a character as favorite
    const handleToggleFavorite = useCallback((characterId) => {
        setFavoriteCharacters(prevFavorites => {
            if (prevFavorites.includes(characterId)) {
                return prevFavorites.filter(id => id !== characterId);
            } else {
                return [...prevFavorites, characterId];
            }
        });
    }, []);
    
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
        if (showOnlyFavorites) {
            newFilters.push({
                type: 'favorites',
                value: 'Favorites only'
            });
        }
        setActiveFilters(newFilters);
    }, [testament, bookFilter, groupFilter, searchQuery, currentLetter, showOnlyFavorites]);
    
    const removeFilter = (type) => {
        switch (type) {
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
            case 'favorites':
                setShowOnlyFavorites(false);
                break;
        }
        setCurrentPage(1);
    };
    
    const filteredCharacters = useMemo(() => {
        let result = [...characters];
        
        // Filter by favorites if enabled
        if (showOnlyFavorites) {
            result = result.filter(c => favoriteCharacters.includes(c.id));
        }
        
        if (searchQuery.trim()) {
            result = result.filter((c) => c.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                (c.description || '').toLowerCase().includes(searchQuery.toLowerCase()));
        }
        if (testament !== 'all') {
            result = result.filter((c) => {
                const textToSearch = `${c.description || ''} ${c.bible_book || ''} ${c.scriptural_context || ''}`.toLowerCase();
                return testament === 'old'
                    ? /(genesis|exodus|leviticus|numbers|deuteronomy|joshua|judges|ruth|samuel|kings|chronicles|ezra|nehemiah|esther|job|psalms|proverbs|ecclesiastes|song of solomon|isaiah|jeremiah|lamentations|ezekiel|daniel|hosea|joel|amos|obadiah|jonah|micah|nahum|habakkuk|zephaniah|haggai|zechariah|malachi|old testament)/i.test(textToSearch)
                    : /(matthew|mark|luke|john|acts|romans|corinthians|galatians|ephesians|philippians|colossians|thessalonians|timothy|titus|philemon|hebrews|james|peter|john|jude|revelation|new testament)/i.test(textToSearch);
            });
        }
        if (bookFilter !== 'all') {
            result = result.filter((c) => {
                const textToSearch = `${c.description || ''} ${c.bible_book || ''} ${c.scriptural_context || ''}`.toLowerCase();
                return textToSearch.includes(bookFilter.toLowerCase());
            });
        }
        if (groupFilter !== 'all') {
            result = result.filter((c) => {
                const textToSearch = `${c.description || ''}`.toLowerCase();
                return textToSearch.includes(groupFilter.toLowerCase());
            });
        }
        if (currentLetter !== 'all') {
            result = result.filter(c => c.name.toUpperCase().startsWith(currentLetter));
        }
        result.sort((a, b) => a.name.localeCompare(b.name));

        /* ------------------------------------------------------------------
         * Always include key demo characters (Jesus, Paul, Moses) even if
         * they were filtered out by the criteria above. This guarantees the
         * CSV-imported records remain visible to the user.
         * ------------------------------------------------------------------ */
        const mustShowNames = ['jesus', 'paul', 'moses'];
        const mustShow = characters.filter(
            c => mustShowNames.includes(c.name.toLowerCase())
        );
        mustShow.forEach(c => {
            if (!result.some(r => r.id === c.id)) {
                result.push(c);
            }
        });

        // Resort after forced inclusion so alphabetical order is preserved
        result.sort((a, b) => a.name.localeCompare(b.name));
        return result;
    }, [characters, searchQuery, testament, bookFilter, groupFilter, currentLetter, showOnlyFavorites, favoriteCharacters]);
    
    const paginatedCharacters = useMemo(() => {
        const startIndex = (currentPage - 1) * itemsPerPage;
        return filteredCharacters.slice(startIndex, startIndex + itemsPerPage);
    }, [filteredCharacters, currentPage, itemsPerPage]);
    
    const totalPages = Math.ceil(filteredCharacters.length / itemsPerPage);
    
    const renderCharacterItem = useCallback((index) => {
        const character = paginatedCharacters[index];

        // ------------------------------------------------------------------
        // Safety checks – prevent runtime errors if character data is missing
        // ------------------------------------------------------------------
        if (!character) {
            console.warn(`renderCharacterItem: character at index ${index} is undefined`);
            return null;
        }

        if (!character.id) {
            console.warn(`renderCharacterItem: character.id is undefined at index ${index}`, character);
            return null;
        }

        const isFavorite = favoriteCharacters.includes(character.id);
        const isFeatured = featuredCharacter?.id === character.id;

        /* ---------- GRID VIEW ---------- */
        if (viewMode === 'grid') {
            return (
                _jsx("div", {
                    className: "p-4 overflow-visible",
                    children: _jsx(CharacterCard, {
                        character,
                        onSelect: handleSelectCharacter,
                        isSelected: selectedCharacter?.id === character.id,
                        isFavorite,
                        onToggleFavorite: () => handleToggleFavorite(character.id),
                        isFeatured,
                        onSetAsFeatured: () => handleSetAsFeatured(character),
                    }),
                }, character?.id || `character-item-${index}`)
            );
        }

        /* ---------- LIST VIEW ---------- */
        return (
            _jsxs("div", {
                className: `
                    flex items-center gap-4 bg-white/10 backdrop-blur-sm rounded-xl p-4
                    border border-white/15 transition-all duration-300 hover:bg-white/15 cursor-pointer
                    ${selectedCharacter?.id === character.id ? 'border-yellow-400 ring-2 ring-yellow-400/30' : ''}
                    ${isFeatured ? 'border-yellow-500 bg-yellow-500/10' : ''}
                `,
                onClick: () => handleSelectCharacter(character.id),
                children: [
                    /* Avatar ------------------------------------------------- */
                    _jsx("div", {
                        className: `
                            flex-shrink-0 w-16 h-16 rounded-full overflow-hidden 
                            ${selectedCharacter?.id === character.id ? 'border-2 border-yellow-400' : 'border-2 border-white/30'}
                            ${isFeatured ? 'border-yellow-500 ring-2 ring-yellow-500/30' : ''}
                            bg-blue-50
                        `,
                        children: _jsx("img", {
                            src: character.avatar_url ||
                                `https://ui-avatars.com/api/?name=${encodeURIComponent(character.name)}&background=random`,
                            alt: character.name,
                            className: "w-full h-full object-cover",
                        }),
                    }),
                ], character?.id || `character-item-${index}`)
                    /* Details ------------------------------------------------ */
                    _jsxs("div", {
                        className: "flex-1",
                        children: [
                            /* Name + star + featured */
                            _jsxs("div", {
                                className: "flex items-center",
                                children: [
                                    _jsx("h3", {
                                        className: `text-xl font-bold ${isFeatured ? 'text-yellow-500' : 'text-yellow-400'}`,
                                        style: { fontFamily: 'Cinzel, serif' },
                                        children: character.name,
                                    }),
                                    
                                    /* Favorite button */
                                    _jsx("button", {
                                        onClick: (e) => {
                                            e.stopPropagation();
                                            handleToggleFavorite(character.id);
                                        },
                                        className: `ml-2 ${isFavorite
                                            ? 'text-yellow-400'
                                            : 'text-gray-400 hover:text-yellow-300'}`,
                                        title: isFavorite ? "Remove from favorites" : "Add to favorites",
                                        children: _jsx("svg", {
                                            xmlns: "http://www.w3.org/2000/svg",
                                            className: "h-5 w-5",
                                            viewBox: "0 0 20 20",
                                            fill: isFavorite ? "currentColor" : "none",
                                            stroke: "currentColor",
                                            strokeWidth: isFavorite ? "0" : "1.5",
                                            children: _jsx("path", {
                                                d: "M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118l-2.8-2.034c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z",
                                            }),
                                        }),
                                    }),
                                    
                                    /* Set as Featured button */
                                    _jsx("button", {
                                        onClick: (e) => {
                                            e.stopPropagation();
                                            handleSetAsFeatured(character);
                                        },
                                        className: `ml-2 ${isFeatured
                                            ? 'text-yellow-500'
                                            : 'text-gray-400 hover:text-yellow-300'}`,
                                        title: isFeatured ? "Current featured character" : "Set as featured character",
                                        children: _jsx("svg", {
                                            xmlns: "http://www.w3.org/2000/svg",
                                            className: "h-5 w-5",
                                            viewBox: "0 0 20 20",
                                            fill: isFeatured ? "currentColor" : "none",
                                            stroke: "currentColor",
                                            strokeWidth: isFeatured ? "0" : "1.5",
                                            children: _jsx("path", {
                                                d: "M5 4a2 2 0 012-2h6a2 2 0 012 2v14l-5-2.5L5 18V4z",
                                            }),
                                        }),
                                    }),
                                    
                                    /* Featured badge */
                                    isFeatured && (
                                        _jsx("span", {
                                            className: "ml-2 text-xs bg-yellow-500/20 text-yellow-500 px-2 py-0.5 rounded-full border border-yellow-500/30",
                                            children: "Featured"
                                        })
                                    )
                                ],
                            }),

                            /* Description */
                            _jsx("p", {
                                className: "text-white/80 line-clamp-2",
                                children: character.description,
                            }),

                            /* Meta */
                            _jsxs("div", {
                                className: "text-xs text-white/50 mt-1",
                                children: [
                                    character.bible_book && `${character.bible_book} • `,
                                    testament === 'old'
                                        ? 'Old Testament'
                                        : testament === 'new'
                                            ? 'New Testament'
                                            : '',
                                ],
                            }),
                        ],
                    }),

                    /* Action button ----------------------------------------- */
                    _jsx("button", {
                        className: `
                            px-4 py-2 rounded-lg text-sm font-medium
                            ${selectedCharacter?.id === character.id
                                ? 'bg-yellow-400 text-blue-900'
                                : 'bg-white/10 text-white hover:bg-white/20'}
                        `,
                        children: selectedCharacter?.id === character.id ? 'Continue' : 'Chat',
                    }),
                ],
            }, character?.id || `character-item-${index}`)
        );
    }, [paginatedCharacters, viewMode, handleSelectCharacter, selectedCharacter, favoriteCharacters, handleToggleFavorite, featuredCharacter, handleSetAsFeatured]);
    
    const renderPagination = () => {
        if (totalPages <= 1)
            return null;
        const maxVisiblePages = 5;
        let startPage = Math.max(1, currentPage - Math.floor(maxVisiblePages / 2));
        let endPage = Math.min(totalPages, startPage + maxVisiblePages - 1);
        if (endPage - startPage + 1 < maxVisiblePages) {
            startPage = Math.max(1, endPage - maxVisiblePages + 1);
        }
        const pages = [];
        pages.push(_jsx("button", { onClick: () => setCurrentPage(prev => Math.max(1, prev - 1)), disabled: currentPage === 1, className: "w-10 h-10 rounded-lg flex items-center justify-center bg-white/10 text-white disabled:opacity-50 disabled:cursor-not-allowed", "aria-label": "Previous page", children: _jsx("svg", { xmlns: "http://www.w3.org/2000/svg", className: "h-5 w-5", viewBox: "0 0 20 20", fill: "currentColor", children: _jsx("path", { fillRule: "evenodd", d: "M12.707 5.293a1 1 0 010 1.414L9.414 10l3.293 3.293a1 1 0 01-1.414 1.414l-4-4a1 1 0 010-1.414l4-4a1 1 0 011.414 0z", clipRule: "evenodd" }) }) }, "prev"));
        if (startPage > 1) {
            pages.push(_jsx("button", { onClick: () => setCurrentPage(1), className: "w-10 h-10 rounded-lg flex items-center justify-center bg-white/10 text-white hover:bg-white/20", children: "1" }, "1"));
            if (startPage > 2) {
                pages.push(_jsx("span", { className: "w-10 h-10 flex items-center justify-center text-white", children: "..." }, "ellipsis1"));
            }
        }
        for (let i = startPage; i <= endPage; i++) {
            pages.push(_jsx("button", { onClick: () => setCurrentPage(i), className: `w-10 h-10 rounded-lg flex items-center justify-center ${currentPage === i
                    ? 'bg-yellow-400 text-blue-900 font-bold'
                    : 'bg-white/10 text-white hover:bg-white/20'}`, children: i }, i));
        }
        if (endPage < totalPages - 1) {
            pages.push(_jsx("span", { className: "w-10 h-10 flex items-center justify-center text-white", children: "..." }, "ellipsis2"));
        }
        if (endPage < totalPages) {
            pages.push(_jsx("button", { onClick: () => setCurrentPage(totalPages), className: "w-10 h-10 rounded-lg flex items-center justify-center bg-white/10 text-white hover:bg-white/20", children: totalPages }, totalPages));
        }
        pages.push(_jsx("button", { onClick: () => setCurrentPage(prev => Math.min(totalPages, prev + 1)), disabled: currentPage === totalPages, className: "w-10 h-10 rounded-lg flex items-center justify-center bg-white/10 text-white disabled:opacity-50 disabled:cursor-not-allowed", "aria-label": "Next page", children: _jsx("svg", { xmlns: "http://www.w3.org/2000/svg", className: "h-5 w-5", viewBox: "0 0 20 20", fill: "currentColor", children: _jsx("path", { fillRule: "evenodd", d: "M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z", clipRule: "evenodd" }) }) }, "next"));
        return (_jsx("div", { className: "flex items-center justify-center gap-2 mt-8", children: pages }));
    };
    
    // Render only the desktop alphabet selector in the renderAlphaNav function
    const renderAlphaNav = () => {
        const letters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ'.split('');
        
        /* ------------------------------------------------------------------
         * Desktop alphabet selector - COMPLETELY NEW POSITIONING APPROACH
         * ------------------------------------------------------------------
         * - Using margin instead of absolute/fixed positioning
         * - Floating the selector to the right with margin
         * - Setting a specific margin-top to avoid overlapping the horizontal selector
         * - Using sticky positioning so it stays visible while scrolling
         * ------------------------------------------------------------------ */
        return (
            _jsxs("div", { 
                /* ------------------------------------------------------------------
                 * Simplified, reliable positioning:
                 *  - Fixed so it always stays visible while scrolling
                 *  - Placed lower (top: 200px) and to the far right (right: 20px)
                 *    to avoid overlapping the horizontal selector on mobile/tablet.
                 * ------------------------------------------------------------------ */
                style: {
                    /* Keep the selector fixed but start it higher so it does not
                       overlap the horizontal selector and remains fully visible.
                       `calc(100vh - 120px)` ensures the entire list is scrollable
                       without cutting off the last letters on shorter screens. */
                    position: 'fixed',
                    /* Move slightly farther right to create visual breathing room */
                    right: '30px',
                    /* Lower the selector so it aligns with the beginning of the character cards */
                    top: '300px',            /* << Adjusted from 120px to 300px */
                    zIndex: 40,
                    /* Give the list an extra 30 px of breathing room */
                    maxHeight: 'calc(100vh - 150px)',
                },
                /* Reduce Tailwind max-height to 70vh to give the tooltip a bit
                   more breathing room and match the inline maxHeight above. */
                className: "hidden md:flex flex-col gap-1.5 bg-blue-800/90 backdrop-blur-md rounded-xl py-5 px-3 border-2 border-yellow-400/50 shadow-2xl max-h-[60vh] overflow-y-auto", 
                children: [
                    _jsx("button", { 
                        onClick: () => {
                            setCurrentLetter('all');
                            setCurrentPage(1);
                        }, 
                        "aria-label": "Show all characters", 
                        className: `w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium ${
                            currentLetter === 'all'
                                ? 'bg-yellow-400 text-blue-900 font-bold shadow-md'
                                : 'text-white hover:bg-white/20'
                        }`, 
                        children: "All" 
                    }),
                    letters.map(letter => (
                        _jsx("button", { 
                            onClick: () => {
                                setCurrentLetter(letter);
                                setCurrentPage(1);
                            }, 
                            "aria-label": `Show characters starting with ${letter}`, 
                            className: `w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium ${
                                currentLetter === letter
                                    ? 'bg-yellow-400 text-blue-900 font-bold shadow-md'
                                    : 'text-white hover:bg-white/20'
                            }`, 
                            children: letter,
                            key: letter
                        })
                    ))
                ] 
            })
        );
    };
    
    // Create the mobile alphabet selector component to be placed directly above character cards
    const renderMobileAlphaNav = () => {
        const letters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ'.split('');
        
        return (
            _jsx("div", { 
                className: "md:hidden bg-blue-800/90 backdrop-blur-md border-b-2 border-yellow-400/50 shadow-lg mb-4 py-2 px-2 overflow-x-auto rounded-t-xl", 
                children: _jsxs("div", {
                    className: "flex flex-row gap-1 min-w-max px-2",
                    children: [
                        _jsx("button", { 
                            onClick: () => {
                                setCurrentLetter('all');
                                setCurrentPage(1);
                            }, 
                            "aria-label": "Show all characters", 
                            className: `w-10 h-10 rounded-full flex items-center justify-center text-sm font-medium ${
                                currentLetter === 'all'
                                    ? 'bg-yellow-400 text-blue-900 font-bold shadow-md'
                                    : 'text-white hover:bg-white/20'
                            }`, 
                            children: "All" 
                        }),
                        letters.map(letter => (
                            _jsx("button", { 
                                onClick: () => {
                                    setCurrentLetter(letter);
                                    setCurrentPage(1);
                                }, 
                                "aria-label": `Show characters starting with ${letter}`, 
                                className: `w-10 h-10 rounded-full flex items-center justify-center text-sm font-medium ${
                                    currentLetter === letter
                                        ? 'bg-yellow-400 text-blue-900 font-bold shadow-md'
                                        : 'text-white hover:bg-white/20'
                                }`, 
                                children: letter,
                                key: letter
                            })
                        ))
                    ]
                })
            })
        );
    };
    
    if (isLoading) {
        return (_jsx("div", { className: "flex h-full w-full items-center justify-center bg-gradient-to-b from-[#0a0a2a] via-[#1a1a4a] to-[#2a2a6a]", children: _jsxs("div", { className: "text-center", children: [_jsxs("div", { className: "relative mb-6", children: [_jsx("div", { className: "absolute inset-0 rounded-full bg-yellow-300 blur-xl opacity-30 animate-pulse" }), _jsx("div", { className: "relative h-16 w-16 mx-auto animate-spin rounded-full border-4 border-yellow-200 border-t-yellow-400" }), _jsx("div", { className: "absolute inset-0 flex items-center justify-center", children: _jsx("span", { className: "text-white text-xl", children: "\u271D" }) })] }), _jsx("p", { className: "text-white text-lg font-light", style: { fontFamily: 'Cinzel, serif' }, children: "Loading Bible characters..." })] }) }));
    }
    if (error) {
        return (_jsx("div", { className: "flex h-full w-full items-center justify-center bg-gradient-to-b from-[#0a0a2a] via-[#1a1a4a] to-[#2a2a6a]", children: _jsxs("div", { className: "max-w-md rounded-lg bg-white bg-opacity-90 p-8 text-center shadow-2xl", children: [_jsx("svg", { xmlns: "http://www.w3.org/2000/svg", className: "h-16 w-16 mx-auto text-red-500 mb-4", fill: "none", viewBox: "0 0 24 24", stroke: "currentColor", children: _jsx("path", { strokeLinecap: "round", strokeLinejoin: "round", strokeWidth: 2, d: "M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" }) }), _jsx("h3", { className: "mb-2 text-xl font-semibold text-red-800", style: { fontFamily: 'Cinzel, serif' }, children: "Error" }), _jsx("p", { className: "text-red-700 mb-4", children: error }), _jsx("button", { onClick: () => window.location.reload(), className: "rounded-md bg-red-600 px-6 py-2 text-white hover:bg-red-700 transition-colors shadow-md", children: "Try Again" })] }) }));
    }
    return (_jsxs("div", { className: "relative min-h-screen bg-gradient-to-b from-[#0a0a2a] via-[#1a1a4a] to-[#2a2a6a] py-10 px-4 md:px-6", children: [
        // Desktop alphabet selector
        renderAlphaNav(), 
        _jsxs("div", { className: "max-w-7xl mx-auto bg-white/8 backdrop-blur-sm rounded-2xl p-6 border border-white/15 shadow-xl", children: [
            _jsx("h1", { className: "text-4xl md:text-5xl font-extrabold text-center text-yellow-400 mb-8 tracking-tight drop-shadow-lg", style: { fontFamily: 'Cinzel, serif' }, children: "Choose Your Biblical Guide" }), 
            featuredCharacter && (_jsxs("div", { className: "mb-12 flex flex-col items-center", children: [
                _jsxs("div", { className: "relative mb-4", children: [
                    _jsx("div", { className: "absolute -inset-4 rounded-full bg-yellow-300 blur-xl opacity-30" }), 
                    _jsx("div", { className: "relative w-32 h-32 rounded-full overflow-hidden border-4 border-yellow-300 shadow-xl bg-blue-50", children: _jsx("img", { 
                        src: featuredCharacter.avatar_url || `https://ui-avatars.com/api/?name=${encodeURIComponent(featuredCharacter.name)}&background=random`, 
                        alt: featuredCharacter.name, 
                        className: "w-full h-full object-cover" 
                    }) 
                })] }), 
                _jsx("h2", { className: "text-2xl font-bold text-white mb-2", style: { fontFamily: 'Cinzel, serif' }, children: featuredCharacter.name }), 
                _jsx("p", { className: "text-blue-100 max-w-md text-center mb-4", children: featuredCharacter.description }), 
                _jsxs("button", { onClick: () => handleSelectCharacter(featuredCharacter.id), className: "bg-yellow-500 hover:bg-yellow-600 text-blue-900 font-bold py-3 px-8 rounded-full shadow-lg transform transition-all hover:scale-105 active:scale-95", children: ["Chat with ", featuredCharacter.name, " \uD83D\uDE4F"] }), 
                _jsx("p", { className: "mt-6 text-blue-100 text-sm", children: "Or select another character below" })
            ] })), 
            _jsx("div", { className: "bg-white/5 backdrop-blur-sm rounded-xl p-4 mb-6", children: _jsxs("div", { className: "flex flex-col md:flex-row gap-4 items-center", children: [
                _jsx("div", { className: "w-full md:flex-1", children: _jsx("input", { type: "text", placeholder: "Search characters...", value: searchQuery, onChange: (e) => {
                    setSearchQuery(e.target.value);
                    setCurrentPage(1);
                }, className: "w-full bg-white/10 border border-white/30 rounded-full py-2 px-4 text-white placeholder-blue-100 focus:outline-none focus:ring-2 focus:ring-yellow-400/50" }) }), 
                _jsxs("div", { className: "flex gap-2", children: [
                    _jsx("button", { onClick: () => {
                        setTestament('all');
                        setCurrentPage(1);
                    }, className: `px-4 py-2 rounded-full ${testament === 'all'
                        ? 'bg-yellow-400 text-blue-900 font-bold'
                        : 'bg-white/10 text-white hover:bg-white/20'}`, children: "All" }), 
                    _jsx("button", { onClick: () => {
                        setTestament('old');
                        setCurrentPage(1);
                    }, className: `px-4 py-2 rounded-full ${testament === 'old'
                        ? 'bg-yellow-400 text-blue-900 font-bold'
                        : 'bg-white/10 text-white hover:bg-white/20'}`, children: "Old" }), 
                    _jsx("button", { onClick: () => {
                        setTestament('new');
                        setCurrentPage(1);
                    }, className: `px-4 py-2 rounded-full ${testament === 'new'
                        ? 'bg-yellow-400 text-blue-900 font-bold'
                        : 'bg-white/10 text-white hover:bg-white/20'}`, children: "New" })
                ] }), 
                _jsx("div", { className: "w-full md:w-auto", children: _jsxs("select", { value: bookFilter, onChange: (e) => {
                    setBookFilter(e.target.value);
                    setCurrentPage(1);
                }, className: "w-full md:w-auto bg-white/10 border border-white/30 rounded-full py-2 px-4 text-white focus:outline-none focus:ring-2 focus:ring-yellow-400/50", children: [
                    _jsx("option", { value: "all", children: "All Books" }), 
                    _jsx("optgroup", { label: "Old Testament", children: BIBLE_BOOKS.oldTestament.map(book => (_jsx("option", { value: book, children: book, key: book }, book))) }), 
                    _jsx("optgroup", { label: "New Testament", children: BIBLE_BOOKS.newTestament.map(book => (_jsx("option", { value: book, children: book, key: book }, book))) })
                ] }) }), 
                _jsx("div", { className: "w-full md:w-auto", children: _jsxs("select", { value: groupFilter, onChange: (e) => {
                    setGroupFilter(e.target.value);
                    setCurrentPage(1);
                }, className: "w-full md:w-auto bg-white/10 border border-white/30 rounded-full py-2 px-4 text-white focus:outline-none focus:ring-2 focus:ring-yellow-400/50", children: [
                    _jsx("option", { value: "all", children: "All Groups" }), 
                    _jsx("option", { value: "Prophets", children: "Prophets" }), 
                    _jsx("option", { value: "Apostles", children: "Apostles" }), 
                    _jsx("option", { value: "Kings", children: "Kings" }), 
                    _jsx("option", { value: "Women", children: "Women of the Bible" }), 
                    groups.map(group => (_jsx("option", { value: group.name, children: group.name, key: group.id }, group.id)))
                ] }) }), 
                
                // Favorites toggle button
                _jsx("button", {
                    onClick: () => {
                        setShowOnlyFavorites(prev => !prev);
                        setCurrentPage(1);
                    },
                    className: `px-4 py-2 rounded-full flex items-center gap-1 ${
                        showOnlyFavorites
                            ? 'bg-yellow-400 text-blue-900 font-bold'
                            : 'bg-white/10 text-white hover:bg-white/20'
                    }`,
                    children: [
                        _jsx("svg", {
                            xmlns: "http://www.w3.org/2000/svg",
                            className: "h-4 w-4 mr-1",
                            viewBox: "0 0 20 20",
                            fill: "currentColor",
                            children: _jsx("path", {
                                d: "M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118l-2.8-2.034c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z"
                            })
                        }),
                        "Favorites"
                    ]
                }),
                
                _jsxs("div", { className: "flex gap-2", children: [
                    _jsx("button", { onClick: () => setViewMode('grid'), className: `w-10 h-10 rounded-lg flex items-center justify-center ${viewMode === 'grid'
                        ? 'bg-yellow-400 text-blue-900'
                        : 'bg-white/10 text-white hover:bg-white/20'}`, "aria-label": "Grid view", children: _jsx("svg", { xmlns: "http://www.w3.org/2000/svg", className: "h-5 w-5", viewBox: "0 0 20 20", fill: "currentColor", children: _jsx("path", { d: "M5 3a2 2 0 00-2 2v2a2 2 0 002 2h2a2 2 0 002-2V5a2 2 0 00-2-2H5zM5 11a2 2 0 00-2 2v2a2 2 0 002 2h2a2 2 0 002-2v-2a2 2 0 00-2-2H5zM11 5a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V5zM11 13a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z" }) }) }), 
                    _jsx("button", { onClick: () => setViewMode('list'), className: `w-10 h-10 rounded-lg flex items-center justify-center ${viewMode === 'list'
                        ? 'bg-yellow-400 text-blue-900'
                        : 'bg-white/10 text-white hover:bg-white/20'}`, "aria-label": "List view", children: _jsx("svg", { xmlns: "http://www.w3.org/2000/svg", className: "h-5 w-5", viewBox: "0 0 20 20", fill: "currentColor", children: _jsx("path", { fillRule: "evenodd", d: "M3 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm0 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm0 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm0 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1z", clipRule: "evenodd" }) }) })
                ] })
            ] }) }), 
            activeFilters.length > 0 && (_jsxs("div", { className: "flex flex-wrap gap-2 mb-6 bg-white/5 p-3 rounded-lg", children: [
                _jsx("span", { className: "text-white/70 text-sm", children: "Active Filters:" }), 
                activeFilters.map((filter, index) => (_jsxs("div", { className: "flex items-center gap-1 bg-yellow-400/20 text-yellow-300 px-3 py-1 rounded-full border border-yellow-400/50", children: [
                    _jsx("span", { children: filter.value }), 
                    _jsx("button", { onClick: () => removeFilter(filter.type), className: "w-5 h-5 rounded-full bg-white/10 flex items-center justify-center hover:bg-white/20", children: "\u00D7" })
                ], key: `filter-${index}-${filter.type}` }))), 
                _jsx("button", { onClick: () => {
                    setTestament('all');
                    setBookFilter('all');
                    setGroupFilter('all');
                    setSearchQuery('');
                    setCurrentLetter('all');
                    setShowOnlyFavorites(false);
                    setCurrentPage(1);
                }, className: "text-sm text-blue-300 hover:text-blue-200 ml-auto", children: "Clear All" })
            ] })), 
            _jsxs("div", { className: "text-center text-white/80 mb-6", children: ["Showing ", paginatedCharacters.length, " of ", filteredCharacters.length, " characters"] }), 
            filteredCharacters.length === 0 && (_jsxs("div", { className: "bg-white/5 backdrop-blur-sm rounded-xl p-8 text-center", children: [
                _jsx("svg", { xmlns: "http://www.w3.org/2000/svg", className: "h-16 w-16 mx-auto text-white/50 mb-4", fill: "none", viewBox: "0 0 24 24", stroke: "currentColor", children: _jsx("path", { strokeLinecap: "round", strokeLinejoin: "round", strokeWidth: 2, d: "M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" }) }), 
                _jsx("p", { className: "text-xl text-white mb-4", children: "No characters found matching your criteria." }), 
                _jsx("button", { onClick: () => {
                    setTestament('all');
                    setBookFilter('all');
                    setGroupFilter('all');
                    setSearchQuery('');
                    setCurrentLetter('all');
                    setShowOnlyFavorites(false);
                    setCurrentPage(1);
                }, className: "text-yellow-400 hover:text-yellow-300 font-medium", children: "Clear all filters" })
            ] })), 
            filteredCharacters.length > 0 && (_jsxs("div", { className: "relative", children: [
                // Mobile alphabet selector placed directly above character cards
                renderMobileAlphaNav(),
                _jsx("div", { className: "bg-white/5 backdrop-blur-sm rounded-xl p-4 shadow-lg", children: viewMode === 'grid' ? (
                    _jsx("div", { style: { height: '600px' }, children: _jsx(VirtuosoGrid, { totalCount: paginatedCharacters.length, overscan: 200, listClassName: "grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6", itemClassName: "character-card-container", itemContent: index => renderCharacterItem(index) }) })
                ) : (
                    _jsx("div", { className: "space-y-4", children: paginatedCharacters.map((character, index) => _jsx("div", { children: renderCharacterItem(index) }, character?.id || `character-${index}`)) })
                ) })
            ] })), 
            renderPagination()
        ] })
    ] }));
};
export default ScalableCharacterSelection;