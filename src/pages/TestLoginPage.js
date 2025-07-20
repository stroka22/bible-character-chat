import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { supabase } from '../services/supabase';
const TestLoginPage = () => {
    const navigate = useNavigate();
    const { signIn, user } = useAuth();
    const [adminEmail] = useState('admin@example.com');
    const [adminPassword] = useState('adminpassword');
    const [isAdminLoading, setIsAdminLoading] = useState(false);
    const [userEmail] = useState('test@example.com');
    const [userPassword] = useState('password123');
    const [isUserLoading, setIsUserLoading] = useState(false);
    const [error, setError] = useState(null);
    const [success, setSuccess] = useState(null);
    const handleBypassAuth = () => {
        localStorage.setItem('bypass_auth', 'true');
        window.location.reload();
    };
    const handleAdminLogin = async () => {
        setIsAdminLoading(true);
        setError(null);
        setSuccess(null);
        try {
            await signIn(adminEmail, adminPassword);
            setSuccess('Admin login successful!');
            navigate('/admin');
        }
        catch (err) {
            console.error('Admin login error:', err);
            setError(err instanceof Error ? err.message : 'Failed to login as admin');
        }
        finally {
            setIsAdminLoading(false);
        }
    };
    const handleUserLogin = async () => {
        setIsUserLoading(true);
        setError(null);
        setSuccess(null);
        try {
            await signIn(userEmail, userPassword);
            setSuccess('User login successful!');
            navigate('/');
        }
        catch (err) {
            console.error('User login error:', err);
            setError(err instanceof Error ? err.message : 'Failed to login as user');
        }
        finally {
            setIsUserLoading(false);
        }
    };
    const createTestUser = async (email, password) => {
        setError(null);
        setSuccess(null);
        try {
            const { data, error } = await supabase.auth.signUp({
                email,
                password,
            });
            if (error)
                throw error;
            if (data?.user) {
                setSuccess(`User created! ID: ${data.user.id}. You can now try to sign in.`);
            }
        }
        catch (err) {
            if (err.message?.includes('User already registered')) {
                setSuccess('This email is already registered. Try signing in instead.');
            }
            else {
                setError(`Failed to create user: ${err.message || 'Unknown error'}`);
            }
        }
    };
    if (user) {
        return (_jsx("div", { className: "flex min-h-full flex-col justify-center py-12 sm:px-6 lg:px-8 bg-gray-50", children: _jsx("div", { className: "sm:mx-auto sm:w-full sm:max-w-md", children: _jsx("div", { className: "bg-white py-8 px-4 shadow sm:rounded-lg sm:px-10", children: _jsxs("div", { className: "text-center", children: [_jsx("svg", { xmlns: "http://www.w3.org/2000/svg", className: "mx-auto h-12 w-12 text-green-500", fill: "none", viewBox: "0 0 24 24", stroke: "currentColor", children: _jsx("path", { strokeLinecap: "round", strokeLinejoin: "round", strokeWidth: 2, d: "M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" }) }), _jsx("h2", { className: "mt-2 text-lg font-medium text-gray-900", children: "Already logged in" }), _jsxs("p", { className: "mt-1 text-sm text-gray-500", children: ["You are already logged in as ", user.email, "."] }), _jsx("div", { className: "mt-6", children: _jsx(Link, { to: "/", className: "inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-primary-600 hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500", children: "Go to Home" }) })] }) }) }) }));
    }
    return (_jsxs("div", { className: "flex min-h-full flex-col justify-center py-12 sm:px-6 lg:px-8 bg-gray-50", children: [_jsxs("div", { className: "sm:mx-auto sm:w-full sm:max-w-md", children: [_jsx("h2", { className: "mt-6 text-center text-3xl font-bold tracking-tight text-gray-900", children: "Test Login Page" }), _jsx("p", { className: "mt-2 text-center text-sm text-gray-600", children: "Quick access options for testing the application" })] }), _jsx("div", { className: "mt-8 sm:mx-auto sm:w-full sm:max-w-md", children: _jsxs("div", { className: "bg-white py-8 px-4 shadow sm:rounded-lg sm:px-10", children: [error && (_jsx("div", { className: "mb-4 rounded-md bg-red-50 p-4", children: _jsxs("div", { className: "flex", children: [_jsx("div", { className: "flex-shrink-0", children: _jsx("svg", { className: "h-5 w-5 text-red-400", xmlns: "http://www.w3.org/2000/svg", viewBox: "0 0 20 20", fill: "currentColor", children: _jsx("path", { fillRule: "evenodd", d: "M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z", clipRule: "evenodd" }) }) }), _jsx("div", { className: "ml-3", children: _jsx("h3", { className: "text-sm font-medium text-red-800", children: error }) })] }) })), success && (_jsx("div", { className: "mb-4 rounded-md bg-green-50 p-4", children: _jsxs("div", { className: "flex", children: [_jsx("div", { className: "flex-shrink-0", children: _jsx("svg", { className: "h-5 w-5 text-green-400", xmlns: "http://www.w3.org/2000/svg", viewBox: "0 0 20 20", fill: "currentColor", children: _jsx("path", { fillRule: "evenodd", d: "M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z", clipRule: "evenodd" }) }) }), _jsx("div", { className: "ml-3", children: _jsx("h3", { className: "text-sm font-medium text-green-800", children: success }) })] }) })), _jsxs("div", { className: "mb-8", children: [_jsx("button", { onClick: handleBypassAuth, className: "w-full bg-yellow-500 text-white py-4 px-4 rounded-md font-bold text-lg shadow-lg hover:bg-yellow-600 transition-colors", children: "BYPASS AUTHENTICATION (TESTING ONLY)" }), _jsx("p", { className: "mt-2 text-xs text-gray-500 text-center", children: "This will enable bypass mode and reload the page" })] }), _jsxs("div", { className: "relative my-6", children: [_jsx("div", { className: "absolute inset-0 flex items-center", children: _jsx("div", { className: "w-full border-t border-gray-300" }) }), _jsx("div", { className: "relative flex justify-center text-sm", children: _jsx("span", { className: "bg-white px-2 text-gray-500", children: "Or login as" }) })] }), _jsxs("div", { className: "mb-6 p-4 border border-gray-200 rounded-md bg-gray-50", children: [_jsx("h3", { className: "font-medium text-gray-900 mb-2", children: "Admin User" }), _jsxs("div", { className: "grid grid-cols-2 gap-2 text-sm mb-3", children: [_jsx("div", { className: "text-gray-500", children: "Email:" }), _jsx("div", { className: "font-mono", children: adminEmail }), _jsx("div", { className: "text-gray-500", children: "Password:" }), _jsx("div", { className: "font-mono", children: adminPassword })] }), _jsxs("div", { className: "flex space-x-3", children: [_jsx("button", { onClick: handleAdminLogin, disabled: isAdminLoading, className: "flex-1 bg-primary-600 text-white py-2 px-4 rounded-md hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2 disabled:bg-primary-300", children: isAdminLoading ? 'Signing in...' : 'Sign in as Admin' }), _jsx("button", { onClick: () => createTestUser(adminEmail, adminPassword), className: "bg-gray-200 text-gray-700 py-2 px-4 rounded-md hover:bg-gray-300 focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-offset-2", children: "Create Admin" })] })] }), _jsxs("div", { className: "p-4 border border-gray-200 rounded-md bg-gray-50", children: [_jsx("h3", { className: "font-medium text-gray-900 mb-2", children: "Regular User" }), _jsxs("div", { className: "grid grid-cols-2 gap-2 text-sm mb-3", children: [_jsx("div", { className: "text-gray-500", children: "Email:" }), _jsx("div", { className: "font-mono", children: userEmail }), _jsx("div", { className: "text-gray-500", children: "Password:" }), _jsx("div", { className: "font-mono", children: userPassword })] }), _jsxs("div", { className: "flex space-x-3", children: [_jsx("button", { onClick: handleUserLogin, disabled: isUserLoading, className: "flex-1 bg-secondary-600 text-white py-2 px-4 rounded-md hover:bg-secondary-700 focus:outline-none focus:ring-2 focus:ring-secondary-500 focus:ring-offset-2 disabled:bg-secondary-300", children: isUserLoading ? 'Signing in...' : 'Sign in as User' }), _jsx("button", { onClick: () => createTestUser(userEmail, userPassword), className: "bg-gray-200 text-gray-700 py-2 px-4 rounded-md hover:bg-gray-300 focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-offset-2", children: "Create User" })] })] }), _jsx("div", { className: "mt-6 text-center", children: _jsx(Link, { to: "/", className: "font-medium text-primary-600 hover:text-primary-500", children: "Go back to main app" }) })] }) })] }));
};
export default TestLoginPage;
