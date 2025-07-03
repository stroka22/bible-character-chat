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
import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { supabase } from '../services/supabase';
/**
 * TestLoginPage provides quick access options for testing the application
 * with different user roles or bypassing authentication entirely.
 */
var TestLoginPage = function () {
    var navigate = useNavigate();
    var _a = useAuth(), signIn = _a.signIn, user = _a.user;
    // State for admin login
    var adminEmail = useState('admin@example.com')[0];
    var adminPassword = useState('adminpassword')[0];
    var _b = useState(false), isAdminLoading = _b[0], setIsAdminLoading = _b[1];
    // State for regular user login
    var userEmail = useState('test@example.com')[0];
    var userPassword = useState('password123')[0];
    var _c = useState(false), isUserLoading = _c[0], setIsUserLoading = _c[1];
    // State for error and success messages
    var _d = useState(null), error = _d[0], setError = _d[1];
    var _e = useState(null), success = _e[0], setSuccess = _e[1];
    // Handle bypass authentication
    var handleBypassAuth = function () {
        localStorage.setItem('bypass_auth', 'true');
        window.location.reload(); // Reload to apply bypass
    };
    // Handle admin login
    var handleAdminLogin = function () { return __awaiter(void 0, void 0, void 0, function () {
        var err_1;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    setIsAdminLoading(true);
                    setError(null);
                    setSuccess(null);
                    _a.label = 1;
                case 1:
                    _a.trys.push([1, 3, 4, 5]);
                    return [4 /*yield*/, signIn(adminEmail, adminPassword)];
                case 2:
                    _a.sent();
                    setSuccess('Admin login successful!');
                    navigate('/admin'); // Redirect to admin page
                    return [3 /*break*/, 5];
                case 3:
                    err_1 = _a.sent();
                    console.error('Admin login error:', err_1);
                    setError(err_1 instanceof Error ? err_1.message : 'Failed to login as admin');
                    return [3 /*break*/, 5];
                case 4:
                    setIsAdminLoading(false);
                    return [7 /*endfinally*/];
                case 5: return [2 /*return*/];
            }
        });
    }); };
    // Handle regular user login
    var handleUserLogin = function () { return __awaiter(void 0, void 0, void 0, function () {
        var err_2;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    setIsUserLoading(true);
                    setError(null);
                    setSuccess(null);
                    _a.label = 1;
                case 1:
                    _a.trys.push([1, 3, 4, 5]);
                    return [4 /*yield*/, signIn(userEmail, userPassword)];
                case 2:
                    _a.sent();
                    setSuccess('User login successful!');
                    navigate('/'); // Redirect to home page
                    return [3 /*break*/, 5];
                case 3:
                    err_2 = _a.sent();
                    console.error('User login error:', err_2);
                    setError(err_2 instanceof Error ? err_2.message : 'Failed to login as user');
                    return [3 /*break*/, 5];
                case 4:
                    setIsUserLoading(false);
                    return [7 /*endfinally*/];
                case 5: return [2 /*return*/];
            }
        });
    }); };
    // Create test user function
    var createTestUser = function (email, password) { return __awaiter(void 0, void 0, void 0, function () {
        var _a, data, error_1, err_3;
        var _b;
        return __generator(this, function (_c) {
            switch (_c.label) {
                case 0:
                    setError(null);
                    setSuccess(null);
                    _c.label = 1;
                case 1:
                    _c.trys.push([1, 3, , 4]);
                    return [4 /*yield*/, supabase.auth.signUp({
                            email: email,
                            password: password,
                        })];
                case 2:
                    _a = _c.sent(), data = _a.data, error_1 = _a.error;
                    if (error_1)
                        throw error_1;
                    if (data === null || data === void 0 ? void 0 : data.user) {
                        setSuccess("User created! ID: ".concat(data.user.id, ". You can now try to sign in."));
                    }
                    return [3 /*break*/, 4];
                case 3:
                    err_3 = _c.sent();
                    if ((_b = err_3.message) === null || _b === void 0 ? void 0 : _b.includes('User already registered')) {
                        setSuccess('This email is already registered. Try signing in instead.');
                    }
                    else {
                        setError("Failed to create user: ".concat(err_3.message || 'Unknown error'));
                    }
                    return [3 /*break*/, 4];
                case 4: return [2 /*return*/];
            }
        });
    }); };
    // If user is already logged in, show a different message
    if (user) {
        return (_jsx("div", { className: "flex min-h-full flex-col justify-center py-12 sm:px-6 lg:px-8 bg-gray-50", children: _jsx("div", { className: "sm:mx-auto sm:w-full sm:max-w-md", children: _jsx("div", { className: "bg-white py-8 px-4 shadow sm:rounded-lg sm:px-10", children: _jsxs("div", { className: "text-center", children: [_jsx("svg", { xmlns: "http://www.w3.org/2000/svg", className: "mx-auto h-12 w-12 text-green-500", fill: "none", viewBox: "0 0 24 24", stroke: "currentColor", children: _jsx("path", { strokeLinecap: "round", strokeLinejoin: "round", strokeWidth: 2, d: "M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" }) }), _jsx("h2", { className: "mt-2 text-lg font-medium text-gray-900", children: "Already logged in" }), _jsxs("p", { className: "mt-1 text-sm text-gray-500", children: ["You are already logged in as ", user.email, "."] }), _jsx("div", { className: "mt-6", children: _jsx(Link, { to: "/", className: "inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-primary-600 hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500", children: "Go to Home" }) })] }) }) }) }));
    }
    return (_jsxs("div", { className: "flex min-h-full flex-col justify-center py-12 sm:px-6 lg:px-8 bg-gray-50", children: [_jsxs("div", { className: "sm:mx-auto sm:w-full sm:max-w-md", children: [_jsx("h2", { className: "mt-6 text-center text-3xl font-bold tracking-tight text-gray-900", children: "Test Login Page" }), _jsx("p", { className: "mt-2 text-center text-sm text-gray-600", children: "Quick access options for testing the application" })] }), _jsx("div", { className: "mt-8 sm:mx-auto sm:w-full sm:max-w-md", children: _jsxs("div", { className: "bg-white py-8 px-4 shadow sm:rounded-lg sm:px-10", children: [error && (_jsx("div", { className: "mb-4 rounded-md bg-red-50 p-4", children: _jsxs("div", { className: "flex", children: [_jsx("div", { className: "flex-shrink-0", children: _jsx("svg", { className: "h-5 w-5 text-red-400", xmlns: "http://www.w3.org/2000/svg", viewBox: "0 0 20 20", fill: "currentColor", children: _jsx("path", { fillRule: "evenodd", d: "M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z", clipRule: "evenodd" }) }) }), _jsx("div", { className: "ml-3", children: _jsx("h3", { className: "text-sm font-medium text-red-800", children: error }) })] }) })), success && (_jsx("div", { className: "mb-4 rounded-md bg-green-50 p-4", children: _jsxs("div", { className: "flex", children: [_jsx("div", { className: "flex-shrink-0", children: _jsx("svg", { className: "h-5 w-5 text-green-400", xmlns: "http://www.w3.org/2000/svg", viewBox: "0 0 20 20", fill: "currentColor", children: _jsx("path", { fillRule: "evenodd", d: "M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z", clipRule: "evenodd" }) }) }), _jsx("div", { className: "ml-3", children: _jsx("h3", { className: "text-sm font-medium text-green-800", children: success }) })] }) })), _jsxs("div", { className: "mb-8", children: [_jsx("button", { onClick: handleBypassAuth, className: "w-full bg-yellow-500 text-white py-4 px-4 rounded-md font-bold text-lg shadow-lg hover:bg-yellow-600 transition-colors", children: "BYPASS AUTHENTICATION (TESTING ONLY)" }), _jsx("p", { className: "mt-2 text-xs text-gray-500 text-center", children: "This will enable bypass mode and reload the page" })] }), _jsxs("div", { className: "relative my-6", children: [_jsx("div", { className: "absolute inset-0 flex items-center", children: _jsx("div", { className: "w-full border-t border-gray-300" }) }), _jsx("div", { className: "relative flex justify-center text-sm", children: _jsx("span", { className: "bg-white px-2 text-gray-500", children: "Or login as" }) })] }), _jsxs("div", { className: "mb-6 p-4 border border-gray-200 rounded-md bg-gray-50", children: [_jsx("h3", { className: "font-medium text-gray-900 mb-2", children: "Admin User" }), _jsxs("div", { className: "grid grid-cols-2 gap-2 text-sm mb-3", children: [_jsx("div", { className: "text-gray-500", children: "Email:" }), _jsx("div", { className: "font-mono", children: adminEmail }), _jsx("div", { className: "text-gray-500", children: "Password:" }), _jsx("div", { className: "font-mono", children: adminPassword })] }), _jsxs("div", { className: "flex space-x-3", children: [_jsx("button", { onClick: handleAdminLogin, disabled: isAdminLoading, className: "flex-1 bg-primary-600 text-white py-2 px-4 rounded-md hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2 disabled:bg-primary-300", children: isAdminLoading ? 'Signing in...' : 'Sign in as Admin' }), _jsx("button", { onClick: function () { return createTestUser(adminEmail, adminPassword); }, className: "bg-gray-200 text-gray-700 py-2 px-4 rounded-md hover:bg-gray-300 focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-offset-2", children: "Create Admin" })] })] }), _jsxs("div", { className: "p-4 border border-gray-200 rounded-md bg-gray-50", children: [_jsx("h3", { className: "font-medium text-gray-900 mb-2", children: "Regular User" }), _jsxs("div", { className: "grid grid-cols-2 gap-2 text-sm mb-3", children: [_jsx("div", { className: "text-gray-500", children: "Email:" }), _jsx("div", { className: "font-mono", children: userEmail }), _jsx("div", { className: "text-gray-500", children: "Password:" }), _jsx("div", { className: "font-mono", children: userPassword })] }), _jsxs("div", { className: "flex space-x-3", children: [_jsx("button", { onClick: handleUserLogin, disabled: isUserLoading, className: "flex-1 bg-secondary-600 text-white py-2 px-4 rounded-md hover:bg-secondary-700 focus:outline-none focus:ring-2 focus:ring-secondary-500 focus:ring-offset-2 disabled:bg-secondary-300", children: isUserLoading ? 'Signing in...' : 'Sign in as User' }), _jsx("button", { onClick: function () { return createTestUser(userEmail, userPassword); }, className: "bg-gray-200 text-gray-700 py-2 px-4 rounded-md hover:bg-gray-300 focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-offset-2", children: "Create User" })] })] }), _jsx("div", { className: "mt-6 text-center", children: _jsx(Link, { to: "/", className: "font-medium text-primary-600 hover:text-primary-500", children: "Go back to main app" }) })] }) })] }));
};
export default TestLoginPage;
