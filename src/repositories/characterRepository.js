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
 * Repository for interacting with Bible character data in Supabase
 */
export var characterRepository = {
    /**
     * Fetch all available Bible characters
     * @returns Promise resolving to an array of Character objects
     */
    getAll: function () {
        return __awaiter(this, void 0, void 0, function () {
            var _a, data, error, error_1;
            return __generator(this, function (_b) {
                switch (_b.label) {
                    case 0:
                        _b.trys.push([0, 2, , 3]);
                        return [4 /*yield*/, supabase
                                .from('characters')
                                .select('*')
                                .order('name')];
                    case 1:
                        _a = _b.sent(), data = _a.data, error = _a.error;
                        if (error) {
                            throw error;
                        }
                        return [2 /*return*/, data];
                    case 2:
                        error_1 = _b.sent();
                        console.error('Failed to fetch characters:', error_1);
                        throw new Error('Failed to fetch characters. Please try again later.');
                    case 3: return [2 /*return*/];
                }
            });
        });
    },
    /**
     * Fetch a specific Bible character by ID
     * @param id - The unique identifier of the character
     * @returns Promise resolving to a Character object or null if not found
     */
    getById: function (id) {
        return __awaiter(this, void 0, void 0, function () {
            var _a, data, error, error_2;
            return __generator(this, function (_b) {
                switch (_b.label) {
                    case 0:
                        _b.trys.push([0, 2, , 3]);
                        return [4 /*yield*/, supabase
                                .from('characters')
                                .select('*')
                                .eq('id', id)
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
                        error_2 = _b.sent();
                        console.error("Failed to fetch character with ID ".concat(id, ":"), error_2);
                        throw new Error('Failed to fetch character. Please try again later.');
                    case 3: return [2 /*return*/];
                }
            });
        });
    },
    /**
     * Fetch a specific Bible character by name
     * @param name - The name of the character
     * @returns Promise resolving to a Character object or null if not found
     */
    getByName: function (name) {
        return __awaiter(this, void 0, void 0, function () {
            var _a, data, error, error_3;
            return __generator(this, function (_b) {
                switch (_b.label) {
                    case 0:
                        _b.trys.push([0, 2, , 3]);
                        return [4 /*yield*/, supabase
                                .from('characters')
                                .select('*')
                                .ilike('name', name)
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
                        error_3 = _b.sent();
                        console.error("Failed to fetch character with name ".concat(name, ":"), error_3);
                        throw new Error('Failed to fetch character. Please try again later.');
                    case 3: return [2 /*return*/];
                }
            });
        });
    },
    /**
     * Search for Bible characters by name
     * @param query - The search query
     * @returns Promise resolving to an array of Character objects
     */
    search: function (query) {
        return __awaiter(this, void 0, void 0, function () {
            var _a, data, error, error_4;
            return __generator(this, function (_b) {
                switch (_b.label) {
                    case 0:
                        _b.trys.push([0, 2, , 3]);
                        return [4 /*yield*/, supabase
                                .from('characters')
                                .select('*')
                                .ilike('name', "%".concat(query, "%"))
                                .order('name')];
                    case 1:
                        _a = _b.sent(), data = _a.data, error = _a.error;
                        if (error) {
                            throw error;
                        }
                        return [2 /*return*/, data];
                    case 2:
                        error_4 = _b.sent();
                        console.error("Failed to search characters with query ".concat(query, ":"), error_4);
                        throw new Error('Failed to search characters. Please try again later.');
                    case 3: return [2 /*return*/];
                }
            });
        });
    },
    /**
     * Create a new Bible character
     * @param character - Data for the new character (excluding id/created_at/updated_at)
     * @returns Promise resolving to the newly-created Character object
     */
    createCharacter: function (character) {
        return __awaiter(this, void 0, void 0, function () {
            var _a, data, error, error_5;
            return __generator(this, function (_b) {
                switch (_b.label) {
                    case 0:
                        _b.trys.push([0, 2, , 3]);
                        return [4 /*yield*/, supabase
                                .from('characters')
                                .insert(character)
                                .select('*')
                                .single()];
                    case 1:
                        _a = _b.sent(), data = _a.data, error = _a.error;
                        if (error) {
                            throw error;
                        }
                        return [2 /*return*/, data];
                    case 2:
                        error_5 = _b.sent();
                        console.error('Failed to create character:', error_5);
                        throw new Error('Failed to create character. Please try again later.');
                    case 3: return [2 /*return*/];
                }
            });
        });
    },
    /**
     * Update an existing character
     * @param id - Character ID
     * @param updates - Partial character fields to update
     * @returns Promise resolving to the updated Character object
     */
    updateCharacter: function (id, updates) {
        return __awaiter(this, void 0, void 0, function () {
            var _a, data, error, error_6;
            return __generator(this, function (_b) {
                switch (_b.label) {
                    case 0:
                        _b.trys.push([0, 2, , 3]);
                        return [4 /*yield*/, supabase
                                .from('characters')
                                .update(__assign(__assign({}, updates), { updated_at: new Date().toISOString() }))
                                .eq('id', id)
                                .select('*')
                                .single()];
                    case 1:
                        _a = _b.sent(), data = _a.data, error = _a.error;
                        if (error) {
                            throw error;
                        }
                        return [2 /*return*/, data];
                    case 2:
                        error_6 = _b.sent();
                        console.error("Failed to update character ".concat(id, ":"), error_6);
                        throw new Error('Failed to update character. Please try again later.');
                    case 3: return [2 /*return*/];
                }
            });
        });
    },
    /**
     * Delete a character by ID
     * @param id - Character ID
     */
    deleteCharacter: function (id) {
        return __awaiter(this, void 0, void 0, function () {
            var error, error_7;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        _a.trys.push([0, 2, , 3]);
                        return [4 /*yield*/, supabase
                                .from('characters')
                                .delete()
                                .eq('id', id)];
                    case 1:
                        error = (_a.sent()).error;
                        if (error) {
                            throw error;
                        }
                        return [3 /*break*/, 3];
                    case 2:
                        error_7 = _a.sent();
                        console.error("Failed to delete character ".concat(id, ":"), error_7);
                        throw new Error('Failed to delete character. Please try again later.');
                    case 3: return [2 /*return*/];
                }
            });
        });
    },
    /**
     * Bulk create characters (e.g., via CSV upload)
     * @param characters - Array of character objects (same shape as createCharacter input)
     * @returns Promise resolving to the array of created Character objects
     */
    bulkCreateCharacters: function (characters) {
        return __awaiter(this, void 0, void 0, function () {
            var _a, data, error, error_8;
            return __generator(this, function (_b) {
                switch (_b.label) {
                    case 0:
                        if (characters.length === 0)
                            return [2 /*return*/, []];
                        _b.label = 1;
                    case 1:
                        _b.trys.push([1, 3, , 4]);
                        return [4 /*yield*/, supabase
                                .from('characters')
                                .insert(characters)
                                .select('*')];
                    case 2:
                        _a = _b.sent(), data = _a.data, error = _a.error;
                        if (error) {
                            throw error;
                        }
                        return [2 /*return*/, data];
                    case 3:
                        error_8 = _b.sent();
                        console.error('Failed to bulk create characters:', error_8);
                        throw new Error('Failed to bulk create characters. Please try again later.');
                    case 4: return [2 /*return*/];
                }
            });
        });
    }
};
