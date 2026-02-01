import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { supabase } from '../services/supabase';
import FooterScroll from '../components/FooterScroll';
import PreviewLayout from '../components/PreviewLayout';
import { ScrollWrap, ScrollDivider, ScrollBackground } from '../components/ScrollWrap';

const ProfilePageScroll = () => {
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState({ text: '', type: '' });
  const [profile, setProfile] = useState({
    display_name: '',
    avatar_url: '',
    email: ''
  });

  useEffect(() => {
    if (user) {
      setProfile({
        display_name: user.user_metadata?.full_name || user.user_metadata?.name || '',
        avatar_url: user.user_metadata?.avatar_url || '',
        email: user.email || ''
      });
      fetchProfile();
    }
  }, [user]);

  const fetchProfile = async () => {
    try {
      setLoading(true);
      if (!user) return;
      
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', user.id)
        .single();
      
      if (!error && data) {
        setProfile({
          display_name: data.display_name || profile.display_name,
          avatar_url: data.avatar_url || profile.avatar_url,
          email: data.email || profile.email
        });
      }
    } catch (error) {
      console.error('Error fetching profile:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setProfile({ ...profile, [name]: value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!user) return;
    
    try {
      setSaving(true);
      setMessage({ text: '', type: '' });
      
      const updates = {
        id: user.id,
        email: profile.email,
        display_name: profile.display_name,
        avatar_url: profile.avatar_url,
        updated_at: new Date()
      };
      
      const { error } = await supabase
        .from('profiles')
        .upsert(updates, { onConflict: 'id' });
      
      if (error) throw error;
      setMessage({ text: 'Profile updated successfully!', type: 'success' });
    } catch (error) {
      console.error('Error updating profile:', error);
      setMessage({ text: 'Error updating profile. Please try again.', type: 'error' });
    } finally {
      setSaving(false);
      setTimeout(() => setMessage({ text: '', type: '' }), 3000);
    }
  };

  if (!user) {
    return (
      <PreviewLayout>
        <ScrollBackground className="min-h-screen py-8 px-4">
          <ScrollWrap className="max-w-2xl mx-auto text-center">
            <h1 className="text-3xl font-bold text-amber-900 mb-4" style={{ fontFamily: 'Cinzel, serif' }}>Login Required</h1>
            <p className="text-amber-700 mb-6">Please log in to view your profile.</p>
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
            <h1 className="text-3xl font-bold text-amber-900" style={{ fontFamily: 'Cinzel, serif' }}>My Profile</h1>
            <Link to="/settings/preview" className="px-4 py-2 bg-amber-100 text-amber-800 rounded-lg font-medium hover:bg-amber-200 border border-amber-300">
              Settings
            </Link>
          </div>

          <ScrollDivider />

          {/* Message */}
          {message.text && (
            <div className={`p-4 rounded-lg mb-6 ${message.type === 'success' ? 'bg-green-100 border border-green-300 text-green-800' : 'bg-red-100 border border-red-300 text-red-800'}`}>
              {message.text}
            </div>
          )}

          {loading ? (
            <div className="text-center py-12">
              <div className="inline-block w-12 h-12 border-4 border-amber-300 border-t-amber-600 rounded-full animate-spin" />
              <p className="mt-4 text-amber-700">Loading profile...</p>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Avatar Preview */}
              <div className="text-center">
                <div className="w-24 h-24 mx-auto rounded-full overflow-hidden ring-4 ring-amber-300 bg-amber-100">
                  {profile.avatar_url ? (
                    <img src={profile.avatar_url} alt="Avatar" className="w-full h-full object-cover" />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-amber-600 text-3xl font-bold">
                      {profile.display_name?.charAt(0) || profile.email?.charAt(0) || '?'}
                    </div>
                  )}
                </div>
              </div>

              {/* Display Name */}
              <div>
                <label className="block text-amber-800 text-sm font-medium mb-1">Display Name</label>
                <input
                  type="text"
                  name="display_name"
                  value={profile.display_name}
                  onChange={handleChange}
                  className="w-full px-4 py-3 rounded-lg border border-amber-300 bg-white focus:outline-none focus:ring-2 focus:ring-amber-500"
                  placeholder="Your display name"
                />
              </div>

              {/* Email */}
              <div>
                <label className="block text-amber-800 text-sm font-medium mb-1">Email</label>
                <input
                  type="email"
                  name="email"
                  value={profile.email}
                  onChange={handleChange}
                  disabled
                  className="w-full px-4 py-3 rounded-lg border border-amber-200 bg-amber-50 text-amber-600 cursor-not-allowed"
                />
                <p className="text-amber-600 text-xs mt-1">Email cannot be changed here</p>
              </div>

              {/* Avatar URL */}
              <div>
                <label className="block text-amber-800 text-sm font-medium mb-1">Avatar URL</label>
                <input
                  type="url"
                  name="avatar_url"
                  value={profile.avatar_url}
                  onChange={handleChange}
                  className="w-full px-4 py-3 rounded-lg border border-amber-300 bg-white focus:outline-none focus:ring-2 focus:ring-amber-500"
                  placeholder="https://example.com/avatar.jpg"
                />
              </div>

              {/* Submit */}
              <button
                type="submit"
                disabled={saving}
                className="w-full py-3 bg-amber-600 hover:bg-amber-700 text-white font-bold rounded-lg transition-colors disabled:opacity-50"
              >
                {saving ? 'Saving...' : 'Save Profile'}
              </button>
            </form>
          )}

          {/* Quick Links */}
          <div className="mt-8 pt-6 border-t border-amber-200">
            <h3 className="font-bold text-amber-800 mb-4">Quick Links</h3>
            <div className="grid grid-cols-2 gap-3">
              <Link to="/my-walk/preview" className="p-3 bg-amber-50 rounded-lg border border-amber-200 text-amber-700 hover:bg-amber-100 text-center text-sm">
                My Walk
              </Link>
              <Link to="/favorites/preview" className="p-3 bg-amber-50 rounded-lg border border-amber-200 text-amber-700 hover:bg-amber-100 text-center text-sm">
                Favorites
              </Link>
              <Link to="/pricing/preview" className="p-3 bg-amber-50 rounded-lg border border-amber-200 text-amber-700 hover:bg-amber-100 text-center text-sm">
                Subscription
              </Link>
              <Link to="/settings/preview" className="p-3 bg-amber-50 rounded-lg border border-amber-200 text-amber-700 hover:bg-amber-100 text-center text-sm">
                Settings
              </Link>
            </div>
          </div>

          <div className="mt-8 text-center">
            <Link to="/preview" className="text-amber-600 hover:text-amber-800 text-sm">← Back to Home</Link>
          </div>
        </ScrollWrap>
      </ScrollBackground>
      <FooterScroll />
    </PreviewLayout>
  );
};

export default ProfilePageScroll;
