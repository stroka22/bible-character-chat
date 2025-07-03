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
 * Repository for interacting with Character Group data and mappings in Supabase.
 */
export var groupRepository = {
    /**
     * Creates a new character group.
     * @param groupData - Data for the new group (excluding id, created_at, updated_at).
     * @returns Promise resolving to the newly created CharacterGroup object.
     */
    createGroup: function (groupData) {
        return __awaiter(this, void 0, void 0, function () {
            var _a, data, error, error_1;
            return __generator(this, function (_b) {
                switch (_b.label) {
                    case 0:
                        _b.trys.push([0, 2, , 3]);
                        return [4 /*yield*/, supabase
                                .from('character_groups')
                                .insert(groupData)
                                .select('*')
                                .single()];
                    case 1:
                        _a = _b.sent(), data = _a.data, error = _a.error;
                        if (error) {
                            throw error;
                        }
                        return [2 /*return*/, data];
                    case 2:
                        error_1 = _b.sent();
                        console.error('Failed to create character group:', error_1);
                        throw new Error('Failed to create character group. Please try again.');
                    case 3: return [2 /*return*/];
                }
            });
        });
    },
    /**
     * Fetches all character groups.
     * @returns Promise resolving to an array of CharacterGroup objects.
     */
    getAllGroups: function () {
        return __awaiter(this, void 0, void 0, function () {
            var _a, data, error, error_2;
            return __generator(this, function (_b) {
                switch (_b.label) {
                    case 0:
                        _b.trys.push([0, 2, , 3]);
                        return [4 /*yield*/, supabase
                                .from('character_groups')
                                .select('*')
                                .order('sort_order')
                                .order('name')];
                    case 1:
                        _a = _b.sent(), data = _a.data, error = _a.error;
                        if (error) {
                            throw error;
                        }
                        return [2 /*return*/, data];
                    case 2:
                        error_2 = _b.sent();
                        console.error('Failed to fetch character groups:', error_2);
                        throw new Error('Failed to load character groups. Please try again.');
                    case 3: return [2 /*return*/];
                }
            });
        });
    },
    /**
     * Fetches a single character group by its ID.
     * @param id - The ID of the group.
     * @returns Promise resolving to the CharacterGroup object or null if not found.
     */
    getGroupById: function (id) {
        return __awaiter(this, void 0, void 0, function () {
            var _a, data, error, error_3;
            return __generator(this, function (_b) {
                switch (_b.label) {
                    case 0:
                        _b.trys.push([0, 2, , 3]);
                        return [4 /*yield*/, supabase
                                .from('character_groups')
                                .select('*')
                                .eq('id', id)
                                .single()];
                    case 1:
                        _a = _b.sent(), data = _a.data, error = _a.error;
                        if (error) {
                            if (error.code === 'PGRST116') {
                                return [2 /*return*/, null]; // No rows found
                            }
                            throw error;
                        }
                        return [2 /*return*/, data];
                    case 2:
                        error_3 = _b.sent();
                        console.error("Failed to fetch group with ID ".concat(id, ":"), error_3);
                        throw new Error('Failed to fetch group. Please try again.');
                    case 3: return [2 /*return*/];
                }
            });
        });
    },
    /**
     * Updates an existing character group.
     * @param id - The ID of the group to update.
     * @param updates - Partial data to update the group with.
     * @returns Promise resolving to the updated CharacterGroup object.
     */
    updateGroup: function (id, updates) {
        return __awaiter(this, void 0, void 0, function () {
            var _a, data, error, error_4;
            return __generator(this, function (_b) {
                switch (_b.label) {
                    case 0:
                        _b.trys.push([0, 2, , 3]);
                        return [4 /*yield*/, supabase
                                .from('character_groups')
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
                        error_4 = _b.sent();
                        console.error("Failed to update group ".concat(id, ":"), error_4);
                        throw new Error('Failed to update group. Please try again.');
                    case 3: return [2 /*return*/];
                }
            });
        });
    },
    /**
     * Deletes a character group by its ID.
     * @param id - The ID of the group to delete.
     * @returns Promise resolving when the deletion is complete.
     */
    deleteGroup: function (id) {
        return __awaiter(this, void 0, void 0, function () {
            var error, error_5;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        _a.trys.push([0, 2, , 3]);
                        return [4 /*yield*/, supabase
                                .from('character_groups')
                                .delete()
                                .eq('id', id)];
                    case 1:
                        error = (_a.sent()).error;
                        if (error) {
                            throw error;
                        }
                        return [3 /*break*/, 3];
                    case 2:
                        error_5 = _a.sent();
                        console.error("Failed to delete group ".concat(id, ":"), error_5);
                        throw new Error('Failed to delete group. Please try again.');
                    case 3: return [2 /*return*/];
                }
            });
        });
    },
    /**
     * Adds a character to a group.
     * @param groupId - The ID of the group.
     * @param characterId - The ID of the character.
     * @param sortOrder - Optional sort order for the character within the group.
     * @returns Promise resolving to the new CharacterGroupMapping object.
     */
    addCharacterToGroup: function (groupId_1, characterId_1) {
        return __awaiter(this, arguments, void 0, function (groupId, characterId, sortOrder) {
            var _a, data, error, error_6;
            if (sortOrder === void 0) { sortOrder = 0; }
            return __generator(this, function (_b) {
                switch (_b.label) {
                    case 0:
                        _b.trys.push([0, 2, , 3]);
                        return [4 /*yield*/, supabase
                                .from('character_group_mappings')
                                .insert({ group_id: groupId, character_id: characterId, sort_order: sortOrder })
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
                        console.error('Failed to add character to group:', error_6);
                        throw new Error('Failed to add character to group. Please try again.');
                    case 3: return [2 /*return*/];
                }
            });
        });
    },
    /**
     * Removes a character from a group mapping.
     * @param mappingId - The ID of the mapping to delete.
     * @returns Promise resolving when the deletion is complete.
     */
    removeCharacterFromGroup: function (mappingId) {
        return __awaiter(this, void 0, void 0, function () {
            var error, error_7;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        _a.trys.push([0, 2, , 3]);
                        return [4 /*yield*/, supabase
                                .from('character_group_mappings')
                                .delete()
                                .eq('id', mappingId)];
                    case 1:
                        error = (_a.sent()).error;
                        if (error) {
                            throw error;
                        }
                        return [3 /*break*/, 3];
                    case 2:
                        error_7 = _a.sent();
                        console.error("Failed to remove character mapping ".concat(mappingId, ":"), error_7);
                        throw new Error('Failed to remove character from group. Please try again.');
                    case 3: return [2 /*return*/];
                }
            });
        });
    },
    /**
     * Fetches all characters within a specific group.
     * Can optionally join with the 'characters' table to get full character details.
     * @param groupId - The ID of the group.
     * @returns Promise resolving to an array of CharacterGroupMapping objects (with joined character data).
     */
    getCharactersInGroup: function (groupId) {
        return __awaiter(this, void 0, void 0, function () {
            var _a, data, error, error_8;
            return __generator(this, function (_b) {
                switch (_b.label) {
                    case 0:
                        _b.trys.push([0, 2, , 3]);
                        return [4 /*yield*/, supabase
                                .from('character_group_mappings')
                                .select('*, character:characters(*)') // Select all mapping fields and join character details
                                .eq('group_id', groupId)
                                .order('sort_order')];
                    case 1:
                        _a = _b.sent(), data = _a.data, error = _a.error;
                        if (error) {
                            throw error;
                        }
                        return [2 /*return*/, data];
                    case 2:
                        error_8 = _b.sent();
                        console.error("Failed to fetch characters in group ".concat(groupId, ":"), error_8);
                        throw new Error('Failed to load characters in group. Please try again.');
                    case 3: return [2 /*return*/];
                }
            });
        });
    },
    /**
     * Fetches all groups a specific character belongs to.
     * @param characterId - The ID of the character.
     * @returns Promise resolving to an array of CharacterGroupMapping objects.
     */
    getGroupsForCharacter: function (characterId) {
        return __awaiter(this, void 0, void 0, function () {
            var _a, data, error, error_9;
            return __generator(this, function (_b) {
                switch (_b.label) {
                    case 0:
                        _b.trys.push([0, 2, , 3]);
                        return [4 /*yield*/, supabase
                                .from('character_group_mappings')
                                .select('*')
                                .eq('character_id', characterId)];
                    case 1:
                        _a = _b.sent(), data = _a.data, error = _a.error;
                        if (error) {
                            throw error;
                        }
                        return [2 /*return*/, data];
                    case 2:
                        error_9 = _b.sent();
                        console.error("Failed to fetch groups for character ".concat(characterId, ":"), error_9);
                        throw new Error('Failed to load groups for character. Please try again.');
                    case 3: return [2 /*return*/];
                }
            });
        });
    },
    /**
     * Updates the sort order of a character within a group.
     * @param mappingId - The ID of the mapping to update.
     * @param newSortOrder - The new sort order value.
     * @returns Promise resolving to the updated CharacterGroupMapping object.
     */
    updateCharacterMappingSortOrder: function (mappingId, newSortOrder) {
        return __awaiter(this, void 0, void 0, function () {
            var _a, data, error, error_10;
            return __generator(this, function (_b) {
                switch (_b.label) {
                    case 0:
                        _b.trys.push([0, 2, , 3]);
                        return [4 /*yield*/, supabase
                                .from('character_group_mappings')
                                .update({ sort_order: newSortOrder, updated_at: new Date().toISOString() })
                                .eq('id', mappingId)
                                .select('*')
                                .single()];
                    case 1:
                        _a = _b.sent(), data = _a.data, error = _a.error;
                        if (error) {
                            throw error;
                        }
                        return [2 /*return*/, data];
                    case 2:
                        error_10 = _b.sent();
                        console.error("Failed to update mapping sort order ".concat(mappingId, ":"), error_10);
                        throw new Error('Failed to update character order in group. Please try again.');
                    case 3: return [2 /*return*/];
                }
            });
        });
    },
};
