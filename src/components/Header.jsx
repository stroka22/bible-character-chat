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
  // Desktop user dropdown open state
  const [userMenuOpen, setUserMenuOpen] = useState(false);
  const menuRef = React.useRef(null);
  /* ------------------------------------------------------------------
   * Auth state
   * ------------------------------------------------------------------ */
  const { user, loading, signOut, isAdmin, isPremium: isPremiumUser, role } = useAuth();
  const urlParams = new URLSearchParams(window.location.search);
  const isUrlLogout = urlParams.get('logout') === '1';
  const isAuthenticated = !!user && !isUrlLogout;
  /* Show Admin link immediately when:
     • user is authenticated AND (we're still loading/role unknown)
       OR we already know the user is admin / superadmin                  */
  const shouldShowAdminLink =
    isAuthenticated &&
    (
      loading ||
      role === 'unknown' ||
      (typeof isAdmin === 'function' && isAdmin()) ||
      role === 'admin' ||
      role === 'superadmin'
    );

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

  // Support URL-driven logout: ?logout=1 (optionally with &resetFeatured=1)
  useEffect(() => {
    (async () => {
      try {
        const params = new URLSearchParams(window.location.search);
        const shouldLogout = params.get('logout') === '1';
        if (shouldLogout) {
          await (signOut?.());
          // Optional: clear featured overrides if requested
          if (params.get('resetFeatured') === '1') {
            try {
              localStorage.removeItem('featuredCharacter');
              // Try to remove org-scoped key as well (best‑effort)
              const slugKey = Object.keys(localStorage).find(k => k.startsWith('featuredCharacter:'));
              if (slugKey) localStorage.removeItem(slugKey);
            } catch {}
          }
          // Clean URL without logout param
          params.delete('logout');
          const newUrl = `${window.location.pathname}?${params.toString()}`.replace(/\?$/, '');
          window.history.replaceState({}, document.title, newUrl);
        }
      } catch (e) {
        console.warn('[Header] URL logout failed:', e);
      }
    })();
  }, [signOut]);

  // Close mobile menu when changing routes
  useEffect(() => {
    setIsMenuOpen(false);
    setUserMenuOpen(false);
  }, [location.pathname]);

  // Toggle mobile menu
  const toggleMenu = () => {
    setIsMenuOpen(!isMenuOpen);
  };

  // Close user menu when clicking outside
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (menuRef.current && !menuRef.current.contains(e.target)) {
        setUserMenuOpen(false);
      }
    };
    document.addEventListener('click', handleClickOutside);
    return () => document.removeEventListener('click', handleClickOutside);
  }, []);

  // Handle logout
  const handleLogout = async () => {
    try {
      await (signOut?.());
    } catch (error) {
      console.error('Logout failed:', error);
    } finally {
      /* Extra safety for Windows browsers */
      try {
        sessionStorage.clear();
        localStorage.removeItem('isPremium');
      } catch {
        /* ignore */
      }
      // Hard redirect to login so the app remounts fresh
      window.location.href = '/login?loggedOut=1';
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
            to="/how-it-works" 
            className={`text-sm font-medium transition-colors ${
              isActive('/how-it-works') 
                ? 'text-yellow-400' 
                : 'text-gray-300 hover:text-yellow-300'
            }`}
          >
            Getting&nbsp;Started
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
          <Link 
            to="/contact" 
            className={`text-sm font-medium transition-colors ${
              isActive('/contact') 
                ? 'text-yellow-400' 
                : 'text-gray-300 hover:text-yellow-300'
            }`}
          >
            Contact&nbsp;Us
          </Link>
        </nav>

        {/* User Menu / Auth Buttons */}
        <div className="hidden md:flex items-center space-x-4">
          {loading ? (
            <div className="w-8 h-8 rounded-full animate-pulse bg-gray-700"></div>
          ) : isAuthenticated ? (
            /* Desktop: My Walk pill + user dropdown */
            <div className="flex items-center space-x-3">
              {isAuthenticated && (
                <Link
                  to="/my-walk"
                  aria-label="My Walk"
                  className={`inline-flex items-center px-3 py-1.5 rounded-full text-sm font-semibold transition-colors ${
                    isActive('/my-walk')
                      ? 'bg-yellow-300 text-blue-900'
                      : 'bg-yellow-400 text-blue-900 hover:bg-yellow-300'
                  }`}
                >
                  {/* sparkles icon */}
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className="h-4 w-4 mr-1.5"
                    viewBox="0 0 20 20"
                    fill="currentColor"
                  >
                    <path d="M5 8l.867 1.803L7.5 10.5l-1.633.697L5 13l-.867-1.803L2.5 10.5l1.633-.697L5 8zm5-7l1.286 2.674L14 5l-2.714 1.326L10 9l-1.286-2.674L6 5l2.714-1.326L10 1zm5 9l.75 1.553L17 12l-1.25.447L15 14l-.75-1.553L13 12l1.25-.447L15 10z" />
                  </svg>
                  My Walk
                </Link>
              )}
              <div className="relative" ref={menuRef}>
              <button
                className="flex items-center space-x-2 focus:outline-none"
                onClick={() => setUserMenuOpen(v => !v)}
                aria-haspopup="true"
                aria-expanded={userMenuOpen}
              >
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
              <div
                key={role}
                className={`absolute right-0 mt-2 w-48 bg-white text-gray-800 rounded-md border border-gray-200 shadow-xl overflow-hidden z-20 origin-top-right transform transition-all duration-200 ${
                userMenuOpen ? 'opacity-100 scale-100 visible' : 'opacity-0 scale-95 invisible'
              }`}
              >
                <div className="py-1">
                  <Link 
                    to="/profile" 
                    className="block px-4 py-2 text-sm text-gray-900 hover:bg-gray-100"
                  >
                    Profile
                  </Link>
                  <Link 
                    to="/settings" 
                    className="block px-4 py-2 text-sm text-gray-900 hover:bg-gray-100"
                  >
                    Settings
                  </Link>
                  {shouldShowAdminLink && (
                    <Link 
                      to="/admin" 
                      className="block px-4 py-2 text-sm text-gray-900 hover:bg-gray-100"
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
            {/* Close relative group wrapper */}
            </div>
            {/* Close flex container that wraps My Walk pill + user dropdown */}
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
              to="/how-it-works" 
              className={`text-sm font-medium transition-colors ${
                isActive('/how-it-works') 
                  ? 'text-yellow-400' 
                  : 'text-gray-300'
              }`}
            >
              Getting&nbsp;Started
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
            <Link 
              to="/contact" 
              className={`text-sm font-medium transition-colors ${
                isActive('/contact') 
                  ? 'text-yellow-400' 
                  : 'text-gray-300'
              }`}
            >
              Contact&nbsp;Us
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
                {isAuthenticated && (
                  <Link
                    to="/my-walk"
                    className="block w-full px-3 py-2 mt-3 text-sm font-semibold text-center bg-yellow-400 text-blue-900 rounded-full hover:bg-yellow-300 transition-colors"
                  >
                    <div className="inline-flex items-center justify-center">
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        className="h-4 w-4 mr-1"
                        viewBox="0 0 20 20"
                        fill="currentColor"
                      >
                        <path d="M5 8l.867 1.803L7.5 10.5l-1.633.697L5 13l-.867-1.803L2.5 10.5l1.633-.697L5 8zm5-7l1.286 2.674L14 5l-2.714 1.326L10 9l-1.286-2.674L6 5l2.714-1.326L10 1zm5 9l.75 1.553L17 12l-1.25.447L15 14l-.75-1.553L13 12l1.25-.447L15 10z" />
                      </svg>
                      My Walk
                    </div>
                  </Link>
                )}
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
                {shouldShowAdminLink && (
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
