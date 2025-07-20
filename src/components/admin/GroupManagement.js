import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useState, useEffect, useCallback, Fragment, } from 'react';
import { groupRepository } from '../../repositories/groupRepository';
import { characterRepository } from '../../repositories/characterRepository';
const GroupManagement = () => {
    const [groups, setGroups] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState(null);
    const [successMessage, setSuccessMessage] = useState(null);
    const [editingGroupId, setEditingGroupId] = useState(null);
    const [formName, setFormName] = useState('');
    const [formDescription, setFormDescription] = useState('');
    const [formImageUrl, setFormImageUrl] = useState('');
    const [formIcon, setFormIcon] = useState('');
    const [formSortOrder, setFormSortOrder] = useState(0);
    const [activeTab, setActiveTab] = useState('groups');
    const [allCharacters, setAllCharacters] = useState([]);
    const [selectedGroupId, setSelectedGroupId] = useState(null);
    const [groupCharacters, setGroupCharacters] = useState([]);
    const fetchGroups = useCallback(async () => {
        setIsLoading(true);
        setError(null);
        try {
            const fetchedGroups = await groupRepository.getAllGroups();
            setGroups(fetchedGroups);
        }
        catch (err) {
            console.error('Failed to fetch groups:', err);
            setError('Failed to load groups. Please try again.');
        }
        finally {
            setIsLoading(false);
        }
    }, []);
    const fetchCharacters = useCallback(async () => {
        try {
            const characters = await characterRepository.getAll();
            setAllCharacters(characters);
        }
        catch (err) {
            console.error('Failed to fetch characters:', err);
            setError('Failed to load characters. Please try again.');
        }
    }, []);
    const fetchGroupCharacters = useCallback(async (groupId) => {
        try {
            const data = await groupRepository.getCharactersInGroup(groupId);
            setGroupCharacters(data);
        }
        catch (err) {
            console.error('Failed to fetch group characters:', err);
            setError('Failed to load characters for group.');
        }
    }, []);
    useEffect(() => {
        fetchGroups();
        fetchCharacters();
    }, [fetchGroups, fetchCharacters]);
    useEffect(() => {
        if (selectedGroupId) {
            fetchGroupCharacters(selectedGroupId);
        }
        else {
            setGroupCharacters([]);
        }
    }, [selectedGroupId, fetchGroupCharacters]);
    const resetForm = useCallback(() => {
        setEditingGroupId(null);
        setFormName('');
        setFormDescription('');
        setFormImageUrl('');
        setFormIcon('');
        setFormSortOrder(0);
    }, []);
    const handleFormSubmit = async (event) => {
        event.preventDefault();
        setIsLoading(true);
        setError(null);
        setSuccessMessage(null);
        if (!formName.trim()) {
            setError('Group Name is required.');
            setIsLoading(false);
            return;
        }
        const groupData = {
            name: formName.trim(),
            description: formDescription.trim() || null,
            image_url: formImageUrl.trim() || null,
            icon: formIcon.trim() || null,
            sort_order: formSortOrder,
        };
        try {
            if (editingGroupId) {
                await groupRepository.updateGroup(editingGroupId, groupData);
                setSuccessMessage('Group updated successfully!');
            }
            else {
                await groupRepository.createGroup(groupData);
                setSuccessMessage('Group created successfully!');
            }
            resetForm();
            fetchGroups();
        }
        catch (err) {
            console.error('Group form submission error:', err);
            setError(err instanceof Error ? err.message : 'Failed to save group.');
        }
        finally {
            setIsLoading(false);
        }
    };
    const handleEditGroup = (group) => {
        setEditingGroupId(group.id);
        setFormName(group.name);
        setFormDescription(group.description || '');
        setFormImageUrl(group.image_url || '');
        setFormIcon(group.icon || '');
        setFormSortOrder(group.sort_order);
        document.getElementById('groupFormSection')?.scrollIntoView({ behavior: 'smooth' });
    };
    const handleDeleteGroup = async (id) => {
        if (!window.confirm('Are you sure you want to delete this group? This action cannot be undone.')) {
            return;
        }
        setIsLoading(true);
        setError(null);
        setSuccessMessage(null);
        try {
            await groupRepository.deleteGroup(id);
            setSuccessMessage('Group deleted successfully!');
            fetchGroups();
        }
        catch (err) {
            console.error('Group deletion error:', err);
            setError(err instanceof Error ? err.message : 'Failed to delete group.');
        }
        finally {
            setIsLoading(false);
        }
    };
    const handleAddCharacterToGroup = async (characterId) => {
        if (!selectedGroupId)
            return;
        setIsLoading(true);
        setError(null);
        setSuccessMessage(null);
        try {
            await groupRepository.addCharacterToGroup(selectedGroupId, characterId);
            setSuccessMessage('Character added to group!');
            fetchGroupCharacters(selectedGroupId);
        }
        catch (err) {
            console.error('Error adding character to group:', err);
            setError(err instanceof Error ? err.message : 'Failed to add character to group.');
        }
        finally {
            setIsLoading(false);
        }
    };
    const handleRemoveCharacterFromGroup = async (mappingId) => {
        if (!selectedGroupId)
            return;
        setIsLoading(true);
        setError(null);
        setSuccessMessage(null);
        try {
            await groupRepository.removeCharacterFromGroup(mappingId);
            setSuccessMessage('Character removed from group!');
            fetchGroupCharacters(selectedGroupId);
        }
        catch (err) {
            console.error('Error removing character from group:', err);
            setError(err instanceof Error ? err.message : 'Failed to remove character from group.');
        }
        finally {
            setIsLoading(false);
        }
    };
    const handleReorderCharacterInGroup = async (mappingId, newSortOrder) => {
        if (!selectedGroupId)
            return;
        setIsLoading(true);
        setError(null);
        setSuccessMessage(null);
        try {
            await groupRepository.updateCharacterMappingSortOrder(mappingId, newSortOrder);
            setSuccessMessage('Character order updated!');
            fetchGroupCharacters(selectedGroupId);
        }
        catch (err) {
            console.error('Error reordering character:', err);
            setError(err instanceof Error ? err.message : 'Failed to reorder character.');
        }
        finally {
            setIsLoading(false);
        }
    };
    const charactersNotInGroup = allCharacters.filter((char) => !groupCharacters.some((gc) => gc.character_id === char.id));
    return (_jsxs("div", { className: "container mx-auto px-4 py-8", children: [_jsx("h1", { className: "text-3xl font-bold text-gray-900 mb-6", children: "Manage Character Groups" }), isLoading && (_jsx("div", { className: "mb-4 p-3 bg-blue-100 text-blue-700 rounded", children: "Loading..." })), error && (_jsxs("div", { className: "mb-4 p-3 bg-red-100 text-red-700 rounded", children: ["Error: ", error] })), successMessage && (_jsxs("div", { className: "mb-4 p-3 bg-green-100 text-green-700 rounded", children: ["Success: ", successMessage] })), _jsx("div", { className: "mb-6 border-b border-gray-200", children: _jsxs("nav", { className: "-mb-px flex space-x-8", "aria-label": "Tabs", children: [_jsx("button", { onClick: () => setActiveTab('groups'), className: `whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm ${activeTab === 'groups'
                                ? 'border-primary-500 text-primary-600'
                                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'}`, children: "Groups" }), _jsx("button", { onClick: () => setActiveTab('assignment'), className: `whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm ${activeTab === 'assignment'
                                ? 'border-primary-500 text-primary-600'
                                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'}`, children: "Character Assignment" })] }) }), activeTab === 'groups' && (_jsxs(Fragment, { children: [_jsxs("section", { id: "groupFormSection", className: "mb-8 p-6 bg-white rounded-lg shadow-md", children: [_jsx("h2", { className: "text-2xl font-semibold text-gray-800 mb-4", children: editingGroupId ? 'Edit Group' : 'Create New Group' }), _jsxs("form", { onSubmit: handleFormSubmit, className: "space-y-4", children: [_jsxs("div", { children: [_jsx("label", { htmlFor: "name", className: "block text-sm font-medium text-gray-700", children: "Group Name" }), _jsx("input", { type: "text", id: "name", value: formName, onChange: (e) => setFormName(e.target.value), required: true, className: "mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500" })] }), _jsxs("div", { children: [_jsx("label", { htmlFor: "description", className: "block text-sm font-medium text-gray-700", children: "Description" }), _jsx("textarea", { id: "description", rows: 3, value: formDescription, onChange: (e) => setFormDescription(e.target.value), className: "mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500" })] }), _jsxs("div", { children: [_jsx("label", { htmlFor: "imageUrl", className: "block text-sm font-medium text-gray-700", children: "Image URL" }), _jsx("input", { type: "url", id: "imageUrl", value: formImageUrl, onChange: (e) => setFormImageUrl(e.target.value), className: "mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500" })] }), _jsxs("div", { children: [_jsx("label", { htmlFor: "icon", className: "block text-sm font-medium text-gray-700", children: "Icon (e.g., FontAwesome class)" }), _jsx("input", { type: "text", id: "icon", value: formIcon, onChange: (e) => setFormIcon(e.target.value), className: "mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500" })] }), _jsxs("div", { children: [_jsx("label", { htmlFor: "sortOrder", className: "block text-sm font-medium text-gray-700", children: "Sort Order" }), _jsx("input", { type: "number", id: "sortOrder", value: formSortOrder, onChange: (e) => setFormSortOrder(Number(e.target.value)), className: "mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500" })] }), _jsxs("div", { className: "flex space-x-4", children: [_jsx("button", { type: "submit", disabled: isLoading, className: "px-4 py-2 bg-primary-600 text-white rounded-md hover:bg-primary-700 disabled:bg-gray-400", children: isLoading ? 'Saving...' : editingGroupId ? 'Update Group' : 'Create Group' }), editingGroupId && (_jsx("button", { type: "button", onClick: resetForm, className: "px-4 py-2 bg-gray-200 text-gray-700 rounded-md hover:bg-gray-300", children: "Cancel Edit" }))] })] })] }), _jsxs("section", { className: "p-6 bg-white rounded-lg shadow-md", children: [_jsx("h2", { className: "text-2xl font-semibold text-gray-800 mb-4", children: "Existing Groups" }), groups.length === 0 ? (_jsx("p", { className: "text-gray-500 italic", children: "No character groups found. Create one above!" })) : (_jsx("div", { className: "overflow-x-auto", children: _jsxs("table", { className: "min-w-full divide-y divide-gray-200", children: [_jsx("thead", { className: "bg-gray-50", children: _jsxs("tr", { children: [_jsx("th", { className: "px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider", children: "Name" }), _jsx("th", { className: "px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider", children: "Description" }), _jsx("th", { className: "px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider", children: "Sort Order" }), _jsx("th", { className: "px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider", children: "Actions" })] }) }), _jsx("tbody", { className: "bg-white divide-y divide-gray-200", children: groups.map((group) => (_jsxs("tr", { children: [_jsx("td", { className: "px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900", children: group.name }), _jsx("td", { className: "px-6 py-4 text-sm text-gray-500 truncate max-w-xs", children: group.description || '-' }), _jsx("td", { className: "px-6 py-4 whitespace-nowrap text-sm text-gray-500", children: group.sort_order }), _jsxs("td", { className: "px-6 py-4 whitespace-nowrap text-right text-sm font-medium", children: [_jsx("button", { onClick: () => handleEditGroup(group), className: "text-primary-600 hover:text-primary-900 mr-4", children: "Edit" }), _jsx("button", { onClick: () => handleDeleteGroup(group.id), className: "text-red-600 hover:text-red-900", children: "Delete" })] })] }, group.id))) })] }) }))] })] })), activeTab === 'assignment' && (_jsxs("div", { className: "space-y-8", children: [_jsxs("section", { className: "p-6 bg-white rounded-lg shadow-md", children: [_jsx("h2", { className: "text-2xl font-semibold text-gray-800 mb-4", children: "Select a Group" }), _jsx("div", { className: "max-w-md", children: _jsxs("select", { value: selectedGroupId || '', onChange: (e) => setSelectedGroupId(e.target.value || null), className: "block w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500", children: [_jsx("option", { value: "", children: "-- Select a group --" }), groups.map((group) => (_jsx("option", { value: group.id, children: group.name }, group.id)))] }) })] }), selectedGroupId && (_jsxs("div", { className: "grid grid-cols-1 md:grid-cols-2 gap-6", children: [_jsxs("section", { className: "p-6 bg-white rounded-lg shadow-md", children: [_jsx("h2", { className: "text-xl font-semibold text-gray-800 mb-4", children: "Available Characters" }), charactersNotInGroup.length === 0 ? (_jsx("p", { className: "text-gray-500 italic", children: "All characters have been added to this group." })) : (_jsx("div", { className: "space-y-3 max-h-96 overflow-y-auto pr-2", children: charactersNotInGroup.map((character) => (_jsxs("div", { className: "flex items-center justify-between p-3 border border-gray-200 rounded-md hover:bg-gray-50", children: [_jsxs("div", { className: "flex items-center", children: [_jsx("img", { src: character.avatar_url || `https://ui-avatars.com/api/?name=${encodeURIComponent(character.name)}`, alt: character.name, className: "h-10 w-10 rounded-full object-cover mr-3", onError: (e) => {
                                                                e.target.src = `https://ui-avatars.com/api/?name=${encodeURIComponent(character.name)}`;
                                                            } }), _jsx("span", { className: "font-medium", children: character.name })] }), _jsx("button", { onClick: () => handleAddCharacterToGroup(character.id), className: "p-1 bg-green-100 text-green-700 rounded-full hover:bg-green-200", title: "Add to group", children: _jsx("svg", { xmlns: "http://www.w3.org/2000/svg", className: "h-5 w-5", viewBox: "0 0 20 20", fill: "currentColor", children: _jsx("path", { fillRule: "evenodd", d: "M10 5a1 1 0 011 1v3h3a1 1 0 110 2h-3v3a1 1 0 11-2 0v-3H6a1 1 0 110-2h3V6a1 1 0 011-1z", clipRule: "evenodd" }) }) })] }, character.id))) }))] }), _jsxs("section", { className: "p-6 bg-white rounded-lg shadow-md", children: [_jsx("h2", { className: "text-xl font-semibold text-gray-800 mb-4", children: "Characters in Group" }), groupCharacters.length === 0 ? (_jsx("p", { className: "text-gray-500 italic", children: "No characters in this group yet." })) : (_jsx("div", { className: "space-y-3 max-h-96 overflow-y-auto pr-2", children: groupCharacters.map((mapping, index) => (_jsxs("div", { className: "flex items-center justify-between p-3 border border-gray-200 rounded-md hover:bg-gray-50", children: [_jsxs("div", { className: "flex items-center", children: [_jsx("div", { className: "text-gray-500 mr-2 w-6 text-center", children: mapping.sort_order }), _jsx("img", { src: mapping.character.avatar_url || `https://ui-avatars.com/api/?name=${encodeURIComponent(mapping.character.name)}`, alt: mapping.character.name, className: "h-10 w-10 rounded-full object-cover mr-3", onError: (e) => {
                                                                e.target.src = `https://ui-avatars.com/api/?name=${encodeURIComponent(mapping.character.name)}`;
                                                            } }), _jsx("span", { className: "font-medium", children: mapping.character.name })] }), _jsxs("div", { className: "flex items-center space-x-1", children: [_jsx("button", { onClick: () => handleReorderCharacterInGroup(mapping.id, mapping.sort_order - 1), disabled: index === 0, className: `p-1 rounded-full ${index === 0
                                                                ? 'text-gray-300 cursor-not-allowed'
                                                                : 'text-gray-600 hover:bg-gray-200'}`, title: "Move up", children: _jsx("svg", { xmlns: "http://www.w3.org/2000/svg", className: "h-5 w-5", viewBox: "0 0 20 20", fill: "currentColor", children: _jsx("path", { fillRule: "evenodd", d: "M5.293 9.707a1 1 0 010-1.414l4-4a1 1 0 011.414 0l4 4a1 1 0 01-1.414 1.414L11 7.414V15a1 1 0 11-2 0V7.414L6.707 9.707a1 1 0 01-1.414 0z", clipRule: "evenodd" }) }) }), _jsx("button", { onClick: () => handleReorderCharacterInGroup(mapping.id, mapping.sort_order + 1), disabled: index === groupCharacters.length - 1, className: `p-1 rounded-full ${index === groupCharacters.length - 1
                                                                ? 'text-gray-300 cursor-not-allowed'
                                                                : 'text-gray-600 hover:bg-gray-200'}`, title: "Move down", children: _jsx("svg", { xmlns: "http://www.w3.org/2000/svg", className: "h-5 w-5", viewBox: "0 0 20 20", fill: "currentColor", children: _jsx("path", { fillRule: "evenodd", d: "M14.707 10.293a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 111.414-1.414L9 12.586V5a1 1 0 012 0v7.586l2.293-2.293a1 1 0 011.414 0z", clipRule: "evenodd" }) }) }), _jsx("button", { onClick: () => handleRemoveCharacterFromGroup(mapping.id), className: "p-1 text-red-600 rounded-full hover:bg-red-100", title: "Remove from group", children: _jsx("svg", { xmlns: "http://www.w3.org/2000/svg", className: "h-5 w-5", viewBox: "0 0 20 20", fill: "currentColor", children: _jsx("path", { fillRule: "evenodd", d: "M9 2a1 1 0 00-.894.553L7.382 4H4a1 1 0 000 2v10a2 2 0 002 2h8a2 2 0 002-2V6a1 1 0 100-2h-3.382l-.724-1.447A1 1 0 0011 2H9zM7 8a1 1 0 012 0v6a1 1 0 11-2 0V8zm5-1a1 1 0 00-1 1v6a1 1 0 102 0V8a1 1 0 00-1-1z", clipRule: "evenodd" }) }) })] })] }, mapping.id))) }))] })] })), !selectedGroupId && (_jsx("div", { className: "p-6 bg-gray-50 rounded-lg border border-gray-200 text-center", children: _jsx("p", { className: "text-gray-600", children: "Please select a group to manage its characters." }) }))] }))] }));
};
export default GroupManagement;
