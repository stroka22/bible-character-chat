import { jsx as _jsx, jsxs as _jsxs, Fragment as _Fragment } from "react/jsx-runtime";
import { useState } from 'react';
import { useNavigate, Link, useLocation } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import Footer from '../components/Footer';

const LoginPage = () => {
    const navigate = useNavigate();
    const { signIn, resetPassword, loading, error, isAdmin, isPastor, refreshProfile, } = useAuth();
    const location = useLocation();
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [formError, setFormError] = useState(null);
    const [isResettingPassword, setIsResettingPassword] = useState(false);
    const [resetEmail, setResetEmail] = useState('');
    const [resetSuccess, setResetSuccess] = useState(false);
    const handleSubmit = async (e) => {
        e.preventDefault();
        setFormError(null);
        if (!email || !password) {
            setFormError('Email and password are required');
            return;
        }
        try {
            await signIn(email, password);
            await refreshProfile();
            const target = new URLSearchParams(location.search).get('to') ||
                (isAdmin() || isPastor() ? '/admin' : '/');
            console.debug(`[LoginPage] login OK → role=${isAdmin() ? 'admin' : isPastor() ? 'pastor' : 'user'} redirect=${target}`);
            navigate(target, { replace: true });
        }
        catch (err) {
            console.error('Login error:', err);
            setFormError('Invalid email or password, please try again.');
        }
    };
    const handleResetPassword = async (e) => {
        e.preventDefault();
        setFormError(null);
        if (!resetEmail) {
            setFormError('Please enter your email address');
            return;
        }
        try {
            await resetPassword(resetEmail);
            setResetSuccess(true);
        }
        catch (err) {
            console.error('Password reset error:', err);
            setFormError('Failed to send password reset email');
        }
    };
    return (_jsxs(_Fragment, { children: [_jsx("div", { className: "flex min-h-screen items-center justify-center bg-gradient-to-b from-blue-900 via-blue-600 to-blue-400 py-12 px-4 sm:px-6 lg:px-8", children: _jsxs("div", { className: "w-full max-w-md space-y-8 rounded-lg bg-white p-8 shadow-xl", children: [_jsxs("div", { children: [_jsx("h2", { className: "mt-6 text-center text-3xl font-extrabold text-gray-900", children: isResettingPassword ? 'Reset your password' : 'Sign in to your account' }), !isResettingPassword && (_jsxs("p", { className: "mt-2 text-center text-sm text-gray-600", children: ["Don't have an account?", ' ', _jsx(Link, { to: "/signup", className: "font-medium text-primary-600 hover:text-primary-500", children: "Sign up" })] }))] }), (error || formError) && (_jsx("div", { className: "rounded-md bg-red-50 p-4", children: _jsxs("div", { className: "flex", children: [_jsx("div", { className: "flex-shrink-0", children: _jsx("svg", { className: "h-5 w-5 text-red-400", xmlns: "http://www.w3.org/2000/svg", viewBox: "0 0 20 20", fill: "currentColor", "aria-hidden": "true", children: _jsx("path", { fillRule: "evenodd", d: "M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z", clipRule: "evenodd" }) }) }), _jsx("div", { className: "ml-3", children: _jsx("h3", { className: "text-sm font-medium text-red-800", children: formError || error }) })] }) })), resetSuccess && (_jsx("div", { className: "rounded-md bg-green-50 p-4", children: _jsxs("div", { className: "flex", children: [_jsx("div", { className: "flex-shrink-0", children: _jsx("svg", { className: "h-5 w-5 text-green-400", xmlns: "http://www.w3.org/2000/svg", viewBox: "0 0 20 20", fill: "currentColor", "aria-hidden": "true", children: _jsx("path", { fillRule: "evenodd", d: "M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z", clipRule: "evenodd" }) }) }), _jsx("div", { className: "ml-3", children: _jsx("h3", { className: "text-sm font-medium text-green-800", children: "Password reset email sent. Please check your inbox." }) })] }) })), isResettingPassword ? (_jsxs("form", { className: "mt-8 space-y-6", onSubmit: handleResetPassword, children: [_jsx("div", { className: "rounded-md shadow-sm -space-y-px", children: _jsxs("div", { children: [_jsx("label", { htmlFor: "reset-email", className: "block text-sm font-medium text-gray-700", children: "Email address" }), _jsx("input", { id: "reset-email", name: "email", type: "email", autoComplete: "email", required: true, value: resetEmail, onChange: (e) => setResetEmail(e.target.value), className: "mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-primary-500 focus:outline-none focus:ring-primary-500 sm:text-sm", placeholder: "Enter your email address" })] }) }), _jsx("div", { className: "flex items-center justify-between", children: _jsx("button", { type: "button", onClick: () => setIsResettingPassword(false), className: "text-sm font-medium text-primary-600 hover:text-primary-500", children: "Back to sign in" }) }), _jsx("div", { children: _jsx("button", { type: "submit", disabled: loading, className: "group relative flex w-full justify-center rounded-md border border-transparent bg-primary-600 py-2 px-4 text-sm font-medium text-white hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2 disabled:bg-gray-400", children: loading ? 'Sending...' : 'Send reset instructions' }) })] })) : (_jsxs("form", { className: "mt-8 space-y-6", onSubmit: handleSubmit, children: [_jsxs("div", { className: "space-y-4 rounded-md shadow-sm", children: [_jsxs("div", { children: [_jsx("label", { htmlFor: "email-address", className: "block text-sm font-medium text-gray-700", children: "Email address" }), _jsx("input", { id: "email-address", name: "email", type: "email", autoComplete: "email", required: true, value: email, onChange: (e) => setEmail(e.target.value), className: "mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-primary-500 focus:outline-none focus:ring-primary-500 sm:text-sm" })] }), _jsxs("div", { children: [_jsx("label", { htmlFor: "password", className: "block text-sm font-medium text-gray-700", children: "Password" }), _jsx("input", { id: "password", name: "password", type: "password", autoComplete: "current-password", required: true, value: password, onChange: (e) => setPassword(e.target.value), className: "mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-primary-500 focus:outline-none focus:ring-primary-500 sm:text-sm" })] })] }), _jsx("div", { className: "flex items-center justify-end", children: _jsx("div", { className: "text-sm", children: _jsx("button", { type: "button", onClick: () => setIsResettingPassword(true), className: "font-medium text-primary-600 hover:text-primary-500", children: "Forgot your password?" }) }) }), _jsx("div", { children: _jsx("button", { type: "submit", disabled: loading, className: "group relative flex w-full justify-center rounded-md border border-transparent bg-primary-600 py-2 px-4 text-sm font-medium text-white hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2 disabled:bg-gray-400", children: loading ? 'Signing in...' : 'Sign in' }) })] }))] }) }), _jsxs("div", { className: "fixed bottom-2 left-1/2 -translate-x-1/2 text-xs text-white/70 pointer-events-none select-none", children: ["path: ", location.pathname] }), _jsx(Footer, {})] }));
};
export default LoginPage;
