import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { listInvites, createInvite, getMyProfile } from '../../services/invitesService';
import { supabase } from '../../services/supabase';

const AdminInvitesPage = () => {
  // State for profile and role
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isSuperAdmin, setIsSuperAdmin] = useState(false);
  
  // State for invites list
  const [invites, setInvites] = useState([]);
  const [loadingInvites, setLoadingInvites] = useState(true);
  
  // State for owners list (for superadmin)
  const [owners, setOwners] = useState([]);
  const [loadingOwners, setLoadingOwners] = useState(false);
  
  // State for create invite form
  const [formData, setFormData] = useState({
    role: 'user',
    ownerSlug: '',
    maxUses: 1, // can be number | 'custom' | 'unlimited'
    expiresInDays: 7,
    customMaxUses: 100, // sensible default
  });
  
  // State for create invite status
  const [creating, setCreating] = useState(false);
  const [createError, setCreateError] = useState('');
  const [newInvite, setNewInvite] = useState(null);
  
  const { user } = useAuth();
  
  // Load profile and invites on mount
  useEffect(() => {
    const loadProfile = async () => {
      setLoading(true);
      try {
        const { data, error } = await getMyProfile();
        if (error) throw error;
        
        setProfile(data);
        setIsSuperAdmin(data.role === 'superadmin');
        setFormData(prev => ({
          ...prev,
          ownerSlug: data.owner_slug || 'default'
        }));
        
        // Load invites after profile is loaded
        await loadInvites(data);
        
        // If superadmin, load owners list
        if (data.role === 'superadmin') {
          await loadOwners();
        }
      } catch (error) {
        console.error('Error loading profile:', error);
      } finally {
        setLoading(false);
      }
    };
    
    loadProfile();
  }, [user]);
  
  // Load invites based on profile
  const loadInvites = async (profileData) => {
    setLoadingInvites(true);
    try {
      const options = {};
      // Filter by owner_slug unless superadmin
      if (profileData && profileData.role !== 'superadmin' && profileData.owner_slug) {
        options.ownerSlug = profileData.owner_slug;
      }
      
      const { data, error } = await listInvites(options);
      if (error) throw error;
      
      setInvites(data || []);
    } catch (error) {
      console.error('Error loading invites:', error);
    } finally {
      setLoadingInvites(false);
    }
  };
  
  // Load owners list for superadmin
  const loadOwners = async () => {
    setLoadingOwners(true);
    try {
      const { data, error } = await supabase
        .from('owners')
        .select('owner_slug, display_name')
        .order('display_name');
      
      if (error) throw error;
      setOwners(data || []);
    } catch (error) {
      console.error('Error loading owners:', error);
    } finally {
      setLoadingOwners(false);
    }
  };
  
  // Handle form input changes
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };
  
  // Handle form submission
  const handleSubmit = async (e) => {
    e.preventDefault();
    setCreating(true);
    setCreateError('');
    setNewInvite(null);
    
    try {
      // Calculate expiration date
      let expiresAt = null;
      if (formData.expiresInDays !== 'never') {
        const days = parseInt(formData.expiresInDays, 10);
        expiresAt = new Date();
        expiresAt.setDate(expiresAt.getDate() + days);
      }
      
      // Determine max uses (null means unlimited)
      let maxUses = null;
      if (formData.maxUses === 'custom') {
        maxUses = Math.max(1, parseInt(formData.customMaxUses, 10) || 1);
      } else if (formData.maxUses === 'unlimited') {
        maxUses = null;
      } else {
        maxUses = parseInt(formData.maxUses, 10);
      }
      
      // Create invite
      const { data, error } = await createInvite({
        ownerSlug: formData.ownerSlug,
        role: formData.role,
        expiresAt,
        maxUses
      });
      
      if (error) throw error;
      
      setNewInvite(data);
      
      // Refresh invites list
      await loadInvites(profile);
      
    } catch (error) {
      console.error('Error creating invite:', error);
      setCreateError(error.message || 'Failed to create invite');
    } finally {
      setCreating(false);
    }
  };
  
  // Copy invite code to clipboard
  const copyToClipboard = (text) => {
    navigator.clipboard.writeText(text)
      .then(() => {
        alert('Copied to clipboard!');
      })
      .catch(err => {
        console.error('Failed to copy:', err);
      });
  };
  
  // Format date for display
  const formatDate = (dateString) => {
    if (!dateString) return 'Never';
    const date = new Date(dateString);
    return date.toLocaleDateString() + ' ' + date.toLocaleTimeString();
  };
  
  // Calculate status of invite
  const getInviteStatus = (invite) => {
    if (invite.use_count >= invite.max_uses) {
      return { text: 'Used', className: 'bg-gray-500' };
    }
    
    if (invite.expires_at && new Date(invite.expires_at) < new Date()) {
      return { text: 'Expired', className: 'bg-red-600' };
    }
    
    return { text: 'Active', className: 'bg-green-600' };
  };
  
  if (loading) {
    return (
      <div className="min-h-screen bg-blue-900 text-white p-8">
        <div className="flex justify-center items-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-yellow-400"></div>
        </div>
      </div>
    );
  }
  
  return (
    <div className="min-h-screen bg-gradient-to-b from-blue-900 via-blue-700 to-blue-600 text-white p-4 md:p-8">
      <div className="max-w-6xl mx-auto">
        {/* Breadcrumb */}
        <div className="mb-6">
          <div className="flex items-center space-x-2 text-sm">
            <Link to="/" className="text-yellow-300 hover:text-yellow-400 transition-colors">
              Home
            </Link>
            <span>&gt;</span>
            <Link to="/admin" className="text-yellow-300 hover:text-yellow-400 transition-colors">
              Admin
            </Link>
            <span>&gt;</span>
            <span className="text-white font-medium">Invites</span>
          </div>
          <h1 className="text-2xl font-bold mt-2">Manage Invites</h1>
        </div>
        
        {/* Create Invite Form */}
        <div className="bg-blue-800 rounded-lg shadow-lg p-6 mb-8">
          <h2 className="text-xl font-semibold mb-4">Create New Invite</h2>
          
          {createError && (
            <div className="mb-4 p-3 rounded bg-red-700 text-white">
              {createError}
            </div>
          )}
          
          {newInvite && (
            <div className="mb-4 p-4 rounded bg-green-700 text-white">
              <div className="flex flex-col sm:flex-row items-center justify-between">
                <div>
                  <p className="font-bold">New invite created!</p>
                  <p className="text-lg font-mono mt-2">{newInvite.code}</p>
                </div>
                <button
                  onClick={() => copyToClipboard(newInvite.code)}
                  className="mt-3 sm:mt-0 px-4 py-2 bg-blue-600 hover:bg-blue-700 rounded-lg transition-colors"
                >
                  Copy Code
                </button>
              </div>
            </div>
          )}
          
          <form onSubmit={handleSubmit}>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Role Selection */}
              <div>
                <label className="block text-sm font-medium mb-2">
                  Role
                </label>
                <select
                  name="role"
                  value={formData.role}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 bg-blue-700 border border-blue-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-yellow-400"
                >
                  <option value="user">User</option>
                  <option value="admin">Admin</option>
                </select>
                <p className="text-xs text-gray-300 mt-1">
                  {formData.role === 'admin' 
                    ? 'Admin can create invites and manage users within their organization' 
                    : 'Regular user with access to the organization\'s content'}
                </p>
              </div>
              
              {/* Owner Slug Selection */}
              <div>
                <label className="block text-sm font-medium mb-2">
                  Organization
                </label>
                {isSuperAdmin ? (
                  <select
                    name="ownerSlug"
                    value={formData.ownerSlug}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 bg-blue-700 border border-blue-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-yellow-400"
                  >
                    {loadingOwners ? (
                      <option>Loading...</option>
                    ) : (
                      owners.map(owner => (
                        <option key={owner.owner_slug} value={owner.owner_slug}>
                          {owner.display_name} ({owner.owner_slug})
                        </option>
                      ))
                    )}
                  </select>
                ) : (
                  <input
                    type="text"
                    value={profile?.owner_slug || ''}
                    readOnly
                    className="w-full px-3 py-2 bg-blue-700 border border-blue-600 rounded-lg focus:outline-none"
                  />
                )}
                <p className="text-xs text-gray-300 mt-1">
                  {isSuperAdmin 
                    ? 'Select which organization this invite belongs to' 
                    : 'Invitees will join your organization'}
                </p>
              </div>
              
              {/* Max Uses Selection */}
              <div>
                <label className="block text-sm font-medium mb-2">
                  Maximum Uses
                </label>
                <div className="flex space-x-3">
                  <select
                    name="maxUses"
                    value={formData.maxUses}
                    onChange={handleInputChange}
                    className="flex-1 px-3 py-2 bg-blue-700 border border-blue-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-yellow-400"
                  >
                    <option value="1">1 use</option>
                    <option value="5">5 uses</option>
                    <option value="10">10 uses</option>
                    <option value="100">100 uses</option>
                    <option value="1000">1,000 uses</option>
                    <option value="10000">10,000 uses</option>
                    <option value="unlimited">Unlimited</option>
                    <option value="custom">Custom</option>
                  </select>
                  
                  {formData.maxUses === 'custom' && (
                    <input
                      type="number"
                      name="customMaxUses"
                      value={formData.customMaxUses}
                      onChange={handleInputChange}
                      min="1"
                      max="1000000"
                      className="w-24 px-3 py-2 bg-blue-700 border border-blue-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-yellow-400"
                    />
                  )}
                </div>
                <p className="text-xs text-gray-300 mt-1">
                  How many times this invite code can be used. Choose Unlimited to allow infinite uses.
                </p>
              </div>
              
              {/* Expiration Selection */}
              <div>
                <label className="block text-sm font-medium mb-2">
                  Expires After
                </label>
                <select
                  name="expiresInDays"
                  value={formData.expiresInDays}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 bg-blue-700 border border-blue-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-yellow-400"
                >
                  <option value="1">1 day</option>
                  <option value="7">7 days</option>
                  <option value="30">30 days</option>
                  <option value="never">Never expires</option>
                </select>
                <p className="text-xs text-gray-300 mt-1">
                  When this invite code will expire
                </p>
              </div>
            </div>
            
            <div className="mt-6 flex justify-end">
              <button
                type="submit"
                disabled={creating}
                className={`px-4 py-2 rounded-lg font-medium ${
                  creating
                    ? 'bg-gray-500 cursor-not-allowed'
                    : 'bg-yellow-400 text-blue-900 hover:bg-yellow-300 transition-colors'
                }`}
              >
                {creating ? 'Creating...' : 'Create Invite'}
              </button>
            </div>
          </form>
        </div>
        
        {/* Invites List */}
        <div className="bg-blue-800 rounded-lg shadow-lg p-6">
          <h2 className="text-xl font-semibold mb-4">Existing Invites</h2>
          
          {loadingInvites ? (
            <div className="flex justify-center items-center h-32">
              <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-yellow-400"></div>
            </div>
          ) : invites.length === 0 ? (
            <div className="text-center py-8 text-gray-300">
              No invites found. Create your first invite above.
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-blue-700">
                <thead>
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
                      Code
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
                      Role
                    </th>
                    {isSuperAdmin && (
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
                        Organization
                      </th>
                    )}
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
                      Uses
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
                      Expires
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
                      Status
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
                      Created
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-blue-700">
                  {invites.map(invite => {
                    const status = getInviteStatus(invite);
                    return (
                      <tr key={invite.id} className="hover:bg-blue-700">
                        <td className="px-6 py-4 whitespace-nowrap font-mono">
                          {invite.code}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap capitalize">
                          {invite.role}
                        </td>
                        {isSuperAdmin && (
                          <td className="px-6 py-4 whitespace-nowrap">
                            {invite.owners?.display_name || invite.owner_slug}
                          </td>
                        )}
                        <td className="px-6 py-4 whitespace-nowrap">
                          {invite.use_count} / {invite.max_uses == null ? '∞' : invite.max_uses}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          {formatDate(invite.expires_at)}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className={`px-2 py-1 text-xs rounded-full ${status.className}`}>
                            {status.text}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          {formatDate(invite.created_at)}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <button
                            onClick={() => copyToClipboard(invite.code)}
                            className="text-yellow-300 hover:text-yellow-400 transition-colors"
                          >
                            Copy
                          </button>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default AdminInvitesPage;
