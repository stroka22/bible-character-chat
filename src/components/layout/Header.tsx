import React from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';

interface HeaderProps {
  /**
   * When `simplified` is true the header only shows
   * the app logo / title and hides user-action buttons.
   * This is used by the “simplified” layout variant.
   */
  simplified?: boolean;
}

const Header: React.FC<HeaderProps> = ({ simplified = false }) => {
  const { user, signOut } = useAuth();
  // Very simple admin check – replace with a proper role system if available
  const isAdmin = user?.email === 'admin@example.com';

  return (
    <header className="sticky top-0 z-50 bg-blue-900/70 backdrop-blur-md border-b-2 border-white/30 shadow-md">
      <div className="container mx-auto px-4 py-4 flex items-center justify-between">
        {/* Logo/App Name */}
        <Link
          to="/"
          className="flex items-center gap-2 hover:opacity-90 transition-opacity"
        >
          <svg 
            xmlns="http://www.w3.org/2000/svg" 
            /* Brighter gold for stronger contrast on the purple gradient */
            className="h-8 w-8 text-amber-300 drop-shadow-lg"
            viewBox="0 0 20 20" 
            fill="currentColor"
          >
            <path d="M9 4.804A7.968 7.968 0 005.5 4c-1.255 0-2.443.29-3.5.804v10A7.969 7.969 0 015.5 14c1.669 0 3.218.51 4.5 1.385A7.962 7.962 0 0114.5 14c1.255 0 2.443.29 3.5.804v-10A7.968 7.968 0 0014.5 4c-1.255 0-2.443.29-3.5.804V12a1 1 0 11-2 0V4.804z" />
          </svg>
          <span className="text-xl font-bold text-white tracking-wide drop-shadow-sm">
            Bible&nbsp;Characters&nbsp;Chat
          </span>
          {/* Visual indicator for the vivid-purple design variant */}
          <span
            className="ml-2 animate-pulse rounded-full bg-amber-400/90 px-2 py-0.5 text-xs font-semibold text-blue-900 shadow"
            title="You are viewing the new vivid-purple theme"
          >
            New&nbsp;Design!
          </span>
        </Link>

        {/* Upgrade / Pricing (always visible, very prominent) */}
        <Link
          to="/pricing"
          className="ml-6 rounded-full bg-amber-400 px-5 py-2 text-lg font-extrabold tracking-wide text-blue-900 shadow-lg ring-2 ring-amber-300 hover:bg-amber-300 focus:outline-none focus:ring-4 focus:ring-amber-200 animate-bounce"
        >
          UPGRADE
        </Link>

        {/* Right side: auth-specific actions */}
        <div className="flex items-center space-x-3">
          {/* Auth-specific actions */}
          {!simplified && user && (
            <>
              {/* Admin Panel link (visible only for admin users) */}
              {isAdmin && (
                <Link
                  to="/admin"
                  className="text-sm py-1 px-3 rounded-md bg-yellow-400/20 text-yellow-200 hover:bg-yellow-400/30 transition-colors"
                >
                  Admin Panel
                </Link>
              )}
              <span className="hidden md:inline text-sm text-blue-100">
                {user.email}
              </span>
              <button
                onClick={() => signOut()}
                className="text-sm py-1 px-3 rounded-md bg-white/20 hover:bg-white/30 text-white transition-colors backdrop-blur-sm"
              >
                Sign Out
              </button>
            </>
          )}
        </div>
      </div> {/* Ensure container div is properly closed */}
    </header>
  );
};

export default Header;
