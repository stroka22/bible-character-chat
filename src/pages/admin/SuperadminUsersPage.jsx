import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { supabase } from '../../services/supabase';
import { getMyProfile } from '../../services/invitesService';

const SuperadminUsersPage = () => {
  // State for current user profile
  const [currentProfile, setCurrentProfile] = useState(null);
  const [isSuperAdmin, setIsSuperAdmin] = useState(false);
  const [isAdmin, setIsAdmin] = useState(false);
  const [loading, setLoading] = useState(true);
  
  // State for users list
  const [profiles, setProfiles] = useState([]);
  const [loadingProfiles, setLoadingProfiles] = useState(true);
  const [totalProfiles, setTotalProfiles] = useState(0);
  
  // State for owners list (for filter and actions)
  const [owners, setOwners] = useState([]);
  const [loadingOwners, setLoadingOwners] = useState(false);
  
  // Filters state
  const [filters, setFilters] = useState({
    search: '',
    role: 'all',
    ownerSlug: 'all',
    page: 1,
    pageSize: 25
  });
  
  // Action state
  const [actionInProgress, setActionInProgress] = useState(null);
  const [actionMessage, setActionMessage] = useState({ text: '', type: '' });
  
  // Check if current user is superadmin
  useEffect(() => {
    const checkSuperAdmin = async () => {
      setLoading(true);
      try {
        const { data, error } = await getMyProfile();
        if (error) throw error;
        
        setCurrentProfile(data);
        setIsSuperAdmin(data.role === 'superadmin');
        setIsAdmin(data.role === 'admin' || data.role === 'superadmin');
        
        // Load data based on role
        if (data.role === 'superadmin') {
          await Promise.all([
            loadProfiles(),
            loadOwners()
          ]);
        } else if (data.role === 'admin') {
          await loadProfiles();
        }
      } catch (error) {
        console.error('Error checking superadmin status:', error);
      } finally {
        setLoading(false);
      }
    };
    
    checkSuperAdmin();
  }, []);
  
  // Load profiles with filters
  const loadProfiles = async () => {
    setLoadingProfiles(true);
    try {
      // Build query with filters
      let query = supabase
        .from('profiles')
        .select(`
          id,
          email,
          role,
          owner_slug,
          display_name,
          created_at
        `, { count: 'exact' });
      
      // Apply filters
      if (filters.search) {
        query = query.ilike('email', `%${filters.search}%`);
      }
      
      if (filters.role !== 'all') {
        query = query.eq('role', filters.role);
      }

      // Owner slug filter logic
      if (isSuperAdmin) {
        if (filters.ownerSlug !== 'all') {
          query = query.eq('owner_slug', filters.ownerSlug);
        }
      } else if (isAdmin && currentProfile?.owner_slug) {
        query = query.eq('owner_slug', currentProfile.owner_slug);
      }
      
      // Apply pagination
      const from = (filters.page - 1) * filters.pageSize;
      const to = from + filters.pageSize - 1;
      query = query.range(from, to).order('email', { ascending: true });
      
      // Execute query
      const { data, error, count } = await query;
      
      if (error) throw error;
      
      setProfiles(data || []);
      setTotalProfiles(count || 0);
    } catch (error) {
      console.error('Error loading profiles:', error);
    } finally {
      setLoadingProfiles(false);
    }
  };
  
  // Load owners list for filter and actions
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
  
  // Handle filter changes
  const handleFilterChange = (name, value) => {
    setFilters(prev => ({
      ...prev,
      [name]: value,
      // Reset to page 1 when filters change
      ...(name !== 'page' && { page: 1 })
    }));
  };
  
  // Apply filters when they change
  useEffect(() => {
    if (isAdmin) {
      loadProfiles();
    }
  }, [filters, isAdmin]);
  
  // Handle changing user role
  const handleRoleChange = async (userId, newRole) => {
    if (actionInProgress) return;
    setActionInProgress(userId);
    setActionMessage({ text: '', type: '' });
    
    try {
      const { error } = await supabase
        .from('profiles')
        .update({ role: newRole })
        .eq('id', userId);
      
      if (error) throw error;
      
      setActionMessage({ 
        text: `User role updated to ${newRole}`, 
        type: 'success' 
      });
      
      // Update local state
      setProfiles(profiles.map(profile => 
        profile.id === userId ? { ...profile, role: newRole } : profile
      ));
      
    } catch (error) {
      console.error('Error updating role:', error);
      setActionMessage({ 
        text: `Error: ${error.message}`, 
        type: 'error' 
      });
    } finally {
      setActionInProgress(null);
      // Clear message after 3 seconds
      setTimeout(() => setActionMessage({ text: '', type: '' }), 3000);
    }
  };
  
  // Handle changing owner slug
  const handleOwnerChange = async (userId, newOwnerSlug) => {
    if (actionInProgress) return;
    setActionInProgress(userId);
    setActionMessage({ text: '', type: '' });
    
    try {
      const { error } = await supabase
        .from('profiles')
        .update({ owner_slug: newOwnerSlug })
        .eq('id', userId);
      
      if (error) throw error;
      
      // Find owner display name
      const owner = owners.find(o => o.owner_slug === newOwnerSlug);
      
      setActionMessage({ 
        text: `User moved to ${owner?.display_name || newOwnerSlug}`, 
        type: 'success' 
      });
      
      // Update local state
      setProfiles(profiles.map(profile => 
        profile.id === userId ? { 
          ...profile, 
          owner_slug: newOwnerSlug,
          owners: { display_name: owner?.display_name || newOwnerSlug }
        } : profile
      ));
      
    } catch (error) {
      console.error('Error updating owner:', error);
      setActionMessage({ 
        text: `Error: ${error.message}`, 
        type: 'error' 
      });
    } finally {
      setActionInProgress(null);
      // Clear message after 3 seconds
      setTimeout(() => setActionMessage({ text: '', type: '' }), 3000);
    }
  };
  
  // Format date for display
  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    const date = new Date(dateString);
    return date.toLocaleDateString() + ' ' + date.toLocaleTimeString();
  };
  
  // Calculate total pages
  const totalPages = Math.ceil(totalProfiles / filters.pageSize);
  
  // If still loading initial check
  if (loading) {
    return (
      <div className="min-h-screen bg-blue-900 text-white p-8">
        <div className="flex justify-center items-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-yellow-400"></div>
        </div>
      </div>
    );
  }
  
  // If not superadmin, show access denied
  if (!isAdmin) {
    return (
      <div className="min-h-screen bg-blue-900 text-white p-8">
        <div className="max-w-4xl mx-auto bg-red-800 rounded-lg p-8 text-center">
          <h1 className="text-2xl font-bold mb-4">Access Denied</h1>
          <p className="mb-6">You need superadmin privileges to access this page.</p>
          <Link 
            to="/admin" 
            className="px-4 py-2 bg-blue-700 hover:bg-blue-600 rounded-lg transition-colors"
          >
            Return to Admin
          </Link>
        </div>
      </div>
    );
  }
  
  return (
    <div className="min-h-screen bg-gradient-to-b from-blue-900 via-blue-700 to-blue-600 text-white p-4 md:p-8">
      <div className="max-w-7xl mx-auto">
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
            <span className="text-white font-medium">Users</span>
          </div>
          <h1 className="text-2xl font-bold mt-2">Manage Users</h1>
        </div>
        
        {/* Action Message */}
        {actionMessage.text && (
          <div className={`mb-4 p-3 rounded ${
            actionMessage.type === 'success' 
              ? 'bg-green-700 text-white' 
              : 'bg-red-700 text-white'
          }`}>
            {actionMessage.text}
          </div>
        )}
        
        {/* Filters */}
        <div className="bg-blue-800 rounded-lg shadow-lg p-6 mb-6">
          <h2 className="text-xl font-semibold mb-4">Filters</h2>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {/* Search */}
            <div>
              <label className="block text-sm font-medium mb-2">
                Search by Email
              </label>
              <input
                type="text"
                value={filters.search}
                onChange={(e) => handleFilterChange('search', e.target.value)}
                placeholder="Enter email..."
                className="w-full px-3 py-2 bg-blue-700 border border-blue-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-yellow-400"
              />
            </div>
            
            {/* Role Filter */}
            <div>
              <label className="block text-sm font-medium mb-2">
                Role
              </label>
              <select
                value={filters.role}
                onChange={(e) => handleFilterChange('role', e.target.value)}
                className="w-full px-3 py-2 bg-blue-700 border border-blue-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-yellow-400"
              >
                <option value="all">All Roles</option>
                <option value="user">User</option>
                <option value="admin">Admin</option>
                <option value="superadmin">Superadmin</option>
              </select>
            </div>
            
            {/* Owner Filter */}
            {isSuperAdmin && (
            <div>
              <label className="block text-sm font-medium mb-2">
                Organization
              </label>
              <select
                value={filters.ownerSlug}
                onChange={(e) => handleFilterChange('ownerSlug', e.target.value)}
                className="w-full px-3 py-2 bg-blue-700 border border-blue-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-yellow-400"
              >
                <option value="all">All Organizations</option>
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
            </div>
            )}
          </div>
        </div>
        
        {/* Users Table */}
        <div className="bg-blue-800 rounded-lg shadow-lg p-6">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-xl font-semibold">Users ({totalProfiles})</h2>
            
            {/* Page Size */}
            <div className="flex items-center space-x-2">
              <span className="text-sm">Show:</span>
              <select
                value={filters.pageSize}
                onChange={(e) => handleFilterChange('pageSize', parseInt(e.target.value))}
                className="px-2 py-1 bg-blue-700 border border-blue-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-yellow-400 text-sm"
              >
                <option value="25">25</option>
                <option value="50">50</option>
                <option value="100">100</option>
              </select>
            </div>
          </div>
          
          {loadingProfiles ? (
            <div className="flex justify-center items-center h-64">
              <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-yellow-400"></div>
            </div>
          ) : profiles.length === 0 ? (
            <div className="text-center py-12 text-gray-300">
              No users found matching your filters.
            </div>
          ) : (
            <>
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-blue-700">
                  <thead>
                    <tr>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
                        Email / Name
                      </th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
                        Role
                      </th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
                        Organization
                      </th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
                        Created
                      </th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
                        Actions
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-blue-700">
                    {profiles.map(profile => (
                      <tr key={profile.id} className="hover:bg-blue-700">
                        <td className="px-4 py-3 whitespace-nowrap">
                          <div className="text-sm font-medium">{profile.email}</div>
                          {profile.display_name && (
                            <div className="text-xs text-gray-300">{profile.display_name}</div>
                          )}
                        </td>
                        <td className="px-4 py-3 whitespace-nowrap">
                          <span className={`px-2 py-1 text-xs rounded-full ${
                            profile.role === 'superadmin' 
                              ? 'bg-purple-600' 
                              : profile.role === 'admin'
                                ? 'bg-yellow-600'
                                : 'bg-blue-600'
                          }`}>
                            {profile.role}
                          </span>
                        </td>
                        <td className="px-4 py-3 whitespace-nowrap">
                          {profile.owners?.display_name || profile.owner_slug || 'None'}
                        </td>
                        <td className="px-4 py-3 whitespace-nowrap text-sm">
                          {formatDate(profile.created_at)}
                        </td>
                        <td className="px-4 py-3 whitespace-nowrap">
                          <div className="flex flex-col space-y-2">
                            {/* Role Actions */}
                            <div className="flex space-x-2">
                              <button
                                onClick={() => handleRoleChange(profile.id, 'user')}
                                disabled={profile.role === 'superadmin' || profile.role === 'user' || actionInProgress === profile.id || !isSuperAdmin}
                                className={`px-2 py-1 text-xs rounded ${
                                  profile.role === 'superadmin' || profile.role === 'user' || actionInProgress === profile.id
                                    ? 'bg-gray-600 cursor-not-allowed'
                                    : 'bg-blue-600 hover:bg-blue-500'
                                }`}
                              >
                                Set User
                              </button>
                              <button
                                onClick={() => handleRoleChange(profile.id, 'admin')}
                                disabled={profile.role === 'superadmin' || profile.role === 'admin' || actionInProgress === profile.id || !isSuperAdmin}
                                className={`px-2 py-1 text-xs rounded ${
                                  profile.role === 'superadmin' || profile.role === 'admin' || actionInProgress === profile.id
                                    ? 'bg-gray-600 cursor-not-allowed'
                                    : 'bg-yellow-600 hover:bg-yellow-500'
                                }`}
                              >
                                Set Admin
                              </button>
                            </div>
                            
                            {/* Owner Action */}
                            <select
                              value={profile.owner_slug || ''}
                              onChange={(e) => handleOwnerChange(profile.id, e.target.value)}
                              disabled={profile.role === 'superadmin' || actionInProgress === profile.id || !isSuperAdmin}
                              className={`px-2 py-1 text-xs rounded ${
                                profile.role === 'superadmin' || actionInProgress === profile.id
                                  ? 'bg-gray-600 cursor-not-allowed'
                                  : 'bg-blue-700 hover:bg-blue-600 border border-blue-600'
                              }`}
                            >
                              <option value="">No Organization</option>
                              {owners.map(owner => (
                                <option key={owner.owner_slug} value={owner.owner_slug}>
                                  {owner.display_name}
                                </option>
                              ))}
                            </select>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              
              {/* Pagination */}
              <div className="flex justify-between items-center mt-6">
                <div className="text-sm text-gray-300">
                  Showing {(filters.page - 1) * filters.pageSize + 1} to {Math.min(filters.page * filters.pageSize, totalProfiles)} of {totalProfiles} users
                </div>
                
                <div className="flex space-x-2">
                  <button
                    onClick={() => handleFilterChange('page', 1)}
                    disabled={filters.page === 1}
                    className={`px-3 py-1 rounded ${
                      filters.page === 1
                        ? 'bg-gray-600 cursor-not-allowed'
                        : 'bg-blue-700 hover:bg-blue-600'
                    }`}
                  >
                    First
                  </button>
                  <button
                    onClick={() => handleFilterChange('page', filters.page - 1)}
                    disabled={filters.page === 1}
                    className={`px-3 py-1 rounded ${
                      filters.page === 1
                        ? 'bg-gray-600 cursor-not-allowed'
                        : 'bg-blue-700 hover:bg-blue-600'
                    }`}
                  >
                    Prev
                  </button>
                  <span className="px-3 py-1">
                    Page {filters.page} of {totalPages}
                  </span>
                  <button
                    onClick={() => handleFilterChange('page', filters.page + 1)}
                    disabled={filters.page === totalPages}
                    className={`px-3 py-1 rounded ${
                      filters.page === totalPages
                        ? 'bg-gray-600 cursor-not-allowed'
                        : 'bg-blue-700 hover:bg-blue-600'
                    }`}
                  >
                    Next
                  </button>
                  <button
                    onClick={() => handleFilterChange('page', totalPages)}
                    disabled={filters.page === totalPages}
                    className={`px-3 py-1 rounded ${
                      filters.page === totalPages
                        ? 'bg-gray-600 cursor-not-allowed'
                        : 'bg-blue-700 hover:bg-blue-600'
                    }`}
                  >
                    Last
                  </button>
                </div>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default SuperadminUsersPage;
