import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
const SignupPage = () => {
    const navigate = useNavigate();
    const { signUp, loading, error } = useAuth();
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [displayName, setDisplayName] = useState('');
    const [formError, setFormError] = useState(null);
    const [successMessage, setSuccessMessage] = useState(null);
    const handleSubmit = async (e) => {
        e.preventDefault();
        setFormError(null);
        setSuccessMessage(null);
        if (!email || !password || !confirmPassword || !displayName) {
            setFormError('All fields are required');
            return;
        }
        if (password !== confirmPassword) {
            setFormError('Passwords do not match');
            return;
        }
        if (password.length < 8) {
            setFormError('Password must be at least 8 characters long');
            return;
        }
        try {
            await signUp(email, password);
            setSuccessMessage('Account created successfully! You can now log in.');
            setTimeout(() => {
                navigate('/login');
            }, 2000);
        }
        catch (err) {
            console.error('Signup error:', err);
        }
    };
    return (_jsx("div", { className: "flex min-h-screen items-center justify-center bg-gradient-to-b from-blue-900 via-blue-600 to-blue-400 py-12 px-4 sm:px-6 lg:px-8", children: _jsxs("div", { className: "w-full max-w-md space-y-8 rounded-lg bg-white p-8 shadow-xl", children: [_jsxs("div", { children: [_jsx("h2", { className: "mt-6 text-center text-3xl font-extrabold text-gray-900", children: "Create your account" }), _jsxs("p", { className: "mt-2 text-center text-sm text-gray-600", children: ["Already have an account?", ' ', _jsx(Link, { to: "/login", className: "font-medium text-primary-600 hover:text-primary-500", children: "Sign in" })] })] }), (error || formError) && (_jsx("div", { className: "rounded-md bg-red-50 p-4", children: _jsxs("div", { className: "flex", children: [_jsx("div", { className: "flex-shrink-0", children: _jsx("svg", { className: "h-5 w-5 text-red-400", xmlns: "http://www.w3.org/2000/svg", viewBox: "0 0 20 20", fill: "currentColor", "aria-hidden": "true", children: _jsx("path", { fillRule: "evenodd", d: "M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z", clipRule: "evenodd" }) }) }), _jsx("div", { className: "ml-3", children: _jsx("h3", { className: "text-sm font-medium text-red-800", children: formError || error }) })] }) })), successMessage && (_jsx("div", { className: "rounded-md bg-green-50 p-4", children: _jsxs("div", { className: "flex", children: [_jsx("div", { className: "flex-shrink-0", children: _jsx("svg", { className: "h-5 w-5 text-green-400", xmlns: "http://www.w3.org/2000/svg", viewBox: "0 0 20 20", fill: "currentColor", "aria-hidden": "true", children: _jsx("path", { fillRule: "evenodd", d: "M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z", clipRule: "evenodd" }) }) }), _jsx("div", { className: "ml-3", children: _jsx("h3", { className: "text-sm font-medium text-green-800", children: successMessage }) })] }) })), _jsxs("form", { className: "mt-8 space-y-6", onSubmit: handleSubmit, children: [_jsxs("div", { className: "space-y-4 rounded-md shadow-sm", children: [_jsxs("div", { children: [_jsx("label", { htmlFor: "display-name", className: "block text-sm font-medium text-gray-700", children: "Display Name" }), _jsx("input", { id: "display-name", name: "displayName", type: "text", autoComplete: "name", required: true, value: displayName, onChange: (e) => setDisplayName(e.target.value), className: "mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-primary-500 focus:outline-none focus:ring-primary-500 sm:text-sm" })] }), _jsxs("div", { children: [_jsx("label", { htmlFor: "email-address", className: "block text-sm font-medium text-gray-700", children: "Email address" }), _jsx("input", { id: "email-address", name: "email", type: "email", autoComplete: "email", required: true, value: email, onChange: (e) => setEmail(e.target.value), className: "mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-primary-500 focus:outline-none focus:ring-primary-500 sm:text-sm" })] }), _jsxs("div", { children: [_jsx("label", { htmlFor: "password", className: "block text-sm font-medium text-gray-700", children: "Password" }), _jsx("input", { id: "password", name: "password", type: "password", autoComplete: "new-password", required: true, value: password, onChange: (e) => setPassword(e.target.value), className: "mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-primary-500 focus:outline-none focus:ring-primary-500 sm:text-sm" })] }), _jsxs("div", { children: [_jsx("label", { htmlFor: "confirm-password", className: "block text-sm font-medium text-gray-700", children: "Confirm Password" }), _jsx("input", { id: "confirm-password", name: "confirmPassword", type: "password", autoComplete: "new-password", required: true, value: confirmPassword, onChange: (e) => setConfirmPassword(e.target.value), className: "mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-primary-500 focus:outline-none focus:ring-primary-500 sm:text-sm" })] })] }), _jsx("div", { children: _jsx("button", { type: "submit", disabled: loading, className: "group relative flex w-full justify-center rounded-md border border-transparent bg-primary-600 py-2 px-4 text-sm font-medium text-white hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2 disabled:bg-gray-400", children: loading ? 'Creating account...' : 'Sign up' }) })] })] }) }));
};
export default SignupPage;
