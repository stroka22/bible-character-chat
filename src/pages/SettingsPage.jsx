import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { supabase } from '../services/supabase';
import { redeemInvite } from '../services/invitesService';

const SettingsPage = () => {
  const { user } = useAuth();
  const [notificationsEnabled, setNotificationsEnabled] = useState(false);
  const [theme, setTheme] = useState('system');
  const [resetMessage, setResetMessage] = useState({ text: '', type: '' });
  const [isResetting, setIsResetting] = useState(false);
  const [saveMessage, setSaveMessage] = useState({ text: '', type: '' });

  /* ------------------------------------------------------------------
   * Invite-code redemption
   * ------------------------------------------------------------------ */
  const [inviteCode, setInviteCode] = useState('');
  const [redeeming, setRedeeming] = useState(false);
  const [redeemMessage, setRedeemMessage] = useState({ text: '', type: '' });

  // Load preferences from localStorage on mount
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const storedNotifications = localStorage.getItem('notificationsEnabled');
      const storedTheme = localStorage.getItem('themePreference');
      
      if (storedNotifications !== null) {
        setNotificationsEnabled(storedNotifications === 'true');
      }
      
      if (storedTheme) {
        setTheme(storedTheme);
      }
    }
  }, []);

  // Handle redeeming invite code
  const handleRedeemCode = async () => {
    if (!inviteCode.trim()) return;
    setRedeeming(true);
    setRedeemMessage({ text: '', type: '' });

    const { data, error } = await redeemInvite(inviteCode.trim());
    if (error || !data || data.success === false) {
      setRedeemMessage({
        text: error?.message || data?.error || 'Invalid or expired invite code',
        type: 'error',
      });
    } else {
      setRedeemMessage({
        text: `Success! You are now ${data.role} of “${data.owner_slug}”. Reloading…`,
        type: 'success',
      });
      // Give user feedback then refresh
      setTimeout(() => window.location.reload(), 2500);
    }
    setRedeeming(false);
  };

  // Handle notifications toggle
  const handleNotificationsToggle = () => {
    const newValue = !notificationsEnabled;
    setNotificationsEnabled(newValue);
    localStorage.setItem('notificationsEnabled', newValue.toString());
    showSaveMessage('Notification preferences saved!');
  };

  // Handle theme change
  const handleThemeChange = (e) => {
    const newTheme = e.target.value;
    setTheme(newTheme);
    localStorage.setItem('themePreference', newTheme);
    showSaveMessage('Theme preference saved!');
  };

  // Show temporary save message
  const showSaveMessage = (text) => {
    setSaveMessage({ text, type: 'success' });
    setTimeout(() => {
      setSaveMessage({ text: '', type: '' });
    }, 3000);
  };

  // Handle password reset
  const handlePasswordReset = async () => {
    if (!user?.email) return;
    
    try {
      setIsResetting(true);
      setResetMessage({ text: '', type: '' });
      
      const { error } = await supabase.auth.resetPasswordForEmail(
        user.email,
        { redirectTo: window.location.origin + '/auth/callback' }
      );
      
      if (error) {
        setResetMessage({
          text: `Error sending reset email: ${error.message}`,
          type: 'error'
        });
      } else {
        setResetMessage({
          text: 'Password reset email sent! Check your inbox.',
          type: 'success'
        });
      }
    } catch (error) {
      setResetMessage({
        text: `An unexpected error occurred: ${error.message}`,
        type: 'error'
      });
    } finally {
      setIsResetting(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-blue-900 via-blue-700 to-blue-600 text-white">
      <div className="container mx-auto px-4 py-8">
        {/* Breadcrumb */}
        <div className="mb-6">
          <div className="flex items-center space-x-2 text-sm">
            <Link to="/" className="text-yellow-300 hover:text-yellow-400 transition-colors">
              Home
            </Link>
            <span>&gt;</span>
            <span className="text-white font-medium">Settings</span>
          </div>
          <h1 className="text-2xl font-bold mt-2">Settings</h1>
        </div>

        <div className="max-w-2xl mx-auto space-y-6">
          {/* Preferences Section */}
          <div className="bg-blue-800 rounded-lg shadow-lg p-6">
            <h2 className="text-xl font-semibold mb-4">Preferences</h2>
            
            {/* Save message */}
            {saveMessage.text && (
              <div className="mb-4 p-3 rounded bg-green-700 text-white">
                {saveMessage.text}
              </div>
            )}
            
            {/* Notifications Toggle */}
            <div className="mb-4">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="font-medium">Notifications</h3>
                  <p className="text-sm text-gray-300">Receive email notifications about new features and updates</p>
                </div>
                <button 
                  onClick={handleNotificationsToggle}
                  className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                    notificationsEnabled ? 'bg-yellow-400' : 'bg-gray-500'
                  }`}
                >
                  <span 
                    className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                      notificationsEnabled ? 'translate-x-6' : 'translate-x-1'
                    }`} 
                  />
                </button>
              </div>
            </div>
            
            {/* Theme Selector */}
            <div>
              <h3 className="font-medium mb-2">Theme</h3>
              <select
                value={theme}
                onChange={handleThemeChange}
                className="w-full px-3 py-2 bg-blue-700 border border-blue-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-yellow-400"
              >
                <option value="light">Light</option>
                <option value="dark">Dark</option>
                <option value="system">System Default</option>
              </select>
              <p className="text-sm text-gray-300 mt-1">Select your preferred theme</p>
            </div>
          </div>

          {/* Security Section */}
          <div className="bg-blue-800 rounded-lg shadow-lg p-6">
            <h2 className="text-xl font-semibold mb-4">Security</h2>
            
            {/* Reset message */}
            {resetMessage.text && (
              <div className={`mb-4 p-3 rounded ${
                resetMessage.type === 'success' 
                  ? 'bg-green-700 text-white' 
                  : 'bg-red-700 text-white'
              }`}>
                {resetMessage.text}
              </div>
            )}
            
            {/* Email Display */}
            <div className="mb-4">
              <label className="block text-sm font-medium mb-2">
                Email Address
              </label>
              <input
                type="email"
                value={user?.email || ''}
                readOnly
                className="w-full px-3 py-2 bg-blue-700 border border-blue-600 rounded-lg focus:outline-none"
              />
              <p className="text-xs text-gray-300 mt-1">Your account email cannot be changed</p>
            </div>
            
            {/* Password Reset */}
            <div>
              <h3 className="font-medium mb-2">Password</h3>
              <button
                onClick={handlePasswordReset}
                disabled={isResetting}
                className={`px-4 py-2 rounded-lg font-medium ${
                  isResetting
                    ? 'bg-gray-500 cursor-not-allowed'
                    : 'bg-yellow-400 text-blue-900 hover:bg-yellow-300 transition-colors'
                }`}
              >
                {isResetting ? 'Sending Email...' : 'Send Password Reset Email'}
              </button>
              <p className="text-sm text-gray-300 mt-2">
                We'll send a password reset link to your email address
              </p>
            </div>
          </div>

          {/* Invite Code Section */}
          <div className="bg-blue-800 rounded-lg shadow-lg p-6">
            <h2 className="text-xl font-semibold mb-4">Invite Code</h2>

            {redeemMessage.text && (
              <div
                className={`mb-4 p-3 rounded ${
                  redeemMessage.type === 'success'
                    ? 'bg-green-700 text-white'
                    : 'bg-red-700 text-white'
                }`}
              >
                {redeemMessage.text}
              </div>
            )}

            <div className="flex flex-col sm:flex-row items-center gap-4">
              <input
                type="text"
                value={inviteCode}
                onChange={(e) => setInviteCode(e.target.value.toUpperCase())}
                placeholder="XXXX-XXXX-XXXX"
                className="flex-1 px-3 py-2 bg-blue-700 border border-blue-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-yellow-400 uppercase tracking-widest"
              />
              <button
                onClick={handleRedeemCode}
                disabled={redeeming || !inviteCode.trim()}
                className={`px-4 py-2 rounded-lg font-medium ${
                  redeeming || !inviteCode.trim()
                    ? 'bg-gray-500 cursor-not-allowed'
                    : 'bg-yellow-400 text-blue-900 hover:bg-yellow-300 transition-colors'
                }`}
              >
                {redeeming ? 'Redeeming…' : 'Redeem'}
              </button>
            </div>
            <p className="text-sm text-gray-300 mt-2">
              Enter an invite code provided by an organization or pastor to gain access.
            </p>
          </div>

          {/* Account Management Section */}
          <div className="bg-blue-800 rounded-lg shadow-lg p-6">
            <h2 className="text-xl font-semibold mb-4">Account</h2>
            <div className="border-t border-blue-700 pt-4">
              <Link 
                to="/profile" 
                className="text-yellow-300 hover:text-yellow-400 transition-colors"
              >
                Edit Profile
              </Link>
            </div>
            <div className="border-t border-blue-700 pt-4 mt-4">
              <button 
                className="text-red-400 hover:text-red-300 transition-colors"
                onClick={() => {
                  if (window.confirm('Are you sure you want to delete your account? This action cannot be undone.')) {
                    alert('Account deletion is not implemented in this demo. In a real app, this would delete your account.');
                  }
                }}
              >
                Delete Account
              </button>
              <p className="text-xs text-gray-300 mt-1">
                This will permanently delete your account and all associated data
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SettingsPage;
