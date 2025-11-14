import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { listInvites, createInvite, getMyProfile, deleteInvite } from '../../services/invitesService';

const AdminInvitesPage = () => {
  const { user } = useAuth();
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [invites, setInvites] = useState([]);
  const [loadingInvites, setLoadingInvites] = useState(true);
  const [creating, setCreating] = useState(false);
  const [createError, setCreateError] = useState('');
  const [newInvite, setNewInvite] = useState(null);

  const [formData, setFormData] = useState({
    role: 'user',
    ownerSlug: '',
    maxUses: '1',
    expiresInDays: '7',
    customMaxUses: '100'
  });

  useEffect(() => {
    const init = async () => {
      setLoading(true);
      try {
        const { data, error } = await getMyProfile();
        if (error) throw error;
        setProfile(data);
        setFormData(prev => ({ ...prev, ownerSlug: data.owner_slug || 'default' }));
        await reloadInvites(data.owner_slug);
      } catch (e) {
        console.error('Failed to load profile', e);
      } finally {
        setLoading(false);
      }
    };
    init();
  }, [user]);

  const reloadInvites = async (ownerSlug) => {
    setLoadingInvites(true);
    try {
      const { data, error } = await listInvites({ ownerSlug });
      if (error) throw error;
      setInvites(data || []);
    } catch (e) {
      console.error('Failed to load invites', e);
    } finally {
      setLoadingInvites(false);
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setCreating(true);
    setCreateError('');
    setNewInvite(null);
    try {
      let expiresAt = null;
      if (formData.expiresInDays !== 'never') {
        const days = parseInt(formData.expiresInDays, 10) || 0;
        expiresAt = new Date();
        expiresAt.setDate(expiresAt.getDate() + days);
      }
      let maxUses = null;
      if (formData.maxUses === 'custom') {
        maxUses = Math.max(1, parseInt(formData.customMaxUses, 10) || 1);
      } else if (formData.maxUses === 'unlimited') {
        maxUses = null;
      } else {
        maxUses = parseInt(formData.maxUses, 10) || 1;
      }
      const { data, error } = await createInvite({
        ownerSlug: formData.ownerSlug,
        role: formData.role,
        expiresAt,
        maxUses
      });
      if (error) throw error;
      setNewInvite(data);
      await reloadInvites(formData.ownerSlug);
    } catch (e) {
      setCreateError(e.message || 'Failed to create invite');
    } finally {
      setCreating(false);
    }
  };

  const copyToClipboard = (text) => {
    navigator.clipboard?.writeText(text).then(() => alert('Copied to clipboard!'));
  };

  const handleDelete = async (invite) => {
    if (!window.confirm(`Delete invite ${invite.code}?`)) return;
    const { error } = await deleteInvite(invite.id);
    if (error) {
      alert(error.message || 'Failed to delete invite');
      return;
    }
    await reloadInvites(formData.ownerSlug);
  };

  const formatDate = (v) => (v ? new Date(v).toLocaleString() : 'Never');

  if (loading) {
    return <div className="min-h-screen bg-blue-900 text-white p-8">Loading…</div>;
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-blue-900 via-blue-700 to-blue-600 text-white p-4 md:p-8">
      <div className="max-w-4xl mx-auto">
        <div className="mb-6">
          <div className="flex items-center space-x-2 text-sm">
            <Link to="/" className="text-yellow-300">Home</Link>
            <span>&gt;</span>
            <Link to="/admin" className="text-yellow-300">Admin</Link>
            <span>&gt;</span>
            <span>Invites</span>
          </div>
          <h1 className="text-2xl font-bold mt-2">Manage Invites</h1>
          <div className="mt-3">
            <Link to="/admin" className="inline-block px-3 py-2 bg-yellow-400 text-blue-900 rounded">
              ← Back to Admin
            </Link>
          </div>
        </div>

        <div className="bg-blue-800 rounded-lg shadow-lg p-6 mb-8">
          <h2 className="text-xl font-semibold mb-4">Create New Invite</h2>
          {createError && <div className="mb-4 p-3 rounded bg-red-700">{createError}</div>}
          {newInvite && (
            <div className="mb-4 p-3 rounded bg-green-700 flex items-center justify-between">
              <div>
                <div className="font-semibold">Invite created</div>
                <div className="font-mono">{newInvite.code}</div>
              </div>
              <button className="px-3 py-2 bg-blue-600 rounded" onClick={() => copyToClipboard(newInvite.code)}>Copy</button>
            </div>
          )}
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm mb-1">Role</label>
              <select name="role" value={formData.role} onChange={handleInputChange} className="w-full px-3 py-2 bg-blue-700 border border-blue-600 rounded">
                <option value="user">User</option>
                <option value="admin">Admin</option>
              </select>
            </div>
            <div>
              <label className="block text-sm mb-1">Organization</label>
              <input type="text" value={formData.ownerSlug} readOnly className="w-full px-3 py-2 bg-blue-700 border border-blue-600 rounded" />
            </div>
            <div>
              <label className="block text-sm mb-1">Maximum Uses</label>
              <div className="flex gap-2">
                <select name="maxUses" value={formData.maxUses} onChange={handleInputChange} className="flex-1 px-3 py-2 bg-blue-700 border border-blue-600 rounded">
                  <option value="1">1</option>
                  <option value="5">5</option>
                  <option value="10">10</option>
                  <option value="100">100</option>
                  <option value="1000">1000</option>
                  <option value="10000">10000</option>
                  <option value="unlimited">Unlimited</option>
                  <option value="custom">Custom…</option>
                </select>
                {formData.maxUses === 'custom' && (
                  <input name="customMaxUses" type="number" min="1" max="1000000" value={formData.customMaxUses} onChange={handleInputChange} className="w-28 px-3 py-2 bg-blue-700 border border-blue-600 rounded" />
                )}
              </div>
            </div>
            <div>
              <label className="block text-sm mb-1">Expires After</label>
              <select name="expiresInDays" value={formData.expiresInDays} onChange={handleInputChange} className="w-full px-3 py-2 bg-blue-700 border border-blue-600 rounded">
                <option value="1">1 day</option>
                <option value="7">7 days</option>
                <option value="30">30 days</option>
                <option value="never">Never</option>
              </select>
            </div>
            <div className="flex justify-end">
              <button type="submit" disabled={creating} className="px-4 py-2 bg-yellow-400 text-blue-900 rounded">
                {creating ? 'Creating…' : 'Create Invite'}
              </button>
            </div>
          </form>
        </div>

        <div className="bg-blue-800 rounded-lg shadow-lg p-6">
          <h2 className="text-xl font-semibold mb-4">Existing Invites</h2>
          {loadingInvites ? (
            <div>Loading…</div>
          ) : invites.length === 0 ? (
            <div className="text-gray-300">No invites yet</div>
          ) : (
            <div className="overflow-x-auto">
              <table className="min-w-full text-left">
                <thead>
                  <tr>
                    <th className="px-3 py-2">Code</th>
                    <th className="px-3 py-2">Role</th>
                    <th className="px-3 py-2">Uses</th>
                    <th className="px-3 py-2">Expires</th>
                    <th className="px-3 py-2">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {invites.map(i => (
                    <tr key={i.id} className="border-t border-blue-700">
                      <td className="px-3 py-2 font-mono">{i.code}</td>
                      <td className="px-3 py-2 capitalize">{i.role}</td>
                      <td className="px-3 py-2">{i.use_count} / {i.max_uses ?? 'Unlimited'}</td>
                      <td className="px-3 py-2">{formatDate(i.expires_at)}</td>
                      <td className="px-3 py-2 space-x-3">
                        <button className="text-yellow-300 underline" onClick={() => copyToClipboard(i.code)}>Copy Code</button>
                        <button
                          className="text-yellow-300 underline"
                          onClick={() => copyToClipboard(`${window.location.origin}/invite/${i.code}`)}
                        >
                          Copy Link
                        </button>
                        <button
                          className="text-red-300 underline"
                          onClick={() => handleDelete(i)}
                        >
                          Delete
                        </button>
                      </td>
                    </tr>
                  ))}
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
