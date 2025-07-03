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
import { useState, useEffect } from 'react';
import { BrowserRouter, Routes, Route, Navigate, Link } from 'react-router-dom';
import { AuthProvider } from './contexts/AuthContext';
import { ChatProvider } from './contexts/ChatContext';
import { useAuth } from './contexts/AuthContext';
import HomePage from './pages/HomePage';
import ConversationsPage from './pages/ConversationsPage';
import AdminPage from './pages/AdminPage';
import TestLoginPage from './pages/TestLoginPage'; // <- added
import PricingPage from './pages/PricingPage'; // <- added
import Header from './components/layout/Header';
import { supabase } from './services/supabase';
// Direct login component with enhanced error reporting and troubleshooting
var DirectLogin = function () {
    var user = useAuth().user;
    var _a = useState('test@example.com'), email = _a[0], setEmail = _a[1];
    var _b = useState('password123'), password = _b[0], setPassword = _b[1];
    var _c = useState(false), isLoading = _c[0], setIsLoading = _c[1];
    var _d = useState(false), isCreating = _d[0], setIsCreating = _d[1];
    var _e = useState(null), error = _e[0], setError = _e[1];
    var _f = useState(null), success = _f[0], setSuccess = _f[1];
    var _g = useState(null), debugInfo = _g[0], setDebugInfo = _g[1];
    var _h = useState(false), showDebug = _h[0], setShowDebug = _h[1];
    var _j = useState(false), bypassAuth = _j[0], setBypassAuth = _j[1];
    // Check session on component mount
    useEffect(function () {
        var checkSession = function () { return __awaiter(void 0, void 0, void 0, function () {
            var data;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, supabase.auth.getSession()];
                    case 1:
                        data = (_a.sent()).data;
                        if (data.session) {
                            setDebugInfo("Active session detected for: ".concat(data.session.user.email));
                        }
                        else {
                            setDebugInfo('No active session found');
                        }
                        return [2 /*return*/];
                }
            });
        }); };
        checkSession();
    }, []);
    var handleLogin = function (e) { return __awaiter(void 0, void 0, void 0, function () {
        var _a, data, error_1, err_1;
        return __generator(this, function (_b) {
            switch (_b.label) {
                case 0:
                    e.preventDefault();
                    setIsLoading(true);
                    setError(null);
                    setSuccess(null);
                    setDebugInfo(null);
                    _b.label = 1;
                case 1:
                    _b.trys.push([1, 3, 4, 5]);
                    return [4 /*yield*/, supabase.auth.signInWithPassword({
                            email: email,
                            password: password,
                        })];
                case 2:
                    _a = _b.sent(), data = _a.data, error_1 = _a.error;
                    if (error_1)
                        throw error_1;
                    if (data === null || data === void 0 ? void 0 : data.user) {
                        setSuccess("Successfully logged in as ".concat(data.user.email, "!"));
                        setDebugInfo("Auth session established. User ID: ".concat(data.user.id));
                    }
                    return [3 /*break*/, 5];
                case 3:
                    err_1 = _b.sent();
                    setError("Login failed: ".concat(err_1.message || 'Unknown error'));
                    setDebugInfo(JSON.stringify(err_1, null, 2));
                    return [3 /*break*/, 5];
                case 4:
                    setIsLoading(false);
                    return [7 /*endfinally*/];
                case 5: return [2 /*return*/];
            }
        });
    }); };
    // Function to create test user directly through Supabase API
    var createTestUser = function () { return __awaiter(void 0, void 0, void 0, function () {
        var _a, data, error_2, err_2;
        var _b;
        return __generator(this, function (_c) {
            switch (_c.label) {
                case 0:
                    setIsCreating(true);
                    setError(null);
                    setSuccess(null);
                    setDebugInfo(null);
                    _c.label = 1;
                case 1:
                    _c.trys.push([1, 3, 4, 5]);
                    return [4 /*yield*/, supabase.auth.signUp({
                            email: email,
                            password: password,
                        })];
                case 2:
                    _a = _c.sent(), data = _a.data, error_2 = _a.error;
                    if (error_2)
                        throw error_2;
                    if (data === null || data === void 0 ? void 0 : data.user) {
                        setSuccess("User created! ID: ".concat(data.user.id));
                        setDebugInfo("User created but may need email verification.\n          Email confirmation status: ".concat(data.user.email_confirmed_at ? 'Confirmed' : 'Not confirmed', "\n          Created at: ").concat(data.user.created_at, "\n          You can now try to sign in."));
                    }
                    return [3 /*break*/, 5];
                case 3:
                    err_2 = _c.sent();
                    if ((_b = err_2.message) === null || _b === void 0 ? void 0 : _b.includes('User already registered')) {
                        setSuccess('This email is already registered. Try signing in instead.');
                    }
                    else {
                        setError("Failed to create user: ".concat(err_2.message || 'Unknown error'));
                        setDebugInfo(JSON.stringify(err_2, null, 2));
                    }
                    return [3 /*break*/, 5];
                case 4:
                    setIsCreating(false);
                    return [7 /*endfinally*/];
                case 5: return [2 /*return*/];
            }
        });
    }); };
    // Reset password function
    var resetPassword = function () { return __awaiter(void 0, void 0, void 0, function () {
        var error_3, err_3;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    setIsLoading(true);
                    setError(null);
                    setSuccess(null);
                    setDebugInfo(null);
                    _a.label = 1;
                case 1:
                    _a.trys.push([1, 3, 4, 5]);
                    return [4 /*yield*/, supabase.auth.resetPasswordForEmail(email, {
                            redirectTo: window.location.origin,
                        })];
                case 2:
                    error_3 = (_a.sent()).error;
                    if (error_3)
                        throw error_3;
                    setSuccess("Password reset email sent to ".concat(email));
                    return [3 /*break*/, 5];
                case 3:
                    err_3 = _a.sent();
                    setError("Failed to send reset email: ".concat(err_3.message || 'Unknown error'));
                    setDebugInfo(JSON.stringify(err_3, null, 2));
                    return [3 /*break*/, 5];
                case 4:
                    setIsLoading(false);
                    return [7 /*endfinally*/];
                case 5: return [2 /*return*/];
            }
        });
    }); };
    // Bypass auth for testing
    var enableBypass = function () {
        setBypassAuth(true);
        localStorage.setItem('bypass_auth', 'true');
    };
    // If bypass is enabled, return null to skip the login screen
    if (bypassAuth) {
        return null;
    }
    return (_jsxs("div", { className: "max-w-lg mx-auto mt-10 p-6 bg-white rounded-lg shadow-lg", children: [_jsx("h2", { className: "text-2xl font-bold mb-6 text-center", children: "Bible Character Chat" }), _jsx("p", { className: "text-center text-gray-600 mb-6", children: "Authentication Troubleshooter" }), error && (_jsxs("div", { className: "mb-4 p-4 bg-red-100 text-red-700 rounded border border-red-300", children: [_jsx("p", { className: "font-bold", children: "Error:" }), _jsx("p", { children: error })] })), success && (_jsxs("div", { className: "mb-4 p-4 bg-green-100 text-green-700 rounded border border-green-300", children: [_jsx("p", { className: "font-bold", children: "Success:" }), _jsx("p", { children: success })] })), _jsxs("form", { onSubmit: handleLogin, className: "mb-6", children: [_jsxs("div", { className: "mb-4", children: [_jsx("label", { className: "block text-gray-700 mb-2 font-medium", children: "Email" }), _jsx("input", { type: "email", value: email, onChange: function (e) { return setEmail(e.target.value); }, className: "w-full p-3 border rounded focus:ring-2 focus:ring-primary-300 focus:border-primary-500 outline-none transition", required: true })] }), _jsxs("div", { className: "mb-6", children: [_jsx("label", { className: "block text-gray-700 mb-2 font-medium", children: "Password" }), _jsx("input", { type: "password", value: password, onChange: function (e) { return setPassword(e.target.value); }, className: "w-full p-3 border rounded focus:ring-2 focus:ring-primary-300 focus:border-primary-500 outline-none transition", required: true })] }), _jsxs("div", { className: "grid grid-cols-1 md:grid-cols-2 gap-4 mb-6", children: [_jsx("button", { type: "submit", disabled: isLoading, className: "bg-primary-600 text-white py-3 px-4 rounded font-medium hover:bg-primary-700 disabled:bg-gray-400 transition", children: isLoading ? 'Signing in...' : 'Sign In' }), _jsx("button", { type: "button", onClick: createTestUser, disabled: isCreating, className: "bg-secondary-600 text-white py-3 px-4 rounded font-medium hover:bg-secondary-700 disabled:bg-gray-400 transition", children: isCreating ? 'Creating...' : 'Create Test User' })] })] }), _jsxs("div", { className: "flex flex-col md:flex-row justify-between items-center mb-6", children: [_jsx("button", { onClick: resetPassword, className: "text-primary-600 hover:text-primary-800 mb-4 md:mb-0", children: "Reset Password" }), _jsx("button", { onClick: enableBypass, className: "text-gray-600 hover:text-gray-800 underline text-sm", children: "Bypass Authentication (Testing Only)" })] }), _jsxs("div", { className: "mt-8 border-t pt-4", children: [_jsxs("button", { onClick: function () { return setShowDebug(!showDebug); }, className: "text-gray-500 text-sm flex items-center", children: [_jsx("svg", { xmlns: "http://www.w3.org/2000/svg", className: "h-4 w-4 mr-1 transition-transform ".concat(showDebug ? 'rotate-90' : ''), fill: "none", viewBox: "0 0 24 24", stroke: "currentColor", children: _jsx("path", { strokeLinecap: "round", strokeLinejoin: "round", strokeWidth: 2, d: "M9 5l7 7-7 7" }) }), "Debug Information"] }), showDebug && debugInfo && (_jsx("pre", { className: "mt-2 p-3 bg-gray-100 text-gray-800 rounded text-xs overflow-x-auto", children: debugInfo }))] })] }));
};
// Main App Component with routes
function App() {
    var _a = useState(false), bypassAuth = _a[0], setBypassAuth = _a[1];
    // Check for bypass auth on component mount
    useEffect(function () {
        var bypass = localStorage.getItem('bypass_auth') === 'true';
        setBypassAuth(bypass);
    }, []);
    // Auth-aware content component
    var MainContent = function () {
        var user = useAuth().user;
        var _a = useState(false), showConversations = _a[0], setShowConversations = _a[1];
        // If not authenticated and not in bypass mode, show login
        if (!user && !bypassAuth) {
            return _jsx(DirectLogin, {});
        }
        return (_jsxs("div", { className: "flex-grow flex flex-col", children: [_jsx("div", { className: "bg-white border-b border-gray-200 p-4 flex justify-center", children: _jsxs("div", { className: "inline-flex rounded-md shadow-sm", role: "group", children: [_jsx("button", { type: "button", onClick: function () { return setShowConversations(false); }, className: "px-4 py-2 text-sm font-medium rounded-l-lg ".concat(!showConversations
                                    ? 'bg-primary-600 text-white'
                                    : 'bg-white text-gray-700 hover:bg-gray-100'), children: "Chat with Characters" }), _jsx("button", { type: "button", onClick: function () { return setShowConversations(true); }, className: "px-4 py-2 text-sm font-medium rounded-r-lg ".concat(showConversations
                                    ? 'bg-primary-600 text-white'
                                    : 'bg-white text-gray-700 hover:bg-gray-100'), children: "Saved Conversations" })] }) }), _jsx("div", { className: "flex-grow", children: _jsxs(Routes, { children: [_jsx(Route, { path: "/", element: showConversations ? _jsx(ConversationsPage, {}) : _jsx(HomePage, {}) }), _jsx(Route, { path: "/pricing", element: _jsx(PricingPage, {}) }), _jsx(Route, { path: "/test-login", element: _jsx(TestLoginPage, {}) }), _jsx(Route, { path: "/admin", element: _jsx(AdminPage, {}) }), _jsx(Route, { path: "/admin/characters", element: _jsx(AdminPage, {}) }), _jsx(Route, { path: "*", element: _jsx(Navigate, { to: "/", replace: true }) })] }) })] }));
    };
    return (_jsx(BrowserRouter, { children: _jsx(AuthProvider, { children: _jsx(ChatProvider, { children: _jsxs("div", { "data-design": "vivid-purple", 
                    /* Revert to the preferred blue gradient */
                    className: "flex min-h-screen flex-col bg-gradient-to-b from-blue-900 via-blue-600 to-blue-400", children: [_jsx("div", { className: "fixed top-0 left-0 w-full z-[10000] bg-amber-400 text-blue-900 shadow-lg border-b-2 border-amber-500", children: _jsxs("div", { className: "container mx-auto px-4 py-3 flex flex-col md:flex-row items-center justify-center gap-4", children: [_jsx("span", { className: "text-lg md:text-xl font-extrabold tracking-wide text-center", children: "UPGRADE TO PREMIUM \u00A0\u2013\u00A0 Unlock unlimited chats and the full character library!" }), _jsx(Link, { to: "/pricing", className: "rounded-full bg-blue-900 text-amber-300 font-bold px-6 py-2 hover:bg-blue-800 transition-colors shadow-md", children: "View Pricing" })] }) }), _jsx(Header, {}), _jsx("main", { className: "flex-grow", children: _jsxs(Routes, { children: [_jsx(Route, { path: "/pricing", element: _jsx(PricingPage, {}) }), _jsx(Route, { path: "/*", element: _jsx(MainContent, {}) })] }) })] }) }) }) }));
}
export default App;
