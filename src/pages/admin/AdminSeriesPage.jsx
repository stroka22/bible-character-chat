import React, { useEffect, useState } from 'react';
import { bibleSeriesRepository } from '../../repositories/bibleSeriesRepository';
import { bibleStudiesRepository } from '../../repositories/bibleStudiesRepository';
import { getOwnerSlug } from '../../services/tierSettingsService';

const AdminSeriesPage = ({ embedded = false }) => {
  const [ownerSlug] = useState(getOwnerSlug());
  const [series, setSeries] = useState([]);
  const [studies, setStudies] = useState([]);
  const [selected, setSelected] = useState(null);
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showForm, setShowForm] = useState(false);
  const [showItemForm, setShowItemForm] = useState(false);

  const [form, setForm] = useState({
    id: null,
    owner_slug: ownerSlug,
    slug: '',
    title: '',
    description: '',
    cover_image_url: '',
    visibility: 'public',
    show_in_nav: false,
    is_premium: false,
    auto_premium_if_any: true,
  });

  const [itemForm, setItemForm] = useState({
    id: null,
    series_id: '',
    study_id: '',
    order_index: 0,
    override_title: ''
  });

  useEffect(() => {
    fetchData();
  }, []);

  useEffect(() => {
    if (selected) {
      fetchItems(selected.id);
    } else {
      setItems([]);
    }
  }, [selected]);

  const fetchData = async () => {
    setLoading(true);
    try {
      const [ser, std] = await Promise.all([
        bibleSeriesRepository.listSeries({ ownerSlug, includePrivate: true }),
        bibleStudiesRepository.listStudies({ ownerSlug, includePrivate: true })
      ]);
      setSeries(ser);
      setStudies(std);
      setError(null);
    } catch (err) {
      console.error('Error loading admin series data:', err);
      setError('Failed to load data.');
    } finally {
      setLoading(false);
    }
  };

  const fetchItems = async (seriesId) => {
    try {
      const it = await bibleSeriesRepository.listItemsWithStudies(seriesId);
      setItems(it || []);
    } catch (err) {
      console.error('Error loading series items:', err);
    }
  };

  const resetForm = () => setForm({
    id: null,
    owner_slug: ownerSlug,
    slug: '',
    title: '',
    description: '',
    cover_image_url: '',
    visibility: 'public',
    show_in_nav: false,
    is_premium: false,
    auto_premium_if_any: true,
  });

  const resetItemForm = () => setItemForm({
    id: null,
    series_id: selected ? selected.id : '',
    study_id: '',
    order_index: items.length,
    override_title: ''
  });

  const handleNew = () => { resetForm(); setShowForm(true); };
  const handleEdit = (s) => { setForm({ ...s }); setShowForm(true); };

  const handleSave = async () => {
    try {
      const payload = { ...form };
      if (typeof payload.is_premium === 'string') payload.is_premium = payload.is_premium === 'true';
      if (typeof payload.show_in_nav === 'string') payload.show_in_nav = payload.show_in_nav === 'true';
      if (typeof payload.auto_premium_if_any === 'string') payload.auto_premium_if_any = payload.auto_premium_if_any === 'true';
      payload.owner_slug = payload.owner_slug || ownerSlug;
      const saved = await bibleSeriesRepository.upsertSeries(payload);
      await fetchData();
      setShowForm(false);
      if (saved) setSelected(saved);
    } catch (err) {
      console.error('Save series error:', err);
      setError(err.message || 'Failed to save series');
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this series?')) return;
    const ok = await bibleSeriesRepository.deleteSeries(id);
    if (ok) {
      if (selected?.id === id) setSelected(null);
      fetchData();
    }
  };

  const handleNewItem = () => { resetItemForm(); setShowItemForm(true); };

  const handleSaveItem = async () => {
    try {
      const payload = { ...itemForm };
      payload.order_index = parseInt(payload.order_index, 10) || 0;
      if (!payload.series_id) payload.series_id = selected?.id;
      await bibleSeriesRepository.upsertItem(payload);
      setShowItemForm(false);
      await fetchItems(selected.id);
    } catch (err) {
      console.error('Save item error:', err);
      setError(err.message || 'Failed to save item');
    }
  };

  const handleDeleteItem = async (id) => {
    if (!window.confirm('Delete this item from series?')) return;
    const ok = await bibleSeriesRepository.deleteItem(id);
    if (ok) await fetchItems(selected.id);
  };

  const inner = (
    <div className="max-w-6xl mx-auto">
      {!embedded && (
        <div className="mb-4">
          <a href="/admin" className="text-blue-200 hover:text-yellow-300">← Back to Admin</a>
        </div>
      )}

      <div className="mb-8">
        <h1 className={`text-3xl md:text-4xl font-extrabold ${embedded ? 'text-gray-800' : 'text-yellow-400'} mb-2 tracking-tight`} style={{ fontFamily: 'Cinzel, serif' }}>Study Series Administration</h1>
        <p className={`${embedded ? 'text-gray-600' : 'text-blue-100'}`}>Manage Bible Study Series and their items</p>
      </div>

      {error && (
        <div className={`${embedded ? 'bg-red-100 text-red-700 border border-red-300' : 'bg-red-500/20 text-red-200 border border-red-500/30'} px-4 py-3 rounded-lg mb-6`}>{error}</div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className={embedded ? "bg-white rounded-lg p-6 border border-gray-200 shadow-md" : "bg-white/10 backdrop-blur-sm rounded-xl p-6 border border-white/15 shadow-lg"}>
          <div className="flex justify-between items-center mb-4">
            <h2 className={`text-xl font-bold ${embedded ? 'text-gray-800' : 'text-yellow-400'}`}>Study Series</h2>
            <button onClick={handleNew} className={`${embedded ? 'bg-primary-600 hover:bg-primary-700' : 'bg-green-600 hover:bg-green-700'} text-white px-3 py-1 rounded-lg text-sm`}>New Series</button>
          </div>

          {loading ? (
            <div className="flex justify-center py-8"><div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-yellow-400" /></div>
          ) : series.length === 0 ? (
            <div className={`${embedded ? 'text-gray-600' : 'text-blue-100'} text-center py-8`}>No series found. Create one!</div>
          ) : (
            <div className="space-y-3 max-h-[60vh] overflow-y-auto pr-2">
              {series.map(s => (
                <div key={s.id} className={`p-4 rounded-lg border transition-all cursor-pointer ${selected?.id === s.id ? (embedded ? 'bg-blue-50 border-primary-400' : 'bg-blue-700/50 border-yellow-400/50') : (embedded ? 'bg-white border-gray-200 hover:bg-gray-50' : 'bg-white/5 border-white/10 hover:bg-white/10')}`}
                  onClick={() => setSelected(s)}>
                  <div className="flex justify-between items-start">
                    <h3 className={`font-semibold ${embedded ? 'text-gray-800' : 'text-yellow-300'} mb-1`}>{s.title}</h3>
                    <div className="flex gap-1">
                      <button onClick={(e) => { e.stopPropagation(); handleEdit(s); }} className={`${embedded ? 'text-blue-600 hover:text-blue-800' : 'text-blue-300 hover:text-blue-200'} p-1`} title="Edit">✎</button>
                      <button onClick={(e) => { e.stopPropagation(); handleDelete(s.id); }} className="text-red-400 hover:text-red-300 p-1" title="Delete">🗑</button>
                    </div>
                  </div>
                  <p className={`text-sm ${embedded ? 'text-gray-600' : 'text-blue-100'} line-clamp-2`}>{s.description}</p>
                  <div className="flex flex-wrap gap-2 mt-2">
                    <span className={`text-xs px-2 py-0.5 rounded-full ${embedded ? (s.visibility === 'public' ? 'bg-blue-100 text-blue-800 border border-blue-200' : 'bg-gray-100 text-gray-800 border border-gray-200') : (s.visibility === 'public' ? 'bg-green-500/20 text-green-300 border border-green-500/30' : 'bg-blue-500/20 text-blue-300 border border-blue-500/30')}`}>{s.visibility}</span>
                    {s.is_premium && (<span className={`${embedded ? 'bg-blue-100 text-blue-800 border border-blue-200' : 'bg-yellow-500/20 text-yellow-300 border border-yellow-500/30'} text-xs px-2 py-0.5 rounded-full`}>Premium</span>)}
                    {s.show_in_nav && (<span className={`${embedded ? 'bg-green-100 text-green-800 border border-green-200' : 'bg-green-500/20 text-green-300 border border-green-500/30'} text-xs px-2 py-0.5 rounded-full`}>Nav</span>)}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="lg:col-span-2">
          {selected ? (
            <div className={embedded ? "bg-white rounded-lg p-6 border border-gray-200 shadow-md" : "bg-white/10 backdrop-blur-sm rounded-xl p-6 border border-white/15 shadow-lg"}>
              <div className="flex justify-between items-center mb-6">
                <div>
                  <h2 className={`text-xl font-bold ${embedded ? 'text-gray-800' : 'text-yellow-400'}`}>Items</h2>
                  <p className={`${embedded ? 'text-gray-500' : 'text-blue-200'}`}>Series: <span className="font-semibold">{selected.title}</span></p>
                </div>
                <button onClick={handleNewItem} className={`${embedded ? 'bg-primary-600 hover:bg-primary-700' : 'bg-green-600 hover:bg-green-700'} text-white px-3 py-1 rounded-lg text-sm`}>Add Item</button>
              </div>

              {items.length === 0 ? (
                <div className={`${embedded ? 'text-gray-600' : 'text-blue-100'} text-center py-8`}>No items yet. Add your first.</div>
              ) : (
                <div className="space-y-3 max-h-[60vh] overflow-y-auto pr-2">
                  {items.map(it => (
                    <div key={it.id} className={embedded ? "bg-gray-50 rounded-lg p-4 border border-gray-200" : "bg-white/5 rounded-lg p-4 border border-white/10"}>
                      <div className="flex justify-between items-start">
                        <div>
                          <div className={`font-semibold ${embedded ? 'text-gray-800' : 'text-yellow-300'}`}>{it.override_title || it.study?.title || 'Study'}</div>
                          <div className={`${embedded ? 'text-gray-600' : 'text-blue-100'} text-sm`}>Order: {it.order_index}</div>
                        </div>
                        <button onClick={() => handleDeleteItem(it.id)} className="text-red-400 hover:text-red-300 p-1" title="Remove">🗑</button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          ) : (
            <div className={embedded ? "bg-white rounded-lg p-8 border border-gray-200 shadow-md flex items-center justify-center h-full" : "bg-white/10 backdrop-blur-sm rounded-xl p-8 border border-white/15 shadow-lg flex items-center justify-center h-full"}>
              <p className={`${embedded ? 'text-gray-500' : 'text-blue-200'} text-center`}>Select a series to manage its items</p>
            </div>
          )}
        </div>
      </div>

      {showForm && (
        <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 p-4">
          <div className="bg-blue-900 rounded-xl p-6 w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-2xl font-bold text-yellow-400">{form.id ? 'Edit Series' : 'Create New Series'}</h2>
              <button onClick={() => setShowForm(false)} className="text-white hover:text-yellow-300">✕</button>
            </div>
            <form onSubmit={(e) => { e.preventDefault(); handleSave(); }} className="space-y-4">
              <div>
                <label className="block text-blue-200 mb-1">Slug</label>
                <input type="text" value={form.slug} onChange={(e) => setForm({ ...form, slug: e.target.value })} required className="w-full bg-white border border-gray-300 text-gray-900 rounded-lg py-2 px-3 focus:border-primary-500 focus:ring-primary-500" placeholder="e.g., beatitudes-series" />
              </div>
              <div>
                <label className="block text-blue-200 mb-1">Title</label>
                <input type="text" value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} required className="w-full bg-white border border-gray-300 text-gray-900 rounded-lg py-2 px-3 focus:border-primary-500 focus:ring-primary-500" />
              </div>
              <div>
                <label className="block text-blue-200 mb-1">Description</label>
                <textarea value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} className="w-full bg-white border border-gray-300 text-gray-900 rounded-lg py-2 px-3 h-24 focus:border-primary-500 focus:ring-primary-500" />
              </div>
              <div>
                <label className="block text-blue-200 mb-1">Cover Image URL</label>
                <input type="text" value={form.cover_image_url || ''} onChange={(e) => setForm({ ...form, cover_image_url: e.target.value })} className="w-full bg-white border border-gray-300 text-gray-900 rounded-lg py-2 px-3 focus:border-primary-500 focus:ring-primary-500" placeholder="https://example.com/cover.jpg" />
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-blue-200 mb-1">Visibility</label>
                  <select value={form.visibility} onChange={(e) => setForm({ ...form, visibility: e.target.value })} className="w-full bg-white border border-gray-300 text-gray-900 rounded-lg py-2 px-3 focus:border-primary-500 focus:ring-primary-500">
                    <option value="public">Public</option>
                    <option value="unlisted">Unlisted</option>
                    <option value="private">Private</option>
                  </select>
                </div>
                <div>
                  <label className="block text-blue-200 mb-1">Premium</label>
                  <select value={String(form.is_premium)} onChange={(e) => setForm({ ...form, is_premium: e.target.value })} className="w-full bg-white border border-gray-300 text-gray-900 rounded-lg py-2 px-3 focus:border-primary-500 focus:ring-primary-500">
                    <option value="false">Free</option>
                    <option value="true">Premium Only</option>
                  </select>
                </div>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <label className="inline-flex items-center gap-2 text-blue-200">
                  <input type="checkbox" checked={!!form.show_in_nav} onChange={(e) => setForm({ ...form, show_in_nav: e.target.checked })} /> Show in navigation
                </label>
                <label className="inline-flex items-center gap-2 text-blue-200">
                  <input type="checkbox" checked={!!form.auto_premium_if_any} onChange={(e) => setForm({ ...form, auto_premium_if_any: e.target.checked })} /> Auto-premium if any item is premium
                </label>
              </div>
              <div className="flex justify-end gap-3 pt-2">
                <button type="button" onClick={() => setShowForm(false)} className="px-4 py-2 bg-gray-600 hover:bg-gray-700 text-white rounded-lg">Cancel</button>
                <button type="submit" className="px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg">Save Series</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {showItemForm && (
        <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 p-4">
          <div className="bg-blue-900 rounded-xl p-6 w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-2xl font-bold text-yellow-400">Add Item</h2>
              <button onClick={() => setShowItemForm(false)} className="text-white hover:text-yellow-300">✕</button>
            </div>
            <form onSubmit={(e) => { e.preventDefault(); handleSaveItem(); }} className="space-y-4">
              <div>
                <label className="block text-blue-200 mb-1">Study</label>
                <select value={itemForm.study_id} onChange={(e) => setItemForm({ ...itemForm, study_id: e.target.value })} className="w-full bg-white border border-gray-300 text-gray-900 rounded-lg py-2 px-3 focus:border-primary-500 focus:ring-primary-500">
                  <option value="">-- Select a study --</option>
                  {studies.map(st => (
                    <option key={st.id} value={st.id}>{st.title}</option>
                  ))}
                </select>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-blue-200 mb-1">Order Index</label>
                  <input type="number" min="0" value={itemForm.order_index} onChange={(e) => setItemForm({ ...itemForm, order_index: e.target.value })} className="w-full bg-white border border-gray-300 text-gray-900 rounded-lg py-2 px-3 focus:border-primary-500 focus:ring-primary-500" />
                </div>
                <div>
                  <label className="block text-blue-200 mb-1">Override Title (optional)</label>
                  <input type="text" value={itemForm.override_title} onChange={(e) => setItemForm({ ...itemForm, override_title: e.target.value })} className="w-full bg-white border border-gray-300 text-gray-900 rounded-lg py-2 px-3 focus:border-primary-500 focus:ring-primary-500" />
                </div>
              </div>
              <div className="flex justify-end gap-3 pt-2">
                <button type="button" onClick={() => setShowItemForm(false)} className="px-4 py-2 bg-gray-600 hover:bg-gray-700 text-white rounded-lg">Cancel</button>
                <button type="submit" className="px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg">Save Item</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );

  return embedded ? inner : (
    <div className="min-h-screen bg-gradient-to-b from-blue-900 via-blue-800 to-blue-700 py-8 px-4 md:px-6">{inner}</div>
  );
};

export default AdminSeriesPage;
