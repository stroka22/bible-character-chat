import React, { useState } from 'react';
import { useNavigate, Link, useLocation } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import FooterScroll from '../components/FooterScroll';
import PreviewLayout from '../components/PreviewLayout';
import { ScrollWrap, ScrollBackground } from '../components/ScrollWrap';

const LoginPageScroll = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { signIn, resetPassword, loading, error, isAdmin, isPastor, refreshProfile } = useAuth();
  
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

      // Check for pending invites
      let pendingChatCode = null;
      try { pendingChatCode = sessionStorage.getItem('pendingChatJoinCode'); } catch {}
      if (pendingChatCode) {
        try { sessionStorage.removeItem('pendingChatJoinCode'); } catch {}
        navigate(`/join/${pendingChatCode}`, { replace: true });
        return;
      }

      const target = new URLSearchParams(location.search).get('to') || 
        (isAdmin() || isPastor() ? '/admin' : '/preview');
      navigate(target, { replace: true });
    } catch (err) {
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
    } catch (err) {
      setFormError('Failed to send password reset email');
    }
  };

  return (
    <PreviewLayout>
      <ScrollBackground className="min-h-screen flex items-center justify-center py-12 px-4">
        <ScrollWrap className="w-full max-w-md">
          <div className="text-center mb-8">
            <h1 className="text-3xl font-bold text-amber-900" style={{ fontFamily: 'Cinzel, serif' }}>
              {isResettingPassword ? 'Reset Password' : 'Welcome Back'}
            </h1>
            {!isResettingPassword && (
              <p className="text-amber-700 mt-2">
                Don't have an account?{' '}
                <Link to="/signup" className="text-amber-600 font-medium hover:text-amber-800">Sign up</Link>
              </p>
            )}
          </div>

          {/* Error message */}
          {(error || formError) && (
            <div className="bg-red-100 border border-red-300 rounded-lg p-4 mb-6">
              <p className="text-red-800 text-sm">{formError || error}</p>
            </div>
          )}

          {/* Reset success */}
          {resetSuccess && (
            <div className="bg-green-100 border border-green-300 rounded-lg p-4 mb-6">
              <p className="text-green-800 text-sm">Password reset email sent! Check your inbox.</p>
            </div>
          )}

          {isResettingPassword ? (
            <form onSubmit={handleResetPassword} className="space-y-4">
              <div>
                <label className="block text-amber-800 text-sm font-medium mb-1">Email Address</label>
                <input
                  type="email"
                  value={resetEmail}
                  onChange={(e) => setResetEmail(e.target.value)}
                  className="w-full px-4 py-3 rounded-lg border border-amber-300 bg-white focus:outline-none focus:ring-2 focus:ring-amber-500"
                  placeholder="Enter your email"
                />
              </div>
              <button
                type="submit"
                disabled={loading}
                className="w-full py-3 bg-amber-600 hover:bg-amber-700 text-white font-bold rounded-lg transition-colors disabled:opacity-50"
              >
                {loading ? 'Sending...' : 'Send Reset Link'}
              </button>
              <button
                type="button"
                onClick={() => { setIsResettingPassword(false); setResetSuccess(false); setFormError(null); }}
                className="w-full py-2 text-amber-600 hover:text-amber-800 text-sm"
              >
                Back to Login
              </button>
            </form>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-amber-800 text-sm font-medium mb-1">Email Address</label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full px-4 py-3 rounded-lg border border-amber-300 bg-white focus:outline-none focus:ring-2 focus:ring-amber-500"
                  placeholder="Enter your email"
                />
              </div>
              <div>
                <label className="block text-amber-800 text-sm font-medium mb-1">Password</label>
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full px-4 py-3 rounded-lg border border-amber-300 bg-white focus:outline-none focus:ring-2 focus:ring-amber-500"
                  placeholder="Enter your password"
                />
              </div>
              <div className="text-right">
                <button
                  type="button"
                  onClick={() => setIsResettingPassword(true)}
                  className="text-amber-600 hover:text-amber-800 text-sm"
                >
                  Forgot password?
                </button>
              </div>
              <button
                type="submit"
                disabled={loading}
                className="w-full py-3 bg-amber-600 hover:bg-amber-700 text-white font-bold rounded-lg transition-colors disabled:opacity-50"
              >
                {loading ? 'Signing in...' : 'Sign In'}
              </button>
            </form>
          )}

          <div className="mt-8 text-center">
            <Link to="/" className="text-amber-600 hover:text-amber-800 text-sm">
              ← Back to Home
            </Link>
          </div>
        </ScrollWrap>
      </ScrollBackground>
      <FooterScroll />
    </PreviewLayout>
  );
};

export default LoginPageScroll;
