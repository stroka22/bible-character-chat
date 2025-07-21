import { jsx as _jsx, jsxs as _jsxs, Fragment as _Fragment } from "react/jsx-runtime";
import { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { characterRepository } from '../repositories/characterRepository';
import GroupManagement from '../components/admin/GroupManagement';
import { supabase } from '../services/supabase';
const parseCSV = (csvText) => {
    const lines = csvText.trim().split('\n');
    if (lines.length === 0)
        return [];
    const headers = lines[0].split(',').map(header => header.trim());
    const data = lines.slice(1).map(line => {
        const values = line.split(',').map(value => value.trim());
        const row = {};
        headers.forEach((header, index) => {
            row[header] = values[index];
        });
        return row;
    });
    return data;
};
function tryParseJson(str) {
    try {
        return JSON.parse(str);
    }
    catch (e) {
        return null;
    }
}
const SecureAdminPage = () => {
    const navigate = useNavigate();
    const { user, loading: authLoading, isAdmin, isPastor, role, refreshProfile } = useAuth();
    const [activeTab, setActiveTab] = useState('characters');
    const [characters, setCharacters] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState(null);
    const [successMessage, setSuccessMessage] = useState(null);
    const [searchQuery, setSearchQuery] = useState('');
    const [userProfiles, setUserProfiles] = useState([]);
    const [showDebugInfo, setShowDebugInfo] = useState(false);
    const [editingCharacterId, setEditingCharacterId] = useState(null);
    const [formName, setFormName] = useState('');
    const [formAvatarUrl, setFormAvatarUrl] = useState('');
    const [formFeatureImageUrl, setFormFeatureImageUrl] = useState('');
    const [formShortBiography, setFormShortBiography] = useState('');
    const [formBibleBook, setFormBibleBook] = useState('');
    const [formOpeningSentence, setFormOpeningSentence] = useState('');
    const [formPersonaPrompt, setFormPersonaPrompt] = useState('');
    const [formScripturalContext, setFormScripturalContext] = useState('');
    const [formDescription, setFormDescription] = useState('');
    const [formIsVisible, setFormIsVisible] = useState(true);
    const [formTimelinePeriod, setFormTimelinePeriod] = useState('');
    const [formHistoricalContext, setFormHistoricalContext] = useState('');
    const [formGeographicLocation, setFormGeographicLocation] = useState('');
    const [formKeyScriptureRefs, setFormKeyScriptureRefs] = useState('');
    const [formTheologicalSignificance, setFormTheologicalSignificance] = useState('');
    const [formRelationships, setFormRelationships] = useState('');
    const [formStudyQuestions, setFormStudyQuestions] = useState('');
    useEffect(() => {
        console.log('=== AUTH DEBUG INFO ===');
        console.log('User:', user?.email);
        console.log('Role:', role);
        console.log('Is Admin?', isAdmin());
        console.log('Is Pastor?', isPastor());
        console.log('Auth Loading:', authLoading);
        console.log('=====================');
    }, [user, role, isAdmin, isPastor, authLoading]);
    const handleRefreshProfile = async () => {
        console.log('Manually refreshing profile...');
        await refreshProfile();
        console.log('Profile refreshed. New role:', role);
        console.log('Is Admin?', isAdmin());
        console.log('Is Pastor?', isPastor());
    };
    const resetForm = useCallback(() => {
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
        setFormIsVisible(true);
        setFormTimelinePeriod('');
        setFormHistoricalContext('');
        setFormGeographicLocation('');
        setFormKeyScriptureRefs('');
        setFormTheologicalSignificance('');
        setFormRelationships('');
        setFormStudyQuestions('');
    }, []);
    const fetchCharacters = useCallback(async () => {
        setIsLoading(true);
        setError(null);
        try {
            const fetchedCharacters = await characterRepository.getAll(true);
            setCharacters(fetchedCharacters);
        }
        catch (err) {
            console.error('Failed to fetch characters:', err);
            setError('Failed to load characters.');
        }
        finally {
            setIsLoading(false);
        }
    }, []);
    const fetchUserProfiles = useCallback(async () => {
        if (!isAdmin()) {
            console.log('Skipping user profile fetch - not an admin');
            return;
        }
        setIsLoading(true);
        setError(null);
        try {
            console.log('Fetching user profiles as admin');
            const { data, error } = await supabase
                .from('profiles')
                .select('id, email, display_name, role, created_at')
                .order('created_at', { ascending: false });
            if (error)
                throw error;
            setUserProfiles(data || []);
            console.log(`Fetched ${data?.length || 0} user profiles`);
        }
        catch (err) {
            console.error('Failed to fetch user profiles:', err);
            setError('Failed to load user profiles.');
        }
        finally {
            setIsLoading(false);
        }
    }, [isAdmin]);
    const handlePromoteUser = async (userId, newRole) => {
        if (!isAdmin()) {
            console.warn('Attempted to promote user without admin privileges');
            return;
        }
        setIsLoading(true);
        setError(null);
        setSuccessMessage(null);
        try {
            console.log(`Promoting user ${userId} to ${newRole} role`);
            const { error } = await supabase
                .from('profiles')
                .update({ role: newRole })
                .eq('id', userId);
            if (error)
                throw error;
            setSuccessMessage(`User role updated to ${newRole} successfully!`);
            fetchUserProfiles();
        }
        catch (err) {
            console.error('Failed to update user role:', err);
            setError('Failed to update user role.');
        }
        finally {
            setIsLoading(false);
        }
    };
    useEffect(() => {
        if (!authLoading) {
            console.log('Auth loading complete, checking permissions...');
            if (isPastor()) {
                console.log('User has pastor/admin privileges, fetching data...');
                fetchCharacters();
                if (activeTab === 'users' && isAdmin()) {
                    fetchUserProfiles();
                }
            }
            else {
                console.log('User lacks pastor/admin privileges, redirecting...');
                navigate('/access-denied');
            }
        }
    }, [authLoading, isPastor, isAdmin, fetchCharacters, fetchUserProfiles, activeTab, navigate]);
    useEffect(() => {
        if (activeTab === 'characters') {
            fetchCharacters();
        }
        else if (activeTab === 'users' && isAdmin()) {
            fetchUserProfiles();
        }
    }, [activeTab, fetchCharacters, fetchUserProfiles, isAdmin]);
    if (authLoading) {
        return (_jsx("div", { className: "flex items-center justify-center min-h-screen", children: _jsx("div", { className: "animate-spin rounded-full h-12 w-12 border-b-2 border-primary-500" }) }));
    }
    if (!isPastor()) {
        console.log('isPastor() check failed, redirecting to access denied');
        navigate('/access-denied');
        return null;
    }
    const handleCSVUpload = async (event) => {
        const file = event.target.files?.[0];
        if (!file)
            return;
        setIsLoading(true);
        setError(null);
        setSuccessMessage(null);
        try {
            const text = await file.text();
            const parsedData = parseCSV(text);
            const charactersToCreate = parsedData.map(row => ({
                name: row.character_name || '',
                avatar_url: row.avatar_url || '',
                feature_image_url: row.feature_image_url || '',
                short_biography: row.short_biography || '',
                bible_book: row.bible_book || '',
                opening_line: row.opening_sentence || '',
                persona_prompt: row.persona_prompt || '',
                scriptural_context: row.scriptural_context || '',
                description: row.description || '',
                is_visible: row.is_visible ? row.is_visible.toLowerCase() === 'true' : true,
                timeline_period: row.timeline_period || '',
                historical_context: row.historical_context || '',
                geographic_location: row.geographic_location || '',
                key_scripture_references: row.key_scripture_references || '',
                theological_significance: row.theological_significance || '',
                relationships: tryParseJson(row.relationships) || {},
                study_questions: row.study_questions || '',
            })).filter(char => char.name && char.persona_prompt);
            if (charactersToCreate.length === 0) {
                throw new Error('No valid characters found in CSV. Ensure headers and data are correct.');
            }
            await characterRepository.bulkCreateCharacters(charactersToCreate);
            setSuccessMessage(`Successfully uploaded ${charactersToCreate.length} characters.`);
            fetchCharacters();
        }
        catch (err) {
            console.error('CSV upload error:', err);
            setError(err instanceof Error ? err.message : 'Failed to upload CSV.');
        }
        finally {
            setIsLoading(false);
        }
    };
    const handleFormSubmit = async (event) => {
        event.preventDefault();
        setIsLoading(true);
        setError(null);
        setSuccessMessage(null);
        const characterData = {
            name: formName,
            avatar_url: formAvatarUrl,
            feature_image_url: formFeatureImageUrl,
            short_biography: formShortBiography,
            bible_book: formBibleBook,
            opening_line: formOpeningSentence,
            persona_prompt: formPersonaPrompt,
            scriptural_context: formScripturalContext,
            description: formDescription,
            is_visible: formIsVisible,
            timeline_period: formTimelinePeriod,
            historical_context: formHistoricalContext,
            geographic_location: formGeographicLocation,
            key_scripture_references: formKeyScriptureRefs,
            theological_significance: formTheologicalSignificance,
            relationships: tryParseJson(formRelationships),
            study_questions: formStudyQuestions,
        };
        try {
            if (editingCharacterId) {
                await characterRepository.updateCharacter(editingCharacterId, characterData);
                setSuccessMessage('Character updated successfully!');
            }
            else {
                await characterRepository.createCharacter(characterData);
                setSuccessMessage('Character created successfully!');
            }
            resetForm();
            fetchCharacters();
        }
        catch (err) {
            console.error('Character form submission error:', err);
            setError(err instanceof Error ? err.message : 'Failed to save character.');
        }
        finally {
            setIsLoading(false);
        }
    };
    const handleEditCharacter = (character) => {
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
        setFormIsVisible(character.is_visible ?? true);
        setFormTimelinePeriod(character.timeline_period || '');
        setFormHistoricalContext(character.historical_context || '');
        setFormGeographicLocation(character.geographic_location || '');
        setFormKeyScriptureRefs(character.key_scripture_references || '');
        setFormTheologicalSignificance(character.theological_significance || '');
        setFormRelationships(character.relationships ? JSON.stringify(character.relationships, null, 2) : '');
        setFormStudyQuestions(character.study_questions || '');
    };
    const handleDeleteCharacter = async (id) => {
        if (!window.confirm('Are you sure you want to delete this character? This action cannot be undone.')) {
            return;
        }
        setIsLoading(true);
        setError(null);
        setSuccessMessage(null);
        try {
            await characterRepository.deleteCharacter(id);
            setSuccessMessage('Character deleted successfully!');
            fetchCharacters();
        }
        catch (err) {
            console.error('Character deletion error:', err);
            setError(err instanceof Error ? err.message : 'Failed to delete character.');
        }
        finally {
            setIsLoading(false);
        }
    };
    const handleToggleVisibility = async (character) => {
        setIsLoading(true);
        setError(null);
        setSuccessMessage(null);
        try {
            const newVisibility = !(character.is_visible ?? true);
            await characterRepository.updateCharacter(character.id, { is_visible: newVisibility });
            setSuccessMessage(`Character '${character.name}' visibility updated to ${newVisibility ? 'visible' : 'hidden'}.`);
            fetchCharacters();
        }
        catch (err) {
            console.error('Character visibility toggle error:', err);
            setError(err instanceof Error ? err.message : 'Failed to toggle character visibility.');
        }
        finally {
            setIsLoading(false);
        }
    };
    const filteredCharacters = characters.filter(char => char.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        char.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (char.short_biography && char.short_biography.toLowerCase().includes(searchQuery.toLowerCase())) ||
        (char.bible_book && char.bible_book.toLowerCase().includes(searchQuery.toLowerCase())));
    return (_jsxs("div", { className: "container mx-auto px-4 py-8", children: [_jsx("h1", { className: "text-3xl font-bold text-gray-900 mb-6", children: "Admin Panel" }), _jsxs("div", { className: "flex flex-col md:flex-row justify-between items-start md:items-center mb-4", children: [_jsxs("p", { className: "text-gray-700 mb-2 md:mb-0", children: ["Welcome, ", user?.email, "! Your role: ", _jsx("span", { className: "font-semibold capitalize", children: role })] }), _jsxs("div", { className: "flex space-x-2", children: [_jsx("button", { onClick: handleRefreshProfile, className: "px-3 py-1 bg-blue-100 text-blue-700 rounded hover:bg-blue-200 text-sm", children: "Refresh Profile" }), _jsx("button", { onClick: () => setShowDebugInfo(!showDebugInfo), className: "px-3 py-1 bg-gray-100 text-gray-700 rounded hover:bg-gray-200 text-sm", children: showDebugInfo ? 'Hide Debug' : 'Show Debug' })] })] }), showDebugInfo && (_jsxs("div", { className: "mb-6 p-4 bg-gray-100 rounded-lg text-sm", children: [_jsx("h3", { className: "font-medium mb-2", children: "Authentication Debug Info" }), _jsxs("div", { className: "grid grid-cols-2 gap-2", children: [_jsxs("div", { children: [_jsx("span", { className: "font-medium", children: "User ID:" }), " ", user?.id || 'Not logged in'] }), _jsxs("div", { children: [_jsx("span", { className: "font-medium", children: "Email:" }), " ", user?.email || 'N/A'] }), _jsxs("div", { children: [_jsx("span", { className: "font-medium", children: "Role:" }), " ", role] }), _jsxs("div", { children: [_jsx("span", { className: "font-medium", children: "Is Admin:" }), " ", isAdmin() ? 'Yes' : 'No'] }), _jsxs("div", { children: [_jsx("span", { className: "font-medium", children: "Is Pastor:" }), " ", isPastor() ? 'Yes' : 'No'] }), _jsxs("div", { children: [_jsx("span", { className: "font-medium", children: "Auth Loading:" }), " ", authLoading ? 'Yes' : 'No'] })] })] })), _jsx("div", { className: "mb-8 border-b border-gray-200", children: _jsxs("nav", { className: "-mb-px flex space-x-8", "aria-label": "Admin Tabs", children: [_jsx("button", { onClick: () => setActiveTab('characters'), className: `whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm ${activeTab === 'characters'
                                ? 'border-primary-500 text-primary-600'
                                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'}`, children: "Characters" }), _jsx("button", { onClick: () => setActiveTab('groups'), className: `whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm ${activeTab === 'groups'
                                ? 'border-primary-500 text-primary-600'
                                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'}`, children: "Groups" }), isAdmin() && (_jsx("button", { onClick: () => setActiveTab('users'), className: `whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm ${activeTab === 'users'
                                ? 'border-primary-500 text-primary-600'
                                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'}`, children: "User Management" }))] }) }), isLoading && (_jsx("div", { className: "mb-4 p-3 bg-blue-100 text-blue-700 rounded", children: "Loading..." })), error && (_jsxs("div", { className: "mb-4 p-3 bg-red-100 text-red-700 rounded", children: ["Error: ", error] })), successMessage && (_jsxs("div", { className: "mb-4 p-3 bg-green-100 text-green-700 rounded", children: ["Success: ", successMessage] })), activeTab === 'characters' && (_jsxs(_Fragment, { children: [_jsxs("section", { className: "mb-8 p-6 bg-white rounded-lg shadow-md", children: [_jsx("h2", { className: "text-2xl font-semibold text-gray-800 mb-4", children: "Bulk Upload Characters (CSV)" }), _jsx("p", { className: "text-gray-600 mb-4", children: "Upload a CSV file to add or update multiple characters. Expected fields: `character_name`, `avatar_url`, `feature_image_url`, `short_biography`, `bible_book`, `opening_sentence`, `persona_prompt`, `scriptural_context`, `description`, `is_visible` (true/false). For Character Insights, also include: `timeline_period`, `historical_context`, `geographic_location`, `key_scripture_references`, `theological_significance`, `relationships` (JSON string), `study_questions`." }), _jsx("input", { type: "file", accept: ".csv", onChange: handleCSVUpload, disabled: isLoading, className: "block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-primary-50 file:text-primary-700 hover:file:bg-primary-100" })] }), _jsxs("section", { className: "p-6 bg-white rounded-lg shadow-md mb-8", children: [_jsx("h2", { className: "text-2xl font-semibold text-gray-800 mb-4", children: editingCharacterId ? 'Edit Character' : 'Create New Character' }), _jsxs("form", { onSubmit: handleFormSubmit, className: "space-y-4", children: [_jsxs("div", { children: [_jsx("label", { htmlFor: "name", className: "block text-sm font-medium text-gray-700", children: "Character Name" }), _jsx("input", { type: "text", id: "name", value: formName, onChange: (e) => setFormName(e.target.value), required: true, className: "mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500" })] }), _jsxs("div", { children: [_jsx("label", { htmlFor: "avatar_url", className: "block text-sm font-medium text-gray-700", children: "Avatar URL" }), _jsx("input", { type: "url", id: "avatar_url", value: formAvatarUrl, onChange: (e) => setFormAvatarUrl(e.target.value), className: "mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500" })] }), _jsxs("div", { children: [_jsx("label", { htmlFor: "feature_image_url", className: "block text-sm font-medium text-gray-700", children: "Feature Image URL" }), _jsx("input", { type: "url", id: "feature_image_url", value: formFeatureImageUrl, onChange: (e) => setFormFeatureImageUrl(e.target.value), className: "mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500" })] }), _jsxs("div", { children: [_jsx("label", { htmlFor: "short_biography", className: "block text-sm font-medium text-gray-700", children: "Short Biography" }), _jsx("textarea", { id: "short_biography", rows: 3, value: formShortBiography, onChange: (e) => setFormShortBiography(e.target.value), className: "mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500" })] }), _jsxs("div", { children: [_jsx("label", { htmlFor: "description", className: "block text-sm font-medium text-gray-700", children: "Description (for character card)" }), _jsx("textarea", { id: "description", rows: 3, value: formDescription, onChange: (e) => setFormDescription(e.target.value), required: true, className: "mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500" })] }), _jsxs("div", { children: [_jsx("label", { htmlFor: "bible_book", className: "block text-sm font-medium text-gray-700", children: "Bible Book" }), _jsx("input", { type: "text", id: "bible_book", value: formBibleBook, onChange: (e) => setFormBibleBook(e.target.value), className: "mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500" })] }), _jsxs("div", { children: [_jsx("label", { htmlFor: "opening_sentence", className: "block text-sm font-medium text-gray-700", children: "Opening Sentence" }), _jsx("textarea", { id: "opening_sentence", rows: 2, value: formOpeningSentence, onChange: (e) => setFormOpeningSentence(e.target.value), className: "mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500" })] }), _jsxs("div", { children: [_jsx("label", { htmlFor: "persona_prompt", className: "block text-sm font-medium text-gray-700", children: "Persona Prompt" }), _jsx("textarea", { id: "persona_prompt", rows: 5, value: formPersonaPrompt, onChange: (e) => setFormPersonaPrompt(e.target.value), required: true, className: "mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500" })] }), _jsxs("div", { children: [_jsx("label", { htmlFor: "scriptural_context", className: "block text-sm font-medium text-gray-700", children: "Scriptural Context" }), _jsx("textarea", { id: "scriptural_context", rows: 3, value: formScripturalContext, onChange: (e) => setFormScripturalContext(e.target.value), className: "mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500" })] }), _jsxs("div", { className: "flex items-center", children: [_jsx("input", { type: "checkbox", id: "is_visible", checked: formIsVisible, onChange: (e) => setFormIsVisible(e.target.checked), className: "h-4 w-4 text-primary-600 focus:ring-primary-500 border-gray-300 rounded" }), _jsx("label", { htmlFor: "is_visible", className: "ml-2 block text-sm font-medium text-gray-700", children: "Is Visible to Users" })] }), _jsxs("div", { className: "mt-6 border-t border-gray-300 pt-6", children: [_jsx("h3", { className: "text-xl font-semibold text-gray-800 mb-4", children: "Character Insights" }), _jsxs("div", { className: "space-y-4", children: [_jsxs("div", { children: [_jsx("label", { htmlFor: "timeline_period", className: "block text-sm font-medium text-gray-700", children: "Time Period" }), _jsx("input", { type: "text", id: "timeline_period", value: formTimelinePeriod, onChange: (e) => setFormTimelinePeriod(e.target.value), className: "mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500" })] }), _jsxs("div", { children: [_jsx("label", { htmlFor: "historical_context", className: "block text-sm font-medium text-gray-700", children: "Historical Context" }), _jsx("textarea", { id: "historical_context", rows: 3, value: formHistoricalContext, onChange: (e) => setFormHistoricalContext(e.target.value), className: "mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500" })] }), _jsxs("div", { children: [_jsx("label", { htmlFor: "geographic_location", className: "block text-sm font-medium text-gray-700", children: "Geographic Location" }), _jsx("input", { type: "text", id: "geographic_location", value: formGeographicLocation, onChange: (e) => setFormGeographicLocation(e.target.value), className: "mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500" })] }), _jsxs("div", { children: [_jsx("label", { htmlFor: "key_scripture_references", className: "block text-sm font-medium text-gray-700", children: "Key Scripture References (comma or semicolon separated)" }), _jsx("textarea", { id: "key_scripture_references", rows: 3, value: formKeyScriptureRefs, onChange: (e) => setFormKeyScriptureRefs(e.target.value), className: "mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500" })] }), _jsxs("div", { children: [_jsx("label", { htmlFor: "theological_significance", className: "block text-sm font-medium text-gray-700", children: "Theological Significance" }), _jsx("textarea", { id: "theological_significance", rows: 3, value: formTheologicalSignificance, onChange: (e) => setFormTheologicalSignificance(e.target.value), className: "mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500" })] }), _jsxs("div", { children: [_jsxs("label", { htmlFor: "relationships", className: "block text-sm font-medium text-gray-700", children: ["Relationships (JSON string, e.g., ", '{\"parents\":[\"Jacob\",\"Rachel\"]}', ")"] }), _jsx("textarea", { id: "relationships", rows: 5, value: formRelationships, onChange: (e) => setFormRelationships(e.target.value), className: "mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500" })] }), _jsxs("div", { children: [_jsx("label", { htmlFor: "study_questions", className: "block text-sm font-medium text-gray-700", children: "Study Questions (one per line)" }), _jsx("textarea", { id: "study_questions", rows: 5, value: formStudyQuestions, onChange: (e) => setFormStudyQuestions(e.target.value), className: "mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500" })] })] })] }), _jsxs("div", { className: "flex space-x-4", children: [_jsx("button", { type: "submit", disabled: isLoading, className: "px-4 py-2 bg-primary-600 text-white rounded-md hover:bg-primary-700 disabled:bg-gray-400", children: isLoading ? 'Saving...' : editingCharacterId ? 'Update Character' : 'Create Character' }), editingCharacterId && (_jsx("button", { type: "button", onClick: resetForm, className: "px-4 py-2 bg-gray-200 text-gray-700 rounded-md hover:bg-gray-300", children: "Cancel Edit" }))] })] })] }), _jsxs("section", { className: "p-6 bg-white rounded-lg shadow-md", children: [_jsx("h2", { className: "text-2xl font-semibold text-gray-800 mb-4", children: "Existing Characters" }), _jsxs("div", { className: "mb-6", children: [_jsx("label", { htmlFor: "search", className: "block text-sm font-medium text-gray-700 mb-1", children: "Search Characters" }), _jsx("input", { type: "text", id: "search", placeholder: "Search by name, description, or bible book...", value: searchQuery, onChange: (e) => setSearchQuery(e.target.value), className: "block w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500" })] }), filteredCharacters.length === 0 ? (_jsx("p", { className: "text-gray-500 italic", children: "No characters found." })) : (_jsx("div", { className: "overflow-x-auto", children: _jsxs("table", { className: "min-w-full divide-y divide-gray-200", children: [_jsx("thead", { className: "bg-gray-50", children: _jsxs("tr", { children: [_jsx("th", { scope: "col", className: "px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider", children: "Name" }), _jsx("th", { scope: "col", className: "px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider", children: "Description" }), _jsx("th", { scope: "col", className: "px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider", children: "Bible Book" }), _jsx("th", { scope: "col", className: "px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider", children: "Visibility" }), _jsx("th", { scope: "col", className: "px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider", children: "Actions" })] }) }), _jsx("tbody", { className: "bg-white divide-y divide-gray-200", children: filteredCharacters.map((character) => (_jsxs("tr", { children: [_jsx("td", { className: "px-6 py-4 whitespace-nowrap", children: _jsxs("div", { className: "flex items-center", children: [character.avatar_url && (_jsx("img", { src: character.avatar_url, alt: character.name, className: "h-10 w-10 rounded-full mr-2 object-cover", onError: (e) => {
                                                                        e.target.src = `https://ui-avatars.com/api/?name=${encodeURIComponent(character.name)}&background=random`;
                                                                    } })), _jsx("div", { className: "text-sm font-medium text-gray-900", children: character.name })] }) }), _jsx("td", { className: "px-6 py-4", children: _jsx("div", { className: "text-sm text-gray-500 truncate max-w-xs", children: character.description }) }), _jsx("td", { className: "px-6 py-4 whitespace-nowrap", children: _jsx("div", { className: "text-sm text-gray-500", children: character.bible_book || '-' }) }), _jsx("td", { className: "px-6 py-4 whitespace-nowrap", children: _jsx("button", { onClick: () => handleToggleVisibility(character), className: `px-3 py-1 rounded-full text-xs font-semibold ${(character.is_visible ?? true)
                                                                ? 'bg-green-100 text-green-800'
                                                                : 'bg-red-100 text-red-800'} hover:opacity-75 transition-opacity`, children: (character.is_visible ?? true) ? 'Visible' : 'Hidden' }) }), _jsxs("td", { className: "px-6 py-4 whitespace-nowrap text-right text-sm font-medium", children: [_jsx("button", { onClick: () => handleEditCharacter(character), className: "text-primary-600 hover:text-primary-900 mr-4", children: "Edit" }), _jsx("button", { onClick: () => handleDeleteCharacter(character.id), className: "text-red-600 hover:text-red-900", children: "Delete" })] })] }, character.id))) })] }) }))] })] })), activeTab === 'groups' && (_jsx(GroupManagement, {})), activeTab === 'users' && isAdmin() && (_jsxs("section", { className: "p-6 bg-white rounded-lg shadow-md", children: [_jsx("h2", { className: "text-2xl font-semibold text-gray-800 mb-4", children: "User Management" }), _jsx("p", { className: "text-gray-600 mb-6", children: "As an administrator, you can view all users and promote regular users to the \"pastor\" role. Pastors can manage characters and groups but cannot manage other users." }), userProfiles.length === 0 ? (_jsx("p", { className: "text-gray-500 italic", children: "No users found." })) : (_jsx("div", { className: "overflow-x-auto", children: _jsxs("table", { className: "min-w-full divide-y divide-gray-200", children: [_jsx("thead", { className: "bg-gray-50", children: _jsxs("tr", { children: [_jsx("th", { scope: "col", className: "px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider", children: "Email" }), _jsx("th", { scope: "col", className: "px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider", children: "Display Name" }), _jsx("th", { scope: "col", className: "px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider", children: "Role" }), _jsx("th", { scope: "col", className: "px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider", children: "Created" }), _jsx("th", { scope: "col", className: "px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider", children: "Actions" })] }) }), _jsx("tbody", { className: "bg-white divide-y divide-gray-200", children: userProfiles.map((profile) => (_jsxs("tr", { children: [_jsx("td", { className: "px-6 py-4 whitespace-nowrap", children: _jsx("div", { className: "text-sm font-medium text-gray-900", children: profile.email }) }), _jsx("td", { className: "px-6 py-4 whitespace-nowrap", children: _jsx("div", { className: "text-sm text-gray-500", children: profile.display_name || '-' }) }), _jsx("td", { className: "px-6 py-4 whitespace-nowrap", children: _jsx("span", { className: `px-3 py-1 rounded-full text-xs font-semibold ${profile.role === 'admin'
                                                        ? 'bg-purple-100 text-purple-800'
                                                        : profile.role === 'pastor'
                                                            ? 'bg-blue-100 text-blue-800'
                                                            : 'bg-gray-100 text-gray-800'}`, children: profile.role }) }), _jsx("td", { className: "px-6 py-4 whitespace-nowrap", children: _jsx("div", { className: "text-sm text-gray-500", children: new Date(profile.created_at).toLocaleDateString() }) }), _jsxs("td", { className: "px-6 py-4 whitespace-nowrap text-sm font-medium", children: [profile.role === 'user' && (_jsx("button", { onClick: () => handlePromoteUser(profile.id, 'pastor'), className: "text-blue-600 hover:text-blue-900 mr-4", children: "Promote to Pastor" })), profile.role === 'pastor' && (_jsx("button", { onClick: () => handlePromoteUser(profile.id, 'user'), className: "text-gray-600 hover:text-gray-900", children: "Demote to User" })), profile.role === 'admin' && (_jsx("span", { className: "text-gray-400", children: "Admin (cannot modify)" }))] })] }, profile.id))) })] }) }))] }))] }));
};
export default SecureAdminPage;
