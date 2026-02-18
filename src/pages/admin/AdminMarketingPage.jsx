import React, { useState, useEffect } from 'react';
import { supabase } from '../../services/supabase';
import { useAuth } from '../../contexts/AuthContext';

const CATEGORIES = [
  { value: 'general', label: 'General' },
  { value: 'social-media', label: 'Social Media' },
  { value: 'print', label: 'Print Materials' },
  { value: 'email', label: 'Email Templates' },
  { value: 'presentation', label: 'Presentations' },
  { value: 'brand', label: 'Brand Assets' },
];

const FILE_TYPES = [
  { value: 'pdf', label: 'PDF', accept: '.pdf' },
  { value: 'image', label: 'Image', accept: 'image/*' },
  { value: 'video', label: 'Video', accept: 'video/*' },
  { value: 'other', label: 'Other', accept: '*' },
];

export default function AdminMarketingPage({ isSuperAdmin = false, userOwnerSlug = 'default', filterPartnerOnly = false }) {
  const { user } = useAuth();
  const [materials, setMaterials] = useState([]);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [showUploadModal, setShowUploadModal] = useState(false);
  const [filter, setFilter] = useState({ type: 'all', category: 'all' });
  const [orgs, setOrgs] = useState([]);
  
  // Upload form state
  const [uploadForm, setUploadForm] = useState({
    title: '',
    description: '',
    type: 'pdf',
    category: 'general',
    isGlobal: true,
    isPartnerMaterial: false,
    targetOrgSlugs: [],
    externalUrl: '',
    file: null,
  });

  useEffect(() => {
    fetchMaterials();
    if (isSuperAdmin) {
      fetchOrgs();
    }
  }, [filter, isSuperAdmin]);

  const fetchOrgs = async () => {
    try {
      const { data } = await supabase
        .from('profiles')
        .select('owner_slug')
        .not('owner_slug', 'is', null)
        .not('owner_slug', 'eq', 'default');
      
      const uniqueSlugs = [...new Set((data || []).map(p => p.owner_slug).filter(Boolean))];
      setOrgs(uniqueSlugs);
    } catch (e) {
      console.error('Error fetching orgs:', e);
    }
  };

  const fetchMaterials = async () => {
    setLoading(true);
    try {
      let query = supabase
        .from('marketing_materials')
        .select('*')
        .order('created_at', { ascending: false });

      // For non-super admins, only show non-partner materials
      if (!isSuperAdmin) {
        query = query.eq('is_partner_material', false);
      }
      
      // Filter to partner materials only if requested
      if (filterPartnerOnly) {
        query = query.eq('is_partner_material', true);
      }

      if (filter.type !== 'all') {
        query = query.eq('type', filter.type);
      }
      if (filter.category !== 'all') {
        query = query.eq('category', filter.category);
      }

      const { data, error } = await query;
      if (error) throw error;
      setMaterials(data || []);
    } catch (e) {
      console.error('Error fetching materials:', e);
    } finally {
      setLoading(false);
    }
  };

  const handleFileChange = (e) => {
    const file = e.target.files?.[0];
    if (file) {
      setUploadForm(prev => ({ ...prev, file }));
    }
  };

  const handleUpload = async (e) => {
    e.preventDefault();
    if (!uploadForm.title) {
      alert('Title is required');
      return;
    }
    if (!uploadForm.file && !uploadForm.externalUrl) {
      alert('Please upload a file or provide an external URL');
      return;
    }

    setUploading(true);
    try {
      let fileUrl = null;
      let fileName = null;
      let fileSize = null;

      // Upload file to Supabase Storage if provided
      if (uploadForm.file) {
        const fileExt = uploadForm.file.name.split('.').pop();
        const filePath = `${Date.now()}-${Math.random().toString(36).substr(2, 9)}.${fileExt}`;
        
        const { data: uploadData, error: uploadError } = await supabase.storage
          .from('marketing')
          .upload(filePath, uploadForm.file);

        if (uploadError) throw uploadError;

        const { data: urlData } = supabase.storage
          .from('marketing')
          .getPublicUrl(filePath);

        fileUrl = urlData.publicUrl;
        fileName = uploadForm.file.name;
        fileSize = uploadForm.file.size;
      }

      // Insert material record
      // For non-super admins, force org-specific settings
      const { error: insertError } = await supabase
        .from('marketing_materials')
        .insert({
          title: uploadForm.title,
          description: uploadForm.description,
          type: uploadForm.type,
          category: uploadForm.category,
          is_global: isSuperAdmin ? uploadForm.isGlobal : false,
          is_partner_material: isSuperAdmin ? uploadForm.isPartnerMaterial : false,
          target_org_slugs: isSuperAdmin ? uploadForm.targetOrgSlugs : [userOwnerSlug],
          file_url: fileUrl,
          file_name: fileName,
          file_size: fileSize,
          external_url: uploadForm.externalUrl || null,
          owner_slug: userOwnerSlug,
          created_by: user?.id,
        });

      if (insertError) throw insertError;

      setShowUploadModal(false);
      setUploadForm({
        title: '',
        description: '',
        type: 'pdf',
        category: 'general',
        isGlobal: true,
        isPartnerMaterial: false,
        targetOrgSlugs: [],
        externalUrl: '',
        file: null,
      });
      fetchMaterials();
    } catch (e) {
      console.error('Error uploading:', e);
      alert('Upload failed: ' + e.message);
    } finally {
      setUploading(false);
    }
  };

  const handleDelete = async (material) => {
    if (!confirm(`Delete "${material.title}"?`)) return;

    try {
      // Delete from storage if it was an uploaded file
      if (material.file_url && material.file_url.includes('supabase')) {
        const path = material.file_url.split('/marketing/')[1];
        if (path) {
          await supabase.storage.from('marketing').remove([path]);
        }
      }

      const { error } = await supabase
        .from('marketing_materials')
        .delete()
        .eq('id', material.id);

      if (error) throw error;
      fetchMaterials();
    } catch (e) {
      console.error('Error deleting:', e);
      alert('Delete failed: ' + e.message);
    }
  };

  const getDownloadUrl = (material) => {
    return material.file_url || material.external_url;
  };

  const formatFileSize = (bytes) => {
    if (!bytes) return '';
    if (bytes < 1024) return bytes + ' B';
    if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + ' KB';
    return (bytes / (1024 * 1024)).toFixed(1) + ' MB';
  };

  const getTypeIcon = (type) => {
    switch (type) {
      case 'pdf': return '📄';
      case 'image': return '🖼️';
      case 'video': return '🎬';
      default: return '📎';
    }
  };

  return (
    <div className="p-6 pt-8">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">
            {filterPartnerOnly ? 'Business Partner Materials' : 'Marketing Vault'}
          </h1>
          <p className="text-gray-600 text-sm mt-1">
            {filterPartnerOnly 
              ? 'Materials for potential business partners'
              : isSuperAdmin 
                ? 'Manage marketing materials for all organizations' 
                : 'Download marketing materials'}
          </p>
        </div>
        <button
          onClick={() => setShowUploadModal(true)}
          className="px-4 py-2 bg-amber-600 hover:bg-amber-700 text-white rounded-lg font-medium"
        >
          + Upload Material
        </button>
      </div>

      {/* Filters */}
      <div className="flex gap-4 mb-6">
        <select
          value={filter.type}
          onChange={(e) => setFilter(prev => ({ ...prev, type: e.target.value }))}
          className="px-3 py-2 border border-gray-300 rounded-lg text-sm"
        >
          <option value="all">All Types</option>
          {FILE_TYPES.map(t => (
            <option key={t.value} value={t.value}>{t.label}</option>
          ))}
        </select>
        <select
          value={filter.category}
          onChange={(e) => setFilter(prev => ({ ...prev, category: e.target.value }))}
          className="px-3 py-2 border border-gray-300 rounded-lg text-sm"
        >
          <option value="all">All Categories</option>
          {CATEGORIES.map(c => (
            <option key={c.value} value={c.value}>{c.label}</option>
          ))}
        </select>
      </div>

      {/* Materials Grid */}
      {loading ? (
        <div className="text-center py-12 text-gray-500">Loading...</div>
      ) : materials.length === 0 ? (
        <div className="text-center py-12 text-gray-500">
          No marketing materials found.
          {isSuperAdmin && ' Click "Upload Material" to add some.'}
        </div>
      ) : (
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
          {materials.map((material) => (
            <div
              key={material.id}
              className="bg-white rounded-xl border border-gray-200 p-5 hover:shadow-md transition-shadow"
            >
              <div className="flex items-start gap-3">
                <span className="text-2xl">{getTypeIcon(material.type)}</span>
                <div className="flex-1 min-w-0">
                  <h3 className="font-semibold text-gray-900 truncate">{material.title}</h3>
                  {material.description && (
                    <p className="text-gray-600 text-sm mt-1 line-clamp-2">{material.description}</p>
                  )}
                  <div className="flex flex-wrap gap-2 mt-2">
                    <span className="px-2 py-0.5 bg-gray-100 text-gray-600 text-xs rounded">
                      {CATEGORIES.find(c => c.value === material.category)?.label || material.category}
                    </span>
                    {material.is_global && !material.is_partner_material && (
                      <span className="px-2 py-0.5 bg-green-100 text-green-700 text-xs rounded">Global</span>
                    )}
                    {material.is_partner_material && (
                      <span className="px-2 py-0.5 bg-purple-100 text-purple-700 text-xs rounded">Partner</span>
                    )}
                    {material.file_size && (
                      <span className="px-2 py-0.5 bg-blue-100 text-blue-700 text-xs rounded">
                        {formatFileSize(material.file_size)}
                      </span>
                    )}
                  </div>
                </div>
              </div>
              <div className="flex gap-2 mt-4">
                <a
                  href={getDownloadUrl(material)}
                  target="_blank"
                  rel="noopener noreferrer"
                  download={material.file_name}
                  className="flex-1 px-3 py-2 bg-amber-600 hover:bg-amber-700 text-white text-sm font-medium rounded-lg text-center"
                >
                  {material.external_url ? 'Open Link' : 'Download'}
                </a>
                {(isSuperAdmin || material.owner_slug === userOwnerSlug) && (
                  <button
                    onClick={() => handleDelete(material)}
                    className="px-3 py-2 bg-red-100 hover:bg-red-200 text-red-700 text-sm font-medium rounded-lg"
                  >
                    Delete
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Upload Modal */}
      {showUploadModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl max-w-lg w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6 border-b border-gray-200">
              <h2 className="text-xl font-bold text-gray-900">Upload Marketing Material</h2>
            </div>
            <form onSubmit={handleUpload} className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Title *</label>
                <input
                  type="text"
                  value={uploadForm.title}
                  onChange={(e) => setUploadForm(prev => ({ ...prev, title: e.target.value }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
                <textarea
                  value={uploadForm.description}
                  onChange={(e) => setUploadForm(prev => ({ ...prev, description: e.target.value }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                  rows={2}
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Type</label>
                  <select
                    value={uploadForm.type}
                    onChange={(e) => setUploadForm(prev => ({ ...prev, type: e.target.value }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                  >
                    {FILE_TYPES.map(t => (
                      <option key={t.value} value={t.value}>{t.label}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Category</label>
                  <select
                    value={uploadForm.category}
                    onChange={(e) => setUploadForm(prev => ({ ...prev, category: e.target.value }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                  >
                    {CATEGORIES.map(c => (
                      <option key={c.value} value={c.value}>{c.label}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Upload File</label>
                <input
                  type="file"
                  onChange={handleFileChange}
                  accept={FILE_TYPES.find(t => t.value === uploadForm.type)?.accept}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                />
                {uploadForm.file && (
                  <p className="text-sm text-gray-500 mt-1">{uploadForm.file.name}</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Or External URL</label>
                <input
                  type="url"
                  value={uploadForm.externalUrl}
                  onChange={(e) => setUploadForm(prev => ({ ...prev, externalUrl: e.target.value }))}
                  placeholder="https://..."
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                />
              </div>

              {isSuperAdmin && (
                <div className="space-y-2">
                  <label className="flex items-center gap-2">
                    <input
                      type="checkbox"
                      checked={uploadForm.isGlobal}
                      onChange={(e) => setUploadForm(prev => ({ ...prev, isGlobal: e.target.checked }))}
                      className="rounded"
                    />
                    <span className="text-sm text-gray-700">Available to all org admins</span>
                  </label>
                  <label className="flex items-center gap-2">
                    <input
                      type="checkbox"
                      checked={uploadForm.isPartnerMaterial}
                      onChange={(e) => setUploadForm(prev => ({ ...prev, isPartnerMaterial: e.target.checked }))}
                      className="rounded"
                    />
                    <span className="text-sm text-gray-700">Business Partner Material (Super Admin only)</span>
                  </label>
                </div>
              )}

              {!isSuperAdmin && (
                <p className="text-sm text-gray-500 bg-gray-50 p-3 rounded-lg">
                  This material will be uploaded for your organization ({userOwnerSlug}).
                </p>
              )}

              {isSuperAdmin && !uploadForm.isGlobal && orgs.length > 0 && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Target Organizations</label>
                  <div className="max-h-32 overflow-y-auto border border-gray-300 rounded-lg p-2">
                    {orgs.map(org => (
                      <label key={org} className="flex items-center gap-2 py-1">
                        <input
                          type="checkbox"
                          checked={uploadForm.targetOrgSlugs.includes(org)}
                          onChange={(e) => {
                            if (e.target.checked) {
                              setUploadForm(prev => ({ ...prev, targetOrgSlugs: [...prev.targetOrgSlugs, org] }));
                            } else {
                              setUploadForm(prev => ({ ...prev, targetOrgSlugs: prev.targetOrgSlugs.filter(s => s !== org) }));
                            }
                          }}
                          className="rounded"
                        />
                        <span className="text-sm">{org}</span>
                      </label>
                    ))}
                  </div>
                </div>
              )}

              <div className="flex gap-3 pt-4">
                <button
                  type="button"
                  onClick={() => setShowUploadModal(false)}
                  className="flex-1 px-4 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-lg font-medium"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={uploading}
                  className="flex-1 px-4 py-2 bg-amber-600 hover:bg-amber-700 text-white rounded-lg font-medium disabled:opacity-50"
                >
                  {uploading ? 'Uploading...' : 'Upload'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
