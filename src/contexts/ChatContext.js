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
var __spreadArray = (this && this.__spreadArray) || function (to, from, pack) {
    if (pack || arguments.length === 2) for (var i = 0, l = from.length, ar; i < l; i++) {
        if (ar || !(i in from)) {
            if (!ar) ar = Array.prototype.slice.call(from, 0, i);
            ar[i] = from[i];
        }
    }
    return to.concat(ar || Array.prototype.slice.call(from));
};
import { jsx as _jsx } from "react/jsx-runtime";
import { createContext, useContext, useState, useCallback, useEffect } from 'react';
import { streamCharacterResponse, formatMessagesForOpenAI } from '../services/openai';
import { characterRepository } from '../repositories/characterRepository';
import { chatRepository } from '../repositories/chatRepository';
import { useAuth } from './AuthContext';
// Create the context
var ChatContext = createContext(undefined);
// Provider component
export function ChatProvider(_a) {
    var _this = this;
    var children = _a.children;
    // State
    var _b = useState(null), character = _b[0], setCharacter = _b[1];
    var _c = useState([]), messages = _c[0], setMessages = _c[1];
    var _d = useState(false), isLoading = _d[0], setIsLoading = _d[1];
    var _e = useState(null), error = _e[0], setError = _e[1];
    var _f = useState(null), chatId = _f[0], setChatId = _f[1];
    var _g = useState(false), isTyping = _g[0], setIsTyping = _g[1];
    var _h = useState(''), setCurrentResponse = _h[1];
    var _j = useState(false), isFavorite = _j[0], setIsFavorite = _j[1];
    // Get the current user from auth context
    var user = useAuth().user;
    // Select a Bible character to chat with
    var selectCharacter = useCallback(function (characterId) { return __awaiter(_this, void 0, void 0, function () {
        var characterData, newChat, openingMessage, localOpeningMessage, error_1;
        var _a;
        return __generator(this, function (_b) {
            switch (_b.label) {
                case 0:
                    _b.trys.push([0, 7, 8, 9]);
                    setIsLoading(true);
                    setError(null);
                    return [4 /*yield*/, characterRepository.getById(characterId)];
                case 1:
                    characterData = _b.sent();
                    if (!characterData) {
                        throw new Error('Character not found');
                    }
                    setCharacter(characterData);
                    // Reset messages
                    setMessages([]);
                    if (!user) return [3 /*break*/, 5];
                    return [4 /*yield*/, chatRepository.createChat(user.id, characterId, "Chat with ".concat(characterData.name))];
                case 2:
                    newChat = _b.sent();
                    setChatId(newChat.id);
                    setIsFavorite((_a = newChat.is_favorite) !== null && _a !== void 0 ? _a : false);
                    if (!characterData.opening_line) return [3 /*break*/, 4];
                    return [4 /*yield*/, chatRepository.addMessage(newChat.id, characterData.opening_line, 'assistant')];
                case 3:
                    openingMessage = _b.sent();
                    setMessages([openingMessage]);
                    _b.label = 4;
                case 4: return [3 /*break*/, 6];
                case 5:
                    // For non-authenticated users, just show the opening line locally
                    if (characterData.opening_line) {
                        localOpeningMessage = {
                            id: 'local-opening',
                            chat_id: 'local-chat',
                            content: characterData.opening_line,
                            role: 'assistant',
                            created_at: new Date().toISOString()
                        };
                        setMessages([localOpeningMessage]);
                    }
                    _b.label = 6;
                case 6: return [3 /*break*/, 9];
                case 7:
                    error_1 = _b.sent();
                    console.error('Error selecting character:', error_1);
                    setError(error_1 instanceof Error ? error_1.message : 'Failed to select character');
                    return [3 /*break*/, 9];
                case 8:
                    setIsLoading(false);
                    return [7 /*endfinally*/];
                case 9: return [2 /*return*/];
            }
        });
    }); }, [user]);
    /* -------------------------------------------------- */
    /* Load an existing chat by id                         */
    /* -------------------------------------------------- */
    var loadChat = useCallback(function (existingChatId) { return __awaiter(_this, void 0, void 0, function () {
        var chat, chatCharacter, chatMsgs, e_1;
        var _a;
        return __generator(this, function (_b) {
            switch (_b.label) {
                case 0:
                    _b.trys.push([0, 4, 5, 6]);
                    setIsLoading(true);
                    setError(null);
                    return [4 /*yield*/, chatRepository.getChatById(existingChatId)];
                case 1:
                    chat = _b.sent();
                    if (!chat)
                        throw new Error('Chat not found');
                    return [4 /*yield*/, characterRepository.getById(chat.character_id)];
                case 2:
                    chatCharacter = _b.sent();
                    if (!chatCharacter)
                        throw new Error('Character not found');
                    return [4 /*yield*/, chatRepository.getChatMessages(existingChatId)];
                case 3:
                    chatMsgs = _b.sent();
                    // Apply to state
                    setCharacter(chatCharacter);
                    setMessages(chatMsgs);
                    setChatId(chat.id);
                    setIsFavorite((_a = chat.is_favorite) !== null && _a !== void 0 ? _a : false);
                    return [3 /*break*/, 6];
                case 4:
                    e_1 = _b.sent();
                    console.error('Error loading chat:', e_1);
                    setError(e_1 instanceof Error ? e_1.message : 'Failed to load chat');
                    return [3 /*break*/, 6];
                case 5:
                    setIsLoading(false);
                    return [7 /*endfinally*/];
                case 6: return [2 /*return*/];
            }
        });
    }); }, []);
    // Send a message and get a response from the character
    var sendMessage = useCallback(function (content) { return __awaiter(_this, void 0, void 0, function () {
        var userMessage_1, savedUserMessage, assistantMessagePlaceholder_1, messageHistory, finalResponse, error_2;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    if (!character) {
                        setError('Please select a character first');
                        return [2 /*return*/];
                    }
                    _a.label = 1;
                case 1:
                    _a.trys.push([1, 7, 8, 9]);
                    setIsTyping(true);
                    setError(null);
                    userMessage_1 = {
                        id: "local-".concat(Date.now()),
                        chat_id: chatId || 'local-chat',
                        content: content,
                        role: 'user',
                        created_at: new Date().toISOString()
                    };
                    // Add user message to UI immediately
                    setMessages(function (prev) { return __spreadArray(__spreadArray([], prev, true), [userMessage_1], false); });
                    savedUserMessage = userMessage_1;
                    if (!(user && chatId)) return [3 /*break*/, 3];
                    return [4 /*yield*/, chatRepository.addMessage(chatId, content, 'user')];
                case 2:
                    savedUserMessage = _a.sent();
                    _a.label = 3;
                case 3:
                    assistantMessagePlaceholder_1 = {
                        id: "local-response-".concat(Date.now()),
                        chat_id: chatId || 'local-chat',
                        content: '',
                        role: 'assistant',
                        created_at: new Date().toISOString()
                    };
                    // Add placeholder to messages
                    setMessages(function (prev) { return __spreadArray(__spreadArray([], prev, true), [assistantMessagePlaceholder_1], false); });
                    // Reset current response
                    setCurrentResponse('');
                    messageHistory = formatMessagesForOpenAI(messages.concat(savedUserMessage));
                    // Stream the response
                    return [4 /*yield*/, streamCharacterResponse(character.name, character.persona_prompt, messageHistory, function (chunk) {
                            setCurrentResponse(function (prev) { return prev + chunk; });
                            // Update the placeholder message with the current response
                            setMessages(function (prev) {
                                var updated = __spreadArray([], prev, true);
                                var lastIndex = updated.length - 1;
                                updated[lastIndex] = __assign(__assign({}, updated[lastIndex]), { content: updated[lastIndex].content + chunk });
                                return updated;
                            });
                        })];
                case 4:
                    // Stream the response
                    _a.sent();
                    finalResponse = messages[messages.length - 1].content;
                    if (!(user && chatId)) return [3 /*break*/, 6];
                    return [4 /*yield*/, chatRepository.addMessage(chatId, finalResponse, 'assistant')];
                case 5:
                    _a.sent();
                    _a.label = 6;
                case 6: return [3 /*break*/, 9];
                case 7:
                    error_2 = _a.sent();
                    console.error('Error sending message:', error_2);
                    setError(error_2 instanceof Error ? error_2.message : 'Failed to send message');
                    // Remove the placeholder message if there was an error
                    setMessages(function (prev) { return prev.slice(0, -1); });
                    return [3 /*break*/, 9];
                case 8:
                    setIsTyping(false);
                    setCurrentResponse('');
                    return [7 /*endfinally*/];
                case 9: return [2 /*return*/];
            }
        });
    }); }, [character, messages, chatId, user]);
    // Reset the current chat
    var resetChat = useCallback(function () {
        setCharacter(null);
        setMessages([]);
        setChatId(null);
        setError(null);
        setIsLoading(false);
        setIsTyping(false);
        setCurrentResponse('');
        setIsFavorite(false); // Reset favorite status
    }, []);
    // Expose resetChat to the window object for debug purposes
    useEffect(function () {
        if (process.env.NODE_ENV === 'development') {
            window.resetChat = resetChat;
        }
    }, [resetChat]);
    // Retry the last message if there was an error
    var retryLastMessage = useCallback(function () { return __awaiter(_this, void 0, void 0, function () {
        var lastUserMessageIndex, lastUserMessage;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    if (messages.length < 2) {
                        return [2 /*return*/]; // Nothing to retry
                    }
                    lastUserMessageIndex = __spreadArray([], messages, true).reverse().findIndex(function (m) { return m.role === 'user'; });
                    if (lastUserMessageIndex === -1) {
                        return [2 /*return*/]; // No user messages to retry
                    }
                    lastUserMessage = messages[messages.length - 1 - lastUserMessageIndex];
                    // Remove any failed assistant response
                    if (messages[messages.length - 1].role === 'assistant') {
                        setMessages(function (prev) { return prev.slice(0, -1); });
                    }
                    // Retry sending the message
                    return [4 /*yield*/, sendMessage(lastUserMessage.content)];
                case 1:
                    // Retry sending the message
                    _a.sent();
                    return [2 /*return*/];
            }
        });
    }); }, [messages, sendMessage]);
    // Save a title for the current chat
    var saveChatTitle = useCallback(function (title) { return __awaiter(_this, void 0, void 0, function () {
        var error_3;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    if (!chatId || !user) {
                        return [2 /*return*/];
                    }
                    _a.label = 1;
                case 1:
                    _a.trys.push([1, 3, , 4]);
                    return [4 /*yield*/, chatRepository.updateChat(chatId, { title: title })];
                case 2:
                    _a.sent();
                    return [3 /*break*/, 4];
                case 3:
                    error_3 = _a.sent();
                    console.error('Error saving chat title:', error_3);
                    setError(error_3 instanceof Error ? error_3.message : 'Failed to save chat title');
                    return [3 /*break*/, 4];
                case 4: return [2 /*return*/];
            }
        });
    }); }, [chatId, user]);
    // Toggle favorite status for the current chat
    var toggleFavorite = useCallback(function (isFavorite) { return __awaiter(_this, void 0, void 0, function () {
        var error_4;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    if (!chatId || !user) {
                        return [2 /*return*/];
                    }
                    _a.label = 1;
                case 1:
                    _a.trys.push([1, 3, , 4]);
                    return [4 /*yield*/, chatRepository.toggleFavorite(chatId, isFavorite)];
                case 2:
                    _a.sent();
                    setIsFavorite(isFavorite); // Update local state
                    return [3 /*break*/, 4];
                case 3:
                    error_4 = _a.sent();
                    console.error('Error toggling favorite status:', error_4);
                    setError(error_4 instanceof Error ? error_4.message : 'Failed to update favorite status');
                    return [3 /*break*/, 4];
                case 4: return [2 /*return*/];
            }
        });
    }); }, [chatId, user]);
    /* -------------------------------------------------- */
    /* Save current chat (for anonymous or if not yet in DB) */
    /* -------------------------------------------------- */
    var saveChat = useCallback(function () {
        var args_1 = [];
        for (var _i = 0; _i < arguments.length; _i++) {
            args_1[_i] = arguments[_i];
        }
        return __awaiter(_this, __spreadArray([], args_1, true), void 0, function (title) {
            var newChat, _a, messages_1, m, stored, e_2;
            var _b;
            if (title === void 0) { title = 'Untitled Chat'; }
            return __generator(this, function (_c) {
                switch (_c.label) {
                    case 0:
                        if (chatId)
                            return [2 /*return*/]; // already saved
                        _c.label = 1;
                    case 1:
                        _c.trys.push([1, 9, , 10]);
                        if (!user) return [3 /*break*/, 7];
                        return [4 /*yield*/, chatRepository.createChat(user.id, character.id, title)];
                    case 2:
                        newChat = _c.sent();
                        setChatId(newChat.id);
                        setIsFavorite((_b = newChat.is_favorite) !== null && _b !== void 0 ? _b : false);
                        _a = 0, messages_1 = messages;
                        _c.label = 3;
                    case 3:
                        if (!(_a < messages_1.length)) return [3 /*break*/, 6];
                        m = messages_1[_a];
                        return [4 /*yield*/, chatRepository.addMessage(newChat.id, m.content, m.role)];
                    case 4:
                        _c.sent();
                        _c.label = 5;
                    case 5:
                        _a++;
                        return [3 /*break*/, 3];
                    case 6: return [3 /*break*/, 8];
                    case 7:
                        stored = JSON.parse(localStorage.getItem('savedChats') || '[]');
                        stored.push({
                            id: "local-".concat(Date.now()),
                            character_name: character === null || character === void 0 ? void 0 : character.name,
                            conversation_title: title,
                            // Persist full message data so we can perfectly restore later
                            messages: messages.map(function (_a) {
                                var id = _a.id, role = _a.role, content = _a.content, created_at = _a.created_at;
                                return ({
                                    id: id,
                                    role: role,
                                    content: content,
                                    created_at: created_at,
                                });
                            }),
                            timestamp: new Date().toISOString(),
                            is_favorite: false, // Default to not favorite when saving
                        });
                        localStorage.setItem('savedChats', JSON.stringify(stored));
                        _c.label = 8;
                    case 8: return [3 /*break*/, 10];
                    case 9:
                        e_2 = _c.sent();
                        console.error('Error saving chat:', e_2);
                        setError(e_2 instanceof Error ? e_2.message : 'Failed to save chat');
                        return [3 /*break*/, 10];
                    case 10: return [2 /*return*/];
                }
            });
        });
    }, [chatId, user, character, messages]);
    /* -------------------------------------------------- */
    /* Delete current chat                                */
    /* -------------------------------------------------- */
    var deleteCurrentChat = useCallback(function () { return __awaiter(_this, void 0, void 0, function () {
        var e_3;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    if (!chatId)
                        return [2 /*return*/, resetChat()];
                    _a.label = 1;
                case 1:
                    _a.trys.push([1, 4, , 5]);
                    if (!user) return [3 /*break*/, 3];
                    return [4 /*yield*/, chatRepository.deleteChat(chatId)];
                case 2:
                    _a.sent();
                    _a.label = 3;
                case 3:
                    resetChat();
                    return [3 /*break*/, 5];
                case 4:
                    e_3 = _a.sent();
                    console.error('Error deleting chat:', e_3);
                    setError(e_3 instanceof Error ? e_3.message : 'Failed to delete chat');
                    return [3 /*break*/, 5];
                case 5: return [2 /*return*/];
            }
        });
    }); }, [chatId, user, resetChat]);
    /* -------------------------------------------------- */
    /* Resume a local chat directly from localStorage     */
    /* -------------------------------------------------- */
    var resumeLocalChat = useCallback(function (localChatId) { return __awaiter(_this, void 0, void 0, function () {
        var savedChatsJson, savedChats, localChat_1, characters, matchingCharacter, formattedMessages, error_5;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    _a.trys.push([0, 2, 3, 4]);
                    setIsLoading(true);
                    setError(null);
                    savedChatsJson = localStorage.getItem('savedChats');
                    if (!savedChatsJson) {
                        setError('No saved conversations found in local storage.');
                        return [2 /*return*/, false];
                    }
                    savedChats = JSON.parse(savedChatsJson);
                    localChat_1 = savedChats.find(function (chat) { return chat.id === localChatId; });
                    if (!localChat_1) {
                        setError("Conversation with ID ".concat(localChatId, " not found."));
                        return [2 /*return*/, false];
                    }
                    return [4 /*yield*/, characterRepository.getAll()];
                case 1:
                    characters = _a.sent();
                    matchingCharacter = characters.find(function (c) { return c.name === localChat_1.character_name; });
                    if (!matchingCharacter) {
                        setError("Character \"".concat(localChat_1.character_name, "\" not found."));
                        return [2 /*return*/, false];
                    }
                    // Set character first
                    setCharacter(matchingCharacter);
                    formattedMessages = localChat_1.messages.map(function (msg, index) {
                        // If the stored message already has an id & created_at we use them,
                        // otherwise we create synthetic ones for backward-compatibility.
                        if ('id' in msg && 'created_at' in msg) {
                            return __assign(__assign({}, msg), { chat_id: localChatId });
                        }
                        // Legacy (role/content only) format fallback
                        return {
                            id: "local-".concat(localChatId, "-").concat(index),
                            chat_id: localChatId,
                            content: msg.content,
                            role: msg.role,
                            created_at: new Date(localChat_1.timestamp).toISOString(),
                        };
                    });
                    // Set all state variables directly
                    setMessages(formattedMessages);
                    setChatId(localChatId);
                    setIsFavorite(localChat_1.is_favorite || false);
                    console.info("[ChatContext] Successfully resumed local chat: ".concat(localChat_1.conversation_title));
                    return [2 /*return*/, true];
                case 2:
                    error_5 = _a.sent();
                    console.error('Error resuming local chat:', error_5);
                    setError(error_5 instanceof Error ? error_5.message : 'Failed to resume conversation');
                    return [2 /*return*/, false];
                case 3:
                    setIsLoading(false);
                    return [7 /*endfinally*/];
                case 4: return [2 /*return*/];
            }
        });
    }); }, []);
    // Create the value object that will be provided to consumers
    var value = {
        character: character,
        messages: messages,
        isLoading: isLoading,
        error: error,
        chatId: chatId,
        isTyping: isTyping,
        isChatSaved: chatId !== null,
        isFavorite: isFavorite,
        selectCharacter: selectCharacter,
        sendMessage: sendMessage,
        resetChat: resetChat,
        retryLastMessage: retryLastMessage,
        saveChatTitle: saveChatTitle,
        toggleFavorite: toggleFavorite,
        saveChat: saveChat,
        deleteCurrentChat: deleteCurrentChat,
        loadChat: loadChat,
        resumeLocalChat: resumeLocalChat,
    };
    // Provide the chat context to children components
    return _jsx(ChatContext.Provider, { value: value, children: children });
}
// Custom hook to use the chat context
export function useChat() {
    var context = useContext(ChatContext);
    if (context === undefined) {
        throw new Error('useChat must be used within a ChatProvider');
    }
    return context;
}
