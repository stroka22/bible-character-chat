import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { supabase } from '../services/supabase';
import { redeemInvite } from '../services/invitesService';
import FooterScroll from '../components/FooterScroll';
import PreviewLayout from '../components/PreviewLayout';
import { ScrollWrap, ScrollDivider, ScrollBackground } from '../components/ScrollWrap';

const SettingsPageScroll = () => {
  const { user, profile, refreshProfile, resetPassword } = useAuth();
  const [notificationsEnabled, setNotificationsEnabled] = useState(false);
  const [theme, setTheme] = useState('system');
  const [message, setMessage] = useState({ text: '', type: '' });
  const [weeklyCsvEnabled, setWeeklyCsvEnabled] = useState(false);
  const [savingCsv, setSavingCsv] = useState(false);
  
  // Invite code
  const [inviteCode, setInviteCode] = useState('');
  const [redeeming, setRedeeming] = useState(false);
  const [redeemMessage, setRedeemMessage] = useState({ text: '', type: '' });
  
  // Password reset
  const [isResetting, setIsResetting] = useState(false);
  const [resetMessage, setResetMessage] = useState({ text: '', type: '' });

  useEffect(() => {
    if (typeof window !== 'undefined') {
      const storedNotifications = localStorage.getItem('notificationsEnabled');
      const storedTheme = localStorage.getItem('themePreference');
      if (storedNotifications !== null) setNotificationsEnabled(storedNotifications === 'true');
      if (storedTheme) setTheme(storedTheme);
    }
  }, []);

  useEffect(() => {
    setWeeklyCsvEnabled(!!(profile && profile.weekly_csv_enabled));
  }, [profile]);

  const showMessage = (text, type = 'success') => {
    setMessage({ text, type });
    setTimeout(() => setMessage({ text: '', type: '' }), 3000);
  };

  const handleNotificationsToggle = () => {
    const newValue = !notificationsEnabled;
    setNotificationsEnabled(newValue);
    localStorage.setItem('notificationsEnabled', newValue.toString());
    showMessage('Notification preference saved!');
  };

  const handleThemeChange = (newTheme) => {
    setTheme(newTheme);
    localStorage.setItem('themePreference', newTheme);
    showMessage('Theme preference saved!');
  };

  const handleWeeklyCsvToggle = async () => {
    if (!user) return;
    const next = !weeklyCsvEnabled;
    setWeeklyCsvEnabled(next);
    setSavingCsv(true);
    try {
      const { error } = await supabase.from('profiles').update({ weekly_csv_enabled: next }).eq('id', user.id);
      if (error) throw error;
      try { await refreshProfile(user.id); } catch {}
      showMessage('Weekly CSV preference saved!');
    } catch (err) {
      setWeeklyCsvEnabled(!next);
      showMessage('Failed to update preference', 'error');
    } finally {
      setSavingCsv(false);
    }
  };

  const handleRedeemCode = async () => {
    if (!inviteCode.trim()) return;
    setRedeeming(true);
    setRedeemMessage({ text: '', type: '' });
    
    const { data, error } = await redeemInvite(inviteCode.trim());
    if (error || !data || data.success === false) {
      setRedeemMessage({ text: error?.message || 'Invalid or expired invite code', type: 'error' });
    } else {
      setRedeemMessage({ text: `Success! You are now ${data.role} of "${data.owner_slug}".`, type: 'success' });
      setTimeout(() => window.location.reload(), 2500);
    }
    setRedeeming(false);
  };

  const handlePasswordReset = async () => {
    if (!user?.email) return;
    setIsResetting(true);
    setResetMessage({ text: '', type: '' });
    try {
      await resetPassword(user.email);
      setResetMessage({ text: 'Password reset email sent! Check your inbox.', type: 'success' });
    } catch (err) {
      setResetMessage({ text: 'Failed to send reset email', type: 'error' });
    } finally {
      setIsResetting(false);
    }
  };

  if (!user) {
    return (
      <PreviewLayout>
        <ScrollBackground className="min-h-screen py-8 px-4">
          <ScrollWrap className="max-w-2xl mx-auto text-center">
            <h1 className="text-3xl font-bold text-amber-900 mb-4" style={{ fontFamily: 'Cinzel, serif' }}>Login Required</h1>
            <p className="text-amber-700 mb-6">Please log in to view settings.</p>
            <Link to="/login/preview" className="px-6 py-3 bg-amber-600 text-white rounded-lg font-medium hover:bg-amber-700">Log In</Link>
          </ScrollWrap>
        </ScrollBackground>
        <FooterScroll />
      </PreviewLayout>
    );
  }

  return (
    <PreviewLayout>
      <ScrollBackground className="min-h-screen py-8 px-4">
        <ScrollWrap className="max-w-2xl mx-auto">
          {/* Header */}
          <div className="flex items-center justify-between mb-6">
            <h1 className="text-3xl font-bold text-amber-900" style={{ fontFamily: 'Cinzel, serif' }}>Settings</h1>
            <Link to="/profile/preview" className="px-4 py-2 bg-amber-100 text-amber-800 rounded-lg font-medium hover:bg-amber-200 border border-amber-300">
              Profile
            </Link>
          </div>

          {/* Message */}
          {message.text && (
            <div className={`p-4 rounded-lg mb-6 ${message.type === 'success' ? 'bg-green-100 border border-green-300 text-green-800' : 'bg-red-100 border border-red-300 text-red-800'}`}>
              {message.text}
            </div>
          )}

          {/* Preferences Section */}
          <section className="mb-8">
            <h2 className="text-xl font-bold text-amber-800 mb-4" style={{ fontFamily: 'Cinzel, serif' }}>Preferences</h2>
            
            {/* Notifications */}
            <div className="bg-white/80 rounded-xl border border-amber-200 p-4 mb-3">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="font-medium text-amber-900">Notifications</h3>
                  <p className="text-amber-600 text-sm">Receive updates about new features</p>
                </div>
                <button
                  onClick={handleNotificationsToggle}
                  className={`w-12 h-6 rounded-full transition-colors ${notificationsEnabled ? 'bg-amber-600' : 'bg-amber-200'}`}
                >
                  <div className={`w-5 h-5 bg-white rounded-full shadow transition-transform ${notificationsEnabled ? 'translate-x-6' : 'translate-x-0.5'}`} />
                </button>
              </div>
            </div>

            {/* Weekly CSV */}
            <div className="bg-white/80 rounded-xl border border-amber-200 p-4 mb-3">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="font-medium text-amber-900">Weekly Progress Email</h3>
                  <p className="text-amber-600 text-sm">Receive a weekly summary of your progress</p>
                </div>
                <button
                  onClick={handleWeeklyCsvToggle}
                  disabled={savingCsv}
                  className={`w-12 h-6 rounded-full transition-colors ${weeklyCsvEnabled ? 'bg-amber-600' : 'bg-amber-200'} disabled:opacity-50`}
                >
                  <div className={`w-5 h-5 bg-white rounded-full shadow transition-transform ${weeklyCsvEnabled ? 'translate-x-6' : 'translate-x-0.5'}`} />
                </button>
              </div>
            </div>

            {/* Theme */}
            <div className="bg-white/80 rounded-xl border border-amber-200 p-4">
              <h3 className="font-medium text-amber-900 mb-2">Theme</h3>
              <div className="flex gap-2">
                {['system', 'light', 'dark'].map(t => (
                  <button
                    key={t}
                    onClick={() => handleThemeChange(t)}
                    className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                      theme === t ? 'bg-amber-600 text-white' : 'bg-amber-100 text-amber-700 hover:bg-amber-200'
                    }`}
                  >
                    {t.charAt(0).toUpperCase() + t.slice(1)}
                  </button>
                ))}
              </div>
            </div>
          </section>

          <ScrollDivider />

          {/* Security Section */}
          <section className="mb-8">
            <h2 className="text-xl font-bold text-amber-800 mb-4" style={{ fontFamily: 'Cinzel, serif' }}>Security</h2>
            
            <div className="bg-white/80 rounded-xl border border-amber-200 p-4">
              <h3 className="font-medium text-amber-900 mb-2">Password</h3>
              <p className="text-amber-600 text-sm mb-3">Reset your password via email</p>
              {resetMessage.text && (
                <p className={`text-sm mb-3 ${resetMessage.type === 'success' ? 'text-green-600' : 'text-red-600'}`}>
                  {resetMessage.text}
                </p>
              )}
              <button
                onClick={handlePasswordReset}
                disabled={isResetting}
                className="px-4 py-2 bg-amber-100 text-amber-800 rounded-lg font-medium hover:bg-amber-200 border border-amber-300 disabled:opacity-50"
              >
                {isResetting ? 'Sending...' : 'Send Reset Email'}
              </button>
            </div>
          </section>

          <ScrollDivider />

          {/* Organization Invite Section */}
          <section className="mb-8">
            <h2 className="text-xl font-bold text-amber-800 mb-4" style={{ fontFamily: 'Cinzel, serif' }}>Organization</h2>
            
            <div className="bg-white/80 rounded-xl border border-amber-200 p-4">
              <h3 className="font-medium text-amber-900 mb-2">Join an Organization</h3>
              <p className="text-amber-600 text-sm mb-3">Enter an invite code to join a church or organization</p>
              {redeemMessage.text && (
                <p className={`text-sm mb-3 ${redeemMessage.type === 'success' ? 'text-green-600' : 'text-red-600'}`}>
                  {redeemMessage.text}
                </p>
              )}
              <div className="flex gap-2">
                <input
                  type="text"
                  value={inviteCode}
                  onChange={(e) => setInviteCode(e.target.value)}
                  placeholder="Enter invite code"
                  className="flex-1 px-4 py-2 rounded-lg border border-amber-300 bg-white focus:outline-none focus:ring-2 focus:ring-amber-500"
                />
                <button
                  onClick={handleRedeemCode}
                  disabled={redeeming || !inviteCode.trim()}
                  className="px-4 py-2 bg-amber-600 text-white rounded-lg font-medium hover:bg-amber-700 disabled:opacity-50"
                >
                  {redeeming ? 'Joining...' : 'Join'}
                </button>
              </div>
            </div>
          </section>

          {/* Account Info */}
          <section className="bg-amber-50/50 rounded-xl border border-amber-200 p-4">
            <h3 className="font-medium text-amber-900 mb-2">Account Information</h3>
            <p className="text-amber-700 text-sm">Email: {user.email}</p>
            <p className="text-amber-700 text-sm">Account ID: {user.id?.slice(0, 8)}...</p>
          </section>

          <div className="mt-8 text-center">
            <Link to="/preview" className="text-amber-600 hover:text-amber-800 text-sm">← Back to Home</Link>
          </div>
        </ScrollWrap>
      </ScrollBackground>
      <FooterScroll />
    </PreviewLayout>
  );
};

export default SettingsPageScroll;
