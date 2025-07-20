import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import React, { useMemo } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate, useLocation, } from 'react-router-dom';
import { AuthProvider } from './contexts/AuthContext';
import { ChatProvider } from './contexts/ChatContext';
import HomePage from './pages/HomePage';
import DebugPanel from './components/DebugPanel';

class ErrorBoundary extends React.Component {
    constructor() {
        super(...arguments);
        this.state = { hasError: false, error: null, errorInfo: null };
    }
    
    static getDerivedStateFromError() {
        return { hasError: true };
    }
    
    componentDidCatch(error, errorInfo) {
        console.error('[ErrorBoundary] Rendering error:', error);
        console.error('[ErrorBoundary] Component stack:', errorInfo?.componentStack);
        this.setState({ error, errorInfo });
    }
    
    render() {
        if (this.state.hasError) {
            return (
                _jsx("div", { 
                    className: "flex items-center justify-center min-h-screen bg-blue-900 text-white", 
                    children: _jsxs("div", { 
                        className: "text-center space-y-4 max-w-lg mx-auto p-6 bg-blue-800 rounded-lg shadow-xl", 
                        children: [
                            _jsx("h1", { 
                                className: "text-2xl font-bold text-amber-400", 
                                children: "Something went wrong." 
                            }),
                            _jsx("p", { 
                                children: "Please refresh the page to try again." 
                            }),
                            this.state.error && (
                                _jsx("div", {
                                    className: "mt-4 p-3 bg-blue-950 rounded text-left text-sm overflow-auto max-h-40",
                                    children: this.state.error.toString()
                                })
                            ),
                            _jsx("button", { 
                                onClick: () => window.location.reload(), 
                                className: "bg-amber-400 text-blue-900 font-semibold px-4 py-2 rounded-lg hover:bg-amber-300 transition-colors", 
                                children: "Reload" 
                            })
                        ] 
                    }) 
                })
            );
        }
        return this.props.children;
    }
}

function App() {
    const params = new URLSearchParams(window.location.search);
    const DIRECT_RENDER = params.get('direct') === '1' ||
        import.meta.env.VITE_DIRECT_RENDER === 'true';
    const SKIP_AUTH = params.get('skipAuth') === '1' ||
        import.meta.env.VITE_SKIP_AUTH === 'true';
    
    console.log(`[App] init – DIRECT_RENDER=${DIRECT_RENDER} | SKIP_AUTH=${SKIP_AUTH}`);
    
    // Always wrap with AuthProvider, regardless of SKIP_AUTH setting
    // This ensures useAuth() hook always works throughout the application
    const Providers = ({ children }) => (
        _jsx(AuthProvider, { 
            children: _jsx(ChatProvider, { 
                children: children 
            }) 
        })
    );
    
    const DebugBanner = () => {
        const loc = useLocation();
        const { flags, label } = useMemo(() => {
            const f = [];
            if (DIRECT_RENDER) f.push('DIRECT');
            if (SKIP_AUTH) f.push('SKIP_AUTH');
            return { flags: f, label: f.join(' • ') };
        }, [DIRECT_RENDER, SKIP_AUTH]);
        
        if (flags.length === 0) return null;
        
        return (
            _jsxs("div", { 
                className: "fixed top-4 right-4 z-50 bg-red-600 text-white px-4 py-2 rounded-md shadow-lg text-xs", 
                children: [label, " ", _jsx("br", {}), loc.pathname] 
            })
        );
    };
    
    if (DIRECT_RENDER) {
        return (
            _jsx(ErrorBoundary, { 
                children: _jsx(Providers, { 
                    children: _jsxs("div", { 
                        className: "min-h-screen bg-gradient-to-b from-blue-900 via-blue-700 to-blue-600", 
                        children: [
                            _jsx(DebugBanner, {}), 
                            _jsx(HomePage, {}), 
                            _jsx(DebugPanel, {})
                        ] 
                    }) 
                }) 
            })
        );
    }
    
    return (
        _jsx(ErrorBoundary, { 
            children: _jsx(Providers, { 
                children: _jsxs(Router, { 
                    children: [
                        _jsx(DebugBanner, {}), 
                        _jsxs(Routes, { 
                            children: [
                                _jsx(Route, { 
                                    path: "/", 
                                    element: _jsx(HomePage, {}) 
                                }), 
                                _jsx(Route, { 
                                    path: "/debug", 
                                    element: _jsxs("div", { 
                                        className: "min-h-screen bg-slate-800 text-white p-4", 
                                        children: [
                                            _jsx("h1", { 
                                                className: "text-2xl mb-4", 
                                                children: "Debug Tools" 
                                            }), 
                                            _jsx(DebugPanel, {})
                                        ] 
                                    }) 
                                }), 
                                _jsx(Route, { 
                                    path: "*", 
                                    element: _jsx(Navigate, { 
                                        to: "/", 
                                        replace: true 
                                    }) 
                                })
                            ] 
                        })
                    ] 
                }) 
            }) 
        })
    );
}

export default App;
