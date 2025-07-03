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
import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useState, useEffect, useCallback, Fragment, } from 'react';
import { groupRepository } from '../../repositories/groupRepository';
import { characterRepository } from '../../repositories/characterRepository';
var GroupManagement = function () {
    /* ------------------------------------------------------ */
    /* Group CRUD state                                       */
    /* ------------------------------------------------------ */
    var _a = useState([]), groups = _a[0], setGroups = _a[1];
    var _b = useState(true), isLoading = _b[0], setIsLoading = _b[1];
    var _c = useState(null), error = _c[0], setError = _c[1];
    var _d = useState(null), successMessage = _d[0], setSuccessMessage = _d[1];
    // State for form management (create/edit)
    var _e = useState(null), editingGroupId = _e[0], setEditingGroupId = _e[1];
    var _f = useState(''), formName = _f[0], setFormName = _f[1];
    var _g = useState(''), formDescription = _g[0], setFormDescription = _g[1];
    var _h = useState(''), formImageUrl = _h[0], setFormImageUrl = _h[1];
    var _j = useState(''), formIcon = _j[0], setFormIcon = _j[1];
    var _k = useState(0), formSortOrder = _k[0], setFormSortOrder = _k[1];
    var _l = useState('groups'), activeTab = _l[0], setActiveTab = _l[1];
    /* ------------------------------------------------------ */
    /* Character assignment state                             */
    /* ------------------------------------------------------ */
    var _m = useState([]), allCharacters = _m[0], setAllCharacters = _m[1];
    var _o = useState(null), selectedGroupId = _o[0], setSelectedGroupId = _o[1];
    var _p = useState([]), groupCharacters = _p[0], setGroupCharacters = _p[1];
    /* ------------------------------------------------------ */
    /* Fetch helpers                                          */
    /* ------------------------------------------------------ */
    // Fetch all groups from the database
    var fetchGroups = useCallback(function () { return __awaiter(void 0, void 0, void 0, function () {
        var fetchedGroups, err_1;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    setIsLoading(true);
                    setError(null);
                    _a.label = 1;
                case 1:
                    _a.trys.push([1, 3, 4, 5]);
                    return [4 /*yield*/, groupRepository.getAllGroups()];
                case 2:
                    fetchedGroups = _a.sent();
                    setGroups(fetchedGroups);
                    return [3 /*break*/, 5];
                case 3:
                    err_1 = _a.sent();
                    console.error('Failed to fetch groups:', err_1);
                    setError('Failed to load groups. Please try again.');
                    return [3 /*break*/, 5];
                case 4:
                    setIsLoading(false);
                    return [7 /*endfinally*/];
                case 5: return [2 /*return*/];
            }
        });
    }); }, []);
    // Fetch all characters once
    var fetchCharacters = useCallback(function () { return __awaiter(void 0, void 0, void 0, function () {
        var characters, err_2;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    _a.trys.push([0, 2, , 3]);
                    return [4 /*yield*/, characterRepository.getAll()];
                case 1:
                    characters = _a.sent();
                    setAllCharacters(characters);
                    return [3 /*break*/, 3];
                case 2:
                    err_2 = _a.sent();
                    console.error('Failed to fetch characters:', err_2);
                    setError('Failed to load characters. Please try again.');
                    return [3 /*break*/, 3];
                case 3: return [2 /*return*/];
            }
        });
    }); }, []);
    // Fetch characters in selected group
    var fetchGroupCharacters = useCallback(function (groupId) { return __awaiter(void 0, void 0, void 0, function () {
        var data, err_3;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    _a.trys.push([0, 2, , 3]);
                    return [4 /*yield*/, groupRepository.getCharactersInGroup(groupId)];
                case 1:
                    data = _a.sent();
                    setGroupCharacters(data);
                    return [3 /*break*/, 3];
                case 2:
                    err_3 = _a.sent();
                    console.error('Failed to fetch group characters:', err_3);
                    setError('Failed to load characters for group.');
                    return [3 /*break*/, 3];
                case 3: return [2 /*return*/];
            }
        });
    }); }, []);
    // Load groups on component mount
    useEffect(function () {
        fetchGroups();
        fetchCharacters();
    }, [fetchGroups, fetchCharacters]);
    // When a group is selected, load its characters
    useEffect(function () {
        if (selectedGroupId) {
            fetchGroupCharacters(selectedGroupId);
        }
        else {
            setGroupCharacters([]);
        }
    }, [selectedGroupId, fetchGroupCharacters]);
    // Reset form fields
    var resetForm = useCallback(function () {
        setEditingGroupId(null);
        setFormName('');
        setFormDescription('');
        setFormImageUrl('');
        setFormIcon('');
        setFormSortOrder(0);
    }, []);
    // Handle form submission (create or update)
    var handleFormSubmit = function (event) { return __awaiter(void 0, void 0, void 0, function () {
        var groupData, err_4;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    event.preventDefault();
                    setIsLoading(true);
                    setError(null);
                    setSuccessMessage(null);
                    if (!formName.trim()) {
                        setError('Group Name is required.');
                        setIsLoading(false);
                        return [2 /*return*/];
                    }
                    groupData = {
                        name: formName.trim(),
                        description: formDescription.trim() || null,
                        image_url: formImageUrl.trim() || null,
                        icon: formIcon.trim() || null,
                        sort_order: formSortOrder,
                    };
                    _a.label = 1;
                case 1:
                    _a.trys.push([1, 6, 7, 8]);
                    if (!editingGroupId) return [3 /*break*/, 3];
                    return [4 /*yield*/, groupRepository.updateGroup(editingGroupId, groupData)];
                case 2:
                    _a.sent();
                    setSuccessMessage('Group updated successfully!');
                    return [3 /*break*/, 5];
                case 3: return [4 /*yield*/, groupRepository.createGroup(groupData)];
                case 4:
                    _a.sent();
                    setSuccessMessage('Group created successfully!');
                    _a.label = 5;
                case 5:
                    resetForm();
                    fetchGroups(); // Refresh the list
                    return [3 /*break*/, 8];
                case 6:
                    err_4 = _a.sent();
                    console.error('Group form submission error:', err_4);
                    setError(err_4 instanceof Error ? err_4.message : 'Failed to save group.');
                    return [3 /*break*/, 8];
                case 7:
                    setIsLoading(false);
                    return [7 /*endfinally*/];
                case 8: return [2 /*return*/];
            }
        });
    }); };
    // Handle editing a group
    var handleEditGroup = function (group) {
        var _a;
        setEditingGroupId(group.id);
        setFormName(group.name);
        setFormDescription(group.description || '');
        setFormImageUrl(group.image_url || '');
        setFormIcon(group.icon || '');
        setFormSortOrder(group.sort_order);
        // Scroll to form
        (_a = document.getElementById('groupFormSection')) === null || _a === void 0 ? void 0 : _a.scrollIntoView({ behavior: 'smooth' });
    };
    // Handle deleting a group
    var handleDeleteGroup = function (id) { return __awaiter(void 0, void 0, void 0, function () {
        var err_5;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    if (!window.confirm('Are you sure you want to delete this group? This action cannot be undone.')) {
                        return [2 /*return*/];
                    }
                    setIsLoading(true);
                    setError(null);
                    setSuccessMessage(null);
                    _a.label = 1;
                case 1:
                    _a.trys.push([1, 3, 4, 5]);
                    return [4 /*yield*/, groupRepository.deleteGroup(id)];
                case 2:
                    _a.sent();
                    setSuccessMessage('Group deleted successfully!');
                    fetchGroups(); // Refresh the list
                    return [3 /*break*/, 5];
                case 3:
                    err_5 = _a.sent();
                    console.error('Group deletion error:', err_5);
                    setError(err_5 instanceof Error ? err_5.message : 'Failed to delete group.');
                    return [3 /*break*/, 5];
                case 4:
                    setIsLoading(false);
                    return [7 /*endfinally*/];
                case 5: return [2 /*return*/];
            }
        });
    }); };
    /* ------------------------------------------------------ */
    /* Character Assignment Handlers                          */
    /* ------------------------------------------------------ */
    var handleAddCharacterToGroup = function (characterId) { return __awaiter(void 0, void 0, void 0, function () {
        var err_6;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    if (!selectedGroupId)
                        return [2 /*return*/];
                    setIsLoading(true);
                    setError(null);
                    setSuccessMessage(null);
                    _a.label = 1;
                case 1:
                    _a.trys.push([1, 3, 4, 5]);
                    return [4 /*yield*/, groupRepository.addCharacterToGroup(selectedGroupId, characterId)];
                case 2:
                    _a.sent();
                    setSuccessMessage('Character added to group!');
                    fetchGroupCharacters(selectedGroupId); // Refresh characters in group
                    return [3 /*break*/, 5];
                case 3:
                    err_6 = _a.sent();
                    console.error('Error adding character to group:', err_6);
                    setError(err_6 instanceof Error ? err_6.message : 'Failed to add character to group.');
                    return [3 /*break*/, 5];
                case 4:
                    setIsLoading(false);
                    return [7 /*endfinally*/];
                case 5: return [2 /*return*/];
            }
        });
    }); };
    var handleRemoveCharacterFromGroup = function (mappingId) { return __awaiter(void 0, void 0, void 0, function () {
        var err_7;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    if (!selectedGroupId)
                        return [2 /*return*/];
                    setIsLoading(true);
                    setError(null);
                    setSuccessMessage(null);
                    _a.label = 1;
                case 1:
                    _a.trys.push([1, 3, 4, 5]);
                    return [4 /*yield*/, groupRepository.removeCharacterFromGroup(mappingId)];
                case 2:
                    _a.sent();
                    setSuccessMessage('Character removed from group!');
                    fetchGroupCharacters(selectedGroupId); // Refresh characters in group
                    return [3 /*break*/, 5];
                case 3:
                    err_7 = _a.sent();
                    console.error('Error removing character from group:', err_7);
                    setError(err_7 instanceof Error ? err_7.message : 'Failed to remove character from group.');
                    return [3 /*break*/, 5];
                case 4:
                    setIsLoading(false);
                    return [7 /*endfinally*/];
                case 5: return [2 /*return*/];
            }
        });
    }); };
    var handleReorderCharacterInGroup = function (mappingId, newSortOrder) { return __awaiter(void 0, void 0, void 0, function () {
        var err_8;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    if (!selectedGroupId)
                        return [2 /*return*/];
                    setIsLoading(true);
                    setError(null);
                    setSuccessMessage(null);
                    _a.label = 1;
                case 1:
                    _a.trys.push([1, 3, 4, 5]);
                    return [4 /*yield*/, groupRepository.updateCharacterMappingSortOrder(mappingId, newSortOrder)];
                case 2:
                    _a.sent();
                    setSuccessMessage('Character order updated!');
                    fetchGroupCharacters(selectedGroupId); // Refresh characters in group
                    return [3 /*break*/, 5];
                case 3:
                    err_8 = _a.sent();
                    console.error('Error reordering character:', err_8);
                    setError(err_8 instanceof Error ? err_8.message : 'Failed to reorder character.');
                    return [3 /*break*/, 5];
                case 4:
                    setIsLoading(false);
                    return [7 /*endfinally*/];
                case 5: return [2 /*return*/];
            }
        });
    }); };
    // Filter characters not yet in the selected group
    var charactersNotInGroup = allCharacters.filter(function (char) { return !groupCharacters.some(function (gc) { return gc.character_id === char.id; }); });
    return (_jsxs("div", { className: "container mx-auto px-4 py-8", children: [_jsx("h1", { className: "text-3xl font-bold text-gray-900 mb-6", children: "Manage Character Groups" }), isLoading && (_jsx("div", { className: "mb-4 p-3 bg-blue-100 text-blue-700 rounded", children: "Loading..." })), error && (_jsxs("div", { className: "mb-4 p-3 bg-red-100 text-red-700 rounded", children: ["Error: ", error] })), successMessage && (_jsxs("div", { className: "mb-4 p-3 bg-green-100 text-green-700 rounded", children: ["Success: ", successMessage] })), _jsx("div", { className: "mb-6 border-b border-gray-200", children: _jsxs("nav", { className: "-mb-px flex space-x-8", "aria-label": "Tabs", children: [_jsx("button", { onClick: function () { return setActiveTab('groups'); }, className: "whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm ".concat(activeTab === 'groups'
                                ? 'border-primary-500 text-primary-600'
                                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'), children: "Groups" }), _jsx("button", { onClick: function () { return setActiveTab('assignment'); }, className: "whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm ".concat(activeTab === 'assignment'
                                ? 'border-primary-500 text-primary-600'
                                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'), children: "Character Assignment" })] }) }), activeTab === 'groups' && (_jsxs(Fragment, { children: [_jsxs("section", { id: "groupFormSection", className: "mb-8 p-6 bg-white rounded-lg shadow-md", children: [_jsx("h2", { className: "text-2xl font-semibold text-gray-800 mb-4", children: editingGroupId ? 'Edit Group' : 'Create New Group' }), _jsxs("form", { onSubmit: handleFormSubmit, className: "space-y-4", children: [_jsxs("div", { children: [_jsx("label", { htmlFor: "name", className: "block text-sm font-medium text-gray-700", children: "Group Name" }), _jsx("input", { type: "text", id: "name", value: formName, onChange: function (e) { return setFormName(e.target.value); }, required: true, className: "mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500" })] }), _jsxs("div", { children: [_jsx("label", { htmlFor: "description", className: "block text-sm font-medium text-gray-700", children: "Description" }), _jsx("textarea", { id: "description", rows: 3, value: formDescription, onChange: function (e) { return setFormDescription(e.target.value); }, className: "mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500" })] }), _jsxs("div", { children: [_jsx("label", { htmlFor: "imageUrl", className: "block text-sm font-medium text-gray-700", children: "Image URL" }), _jsx("input", { type: "url", id: "imageUrl", value: formImageUrl, onChange: function (e) { return setFormImageUrl(e.target.value); }, className: "mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500" })] }), _jsxs("div", { children: [_jsx("label", { htmlFor: "icon", className: "block text-sm font-medium text-gray-700", children: "Icon (e.g., FontAwesome class)" }), _jsx("input", { type: "text", id: "icon", value: formIcon, onChange: function (e) { return setFormIcon(e.target.value); }, className: "mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500" })] }), _jsxs("div", { children: [_jsx("label", { htmlFor: "sortOrder", className: "block text-sm font-medium text-gray-700", children: "Sort Order" }), _jsx("input", { type: "number", id: "sortOrder", value: formSortOrder, onChange: function (e) { return setFormSortOrder(Number(e.target.value)); }, className: "mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500" })] }), _jsxs("div", { className: "flex space-x-4", children: [_jsx("button", { type: "submit", disabled: isLoading, className: "px-4 py-2 bg-primary-600 text-white rounded-md hover:bg-primary-700 disabled:bg-gray-400", children: isLoading ? 'Saving...' : editingGroupId ? 'Update Group' : 'Create Group' }), editingGroupId && (_jsx("button", { type: "button", onClick: resetForm, className: "px-4 py-2 bg-gray-200 text-gray-700 rounded-md hover:bg-gray-300", children: "Cancel Edit" }))] })] })] }), _jsxs("section", { className: "p-6 bg-white rounded-lg shadow-md", children: [_jsx("h2", { className: "text-2xl font-semibold text-gray-800 mb-4", children: "Existing Groups" }), groups.length === 0 ? (_jsx("p", { className: "text-gray-500 italic", children: "No character groups found. Create one above!" })) : (_jsx("div", { className: "overflow-x-auto", children: _jsxs("table", { className: "min-w-full divide-y divide-gray-200", children: [_jsx("thead", { className: "bg-gray-50", children: _jsxs("tr", { children: [_jsx("th", { className: "px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider", children: "Name" }), _jsx("th", { className: "px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider", children: "Description" }), _jsx("th", { className: "px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider", children: "Sort Order" }), _jsx("th", { className: "px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider", children: "Actions" })] }) }), _jsx("tbody", { className: "bg-white divide-y divide-gray-200", children: groups.map(function (group) { return (_jsxs("tr", { children: [_jsx("td", { className: "px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900", children: group.name }), _jsx("td", { className: "px-6 py-4 text-sm text-gray-500 truncate max-w-xs", children: group.description || '-' }), _jsx("td", { className: "px-6 py-4 whitespace-nowrap text-sm text-gray-500", children: group.sort_order }), _jsxs("td", { className: "px-6 py-4 whitespace-nowrap text-right text-sm font-medium", children: [_jsx("button", { onClick: function () { return handleEditGroup(group); }, className: "text-primary-600 hover:text-primary-900 mr-4", children: "Edit" }), _jsx("button", { onClick: function () { return handleDeleteGroup(group.id); }, className: "text-red-600 hover:text-red-900", children: "Delete" })] })] }, group.id)); }) })] }) }))] })] })), activeTab === 'assignment' && (_jsxs("div", { className: "space-y-8", children: [_jsxs("section", { className: "p-6 bg-white rounded-lg shadow-md", children: [_jsx("h2", { className: "text-2xl font-semibold text-gray-800 mb-4", children: "Select a Group" }), _jsx("div", { className: "max-w-md", children: _jsxs("select", { value: selectedGroupId || '', onChange: function (e) { return setSelectedGroupId(e.target.value || null); }, className: "block w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500", children: [_jsx("option", { value: "", children: "-- Select a group --" }), groups.map(function (group) { return (_jsx("option", { value: group.id, children: group.name }, group.id)); })] }) })] }), selectedGroupId && (_jsxs("div", { className: "grid grid-cols-1 md:grid-cols-2 gap-6", children: [_jsxs("section", { className: "p-6 bg-white rounded-lg shadow-md", children: [_jsx("h2", { className: "text-xl font-semibold text-gray-800 mb-4", children: "Available Characters" }), charactersNotInGroup.length === 0 ? (_jsx("p", { className: "text-gray-500 italic", children: "All characters have been added to this group." })) : (_jsx("div", { className: "space-y-3 max-h-96 overflow-y-auto pr-2", children: charactersNotInGroup.map(function (character) { return (_jsxs("div", { className: "flex items-center justify-between p-3 border border-gray-200 rounded-md hover:bg-gray-50", children: [_jsxs("div", { className: "flex items-center", children: [_jsx("img", { src: character.avatar_url || "https://ui-avatars.com/api/?name=".concat(encodeURIComponent(character.name)), alt: character.name, className: "h-10 w-10 rounded-full object-cover mr-3", onError: function (e) {
                                                                e.target.src = "https://ui-avatars.com/api/?name=".concat(encodeURIComponent(character.name));
                                                            } }), _jsx("span", { className: "font-medium", children: character.name })] }), _jsx("button", { onClick: function () { return handleAddCharacterToGroup(character.id); }, className: "p-1 bg-green-100 text-green-700 rounded-full hover:bg-green-200", title: "Add to group", children: _jsx("svg", { xmlns: "http://www.w3.org/2000/svg", className: "h-5 w-5", viewBox: "0 0 20 20", fill: "currentColor", children: _jsx("path", { fillRule: "evenodd", d: "M10 5a1 1 0 011 1v3h3a1 1 0 110 2h-3v3a1 1 0 11-2 0v-3H6a1 1 0 110-2h3V6a1 1 0 011-1z", clipRule: "evenodd" }) }) })] }, character.id)); }) }))] }), _jsxs("section", { className: "p-6 bg-white rounded-lg shadow-md", children: [_jsx("h2", { className: "text-xl font-semibold text-gray-800 mb-4", children: "Characters in Group" }), groupCharacters.length === 0 ? (_jsx("p", { className: "text-gray-500 italic", children: "No characters in this group yet." })) : (_jsx("div", { className: "space-y-3 max-h-96 overflow-y-auto pr-2", children: groupCharacters.map(function (mapping, index) { return (_jsxs("div", { className: "flex items-center justify-between p-3 border border-gray-200 rounded-md hover:bg-gray-50", children: [_jsxs("div", { className: "flex items-center", children: [_jsx("div", { className: "text-gray-500 mr-2 w-6 text-center", children: mapping.sort_order }), _jsx("img", { src: mapping.character.avatar_url || "https://ui-avatars.com/api/?name=".concat(encodeURIComponent(mapping.character.name)), alt: mapping.character.name, className: "h-10 w-10 rounded-full object-cover mr-3", onError: function (e) {
                                                                e.target.src = "https://ui-avatars.com/api/?name=".concat(encodeURIComponent(mapping.character.name));
                                                            } }), _jsx("span", { className: "font-medium", children: mapping.character.name })] }), _jsxs("div", { className: "flex items-center space-x-1", children: [_jsx("button", { onClick: function () { return handleReorderCharacterInGroup(mapping.id, mapping.sort_order - 1); }, disabled: index === 0, className: "p-1 rounded-full ".concat(index === 0
                                                                ? 'text-gray-300 cursor-not-allowed'
                                                                : 'text-gray-600 hover:bg-gray-200'), title: "Move up", children: _jsx("svg", { xmlns: "http://www.w3.org/2000/svg", className: "h-5 w-5", viewBox: "0 0 20 20", fill: "currentColor", children: _jsx("path", { fillRule: "evenodd", d: "M5.293 9.707a1 1 0 010-1.414l4-4a1 1 0 011.414 0l4 4a1 1 0 01-1.414 1.414L11 7.414V15a1 1 0 11-2 0V7.414L6.707 9.707a1 1 0 01-1.414 0z", clipRule: "evenodd" }) }) }), _jsx("button", { onClick: function () { return handleReorderCharacterInGroup(mapping.id, mapping.sort_order + 1); }, disabled: index === groupCharacters.length - 1, className: "p-1 rounded-full ".concat(index === groupCharacters.length - 1
                                                                ? 'text-gray-300 cursor-not-allowed'
                                                                : 'text-gray-600 hover:bg-gray-200'), title: "Move down", children: _jsx("svg", { xmlns: "http://www.w3.org/2000/svg", className: "h-5 w-5", viewBox: "0 0 20 20", fill: "currentColor", children: _jsx("path", { fillRule: "evenodd", d: "M14.707 10.293a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 111.414-1.414L9 12.586V5a1 1 0 012 0v7.586l2.293-2.293a1 1 0 011.414 0z", clipRule: "evenodd" }) }) }), _jsx("button", { onClick: function () { return handleRemoveCharacterFromGroup(mapping.id); }, className: "p-1 text-red-600 rounded-full hover:bg-red-100", title: "Remove from group", children: _jsx("svg", { xmlns: "http://www.w3.org/2000/svg", className: "h-5 w-5", viewBox: "0 0 20 20", fill: "currentColor", children: _jsx("path", { fillRule: "evenodd", d: "M9 2a1 1 0 00-.894.553L7.382 4H4a1 1 0 000 2v10a2 2 0 002 2h8a2 2 0 002-2V6a1 1 0 100-2h-3.382l-.724-1.447A1 1 0 0011 2H9zM7 8a1 1 0 012 0v6a1 1 0 11-2 0V8zm5-1a1 1 0 00-1 1v6a1 1 0 102 0V8a1 1 0 00-1-1z", clipRule: "evenodd" }) }) })] })] }, mapping.id)); }) }))] })] })), !selectedGroupId && (_jsx("div", { className: "p-6 bg-gray-50 rounded-lg border border-gray-200 text-center", children: _jsx("p", { className: "text-gray-600", children: "Please select a group to manage its characters." }) }))] }))] }));
};
export default GroupManagement;
