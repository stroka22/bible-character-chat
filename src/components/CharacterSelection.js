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
var __spreadArray = (this && this.__spreadArray) || function (to, from, pack) {
    if (pack || arguments.length === 2) for (var i = 0, l = from.length, ar; i < l; i++) {
        if (ar || !(i in from)) {
            if (!ar) ar = Array.prototype.slice.call(from, 0, i);
            ar[i] = from[i];
        }
    }
    return to.concat(ar || Array.prototype.slice.call(from));
};
import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useState, useEffect, useCallback, useMemo } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { characterRepository } from '../repositories/characterRepository';
import { groupRepository } from '../repositories/groupRepository';
import { useChat } from '../contexts/ChatContext';
import CharacterCard from './CharacterCard';
import CharacterGroupCarousel from './CharacterGroupCarousel';
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
/* ------------------------------------------------------------------ */
/* Utility helpers for Book detection / grouping / sorting            */
/* ------------------------------------------------------------------ */
// Flat list of Bible books in canonical order
var BOOK_ORDER = __spreadArray(__spreadArray([], BIBLE_BOOKS.oldTestament, true), BIBLE_BOOKS.newTestament, true);
/**
 * Try to detect which Bible book is referenced in a block of text.
 * Falls back to 'Unknown' when no match is found.
 */
function detectBook(text) {
    if (!text)
        return 'Unknown';
    var lower = text.toLowerCase();
    for (var _i = 0, BOOK_ORDER_1 = BOOK_ORDER; _i < BOOK_ORDER_1.length; _i++) {
        var book = BOOK_ORDER_1[_i];
        if (lower.includes(book.toLowerCase())) {
            return book;
        }
    }
    return 'Unknown';
}
/**
 * Group characters by detected Bible book.
 */
function groupCharactersByBook(chars) {
    return chars.reduce(function (acc, char) {
        var _a;
        var source = (_a = char.bible_book) !== null && _a !== void 0 ? _a : "".concat(char.description || '', " ").concat(char.short_biography || '', " ").concat(char.scriptural_context || '');
        var book = detectBook(source);
        if (!acc[book])
            acc[book] = [];
        acc[book].push(char);
        return acc;
    }, {});
}
/**
 * Sort books in canonical order, with 'Unknown' always last,
 * and alphabetical fallback for any other non-canonical entries.
 */
function sortBooks(a, b) {
    if (a === 'Unknown' && b === 'Unknown')
        return 0;
    if (a === 'Unknown')
        return 1;
    if (b === 'Unknown')
        return -1;
    var idxA = BOOK_ORDER.indexOf(a);
    var idxB = BOOK_ORDER.indexOf(b);
    if (idxA !== -1 && idxB !== -1)
        return idxA - idxB;
    // If one is canonical and the other is not, canonical first
    if (idxA !== -1)
        return -1;
    if (idxB !== -1)
        return 1;
    // Neither canonical – alphabetical
    return a.localeCompare(b);
}
/* ------------------------------------------------------------------ */
/* Timeline era helpers                                               */
/* ------------------------------------------------------------------ */
var ERA_ORDER = [
    'Creation to Exodus',
    'Kingdom Period',
    'Post-Exile',
    'Gospels',
    'Early Church',
    'Unknown',
];
function getEra(book) {
    // Simple mapping based on canonical order
    if ([
        'Genesis',
        'Exodus',
        'Leviticus',
        'Numbers',
        'Deuteronomy',
    ].includes(book))
        return 'Creation to Exodus';
    if ([
        'Joshua',
        'Judges',
        'Ruth',
        '1 Samuel',
        '2 Samuel',
        '1 Kings',
        '2 Kings',
        '1 Chronicles',
        '2 Chronicles',
    ].includes(book))
        return 'Kingdom Period';
    if ([
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
    ].includes(book))
        return 'Post-Exile';
    if (['Matthew', 'Mark', 'Luke', 'John'].includes(book))
        return 'Gospels';
    if ([
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
    ].includes(book))
        return 'Early Church';
    return 'Unknown';
}
var CharacterSelection = function () {
    // State for characters, loading, and errors
    var _a = useState([]), characters = _a[0], setCharacters = _a[1];
    var _b = useState(true), isLoading = _b[0], setIsLoading = _b[1];
    var _c = useState(null), error = _c[0], setError = _c[1];
    var _d = useState(''), searchQuery = _d[0], setSearchQuery = _d[1];
    var _e = useState('grid'), layout = _e[0], setLayout = _e[1];
    var _f = useState('all'), testament = _f[0], setTestament = _f[1];
    var _g = useState('all'), bookFilter = _g[0], setBookFilter = _g[1];
    var _h = useState('newest'), sortMode = _h[0], setSortMode = _h[1];
    var _j = useState(null), selectedGroup = _j[0], setSelectedGroup = _j[1];
    var _k = useState([]), groups = _k[0], setGroups = _k[1];
    var _l = useState(null), featuredCharacter = _l[0], setFeaturedCharacter = _l[1];
    // Get the chat context
    var _m = useChat(), selectCharacter = _m.selectCharacter, selectedCharacter = _m.character;
    // Fetch characters on component mount or when selectedGroup changes
    var fetchCharacters = useCallback(function () { return __awaiter(void 0, void 0, void 0, function () {
        var data, mappings, jesus, err_1;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    setIsLoading(true);
                    setError(null);
                    _a.label = 1;
                case 1:
                    _a.trys.push([1, 6, 7, 8]);
                    data = [];
                    if (!selectedGroup) return [3 /*break*/, 3];
                    return [4 /*yield*/, groupRepository.getCharactersInGroup(selectedGroup)];
                case 2:
                    mappings = _a.sent();
                    data = mappings.map(function (m) { return m.character; });
                    return [3 /*break*/, 5];
                case 3: return [4 /*yield*/, characterRepository.getAll()];
                case 4:
                    // Fetch all characters if no group is selected
                    data = _a.sent();
                    _a.label = 5;
                case 5:
                    setCharacters(data);
                    jesus = data.find(function (c) { return c.name.toLowerCase().includes('jesus'); });
                    setFeaturedCharacter(jesus || (data.length > 0 ? data[0] : null));
                    return [3 /*break*/, 8];
                case 6:
                    err_1 = _a.sent();
                    console.error('Failed to fetch characters:', err_1);
                    setError('Failed to load Bible characters. Please try again later.');
                    return [3 /*break*/, 8];
                case 7:
                    setIsLoading(false);
                    return [7 /*endfinally*/];
                case 8: return [2 /*return*/];
            }
        });
    }); }, [selectedGroup]);
    useEffect(function () {
        fetchCharacters();
    }, [fetchCharacters]);
    /* ------------------------------------------------------------------ */
    /* Fetch groups once for filter chips                                  */
    /* ------------------------------------------------------------------ */
    useEffect(function () {
        (function () { return __awaiter(void 0, void 0, void 0, function () {
            var all, e_1;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        _a.trys.push([0, 2, , 3]);
                        return [4 /*yield*/, groupRepository.getAllGroups()];
                    case 1:
                        all = _a.sent();
                        setGroups(all);
                        return [3 /*break*/, 3];
                    case 2:
                        e_1 = _a.sent();
                        return [3 /*break*/, 3];
                    case 3: return [2 /*return*/];
                }
            });
        }); })();
    }, []);
    // Handle character selection
    var handleSelectCharacter = function (characterId) { return __awaiter(void 0, void 0, void 0, function () {
        var err_2;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    _a.trys.push([0, 2, , 3]);
                    return [4 /*yield*/, selectCharacter(characterId)];
                case 1:
                    _a.sent();
                    setSelectedGroup(null); // Reset selected group when a character is chosen
                    return [3 /*break*/, 3];
                case 2:
                    err_2 = _a.sent();
                    console.error('Error selecting character:', err_2);
                    setError('Failed to select character. Please try again.');
                    return [3 /*break*/, 3];
                case 3: return [2 /*return*/];
            }
        });
    }); };
    // Filter characters based on search query and filters
    var filtered = characters;
    // Search
    if (searchQuery.trim()) {
        filtered = filtered.filter(function (c) {
            return "".concat(c.name, " ").concat(c.description, " ").concat(c.short_biography || '').toLowerCase().includes(searchQuery.toLowerCase());
        });
    }
    // Testament filter (placeholder: assumes character.description or bible_book contains OT/NT keywords)
    if (testament !== 'all') {
        filtered = filtered.filter(function (c) {
            var textToSearch = "".concat(c.description || '', " ").concat(c.bible_book || '', " ").concat(c.scriptural_context || '').toLowerCase();
            return testament === 'old'
                ? /(genesis|exodus|leviticus|numbers|deuteronomy|joshua|judges|ruth|samuel|kings|chronicles|ezra|nehemiah|esther|job|psalms|proverbs|ecclesiastes|song of solomon|isaiah|jeremiah|lamentations|ezekiel|daniel|hosea|joel|amos|obadiah|jonah|micah|nahum|habakkuk|zephaniah|haggai|zechariah|malachi|old testament)/i.test(textToSearch)
                : /(matthew|mark|luke|john|acts|romans|corinthians|galatians|ephesians|philippians|colossians|thessalonians|timothy|titus|philemon|hebrews|james|peter|john|jude|revelation|new testament)/i.test(textToSearch);
        });
    }
    // Book filter (only applies if a specific testament is selected)
    if (bookFilter !== 'all' && testament !== 'all') {
        filtered = filtered.filter(function (c) {
            var textToSearch = "".concat(c.description || '', " ").concat(c.bible_book || '', " ").concat(c.scriptural_context || '').toLowerCase();
            return textToSearch.includes(bookFilter.toLowerCase());
        });
    }
    // Sorting
    filtered = __spreadArray([], filtered, true).sort(function (a, b) {
        if (sortMode === 'newest') {
            // Assuming 'created_at' exists and is a valid date string
            return (new Date(b.created_at).getTime()) - (new Date(a.created_at).getTime());
        }
        // 'popular' is a stub, sorting by name for now
        return a.name.localeCompare(b.name);
    });
    // Group characters by book for "Book View"
    var groupedByBook = groupCharactersByBook(filtered);
    // Group characters by category for circular avatar display
    var charactersByGroup = useMemo(function () {
        var result = {};
        // Initialize with empty arrays for each group
        groups.forEach(function (group) {
            result[group.name] = [];
        });
        // Add characters to their respective groups
        filtered.forEach(function (character) {
            // This is a simplified approach - in a real app, you'd use the actual group mappings
            // For now, we'll just use the first matching group based on description
            var matchingGroup = groups.find(function (group) { var _a; return (_a = character.description) === null || _a === void 0 ? void 0 : _a.toLowerCase().includes(group.name.toLowerCase()); });
            if (matchingGroup) {
                result[matchingGroup.name].push(character);
            }
        });
        return result;
    }, [filtered, groups]);
    // Render loading state with divine light spinner
    if (isLoading) {
        return (_jsx("div", { className: "flex h-full w-full items-center justify-center bg-gradient-to-b from-blue-900 via-blue-600 to-blue-400", children: _jsxs("div", { className: "text-center", children: [_jsxs("div", { className: "relative mb-6", children: [_jsx("div", { className: "absolute inset-0 rounded-full bg-yellow-300 blur-xl opacity-30 animate-pulse" }), _jsx("div", { className: "relative h-16 w-16 mx-auto animate-spin rounded-full border-4 border-yellow-200 border-t-yellow-400" }), _jsx("div", { className: "absolute inset-0 flex items-center justify-center", children: _jsx("span", { className: "text-white text-xl", children: "\u271D" }) })] }), _jsx("p", { className: "text-white text-lg font-light", children: "Loading Bible characters..." })] }) }));
    }
    // Render error state
    if (error) {
        return (_jsx("div", { className: "flex h-full w-full items-center justify-center bg-gradient-to-b from-blue-900 via-blue-600 to-blue-400", children: _jsxs("div", { className: "max-w-md rounded-lg bg-white bg-opacity-90 p-8 text-center shadow-2xl", children: [_jsx("svg", { xmlns: "http://www.w3.org/2000/svg", className: "h-16 w-16 mx-auto text-red-500 mb-4", fill: "none", viewBox: "0 0 24 24", stroke: "currentColor", children: _jsx("path", { strokeLinecap: "round", strokeLinejoin: "round", strokeWidth: 2, d: "M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" }) }), _jsx("h3", { className: "mb-2 text-xl font-semibold text-red-800", children: "Error" }), _jsx("p", { className: "text-red-700 mb-4", children: error }), _jsx("button", { onClick: function () { return window.location.reload(); }, className: "rounded-md bg-red-600 px-6 py-2 text-white hover:bg-red-700 transition-colors shadow-md", children: "Try Again" })] }) }));
    }
    return (_jsxs("div", { className: "min-h-screen bg-gradient-to-b from-blue-900 via-blue-600 to-blue-400 pb-12", children: [_jsxs("div", { className: "absolute inset-0 overflow-hidden pointer-events-none", children: [_jsx("div", { className: "absolute inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-yellow-200 via-transparent to-transparent opacity-30" }), _jsx("div", { className: "absolute top-1/4 left-1/4 w-64 h-24 bg-white rounded-full blur-3xl opacity-20 animate-float" }), _jsx("div", { className: "absolute top-1/3 right-1/4 w-80 h-32 bg-white rounded-full blur-3xl opacity-15 animate-float-delayed" }), _jsx("div", { className: "absolute bottom-1/4 left-1/3 w-72 h-28 bg-white rounded-full blur-3xl opacity-10 animate-float-slow" })] }), _jsxs("div", { className: "relative container mx-auto px-6 pt-8", children: [_jsxs("header", { className: "mb-10 text-center relative", children: [_jsx("div", { className: "absolute inset-0 mx-auto w-64 h-12 bg-yellow-300 blur-xl opacity-30 rounded-full" }), _jsxs("h1", { className: "text-5xl font-extrabold text-white tracking-tight drop-shadow-lg relative", children: ["Ask", _jsx("span", { className: "text-yellow-300", children: "Jesus" }), "AI"] }), _jsx("p", { className: "mt-2 text-blue-100 text-lg font-light", children: "Choose a biblical voice to guide your journey" })] }), featuredCharacter && (_jsxs("div", { className: "mb-12 flex flex-col items-center", children: [_jsxs("div", { className: "relative mb-4", children: [_jsx("div", { className: "absolute -inset-4 rounded-full bg-yellow-300 blur-xl opacity-30" }), _jsx("div", { className: "relative h-32 w-32 rounded-full overflow-hidden border-4 border-yellow-300 shadow-xl", children: _jsx("img", { src: featuredCharacter.avatar_url || "https://ui-avatars.com/api/?name=".concat(encodeURIComponent(featuredCharacter.name), "&background=random"), alt: featuredCharacter.name, className: "h-full w-full object-cover" }) })] }), _jsx("h2", { className: "text-2xl font-bold text-white mb-2", children: featuredCharacter.name }), _jsx("p", { className: "text-blue-100 max-w-md text-center mb-4", children: featuredCharacter.description }), _jsxs("button", { onClick: function () { return handleSelectCharacter(featuredCharacter.id); }, className: "bg-yellow-500 hover:bg-yellow-600 text-blue-900 font-bold py-3 px-8 rounded-full shadow-lg transform transition-all hover:scale-105 active:scale-95", children: ["Chat with ", featuredCharacter.name, " \uD83D\uDE4F"] }), _jsx("p", { className: "mt-6 text-blue-100 text-sm", children: "Or select another character below" })] })), _jsxs("div", { className: "mb-8 overflow-x-auto bg-white bg-opacity-10 backdrop-blur-sm rounded-xl p-4", children: [_jsx("h3", { className: "text-yellow-300 font-semibold text-lg mb-3 text-center", children: "Character Groups" }), _jsxs("div", { className: "flex flex-wrap gap-2 justify-center", children: [_jsx("button", { onClick: function () { return setSelectedGroup(null); }, className: "px-4 py-1.5 rounded-full border-2 text-sm font-medium transition-all ".concat(selectedGroup === null
                                            ? 'border-yellow-400 bg-yellow-400 text-blue-900'
                                            : 'border-white/30 text-white hover:border-white/60'), children: "All" }), groups.map(function (g) { return (_jsx("button", { onClick: function () { return setSelectedGroup(g.id); }, className: "px-4 py-1.5 rounded-full border-2 text-sm font-medium transition-all ".concat(selectedGroup === g.id
                                            ? 'border-yellow-400 bg-yellow-400 text-blue-900'
                                            : 'border-white/30 text-white hover:border-white/60'), children: g.name }, g.id)); })] })] }), _jsxs("div", { className: "mb-12 relative", children: [_jsx("div", { className: "absolute -inset-8 bg-white/5 rounded-3xl backdrop-blur-sm" }), _jsx("div", { className: "absolute -inset-1 bg-gradient-to-r from-yellow-300/20 via-white/5 to-yellow-300/20 rounded-3xl" }), _jsx("div", { className: "relative", children: _jsx(CharacterGroupCarousel, { onSelectGroup: setSelectedGroup }) })] }), _jsx("div", { className: "mb-12", children: Object.entries(charactersByGroup).map(function (_a) {
                            var groupName = _a[0], chars = _a[1];
                            if (chars.length === 0)
                                return null;
                            return (_jsxs("div", { className: "mb-10", children: [_jsx("h3", { className: "text-yellow-300 text-xl font-bold mb-4 text-center", children: groupName }), _jsx("div", { className: "flex flex-wrap justify-center gap-6", children: chars.slice(0, 8).map(function (character) { return (_jsxs("div", { className: "flex flex-col items-center", onClick: function () { return handleSelectCharacter(character.id); }, children: [_jsxs("div", { className: "\n                        relative w-20 h-20 mb-2 rounded-full overflow-hidden cursor-pointer\n                        transform transition-all hover:scale-110\n                        ".concat((selectedCharacter === null || selectedCharacter === void 0 ? void 0 : selectedCharacter.id) === character.id ? 'ring-4 ring-yellow-400' : 'ring-2 ring-white/30', "\n                      "), children: [(selectedCharacter === null || selectedCharacter === void 0 ? void 0 : selectedCharacter.id) === character.id && (_jsx("div", { className: "absolute -inset-1 bg-yellow-300 blur-md opacity-40 rounded-full" })), _jsx("img", { src: character.avatar_url || "https://ui-avatars.com/api/?name=".concat(encodeURIComponent(character.name), "&background=random"), alt: character.name, className: "h-full w-full object-cover" })] }), _jsx("span", { className: "text-white text-sm font-medium text-center", children: character.name })] }, character.id)); }) })] }, groupName));
                        }) }), _jsx("div", { className: "mb-8 bg-white/10 backdrop-blur-md rounded-xl p-6 shadow-xl", children: _jsxs("div", { className: "flex flex-col md:flex-row gap-6 items-center", children: [_jsxs("div", { className: "relative flex-1 w-full max-w-md", children: [_jsx("div", { className: "absolute inset-0 bg-blue-400/20 rounded-full blur-md" }), _jsx("input", { type: "text", placeholder: "Search characters...", value: searchQuery, onChange: function (e) { return setSearchQuery(e.target.value); }, className: "w-full rounded-full border-2 border-white/30 bg-white/20 py-3 pl-12 pr-4 text-white placeholder-blue-100 focus:border-yellow-300 focus:outline-none focus:ring-2 focus:ring-yellow-300/50 backdrop-blur-sm" }), _jsx("svg", { xmlns: "http://www.w3.org/2000/svg", className: "absolute left-4 top-3.5 h-5 w-5 text-blue-100", fill: "none", viewBox: "0 0 24 24", stroke: "currentColor", children: _jsx("path", { strokeLinecap: "round", strokeLinejoin: "round", strokeWidth: 2, d: "M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" }) })] }), _jsx("div", { className: "flex justify-center gap-2", children: ['grid', 'timeline', 'book'].map(function (m) { return (_jsx("button", { "aria-label": m, onClick: function () { return setLayout(m); }, className: "rounded-full px-5 py-2 text-sm font-medium transition-all ".concat(layout === m
                                            ? 'bg-yellow-400 text-blue-900'
                                            : 'bg-white/20 text-white hover:bg-white/30'), children: m.charAt(0).toUpperCase() + m.slice(1) }, m)); }) }), _jsxs("div", { className: "flex gap-2 justify-center", children: [_jsxs("select", { value: testament, onChange: function (e) {
                                                setTestament(e.target.value);
                                                setBookFilter('all');
                                            }, className: "rounded-full border-2 border-white/30 bg-white/20 py-2 px-4 text-sm text-white focus:border-yellow-300 focus:outline-none focus:ring-2 focus:ring-yellow-300/50 backdrop-blur-sm", children: [_jsx("option", { value: "all", children: "All Testaments" }), _jsx("option", { value: "old", children: "Old Testament" }), _jsx("option", { value: "new", children: "New Testament" })] }), _jsxs("select", { value: bookFilter, onChange: function (e) { return setBookFilter(e.target.value); }, className: "rounded-full border-2 border-white/30 bg-white/20 py-2 px-4 text-sm text-white focus:border-yellow-300 focus:outline-none focus:ring-2 focus:ring-yellow-300/50 backdrop-blur-sm", children: [_jsx("option", { value: "all", children: "All Books" }), _jsx("optgroup", { label: "Old Testament", children: BIBLE_BOOKS.oldTestament.map(function (book) { return (_jsx("option", { value: book, children: book }, book)); }) }), _jsx("optgroup", { label: "New Testament", children: BIBLE_BOOKS.newTestament.map(function (book) { return (_jsx("option", { value: book, children: book }, book)); }) })] }), _jsxs("select", { value: sortMode, onChange: function (e) { return setSortMode(e.target.value); }, className: "rounded-full border-2 border-white/30 bg-white/20 py-2 px-4 text-sm text-white focus:border-yellow-300 focus:outline-none focus:ring-2 focus:ring-yellow-300/50 backdrop-blur-sm", children: [_jsx("option", { value: "newest", children: "Newest" }), _jsx("option", { value: "popular", children: "Most Popular" })] })] })] }) }), filtered.length === 0 && (_jsxs("div", { className: "my-12 text-center bg-white/10 backdrop-blur-md rounded-xl p-8 max-w-lg mx-auto", children: [_jsx("svg", { xmlns: "http://www.w3.org/2000/svg", className: "h-12 w-12 mx-auto text-blue-100 mb-4", fill: "none", viewBox: "0 0 24 24", stroke: "currentColor", children: _jsx("path", { strokeLinecap: "round", strokeLinejoin: "round", strokeWidth: 2, d: "M8 16l2.879-2.879m0 0a3 3 0 104.243-4.242 3 3 0 00-4.243 4.242zM21 12a9 9 0 11-18 0 9 9 0 0118 0z" }) }), _jsxs("p", { className: "text-xl text-white mb-4", children: ["No characters found matching \"", searchQuery, "\""] }), _jsx("button", { onClick: function () { return setSearchQuery(''); }, className: "text-yellow-300 hover:text-yellow-400 font-medium", children: "Clear search" })] })), _jsx("div", { className: "bg-white/10 backdrop-blur-md rounded-xl p-6 shadow-xl", children: _jsxs(AnimatePresence, { mode: "popLayout", children: [layout === 'grid' && (_jsx(motion.div, { layout: true, initial: { opacity: 0 }, animate: { opacity: 1 }, exit: { opacity: 0 }, className: "grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6", children: filtered.map(function (character) { return (_jsx(CharacterCard, { character: character, onSelect: handleSelectCharacter, isSelected: (selectedCharacter === null || selectedCharacter === void 0 ? void 0 : selectedCharacter.id) === character.id }, character.id)); }) }, "grid")), layout === 'timeline' && (_jsxs(motion.div, { layout: true, initial: { opacity: 0 }, animate: { opacity: 1 }, exit: { opacity: 0 }, className: "relative ml-2 sm:ml-4", children: [_jsx("div", { className: "absolute left-0 top-0 h-full w-1 bg-gradient-to-b from-yellow-300/80 via-blue-300/50 to-yellow-300/80 rounded-full blur-sm" }), _jsx("div", { className: "absolute left-0 top-0 h-full w-0.5 bg-white/70" }), ERA_ORDER.map(function (era) {
                                            // Gather chars for this era
                                            var charsInEra = filtered.filter(function (c) { var _a, _b; return getEra(detectBook("".concat((_a = c.bible_book) !== null && _a !== void 0 ? _a : '', " ").concat((_b = c.description) !== null && _b !== void 0 ? _b : ''))) === era; });
                                            if (charsInEra.length === 0)
                                                return null;
                                            return (_jsxs("div", { className: "mb-12 last:mb-0 pl-8", children: [_jsxs("div", { className: "mb-6 flex items-center gap-3", children: [_jsxs("span", { className: "relative flex h-5 w-5 -ml-10", children: [_jsx("span", { className: "absolute inline-flex h-full w-full animate-ping rounded-full bg-yellow-300 opacity-75" }), _jsx("span", { className: "relative inline-flex h-5 w-5 rounded-full bg-yellow-400 border-2 border-white" })] }), _jsx("h4", { className: "text-xl font-bold text-yellow-300", children: era })] }), _jsx("div", { className: "space-y-6", children: charsInEra.map(function (character) { return (_jsx(CharacterCard, { character: character, onSelect: handleSelectCharacter, isSelected: (selectedCharacter === null || selectedCharacter === void 0 ? void 0 : selectedCharacter.id) === character.id }, character.id)); }) })] }, era));
                                        })] }, "timeline")), layout === 'book' && (_jsx(motion.div, { layout: true, initial: { opacity: 0 }, animate: { opacity: 1 }, exit: { opacity: 0 }, className: "space-y-12", children: Object.keys(groupedByBook).sort(sortBooks).map(function (book) { return (_jsxs("div", { children: [_jsx("h3", { className: "mb-6 text-2xl font-bold text-yellow-300 text-center", children: book }), _jsx("div", { className: "grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6", children: groupedByBook[book].map(function (character) { return (_jsx(CharacterCard, { character: character, onSelect: handleSelectCharacter, isSelected: (selectedCharacter === null || selectedCharacter === void 0 ? void 0 : selectedCharacter.id) === character.id }, character.id)); }) })] }, book)); }) }, "book"))] }) })] })] }));
};
export default CharacterSelection;
