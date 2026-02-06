import React, { useState, useEffect } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { getOwnerSlug } from '../../services/tierSettingsService';
import siteSettingsRepository from '../../repositories/siteSettingsRepository';

/**
 * AdminBranding Component
 * 
 * Allows administrators to customize branding for their organization:
 * - Logo URL
 * - Primary color
 * - Welcome message
 * - Display name
 * - Tagline
 */
const AdminBranding = () => {
  const { isAdmin, profile } = useAuth();
  const isAdminUser = isAdmin && isAdmin();
  
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState(null);
  const [successMessage, setSuccessMessage] = useState(null);
  
  // Form state
  const [logoUrl, setLogoUrl] = useState('');
  const [primaryColor, setPrimaryColor] = useState('#D97706');
  const [welcomeMessage, setWelcomeMessage] = useState('');
  const [displayName, setDisplayName] = useState('');
  const [tagline, setTagline] = useState('');
  
  // Load current settings
  useEffect(() => {
    const loadSettings = async () => {
      setIsLoading(true);
      setError(null);
      
      try {
        const owner = getOwnerSlug();
        const settings = await siteSettingsRepository.getSettings(owner);
        
        if (settings) {
          setLogoUrl(settings.logoUrl || '');
          setPrimaryColor(settings.primaryColor || '#D97706');
          setWelcomeMessage(settings.welcomeMessage || '');
          setDisplayName(settings.displayName || '');
          setTagline(settings.tagline || '');
        }
      } catch (err) {
        console.error('Failed to load branding settings:', err);
        setError('Failed to load branding settings');
      } finally {
        setIsLoading(false);
      }
    };
    
    loadSettings();
  }, []);
  
  const handleSave = async () => {
    setIsSaving(true);
    setError(null);
    setSuccessMessage(null);
    
    try {
      const owner = getOwnerSlug();
      await siteSettingsRepository.updateBranding(owner, {
        logoUrl: logoUrl || null,
        primaryColor: primaryColor || null,
        welcomeMessage: welcomeMessage || null,
        displayName: displayName || null,
        tagline: tagline || null,
      });
      
      setSuccessMessage('Branding settings saved successfully!');
      setTimeout(() => setSuccessMessage(null), 3000);
    } catch (err) {
      console.error('Failed to save branding settings:', err);
      setError('Failed to save branding settings');
    } finally {
      setIsSaving(false);
    }
  };
  
  if (!isAdminUser) {
    return (
      <div className="p-4 bg-red-100 text-red-800 rounded-lg">
        You must be an admin to access branding settings.
      </div>
    );
  }
  
  if (isLoading) {
    return (
      <div className="p-4 text-gray-600">
        Loading branding settings...
      </div>
    );
  }
  
  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-xl font-bold text-gray-800">Organization Branding</h2>
        <span className="text-sm text-gray-500">
          Org: {profile?.owner_slug || 'default'}
        </span>
      </div>
      
      {error && (
        <div className="p-3 bg-red-100 text-red-800 rounded-lg">
          {error}
        </div>
      )}
      
      {successMessage && (
        <div className="p-3 bg-green-100 text-green-800 rounded-lg">
          {successMessage}
        </div>
      )}
      
      <div className="grid gap-4">
        {/* Display Name */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Organization Display Name
          </label>
          <input
            type="text"
            value={displayName}
            onChange={(e) => setDisplayName(e.target.value)}
            placeholder="e.g., Grace Church"
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          />
          <p className="mt-1 text-xs text-gray-500">
            Shown in headers and branding throughout the app
          </p>
        </div>
        
        {/* Tagline */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Tagline
          </label>
          <input
            type="text"
            value={tagline}
            onChange={(e) => setTagline(e.target.value)}
            placeholder="e.g., Growing together in faith"
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          />
        </div>
        
        {/* Logo URL */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Logo URL
          </label>
          <input
            type="url"
            value={logoUrl}
            onChange={(e) => setLogoUrl(e.target.value)}
            placeholder="https://example.com/logo.png"
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          />
          <p className="mt-1 text-xs text-gray-500">
            Recommended size: 200x50 pixels, PNG or SVG format
          </p>
          {logoUrl && (
            <div className="mt-2 p-2 bg-gray-100 rounded-lg">
              <p className="text-xs text-gray-500 mb-2">Preview:</p>
              <img 
                src={logoUrl} 
                alt="Logo preview" 
                className="max-h-12 object-contain"
                onError={(e) => e.target.style.display = 'none'}
              />
            </div>
          )}
        </div>
        
        {/* Primary Color */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Primary Color
          </label>
          <div className="flex items-center gap-3">
            <input
              type="color"
              value={primaryColor}
              onChange={(e) => setPrimaryColor(e.target.value)}
              className="w-12 h-10 border border-gray-300 rounded cursor-pointer"
            />
            <input
              type="text"
              value={primaryColor}
              onChange={(e) => setPrimaryColor(e.target.value)}
              placeholder="#D97706"
              className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            />
          </div>
          <p className="mt-1 text-xs text-gray-500">
            Used for buttons, links, and accent colors
          </p>
        </div>
        
        {/* Welcome Message */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Welcome Message
          </label>
          <textarea
            value={welcomeMessage}
            onChange={(e) => setWelcomeMessage(e.target.value)}
            placeholder="Welcome to our faith community! Start a conversation with any biblical character..."
            rows={3}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          />
          <p className="mt-1 text-xs text-gray-500">
            Shown on the home page to greet users
          </p>
        </div>
      </div>
      
      {/* Save Button */}
      <div className="flex justify-end">
        <button
          onClick={handleSave}
          disabled={isSaving}
          className={`px-6 py-2 rounded-lg font-medium transition-colors ${
            isSaving
              ? 'bg-gray-400 cursor-not-allowed'
              : 'bg-blue-600 hover:bg-blue-700 text-white'
          }`}
        >
          {isSaving ? 'Saving...' : 'Save Branding'}
        </button>
      </div>
    </div>
  );
};

export default AdminBranding;
