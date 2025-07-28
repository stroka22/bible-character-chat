import React, { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import FaithLogo from './FaithLogo';

/**
 * Header Component
 * 
 * Responsive header with navigation and user authentication controls
 */
const Header = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  /* ------------------------------------------------------------------
   * Safely obtain auth context (header should never crash if provider
   * is missing).  If the hook throws, fall back to a “guest” context.
   * ------------------------------------------------------------------ */
  let user = null;
  let isAuthenticated = false;
  let loading = false;
  let logout = () => {};

  try {
    const auth = useAuth();
    user = auth?.user ?? null;
    isAuthenticated = auth?.isAuthenticated ?? false;
    loading = auth?.loading ?? false;
    logout = auth?.logout ?? (() => {});
  } catch (err) {
    // eslint-disable-next-line no-console
    console.error('[Header] AuthContext unavailable – rendering guest header.', err);
  }
  const location = useLocation();

  // Handle scroll effect for header
  useEffect(() => {
    const handleScroll = () => {
      if (window.scrollY > 10) {
        setScrolled(true);
      } else {
        setScrolled(false);
      }
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Close mobile menu when changing routes
  useEffect(() => {
    setIsMenuOpen(false);
  }, [location.pathname]);

  // Toggle mobile menu
  const toggleMenu = () => {
    setIsMenuOpen(!isMenuOpen);
  };

  // Handle logout
  const handleLogout = async () => {
    try {
      await logout();
      // Redirect to home page after logout
      window.location.href = '/';
    } catch (error) {
      console.error('Logout failed:', error);
    }
  };

  // Check if a nav link is active
  const isActive = (path) => {
    if (path === '/' && location.pathname === '/') return true;
    if (path !== '/' && location.pathname.startsWith(path)) return true;
    return false;
  };

  return (
    <header 
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
        scrolled 
          ? 'bg-[#0a0a2a]/95 backdrop-blur-sm shadow-md py-2' 
          : 'bg-[#0a0a2a] py-4'
      }`}
    >
      <div className="container mx-auto px-4 flex items-center justify-between">
        {/* Logo */}
        <Link to="/" className="flex-shrink-0">
          <FaithLogo variant="light" size="md" />
        </Link>

        {/* Desktop Navigation */}
        <nav className="hidden md:flex items-center space-x-6">
          <Link 
            to="/" 
            className={`text-sm font-medium transition-colors ${
              isActive('/') 
                ? 'text-yellow-400' 
                : 'text-gray-300 hover:text-yellow-300'
            }`}
          >
            Home
          </Link>
          <Link 
            to="/characters" 
            className={`text-sm font-medium transition-colors ${
              isActive('/characters') 
                ? 'text-yellow-400' 
                : 'text-gray-300 hover:text-yellow-300'
            }`}
          >
            Characters
          </Link>
          <Link 
            to="/conversations" 
            className={`text-sm font-medium transition-colors ${
              isActive('/conversations') 
                ? 'text-yellow-400' 
                : 'text-gray-300 hover:text-yellow-300'
            }`}
          >
            My Conversations
          </Link>
          <Link 
            to="/favorites" 
            className={`text-sm font-medium transition-colors ${
              isActive('/favorites') 
                ? 'text-yellow-400' 
                : 'text-gray-300 hover:text-yellow-300'
            }`}
          >
            Favorites
          </Link>
          <Link 
            to="/pricing" 
            className={`text-sm font-medium transition-colors ${
              isActive('/pricing') 
                ? 'text-yellow-400' 
                : 'text-gray-300 hover:text-yellow-300'
            }`}
          >
            Pricing
          </Link>
          <Link 
            to="/faq" 
            className={`text-sm font-medium transition-colors ${
              isActive('/faq') 
                ? 'text-yellow-400' 
                : 'text-gray-300 hover:text-yellow-300'
            }`}
          >
            FAQ
          </Link>
        </nav>

        {/* User Menu / Auth Buttons */}
        <div className="hidden md:flex items-center space-x-4">
          {loading ? (
            <div className="w-8 h-8 rounded-full animate-pulse bg-gray-700"></div>
          ) : isAuthenticated ? (
            <div className="relative group">
              <button className="flex items-center space-x-2 focus:outline-none">
                <div className="w-8 h-8 rounded-full bg-yellow-400 text-blue-900 flex items-center justify-center">
                  {user?.email?.charAt(0).toUpperCase() || 'U'}
                </div>
                <span className="text-white text-sm">{user?.email?.split('@')[0] || 'User'}</span>
                <svg 
                  xmlns="http://www.w3.org/2000/svg" 
                  className="h-4 w-4 text-gray-400" 
                  viewBox="0 0 20 20" 
                  fill="currentColor"
                >
                  <path 
                    fillRule="evenodd" 
                    d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" 
                    clipRule="evenodd" 
                  />
                </svg>
              </button>
              <div className="absolute right-0 mt-2 w-48 bg-white rounded-md shadow-lg overflow-hidden z-20 opacity-0 scale-95 invisible group-hover:opacity-100 group-hover:scale-100 group-hover:visible transition-all duration-200 origin-top-right">
                <div className="py-1">
                  <Link 
                    to="/profile" 
                    className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                  >
                    Profile
                  </Link>
                  <Link 
                    to="/settings" 
                    className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                  >
                    Settings
                  </Link>
                  {user?.is_admin && (
                    <Link 
                      to="/admin" 
                      className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                    >
                      Admin Panel
                    </Link>
                  )}
                  <button 
                    onClick={handleLogout}
                    className="block w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-gray-100"
                  >
                    Sign Out
                  </button>
                </div>
              </div>
            </div>
          ) : (
            <>
              <Link 
                to="/login" 
                className="text-sm font-medium text-white hover:text-yellow-300 transition-colors"
              >
                Log In
              </Link>
              <Link 
                to="/signup" 
                className="px-4 py-2 text-sm font-medium text-blue-900 bg-yellow-400 rounded-lg hover:bg-yellow-300 transition-colors"
              >
                Sign Up
              </Link>
            </>
          )}
        </div>

        {/* Mobile Menu Button */}
        <button 
          onClick={toggleMenu}
          className="md:hidden text-white focus:outline-none"
          aria-label={isMenuOpen ? "Close menu" : "Open menu"}
        >
          {isMenuOpen ? (
            <svg 
              xmlns="http://www.w3.org/2000/svg" 
              className="h-6 w-6" 
              fill="none" 
              viewBox="0 0 24 24" 
              stroke="currentColor"
            >
              <path 
                strokeLinecap="round" 
                strokeLinejoin="round" 
                strokeWidth={2} 
                d="M6 18L18 6M6 6l12 12" 
              />
            </svg>
          ) : (
            <svg 
              xmlns="http://www.w3.org/2000/svg" 
              className="h-6 w-6" 
              fill="none" 
              viewBox="0 0 24 24" 
              stroke="currentColor"
            >
              <path 
                strokeLinecap="round" 
                strokeLinejoin="round" 
                strokeWidth={2} 
                d="M4 6h16M4 12h16M4 18h16" 
              />
            </svg>
          )}
        </button>
      </div>

      {/* Mobile Menu */}
      <div 
        className={`md:hidden absolute top-full left-0 right-0 bg-[#0a0a2a] border-t border-blue-800 shadow-lg transition-all duration-300 ${
          isMenuOpen 
            ? 'max-h-screen opacity-100 visible' 
            : 'max-h-0 opacity-0 invisible'
        } overflow-hidden`}
      >
        <div className="container mx-auto px-4 py-4">
          <nav className="flex flex-col space-y-4 mb-6">
            <Link 
              to="/" 
              className={`text-sm font-medium transition-colors ${
                isActive('/') 
                  ? 'text-yellow-400' 
                  : 'text-gray-300'
              }`}
            >
              Home
            </Link>
            <Link 
              to="/characters" 
              className={`text-sm font-medium transition-colors ${
                isActive('/characters') 
                  ? 'text-yellow-400' 
                  : 'text-gray-300'
              }`}
            >
              Characters
            </Link>
            <Link 
              to="/conversations" 
              className={`text-sm font-medium transition-colors ${
                isActive('/conversations') 
                  ? 'text-yellow-400' 
                  : 'text-gray-300'
              }`}
            >
              My Conversations
            </Link>
            <Link 
              to="/favorites" 
              className={`text-sm font-medium transition-colors ${
                isActive('/favorites') 
                  ? 'text-yellow-400' 
                  : 'text-gray-300'
              }`}
            >
              Favorites
            </Link>
            <Link 
              to="/pricing" 
              className={`text-sm font-medium transition-colors ${
                isActive('/pricing') 
                  ? 'text-yellow-400' 
                  : 'text-gray-300'
              }`}
            >
              Pricing
            </Link>
            <Link 
              to="/faq" 
              className={`text-sm font-medium transition-colors ${
                isActive('/faq') 
                  ? 'text-yellow-400' 
                  : 'text-gray-300'
              }`}
            >
              FAQ
            </Link>
          </nav>

          {/* Mobile Auth Buttons */}
          <div className="pt-4 border-t border-blue-800">
            {loading ? (
              <div className="w-8 h-8 rounded-full animate-pulse bg-gray-700"></div>
            ) : isAuthenticated ? (
              <div className="space-y-2">
                <div className="flex items-center space-x-2">
                  <div className="w-8 h-8 rounded-full bg-yellow-400 text-blue-900 flex items-center justify-center">
                    {user?.email?.charAt(0).toUpperCase() || 'U'}
                  </div>
                  <span className="text-white text-sm">{user?.email || 'User'}</span>
                </div>
                <div className="grid grid-cols-2 gap-2 mt-2">
                  <Link 
                    to="/profile" 
                    className="px-3 py-2 text-sm text-center text-white bg-blue-800 rounded-lg hover:bg-blue-700 transition-colors"
                  >
                    Profile
                  </Link>
                  <Link 
                    to="/settings" 
                    className="px-3 py-2 text-sm text-center text-white bg-blue-800 rounded-lg hover:bg-blue-700 transition-colors"
                  >
                    Settings
                  </Link>
                </div>
                {user?.is_admin && (
                  <Link 
                    to="/admin" 
                    className="block w-full px-3 py-2 mt-2 text-sm text-center text-white bg-blue-700 rounded-lg hover:bg-blue-600 transition-colors"
                  >
                    Admin Panel
                  </Link>
                )}
                <button 
                  onClick={handleLogout}
                  className="block w-full px-3 py-2 mt-2 text-sm text-center text-white bg-red-700 rounded-lg hover:bg-red-600 transition-colors"
                >
                  Sign Out
                </button>
              </div>
            ) : (
              <div className="grid grid-cols-2 gap-2">
                <Link 
                  to="/login" 
                  className="px-3 py-2 text-sm text-center text-white bg-blue-800 rounded-lg hover:bg-blue-700 transition-colors"
                >
                  Log In
                </Link>
                <Link 
                  to="/signup" 
                  className="px-3 py-2 text-sm text-center text-blue-900 bg-yellow-400 rounded-lg hover:bg-yellow-300 transition-colors"
                >
                  Sign Up
                </Link>
              </div>
            )}
          </div>
        </div>
      </div>
    </header>
  );
};

export default Header;
