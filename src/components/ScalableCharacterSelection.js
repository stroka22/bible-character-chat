var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __generator = (this && this.__generator) || function (thisArg, body) {
    var _ = { label: 0, sent: function() { if (t[0] & 1) throw t[1]; return t[1]; }, trys: [], ops: [] }, f, y, t, g = Object.create((typeof Iterator === "function" ? Iterator : Object).prototype);
    return g.next = verb(0), g["throw"] = verb(1), g["return"] = verb(2), typeof Symbol === "function" && (g[Symbol.iterator] = function() { return this; }), g;
    function verb(n) { return function (v) { return step([n, v]); }; }
    function step(op) {
        if (f) throw new TypeError("Generator is already executing.");
        while (g && (g = 0, op[0] && (_ = 0)), _) try {
            if (f = 1, y && (t = op[0] & 2 ? y["return"] : op[0] ? y["throw"] || ((t = y["return"]) && t.call(y), 0) : y.next) && !(t = t.call(y, op[1])).done) return t;
            if (y = 0, t) op = [op[0] & 2, t.value];
            switch (op[0]) {
                case 0: case 1: t = op; break;
                case 4: _.label++; return { value: op[1], done: false };
                case 5: _.label++; y = op[1]; op = [0]; continue;
                case 7: op = _.ops.pop(); _.trys.pop(); continue;
                default:
                    if (!(t = _.trys, t = t.length > 0 && t[t.length - 1]) && (op[0] === 6 || op[0] === 2)) { _ = 0; continue; }
                    if (op[0] === 3 && (!t || (op[1] > t[0] && op[1] < t[3]))) { _.label = op[1]; break; }
                    if (op[0] === 6 && _.label < t[1]) { _.label = t[1]; t = op; break; }
                    if (t && _.label < t[2]) { _.label = t[2]; _.ops.push(op); break; }
                    if (t[2]) _.ops.pop();
                    _.trys.pop(); continue;
            }
            op = body.call(thisArg, _);
        } catch (e) { op = [6, e]; y = 0; } finally { f = t = 0; }
        if (op[0] & 5) throw op[1]; return { value: op[0] ? op[1] : void 0, done: true };
    }
};
import { jsx as _jsx, jsxs as _jsxs, Fragment as _Fragment } from "react/jsx-runtime";
import { useState, useEffect, useCallback, useMemo } from 'react';
import { VirtuosoGrid } from 'react-virtuoso';
import { motion, AnimatePresence } from 'framer-motion';
import { characterRepository } from '../repositories/characterRepository';
import { groupRepository } from '../repositories/groupRepository';
import { useChat } from '../contexts/ChatContext';
import CharacterCard from './CharacterCard';
// Define Bible books for filtering
var BIBLE_BOOKS = {
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
var BOOK_IMAGERY = {
    Genesis: 'https://images.unsplash.com/photo-1501493870936-9c2e41625521?auto=format&fit=crop&q=80&w=400',
    Exodus: 'https://images.unsplash.com/photo-1578645510447-e20b4311e3ce?auto=format&fit=crop&q=80&w=400',
    Psalms: 'https://images.unsplash.com/photo-1519475889208-0968e5438f7d?auto=format&fit=crop&q=80&w=400',
    Isaiah: 'https://images.unsplash.com/photo-1507692049790-de58290a4334?auto=format&fit=crop&q=80&w=400',
    Matthew: 'https://images.unsplash.com/photo-1563841930606-67e2bce48b78?auto=format&fit=crop&q=80&w=400',
    John: 'https://images.unsplash.com/photo-1602526429747-ac387a91d43b?auto=format&fit=crop&q=80&w=400',
    Revelation: 'https://images.unsplash.com/photo-1516450360452-9312f5e86fc7?auto=format&fit=crop&q=80&w=400',
};
// Group imagery mapping
var GROUP_IMAGERY = {
    Prophets: 'https://images.unsplash.com/photo-1470859624578-4bb64151d9c1?auto=format&fit=crop&q=80&w=400',
    Apostles: 'https://images.unsplash.com/photo-1508896694512-1eade558679c?auto=format&fit=crop&q=80&w=400',
    Kings: 'https://images.unsplash.com/photo-1518709268805-4e9042af9f23?auto=format&fit=crop&q=80&w=400',
    Disciples: 'https://images.unsplash.com/photo-1544198365-f5d60b6d8190?auto=format&fit=crop&q=80&w=400',
    Women: 'https://images.unsplash.com/photo-1565505146646-c02f3676d491?auto=format&fit=crop&q=80&w=400',
};
// Flat list of Bible books in canonical order
/*
 * NOTE:
 * The canonical book list isn’t currently used in this component.  Leaving the
 * spread lines outside of a comment block caused the TypeScript parser to throw
 * a “Declaration or statement expected” error.  We wrap the entire declaration
 * in a block-comment so it can be re-enabled later without breaking the build.
 *
 * Example usage if needed:
 * const ALL_BOOKS: string[] = [
 *   ...BIBLE_BOOKS.oldTestament,
 *   ...BIBLE_BOOKS.newTestament,
 * ];
 */
// Helper to detect testament from book name
function getTestament(book) {
    if (BIBLE_BOOKS.oldTestament.includes(book))
        return 'old';
    if (BIBLE_BOOKS.newTestament.includes(book))
        return 'new';
    return 'unknown';
}
// Helper to get book image
function getBookImage(book) {
    return BOOK_IMAGERY[book] ||
        'https://images.unsplash.com/photo-1504052434569-70ad5836ab65?auto=format&fit=crop&q=80&w=400';
}
// Helper to get group image
function getGroupImage(group) {
    return GROUP_IMAGERY[group] ||
        'https://images.unsplash.com/photo-1517021897933-0e0319cfbc28?auto=format&fit=crop&q=80&w=400';
}
// Animation variants for page transitions
var pageVariants = {
    initial: { opacity: 0, y: 20 },
    animate: { opacity: 1, y: 0, transition: { duration: 0.5 } },
    exit: { opacity: 0, y: -20, transition: { duration: 0.3 } }
};
// Card animation variants
var cardVariants = {
    initial: { opacity: 0, scale: 0.9 },
    animate: { opacity: 1, scale: 1, transition: { duration: 0.4 } },
    hover: { scale: 1.05, boxShadow: "0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)" },
    tap: { scale: 0.98 }
};
var ScalableCharacterSelection = function () {
    var _a = useState([]), characters = _a[0], setCharacters = _a[1];
    var _b = useState([]), groups = _b[0], setGroups = _b[1];
    var _c = useState(true), isLoading = _c[0], setIsLoading = _c[1];
    var _d = useState(null), error = _d[0], setError = _d[1];
    var _e = useState(''), searchQuery = _e[0], setSearchQuery = _e[1];
    var _f = useState('all'), activeTestament = _f[0], setActiveTestament = _f[1];
    var _g = useState(null), activeGroup = _g[0], setActiveGroup = _g[1];
    var _h = useState(null), activeBook = _h[0], setActiveBook = _h[1];
    var _j = useState('testaments'), navigationLevel = _j[0], setNavigationLevel = _j[1]; // Start at top level
    var _k = useState(null), featuredCharacter = _k[0], setFeaturedCharacter = _k[1];
    var _l = useChat(), selectCharacter = _l.selectCharacter, selectedCharacter = _l.character;
    // Fetch all characters and groups on mount
    useEffect(function () {
        var fetchData = function () { return __awaiter(void 0, void 0, void 0, function () {
            var fetchedCharacters, jesus, fetchedGroups, err_1;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        setIsLoading(true);
                        setError(null);
                        _a.label = 1;
                    case 1:
                        _a.trys.push([1, 4, 5, 6]);
                        return [4 /*yield*/, characterRepository.getAll()];
                    case 2:
                        fetchedCharacters = _a.sent();
                        setCharacters(fetchedCharacters);
                        jesus = fetchedCharacters.find(function (c) { return c.name.toLowerCase().includes('jesus'); });
                        setFeaturedCharacter(jesus || (fetchedCharacters.length > 0 ? fetchedCharacters[0] : null));
                        return [4 /*yield*/, groupRepository.getAllGroups()];
                    case 3:
                        fetchedGroups = _a.sent();
                        setGroups(fetchedGroups);
                        return [3 /*break*/, 6];
                    case 4:
                        err_1 = _a.sent();
                        console.error('Failed to fetch data:', err_1);
                        setError('Failed to load data. Please try again later.');
                        return [3 /*break*/, 6];
                    case 5:
                        setIsLoading(false);
                        return [7 /*endfinally*/];
                    case 6: return [2 /*return*/];
                }
            });
        }); };
        fetchData();
    }, []);
    // Filtered characters based on current navigation/filters
    var filteredCharacters = useMemo(function () {
        var currentChars = characters;
        // Apply testament filter
        if (activeTestament !== 'all') {
            currentChars = currentChars.filter(function (char) {
                var charBook = char.bible_book || ''; // Assuming bible_book is available
                return getTestament(charBook) === activeTestament;
            });
        }
        // Apply group filter
        if (activeGroup) {
            // This would ideally use character_group_mappings from DB
            // For now, a simple filter based on description containing group name
            currentChars = currentChars.filter(function (char) { var _a; return (_a = char.description) === null || _a === void 0 ? void 0 : _a.toLowerCase().includes(activeGroup.name.toLowerCase()); });
        }
        // Apply book filter
        if (activeBook) {
            currentChars = currentChars.filter(function (char) { var _a; return (_a = char.bible_book) === null || _a === void 0 ? void 0 : _a.toLowerCase().includes(activeBook.toLowerCase()); });
        }
        // Apply search query
        if (searchQuery.trim()) {
            currentChars = currentChars.filter(function (char) {
                return "".concat(char.name, " ").concat(char.description, " ").concat(char.short_biography || '').toLowerCase().includes(searchQuery.toLowerCase());
            });
        }
        return currentChars;
    }, [characters, activeTestament, activeGroup, activeBook, searchQuery]);
    var handleSelectCharacter = useCallback(function (characterId) { return __awaiter(void 0, void 0, void 0, function () {
        var err_2;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    _a.trys.push([0, 2, , 3]);
                    return [4 /*yield*/, selectCharacter(characterId)];
                case 1:
                    _a.sent();
                    // Reset filters/navigation after character selection
                    setActiveTestament('all');
                    setActiveGroup(null);
                    setActiveBook(null);
                    setSearchQuery('');
                    setNavigationLevel('testaments');
                    return [3 /*break*/, 3];
                case 2:
                    err_2 = _a.sent();
                    console.error('Error selecting character:', err_2);
                    setError('Failed to select character. Please try again.');
                    return [3 /*break*/, 3];
                case 3: return [2 /*return*/];
            }
        });
    }); }, [selectCharacter]);
    var renderCharacterCard = useCallback(function (index) {
        var character = filteredCharacters[index];
        return (_jsx("div", { className: "p-2", children: _jsx(CharacterCard, { character: character, onSelect: handleSelectCharacter, isSelected: (selectedCharacter === null || selectedCharacter === void 0 ? void 0 : selectedCharacter.id) === character.id }) }, character.id));
    }, [filteredCharacters, handleSelectCharacter, selectedCharacter]);
    if (isLoading) {
        return (_jsx("div", { className: "flex h-full w-full items-center justify-center bg-gradient-to-b from-blue-900 via-blue-600 to-blue-400", children: _jsxs("div", { className: "text-center", children: [_jsxs("div", { className: "relative mb-6", children: [_jsx("div", { className: "absolute inset-0 rounded-full bg-yellow-300 blur-xl opacity-30 animate-pulse" }), _jsx("div", { className: "relative h-16 w-16 mx-auto animate-spin rounded-full border-4 border-yellow-200 border-t-yellow-400" }), _jsx("div", { className: "absolute inset-0 flex items-center justify-center", children: _jsx("span", { className: "text-white text-xl", children: "\u271D" }) })] }), _jsx("p", { className: "text-white text-lg font-light", style: { fontFamily: 'Cinzel, serif' }, children: "Loading Bible characters..." })] }) }));
    }
    if (error) {
        return (_jsx("div", { className: "flex h-full w-full items-center justify-center bg-gradient-to-b from-blue-900 via-blue-600 to-blue-400", children: _jsxs("div", { className: "max-w-md rounded-lg bg-white bg-opacity-90 p-8 text-center shadow-2xl", children: [_jsx("svg", { xmlns: "http://www.w3.org/2000/svg", className: "h-16 w-16 mx-auto text-red-500 mb-4", fill: "none", viewBox: "0 0 24 24", stroke: "currentColor", children: _jsx("path", { strokeLinecap: "round", strokeLinejoin: "round", strokeWidth: 2, d: "M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" }) }), _jsx("h3", { className: "mb-2 text-xl font-semibold text-red-800", style: { fontFamily: 'Cinzel, serif' }, children: "Error" }), _jsx("p", { className: "text-red-700 mb-4", children: error }), _jsx("button", { onClick: function () { return window.location.reload(); }, className: "rounded-md bg-red-600 px-6 py-2 text-white hover:bg-red-700 transition-colors shadow-md", children: "Try Again" })] }) }));
    }
    var renderContent = function () {
        switch (navigationLevel) {
            case 'testaments':
                return (_jsxs(motion.div, { className: "grid grid-cols-1 md:grid-cols-2 gap-8", initial: "initial", animate: "animate", exit: "exit", variants: pageVariants, children: [_jsxs(motion.div, { className: "relative overflow-hidden rounded-xl shadow-xl cursor-pointer transition-all duration-300 group h-80", variants: cardVariants, whileHover: "hover", whileTap: "tap", onClick: function () {
                                setActiveTestament('old');
                                setNavigationLevel('books');
                            }, children: [_jsxs("div", { className: "absolute inset-0 bg-black", children: [_jsx("img", { src: "https://images.unsplash.com/photo-1518066000714-cdcd82538122?auto=format&fit=crop&w=800&q=80", alt: "Old Testament", className: "w-full h-full object-cover opacity-70 group-hover:scale-105 transition-transform duration-700" }), _jsx("div", { className: "absolute inset-0 bg-gradient-to-t from-black/80 via-black/50 to-transparent" })] }), _jsx("div", { className: "absolute top-0 right-0 w-40 h-40 bg-yellow-300 rounded-full blur-3xl opacity-20 group-hover:opacity-30 transition-opacity" }), _jsxs("div", { className: "absolute inset-0 flex flex-col justify-end p-8 text-white", children: [_jsx("div", { className: "mb-4 text-yellow-300 text-5xl", children: "\uD83D\uDCDC" }), _jsx("h3", { className: "text-3xl font-bold mb-2 text-yellow-300", style: { fontFamily: 'Cinzel, serif' }, children: "Old Testament" }), _jsx("div", { className: "h-1 w-24 bg-yellow-300 rounded-full mb-4 group-hover:w-32 transition-all duration-300" }), _jsx("p", { className: "text-white/90 text-lg mb-6 max-w-xs", children: "Explore characters from Genesis to Malachi, from creation to the prophets." }), _jsxs("div", { className: "inline-flex items-center text-yellow-300 group-hover:translate-x-2 transition-transform", children: [_jsx("span", { className: "mr-2", children: "Explore" }), _jsx("svg", { xmlns: "http://www.w3.org/2000/svg", className: "h-5 w-5", viewBox: "0 0 20 20", fill: "currentColor", children: _jsx("path", { fillRule: "evenodd", d: "M12.293 5.293a1 1 0 011.414 0l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414-1.414L14.586 11H3a1 1 0 110-2h11.586l-2.293-2.293a1 1 0 010-1.414z", clipRule: "evenodd" }) })] })] })] }), _jsxs(motion.div, { className: "relative overflow-hidden rounded-xl shadow-xl cursor-pointer transition-all duration-300 group h-80", variants: cardVariants, whileHover: "hover", whileTap: "tap", onClick: function () {
                                setActiveTestament('new');
                                setNavigationLevel('books');
                            }, children: [_jsxs("div", { className: "absolute inset-0 bg-black", children: [_jsx("img", { src: "https://images.unsplash.com/photo-1528659860103-419421711585?auto=format&fit=crop&w=800&q=80", alt: "New Testament", className: "w-full h-full object-cover opacity-70 group-hover:scale-105 transition-transform duration-700" }), _jsx("div", { className: "absolute inset-0 bg-gradient-to-t from-black/80 via-black/50 to-transparent" })] }), _jsx("div", { className: "absolute top-0 right-0 w-40 h-40 bg-yellow-300 rounded-full blur-3xl opacity-20 group-hover:opacity-30 transition-opacity" }), _jsxs("div", { className: "absolute inset-0 flex flex-col justify-end p-8 text-white", children: [_jsx("div", { className: "mb-4 text-yellow-300 text-5xl", children: "\uD83D\uDD4A\uFE0F" }), _jsx("h3", { className: "text-3xl font-bold mb-2 text-yellow-300", style: { fontFamily: 'Cinzel, serif' }, children: "New Testament" }), _jsx("div", { className: "h-1 w-24 bg-yellow-300 rounded-full mb-4 group-hover:w-32 transition-all duration-300" }), _jsx("p", { className: "text-white/90 text-lg mb-6 max-w-xs", children: "Discover figures from Matthew to Revelation, from Jesus to his apostles." }), _jsxs("div", { className: "inline-flex items-center text-yellow-300 group-hover:translate-x-2 transition-transform", children: [_jsx("span", { className: "mr-2", children: "Explore" }), _jsx("svg", { xmlns: "http://www.w3.org/2000/svg", className: "h-5 w-5", viewBox: "0 0 20 20", fill: "currentColor", children: _jsx("path", { fillRule: "evenodd", d: "M12.293 5.293a1 1 0 011.414 0l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414-1.414L14.586 11H3a1 1 0 110-2h11.586l-2.293-2.293a1 1 0 010-1.414z", clipRule: "evenodd" }) })] })] })] }), _jsxs(motion.div, { className: "relative overflow-hidden rounded-xl shadow-xl cursor-pointer transition-all duration-300 group h-80 md:col-span-2", variants: cardVariants, whileHover: "hover", whileTap: "tap", onClick: function () { return setNavigationLevel('groups'); }, children: [_jsxs("div", { className: "absolute inset-0 bg-black", children: [_jsx("img", { src: "https://images.unsplash.com/photo-1447023029226-ef8f6b52e3ea?auto=format&fit=crop&w=1200&q=80", alt: "Browse by Group", className: "w-full h-full object-cover opacity-70 group-hover:scale-105 transition-transform duration-700" }), _jsx("div", { className: "absolute inset-0 bg-gradient-to-t from-black/80 via-black/50 to-transparent" })] }), _jsx("div", { className: "absolute top-0 right-0 w-40 h-40 bg-yellow-300 rounded-full blur-3xl opacity-20 group-hover:opacity-30 transition-opacity" }), _jsxs("div", { className: "absolute inset-0 flex flex-col justify-end p-8 text-white", children: [_jsx("div", { className: "mb-4 text-yellow-300 text-5xl", children: "\uD83D\uDC65" }), _jsx("h3", { className: "text-3xl font-bold mb-2 text-yellow-300", style: { fontFamily: 'Cinzel, serif' }, children: "Browse by Group" }), _jsx("div", { className: "h-1 w-24 bg-yellow-300 rounded-full mb-4 group-hover:w-32 transition-all duration-300" }), _jsx("p", { className: "text-white/90 text-lg mb-6 max-w-lg", children: "Find characters organized by roles like Prophets, Apostles, Kings, and other biblical groups." }), _jsxs("div", { className: "inline-flex items-center text-yellow-300 group-hover:translate-x-2 transition-transform", children: [_jsx("span", { className: "mr-2", children: "Explore Groups" }), _jsx("svg", { xmlns: "http://www.w3.org/2000/svg", className: "h-5 w-5", viewBox: "0 0 20 20", fill: "currentColor", children: _jsx("path", { fillRule: "evenodd", d: "M12.293 5.293a1 1 0 011.414 0l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414-1.414L14.586 11H3a1 1 0 110-2h11.586l-2.293-2.293a1 1 0 010-1.414z", clipRule: "evenodd" }) })] })] })] })] }));
            case 'groups':
                return (_jsxs(motion.div, { className: "space-y-8", initial: "initial", animate: "animate", exit: "exit", variants: pageVariants, children: [_jsxs("button", { onClick: function () { return setNavigationLevel('testaments'); }, className: "text-blue-100 hover:text-yellow-300 transition-colors flex items-center font-semibold", children: [_jsx("svg", { xmlns: "http://www.w3.org/2000/svg", className: "h-5 w-5 mr-2", fill: "none", viewBox: "0 0 24 24", stroke: "currentColor", children: _jsx("path", { strokeLinecap: "round", strokeLinejoin: "round", strokeWidth: 2, d: "M10 19l-7-7m0 0l7-7m-7 7h18" }) }), "Back to Testaments"] }), _jsxs("div", { className: "relative text-center mb-12", children: [_jsx("div", { className: "absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-64 h-12 bg-yellow-300 blur-xl opacity-30 rounded-full" }), _jsx("h2", { className: "text-4xl font-bold text-yellow-300 relative", style: { fontFamily: 'Cinzel, serif' }, children: "Biblical Character Groups" }), _jsx("p", { className: "text-blue-100 mt-2 max-w-2xl mx-auto", children: "Select a group to discover characters with similar roles and stories" })] }), _jsx("div", { className: "grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6", children: _jsx(AnimatePresence, { children: groups.map(function (group) { return (_jsxs(motion.div, { className: "relative overflow-hidden rounded-xl shadow-xl cursor-pointer transition-all duration-300 group h-64", variants: cardVariants, initial: "initial", animate: "animate", exit: "exit", whileHover: "hover", whileTap: "tap", onClick: function () {
                                        setActiveGroup(group);
                                        setNavigationLevel('characters');
                                    }, children: [_jsxs("div", { className: "absolute inset-0 bg-black", children: [_jsx("img", { src: getGroupImage(group.name), alt: group.name, className: "w-full h-full object-cover opacity-70 group-hover:scale-105 transition-transform duration-700" }), _jsx("div", { className: "absolute inset-0 bg-gradient-to-t from-black/80 via-black/50 to-transparent" })] }), _jsx("div", { className: "absolute top-0 right-0 w-32 h-32 bg-yellow-300 rounded-full blur-3xl opacity-20 group-hover:opacity-30 transition-opacity" }), _jsxs("div", { className: "absolute inset-0 flex flex-col justify-end p-6 text-white", children: [_jsx("h3", { className: "text-2xl font-bold mb-2 text-yellow-300", style: { fontFamily: 'Cinzel, serif' }, children: group.name }), _jsx("div", { className: "h-0.5 w-16 bg-yellow-300 rounded-full mb-3 group-hover:w-24 transition-all duration-300" }), _jsx("p", { className: "text-white/90 text-sm mb-4 line-clamp-2", children: group.description || "Characters from the ".concat(group.name, " group.") }), _jsxs("div", { className: "inline-flex items-center text-yellow-300 text-sm group-hover:translate-x-2 transition-transform", children: [_jsx("span", { className: "mr-2", children: "View Characters" }), _jsx("svg", { xmlns: "http://www.w3.org/2000/svg", className: "h-4 w-4", viewBox: "0 0 20 20", fill: "currentColor", children: _jsx("path", { fillRule: "evenodd", d: "M12.293 5.293a1 1 0 011.414 0l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414-1.414L14.586 11H3a1 1 0 110-2h11.586l-2.293-2.293a1 1 0 010-1.414z", clipRule: "evenodd" }) })] })] })] }, group.id)); }) }) })] }));
            case 'books':
                var booksToDisplay = activeTestament === 'old' ? BIBLE_BOOKS.oldTestament : BIBLE_BOOKS.newTestament;
                return (_jsxs(motion.div, { className: "space-y-8", initial: "initial", animate: "animate", exit: "exit", variants: pageVariants, children: [_jsxs("button", { onClick: function () { return setNavigationLevel('testaments'); }, className: "text-blue-100 hover:text-yellow-300 transition-colors flex items-center font-semibold", children: [_jsx("svg", { xmlns: "http://www.w3.org/2000/svg", className: "h-5 w-5 mr-2", fill: "none", viewBox: "0 0 24 24", stroke: "currentColor", children: _jsx("path", { strokeLinecap: "round", strokeLinejoin: "round", strokeWidth: 2, d: "M10 19l-7-7m0 0l7-7m-7 7h18" }) }), "Back to Testaments"] }), _jsxs("div", { className: "relative text-center mb-12", children: [_jsx("div", { className: "absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-64 h-12 bg-yellow-300 blur-xl opacity-30 rounded-full" }), _jsx("h2", { className: "text-4xl font-bold text-yellow-300 relative", style: { fontFamily: 'Cinzel, serif' }, children: activeTestament === 'old' ? 'Old Testament Books' : 'New Testament Books' }), _jsx("p", { className: "text-blue-100 mt-2 max-w-2xl mx-auto", children: "Select a book to discover its characters" })] }), _jsx("div", { className: "grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4\n                         max-h-[60vh] overflow-y-auto pr-1", children: _jsx(AnimatePresence, { children: booksToDisplay.map(function (book) { return (_jsxs(motion.div, { className: "relative overflow-hidden rounded-xl shadow-xl cursor-pointer transition-all duration-300 group h-48", variants: cardVariants, initial: "initial", animate: "animate", exit: "exit", whileHover: "hover", whileTap: "tap", onClick: function () {
                                        setActiveBook(book);
                                        setNavigationLevel('characters');
                                    }, children: [_jsxs("div", { className: "absolute inset-0 bg-black", children: [_jsx("img", { src: getBookImage(book), alt: book, className: "w-full h-full object-cover opacity-70 group-hover:scale-105 transition-transform duration-700" }), _jsx("div", { className: "absolute inset-0 bg-gradient-to-t from-black/80 via-black/50 to-transparent" })] }), _jsx("div", { className: "absolute top-0 right-0 w-24 h-24 bg-yellow-300 rounded-full blur-3xl opacity-20 group-hover:opacity-30 transition-opacity" }), _jsxs("div", { className: "absolute inset-0 flex flex-col justify-center items-center p-4 text-white", children: [_jsx("div", { className: "text-yellow-300 text-2xl mb-2 opacity-80", children: "\uD83D\uDCDC" }), _jsx("h3", { className: "text-xl font-bold mb-1 text-yellow-300 text-center", style: { fontFamily: 'Cinzel, serif' }, children: book }), _jsx("div", { className: "h-0.5 w-12 bg-yellow-300 rounded-full group-hover:w-16 transition-all duration-300" })] })] }, book)); }) }) })] }));
            case 'characters':
                return (_jsxs(motion.div, { className: "space-y-8", initial: "initial", animate: "animate", exit: "exit", variants: pageVariants, children: [_jsxs("button", { onClick: function () {
                                if (activeGroup) {
                                    setNavigationLevel('groups');
                                    setActiveGroup(null);
                                }
                                else if (activeBook) {
                                    setNavigationLevel('books');
                                    setActiveBook(null);
                                }
                                else {
                                    setNavigationLevel('testaments');
                                }
                            }, className: "text-blue-100 hover:text-yellow-300 transition-colors flex items-center font-semibold", children: [_jsx("svg", { xmlns: "http://www.w3.org/2000/svg", className: "h-5 w-5 mr-2", fill: "none", viewBox: "0 0 24 24", stroke: "currentColor", children: _jsx("path", { strokeLinecap: "round", strokeLinejoin: "round", strokeWidth: 2, d: "M10 19l-7-7m0 0l7-7m-7 7h18" }) }), "Back to ", activeGroup ? 'Groups' : activeBook ? 'Books' : 'Testaments'] }), _jsxs("div", { className: "relative flex justify-between items-center mb-8", children: [_jsxs("div", { children: [_jsx("h2", { className: "text-3xl font-bold text-yellow-300", style: { fontFamily: 'Cinzel, serif' }, children: activeGroup
                                                ? "".concat(activeGroup.name, " Characters")
                                                : activeBook
                                                    ? "Characters from ".concat(activeBook)
                                                    : 'All Characters' }), _jsx("div", { className: "h-0.5 w-24 bg-yellow-300 rounded-full mt-2" })] }), _jsxs("div", { className: "text-white text-sm bg-white/10 backdrop-blur-sm px-3 py-1 rounded-full", children: [filteredCharacters.length, " character", filteredCharacters.length !== 1 ? 's' : '', " found"] })] }), _jsx("div", { className: "mb-6 flex justify-center", children: _jsx("button", { onClick: function () { return (window.location.href = '/pricing.html'); }, className: "animate-pulse rounded-full bg-yellow-400 px-6 py-3 text-lg font-extrabold tracking-wide text-blue-900 shadow-lg ring-2 ring-yellow-300 hover:bg-yellow-300 focus:outline-none focus:ring-4 focus:ring-yellow-200", children: "\uD83D\uDD13 Unlock all 50+ characters with Premium" }) }), _jsxs("div", { className: "relative mb-8 max-w-md mx-auto", children: [_jsx("div", { className: "absolute -inset-1 bg-gradient-to-r from-yellow-300/30 via-blue-400/20 to-yellow-300/30 rounded-full blur-md" }), _jsxs("div", { className: "relative", children: [_jsx("input", { type: "text", placeholder: "Search characters...", value: searchQuery, onChange: function (e) { return setSearchQuery(e.target.value); }, className: "w-full rounded-full border-2 border-white/30 bg-white/20 py-3 pl-12 pr-4 text-white placeholder-blue-100 focus:border-yellow-300 focus:outline-none focus:ring-2 focus:ring-yellow-300/50 backdrop-blur-sm" }), _jsx("svg", { xmlns: "http://www.w3.org/2000/svg", className: "absolute left-4 top-3.5 h-5 w-5 text-yellow-300", fill: "none", viewBox: "0 0 24 24", stroke: "currentColor", children: _jsx("path", { strokeLinecap: "round", strokeLinejoin: "round", strokeWidth: 2, d: "M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" }) })] })] }), _jsxs("div", { className: "relative", children: [_jsx("div", { className: "absolute -inset-4 bg-gradient-to-br from-yellow-50/20 via-white/10 to-yellow-100/20 rounded-3xl backdrop-blur-sm" }), _jsx("div", { className: "absolute -inset-1 bg-gradient-to-r from-yellow-300/20 via-white/5 to-yellow-300/20 rounded-xl" }), _jsx("div", { className: "relative bg-gradient-to-br from-yellow-50/20 via-white/10 to-yellow-100/20 backdrop-blur-sm rounded-xl p-6 shadow-xl", children: filteredCharacters.length === 0 ? (_jsxs("div", { className: "text-center py-16", children: [_jsxs("div", { className: "relative w-20 h-20 mx-auto mb-6", children: [_jsx("div", { className: "absolute inset-0 bg-yellow-300 rounded-full blur-xl opacity-20" }), _jsx("svg", { xmlns: "http://www.w3.org/2000/svg", className: "h-20 w-20 text-yellow-300 opacity-80", fill: "none", viewBox: "0 0 24 24", stroke: "currentColor", children: _jsx("path", { strokeLinecap: "round", strokeLinejoin: "round", strokeWidth: 1.5, d: "M8 16l2.879-2.879m0 0a3 3 0 104.243-4.242 3 3 0 00-4.243 4.242zM21 12a9 9 0 11-18 0 9 9 0 0118 0z" }) })] }), _jsx("p", { className: "text-2xl text-white mb-4", style: { fontFamily: 'Cinzel, serif' }, children: "No characters found" }), _jsx("p", { className: "text-blue-100 mb-6 max-w-md mx-auto", children: "We couldn't find any characters matching your criteria. Try adjusting your search or filters." }), _jsx("button", { onClick: function () { return setSearchQuery(''); }, className: "text-yellow-300 hover:text-yellow-400 font-medium border border-yellow-300/50 hover:border-yellow-300 rounded-full px-6 py-2 transition-colors", children: "Clear search" })] })) : (_jsx("div", { style: { height: '600px' }, children: _jsx(VirtuosoGrid, { totalCount: filteredCharacters.length, overscan: 200, listClassName: "grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6", itemClassName: "character-card-container", itemContent: function (index) { return renderCharacterCard(index); } }) })) })] })] }));
            default:
                return null;
        }
    };
    /* use transparent container so global gradient shows */
    return (_jsxs(_Fragment, { children: [_jsxs("div", { className: "relative pb-12", children: [_jsx("div", { className: "absolute inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-yellow-200 via-transparent to-transparent opacity-30" }), _jsx("div", { className: "absolute top-1/4 left-1/4 w-64 h-24 bg-white rounded-full blur-3xl opacity-20 animate-float" }), _jsx("div", { className: "absolute top-1/3 right-1/4 w-80 h-32 bg-white rounded-full blur-3xl opacity-15 animate-float-delayed" }), _jsx("div", { className: "absolute bottom-1/4 left-1/3 w-72 h-28 bg-white rounded-full blur-3xl opacity-10 animate-float-slow" })] }), _jsxs("div", { className: "relative container mx-auto px-6 pt-8", children: [_jsxs("header", { className: "mb-10 text-center relative", children: [_jsx("div", { className: "absolute inset-0 mx-auto w-64 h-12 bg-yellow-300 blur-xl opacity-30 rounded-full" }), _jsxs("h1", { className: "text-5xl font-extrabold text-white tracking-tight drop-shadow-lg relative", style: { fontFamily: 'Cinzel, serif' }, children: ["Ask", _jsx("span", { className: "text-yellow-300", children: "Jesus" }), "AI"] }), _jsx("p", { className: "mt-2 text-blue-100 text-lg font-light", children: "Choose a biblical voice to guide your journey" })] }), _jsx("div", { className: "mb-8 flex justify-center", children: _jsx("button", { onClick: function () { return (window.location.href = '/pricing.html'); }, className: "animate-pulse rounded-full bg-yellow-400 px-6 py-3 text-lg font-extrabold tracking-wide text-blue-900 shadow-lg ring-2 ring-yellow-300 hover:bg-yellow-300 focus:outline-none focus:ring-4 focus:ring-yellow-200", children: "\uD83D\uDD13 Upgrade to Premium \u00A0\u2013\u00A0 Unlock All 50+ Bible Characters" }) }), navigationLevel === 'testaments' && featuredCharacter && (_jsxs("div", { className: "mb-16 flex flex-col items-center", children: [_jsxs("div", { className: "relative mb-6", children: [_jsx("div", { className: "absolute -inset-4 rounded-full bg-yellow-300 blur-xl opacity-30 animate-pulse" }), _jsx("div", { className: "relative h-32 w-32 rounded-full overflow-hidden border-4 border-yellow-300 shadow-xl", children: _jsx("img", { src: featuredCharacter.avatar_url || "https://ui-avatars.com/api/?name=".concat(encodeURIComponent(featuredCharacter.name), "&background=random"), alt: featuredCharacter.name, className: "h-full w-full object-cover" }) })] }), _jsx("h2", { className: "text-2xl font-bold text-white mb-2", style: { fontFamily: 'Cinzel, serif' }, children: featuredCharacter.name }), _jsx("p", { className: "text-blue-100 max-w-md text-center mb-4", children: featuredCharacter.description }), _jsxs(motion.button, { onClick: function () { return handleSelectCharacter(featuredCharacter.id); }, className: "bg-yellow-500 hover:bg-yellow-600 text-blue-900 font-bold py-3 px-8 rounded-full shadow-lg", whileHover: { scale: 1.05, boxShadow: "0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)" }, whileTap: { scale: 0.98 }, children: ["Chat with ", featuredCharacter.name, " \uD83D\uDE4F"] }), _jsx("p", { className: "mt-6 text-blue-100 text-sm", children: "Or select another character below" })] })), navigationLevel !== 'testaments' && (_jsxs("div", { className: "mb-8 flex items-center text-sm text-blue-100 bg-white/10 backdrop-blur-sm rounded-full px-4 py-2 shadow-md", children: [_jsxs("button", { onClick: function () { return (window.location.href = '/pricing.html'); }, className: "hover:text-yellow-300 transition-colors flex items-center", children: [_jsx("svg", { xmlns: "http://www.w3.org/2000/svg", className: "h-4 w-4 mr-1", fill: "none", viewBox: "0 0 24 24", stroke: "currentColor", children: _jsx("path", { strokeLinecap: "round", strokeLinejoin: "round", strokeWidth: 2, d: "M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" }) }), "Home"] }), _jsxs("button", { onClick: function () { return (window.location.href = '/pricing.html'); }, className: "ml-3 flex items-center rounded-full bg-yellow-400 px-3 py-1 font-semibold text-blue-900 shadow hover:bg-yellow-300 transition-colors", children: [_jsx("svg", { xmlns: "http://www.w3.org/2000/svg", className: "h-4 w-4 mr-1", viewBox: "0 0 24 24", fill: "currentColor", children: _jsx("path", { fillRule: "evenodd", d: "M12 1.5a4.5 4.5 0 00-4.5 4.5v1.05A3.001 3.001 0 006 10.5v9a3 3 0 003 3h6a3 3 0 003-3v-9a3.001 3.001 0 00-1.5-2.625V6A4.5 4.5 0 0012 1.5zM9 6a3 3 0 016 0v1.5H9V6z", clipRule: "evenodd" }) }), "Premium"] }), navigationLevel === 'groups' && (_jsxs(_Fragment, { children: [_jsx("svg", { xmlns: "http://www.w3.org/2000/svg", className: "h-4 w-4 mx-2 text-yellow-300/70", fill: "none", viewBox: "0 0 24 24", stroke: "currentColor", children: _jsx("path", { strokeLinecap: "round", strokeLinejoin: "round", strokeWidth: 2, d: "M9 5l7 7-7 7" }) }), _jsx("span", { className: "text-yellow-300", children: "Character Groups" })] })), navigationLevel === 'books' && (_jsxs(_Fragment, { children: [_jsx("svg", { xmlns: "http://www.w3.org/2000/svg", className: "h-4 w-4 mx-2 text-yellow-300/70", fill: "none", viewBox: "0 0 24 24", stroke: "currentColor", children: _jsx("path", { strokeLinecap: "round", strokeLinejoin: "round", strokeWidth: 2, d: "M9 5l7 7-7 7" }) }), _jsxs("span", { className: "text-yellow-300", children: [activeTestament === 'old' ? 'Old Testament' : 'New Testament', " Books"] })] })), navigationLevel === 'characters' && (_jsxs(_Fragment, { children: [_jsx("svg", { xmlns: "http://www.w3.org/2000/svg", className: "h-4 w-4 mx-2 text-yellow-300/70", fill: "none", viewBox: "0 0 24 24", stroke: "currentColor", children: _jsx("path", { strokeLinecap: "round", strokeLinejoin: "round", strokeWidth: 2, d: "M9 5l7 7-7 7" }) }), activeGroup && (_jsxs(_Fragment, { children: [_jsx("button", { onClick: function () {
                                                    setNavigationLevel('groups');
                                                    setActiveGroup(null);
                                                }, className: "hover:text-yellow-300 transition-colors", children: "Character Groups" }), _jsx("svg", { xmlns: "http://www.w3.org/2000/svg", className: "h-4 w-4 mx-2 text-yellow-300/70", fill: "none", viewBox: "0 0 24 24", stroke: "currentColor", children: _jsx("path", { strokeLinecap: "round", strokeLinejoin: "round", strokeWidth: 2, d: "M9 5l7 7-7 7" }) }), _jsx("span", { className: "text-yellow-300", children: activeGroup.name })] })), activeBook && (_jsxs(_Fragment, { children: [_jsxs("button", { onClick: function () {
                                                    setNavigationLevel('books');
                                                    setActiveBook(null);
                                                }, className: "hover:text-yellow-300 transition-colors", children: [activeTestament === 'old' ? 'Old Testament' : 'New Testament', " Books"] }), _jsx("svg", { xmlns: "http://www.w3.org/2000/svg", className: "h-4 w-4 mx-2 text-yellow-300/70", fill: "none", viewBox: "0 0 24 24", stroke: "currentColor", children: _jsx("path", { strokeLinecap: "round", strokeLinejoin: "round", strokeWidth: 2, d: "M9 5l7 7-7 7" }) }), _jsx("span", { className: "text-yellow-300", children: activeBook })] }))] }))] })), _jsx(AnimatePresence, { mode: "wait", children: renderContent() })] }), _jsx("span", { className: "fixed bottom-3 left-3 z-50 rounded-full bg-amber-400/90 px-3 py-1 text-xs font-semibold text-blue-900 shadow-lg select-none", title: "Scalable selector active", children: "Scalable\u00A0UI" })] }));
};
export default ScalableCharacterSelection;
