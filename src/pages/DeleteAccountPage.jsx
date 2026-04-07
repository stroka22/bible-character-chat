import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../services/supabase';
import { useAuth } from '../contexts/AuthContext';
import Header from '../components/Header';
import Footer from '../components/Footer';

const DeleteAccountPage = () => {
  const { user, signOut } = useAuth();
  const navigate = useNavigate();
  const [confirmEmail, setConfirmEmail] = useState('');
  const [deleting, setDeleting] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);

  const handleDeleteAccount = async (e) => {
    e.preventDefault();
    setError('');

    if (!user) {
      setError('You must be logged in to delete your account.');
      return;
    }

    if (confirmEmail.toLowerCase() !== user.email?.toLowerCase()) {
      setError('Email address does not match your account.');
      return;
    }

    if (!window.confirm('Are you absolutely sure? This will permanently delete your account and all your data. This action cannot be undone.')) {
      return;
    }

    setDeleting(true);

    try {
      const { error: deleteError } = await supabase.functions.invoke('delete-user', {
        body: { userId: user.id }
      });

      if (deleteError) throw deleteError;

      setSuccess(true);
      await signOut();
      
      setTimeout(() => {
        navigate('/');
      }, 3000);
    } catch (err) {
      console.error('Delete account error:', err);
      setError(err.message || 'Failed to delete account. Please try again or contact support.');
    } finally {
      setDeleting(false);
    }
  };

  if (success) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-blue-900 to-blue-950 text-white">
        <Header />
        <div className="container mx-auto px-4 py-16 max-w-md">
          <div className="bg-blue-800/50 rounded-xl p-8 text-center">
            <div className="text-green-400 text-5xl mb-4">✓</div>
            <h1 className="text-2xl font-bold mb-4">Account Deleted</h1>
            <p className="text-gray-300">
              Your account and all associated data have been permanently deleted.
              You will be redirected to the home page shortly.
            </p>
          </div>
        </div>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-blue-900 to-blue-950 text-white">
      <Header />
      <div className="container mx-auto px-4 py-16 max-w-lg">
        <div className="bg-blue-800/50 rounded-xl p-8">
          <h1 className="text-2xl font-bold mb-2 text-red-400">Delete Account</h1>
          <p className="text-gray-300 mb-6">
            This action is permanent and cannot be undone. All your data will be deleted, including:
          </p>
          
          <ul className="list-disc list-inside text-gray-300 mb-6 space-y-1">
            <li>Your profile and account information</li>
            <li>All conversations and chat history</li>
            <li>Bible study progress</li>
            <li>Favorites and saved content</li>
            <li>Subscription data (subscription will be cancelled)</li>
          </ul>

          {!user ? (
            <div className="bg-blue-900/50 rounded-lg p-4">
              <p className="text-gray-300 mb-4">
                You must be logged in to delete your account.
              </p>
              <button
                onClick={() => navigate('/login')}
                className="w-full py-3 bg-blue-600 hover:bg-blue-700 rounded-lg font-semibold transition-colors"
              >
                Log In
              </button>
            </div>
          ) : (
            <form onSubmit={handleDeleteAccount}>
              <div className="mb-4">
                <label className="block text-sm text-gray-300 mb-2">
                  To confirm, please enter your email address: <strong>{user.email}</strong>
                </label>
                <input
                  type="email"
                  value={confirmEmail}
                  onChange={(e) => setConfirmEmail(e.target.value)}
                  placeholder="Enter your email to confirm"
                  className="w-full px-4 py-3 bg-blue-900/50 border border-blue-700 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:border-red-500"
                  required
                />
              </div>

              {error && (
                <div className="mb-4 p-3 bg-red-900/50 border border-red-700 rounded-lg text-red-300 text-sm">
                  {error}
                </div>
              )}

              <button
                type="submit"
                disabled={deleting || !confirmEmail}
                className="w-full py-3 bg-red-600 hover:bg-red-700 disabled:bg-gray-600 disabled:cursor-not-allowed rounded-lg font-semibold transition-colors"
              >
                {deleting ? 'Deleting Account...' : 'Permanently Delete My Account'}
              </button>

              <button
                type="button"
                onClick={() => navigate(-1)}
                className="w-full py-3 mt-3 bg-transparent border border-gray-500 hover:border-gray-400 rounded-lg font-semibold transition-colors"
              >
                Cancel
              </button>
            </form>
          )}

          <p className="text-xs text-gray-400 mt-6 text-center">
            If you're having trouble deleting your account, please contact us at{' '}
            <a href="mailto:support@faithtalkai.com" className="text-blue-400 hover:underline">
              support@faithtalkai.com
            </a>
          </p>
        </div>
      </div>
      <Footer />
    </div>
  );
};

export default DeleteAccountPage;
