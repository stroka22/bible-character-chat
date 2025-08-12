import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { supabase } from '../services/supabase';
import Footer from '../components/Footer';

const ProfilePage = () => {
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
      // Initialize with data from auth user
      setProfile({
        display_name: user.user_metadata?.full_name || user.user_metadata?.name || '',
        avatar_url: user.user_metadata?.avatar_url || '',
        email: user.email || ''
      });
      
      // Try to load profile from database
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
      
      if (error) {
        if (error.code === 'PGRST116') {
          // No data found, which is fine for new users
          console.log('No profile found, using auth data');
        } else if (error.code === '42P01') {
          // Table doesn't exist
          setMessage({
            text: 'Profiles table not found. Please create it in your Supabase database.',
            type: 'error'
          });
          console.error('Profiles table not found:', error);
        } else {
          console.error('Error fetching profile:', error);
        }
      } else if (data) {
        // Update profile with database data
        setProfile({
          display_name: data.display_name || profile.display_name,
          avatar_url: data.avatar_url || profile.avatar_url,
          email: data.email || profile.email
        });
      }
    } catch (error) {
      console.error('Error in fetchProfile:', error);
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
      
      if (error) {
        if (error.code === '42P01') {
          setMessage({
            text: 'Profiles table not found. Please create it in your Supabase database.',
            type: 'error'
          });
        } else if (error.code.startsWith('PGRST')) {
          setMessage({
            text: 'Permission denied. Check Row Level Security (RLS) policies for the profiles table.',
            type: 'error'
          });
        } else {
          setMessage({
            text: `Error saving profile: ${error.message}`,
            type: 'error'
          });
        }
        console.error('Error saving profile:', error);
      } else {
        setMessage({
          text: 'Profile updated successfully!',
          type: 'success'
        });
      }
    } catch (error) {
      setMessage({
        text: `An unexpected error occurred: ${error.message}`,
        type: 'error'
      });
      console.error('Error in handleSubmit:', error);
    } finally {
      setSaving(false);
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
            <span className="text-white font-medium">Profile</span>
          </div>
          <h1 className="text-2xl font-bold mt-2">Your Profile</h1>
        </div>

        {loading ? (
          <div className="flex justify-center items-center h-64">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-yellow-400"></div>
          </div>
        ) : (
          <div className="bg-blue-800 rounded-lg shadow-lg p-6 max-w-2xl mx-auto">
            <form onSubmit={handleSubmit}>
              {/* Message display */}
              {message.text && (
                <div className={`mb-4 p-3 rounded ${
                  message.type === 'success' 
                    ? 'bg-green-700 text-white' 
                    : 'bg-red-700 text-white'
                }`}>
                  {message.text}
                </div>
              )}
              
              {/* Email field (read-only) */}
              <div className="mb-4">
                <label htmlFor="email" className="block text-sm font-medium mb-2">
                  Email
                </label>
                <input
                  type="email"
                  id="email"
                  name="email"
                  value={profile.email}
                  readOnly
                  className="w-full px-3 py-2 bg-blue-700 border border-blue-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-yellow-400"
                />
                <p className="text-xs text-gray-300 mt-1">Email cannot be changed</p>
              </div>
              
              {/* Display Name field */}
              <div className="mb-4">
                <label htmlFor="display_name" className="block text-sm font-medium mb-2">
                  Display Name
                </label>
                <input
                  type="text"
                  id="display_name"
                  name="display_name"
                  value={profile.display_name}
                  onChange={handleChange}
                  className="w-full px-3 py-2 bg-blue-700 border border-blue-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-yellow-400"
                  placeholder="Your display name"
                />
              </div>
              
              {/* Avatar URL field */}
              <div className="mb-6">
                <label htmlFor="avatar_url" className="block text-sm font-medium mb-2">
                  Avatar URL
                </label>
                <div className="flex space-x-4">
                  <input
                    type="text"
                    id="avatar_url"
                    name="avatar_url"
                    value={profile.avatar_url}
                    onChange={handleChange}
                    className="flex-1 px-3 py-2 bg-blue-700 border border-blue-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-yellow-400"
                    placeholder="https://example.com/your-avatar.jpg"
                  />
                  {profile.avatar_url && (
                    <div className="flex-shrink-0">
                      <img 
                        src={profile.avatar_url} 
                        alt="Avatar preview" 
                        className="h-10 w-10 rounded-full object-cover"
                        onError={(e) => {
                          e.target.onerror = null;
                          e.target.src = 'https://via.placeholder.com/40?text=Error';
                        }}
                      />
                    </div>
                  )}
                </div>
                <p className="text-xs text-gray-300 mt-1">Enter a URL to an image for your profile picture</p>
              </div>
              
              {/* Submit button */}
              <div className="flex justify-end">
                <button
                  type="submit"
                  disabled={saving}
                  className={`px-4 py-2 rounded-lg font-medium ${
                    saving
                      ? 'bg-gray-500 cursor-not-allowed'
                      : 'bg-yellow-400 text-blue-900 hover:bg-yellow-300 transition-colors'
                  }`}
                >
                  {saving ? 'Saving...' : 'Save Profile'}
                </button>
              </div>
            </form>
          </div>
        )}
      </div>
      {/* Site footer */}
      <Footer />
    </div>
  );
};

export default ProfilePage;
