import React, { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { BibleIcon } from './FaithLogo';

/**
 * Nostalgic Header Component for Preview Pages
 * Styled to match the aged parchment/scroll theme
 */
const HeaderScroll = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [userMenuOpen, setUserMenuOpen] = useState(false);
  const menuRef = React.useRef(null);
  
  const { user, loading, signOut, isAdmin, role } = useAuth();
  const urlParams = new URLSearchParams(window.location.search);
  const isUrlLogout = urlParams.get('logout') === '1';
  const isAuthenticated = !!user && !isUrlLogout;
  
  const shouldShowAdminLink =
    isAuthenticated &&
    (loading || role === 'unknown' || (typeof isAdmin === 'function' && isAdmin()) || role === 'admin' || role === 'superadmin');

  const location = useLocation();

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 10);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  useEffect(() => {
    setIsMenuOpen(false);
    setUserMenuOpen(false);
  }, [location.pathname]);

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (menuRef.current && !menuRef.current.contains(e.target)) {
        setUserMenuOpen(false);
      }
    };
    document.addEventListener('click', handleClickOutside);
    return () => document.removeEventListener('click', handleClickOutside);
  }, []);

  const handleLogout = async () => {
    try {
      await (signOut?.());
    } catch (error) {
      console.error('Logout failed:', error);
    } finally {
      try {
        sessionStorage.clear();
        localStorage.removeItem('isPremium');
      } catch {}
      window.location.href = '/login?loggedOut=1';
    }
  };

  const isActive = (path) => {
    if (path === '/preview' && location.pathname === '/preview') return true;
    if (path !== '/preview' && location.pathname.startsWith(path)) return true;
    return false;
  };

  // Ornate corner flourish SVG
  const CornerFlourish = ({ className = '', flip = false }) => (
    <svg 
      className={`w-8 h-8 text-amber-700/40 ${flip ? 'scale-x-[-1]' : ''} ${className}`} 
      viewBox="0 0 32 32"
      fill="currentColor"
    >
      <path d="M4,28 Q4,16 10,10 Q16,4 28,4 L28,6 Q18,6 12,12 Q6,18 6,28 Z" />
      <circle cx="28" cy="4" r="2" />
      <circle cx="4" cy="28" r="2" />
    </svg>
  );

  return (
    <header 
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
        scrolled 
          ? 'shadow-lg' 
          : ''
      }`}
      style={{
        background: scrolled 
          ? 'linear-gradient(to bottom, #78350f 0%, #92400e 50%, #78350f 100%)'
          : 'linear-gradient(to bottom, #451a03 0%, #78350f 30%, #92400e 50%, #78350f 70%, #451a03 100%)'
      }}
    >
      {/* Decorative top border */}
      <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-transparent via-amber-400/60 to-transparent" />
      
      {/* Wood grain texture overlay */}
      <div 
        className="absolute inset-0 opacity-20 pointer-events-none"
        style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg width='100' height='20' xmlns='http://www.w3.org/2000/svg'%3E%3Cpath d='M0,10 Q25,5 50,10 T100,10' stroke='%23451a03' fill='none' stroke-width='0.5'/%3E%3Cpath d='M0,15 Q25,12 50,15 T100,15' stroke='%23451a03' fill='none' stroke-width='0.3'/%3E%3C/svg%3E")`,
          backgroundSize: '100px 20px'
        }}
      />
      
      <div className="container mx-auto px-4 py-3 relative">
        {/* Corner flourishes */}
        <CornerFlourish className="absolute top-1 left-2 hidden md:block" />
        <CornerFlourish className="absolute top-1 right-2 hidden md:block" flip />
        
        <div className="flex items-center justify-between">
          {/* Logo */}
          <Link to="/preview" className="flex-shrink-0 flex items-center gap-2">
            <BibleIcon size={36} variant="light" />
            <span 
              className="text-xl md:text-2xl font-bold text-amber-200 tracking-wide"
              style={{ 
                fontFamily: 'Cinzel, serif',
                textShadow: '1px 1px 2px rgba(0,0,0,0.5)'
              }}
            >
              FaithTalk<span className="text-amber-400">AI</span>
            </span>
          </Link>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center space-x-1">
            {[
              { to: '/preview', label: 'Home' },
              { to: '/bible/preview', label: 'Bible' },
              { to: '/reading-plans/preview', label: 'Reading Plans' },
              { to: '/studies/preview', label: 'Studies' },
              { to: '/how-it-works/preview', label: 'How It Works' },
              { to: '/pricing/preview', label: 'Pricing' },
            ].map(({ to, label }) => (
              <Link 
                key={to}
                to={to} 
                className={`px-3 py-1.5 text-sm font-medium rounded transition-all ${
                  isActive(to) 
                    ? 'text-amber-900 bg-amber-200/90 shadow-inner' 
                    : 'text-amber-100 hover:text-amber-200 hover:bg-amber-800/30'
                }`}
                style={{ fontFamily: 'Georgia, serif' }}
              >
                {label}
              </Link>
            ))}
          </nav>

          {/* User Menu / Auth Buttons */}
          <div className="hidden md:flex items-center space-x-3">
            {loading ? (
              <div className="w-8 h-8 rounded-full animate-pulse bg-amber-700/50" />
            ) : isAuthenticated ? (
              <div className="flex items-center space-x-2">
                <Link
                  to="/my-walk/preview"
                  className="inline-flex items-center px-3 py-1.5 rounded-full text-sm font-semibold bg-amber-200 text-amber-900 hover:bg-amber-100 transition-colors shadow"
                  style={{ fontFamily: 'Georgia, serif' }}
                >
                  <svg className="h-4 w-4 mr-1.5" viewBox="0 0 20 20" fill="currentColor">
                    <path d="M5 8l.867 1.803L7.5 10.5l-1.633.697L5 13l-.867-1.803L2.5 10.5l1.633-.697L5 8zm5-7l1.286 2.674L14 5l-2.714 1.326L10 9l-1.286-2.674L6 5l2.714-1.326L10 1zm5 9l.75 1.553L17 12l-1.25.447L15 14l-.75-1.553L13 12l1.25-.447L15 10z" />
                  </svg>
                  My Walk
                </Link>
                
                <div className="relative" ref={menuRef}>
                  <button
                    className="flex items-center space-x-2 focus:outline-none px-2 py-1 rounded hover:bg-amber-800/30 transition-colors"
                    onClick={() => setUserMenuOpen(v => !v)}
                  >
                    <div className="w-8 h-8 rounded-full bg-amber-200 text-amber-900 flex items-center justify-center font-bold shadow">
                      {user?.email?.charAt(0).toUpperCase() || 'U'}
                    </div>
                    <svg className="h-4 w-4 text-amber-300" viewBox="0 0 20 20" fill="currentColor">
                      <path fillRule="evenodd" d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clipRule="evenodd" />
                    </svg>
                  </button>
                  
                  <div className={`absolute right-0 mt-2 w-48 rounded-lg border-2 border-amber-300 shadow-xl overflow-hidden z-20 origin-top-right transform transition-all duration-200 ${
                    userMenuOpen ? 'opacity-100 scale-100 visible' : 'opacity-0 scale-95 invisible'
                  }`}
                  style={{ background: 'linear-gradient(to bottom, #fef3c7, #fde68a)' }}
                  >
                    <div className="py-1">
                      <Link to="/profile/preview" className="block px-4 py-2 text-sm text-amber-900 hover:bg-amber-200/50">Profile</Link>
                      <Link to="/settings/preview" className="block px-4 py-2 text-sm text-amber-900 hover:bg-amber-200/50">Settings</Link>
                      {shouldShowAdminLink && (
                        <Link to="/admin" className="block px-4 py-2 text-sm text-amber-900 hover:bg-amber-200/50">Admin Panel</Link>
                      )}
                      <Link to="/account?open=1" className="block px-4 py-2 text-sm text-amber-900 hover:bg-amber-200/50">Subscription</Link>
                      <button onClick={handleLogout} className="block w-full text-left px-4 py-2 text-sm text-red-700 hover:bg-red-100">Sign Out</button>
                    </div>
                  </div>
                </div>
              </div>
            ) : (
              <>
                <Link 
                  to="/login" 
                  className="text-sm font-medium text-amber-200 hover:text-amber-100 transition-colors px-3 py-1.5"
                  style={{ fontFamily: 'Georgia, serif' }}
                >
                  Log In
                </Link>
                <Link 
                  to="/signup" 
                  className="px-4 py-2 text-sm font-medium text-amber-900 bg-amber-200 rounded-lg hover:bg-amber-100 transition-colors shadow"
                  style={{ fontFamily: 'Georgia, serif' }}
                >
                  Sign Up
                </Link>
              </>
            )}
          </div>

          {/* Mobile Menu Button */}
          <button 
            onClick={() => setIsMenuOpen(!isMenuOpen)}
            className="md:hidden text-amber-200 focus:outline-none p-2 hover:bg-amber-800/30 rounded transition-colors"
          >
            {isMenuOpen ? (
              <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            ) : (
              <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
              </svg>
            )}
          </button>
        </div>
      </div>

      {/* Decorative bottom border */}
      <div className="absolute bottom-0 left-0 right-0 h-1 bg-gradient-to-r from-transparent via-amber-600/40 to-transparent" />
      
      {/* Ornate bottom edge */}
      <svg className="absolute -bottom-2 left-0 right-0 w-full h-3 text-amber-900" preserveAspectRatio="none" viewBox="0 0 800 12">
        <path d="M0,0 L800,0 L800,4 Q700,12 400,4 Q100,12 0,4 Z" fill="currentColor" opacity="0.3"/>
      </svg>

      {/* Mobile Menu */}
      <div 
        className={`md:hidden absolute top-full left-0 right-0 border-t border-amber-600/30 shadow-lg transition-all duration-300 ${
          isMenuOpen ? 'max-h-screen opacity-100 visible' : 'max-h-0 opacity-0 invisible'
        } overflow-hidden`}
        style={{ background: 'linear-gradient(to bottom, #92400e, #78350f)' }}
      >
        <div className="container mx-auto px-4 py-4">
          <nav className="flex flex-col space-y-2 mb-4">
            {[
              { to: '/preview', label: 'Home' },
              { to: '/bible/preview', label: 'Bible' },
              { to: '/reading-plans/preview', label: 'Reading Plans' },
              { to: '/studies/preview', label: 'Studies' },
              { to: '/how-it-works/preview', label: 'How It Works' },
              { to: '/pricing/preview', label: 'Pricing' },
            ].map(({ to, label }) => (
              <Link 
                key={to}
                to={to} 
                className={`px-4 py-2 text-sm font-medium rounded transition-colors ${
                  isActive(to) 
                    ? 'text-amber-900 bg-amber-200/90' 
                    : 'text-amber-100 hover:bg-amber-800/30'
                }`}
              >
                {label}
              </Link>
            ))}
          </nav>

          <div className="pt-4 border-t border-amber-600/30">
            {loading ? (
              <div className="w-8 h-8 rounded-full animate-pulse bg-amber-700/50" />
            ) : isAuthenticated ? (
              <div className="space-y-2">
                <div className="flex items-center space-x-2 mb-3">
                  <div className="w-8 h-8 rounded-full bg-amber-200 text-amber-900 flex items-center justify-center font-bold">
                    {user?.email?.charAt(0).toUpperCase() || 'U'}
                  </div>
                  <span className="text-amber-100 text-sm">{user?.email || 'User'}</span>
                </div>
                <Link to="/my-walk/preview" className="block w-full px-4 py-2 text-sm font-semibold text-center bg-amber-200 text-amber-900 rounded-lg">
                  My Walk
                </Link>
                <div className="grid grid-cols-2 gap-2">
                  <Link to="/profile/preview" className="px-3 py-2 text-sm text-center text-amber-100 bg-amber-800/50 rounded-lg">Profile</Link>
                  <Link to="/settings/preview" className="px-3 py-2 text-sm text-center text-amber-100 bg-amber-800/50 rounded-lg">Settings</Link>
                </div>
                {shouldShowAdminLink && (
                  <Link to="/admin" className="block w-full px-3 py-2 text-sm text-center text-amber-100 bg-amber-700/50 rounded-lg">Admin</Link>
                )}
                <button onClick={handleLogout} className="block w-full px-3 py-2 text-sm text-center text-white bg-red-800/80 rounded-lg">Sign Out</button>
              </div>
            ) : (
              <div className="grid grid-cols-2 gap-2">
                <Link to="/login/preview" className="px-3 py-2 text-sm text-center text-amber-100 bg-amber-800/50 rounded-lg">Log In</Link>
                <Link to="/signup/preview" className="px-3 py-2 text-sm text-center text-amber-900 bg-amber-200 rounded-lg">Sign Up</Link>
              </div>
            )}
          </div>
        </div>
      </div>
    </header>
  );
};

export default HeaderScroll;
