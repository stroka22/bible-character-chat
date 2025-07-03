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
import { useState, useEffect } from 'react';
import { useChat } from '../../contexts/ChatContext';
import { useAuth } from '../../contexts/AuthContext';
/**
 * Component that provides actions for the current chat:
 * - Save chat
 * - Rename chat
 * - Favorite chat
 * - Delete chat
 * - Export chat (copy to clipboard)
 */
var ChatActions = function (_a) {
    var _b = _a.className, className = _b === void 0 ? '' : _b, _c = _a.compact, compact = _c === void 0 ? false : _c;
    // Get chat context and auth state
    var _d = useChat(), character = _d.character, chatId = _d.chatId, messages = _d.messages, saveChatTitle = _d.saveChatTitle, toggleFavorite = _d.toggleFavorite, saveChat = _d.saveChat, deleteCurrentChat = _d.deleteCurrentChat, isChatSaved = _d.isChatSaved, isFavorite = _d.isFavorite;
    var user = useAuth().user;
    // Check for bypass mode
    var _e = useState(false), bypassMode = _e[0], setBypassMode = _e[1];
    useEffect(function () {
        var bypass = localStorage.getItem('bypass_auth') === 'true';
        setBypassMode(bypass);
    }, []);
    // Local state
    var _f = useState(false), isRenaming = _f[0], setIsRenaming = _f[1];
    var _g = useState(''), newTitle = _g[0], setNewTitle = _g[1];
    var _h = useState(false), isLoading = _h[0], setIsLoading = _h[1];
    var _j = useState(null), error = _j[0], setError = _j[1];
    var _k = useState(false), showSaveSuccess = _k[0], setShowSaveSuccess = _k[1];
    var _l = useState(false), showCopySuccess = _l[0], setShowCopySuccess = _l[1];
    var _m = useState(isFavorite), localFavorite = _m[0], setLocalFavorite = _m[1];
    // Update local favorite state when isFavorite changes
    useEffect(function () {
        setLocalFavorite(isFavorite);
    }, [isFavorite]);
    // Don't render anything if there's no character or no messages
    if (!character || messages.length === 0) {
        return null;
    }
    // Format conversation as text for export
    var formatConversationAsText = function () {
        if (!character || messages.length === 0)
            return '';
        var title = "Conversation with ".concat(character.name, "\n");
        var date = "Date: ".concat(new Date().toLocaleDateString(), "\n\n");
        var formattedMessages = messages.map(function (message) {
            var timestamp = new Date(message.created_at).toLocaleTimeString();
            var speaker = message.role === 'user' ? 'You' : character.name;
            return "[".concat(timestamp, "] ").concat(speaker, ":\n").concat(message.content, "\n");
        }).join('\n');
        return "".concat(title).concat(date).concat(formattedMessages);
    };
    // Handle copying conversation to clipboard
    var handleExportConversation = function () { return __awaiter(void 0, void 0, void 0, function () {
        var text, error_1;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    _a.trys.push([0, 2, 3, 4]);
                    setIsLoading(true);
                    setError(null);
                    text = formatConversationAsText();
                    return [4 /*yield*/, navigator.clipboard.writeText(text)];
                case 1:
                    _a.sent();
                    // Show success message
                    setShowCopySuccess(true);
                    setTimeout(function () { return setShowCopySuccess(false); }, 3000);
                    return [3 /*break*/, 4];
                case 2:
                    error_1 = _a.sent();
                    console.error('Error copying to clipboard:', error_1);
                    setError('Failed to copy conversation. Please try again.');
                    return [3 /*break*/, 4];
                case 3:
                    setIsLoading(false);
                    return [7 /*endfinally*/];
                case 4: return [2 /*return*/];
            }
        });
    }); };
    // Handle saving a chat
    var handleSaveChat = function () { return __awaiter(void 0, void 0, void 0, function () {
        var defaultTitle, error_2;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    if (!character)
                        return [2 /*return*/];
                    _a.label = 1;
                case 1:
                    _a.trys.push([1, 3, 4, 5]);
                    setIsLoading(true);
                    setError(null);
                    defaultTitle = "Chat with ".concat(character.name, " - ").concat(new Date().toLocaleDateString());
                    // Save the chat
                    return [4 /*yield*/, saveChat(defaultTitle)];
                case 2:
                    // Save the chat
                    _a.sent();
                    // Show success message
                    setShowSaveSuccess(true);
                    setTimeout(function () { return setShowSaveSuccess(false); }, 3000);
                    return [3 /*break*/, 5];
                case 3:
                    error_2 = _a.sent();
                    console.error('Error saving chat:', error_2);
                    setError('Failed to save chat. Please try again.');
                    return [3 /*break*/, 5];
                case 4:
                    setIsLoading(false);
                    return [7 /*endfinally*/];
                case 5: return [2 /*return*/];
            }
        });
    }); };
    // Handle renaming a chat
    var handleRenameChat = function () { return __awaiter(void 0, void 0, void 0, function () {
        var error_3;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    if (!chatId || !newTitle.trim())
                        return [2 /*return*/];
                    _a.label = 1;
                case 1:
                    _a.trys.push([1, 3, 4, 5]);
                    setIsLoading(true);
                    setError(null);
                    return [4 /*yield*/, saveChatTitle(newTitle.trim())];
                case 2:
                    _a.sent();
                    setIsRenaming(false);
                    setNewTitle('');
                    return [3 /*break*/, 5];
                case 3:
                    error_3 = _a.sent();
                    console.error('Error renaming chat:', error_3);
                    setError('Failed to rename chat. Please try again.');
                    return [3 /*break*/, 5];
                case 4:
                    setIsLoading(false);
                    return [7 /*endfinally*/];
                case 5: return [2 /*return*/];
            }
        });
    }); };
    // Handle toggling favorite status with local state update
    var handleToggleFavorite = function () { return __awaiter(void 0, void 0, void 0, function () {
        var newFavoriteState, chatKey, error_4;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    _a.trys.push([0, 4, 5, 6]);
                    setIsLoading(true);
                    setError(null);
                    newFavoriteState = !localFavorite;
                    setLocalFavorite(newFavoriteState);
                    if (!(bypassMode && !chatId)) return [3 /*break*/, 1];
                    chatKey = "temp_favorite_".concat(character.id);
                    localStorage.setItem(chatKey, newFavoriteState ? 'true' : 'false');
                    return [3 /*break*/, 3];
                case 1:
                    if (!chatId) return [3 /*break*/, 3];
                    // Otherwise update via context (which will handle DB or localStorage)
                    return [4 /*yield*/, toggleFavorite(newFavoriteState)];
                case 2:
                    // Otherwise update via context (which will handle DB or localStorage)
                    _a.sent();
                    _a.label = 3;
                case 3: return [3 /*break*/, 6];
                case 4:
                    error_4 = _a.sent();
                    console.error('Error toggling favorite status:', error_4);
                    setError('Failed to update favorite status. Please try again.');
                    // Revert local state on error
                    setLocalFavorite(!localFavorite);
                    return [3 /*break*/, 6];
                case 5:
                    setIsLoading(false);
                    return [7 /*endfinally*/];
                case 6: return [2 /*return*/];
            }
        });
    }); };
    // Handle deleting the current chat
    var handleDeleteChat = function () { return __awaiter(void 0, void 0, void 0, function () {
        var confirmed, error_5;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    if (!chatId)
                        return [2 /*return*/];
                    confirmed = window.confirm('Are you sure you want to delete this conversation? This action cannot be undone.');
                    if (!confirmed)
                        return [2 /*return*/];
                    _a.label = 1;
                case 1:
                    _a.trys.push([1, 3, 4, 5]);
                    setIsLoading(true);
                    setError(null);
                    return [4 /*yield*/, deleteCurrentChat()];
                case 2:
                    _a.sent();
                    return [3 /*break*/, 5];
                case 3:
                    error_5 = _a.sent();
                    console.error('Error deleting chat:', error_5);
                    setError('Failed to delete chat. Please try again.');
                    return [3 /*break*/, 5];
                case 4:
                    setIsLoading(false);
                    return [7 /*endfinally*/];
                case 5: return [2 /*return*/];
            }
        });
    }); };
    // Render a compact version of the actions (for mobile or inline use)
    if (compact) {
        return (_jsxs("div", { className: "flex items-center space-x-2 ".concat(className), children: [_jsx("button", { onClick: handleExportConversation, disabled: isLoading, className: "rounded-full p-2 bg-gray-100 text-gray-600 hover:bg-gray-200 transition-colors", "aria-label": "Copy conversation to clipboard", title: "Copy conversation to clipboard", children: _jsxs("svg", { xmlns: "http://www.w3.org/2000/svg", className: "h-4 w-4", viewBox: "0 0 20 20", fill: "currentColor", children: [_jsx("path", { d: "M8 3a1 1 0 011-1h2a1 1 0 110 2H9a1 1 0 01-1-1z" }), _jsx("path", { d: "M6 3a2 2 0 00-2 2v11a2 2 0 002 2h8a2 2 0 002-2V5a2 2 0 00-2-2 3 3 0 01-3 3H9a3 3 0 01-3-3z" })] }) }), _jsx("button", { onClick: handleToggleFavorite, disabled: isLoading, className: "rounded-full p-2 ".concat(localFavorite ? 'bg-yellow-100 text-yellow-600' : 'bg-gray-100 text-gray-600', " hover:bg-gray-200 transition-colors"), "aria-label": localFavorite ? 'Remove from favorites' : 'Add to favorites', title: localFavorite ? 'Remove from favorites' : 'Add to favorites', children: _jsx("svg", { xmlns: "http://www.w3.org/2000/svg", className: "h-4 w-4", viewBox: "0 0 20 20", fill: "currentColor", children: _jsx("path", { fillRule: "evenodd", d: "M3.172 5.172a4 4 0 015.656 0L10 6.343l1.172-1.171a4 4 0 115.656 5.656L10 17.657l-6.828-6.829a4 4 0 010-5.656z", clipRule: "evenodd" }) }) }), !isChatSaved && (_jsx("button", { onClick: handleSaveChat, disabled: isLoading, className: "rounded-full p-2 bg-gray-100 text-gray-600 hover:bg-gray-200 transition-colors", "aria-label": "Save conversation", title: "Save conversation", children: _jsx("svg", { xmlns: "http://www.w3.org/2000/svg", className: "h-4 w-4", viewBox: "0 0 20 20", fill: "currentColor", children: _jsx("path", { d: "M7.707 10.293a1 1 0 10-1.414 1.414l3 3a1 1 0 001.414 0l3-3a1 1 0 00-1.414-1.414L11 11.586V6h5a2 2 0 012 2v7a2 2 0 01-2 2H4a2 2 0 01-2-2V8a2 2 0 012-2h5v5.586l-1.293-1.293zM9 4a1 1 0 012 0v2H9V4z" }) }) })), isChatSaved && (_jsxs(_Fragment, { children: [_jsx("button", { onClick: function () { return setIsRenaming(true); }, disabled: isLoading, className: "rounded-full p-2 bg-gray-100 text-gray-600 hover:bg-gray-200 transition-colors", "aria-label": "Rename conversation", title: "Rename conversation", children: _jsx("svg", { xmlns: "http://www.w3.org/2000/svg", className: "h-4 w-4", viewBox: "0 0 20 20", fill: "currentColor", children: _jsx("path", { d: "M13.586 3.586a2 2 0 112.828 2.828l-.793.793-2.828-2.828.793-.793zM11.379 5.793L3 14.172V17h2.828l8.38-8.379-2.83-2.828z" }) }) }), _jsx("button", { onClick: handleDeleteChat, disabled: isLoading, className: "rounded-full p-2 bg-red-100 text-red-600 hover:bg-red-200 transition-colors", "aria-label": "Delete conversation", title: "Delete conversation", children: _jsx("svg", { xmlns: "http://www.w3.org/2000/svg", className: "h-4 w-4", viewBox: "0 0 20 20", fill: "currentColor", children: _jsx("path", { fillRule: "evenodd", d: "M9 2a1 1 0 00-.894.553L7.382 4H4a1 1 0 000 2v10a2 2 0 002 2h8a2 2 0 002-2V6a1 1 0 100-2h-3.382l-.724-1.447A1 1 0 0011 2H9zM7 8a1 1 0 012 0v6a1 1 0 11-2 0V8zm5-1a1 1 0 00-1 1v6a1 1 0 102 0V8a1 1 0 00-1-1z", clipRule: "evenodd" }) }) })] }))] }));
    }
    // Render the full version of the actions
    return (_jsxs("div", { className: "border-t border-gray-200 bg-white p-4 ".concat(className), children: [error && (_jsx("div", { className: "mb-4 rounded-md bg-red-50 p-3 text-sm text-red-800", children: _jsxs("div", { className: "flex", children: [_jsx("svg", { xmlns: "http://www.w3.org/2000/svg", className: "h-5 w-5 text-red-500 mr-2", viewBox: "0 0 20 20", fill: "currentColor", children: _jsx("path", { fillRule: "evenodd", d: "M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z", clipRule: "evenodd" }) }), _jsx("span", { children: error })] }) })), showSaveSuccess && (_jsx("div", { className: "mb-4 rounded-md bg-green-50 p-3 text-sm text-green-800", children: _jsxs("div", { className: "flex", children: [_jsx("svg", { xmlns: "http://www.w3.org/2000/svg", className: "h-5 w-5 text-green-500 mr-2", viewBox: "0 0 20 20", fill: "currentColor", children: _jsx("path", { fillRule: "evenodd", d: "M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z", clipRule: "evenodd" }) }), _jsx("span", { children: "Conversation saved successfully!" })] }) })), showCopySuccess && (_jsx("div", { className: "mb-4 rounded-md bg-green-50 p-3 text-sm text-green-800", children: _jsxs("div", { className: "flex", children: [_jsx("svg", { xmlns: "http://www.w3.org/2000/svg", className: "h-5 w-5 text-green-500 mr-2", viewBox: "0 0 20 20", fill: "currentColor", children: _jsx("path", { fillRule: "evenodd", d: "M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z", clipRule: "evenodd" }) }), _jsx("span", { children: "Conversation copied to clipboard!" })] }) })), isRenaming && (_jsx("div", { className: "mb-4", children: _jsxs("div", { className: "flex items-center space-x-2", children: [_jsx("input", { type: "text", value: newTitle, onChange: function (e) { return setNewTitle(e.target.value); }, placeholder: "Enter conversation title", className: "flex-grow rounded-md border border-gray-300 px-3 py-2 focus:border-primary-500 focus:outline-none focus:ring-1 focus:ring-primary-500", autoFocus: true }), _jsx("button", { onClick: handleRenameChat, disabled: isLoading || !newTitle.trim(), className: "rounded-md bg-primary-600 px-4 py-2 text-white hover:bg-primary-700 transition-colors disabled:bg-gray-300", children: "Save" }), _jsx("button", { onClick: function () { return setIsRenaming(false); }, className: "rounded-md bg-gray-200 px-4 py-2 text-gray-800 hover:bg-gray-300 transition-colors", children: "Cancel" })] }) })), _jsxs("div", { className: "flex flex-wrap items-center gap-2", children: [!user && !bypassMode && !isChatSaved && (_jsx("div", { className: "w-full mb-2 rounded-md bg-yellow-50 p-3 text-sm text-yellow-800", children: _jsxs("div", { className: "flex", children: [_jsx("svg", { xmlns: "http://www.w3.org/2000/svg", className: "h-5 w-5 text-yellow-500 mr-2", viewBox: "0 0 20 20", fill: "currentColor", children: _jsx("path", { fillRule: "evenodd", d: "M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z", clipRule: "evenodd" }) }), _jsx("span", { children: "Sign in to save your conversations and access them later." })] }) })), _jsxs("button", { onClick: handleExportConversation, disabled: isLoading, className: "flex items-center rounded-md bg-blue-100 px-4 py-2 text-blue-800 hover:bg-blue-200 transition-colors disabled:bg-gray-100", "aria-label": "Copy conversation to clipboard", children: [_jsxs("svg", { xmlns: "http://www.w3.org/2000/svg", className: "h-5 w-5 mr-2 text-blue-600", viewBox: "0 0 20 20", fill: "currentColor", children: [_jsx("path", { d: "M8 3a1 1 0 011-1h2a1 1 0 110 2H9a1 1 0 01-1-1z" }), _jsx("path", { d: "M6 3a2 2 0 00-2 2v11a2 2 0 002 2h8a2 2 0 002-2V5a2 2 0 00-2-2 3 3 0 01-3 3H9a3 3 0 01-3-3z" })] }), "Copy to Clipboard"] }), _jsxs("button", { onClick: handleToggleFavorite, disabled: isLoading, className: "flex items-center rounded-md px-4 py-2 transition-colors disabled:bg-gray-100 ".concat(localFavorite
                            ? 'bg-yellow-100 text-yellow-800 hover:bg-yellow-200'
                            : 'bg-gray-200 text-gray-800 hover:bg-gray-300'), "aria-label": localFavorite ? 'Remove from favorites' : 'Add to favorites', children: [_jsx("svg", { xmlns: "http://www.w3.org/2000/svg", className: "h-5 w-5 mr-2 ".concat(localFavorite ? 'text-yellow-600' : 'text-gray-600'), viewBox: "0 0 20 20", fill: "currentColor", children: _jsx("path", { fillRule: "evenodd", d: "M3.172 5.172a4 4 0 015.656 0L10 6.343l1.172-1.171a4 4 0 115.656 5.656L10 17.657l-6.828-6.829a4 4 0 010-5.656z", clipRule: "evenodd" }) }), localFavorite ? 'Remove from Favorites' : 'Add to Favorites'] }), !isChatSaved ? (_jsxs("button", { onClick: handleSaveChat, disabled: isLoading, className: "flex items-center rounded-md bg-primary-600 px-4 py-2 text-white hover:bg-primary-700 transition-colors disabled:bg-gray-300", "aria-label": "Save conversation", children: [_jsx("svg", { xmlns: "http://www.w3.org/2000/svg", className: "h-5 w-5 mr-2", viewBox: "0 0 20 20", fill: "currentColor", children: _jsx("path", { d: "M7.707 10.293a1 1 0 10-1.414 1.414l3 3a1 1 0 001.414 0l3-3a1 1 0 00-1.414-1.414L11 11.586V6h5a2 2 0 012 2v7a2 2 0 01-2 2H4a2 2 0 01-2-2V8a2 2 0 012-2h5v5.586l-1.293-1.293zM9 4a1 1 0 012 0v2H9V4z" }) }), "Save Conversation"] })) : (_jsxs(_Fragment, { children: [!isRenaming && (_jsxs("button", { onClick: function () { return setIsRenaming(true); }, disabled: isLoading, className: "flex items-center rounded-md bg-gray-200 px-4 py-2 text-gray-800 hover:bg-gray-300 transition-colors disabled:bg-gray-100", "aria-label": "Rename conversation", children: [_jsx("svg", { xmlns: "http://www.w3.org/2000/svg", className: "h-5 w-5 mr-2", viewBox: "0 0 20 20", fill: "currentColor", children: _jsx("path", { d: "M13.586 3.586a2 2 0 112.828 2.828l-.793.793-2.828-2.828.793-.793zM11.379 5.793L3 14.172V17h2.828l8.38-8.379-2.83-2.828z" }) }), "Rename"] })), _jsxs("button", { onClick: handleDeleteChat, disabled: isLoading, className: "flex items-center rounded-md bg-red-100 px-4 py-2 text-red-800 hover:bg-red-200 transition-colors disabled:bg-gray-100", "aria-label": "Delete conversation", children: [_jsx("svg", { xmlns: "http://www.w3.org/2000/svg", className: "h-5 w-5 mr-2 text-red-600", viewBox: "0 0 20 20", fill: "currentColor", children: _jsx("path", { fillRule: "evenodd", d: "M9 2a1 1 0 00-.894.553L7.382 4H4a1 1 0 000 2v10a2 2 0 002 2h8a2 2 0 002-2V6a1 1 0 100-2h-3.382l-.724-1.447A1 1 0 0011 2H9zM7 8a1 1 0 012 0v6a1 1 0 11-2 0V8zm5-1a1 1 0 00-1 1v6a1 1 0 102 0V8a1 1 0 00-1-1z", clipRule: "evenodd" }) }), "Delete Conversation"] })] }))] })] }));
};
export default ChatActions;
