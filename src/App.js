import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate, useLocation, Outlet } from 'react-router-dom';
import { AuthProvider, useAuth } from './contexts/AuthContext';
// Use the mock chat provider (local, no real Supabase writes)
// Switch to the unified ChatContext implementation so *all* components
// (including any legacy ones still importing from `../contexts/ChatContext`)
// receive the same provider instance.
import { ChatProvider } from './contexts/ChatContext.jsx';
import { ConversationProvider } from './contexts/ConversationContext.jsx';
/* ------------------------------------------------------------------
 * Global styles
 * ------------------------------------------------------------------ */
import './styles/tooltips.css'; // Custom tooltip system
import HomePage from './pages/HomePage';
import LoginPage from './pages/LoginPage';
import SignupPage from './pages/SignupPage';
import PricingPage from './pages/PricingPage';
import AdminPage from './pages/AdminPage';
import ConversationsPage from './pages/ConversationsPage.jsx';
import FavoritesPage from './pages/FavoritesPage.jsx';
import FAQPage from './pages/FAQPage.jsx';
import ProfilePage from './pages/ProfilePage.jsx';
import SettingsPage from './pages/SettingsPage.jsx';
import SimpleChatWithHistory from './components/chat/SimpleChatWithHistory';
import DebugPanel from './components/DebugPanel';
import Header from './components/Header';

class ErrorBoundary extends React.Component {
    constructor(props) {
        super(props);
        this.state = { hasError: false, error: null, errorInfo: null };
    }

    static getDerivedStateFromError(error) {
        // Update state so the next render shows the fallback UI.
        return { hasError: true };
    }

    componentDidCatch(error, errorInfo) {
        // You can also log the error to an error reporting service
        console.error('[ErrorBoundary] Rendering error:', error);
        console.error('[ErrorBoundary] Error info:', errorInfo);
        console.error('[ErrorBoundary] Error stack:', error.stack);
        console.error('[ErrorBoundary] Component stack:', errorInfo.componentStack);

        this.setState({
            error,
            errorInfo,
        });
    }

    render() {
        if (this.state.hasError) {
            return (
                _jsx("div", {
                    className: "flex items-center justify-center min-h-screen bg-blue-900 text-white p-4",
                    children: _jsxs("div", {
                        className: "text-center space-y-4 max-w-2xl",
                        children: [
                            _jsx("h1", { className: "text-2xl font-bold", children: "Something went wrong." }),
                            _jsx("p", { children: "Please refresh the page to try again." }),
                            _jsx("button", {
                                onClick: () => window.location.reload(),
                                className: "bg-amber-400 text-blue-900 font-semibold px-4 py-2 rounded-lg",
                                children: "Reload",
                            }),
                            process.env.NODE_ENV === 'development' &&
                                this.state.error && (
                                    _jsxs("details", {
                                        className: "mt-4 text-left",
                                        children: [
                                            _jsx("summary", {
                                                className: "cursor-pointer text-yellow-400",
                                                children: "Debug Info (Development)",
                                            }),
                                            _jsx("pre", {
                                                className: "mt-2 p-2 bg-black/50 rounded text-xs overflow-auto max-h-40",
                                                children: `${this.state.error.toString()}\n\n${this.state.errorInfo?.componentStack}`,
                                            }),
                                        ],
                                    })
                                ),
                        ],
                    }),
                })
            );
        }

        return this.props.children;
    }
}

// Protected Route component that checks authentication
const ProtectedRoute = ({ redirectPath = '/login' }) => {
    const { user, loading } = useAuth();
    const location = useLocation();
    
    // If still loading auth state, show a loading indicator
    if (loading) {
        return _jsx("div", { className: "flex items-center justify-center min-h-screen bg-blue-900 text-white", children: _jsxs("div", { className: "text-center", children: [_jsx("div", { className: "animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-yellow-400 mx-auto mb-4" }), _jsx("p", { children: "Loading..." })] }) });
    }
    
    // If not authenticated, redirect to login with return path
    if (!user) {
        return _jsx(Navigate, { to: redirectPath, state: { from: location }, replace: true });
    }
    
    // If authenticated, render the child routes
    return _jsx(Outlet, {});
};

// Admin Route component that checks both authentication and admin role
const AdminRoute = ({ redirectPath = '/' }) => {
    const { user, loading, isAdmin } = useAuth();
    const location = useLocation();

    if (loading) {
        return _jsx("div", { className: "flex items-center justify-center min-h-screen bg-blue-900 text-white", children: _jsxs("div", { className: "text-center", children: [_jsx("div", { className: "animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-yellow-400 mx-auto mb-4" }), _jsx("p", { children: "Loading..." })] }) });
    }

    // If user not authenticated or not admin, redirect
    if (!user || !isAdmin()) {
        return _jsx(Navigate, { to: redirectPath, state: { from: location }, replace: true });
    }

    return _jsx(Outlet, {});
};

function App() {
    const params = new URLSearchParams(window.location.search);
    const DIRECT_RENDER = params.get('direct') === '1' ||
        import.meta.env.VITE_DIRECT_RENDER === 'true';
    console.log(`[App] init – DIRECT_RENDER=${DIRECT_RENDER}`);

    /* ------------------------------------------------------------------
     * Providers
     * Always wrap the application in AuthProvider so that useAuth()
     * is safe everywhere, even when we want to "skip" auth-related
     * screens/guards in development.  Any "skip" logic should be handled
     * inside consumer components rather than removing the context.
     * ------------------------------------------------------------------ */
    // Correct provider hierarchy:
    // 1. AuthProvider         – provides authentication state
    // 2. ConversationProvider – conversation persistence (used by chat)
    // 3. ChatProvider         – chat logic (depends on conversation context)
    const Providers = ({ children }) => (
        _jsx(AuthProvider, {
            children: _jsx(ConversationProvider, {
                children: _jsx(ChatProvider, { children })
            })
        })
    );

    if (DIRECT_RENDER) {
        return (_jsx(ErrorBoundary, { children: _jsx(Providers, { children: _jsxs(Router, { children: [_jsx("div", { className: "flex flex-col min-h-screen bg-gradient-to-b from-blue-900 via-blue-700 to-blue-600", children: [_jsx(Header, {}), _jsx("main", { className: "flex-1", children: _jsx(HomePage, {}) })] }), _jsx(DebugPanel, {})] }) }) }));
    }

    return (_jsx(ErrorBoundary, { children: _jsx(Providers, { children: _jsxs(Router, { children: [
        _jsx("div", { className: "flex flex-col min-h-screen", children: [_jsx(Header, {}), _jsx("main", { className: "flex-1 px-4 md:px-6", children: _jsxs(Routes, { children: [
        // Public routes
        _jsx(Route, { path: "/", element: _jsx(HomePage, {}) }),
        _jsx(Route, { path: "/login", element: _jsx(LoginPage, {}) }),
        _jsx(Route, { path: "/signup", element: _jsx(SignupPage, {}) }),
        _jsx(Route, { path: "/pricing", element: _jsx(PricingPage, {}) }),
        _jsx(Route, { path: "/faq", element: _jsx(FAQPage, {}) }),
        _jsx(Route, { path: "/debug", element: _jsxs("div", { className: "min-h-screen bg-slate-800 text-white p-4", children: [_jsx("h1", { className: "text-2xl mb-4", children: "Debug Tools" }), _jsx(DebugPanel, {})] }) }),
        
        // Chat & Shared conversation routes (public access)
        _jsx(Route, { path: "/chat", element: _jsx(SimpleChatWithHistory, {}) }),
        _jsx(Route, { path: "/chat/:conversationId", element: _jsx(SimpleChatWithHistory, {}) }),
        _jsx(Route, { path: "/shared/:shareCode", element: _jsx(SimpleChatWithHistory, { isSharedView: true }) }),

        // Protected routes
        _jsx(Route, { element: _jsx(ProtectedRoute, { redirectPath: "/login" }), children: [
            _jsx(Route, { element: _jsx(AdminRoute, { redirectPath: "/login" }), children: _jsx(Route, { path: "/admin", element: _jsx(AdminPage, {}) }) }),
            _jsx(Route, { path: "/profile", element: _jsx(ProfilePage, {}) }),
            _jsx(Route, { path: "/settings", element: _jsx(SettingsPage, {}) }),
            _jsx(Route, { path: "/conversations", element: _jsx(ConversationsPage, {}) }),
            _jsx(Route, { path: "/favorites", element: _jsx(FavoritesPage, {}) })
        ]}),
        
        // Fallback route
        _jsx(Route, { path: "*", element: _jsx(Navigate, { to: "/", replace: true }) })
        ] }) })]
    })] }) }) }));
}

export default App;
