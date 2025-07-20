import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { Link } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
const AccessDeniedPage = () => {
    const { user, role, refreshProfile, signOut } = useAuth();
    const handleRefresh = async () => {
        try {
            await refreshProfile();
        }
        catch (err) {
        }
    };
    const handleLogout = async () => {
        try {
            await signOut();
        }
        finally {
            localStorage.clear();
            window.location.href = '/login';
        }
    };
    return (_jsx("div", { className: "min-h-screen bg-gray-50 flex flex-col justify-center py-12 sm:px-6 lg:px-8", children: _jsx("div", { className: "sm:mx-auto sm:w-full sm:max-w-md", children: _jsx("div", { className: "bg-white py-8 px-4 shadow sm:rounded-lg sm:px-10", children: _jsxs("div", { className: "text-center", children: [_jsx("div", { className: "mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-red-100 mb-4", children: _jsx("svg", { className: "h-6 w-6 text-red-600", xmlns: "http://www.w3.org/2000/svg", fill: "none", viewBox: "0 0 24 24", stroke: "currentColor", "aria-hidden": "true", children: _jsx("path", { strokeLinecap: "round", strokeLinejoin: "round", strokeWidth: "2", d: "M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" }) }) }), _jsx("h2", { className: "text-2xl font-bold text-gray-900 mb-2", children: "Access Denied" }), _jsx("p", { className: "mt-2 text-center text-sm text-gray-600 max-w-sm mx-auto mb-6", children: "You don't have permission to access this page. This area is restricted to administrators and pastors." }), user && (_jsxs("div", { className: "text-sm text-gray-500 mb-6", children: ["Signed in as ", _jsx("span", { className: "font-semibold", children: user.email }), " \u00A0|\u00A0 role:", ' ', _jsx("span", { className: "capitalize", children: role })] })), _jsxs("div", { className: "space-y-4", children: [_jsx(Link, { to: "/", className: "w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-primary-600 hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500", children: "Return to Home Page" }), _jsxs("div", { className: "pt-4 border-t border-gray-200", children: [_jsx("h3", { className: "text-sm font-medium text-gray-700 mb-2", children: "Need Access?" }), _jsxs("p", { className: "text-xs text-gray-500", children: ["If you are a pastor or administrator who needs access to this area, please contact your system administrator or email ", _jsx("a", { href: "mailto:support@biblechat.org", className: "text-primary-600 hover:text-primary-500", children: "support@biblechat.org" }), " with your request."] })] }), _jsxs("div", { className: "pt-4 border-t border-gray-200 space-y-3", children: [_jsx("button", { onClick: handleRefresh, className: "w-full flex justify-center py-2 px-4 rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none", children: "Refresh Profile" }), _jsx("button", { onClick: handleLogout, className: "w-full flex justify-center py-2 px-4 rounded-md shadow-sm text-sm font-medium text-white bg-red-600 hover:bg-red-700 focus:outline-none", children: "Log\u00A0Out" })] })] })] }) }) }) }));
};
export default AccessDeniedPage;
