import { jsx as _jsx, jsxs as _jsxs, Fragment as _Fragment } from "react/jsx-runtime";
import { Link } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';

const Header = ({ simplified = false }) => {
    const { user, signOut } = useAuth();
    // For development, we'll show admin link with a visual indicator when not actually admin
    const isAdmin = user?.email === 'admin@example.com' || import.meta.env.VITE_SKIP_AUTH === 'true';
    
    return (
        _jsxs("header", { 
            className: "sticky top-0 z-50 bg-blue-900 border-b-2 border-yellow-400/70 shadow-lg", 
            children: [
                _jsxs("div", { 
                    className: "container mx-auto px-4 py-3 flex flex-wrap items-center justify-between", 
                    children: [
                        // Logo and site name
                        _jsxs(Link, { 
                            to: "/", 
                            className: "flex items-center gap-2 hover:opacity-90 transition-opacity", 
                            children: [
                                _jsx("svg", { 
                                    xmlns: "http://www.w3.org/2000/svg", 
                                    className: "h-8 w-8 text-yellow-400 drop-shadow-lg", 
                                    viewBox: "0 0 20 20", 
                                    fill: "currentColor", 
                                    children: _jsx("path", { 
                                        d: "M9 4.804A7.968 7.968 0 005.5 4c-1.255 0-2.443.29-3.5.804v10A7.969 7.969 0 015.5 14c1.669 0 3.218.51 4.5 1.385A7.962 7.962 0 0114.5 14c1.255 0 2.443.29 3.5.804v-10A7.968 7.968 0 0014.5 4c-1.255 0-2.443.29-3.5.804V12a1 1 0 11-2 0V4.804z" 
                                    }) 
                                }), 
                                _jsx("span", { 
                                    className: "text-xl font-bold text-white tracking-wide", 
                                    children: "Bible\u00A0Characters\u00A0Chat" 
                                })
                            ] 
                        }),
                        
                        // Main navigation links
                        _jsxs("nav", {
                            className: "flex items-center space-x-2 md:space-x-6 ml-4",
                            children: [
                                _jsx(Link, {
                                    to: "/",
                                    className: "text-white hover:text-yellow-300 font-medium px-2 py-1",
                                    children: "Home"
                                }),
                                _jsx(Link, {
                                    to: "/pricing",
                                    className: "text-white hover:text-yellow-300 font-medium px-2 py-1",
                                    children: "Pricing"
                                }),
                                isAdmin && (
                                    _jsx(Link, {
                                        to: "/admin",
                                        className: "text-yellow-300 hover:text-yellow-200 font-medium px-2 py-1 border border-yellow-500/30 rounded bg-blue-800",
                                        children: "Admin Panel"
                                    })
                                ),
                                _jsx(Link, {
                                    to: "/conversations",
                                    className: "text-white hover:text-yellow-300 font-medium px-2 py-1",
                                    children: "My Chats"
                                })
                            ]
                        }),
                        
                        // Right side - auth buttons or user info
                        _jsxs("div", { 
                            className: "flex items-center space-x-3 ml-auto", 
                            children: [
                                // Upgrade button
                                _jsx(Link, { 
                                    to: "/pricing", 
                                    className: "rounded-full bg-yellow-400 px-4 py-1.5 text-sm font-bold text-blue-900 shadow-md hover:bg-yellow-300 focus:ring-2 focus:ring-yellow-300 focus:outline-none", 
                                    children: "UPGRADE" 
                                }),
                                
                                // Auth section
                                !simplified && (
                                    user ? (
                                        // Logged in state
                                        _jsxs(_Fragment, { 
                                            children: [
                                                _jsx("span", { 
                                                    className: "hidden md:inline text-sm text-blue-100", 
                                                    children: user.email 
                                                }), 
                                                _jsx("button", { 
                                                    onClick: () => signOut(), 
                                                    className: "text-sm py-1.5 px-3 rounded-md bg-white/20 hover:bg-white/30 text-white transition-colors", 
                                                    children: "Sign Out" 
                                                })
                                            ] 
                                        })
                                    ) : (
                                        // Logged out state
                                        _jsxs(_Fragment, {
                                            children: [
                                                _jsx(Link, {
                                                    to: "/login",
                                                    className: "text-sm py-1.5 px-3 rounded-md bg-blue-700 hover:bg-blue-600 text-white transition-colors",
                                                    children: "Login"
                                                }),
                                                _jsx(Link, {
                                                    to: "/signup",
                                                    className: "text-sm py-1.5 px-3 rounded-md bg-green-600 hover:bg-green-500 text-white transition-colors",
                                                    children: "Sign Up"
                                                })
                                            ]
                                        })
                                    )
                                )
                            ] 
                        })
                    ] 
                })
            ] 
        })
    );
};

export default Header;
