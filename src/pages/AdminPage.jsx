import { jsx as _jsx, jsxs as _jsxs, Fragment as _Fragment } from "react/jsx-runtime";
import { useState, useEffect, useCallback } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { characterRepository } from '../repositories/characterRepository';
import GroupManagement from '../components/admin/GroupManagement';
import AdminFAQEditor from '../components/admin/AdminFAQEditor';
import AdminFeaturedCharacter from '../components/admin/AdminFeaturedCharacter';
import AdminFavorites from '../components/admin/AdminFavorites';
import AccountTierManagement from '../components/admin/AccountTierManagement';
import AdminStudiesPage from './admin/AdminStudiesPage';
import AdminSeriesPage from './admin/AdminSeriesPage.jsx';
// Robust CSV utilities (handles quoted commas/newlines, escaped quotes, etc.)
import { parseCSV, tryParseJson } from '../utils/csvParser';
const AdminPage = () => {
    const { user, isSuperadmin } = useAuth();
    const bypassAuth = typeof window !== 'undefined' &&
        localStorage.getItem('bypass_auth') === 'true';
    const isAdmin = true;
    const [characters, setCharacters] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState(null);
    const [successMessage, setSuccessMessage] = useState(null);
    const [searchQuery, setSearchQuery] = useState('');
    const [activeTab, setActiveTab] = useState('characters');
    const [editingCharacterId, setEditingCharacterId] = useState(null);
    // New state for selected characters
    const [selectedCharacters, setSelectedCharacters] = useState([]);
    const [formName, setFormName] = useState('');
    const [formAvatarUrl, setFormAvatarUrl] = useState('');
    const [formFeatureImageUrl, setFormFeatureImageUrl] = useState('');
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
    const resetForm = useCallback(() => {
        setEditingCharacterId(null);
        setFormName('');
        setFormAvatarUrl('');
        setFormFeatureImageUrl('');
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
            // Clear selected characters when fetching new data
            setSelectedCharacters([]);
        }
        catch (err) {
            console.error('Failed to fetch characters:', err);
            setError('Failed to load characters.');
        }
        finally {
            setIsLoading(false);
        }
    }, []);
    useEffect(() => {
        if (isAdmin)
            fetchCharacters();
    }, [isAdmin, fetchCharacters]);
    if (!isAdmin) {
        return (_jsx("div", { className: "flex h-full w-full items-center justify-center bg-red-50 p-4", children: _jsxs("div", { className: "text-center", children: [_jsx("h2", { className: "text-2xl font-bold text-red-800 mb-4", children: "Access Denied" }), _jsx("p", { className: "text-red-700", children: "You do not have administrative privileges to view this page." })] }) }));
    }
    // Function to handle select all checkbox
    const handleSelectAll = (e) => {
        if (e.target.checked) {
            // Select all filtered characters
            setSelectedCharacters(filteredCharacters.map(char => char.id));
        } else {
            // Deselect all
            setSelectedCharacters([]);
        }
    };

    // Function to handle individual character selection
    const handleSelectCharacter = (id) => {
        setSelectedCharacters(prev => {
            if (prev.includes(id)) {
                return prev.filter(charId => charId !== id);
            } else {
                return [...prev, id];
            }
        });
    };

    // Function to delete selected characters
    const handleDeleteSelected = async () => {
        if (selectedCharacters.length === 0) {
            return;
        }

        if (!window.confirm(`Are you sure you want to delete ${selectedCharacters.length} character(s)? This action cannot be undone.`)) {
            return;
        }

        setIsLoading(true);
        setError(null);
        setSuccessMessage(null);

        try {
            // Delete each selected character
            for (const id of selectedCharacters) {
                await characterRepository.deleteCharacter(id);
            }
            
            setSuccessMessage(`Successfully deleted ${selectedCharacters.length} character(s).`);
            setSelectedCharacters([]);
            fetchCharacters();
        } catch (err) {
            console.error('Bulk character deletion error:', err);
            setError(err instanceof Error ? err.message : 'Failed to delete selected characters.');
        } finally {
            setIsLoading(false);
        }
    };

    // Function to export characters to CSV
    const exportCharactersToCSV = () => {
        // Define CSV columns in the order we want them
        const columns = [
            'name',
            'description',
            'persona_prompt',
            'opening_line',
            'avatar_url',
            'feature_image_url',
            'is_visible',
            'testament',
            'bible_book',
            'timeline_period',
            'historical_context',
            'geographic_location',
            'key_scripture_references',
            'theological_significance',
            'relationships',
            'study_questions',
            'scriptural_context'
        ];

        // Helper function to escape CSV values
        const escapeCSV = (value) => {
            if (value === null || value === undefined) {
                return '';
            }
            
            // Convert objects (like relationships) to JSON strings
            if (typeof value === 'object') {
                value = JSON.stringify(value);
            }
            
            // Convert to string
            const stringValue = String(value);
            
            // Check if we need to escape this value
            const needsEscaping = stringValue.includes('"') || 
                                 stringValue.includes(',') || 
                                 stringValue.includes('\n') ||
                                 stringValue.includes('\r');
            
            if (needsEscaping) {
                // Double up any quotes and wrap in quotes
                return `"${stringValue.replace(/"/g, '""')}"`;
            }
            
            return stringValue;
        };

        // Create header row
        let csv = columns.join(',') + '\n';
        
        // Add data rows
        for (const character of characters) {
            const row = columns.map(column => escapeCSV(character[column]));
            csv += row.join(',') + '\n';
        }
        
        // Create download link
        const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
        const url = URL.createObjectURL(blob);
        const link = document.createElement('a');
        
        // Generate filename with current date
        const date = new Date().toISOString().slice(0, 10); // YYYY-MM-DD
        link.setAttribute('href', url);
        link.setAttribute('download', `bible-characters-export-${date}.csv`);
        
        // Trigger download
        document.body.appendChild(link);
        link.click();
        
        // Clean up
        document.body.removeChild(link);
        URL.revokeObjectURL(url);
    };

    const handleCSVUpload = async (event) => {
        const file = event.target.files?.[0];
        if (!file)
            return;
        setIsLoading(true);
        setError(null);
        setSuccessMessage(null);
        try {
            const text = await file.text();
            // ---- DEBUG START -------------------------------------------------
            console.groupCollapsed(
                `%c[AdminPage] handleCSVUpload – START (${file.name})`,
                'color: #2563eb; font-weight:bold;'
            );
            const parsedData = parseCSV(text);
            console.debug('[AdminPage] Raw parsed rows:', parsedData);
            const charactersToCreate = parsedData.map(row => ({
                // prefer new header `name`, fall back to legacy `character_name`
                name: row.name || row.character_name || '',
                avatar_url: row.avatar_url || '',
                feature_image_url: row.feature_image_url || '',
                bible_book: row.bible_book || '',
                // prefer `opening_line` (DB schema) but also allow legacy `opening_sentence`
                opening_line: row.opening_line || row.opening_sentence || '',
                persona_prompt: row.persona_prompt || '',
                scriptural_context: row.scriptural_context || '',
                description: row.description || '',
                is_visible: row.is_visible ? row.is_visible.toLowerCase() === 'true' : true,
                // testament column is REQUIRED by DB (`old` | `new`). Default to `new` if not provided.
                testament: (row.testament || 'new').toLowerCase() === 'old' ? 'old' : 'new',
                timeline_period: row.timeline_period || '',
                historical_context: row.historical_context || '',
                geographic_location: row.geographic_location || '',
                key_scripture_references: row.key_scripture_references || '',
                theological_significance: row.theological_significance || '',
                relationships: tryParseJson(row.relationships) || {},
                study_questions: row.study_questions || '',
            })).filter(char => char.name && char.persona_prompt);

            // Debug: log the characters that will be created
            console.debug(
                `[AdminPage] Prepared ${charactersToCreate.length} character object(s):`,
                charactersToCreate
            );

            /* ------------------------------------------------------------------
             * Additional validations / warnings
             * ------------------------------------------------------------------ */
            charactersToCreate.forEach(c => {
                /* Validate testament field */
                if (c.testament !== 'new' && c.testament !== 'old') {
                    // eslint-disable-next-line no-console
                    console.warn(
                        `[AdminPage] Invalid testament "${c.testament}" for "${c.name}". ` +
                        'Coercing to "new".'
                    );
                    c.testament = 'new';
                }
            });

            if (charactersToCreate.length === 0) {
                throw new Error('No valid characters found in CSV. Ensure headers and data are correct.');
            }
            console.debug('[AdminPage] Calling bulkCreateCharacters…');
            const created = await characterRepository.bulkCreateCharacters(charactersToCreate);
            console.debug('[AdminPage] bulkCreateCharacters result:', created);
            setSuccessMessage(`Successfully uploaded ${charactersToCreate.length} characters.`);
            fetchCharacters();
            console.groupEnd(); // DEBUG group END
        }
        catch (err) {
            /* Provide richer diagnostics in the dev-console while surfacing a friendly UI message */
            // eslint-disable-next-line no-console
            console.error('CSV upload error (raw object):', err);
            const friendly =
                err && typeof err === 'object' && ('message' in err)
                    ? err.message
                    : 'Failed to upload CSV.';
            setError(friendly);
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
        (char.bible_book && char.bible_book.toLowerCase().includes(searchQuery.toLowerCase())));
    return (_jsxs("div", { className: "container mx-auto px-4 pt-24 pb-8", children: [_jsx("h1", { className: "text-3xl font-bold text-gray-900 mb-6", children: "Admin Panel - Character Management" }), _jsx("p", { className: "text-gray-700 mb-4", children: "Welcome, Admin! Here you can manage Bible characters." }), 
        isSuperadmin && (_jsx("div", { className: "mb-6", children: _jsx(Link, { to: "/admin/users", className: "inline-flex items-center rounded-md bg-amber-500 px-4 py-2 text-white hover:bg-amber-600", children: "Superadmin: Manage Users & Organizations" }) })), 
        
        <div className="mb-8 border-b border-gray-200">
          <nav className="-mb-px flex space-x-8" aria-label="Admin Tabs">
            <button onClick={() => setActiveTab('characters')} className={`whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm ${activeTab === 'characters' ? 'border-primary-500 text-primary-600' : 'border-transparent text-gray-900 hover:text-gray-900 hover:border-gray-300'}`}>Characters</button>
            <button onClick={() => setActiveTab('groups')} className={`whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm ${activeTab === 'groups' ? 'border-primary-500 text-primary-600' : 'border-transparent text-gray-900 hover:text-gray-900 hover:border-gray-300'}`}>Groups</button>
            <button onClick={() => setActiveTab('featured')} className={`whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm ${activeTab === 'featured' ? 'border-primary-500 text-primary-600' : 'border-transparent text-gray-900 hover:text-gray-900 hover:border-gray-300'}`}>Featured Character</button>
            <button onClick={() => setActiveTab('favorites')} className={`whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm ${activeTab === 'favorites' ? 'border-primary-500 text-primary-600' : 'border-transparent text-gray-900 hover:text-gray-900 hover:border-gray-300'}`}>User Favorites</button>
            <button onClick={() => setActiveTab('faq')} className={`whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm ${activeTab === 'faq' ? 'border-primary-500 text-primary-600' : 'border-transparent text-gray-900 hover:text-gray-900 hover:border-gray-300'}`}>FAQ Editor</button>
            <button onClick={() => setActiveTab('studies')} className={`whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm ${activeTab === 'studies' ? 'border-primary-500 text-primary-600' : 'border-transparent text-gray-900 hover:text-gray-900 hover:border-gray-300'}`}>Bible Studies</button>
            <button onClick={() => setActiveTab('series')} className={`whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm ${activeTab === 'series' ? 'border-primary-500 text-primary-600' : 'border-transparent text-gray-900 hover:text-gray-900 hover:border-gray-300'}`}>Study Series</button>
            <button onClick={() => setActiveTab('roundtable')} className={`whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm ${activeTab === 'roundtable' ? 'border-primary-500 text-primary-600' : 'border-transparent text-gray-900 hover:text-gray-900 hover:border-gray-300'}`}>Roundtable</button>
            <button onClick={() => setActiveTab('accountTiers')} className={`whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm ${activeTab === 'accountTiers' ? 'border-primary-500 text-primary-600' : 'border-transparent text-gray-900 hover:text-gray-900 hover:border-gray-300'}`}>Account Tiers</button>
          </nav>
        </div>,
        
                                    onClick: exportCharactersToCSV, 
                                    className: "px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 flex items-center", 
                                    title: "Export all characters to CSV file",
                                    disabled: characters.length === 0,
                                    children: "Export to CSV"
                                }), _jsx("button", { 
                                    onClick: handleDeleteSelected, 
                                    className: `px-4 py-2 ${selectedCharacters.length > 0 ? 'bg-red-600 hover:bg-red-700' : 'bg-gray-400 cursor-not-allowed'} text-white rounded-md flex items-center`, 
                                    disabled: selectedCharacters.length === 0 || isLoading,
                                    children: `Delete Selected (${selectedCharacters.length})`
                                })] })] }), filteredCharacters.length === 0 ? (_jsx("p", { className: "text-gray-500 italic", children: "No characters found." })) : (_jsx("div", { className: "overflow-x-auto", children: _jsxs("table", { className: "min-w-full divide-y divide-gray-200", children: [_jsx("thead", { className: "bg-gray-50", children: _jsxs("tr", { children: [_jsx("th", { scope: "col", className: "px-3 py-3 text-left", children: _jsxs("div", { className: "flex items-center", children: [_jsx("input", { 
                                                    type: "checkbox", 
                                                    checked: filteredCharacters.length > 0 && selectedCharacters.length === filteredCharacters.length,
                                                    onChange: handleSelectAll,
                                                    className: "h-4 w-4 text-primary-600 focus:ring-primary-500 border-gray-300 rounded"
                                                }), _jsx("span", { className: "ml-2 text-xs font-medium text-gray-900 uppercase tracking-wider", children: "Select" })] }) }), _jsx("th", { scope: "col", className: "px-6 py-3 text-left text-xs font-medium text-gray-900 uppercase tracking-wider", children: "Name" }), _jsx("th", { scope: "col", className: "px-6 py-3 text-left text-xs font-medium text-gray-900 uppercase tracking-wider", children: "Description" }), _jsx("th", { scope: "col", className: "px-6 py-3 text-left text-xs font-medium text-gray-900 uppercase tracking-wider", children: "Bible Book" }), _jsx("th", { scope: "col", className: "px-6 py-3 text-left text-xs font-medium text-gray-900 uppercase tracking-wider", children: "Visibility" }), _jsx("th", { scope: "col", className: "px-6 py-3 text-left text-xs font-medium text-gray-900 uppercase tracking-wider", children: "Actions" })] }) }), _jsx("tbody", { className: "bg-white divide-y divide-gray-200", children: filteredCharacters.map((character) => (_jsxs("tr", { 
                                        className: selectedCharacters.includes(character.id) ? "bg-blue-50" : "",
                                        children: [
                                        _jsx("td", { className: "px-3 py-4", children: _jsx("input", { 
                                            type: "checkbox", 
                                            checked: selectedCharacters.includes(character.id),
                                            onChange: () => handleSelectCharacter(character.id),
                                            className: "h-4 w-4 text-primary-600 focus:ring-primary-500 border-gray-300 rounded"
                                        }) }),
                                        _jsx("td", { className: "px-6 py-4 whitespace-nowrap", children: _jsxs("div", { className: "flex items-center", children: [character.avatar_url && (_jsx("img", { src: character.avatar_url, alt: character.name, className: "h-10 w-10 rounded-full mr-2 object-cover", onError: (e) => {
                                                                        e.target.src = `https://ui-avatars.com/api/?name=${encodeURIComponent(character.name)}&background=random`;
                                                                    } })), _jsx("div", { className: "text-sm font-medium text-gray-900", children: character.name })] }) }), _jsx("td", { className: "px-6 py-4", children: _jsx("div", { className: "text-sm text-gray-500 truncate max-w-xs", children: character.description }) }), _jsx("td", { className: "px-6 py-4 whitespace-nowrap", children: _jsx("div", { className: "text-sm text-gray-500", children: character.bible_book || '-' }) }), _jsx("td", { className: "px-6 py-4 whitespace-nowrap", children: _jsx("button", { onClick: () => handleToggleVisibility(character), className: `px-3 py-1 rounded-full text-xs font-semibold ${(character.is_visible ?? true)
                                                                ? 'bg-green-100 text-green-800'
                                                                : 'bg-red-100 text-red-800'} hover:opacity-75 transition-opacity`, children: (character.is_visible ?? true) ? 'Visible' : 'Hidden' }) }), _jsxs("td", { className: "px-6 py-4 whitespace-nowrap text-right text-sm font-medium", children: [_jsx("button", { onClick: () => handleEditCharacter(character), className: "text-primary-600 hover:text-primary-900 mr-4", children: "Edit" }), _jsx("button", { onClick: () => handleDeleteCharacter(character.id), className: "text-red-600 hover:text-red-900", children: "Delete" })] })] }, character.id))) })] }) }))] })] })), activeTab === 'groups' && (_jsx(GroupManagement, {})), activeTab === 'featured' && (_jsx(AdminFeaturedCharacter, {})), activeTab === 'favorites' && (_jsx(AdminFavorites, {})), activeTab === 'faq' && (_jsx(AdminFAQEditor, {})), activeTab === 'accountTiers' && (_jsx(AccountTierManagement, {})), activeTab === 'roundtable' && (_jsx(AccountTierManagement, { mode: 'roundtable-only' })), activeTab === 'studies' && (_jsx(AdminStudiesPage, { embedded: true })), activeTab === 'series' && (_jsx(AdminSeriesPage, { embedded: true }))] }));
};
export default AdminPage;
