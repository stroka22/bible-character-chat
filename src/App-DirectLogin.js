import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useState, useEffect } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './contexts/AuthContext';
import { ChatProvider } from './contexts/ChatContext';
import { useAuth } from './contexts/AuthContext';
import HomePage from './pages/HomePage';
import ConversationsPage from './pages/ConversationsPage';
import { supabase } from './services/supabase';
const generateFallbackAvatar = (name = 'User') => `https://ui-avatars.com/api/?name=${encodeURIComponent(name)}&background=random`;
const AdminPage = () => {
    const { user } = useAuth();
    const isAdmin = user && user.email === 'admin@example.com';
    if (!isAdmin) {
        return (_jsx("div", { className: "flex h-full w-full items-center justify-center bg-red-50 p-4", children: _jsxs("div", { className: "text-center", children: [_jsx("h2", { className: "text-2xl font-bold text-red-800 mb-4", children: "Access Denied" }), _jsx("p", { className: "text-red-700", children: "You do not have administrative privileges to view this page." })] }) }));
    }
    return (_jsxs("div", { className: "container mx-auto px-4 py-8", children: [_jsx("h1", { className: "text-3xl font-bold text-gray-900 mb-6", children: "Admin Panel - Character Management" }), _jsx("p", { className: "text-gray-700 mb-4", children: "Welcome, Admin! Here you can manage Bible characters." }), _jsxs("section", { className: "mb-8 p-6 bg-white rounded-lg shadow-md", children: [_jsx("h2", { className: "text-2xl font-semibold text-gray-800 mb-4", children: "Bulk Upload Characters (CSV)" }), _jsx("p", { className: "text-gray-600 mb-4", children: "Upload a CSV file to add or update multiple characters. Expected fields: `character_name`, `avatar_url`, `feature_image_url`, `short_biography`, `bible_book`, `opening_sentence`, `persona_prompt`, `scriptural_context`." }), _jsx("input", { type: "file", accept: ".csv", className: "block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-primary-50 file:text-primary-700 hover:file:bg-primary-100" }), _jsx("button", { className: "mt-4 px-4 py-2 bg-primary-600 text-white rounded-md hover:bg-primary-700", children: "Upload CSV" })] }), _jsxs("section", { className: "p-6 bg-white rounded-lg shadow-md", children: [_jsx("h2", { className: "text-2xl font-semibold text-gray-800 mb-4", children: "Manual Character Management" }), _jsxs("form", { className: "space-y-4", children: [_jsxs("div", { children: [_jsx("label", { className: "block text-sm font-medium text-gray-700", children: "Character Name" }), _jsx("input", { type: "text", className: "mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500" })] }), _jsxs("div", { children: [_jsx("label", { className: "block text-sm font-medium text-gray-700", children: "Avatar URL" }), _jsx("input", { type: "url", className: "mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500" })] }), _jsxs("div", { children: [_jsx("label", { className: "block text-sm font-medium text-gray-700", children: "Feature Image URL" }), _jsx("input", { type: "url", className: "mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500" })] }), _jsxs("div", { children: [_jsx("label", { className: "block text-sm font-medium text-gray-700", children: "Short Biography" }), _jsx("textarea", { rows: 3, className: "mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500" })] }), _jsxs("div", { children: [_jsx("label", { className: "block text-sm font-medium text-gray-700", children: "Bible Book" }), _jsx("input", { type: "text", className: "mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500" })] }), _jsxs("div", { children: [_jsx("label", { className: "block text-sm font-medium text-gray-700", children: "Opening Sentence" }), _jsx("textarea", { rows: 2, className: "mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500" })] }), _jsxs("div", { children: [_jsx("label", { className: "block text-sm font-medium text-gray-700", children: "Persona Prompt" }), _jsx("textarea", { rows: 5, className: "mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500" })] }), _jsxs("div", { children: [_jsx("label", { className: "block text-sm font-medium text-gray-700", children: "Scriptural Context" }), _jsx("textarea", { rows: 3, className: "mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500" })] }), _jsx("button", { type: "submit", className: "px-4 py-2 bg-primary-600 text-white rounded-md hover:bg-primary-700", children: "Save Character" })] }), _jsx("h3", { className: "text-xl font-semibold text-gray-800 mt-8 mb-4", children: "Existing Characters" }), _jsx("input", { type: "text", placeholder: "Search existing characters...", className: "mb-4 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500" }), _jsxs("ul", { className: "space-y-2", children: [_jsxs("li", { className: "flex justify-between items-center p-3 bg-gray-50 rounded-md border border-gray-200", children: [_jsx("span", { children: "Paul" }), _jsxs("div", { children: [_jsx("button", { className: "text-blue-600 hover:text-blue-800 mr-2", children: "Edit" }), _jsx("button", { className: "text-red-600 hover:text-red-800", children: "Delete" })] })] }), _jsxs("li", { className: "flex justify-between items-center p-3 bg-gray-50 rounded-md border border-gray-200", children: [_jsx("span", { children: "Moses" }), _jsxs("div", { children: [_jsx("button", { className: "text-blue-600 hover:text-blue-800 mr-2", children: "Edit" }), _jsx("button", { className: "text-red-600 hover:text-red-800", children: "Delete" })] })] })] })] })] }));
};
const DirectLogin = () => {
    const { signIn } = useAuth();
    const [email, setEmail] = useState('test@example.com');
    const [password, setPassword] = useState('password123');
    const [isLoading, setIsLoading] = useState(false);
    const [isCreating, setIsCreating] = useState(false);
    const [error, setError] = useState(null);
    const [success, setSuccess] = useState(null);
    const [debugInfo, setDebugInfo] = useState(null);
    const [showDebug, setShowDebug] = useState(false);
    const [bypassAuth, setBypassAuth] = useState(false);
    useEffect(() => {
        const checkSession = async () => {
            const { data } = await supabase.auth.getSession();
            if (data.session) {
                setDebugInfo(`Active session detected for: ${data.session.user.email}`);
            }
            else {
                setDebugInfo('No active session found');
            }
        };
        checkSession();
    }, []);
    const handleLogin = async (e) => {
        e.preventDefault();
        setIsLoading(true);
        setError(null);
        setSuccess(null);
        setDebugInfo(null);
        try {
            const { data, error } = await supabase.auth.signInWithPassword({
                email,
                password,
            });
            if (error)
                throw error;
            if (data?.user) {
                setSuccess(`Successfully logged in as ${data.user.email}!`);
                setDebugInfo(`Auth session established. User ID: ${data.user.id}`);
            }
        }
        catch (err) {
            setError(`Login failed: ${err.message || 'Unknown error'}`);
            setDebugInfo(JSON.stringify(err, null, 2));
        }
        finally {
            setIsLoading(false);
        }
    };
    const createTestUser = async () => {
        setIsCreating(true);
        setError(null);
        setSuccess(null);
        setDebugInfo(null);
        try {
            const { data, error } = await supabase.auth.signUp({
                email,
                password,
            });
            if (error)
                throw error;
            if (data?.user) {
                setSuccess(`User created! ID: ${data.user.id}`);
                setDebugInfo(`User created but may need email verification.
          Email confirmation status: ${data.user.email_confirmed_at ? 'Confirmed' : 'Not confirmed'}
          Created at: ${data.user.created_at}
          You can now try to sign in.`);
            }
        }
        catch (err) {
            if (err.message?.includes('User already registered')) {
                setSuccess('This email is already registered. Try signing in instead.');
            }
            else {
                setError(`Failed to create user: ${err.message || 'Unknown error'}`);
                setDebugInfo(JSON.stringify(err, null, 2));
            }
        }
        finally {
            setIsCreating(false);
        }
    };
    const resetPassword = async () => {
        setIsLoading(true);
        setError(null);
        setSuccess(null);
        setDebugInfo(null);
        try {
            const { error } = await supabase.auth.resetPasswordForEmail(email, {
                redirectTo: window.location.origin,
            });
            if (error)
                throw error;
            setSuccess(`Password reset email sent to ${email}`);
        }
        catch (err) {
            setError(`Failed to send reset email: ${err.message || 'Unknown error'}`);
            setDebugInfo(JSON.stringify(err, null, 2));
        }
        finally {
            setIsLoading(false);
        }
    };
    const enableBypass = () => {
        setBypassAuth(true);
        localStorage.setItem('bypass_auth', 'true');
    };
    if (bypassAuth) {
        return null;
    }
    return (_jsxs("div", { className: "max-w-lg mx-auto mt-10 p-6 bg-white rounded-lg shadow-lg", children: [_jsx("h2", { className: "text-2xl font-bold mb-6 text-center", children: "Bible Character Chat" }), _jsx("p", { className: "text-center text-gray-600 mb-6", children: "Authentication Troubleshooter" }), error && (_jsxs("div", { className: "mb-4 p-4 bg-red-100 text-red-700 rounded border border-red-300", children: [_jsx("p", { className: "font-bold", children: "Error:" }), _jsx("p", { children: error })] })), success && (_jsxs("div", { className: "mb-4 p-4 bg-green-100 text-green-700 rounded border border-green-300", children: [_jsx("p", { className: "font-bold", children: "Success:" }), _jsx("p", { children: success })] })), _jsxs("form", { onSubmit: handleLogin, className: "mb-6", children: [_jsxs("div", { className: "mb-4", children: [_jsx("label", { className: "block text-gray-700 mb-2 font-medium", children: "Email" }), _jsx("input", { type: "email", value: email, onChange: (e) => setEmail(e.target.value), className: "w-full p-3 border rounded focus:ring-2 focus:ring-primary-300 focus:border-primary-500 outline-none transition", required: true })] }), _jsxs("div", { className: "mb-6", children: [_jsx("label", { className: "block text-gray-700 mb-2 font-medium", children: "Password" }), _jsx("input", { type: "password", value: password, onChange: (e) => setPassword(e.target.value), className: "w-full p-3 border rounded focus:ring-2 focus:ring-primary-300 focus:border-primary-500 outline-none transition", required: true })] }), _jsxs("div", { className: "grid grid-cols-1 md:grid-cols-2 gap-4 mb-6", children: [_jsx("button", { type: "submit", disabled: isLoading, className: "bg-primary-600 text-white py-3 px-4 rounded font-medium hover:bg-primary-700 disabled:bg-gray-400 transition", children: isLoading ? 'Signing in...' : 'Sign In' }), _jsx("button", { type: "button", onClick: createTestUser, disabled: isCreating, className: "bg-secondary-600 text-white py-3 px-4 rounded font-medium hover:bg-secondary-700 disabled:bg-gray-400 transition", children: isCreating ? 'Creating...' : 'Create Test User' })] })] }), _jsxs("div", { className: "flex flex-col md:flex-row justify-between items-center mb-6", children: [_jsx("button", { onClick: resetPassword, className: "text-primary-600 hover:text-primary-800 mb-4 md:mb-0", children: "Reset Password" }), _jsx("button", { onClick: enableBypass, className: "text-gray-600 hover:text-gray-800 underline text-sm", children: "Bypass Authentication (Testing Only)" })] }), _jsxs("div", { className: "mt-8 border-t pt-4", children: [_jsxs("button", { onClick: () => setShowDebug(!showDebug), className: "text-gray-500 text-sm flex items-center", children: [_jsx("svg", { xmlns: "http://www.w3.org/2000/svg", className: `h-4 w-4 mr-1 transition-transform ${showDebug ? 'rotate-90' : ''}`, fill: "none", viewBox: "0 0 24 24", stroke: "currentColor", children: _jsx("path", { strokeLinecap: "round", strokeLinejoin: "round", strokeWidth: 2, d: "M9 5l7 7-7 7" }) }), "Debug Information"] }), showDebug && debugInfo && (_jsx("pre", { className: "mt-2 p-3 bg-gray-100 text-gray-800 rounded text-xs overflow-x-auto", children: debugInfo }))] })] }));
};
function App() {
    const [bypassAuth, setBypassAuth] = useState(false);
    useEffect(() => {
        const bypass = localStorage.getItem('bypass_auth') === 'true';
        setBypassAuth(bypass);
    }, []);
    const MainContent = () => {
        const { user } = useAuth();
        const [showConversations, setShowConversations] = useState(false);
        if (!user && !bypassAuth) {
            return _jsx(DirectLogin, {});
        }
        return (_jsxs("div", { className: "flex-grow flex flex-col", children: [_jsx("div", { className: "bg-white border-b border-gray-200 p-4 flex justify-center", children: _jsxs("div", { className: "inline-flex rounded-md shadow-sm", role: "group", children: [_jsx("button", { type: "button", onClick: () => setShowConversations(false), className: `px-4 py-2 text-sm font-medium rounded-l-lg ${!showConversations
                                    ? 'bg-primary-600 text-white'
                                    : 'bg-white text-gray-700 hover:bg-gray-100'}`, children: "Chat with Characters" }), _jsx("button", { type: "button", onClick: () => setShowConversations(true), className: `px-4 py-2 text-sm font-medium rounded-r-lg ${showConversations
                                    ? 'bg-primary-600 text-white'
                                    : 'bg-white text-gray-700 hover:bg-gray-100'}`, children: "Saved Conversations" })] }) }), _jsx("div", { className: "flex-grow", children: _jsxs(Routes, { children: [_jsx(Route, { path: "/", element: showConversations ? _jsx(ConversationsPage, {}) : _jsx(HomePage, {}) }), _jsx(Route, { path: "/admin", element: _jsx(AdminPage, {}) }), _jsx(Route, { path: "/admin/characters", element: _jsx(AdminPage, {}) }), _jsx(Route, { path: "*", element: _jsx(Navigate, { to: "/", replace: true }) })] }) })] }));
    };
    return (_jsx(BrowserRouter, { children: _jsx(AuthProvider, { children: _jsx(ChatProvider, { children: _jsxs("div", { className: "flex min-h-screen flex-col bg-gray-50", children: [((() => {
                            useEffect(() => {
                                function handleImgError(ev) {
                                    const target = ev.target;
                                    if (target instanceof HTMLImageElement &&
                                        target.src &&
                                        (target.src.includes('example.com') ||
                                            target.src === window.location.origin)) {
                                        console.warn('[GlobalImageError] Replacing failed image:', target.src);
                                        target.src = generateFallbackAvatar(target.alt);
                                    }
                                }
                                window.addEventListener('error', handleImgError, true);
                                return () => {
                                    window.removeEventListener('error', handleImgError, true);
                                };
                            }, []);
                            useEffect(() => {
                                if (!import.meta.env.VITE_OPENAI_API_KEY) {
                                    console.warn('[OpenAI] No VITE_OPENAI_API_KEY provided – chat responses will be disabled.');
                                }
                            }, []);
                        })()), _jsx("main", { className: "flex-grow", children: _jsx(Routes, { children: _jsx(Route, { path: "/*", element: _jsx(MainContent, {}) }) }) })] }) }) }) }));
}
export default App;
