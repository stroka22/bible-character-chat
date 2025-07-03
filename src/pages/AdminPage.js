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
import { useAuth } from '../contexts/AuthContext';
import { characterRepository } from '../repositories/characterRepository';
import GroupManagement from '../components/admin/GroupManagement';
// Helper function for basic CSV parsing
var parseCSV = function (csvText) {
    var lines = csvText.trim().split('\n');
    if (lines.length === 0)
        return [];
    var headers = lines[0].split(',').map(function (header) { return header.trim(); });
    var data = lines.slice(1).map(function (line) {
        var values = line.split(',').map(function (value) { return value.trim(); });
        var row = {};
        headers.forEach(function (header, index) {
            row[header] = values[index];
        });
        return row;
    });
    return data;
};
var AdminPage = function () {
    var user = useAuth().user;
    /* ------------------------------------------------------------
     * ADMIN / BYPASS ACCESS CHECK
     * ---------------------------------------------------------- */
    // Read bypass flag once on component render
    var bypassAuth = typeof window !== 'undefined' &&
        localStorage.getItem('bypass_auth') === 'true';
    // Simple admin email check (replace with real role‐based logic as needed)
    var isAdmin = bypassAuth || (user && user.email === 'admin@example.com');
    var _a = useState([]), characters = _a[0], setCharacters = _a[1];
    var _b = useState(true), isLoading = _b[0], setIsLoading = _b[1];
    var _c = useState(null), error = _c[0], setError = _c[1];
    var _d = useState(null), successMessage = _d[0], setSuccessMessage = _d[1];
    var _e = useState(''), searchQuery = _e[0], setSearchQuery = _e[1];
    var _f = useState('characters'), activeTab = _f[0], setActiveTab = _f[1];
    // Form state for manual creation/editing
    var _g = useState(null), editingCharacterId = _g[0], setEditingCharacterId = _g[1];
    var _h = useState(''), formName = _h[0], setFormName = _h[1];
    var _j = useState(''), formAvatarUrl = _j[0], setFormAvatarUrl = _j[1];
    var _k = useState(''), formFeatureImageUrl = _k[0], setFormFeatureImageUrl = _k[1];
    var _l = useState(''), formShortBiography = _l[0], setFormShortBiography = _l[1];
    var _m = useState(''), formBibleBook = _m[0], setFormBibleBook = _m[1];
    var _o = useState(''), formOpeningSentence = _o[0], setFormOpeningSentence = _o[1];
    var _p = useState(''), formPersonaPrompt = _p[0], setFormPersonaPrompt = _p[1];
    var _q = useState(''), formScripturalContext = _q[0], setFormScripturalContext = _q[1];
    var _r = useState(''), formDescription = _r[0], setFormDescription = _r[1]; // Assuming description is also part of the form
    var resetForm = useCallback(function () {
        setEditingCharacterId(null);
        setFormName('');
        setFormAvatarUrl('');
        setFormFeatureImageUrl('');
        setFormShortBiography('');
        setFormBibleBook('');
        setFormOpeningSentence('');
        setFormPersonaPrompt('');
        setFormScripturalContext('');
        setFormDescription('');
    }, []);
    var fetchCharacters = useCallback(function () { return __awaiter(void 0, void 0, void 0, function () {
        var fetchedCharacters, err_1;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    setIsLoading(true);
                    setError(null);
                    _a.label = 1;
                case 1:
                    _a.trys.push([1, 3, 4, 5]);
                    return [4 /*yield*/, characterRepository.getAll()];
                case 2:
                    fetchedCharacters = _a.sent();
                    setCharacters(fetchedCharacters);
                    return [3 /*break*/, 5];
                case 3:
                    err_1 = _a.sent();
                    console.error('Failed to fetch characters:', err_1);
                    setError('Failed to load characters.');
                    return [3 /*break*/, 5];
                case 4:
                    setIsLoading(false);
                    return [7 /*endfinally*/];
                case 5: return [2 /*return*/];
            }
        });
    }); }, []);
    // Fetch characters after the access flags are set
    useEffect(function () {
        if (isAdmin)
            fetchCharacters();
    }, [isAdmin, fetchCharacters]);
    if (!isAdmin) {
        return (_jsx("div", { className: "flex h-full w-full items-center justify-center bg-red-50 p-4", children: _jsxs("div", { className: "text-center", children: [_jsx("h2", { className: "text-2xl font-bold text-red-800 mb-4", children: "Access Denied" }), _jsx("p", { className: "text-red-700", children: "You do not have administrative privileges to view this page." })] }) }));
    }
    // Handle CSV upload
    var handleCSVUpload = function (event) { return __awaiter(void 0, void 0, void 0, function () {
        var file, text, parsedData, charactersToCreate, err_2;
        var _a;
        return __generator(this, function (_b) {
            switch (_b.label) {
                case 0:
                    file = (_a = event.target.files) === null || _a === void 0 ? void 0 : _a[0];
                    if (!file)
                        return [2 /*return*/];
                    setIsLoading(true);
                    setError(null);
                    setSuccessMessage(null);
                    _b.label = 1;
                case 1:
                    _b.trys.push([1, 4, 5, 6]);
                    return [4 /*yield*/, file.text()];
                case 2:
                    text = _b.sent();
                    parsedData = parseCSV(text);
                    charactersToCreate = parsedData.map(function (row) { return ({
                        name: row.character_name || '',
                        avatar_url: row.avatar_url || '',
                        feature_image_url: row.feature_image_url || '',
                        short_biography: row.short_biography || '',
                        bible_book: row.bible_book || '',
                        opening_line: row.opening_sentence || '',
                        persona_prompt: row.persona_prompt || '',
                        scriptural_context: row.scriptural_context || '',
                        description: row.description || '', // Assuming description is also in CSV
                    }); }).filter(function (char) { return char.name && char.persona_prompt; });
                    if (charactersToCreate.length === 0) {
                        throw new Error('No valid characters found in CSV. Ensure headers and data are correct.');
                    }
                    return [4 /*yield*/, characterRepository.bulkCreateCharacters(charactersToCreate)];
                case 3:
                    _b.sent();
                    setSuccessMessage("Successfully uploaded ".concat(charactersToCreate.length, " characters."));
                    fetchCharacters(); // Refresh list
                    return [3 /*break*/, 6];
                case 4:
                    err_2 = _b.sent();
                    console.error('CSV upload error:', err_2);
                    setError(err_2 instanceof Error ? err_2.message : 'Failed to upload CSV.');
                    return [3 /*break*/, 6];
                case 5:
                    setIsLoading(false);
                    return [7 /*endfinally*/];
                case 6: return [2 /*return*/];
            }
        });
    }); };
    // Handle manual form submission
    var handleFormSubmit = function (event) { return __awaiter(void 0, void 0, void 0, function () {
        var characterData, err_3;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    event.preventDefault();
                    setIsLoading(true);
                    setError(null);
                    setSuccessMessage(null);
                    characterData = {
                        name: formName,
                        avatar_url: formAvatarUrl,
                        feature_image_url: formFeatureImageUrl,
                        short_biography: formShortBiography,
                        bible_book: formBibleBook,
                        opening_line: formOpeningSentence,
                        persona_prompt: formPersonaPrompt,
                        scriptural_context: formScripturalContext,
                        description: formDescription,
                    };
                    _a.label = 1;
                case 1:
                    _a.trys.push([1, 6, 7, 8]);
                    if (!editingCharacterId) return [3 /*break*/, 3];
                    return [4 /*yield*/, characterRepository.updateCharacter(editingCharacterId, characterData)];
                case 2:
                    _a.sent();
                    setSuccessMessage('Character updated successfully!');
                    return [3 /*break*/, 5];
                case 3: return [4 /*yield*/, characterRepository.createCharacter(characterData)];
                case 4:
                    _a.sent();
                    setSuccessMessage('Character created successfully!');
                    _a.label = 5;
                case 5:
                    resetForm();
                    fetchCharacters(); // Refresh list
                    return [3 /*break*/, 8];
                case 6:
                    err_3 = _a.sent();
                    console.error('Character form submission error:', err_3);
                    setError(err_3 instanceof Error ? err_3.message : 'Failed to save character.');
                    return [3 /*break*/, 8];
                case 7:
                    setIsLoading(false);
                    return [7 /*endfinally*/];
                case 8: return [2 /*return*/];
            }
        });
    }); };
    // Handle editing a character
    var handleEditCharacter = function (character) {
        setEditingCharacterId(character.id);
        setFormName(character.name);
        setFormAvatarUrl(character.avatar_url || '');
        setFormFeatureImageUrl(character.feature_image_url || '');
        setFormShortBiography(character.short_biography || '');
        setFormBibleBook(character.bible_book || '');
        setFormOpeningSentence(character.opening_line || '');
        setFormPersonaPrompt(character.persona_prompt);
        setFormScripturalContext(character.scriptural_context || '');
        setFormDescription(character.description);
    };
    // Handle deleting a character
    var handleDeleteCharacter = function (id) { return __awaiter(void 0, void 0, void 0, function () {
        var err_4;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    if (!window.confirm('Are you sure you want to delete this character? This action cannot be undone.')) {
                        return [2 /*return*/];
                    }
                    setIsLoading(true);
                    setError(null);
                    setSuccessMessage(null);
                    _a.label = 1;
                case 1:
                    _a.trys.push([1, 3, 4, 5]);
                    return [4 /*yield*/, characterRepository.deleteCharacter(id)];
                case 2:
                    _a.sent();
                    setSuccessMessage('Character deleted successfully!');
                    fetchCharacters(); // Refresh list
                    return [3 /*break*/, 5];
                case 3:
                    err_4 = _a.sent();
                    console.error('Character deletion error:', err_4);
                    setError(err_4 instanceof Error ? err_4.message : 'Failed to delete character.');
                    return [3 /*break*/, 5];
                case 4:
                    setIsLoading(false);
                    return [7 /*endfinally*/];
                case 5: return [2 /*return*/];
            }
        });
    }); };
    // Filter characters based on search query
    var filteredCharacters = characters.filter(function (char) {
        return char.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
            char.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
            (char.short_biography && char.short_biography.toLowerCase().includes(searchQuery.toLowerCase())) ||
            (char.bible_book && char.bible_book.toLowerCase().includes(searchQuery.toLowerCase()));
    });
    return (_jsxs("div", { className: "container mx-auto px-4 py-8", children: [_jsx("h1", { className: "text-3xl font-bold text-gray-900 mb-6", children: "Admin Panel - Character Management" }), _jsx("p", { className: "text-gray-700 mb-4", children: "Welcome, Admin! Here you can manage Bible characters." }), _jsx("div", { className: "mb-8 border-b border-gray-200", children: _jsxs("nav", { className: "-mb-px flex space-x-8", "aria-label": "Admin Tabs", children: [_jsx("button", { onClick: function () { return setActiveTab('characters'); }, className: "whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm ".concat(activeTab === 'characters'
                                ? 'border-primary-500 text-primary-600'
                                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'), children: "Characters" }), _jsx("button", { onClick: function () { return setActiveTab('groups'); }, className: "whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm ".concat(activeTab === 'groups'
                                ? 'border-primary-500 text-primary-600'
                                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'), children: "Groups" })] }) }), isLoading && (_jsx("div", { className: "mb-4 p-3 bg-blue-100 text-blue-700 rounded", children: "Loading..." })), error && (_jsxs("div", { className: "mb-4 p-3 bg-red-100 text-red-700 rounded", children: ["Error: ", error] })), successMessage && (_jsxs("div", { className: "mb-4 p-3 bg-green-100 text-green-700 rounded", children: ["Success: ", successMessage] })), activeTab === 'characters' && (_jsxs(_Fragment, { children: [_jsxs("section", { className: "mb-8 p-6 bg-white rounded-lg shadow-md", children: [_jsx("h2", { className: "text-2xl font-semibold text-gray-800 mb-4", children: "Bulk Upload Characters (CSV)" }), _jsx("p", { className: "text-gray-600 mb-4", children: "Upload a CSV file to add or update multiple characters. Expected fields: `character_name`, `avatar_url`, `feature_image_url`, `short_biography`, `bible_book`, `opening_sentence`, `persona_prompt`, `scriptural_context`, `description`." }), _jsx("input", { type: "file", accept: ".csv", onChange: handleCSVUpload, disabled: isLoading, className: "block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-primary-50 file:text-primary-700 hover:file:bg-primary-100" })] }), _jsxs("section", { className: "p-6 bg-white rounded-lg shadow-md mb-8", children: [_jsx("h2", { className: "text-2xl font-semibold text-gray-800 mb-4", children: editingCharacterId ? 'Edit Character' : 'Create New Character' }), _jsxs("form", { onSubmit: handleFormSubmit, className: "space-y-4", children: [_jsxs("div", { children: [_jsx("label", { htmlFor: "name", className: "block text-sm font-medium text-gray-700", children: "Character Name" }), _jsx("input", { type: "text", id: "name", value: formName, onChange: function (e) { return setFormName(e.target.value); }, required: true, className: "mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500" })] }), _jsxs("div", { children: [_jsx("label", { htmlFor: "avatar_url", className: "block text-sm font-medium text-gray-700", children: "Avatar URL" }), _jsx("input", { type: "url", id: "avatar_url", value: formAvatarUrl, onChange: function (e) { return setFormAvatarUrl(e.target.value); }, className: "mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500" })] }), _jsxs("div", { children: [_jsx("label", { htmlFor: "feature_image_url", className: "block text-sm font-medium text-gray-700", children: "Feature Image URL" }), _jsx("input", { type: "url", id: "feature_image_url", value: formFeatureImageUrl, onChange: function (e) { return setFormFeatureImageUrl(e.target.value); }, className: "mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500" })] }), _jsxs("div", { children: [_jsx("label", { htmlFor: "short_biography", className: "block text-sm font-medium text-gray-700", children: "Short Biography" }), _jsx("textarea", { id: "short_biography", rows: 3, value: formShortBiography, onChange: function (e) { return setFormShortBiography(e.target.value); }, className: "mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500" })] }), _jsxs("div", { children: [_jsx("label", { htmlFor: "description", className: "block text-sm font-medium text-gray-700", children: "Description (for character card)" }), _jsx("textarea", { id: "description", rows: 3, value: formDescription, onChange: function (e) { return setFormDescription(e.target.value); }, required: true, className: "mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500" })] }), _jsxs("div", { children: [_jsx("label", { htmlFor: "bible_book", className: "block text-sm font-medium text-gray-700", children: "Bible Book" }), _jsx("input", { type: "text", id: "bible_book", value: formBibleBook, onChange: function (e) { return setFormBibleBook(e.target.value); }, className: "mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500" })] }), _jsxs("div", { children: [_jsx("label", { htmlFor: "opening_sentence", className: "block text-sm font-medium text-gray-700", children: "Opening Sentence" }), _jsx("textarea", { id: "opening_sentence", rows: 2, value: formOpeningSentence, onChange: function (e) { return setFormOpeningSentence(e.target.value); }, className: "mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500" })] }), _jsxs("div", { children: [_jsx("label", { htmlFor: "persona_prompt", className: "block text-sm font-medium text-gray-700", children: "Persona Prompt" }), _jsx("textarea", { id: "persona_prompt", rows: 5, value: formPersonaPrompt, onChange: function (e) { return setFormPersonaPrompt(e.target.value); }, required: true, className: "mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500" })] }), _jsxs("div", { children: [_jsx("label", { htmlFor: "scriptural_context", className: "block text-sm font-medium text-gray-700", children: "Scriptural Context" }), _jsx("textarea", { id: "scriptural_context", rows: 3, value: formScripturalContext, onChange: function (e) { return setFormScripturalContext(e.target.value); }, className: "mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500" })] }), _jsxs("div", { className: "flex space-x-4", children: [_jsx("button", { type: "submit", disabled: isLoading, className: "px-4 py-2 bg-primary-600 text-white rounded-md hover:bg-primary-700 disabled:bg-gray-400", children: isLoading ? 'Saving...' : editingCharacterId ? 'Update Character' : 'Create Character' }), editingCharacterId && (_jsx("button", { type: "button", onClick: resetForm, className: "px-4 py-2 bg-gray-200 text-gray-700 rounded-md hover:bg-gray-300", children: "Cancel Edit" }))] })] })] }), _jsxs("section", { className: "p-6 bg-white rounded-lg shadow-md", children: [_jsx("h2", { className: "text-2xl font-semibold text-gray-800 mb-4", children: "Existing Characters" }), _jsxs("div", { className: "mb-6", children: [_jsx("label", { htmlFor: "search", className: "block text-sm font-medium text-gray-700 mb-1", children: "Search Characters" }), _jsx("input", { type: "text", id: "search", placeholder: "Search by name, description, or bible book...", value: searchQuery, onChange: function (e) { return setSearchQuery(e.target.value); }, className: "block w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500" })] }), filteredCharacters.length === 0 ? (_jsx("p", { className: "text-gray-500 italic", children: "No characters found." })) : (_jsx("div", { className: "overflow-x-auto", children: _jsxs("table", { className: "min-w-full divide-y divide-gray-200", children: [_jsx("thead", { className: "bg-gray-50", children: _jsxs("tr", { children: [_jsx("th", { scope: "col", className: "px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider", children: "Name" }), _jsx("th", { scope: "col", className: "px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider", children: "Description" }), _jsx("th", { scope: "col", className: "px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider", children: "Bible Book" }), _jsx("th", { scope: "col", className: "px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider", children: "Actions" })] }) }), _jsx("tbody", { className: "bg-white divide-y divide-gray-200", children: filteredCharacters.map(function (character) { return (_jsxs("tr", { children: [_jsx("td", { className: "px-6 py-4 whitespace-nowrap", children: _jsxs("div", { className: "flex items-center", children: [character.avatar_url && (_jsx("img", { src: character.avatar_url, alt: character.name, className: "h-10 w-10 rounded-full mr-2 object-cover", onError: function (e) {
                                                                        e.target.src = "https://ui-avatars.com/api/?name=".concat(encodeURIComponent(character.name), "&background=random");
                                                                    } })), _jsx("div", { className: "text-sm font-medium text-gray-900", children: character.name })] }) }), _jsx("td", { className: "px-6 py-4", children: _jsx("div", { className: "text-sm text-gray-500 truncate max-w-xs", children: character.description }) }), _jsx("td", { className: "px-6 py-4 whitespace-nowrap", children: _jsx("div", { className: "text-sm text-gray-500", children: character.bible_book || '-' }) }), _jsxs("td", { className: "px-6 py-4 whitespace-nowrap text-right text-sm font-medium", children: [_jsx("button", { onClick: function () { return handleEditCharacter(character); }, className: "text-primary-600 hover:text-primary-900 mr-4", children: "Edit" }), _jsx("button", { onClick: function () { return handleDeleteCharacter(character.id); }, className: "text-red-600 hover:text-red-900", children: "Delete" })] })] }, character.id)); }) })] }) }))] })] })), activeTab === 'groups' && (_jsx(GroupManagement, {}))] }));
};
export default AdminPage;
