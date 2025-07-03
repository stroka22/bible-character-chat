var __assign = (this && this.__assign) || function () {
    __assign = Object.assign || function(t) {
        for (var s, i = 1, n = arguments.length; i < n; i++) {
            s = arguments[i];
            for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p))
                t[p] = s[p];
        }
        return t;
    };
    return __assign.apply(this, arguments);
};
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
import { useState, useEffect, useCallback } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { useChat } from '../contexts/ChatContext';
import { chatRepository } from '../repositories/chatRepository';
import { characterRepository } from '../repositories/characterRepository';
var ConversationsPage = function () {
    // State
    var _a = useState([]), chats = _a[0], setChats = _a[1];
    var _b = useState(true), isLoading = _b[0], setIsLoading = _b[1];
    var _c = useState(null), error = _c[0], setError = _c[1];
    var _d = useState(false), showFavoritesOnly = _d[0], setShowFavoritesOnly = _d[1];
    var _e = useState(null), editingChatId = _e[0], setEditingChatId = _e[1];
    var _f = useState(''), newTitle = _f[0], setNewTitle = _f[1];
    var _g = useState(false), bypassMode = _g[0], setBypassMode = _g[1];
    // Hooks
    var user = useAuth().user;
    var _h = useChat(), selectCharacter = _h.selectCharacter, resumeLocalChat = _h.resumeLocalChat;
    var navigate = useNavigate();
    // Check for bypass mode on component mount
    useEffect(function () {
        var bypass = localStorage.getItem('bypass_auth') === 'true';
        setBypassMode(bypass);
    }, []);
    // Fetch user's chats or load from localStorage in bypass mode
    var fetchChats = useCallback(function () { return __awaiter(void 0, void 0, void 0, function () {
        var savedChatsJson, localChats, enhancedLocalChats, userChats, enhancedChats, error_1;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    _a.trys.push([0, 3, 4, 5]);
                    setIsLoading(true);
                    setError(null);
                    if (bypassMode) {
                        savedChatsJson = localStorage.getItem('savedChats');
                        if (savedChatsJson) {
                            localChats = JSON.parse(savedChatsJson);
                            enhancedLocalChats = localChats.map(function (localChat) { return ({
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
                            }); });
                            setChats(enhancedLocalChats);
                        }
                        else {
                            setChats([]);
                        }
                        setIsLoading(false);
                        return [2 /*return*/];
                    }
                    // Regular database fetch for authenticated users
                    if (!user) {
                        setChats([]);
                        setIsLoading(false);
                        return [2 /*return*/];
                    }
                    return [4 /*yield*/, chatRepository.getUserChats(user.id)];
                case 1:
                    userChats = _a.sent();
                    return [4 /*yield*/, Promise.all(userChats.map(function (chat) { return __awaiter(void 0, void 0, void 0, function () {
                            var character, error_2;
                            return __generator(this, function (_a) {
                                switch (_a.label) {
                                    case 0:
                                        _a.trys.push([0, 2, , 3]);
                                        return [4 /*yield*/, characterRepository.getById(chat.character_id)];
                                    case 1:
                                        character = _a.sent();
                                        return [2 /*return*/, __assign(__assign({}, chat), { character: character })];
                                    case 2:
                                        error_2 = _a.sent();
                                        console.error("Failed to fetch character for chat ".concat(chat.id, ":"), error_2);
                                        return [2 /*return*/, chat];
                                    case 3: return [2 /*return*/];
                                }
                            });
                        }); }))];
                case 2:
                    enhancedChats = _a.sent();
                    setChats(enhancedChats);
                    return [3 /*break*/, 5];
                case 3:
                    error_1 = _a.sent();
                    console.error('Failed to fetch chats:', error_1);
                    setError('Failed to load your conversations. Please try again.');
                    return [3 /*break*/, 5];
                case 4:
                    setIsLoading(false);
                    return [7 /*endfinally*/];
                case 5: return [2 /*return*/];
            }
        });
    }); }, [user, bypassMode]);
    // Load chats on component mount and when user or bypass mode changes
    useEffect(function () {
        fetchChats();
    }, [fetchChats]);
    // Handle resuming a chat
    var handleResumeChat = function (chat) { return __awaiter(void 0, void 0, void 0, function () {
        var ok, error_3;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    _a.trys.push([0, 4, , 5]);
                    if (!bypassMode) return [3 /*break*/, 2];
                    return [4 /*yield*/, resumeLocalChat(chat.id)];
                case 1:
                    ok = _a.sent();
                    if (ok) {
                        navigate('/');
                    }
                    else {
                        setError('Failed to resume this local conversation.');
                    }
                    return [2 /*return*/];
                case 2:
                    if (!chat.character) {
                        throw new Error('Character information is missing');
                    }
                    return [4 /*yield*/, selectCharacter(chat.character_id)];
                case 3:
                    _a.sent();
                    navigate('/');
                    return [3 /*break*/, 5];
                case 4:
                    error_3 = _a.sent();
                    console.error('Failed to resume chat:', error_3);
                    setError('Failed to resume the conversation. Please try again.');
                    return [3 /*break*/, 5];
                case 5: return [2 /*return*/];
            }
        });
    }); };
    // Handle toggling favorite status
    var handleToggleFavorite = function (chatId, currentStatus) { return __awaiter(void 0, void 0, void 0, function () {
        var savedChatsJson, localChats, updatedChats, error_4;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    _a.trys.push([0, 4, , 5]);
                    if (!bypassMode) return [3 /*break*/, 1];
                    savedChatsJson = localStorage.getItem('savedChats');
                    if (savedChatsJson) {
                        localChats = JSON.parse(savedChatsJson);
                        updatedChats = localChats.map(function (chat) {
                            return chat.id === chatId ? __assign(__assign({}, chat), { is_favorite: !currentStatus }) : chat;
                        });
                        localStorage.setItem('savedChats', JSON.stringify(updatedChats));
                    }
                    return [3 /*break*/, 3];
                case 1: 
                // Regular database update for authenticated users
                return [4 /*yield*/, chatRepository.toggleFavorite(chatId, !currentStatus)];
                case 2:
                    // Regular database update for authenticated users
                    _a.sent();
                    _a.label = 3;
                case 3:
                    // Update local state
                    setChats(function (prevChats) {
                        return prevChats.map(function (chat) {
                            return chat.id === chatId ? __assign(__assign({}, chat), { is_favorite: !currentStatus }) : chat;
                        });
                    });
                    return [3 /*break*/, 5];
                case 4:
                    error_4 = _a.sent();
                    console.error('Failed to update favorite status:', error_4);
                    setError('Failed to update favorite status. Please try again.');
                    return [3 /*break*/, 5];
                case 5: return [2 /*return*/];
            }
        });
    }); };
    // Handle deleting a chat
    var handleDeleteChat = function (chatId) { return __awaiter(void 0, void 0, void 0, function () {
        var confirmed, savedChatsJson, localChats, filteredChats_1, error_5;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    confirmed = window.confirm('Are you sure you want to delete this conversation? This action cannot be undone.');
                    if (!confirmed)
                        return [2 /*return*/];
                    _a.label = 1;
                case 1:
                    _a.trys.push([1, 5, , 6]);
                    if (!bypassMode) return [3 /*break*/, 2];
                    savedChatsJson = localStorage.getItem('savedChats');
                    if (savedChatsJson) {
                        localChats = JSON.parse(savedChatsJson);
                        filteredChats_1 = localChats.filter(function (chat) { return chat.id !== chatId; });
                        localStorage.setItem('savedChats', JSON.stringify(filteredChats_1));
                    }
                    return [3 /*break*/, 4];
                case 2: 
                // Regular database deletion for authenticated users
                return [4 /*yield*/, chatRepository.deleteChat(chatId)];
                case 3:
                    // Regular database deletion for authenticated users
                    _a.sent();
                    _a.label = 4;
                case 4:
                    // Update local state
                    setChats(function (prevChats) { return prevChats.filter(function (chat) { return chat.id !== chatId; }); });
                    return [3 /*break*/, 6];
                case 5:
                    error_5 = _a.sent();
                    console.error('Failed to delete chat:', error_5);
                    setError('Failed to delete the conversation. Please try again.');
                    return [3 /*break*/, 6];
                case 6: return [2 /*return*/];
            }
        });
    }); };
    // Handle starting chat title editing
    var handleEditTitle = function (chat) {
        setEditingChatId(chat.id);
        setNewTitle(chat.title);
    };
    // Handle saving the edited title
    var handleSaveTitle = function (chatId) { return __awaiter(void 0, void 0, void 0, function () {
        var savedChatsJson, localChats, updatedChats, error_6;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    if (!newTitle.trim())
                        return [2 /*return*/];
                    _a.label = 1;
                case 1:
                    _a.trys.push([1, 5, , 6]);
                    if (!bypassMode) return [3 /*break*/, 2];
                    savedChatsJson = localStorage.getItem('savedChats');
                    if (savedChatsJson) {
                        localChats = JSON.parse(savedChatsJson);
                        updatedChats = localChats.map(function (chat) {
                            return chat.id === chatId ? __assign(__assign({}, chat), { conversation_title: newTitle.trim() }) : chat;
                        });
                        localStorage.setItem('savedChats', JSON.stringify(updatedChats));
                    }
                    return [3 /*break*/, 4];
                case 2: 
                // Regular database update for authenticated users
                return [4 /*yield*/, chatRepository.updateChat(chatId, { title: newTitle.trim() })];
                case 3:
                    // Regular database update for authenticated users
                    _a.sent();
                    _a.label = 4;
                case 4:
                    // Update local state
                    setChats(function (prevChats) {
                        return prevChats.map(function (chat) {
                            return chat.id === chatId ? __assign(__assign({}, chat), { title: newTitle.trim() }) : chat;
                        });
                    });
                    // Exit edit mode
                    setEditingChatId(null);
                    setNewTitle('');
                    return [3 /*break*/, 6];
                case 5:
                    error_6 = _a.sent();
                    console.error('Failed to update chat title:', error_6);
                    setError('Failed to update the conversation title. Please try again.');
                    return [3 /*break*/, 6];
                case 6: return [2 /*return*/];
            }
        });
    }); };
    // Cancel title editing
    var handleCancelEdit = function () {
        setEditingChatId(null);
        setNewTitle('');
    };
    // Filter chats based on favorites toggle
    var filteredChats = showFavoritesOnly
        ? chats.filter(function (chat) { return chat.is_favorite; })
        : chats;
    // Format date for display
    var formatDate = function (dateString) {
        var date = new Date(dateString);
        return date.toLocaleDateString(undefined, {
            year: 'numeric',
            month: 'short',
            day: 'numeric',
        });
    };
    // If user is not logged in and not in bypass mode, show a message
    if (!user && !bypassMode) {
        return (_jsxs("div", { className: "container mx-auto px-4 py-8", children: [_jsx("h1", { className: "mb-6 text-2xl font-bold text-gray-900", children: "My Conversations" }), _jsxs("div", { className: "rounded-lg bg-yellow-50 p-6 text-center border border-yellow-200", children: [_jsx("svg", { xmlns: "http://www.w3.org/2000/svg", className: "h-12 w-12 mx-auto text-yellow-500 mb-4", fill: "none", viewBox: "0 0 24 24", stroke: "currentColor", children: _jsx("path", { strokeLinecap: "round", strokeLinejoin: "round", strokeWidth: 2, d: "M12 15v2m0 0v3m0-3h3m-3 0h-3m-2-5a4 4 0 11-8 0 4 4 0 018 0zM3 20a6 6 0 0112 0v1H3v-1z" }) }), _jsx("h2", { className: "text-xl font-semibold text-gray-800 mb-2", children: "Sign In to View Your Conversations" }), _jsx("p", { className: "text-gray-600 mb-6", children: "You need to be signed in to view and manage your saved conversations." }), _jsxs("div", { className: "flex justify-center space-x-4", children: [_jsx(Link, { to: "/login", className: "rounded-md bg-primary-600 px-4 py-2 text-white hover:bg-primary-700 transition-colors", children: "Log In" }), _jsx(Link, { to: "/signup", className: "rounded-md bg-gray-200 px-4 py-2 text-gray-800 hover:bg-gray-300 transition-colors", children: "Sign Up" })] })] })] }));
    }
    return (_jsx(_Fragment, { children: _jsxs("div", { className: "container mx-auto px-4 py-8", children: [_jsxs("div", { className: "mb-6 flex flex-col md:flex-row md:items-center md:justify-between", children: [_jsx("h1", { className: "text-2xl font-bold text-gray-900 mb-4 md:mb-0", children: "My Conversations" }), _jsxs("div", { className: "flex items-center space-x-4", children: [_jsxs("label", { className: "flex items-center cursor-pointer", children: [_jsxs("div", { className: "relative", children: [_jsx("input", { type: "checkbox", className: "sr-only", checked: showFavoritesOnly, onChange: function () { return setShowFavoritesOnly(!showFavoritesOnly); } }), _jsx("div", { className: "block w-14 h-8 rounded-full ".concat(showFavoritesOnly ? 'bg-primary-600' : 'bg-gray-300') }), _jsx("div", { className: "absolute left-1 top-1 bg-white w-6 h-6 rounded-full transition-transform transform ".concat(showFavoritesOnly ? 'translate-x-6' : '') })] }), _jsx("span", { className: "ml-3 text-gray-700", children: "Show Favorites Only" })] }), _jsx(Link, { to: "/", className: "rounded-md bg-primary-600 px-4 py-2 text-white hover:bg-primary-700 transition-colors", children: "New Chat" })] })] }), error && (_jsx("div", { className: "mb-6 rounded-lg bg-red-50 p-4 text-red-800 border border-red-200", children: _jsxs("div", { className: "flex", children: [_jsx("svg", { xmlns: "http://www.w3.org/2000/svg", className: "h-5 w-5 text-red-500 mr-2", viewBox: "0 0 20 20", fill: "currentColor", children: _jsx("path", { fillRule: "evenodd", d: "M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z", clipRule: "evenodd" }) }), _jsx("span", { children: error })] }) })), isLoading ? (_jsx("div", { className: "flex justify-center py-12", children: _jsx("div", { className: "animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary-600" }) })) : filteredChats.length === 0 ? (
                // Empty state
                _jsxs("div", { className: "rounded-lg bg-gray-50 p-12 text-center border border-gray-200", children: [_jsx("svg", { xmlns: "http://www.w3.org/2000/svg", className: "h-16 w-16 mx-auto text-gray-400 mb-4", fill: "none", viewBox: "0 0 24 24", stroke: "currentColor", children: _jsx("path", { strokeLinecap: "round", strokeLinejoin: "round", strokeWidth: 2, d: "M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" }) }), _jsx("h2", { className: "text-xl font-semibold text-gray-800 mb-2", children: showFavoritesOnly
                                ? "You don't have any favorite conversations yet"
                                : "You haven't had any conversations yet" }), _jsx("p", { className: "text-gray-600 mb-6", children: showFavoritesOnly
                                ? "Mark conversations as favorites to see them here"
                                : "Start a conversation with a Bible character to see it listed here" }), _jsx(Link, { to: "/", className: "inline-block rounded-md bg-primary-600 px-6 py-3 text-white hover:bg-primary-700 transition-colors", children: "Start a New Conversation" })] })) : (
                // Conversation list
                _jsx("div", { className: "grid gap-4", children: filteredChats.map(function (chat) {
                        var _a;
                        return (_jsx("div", { className: "rounded-lg border border-gray-200 bg-white p-4 shadow-sm hover:shadow-md transition-shadow", children: _jsxs("div", { className: "flex flex-col md:flex-row md:items-center md:justify-between", children: [_jsx("div", { className: "mb-4 md:mb-0", children: editingChatId === chat.id ? (_jsxs("div", { className: "flex items-center space-x-2", children: [_jsx("input", { type: "text", value: newTitle, onChange: function (e) { return setNewTitle(e.target.value); }, className: "rounded-md border border-gray-300 px-3 py-2 focus:border-primary-500 focus:outline-none focus:ring-1 focus:ring-primary-500", placeholder: "Enter conversation title", autoFocus: true }), _jsx("button", { onClick: function () { return handleSaveTitle(chat.id); }, className: "rounded-md bg-primary-600 px-3 py-2 text-white hover:bg-primary-700 transition-colors", children: "Save" }), _jsx("button", { onClick: handleCancelEdit, className: "rounded-md bg-gray-200 px-3 py-2 text-gray-800 hover:bg-gray-300 transition-colors", children: "Cancel" })] })) : (_jsxs(_Fragment, { children: [_jsxs("h2", { className: "text-lg font-semibold text-gray-900 flex items-center", children: [chat.title, _jsx("button", { onClick: function () { return handleEditTitle(chat); }, className: "ml-2 text-gray-400 hover:text-gray-600", "aria-label": "Edit title", children: _jsx("svg", { xmlns: "http://www.w3.org/2000/svg", className: "h-4 w-4", fill: "none", viewBox: "0 0 24 24", stroke: "currentColor", children: _jsx("path", { strokeLinecap: "round", strokeLinejoin: "round", strokeWidth: 2, d: "M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" }) }) })] }), _jsxs("div", { className: "mt-1 flex items-center text-sm text-gray-500", children: [_jsx("span", { className: "font-medium text-gray-700 mr-2", children: ((_a = chat.character) === null || _a === void 0 ? void 0 : _a.name) || 'Unknown Character' }), _jsx("span", { children: "\u2022" }), _jsx("span", { className: "ml-2", children: formatDate(chat.updated_at) })] })] })) }), _jsxs("div", { className: "flex items-center space-x-2", children: [_jsx("button", { onClick: function () { return handleResumeChat(chat); }, className: "rounded-md bg-primary-600 px-3 py-2 text-white hover:bg-primary-700 transition-colors", "aria-label": "Resume conversation", children: _jsxs("div", { className: "flex items-center", children: [_jsx("svg", { xmlns: "http://www.w3.org/2000/svg", className: "h-5 w-5 mr-1", fill: "none", viewBox: "0 0 24 24", stroke: "currentColor", children: _jsx("path", { strokeLinecap: "round", strokeLinejoin: "round", strokeWidth: 2, d: "M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" }) }), "Resume"] }) }), _jsxs("button", { onClick: function () { return handleToggleFavorite(chat.id, chat.is_favorite); }, className: "rounded-md p-2 ".concat(chat.is_favorite
                                                    ? 'bg-yellow-100 text-yellow-600 hover:bg-yellow-200'
                                                    : 'bg-gray-100 text-gray-600 hover:bg-gray-200', " transition-colors"), "aria-label": chat.is_favorite ? 'Remove from favorites' : 'Add to favorites', children: [_jsx("svg", { xmlns: "http://www.w3.org/2000/svg", className: "h-5 w-5", viewBox: "0 0 20 20", fill: "currentColor", children: _jsx("path", { fillRule: "evenodd", d: "M3.172 5.172a4 4 0 015.656 0L10 6.343l1.172-1.171a4 4 0 115.656 5.656L10 17.657l-6.828-6.829a4 4 0 010-5.656z", clipRule: "evenodd" }) }), _jsx("span", { className: "ml-1 text-xs font-medium", children: chat.is_favorite ? 'Unfavorite' : 'Favorite' })] }), _jsxs("button", { onClick: function () { return handleDeleteChat(chat.id); }, className: "rounded-md bg-red-100 p-2 text-red-600 hover:bg-red-200 transition-colors", "aria-label": "Delete conversation", children: [_jsx("svg", { xmlns: "http://www.w3.org/2000/svg", className: "h-5 w-5", viewBox: "0 0 20 20", fill: "currentColor", children: _jsx("path", { fillRule: "evenodd", d: "M9 2a1 1 0 00-.894.553L7.382 4H4a1 1 0 000 2v10a2 2 0 002 2h8a2 2 0 002-2V6a1 1 0 100-2h-3.382l-.724-1.447A1 1 0 0011 2H9zM7 8a1 1 0 012 0v6a1 1 0 11-2 0V8zm5-1a1 1 0 00-1 1v6a1 1 0 102 0V8a1 1 0 00-1-1z", clipRule: "evenodd" }) }), _jsx("span", { className: "ml-1 text-xs font-medium", children: "Delete" })] })] })] }) }, chat.id));
                    }) }))] }) }));
};
export default ConversationsPage;
