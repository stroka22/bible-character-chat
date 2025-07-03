var __assign = (this && this.__assign) || function () {
    __assign = Object.assign || function(t) {
        for (var s, i = 1, n = arguments.length; i < n; i++) {
            s = arguments[i];
            for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p))
                t[p] = s[p];
        }
        return t;
    };
    return __assign.apply(this, arguments);
};
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
import { jsx as _jsx } from "react/jsx-runtime";
import { createContext, useContext, useState, useEffect } from 'react';
import { supabase } from '../services/supabase';
// Create the context with a default value
var AuthContext = createContext(undefined);
// Provider component that wraps the app and makes auth available to any child component
export function AuthProvider(_a) {
    var _this = this;
    var children = _a.children;
    var _b = useState(null), session = _b[0], setSession = _b[1];
    var _c = useState(null), user = _c[0], setUser = _c[1];
    var _d = useState(true), loading = _d[0], setLoading = _d[1];
    var _e = useState(null), error = _e[0], setError = _e[1];
    // Initialize the auth state when the component mounts
    useEffect(function () {
        // Get the current session
        // We keep a reference to whatever unsubscribe function the auth listener
        // gives us so the effect can clean it up **synchronously**, instead of
        // trying to await an async function’s return value.
        var cleanup;
        var initAuth = function () { return __awaiter(_this, void 0, void 0, function () {
            var currentSession, subscription_1, error_1;
            var _a;
            return __generator(this, function (_b) {
                switch (_b.label) {
                    case 0:
                        _b.trys.push([0, 3, 4, 5]);
                        setLoading(true);
                        return [4 /*yield*/, supabase.auth.getSession()];
                    case 1:
                        currentSession = (_b.sent()).data.session;
                        setSession(currentSession);
                        setUser((_a = currentSession === null || currentSession === void 0 ? void 0 : currentSession.user) !== null && _a !== void 0 ? _a : null);
                        return [4 /*yield*/, supabase.auth.onAuthStateChange(function (_event, newSession) {
                                var _a;
                                setSession(newSession);
                                setUser((_a = newSession === null || newSession === void 0 ? void 0 : newSession.user) !== null && _a !== void 0 ? _a : null);
                            })];
                    case 2:
                        subscription_1 = (_b.sent()).data.subscription;
                        // Assign the unsubscribe function so it can be called later
                        cleanup = function () { return subscription_1.unsubscribe(); };
                        return [3 /*break*/, 5];
                    case 3:
                        error_1 = _b.sent();
                        if (error_1 instanceof Error) {
                            setError(error_1.message);
                        }
                        else {
                            setError('An unknown error occurred');
                        }
                        return [3 /*break*/, 5];
                    case 4:
                        setLoading(false);
                        return [7 /*endfinally*/];
                    case 5: return [2 /*return*/];
                }
            });
        }); };
        // Kick off the async auth initialisation
        initAuth();
        // Clean up subscription on unmount
        return function () {
            if (cleanup)
                cleanup();
        };
    }, []);
    // Sign in with email and password
    var signIn = function (email, password) { return __awaiter(_this, void 0, void 0, function () {
        var error_3, error_2;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    _a.trys.push([0, 2, 3, 4]);
                    setLoading(true);
                    setError(null);
                    return [4 /*yield*/, supabase.auth.signInWithPassword({
                            email: email,
                            password: password,
                        })];
                case 1:
                    error_3 = (_a.sent()).error;
                    if (error_3) {
                        throw error_3;
                    }
                    return [3 /*break*/, 4];
                case 2:
                    error_2 = _a.sent();
                    if (error_2 instanceof Error) {
                        setError(error_2.message);
                    }
                    else {
                        setError('Failed to sign in');
                    }
                    throw error_2;
                case 3:
                    setLoading(false);
                    return [7 /*endfinally*/];
                case 4: return [2 /*return*/];
            }
        });
    }); };
    // Sign up with email and password
    var signUp = function (email, password) { return __awaiter(_this, void 0, void 0, function () {
        var error_5, error_4;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    _a.trys.push([0, 2, 3, 4]);
                    setLoading(true);
                    setError(null);
                    return [4 /*yield*/, supabase.auth.signUp({
                            email: email,
                            password: password,
                        })];
                case 1:
                    error_5 = (_a.sent()).error;
                    if (error_5) {
                        throw error_5;
                    }
                    return [3 /*break*/, 4];
                case 2:
                    error_4 = _a.sent();
                    if (error_4 instanceof Error) {
                        setError(error_4.message);
                    }
                    else {
                        setError('Failed to sign up');
                    }
                    throw error_4;
                case 3:
                    setLoading(false);
                    return [7 /*endfinally*/];
                case 4: return [2 /*return*/];
            }
        });
    }); };
    // Sign out
    var signOut = function () { return __awaiter(_this, void 0, void 0, function () {
        var error_7, error_6;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    _a.trys.push([0, 2, 3, 4]);
                    setLoading(true);
                    setError(null);
                    return [4 /*yield*/, supabase.auth.signOut()];
                case 1:
                    error_7 = (_a.sent()).error;
                    if (error_7) {
                        throw error_7;
                    }
                    return [3 /*break*/, 4];
                case 2:
                    error_6 = _a.sent();
                    if (error_6 instanceof Error) {
                        setError(error_6.message);
                    }
                    else {
                        setError('Failed to sign out');
                    }
                    throw error_6;
                case 3:
                    setLoading(false);
                    return [7 /*endfinally*/];
                case 4: return [2 /*return*/];
            }
        });
    }); };
    // Reset password
    var resetPassword = function (email) { return __awaiter(_this, void 0, void 0, function () {
        var error_9, error_8;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    _a.trys.push([0, 2, 3, 4]);
                    setLoading(true);
                    setError(null);
                    return [4 /*yield*/, supabase.auth.resetPasswordForEmail(email, {
                            redirectTo: "".concat(window.location.origin, "/reset-password"),
                        })];
                case 1:
                    error_9 = (_a.sent()).error;
                    if (error_9) {
                        throw error_9;
                    }
                    return [3 /*break*/, 4];
                case 2:
                    error_8 = _a.sent();
                    if (error_8 instanceof Error) {
                        setError(error_8.message);
                    }
                    else {
                        setError('Failed to send password reset email');
                    }
                    throw error_8;
                case 3:
                    setLoading(false);
                    return [7 /*endfinally*/];
                case 4: return [2 /*return*/];
            }
        });
    }); };
    // Update user profile
    var updateProfile = function (data) { return __awaiter(_this, void 0, void 0, function () {
        var error_11, error_10;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    _a.trys.push([0, 2, 3, 4]);
                    setLoading(true);
                    setError(null);
                    if (!user) {
                        throw new Error('No user logged in');
                    }
                    return [4 /*yield*/, supabase
                            .from('users')
                            .upsert(__assign(__assign({ id: user.id }, data), { updated_at: new Date().toISOString() }))];
                case 1:
                    error_11 = (_a.sent()).error;
                    if (error_11) {
                        throw error_11;
                    }
                    return [3 /*break*/, 4];
                case 2:
                    error_10 = _a.sent();
                    if (error_10 instanceof Error) {
                        setError(error_10.message);
                    }
                    else {
                        setError('Failed to update profile');
                    }
                    throw error_10;
                case 3:
                    setLoading(false);
                    return [7 /*endfinally*/];
                case 4: return [2 /*return*/];
            }
        });
    }); };
    // Create the value object that will be provided to consumers
    var value = {
        session: session,
        user: user,
        loading: loading,
        error: error,
        signIn: signIn,
        signUp: signUp,
        signOut: signOut,
        resetPassword: resetPassword,
        updateProfile: updateProfile,
    };
    // Provide the auth context to children components
    return _jsx(AuthContext.Provider, { value: value, children: children });
}
// Custom hook to use the auth context
export function useAuth() {
    var context = useContext(AuthContext);
    if (context === undefined) {
        throw new Error('useAuth must be used within an AuthProvider');
    }
    return context;
}
