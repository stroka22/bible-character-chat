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
import { supabase } from '../services/supabase';
/**
 * Repository for interacting with chat data in Supabase
 */
export var chatRepository = {
    /**
     * Create a new chat session
     * @param userId - The ID of the user creating the chat
     * @param characterId - The ID of the Bible character
     * @param title - Optional title for the chat (defaults to timestamp)
     * @returns Promise resolving to the created Chat object
     */
    createChat: function (userId, characterId, title) {
        return __awaiter(this, void 0, void 0, function () {
            var newChat, _a, data, error, error_1;
            return __generator(this, function (_b) {
                switch (_b.label) {
                    case 0:
                        _b.trys.push([0, 2, , 3]);
                        newChat = {
                            user_id: userId,
                            character_id: characterId,
                            title: title || "Chat ".concat(new Date().toLocaleString()),
                            is_favorite: false
                        };
                        return [4 /*yield*/, supabase
                                .from('chats')
                                .insert(newChat)
                                .select()
                                .single()];
                    case 1:
                        _a = _b.sent(), data = _a.data, error = _a.error;
                        if (error) {
                            throw error;
                        }
                        return [2 /*return*/, data];
                    case 2:
                        error_1 = _b.sent();
                        console.error('Failed to create chat:', error_1);
                        throw new Error('Failed to create chat. Please try again later.');
                    case 3: return [2 /*return*/];
                }
            });
        });
    },
    /**
     * Add a message to an existing chat
     * @param chatId - The ID of the chat
     * @param content - The message content
     * @param role - The role of the message sender ('user', 'assistant', or 'system')
     * @returns Promise resolving to the created ChatMessage object
     */
    addMessage: function (chatId, content, role) {
        return __awaiter(this, void 0, void 0, function () {
            var newMessage, _a, data, error, error_2;
            return __generator(this, function (_b) {
                switch (_b.label) {
                    case 0:
                        _b.trys.push([0, 3, , 4]);
                        newMessage = {
                            chat_id: chatId,
                            content: content,
                            role: role
                        };
                        return [4 /*yield*/, supabase
                                .from('chat_messages')
                                .insert(newMessage)
                                .select()
                                .single()];
                    case 1:
                        _a = _b.sent(), data = _a.data, error = _a.error;
                        if (error) {
                            throw error;
                        }
                        // Update the chat's updated_at timestamp
                        return [4 /*yield*/, supabase
                                .from('chats')
                                .update({ updated_at: new Date().toISOString() })
                                .eq('id', chatId)];
                    case 2:
                        // Update the chat's updated_at timestamp
                        _b.sent();
                        return [2 /*return*/, data];
                    case 3:
                        error_2 = _b.sent();
                        console.error('Failed to add message:', error_2);
                        throw new Error('Failed to add message. Please try again later.');
                    case 4: return [2 /*return*/];
                }
            });
        });
    },
    /**
     * Get all messages for a specific chat
     * @param chatId - The ID of the chat
     * @returns Promise resolving to an array of ChatMessage objects
     */
    getChatMessages: function (chatId) {
        return __awaiter(this, void 0, void 0, function () {
            var _a, data, error, error_3;
            return __generator(this, function (_b) {
                switch (_b.label) {
                    case 0:
                        _b.trys.push([0, 2, , 3]);
                        return [4 /*yield*/, supabase
                                .from('chat_messages')
                                .select('*')
                                .eq('chat_id', chatId)
                                .order('created_at')];
                    case 1:
                        _a = _b.sent(), data = _a.data, error = _a.error;
                        if (error) {
                            throw error;
                        }
                        return [2 /*return*/, data];
                    case 2:
                        error_3 = _b.sent();
                        console.error("Failed to fetch messages for chat ".concat(chatId, ":"), error_3);
                        throw new Error('Failed to fetch chat messages. Please try again later.');
                    case 3: return [2 /*return*/];
                }
            });
        });
    },
    /**
     * Get a specific chat by ID
     * @param chatId - The ID of the chat
     * @returns Promise resolving to a Chat object or null if not found
     */
    getChatById: function (chatId) {
        return __awaiter(this, void 0, void 0, function () {
            var _a, data, error, error_4;
            return __generator(this, function (_b) {
                switch (_b.label) {
                    case 0:
                        _b.trys.push([0, 2, , 3]);
                        return [4 /*yield*/, supabase
                                .from('chats')
                                .select('*')
                                .eq('id', chatId)
                                .single()];
                    case 1:
                        _a = _b.sent(), data = _a.data, error = _a.error;
                        if (error) {
                            if (error.code === 'PGRST116') {
                                // PGRST116 is the error code for "no rows returned"
                                return [2 /*return*/, null];
                            }
                            throw error;
                        }
                        return [2 /*return*/, data];
                    case 2:
                        error_4 = _b.sent();
                        console.error("Failed to fetch chat with ID ".concat(chatId, ":"), error_4);
                        throw new Error('Failed to fetch chat. Please try again later.');
                    case 3: return [2 /*return*/];
                }
            });
        });
    },
    /**
     * Get all chats for a specific user
     * @param userId - The ID of the user
     * @returns Promise resolving to an array of Chat objects
     */
    getUserChats: function (userId) {
        return __awaiter(this, void 0, void 0, function () {
            var _a, data, error, error_5;
            return __generator(this, function (_b) {
                switch (_b.label) {
                    case 0:
                        _b.trys.push([0, 2, , 3]);
                        return [4 /*yield*/, supabase
                                .from('chats')
                                .select('*')
                                .eq('user_id', userId)
                                .order('updated_at', { ascending: false })];
                    case 1:
                        _a = _b.sent(), data = _a.data, error = _a.error;
                        if (error) {
                            throw error;
                        }
                        return [2 /*return*/, data];
                    case 2:
                        error_5 = _b.sent();
                        console.error("Failed to fetch chats for user ".concat(userId, ":"), error_5);
                        throw new Error('Failed to fetch user chats. Please try again later.');
                    case 3: return [2 /*return*/];
                }
            });
        });
    },
    /**
     * Update chat metadata (e.g., title, favorite status)
     * @param chatId - The ID of the chat
     * @param updates - Object containing the fields to update
     * @returns Promise resolving to the updated Chat object
     */
    updateChat: function (chatId, updates) {
        return __awaiter(this, void 0, void 0, function () {
            var updatedData, _a, data, error, error_6;
            return __generator(this, function (_b) {
                switch (_b.label) {
                    case 0:
                        _b.trys.push([0, 2, , 3]);
                        updatedData = __assign(__assign({}, updates), { updated_at: new Date().toISOString() });
                        return [4 /*yield*/, supabase
                                .from('chats')
                                .update(updatedData)
                                .eq('id', chatId)
                                .select()
                                .single()];
                    case 1:
                        _a = _b.sent(), data = _a.data, error = _a.error;
                        if (error) {
                            throw error;
                        }
                        return [2 /*return*/, data];
                    case 2:
                        error_6 = _b.sent();
                        console.error("Failed to update chat ".concat(chatId, ":"), error_6);
                        throw new Error('Failed to update chat. Please try again later.');
                    case 3: return [2 /*return*/];
                }
            });
        });
    },
    /**
     * Toggle the favorite status of a chat
     * @param chatId - The ID of the chat
     * @param isFavorite - Whether the chat should be marked as favorite
     * @returns Promise resolving to the updated Chat object
     */
    toggleFavorite: function (chatId, isFavorite) {
        return __awaiter(this, void 0, void 0, function () {
            return __generator(this, function (_a) {
                return [2 /*return*/, this.updateChat(chatId, { is_favorite: isFavorite })];
            });
        });
    },
    /**
     * Delete a chat and all its messages
     * @param chatId - The ID of the chat to delete
     * @returns Promise resolving when the deletion is complete
     */
    deleteChat: function (chatId) {
        return __awaiter(this, void 0, void 0, function () {
            var messagesError, chatError, error_7;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        _a.trys.push([0, 3, , 4]);
                        return [4 /*yield*/, supabase
                                .from('chat_messages')
                                .delete()
                                .eq('chat_id', chatId)];
                    case 1:
                        messagesError = (_a.sent()).error;
                        if (messagesError) {
                            throw messagesError;
                        }
                        return [4 /*yield*/, supabase
                                .from('chats')
                                .delete()
                                .eq('id', chatId)];
                    case 2:
                        chatError = (_a.sent()).error;
                        if (chatError) {
                            throw chatError;
                        }
                        return [3 /*break*/, 4];
                    case 3:
                        error_7 = _a.sent();
                        console.error("Failed to delete chat ".concat(chatId, ":"), error_7);
                        throw new Error('Failed to delete chat. Please try again later.');
                    case 4: return [2 /*return*/];
                }
            });
        });
    }
};
