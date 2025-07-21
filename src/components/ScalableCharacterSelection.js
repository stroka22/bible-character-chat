import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useState, useEffect, useCallback, useMemo } from 'react';
import { VirtuosoGrid } from 'react-virtuoso';
import { characterRepository } from '../repositories/characterRepository';
import { groupRepository } from '../repositories/groupRepository';
// Use the mock chat context so we don’t hit the real Supabase APIs
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
    const itemsPerPage = 20;
    const { selectCharacter, character: selectedCharacter } = useChat();
    const fetchCharacters = useCallback(async () => {
        setIsLoading(true);
        setError(null);
        try {
            const data = await characterRepository.getAll();
            setCharacters(data);
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
    const handleSelectCharacter = useCallback(async (characterId) => {
        try {
            setIsSelecting(true);
            await selectCharacter(characterId);
        }
        catch (err) {
            console.error('Error selecting character:', err);
            setError('Failed to select character. Please try again.');
        }
        finally {
            setIsSelecting(false);
        }
    }, [selectCharacter]);
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
        }
        setCurrentPage(1);
    };
    const filteredCharacters = useMemo(() => {
        let result = [...characters];
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
    }, [characters, searchQuery, testament, bookFilter, groupFilter, currentLetter]);
    const paginatedCharacters = useMemo(() => {
        const startIndex = (currentPage - 1) * itemsPerPage;
        return filteredCharacters.slice(startIndex, startIndex + itemsPerPage);
    }, [filteredCharacters, currentPage, itemsPerPage]);
    const totalPages = Math.ceil(filteredCharacters.length / itemsPerPage);
    const renderCharacterItem = useCallback((index) => {
        const character = paginatedCharacters[index];
        if (viewMode === 'grid') {
            return (_jsx("div", { className: "p-2", children: _jsx(CharacterCard, { character: character, onSelect: handleSelectCharacter, isSelected: selectedCharacter?.id === character.id }) }, character.id));
        }
        else {
            return (_jsxs("div", { className: `
            flex items-center gap-4 bg-white/10 backdrop-blur-sm rounded-xl p-4 border border-white/15
            transition-all duration-300 hover:bg-white/15 cursor-pointer
            ${selectedCharacter?.id === character.id ? 'border-yellow-400 ring-2 ring-yellow-400/30' : ''}
          `, onClick: () => handleSelectCharacter(character.id), children: [_jsx("table", { className: "border-collapse m-0 p-0", children: _jsx("tbody", { children: _jsx("tr", { children: _jsx("td", { className: `
                    w-16 h-16 rounded-full overflow-hidden p-0
                    ${selectedCharacter?.id === character.id ? 'border-2 border-yellow-400' : 'border-2 border-white/30'}
                    bg-blue-50
                  `, children: _jsx("img", { src: character.avatar_url ||
                                            `https://ui-avatars.com/api/?name=${encodeURIComponent(character.name)}&background=random`, alt: character.name, className: "w-16 h-16 object-cover block" }) }) }) }) }), _jsxs("div", { className: "flex-1", children: [_jsx("h3", { className: "text-xl font-bold text-yellow-400", style: { fontFamily: 'Cinzel, serif' }, children: character.name }), _jsx("p", { className: "text-white/80 line-clamp-2", children: character.description }), _jsxs("div", { className: "text-xs text-white/50 mt-1", children: [character.bible_book && `${character.bible_book} • `, testament === 'old' ? 'Old Testament' : testament === 'new' ? 'New Testament' : ''] })] }), _jsx("button", { className: `
              px-4 py-2 rounded-lg text-sm font-medium
              ${selectedCharacter?.id === character.id
                            ? 'bg-yellow-400 text-blue-900'
                            : 'bg-white/10 text-white hover:bg-white/20'}
            `, children: selectedCharacter?.id === character.id ? 'Continue' : 'Chat' })] }, character.id));
        }
    }, [paginatedCharacters, viewMode, handleSelectCharacter, selectedCharacter]);
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
    const renderAlphaNav = () => {
        const letters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ'.split('');
        return (_jsxs("div", { className: "fixed right-4 top-1/2 transform -translate-y-1/2 bg-white/5 backdrop-blur-sm rounded-full py-4 px-2 hidden lg:flex flex-col gap-1 border border-white/10", children: [_jsx("button", { onClick: () => {
                        setCurrentLetter('all');
                        setCurrentPage(1);
                    }, className: `w-8 h-8 rounded-full flex items-center justify-center text-sm ${currentLetter === 'all'
                        ? 'bg-yellow-400 text-blue-900 font-bold'
                        : 'text-white hover:bg-white/10'}`, children: "All" }), letters.map(letter => (_jsx("button", { onClick: () => {
                        setCurrentLetter(letter);
                        setCurrentPage(1);
                    }, className: `w-8 h-8 rounded-full flex items-center justify-center text-sm ${currentLetter === letter
                        ? 'bg-yellow-400 text-blue-900 font-bold'
                        : 'text-white hover:bg-white/10'}`, children: letter }, letter)))] }));
    };
    if (isLoading) {
        return (_jsx("div", { className: "flex h-full w-full items-center justify-center bg-gradient-to-b from-[#0a0a2a] via-[#1a1a4a] to-[#2a2a6a]", children: _jsxs("div", { className: "text-center", children: [_jsxs("div", { className: "relative mb-6", children: [_jsx("div", { className: "absolute inset-0 rounded-full bg-yellow-300 blur-xl opacity-30 animate-pulse" }), _jsx("div", { className: "relative h-16 w-16 mx-auto animate-spin rounded-full border-4 border-yellow-200 border-t-yellow-400" }), _jsx("div", { className: "absolute inset-0 flex items-center justify-center", children: _jsx("span", { className: "text-white text-xl", children: "\u271D" }) })] }), _jsx("p", { className: "text-white text-lg font-light", style: { fontFamily: 'Cinzel, serif' }, children: "Loading Bible characters..." })] }) }));
    }
    if (error) {
        return (_jsx("div", { className: "flex h-full w-full items-center justify-center bg-gradient-to-b from-[#0a0a2a] via-[#1a1a4a] to-[#2a2a6a]", children: _jsxs("div", { className: "max-w-md rounded-lg bg-white bg-opacity-90 p-8 text-center shadow-2xl", children: [_jsx("svg", { xmlns: "http://www.w3.org/2000/svg", className: "h-16 w-16 mx-auto text-red-500 mb-4", fill: "none", viewBox: "0 0 24 24", stroke: "currentColor", children: _jsx("path", { strokeLinecap: "round", strokeLinejoin: "round", strokeWidth: 2, d: "M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" }) }), _jsx("h3", { className: "mb-2 text-xl font-semibold text-red-800", style: { fontFamily: 'Cinzel, serif' }, children: "Error" }), _jsx("p", { className: "text-red-700 mb-4", children: error }), _jsx("button", { onClick: () => window.location.reload(), className: "rounded-md bg-red-600 px-6 py-2 text-white hover:bg-red-700 transition-colors shadow-md", children: "Try Again" })] }) }));
    }
    return (_jsxs("div", { className: "min-h-screen bg-gradient-to-b from-[#0a0a2a] via-[#1a1a4a] to-[#2a2a6a] py-10 px-4 md:px-6", children: [renderAlphaNav(), _jsxs("div", { className: "max-w-7xl mx-auto bg-white/8 backdrop-blur-sm rounded-2xl p-6 border border-white/15 shadow-xl", children: [_jsx("h1", { className: "text-4xl md:text-5xl font-extrabold text-center text-yellow-400 mb-8 tracking-tight drop-shadow-lg", style: { fontFamily: 'Cinzel, serif' }, children: "Choose Your Biblical Guide" }), featuredCharacter && (_jsxs("div", { className: "mb-12 flex flex-col items-center", children: [_jsxs("div", { className: "relative mb-4", children: [_jsx("div", { className: "absolute -inset-4 rounded-full bg-yellow-300 blur-xl opacity-30" }), _jsx("table", { className: "border-collapse m-0 p-0 relative z-0", children: _jsx("tbody", { children: _jsx("tr", { children: _jsx("td", { className: "w-32 h-32 rounded-full overflow-hidden p-0 border-4 border-yellow-300 shadow-xl bg-blue-50", children: _jsx("img", { src: featuredCharacter.avatar_url ||
                                                            `https://ui-avatars.com/api/?name=${encodeURIComponent(featuredCharacter.name)}&background=random`, alt: featuredCharacter.name, className: "w-32 h-32 object-cover block" }) }) }) }) })] }), _jsx("h2", { className: "text-2xl font-bold text-white mb-2", style: { fontFamily: 'Cinzel, serif' }, children: featuredCharacter.name }), _jsx("p", { className: "text-blue-100 max-w-md text-center mb-4", children: featuredCharacter.description }), _jsxs("button", { onClick: () => handleSelectCharacter(featuredCharacter.id), className: "bg-yellow-500 hover:bg-yellow-600 text-blue-900 font-bold py-3 px-8 rounded-full shadow-lg transform transition-all hover:scale-105 active:scale-95", children: ["Chat with ", featuredCharacter.name, " \uD83D\uDE4F"] }), _jsx("p", { className: "mt-6 text-blue-100 text-sm", children: "Or select another character below" })] })), _jsx("div", { className: "mb-8 flex justify-center", children: _jsx("button", { onClick: () => (window.location.href = '/pricing.html'), className: "animate-pulse rounded-full bg-yellow-400 px-6 py-3 text-lg font-extrabold tracking-wide text-blue-900 shadow-lg ring-2 ring-yellow-300 hover:bg-yellow-300 focus:outline-none focus:ring-4 focus:ring-yellow-200", children: "\uD83D\uDD13 Unlock all characters \u00A0\u2013\u00A0 Upgrade to Premium" }) }), _jsx("div", { className: "bg-white/5 backdrop-blur-sm rounded-xl p-4 mb-6", children: _jsxs("div", { className: "flex flex-col md:flex-row gap-4 items-center", children: [_jsx("div", { className: "w-full md:flex-1", children: _jsx("input", { type: "text", placeholder: "Search characters...", value: searchQuery, onChange: (e) => {
                                            setSearchQuery(e.target.value);
                                            setCurrentPage(1);
                                        }, className: "w-full bg-white/10 border border-white/30 rounded-full py-2 px-4 text-white placeholder-blue-100 focus:outline-none focus:ring-2 focus:ring-yellow-400/50" }) }), _jsxs("div", { className: "flex gap-2", children: [_jsx("button", { onClick: () => {
                                                setTestament('all');
                                                setCurrentPage(1);
                                            }, className: `px-4 py-2 rounded-full ${testament === 'all'
                                                ? 'bg-yellow-400 text-blue-900 font-bold'
                                                : 'bg-white/10 text-white hover:bg-white/20'}`, children: "All" }), _jsx("button", { onClick: () => {
                                                setTestament('old');
                                                setCurrentPage(1);
                                            }, className: `px-4 py-2 rounded-full ${testament === 'old'
                                                ? 'bg-yellow-400 text-blue-900 font-bold'
                                                : 'bg-white/10 text-white hover:bg-white/20'}`, children: "Old" }), _jsx("button", { onClick: () => {
                                                setTestament('new');
                                                setCurrentPage(1);
                                            }, className: `px-4 py-2 rounded-full ${testament === 'new'
                                                ? 'bg-yellow-400 text-blue-900 font-bold'
                                                : 'bg-white/10 text-white hover:bg-white/20'}`, children: "New" })] }), _jsx("div", { className: "w-full md:w-auto", children: _jsxs("select", { value: bookFilter, onChange: (e) => {
                                            setBookFilter(e.target.value);
                                            setCurrentPage(1);
                                        }, className: "w-full md:w-auto bg-white/10 border border-white/30 rounded-full py-2 px-4 text-white focus:outline-none focus:ring-2 focus:ring-yellow-400/50", children: [_jsx("option", { value: "all", children: "All Books" }), _jsx("optgroup", { label: "Old Testament", children: BIBLE_BOOKS.oldTestament.map(book => (_jsx("option", { value: book, children: book }, book))) }), _jsx("optgroup", { label: "New Testament", children: BIBLE_BOOKS.newTestament.map(book => (_jsx("option", { value: book, children: book }, book))) })] }) }), _jsx("div", { className: "w-full md:w-auto", children: _jsxs("select", { value: groupFilter, onChange: (e) => {
                                            setGroupFilter(e.target.value);
                                            setCurrentPage(1);
                                        }, className: "w-full md:w-auto bg-white/10 border border-white/30 rounded-full py-2 px-4 text-white focus:outline-none focus:ring-2 focus:ring-yellow-400/50", children: [_jsx("option", { value: "all", children: "All Groups" }), _jsx("option", { value: "Prophets", children: "Prophets" }), _jsx("option", { value: "Apostles", children: "Apostles" }), _jsx("option", { value: "Kings", children: "Kings" }), _jsx("option", { value: "Women", children: "Women of the Bible" }), groups.map(group => (_jsx("option", { value: group.name, children: group.name }, group.id)))] }) }), _jsxs("div", { className: "flex gap-2", children: [_jsx("button", { onClick: () => setViewMode('grid'), className: `w-10 h-10 rounded-lg flex items-center justify-center ${viewMode === 'grid'
                                                ? 'bg-yellow-400 text-blue-900'
                                                : 'bg-white/10 text-white hover:bg-white/20'}`, "aria-label": "Grid view", children: _jsx("svg", { xmlns: "http://www.w3.org/2000/svg", className: "h-5 w-5", viewBox: "0 0 20 20", fill: "currentColor", children: _jsx("path", { d: "M5 3a2 2 0 00-2 2v2a2 2 0 002 2h2a2 2 0 002-2V5a2 2 0 00-2-2H5zM5 11a2 2 0 00-2 2v2a2 2 0 002 2h2a2 2 0 002-2v-2a2 2 0 00-2-2H5zM11 5a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V5zM11 13a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z" }) }) }), _jsx("button", { onClick: () => setViewMode('list'), className: `w-10 h-10 rounded-lg flex items-center justify-center ${viewMode === 'list'
                                                ? 'bg-yellow-400 text-blue-900'
                                                : 'bg-white/10 text-white hover:bg-white/20'}`, "aria-label": "List view", children: _jsx("svg", { xmlns: "http://www.w3.org/2000/svg", className: "h-5 w-5", viewBox: "0 0 20 20", fill: "currentColor", children: _jsx("path", { fillRule: "evenodd", d: "M3 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm0 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm0 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm0 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1z", clipRule: "evenodd" }) }) })] })] }) }), activeFilters.length > 0 && (_jsxs("div", { className: "flex flex-wrap gap-2 mb-6 bg-white/5 p-3 rounded-lg", children: [_jsx("span", { className: "text-white/70 text-sm", children: "Active Filters:" }), activeFilters.map((filter, index) => (_jsxs("div", { className: "flex items-center gap-1 bg-yellow-400/20 text-yellow-300 px-3 py-1 rounded-full border border-yellow-400/50", children: [_jsx("span", { children: filter.value }), _jsx("button", { onClick: () => removeFilter(filter.type), className: "w-5 h-5 rounded-full bg-white/10 flex items-center justify-center hover:bg-white/20", children: "\u00D7" })] }, index))), _jsx("button", { onClick: () => {
                                    setTestament('all');
                                    setBookFilter('all');
                                    setGroupFilter('all');
                                    setSearchQuery('');
                                    setCurrentLetter('all');
                                    setCurrentPage(1);
                                }, className: "text-sm text-blue-300 hover:text-blue-200 ml-auto", children: "Clear All" })] })), _jsxs("div", { className: "text-center text-white/80 mb-6", children: ["Showing ", paginatedCharacters.length, " of ", filteredCharacters.length, " characters"] }), filteredCharacters.length === 0 && (_jsxs("div", { className: "bg-white/5 backdrop-blur-sm rounded-xl p-8 text-center", children: [_jsx("svg", { xmlns: "http://www.w3.org/2000/svg", className: "h-16 w-16 mx-auto text-white/50 mb-4", fill: "none", viewBox: "0 0 24 24", stroke: "currentColor", children: _jsx("path", { strokeLinecap: "round", strokeLinejoin: "round", strokeWidth: 2, d: "M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" }) }), _jsx("p", { className: "text-xl text-white mb-4", children: "No characters found matching your criteria." }), _jsx("button", { onClick: () => {
                                    setTestament('all');
                                    setBookFilter('all');
                                    setGroupFilter('all');
                                    setSearchQuery('');
                                    setCurrentLetter('all');
                                    setCurrentPage(1);
                                }, className: "text-yellow-400 hover:text-yellow-300 font-medium", children: "Clear all filters" })] })), filteredCharacters.length > 0 && (_jsx("div", { className: "relative bg-white/5 backdrop-blur-sm rounded-xl p-4 shadow-lg", children: viewMode === 'grid' ? (_jsx("div", { style: { height: '600px' }, children: _jsx(VirtuosoGrid, { totalCount: paginatedCharacters.length, overscan: 200, listClassName: "grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6", itemClassName: "character-card-container", itemContent: index => renderCharacterItem(index) }) })) : (_jsx("div", { className: "space-y-4", children: paginatedCharacters.map((_, index) => renderCharacterItem(index)) })) })), renderPagination()] }), _jsx("span", { className: "fixed bottom-3 left-3 z-50 rounded-full bg-amber-400/90 px-3 py-1 text-xs font-semibold text-blue-900 shadow-lg select-none", title: "Scalable selector active", children: "Scalable\u00A0UI" })] }));
};
export default ScalableCharacterSelection;
