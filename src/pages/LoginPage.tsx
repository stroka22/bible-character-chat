import React, { useState } from 'react';
import { useNavigate, Link, useLocation } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import Footer from '../components/Footer';

const LoginPage: React.FC = () => {
  const navigate = useNavigate();
  // Added resetPassword from AuthContext so we can invoke it directly
  const {
    signIn,
    resetPassword,
    loading,
    error,
    isAdmin,
    isPastor,
    refreshProfile,
  } = useAuth();
  const location = useLocation();
  
  // Form state
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [formError, setFormError] = useState<string | null>(null);
  const [isResettingPassword, setIsResettingPassword] = useState(false);
  const [resetEmail, setResetEmail] = useState('');
  const [resetSuccess, setResetSuccess] = useState(false);

  // Handle login form submission
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Reset error state
    setFormError(null);
    
    // Form validation
    if (!email || !password) {
      setFormError('Email and password are required');
      return;
    }
    
    try {
      // Call the signIn function from AuthContext
      await signIn(email, password);

      // Force-refresh the profile so role helpers are up-to-date
      await refreshProfile();

      /* ------------------------------------------------------------------
       * Check for pending invite codes first
       * ---------------------------------------------------------------- */
      const pendingChatCode = sessionStorage.getItem('pendingChatJoinCode');
      if (pendingChatCode) {
        sessionStorage.removeItem('pendingChatJoinCode');
        console.debug('[LoginPage] Redirecting to pending chat invite:', pendingChatCode);
        navigate(`/join/${pendingChatCode}`, { replace: true });
        return;
      }

      const pendingInviteCode = sessionStorage.getItem('pendingInviteCode');
      if (pendingInviteCode) {
        // Let the AuthContext handle this one
        console.debug('[LoginPage] Pending org invite will be handled by AuthContext');
      }

      /* ------------------------------------------------------------------
       * Decide where to send the user based on their role
       * ---------------------------------------------------------------- */
      const target =
        new URLSearchParams(location.search).get('to') || // ?to=/some/path
        (isAdmin() || isPastor() ? '/admin' : '/');

      console.debug(
        `[LoginPage] login OK → role=${
          isAdmin() ? 'admin' : isPastor() ? 'pastor' : 'user'
        } redirect=${target}`
      );

      navigate(target, { replace: true });
    } catch (err) {
      // Error is handled by the AuthContext and available via the error state
      console.error('Login error:', err);
      setFormError('Invalid email or password, please try again.');
    }
  };

  // Handle password reset request
  const handleResetPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError(null);
    
    if (!resetEmail) {
      setFormError('Please enter your email address');
      return;
    }
    
    try {
      // Use the resetPassword function already destructured from useAuth
      await resetPassword(resetEmail);
      setResetSuccess(true);
    } catch (err) {
      console.error('Password reset error:', err);
      setFormError('Failed to send password reset email');
    }
  };

  return (
    <>
    <div className="flex min-h-screen items-center justify-center bg-gradient-to-b from-blue-900 via-blue-600 to-blue-400 py-12 px-4 sm:px-6 lg:px-8">
      <div className="w-full max-w-md space-y-8 rounded-lg bg-white p-8 shadow-xl">
        <div>
          <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900">
            {isResettingPassword ? 'Reset your password' : 'Sign in to your account'}
          </h2>
          {!isResettingPassword && (
            <p className="mt-2 text-center text-sm text-gray-600">
              Don't have an account?{' '}
              <Link to="/signup" className="font-medium text-primary-600 hover:text-primary-500">
                Sign up
              </Link>
            </p>
          )}
        </div>
        
        {/* Error message */}
        {(error || formError) && (
          <div className="rounded-md bg-red-50 p-4">
            <div className="flex">
              <div className="flex-shrink-0">
                <svg className="h-5 w-5 text-red-400" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                </svg>
              </div>
              <div className="ml-3">
                <h3 className="text-sm font-medium text-red-800">
                  {formError || error}
                </h3>
              </div>
            </div>
          </div>
        )}
        
        {/* Password reset success message */}
        {resetSuccess && (
          <div className="rounded-md bg-green-50 p-4">
            <div className="flex">
              <div className="flex-shrink-0">
                <svg className="h-5 w-5 text-green-400" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                </svg>
              </div>
              <div className="ml-3">
                <h3 className="text-sm font-medium text-green-800">
                  Password reset email sent. Please check your inbox.
                </h3>
              </div>
            </div>
          </div>
        )}
        
        {isResettingPassword ? (
          // Password reset form
          <form className="mt-8 space-y-6" onSubmit={handleResetPassword}>
            <div className="rounded-md shadow-sm -space-y-px">
              <div>
                <label htmlFor="reset-email" className="block text-sm font-medium text-gray-700">
                  Email address
                </label>
                <input
                  id="reset-email"
                  name="email"
                  type="email"
                  autoComplete="email"
                  required
                  value={resetEmail}
                  onChange={(e) => setResetEmail(e.target.value)}
                  className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-primary-500 focus:outline-none focus:ring-primary-500 sm:text-sm"
                  placeholder="Enter your email address"
                />
              </div>
            </div>

            <div className="flex items-center justify-between">
              <button
                type="button"
                onClick={() => setIsResettingPassword(false)}
                className="text-sm font-medium text-primary-600 hover:text-primary-500"
              >
                Back to sign in
              </button>
            </div>

            <div>
              <button
                type="submit"
                disabled={loading}
                className="group relative flex w-full justify-center rounded-md border border-transparent bg-primary-600 py-2 px-4 text-sm font-medium text-white hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2 disabled:bg-gray-400"
              >
                {loading ? 'Sending...' : 'Send reset instructions'}
              </button>
            </div>
          </form>
        ) : (
          // Login form
          <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
            <div className="space-y-4 rounded-md shadow-sm">
              <div>
                <label htmlFor="email-address" className="block text-sm font-medium text-gray-700">
                  Email address
                </label>
                <input
                  id="email-address"
                  name="email"
                  type="email"
                  autoComplete="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-primary-500 focus:outline-none focus:ring-primary-500 sm:text-sm"
                />
              </div>
              
              <div>
                <label htmlFor="password" className="block text-sm font-medium text-gray-700">
                  Password
                </label>
                <input
                  id="password"
                  name="password"
                  type="password"
                  autoComplete="current-password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-primary-500 focus:outline-none focus:ring-primary-500 sm:text-sm"
                />
              </div>
            </div>

            <div className="flex items-center justify-end">
              <div className="text-sm">
                <button
                  type="button"
                  onClick={() => setIsResettingPassword(true)}
                  className="font-medium text-primary-600 hover:text-primary-500"
                >
                  Forgot your password?
                </button>
              </div>
            </div>

            <div>
              <button
                type="submit"
                disabled={loading}
                className="group relative flex w-full justify-center rounded-md border border-transparent bg-primary-600 py-2 px-4 text-sm font-medium text-white hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2 disabled:bg-gray-400"
              >
                {loading ? 'Signing in...' : 'Sign in'}
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
    {/* Debug: show current route */}
    <div className="fixed bottom-2 left-1/2 -translate-x-1/2 text-xs text-white/70 pointer-events-none select-none">
      path: {location.pathname}
    </div>
    <Footer />
    </>
  );
};

export default LoginPage;
