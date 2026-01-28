import React, { useState, useEffect, useCallback } from 'react';
import { readingPlansRepository } from '../../repositories/readingPlansRepository';

const DIFFICULTY_OPTIONS = ['easy', 'medium', 'intensive'];

// Drag and Drop item component
function DraggablePlanItem({ plan, index, onDragStart, onDragOver, onDrop, onEdit, onToggleFeatured, onChangeCategory, categories }) {
  return (
    <div
      draggable
      onDragStart={(e) => onDragStart(e, index)}
      onDragOver={(e) => onDragOver(e, index)}
      onDrop={(e) => onDrop(e, index)}
      className="flex items-center gap-3 p-3 bg-white border border-gray-200 rounded-lg hover:shadow-md transition-shadow cursor-move"
    >
      <div className="text-gray-400 cursor-grab">
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 8h16M4 16h16" />
        </svg>
      </div>
      
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2">
          <h4 className="font-medium text-gray-900 truncate">{plan.title}</h4>
          {plan.is_featured && (
            <span className="px-2 py-0.5 text-xs bg-yellow-100 text-yellow-800 rounded">Featured</span>
          )}
          {!plan.is_active && (
            <span className="px-2 py-0.5 text-xs bg-red-100 text-red-800 rounded">Inactive</span>
          )}
        </div>
        <p className="text-sm text-gray-500 truncate">{plan.description}</p>
        <div className="flex items-center gap-2 mt-1 text-xs text-gray-400">
          <span>{plan.duration_days} days</span>
          <span>•</span>
          <span className="capitalize">{plan.difficulty}</span>
        </div>
      </div>

      <select
        value={plan.category || ''}
        onChange={(e) => onChangeCategory(plan.id, e.target.value)}
        className="text-sm border border-gray-300 rounded px-2 py-1"
      >
        <option value="">No Category</option>
        {categories.map(cat => (
          <option key={cat.slug} value={cat.slug}>{cat.name}</option>
        ))}
      </select>

      <button
        onClick={() => onToggleFeatured(plan.id, !plan.is_featured)}
        className={`p-2 rounded ${plan.is_featured ? 'bg-yellow-100 text-yellow-600' : 'bg-gray-100 text-gray-400'} hover:bg-yellow-200`}
        title={plan.is_featured ? 'Remove from Featured' : 'Add to Featured'}
      >
        <svg className="w-5 h-5" fill={plan.is_featured ? 'currentColor' : 'none'} stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z" />
        </svg>
      </button>

      <button
        onClick={() => onEdit(plan)}
        className="p-2 bg-blue-100 text-blue-600 rounded hover:bg-blue-200"
        title="Edit Plan"
      >
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
        </svg>
      </button>
    </div>
  );
}

// Category management component
function CategoryManager({ categories, onUpdate, onDelete, onCreate }) {
  const [editingId, setEditingId] = useState(null);
  const [editForm, setEditForm] = useState({ name: '', icon: '', description: '' });
  const [showNew, setShowNew] = useState(false);
  const [newForm, setNewForm] = useState({ name: '', slug: '', icon: '', description: '' });

  const handleEdit = (cat) => {
    setEditingId(cat.id);
    setEditForm({ name: cat.name, icon: cat.icon || '', description: cat.description || '' });
  };

  const handleSave = async (id) => {
    await onUpdate(id, editForm);
    setEditingId(null);
  };

  const handleCreate = async () => {
    if (!newForm.name || !newForm.slug) return;
    await onCreate({
      ...newForm,
      slug: newForm.slug.toLowerCase().replace(/\s+/g, '-'),
    });
    setNewForm({ name: '', slug: '', icon: '', description: '' });
    setShowNew(false);
  };

  return (
    <div className="space-y-3">
      {categories.map(cat => (
        <div key={cat.id} className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
          {editingId === cat.id ? (
            <>
              <input
                type="text"
                value={editForm.icon}
                onChange={(e) => setEditForm({ ...editForm, icon: e.target.value })}
                className="w-12 text-center border border-gray-300 rounded px-2 py-1"
                placeholder="Icon"
              />
              <input
                type="text"
                value={editForm.name}
                onChange={(e) => setEditForm({ ...editForm, name: e.target.value })}
                className="flex-1 border border-gray-300 rounded px-2 py-1"
                placeholder="Name"
              />
              <input
                type="text"
                value={editForm.description}
                onChange={(e) => setEditForm({ ...editForm, description: e.target.value })}
                className="flex-1 border border-gray-300 rounded px-2 py-1"
                placeholder="Description"
              />
              <button onClick={() => handleSave(cat.id)} className="px-3 py-1 bg-green-600 text-white rounded text-sm">Save</button>
              <button onClick={() => setEditingId(null)} className="px-3 py-1 bg-gray-300 text-gray-700 rounded text-sm">Cancel</button>
            </>
          ) : (
            <>
              <span className="text-xl w-8">{cat.icon}</span>
              <div className="flex-1">
                <span className="font-medium">{cat.name}</span>
                <span className="text-gray-500 text-sm ml-2">({cat.slug})</span>
                {cat.description && <p className="text-sm text-gray-500">{cat.description}</p>}
              </div>
              <span className="text-sm text-gray-400">Order: {cat.display_order}</span>
              <button onClick={() => handleEdit(cat)} className="p-1 text-blue-600 hover:bg-blue-100 rounded">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                </svg>
              </button>
              <button onClick={() => onDelete(cat.id)} className="p-1 text-red-600 hover:bg-red-100 rounded">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                </svg>
              </button>
            </>
          )}
        </div>
      ))}
      
      {showNew ? (
        <div className="flex items-center gap-3 p-3 bg-blue-50 rounded-lg border-2 border-dashed border-blue-300">
          <input
            type="text"
            value={newForm.icon}
            onChange={(e) => setNewForm({ ...newForm, icon: e.target.value })}
            className="w-12 text-center border border-gray-300 rounded px-2 py-1"
            placeholder="Icon"
          />
          <input
            type="text"
            value={newForm.name}
            onChange={(e) => setNewForm({ ...newForm, name: e.target.value })}
            className="flex-1 border border-gray-300 rounded px-2 py-1"
            placeholder="Category Name"
          />
          <input
            type="text"
            value={newForm.slug}
            onChange={(e) => setNewForm({ ...newForm, slug: e.target.value })}
            className="w-32 border border-gray-300 rounded px-2 py-1"
            placeholder="slug"
          />
          <button onClick={handleCreate} className="px-3 py-1 bg-green-600 text-white rounded text-sm">Create</button>
          <button onClick={() => setShowNew(false)} className="px-3 py-1 bg-gray-300 text-gray-700 rounded text-sm">Cancel</button>
        </div>
      ) : (
        <button
          onClick={() => setShowNew(true)}
          className="w-full p-3 border-2 border-dashed border-gray-300 rounded-lg text-gray-500 hover:border-blue-400 hover:text-blue-600 transition-colors"
        >
          + Add Category
        </button>
      )}
    </div>
  );
}

// Plan edit modal
function PlanEditModal({ plan, categories, onSave, onClose }) {
  const [form, setForm] = useState({
    title: plan?.title || '',
    slug: plan?.slug || '',
    description: plan?.description || '',
    duration_days: plan?.duration_days || 7,
    category: plan?.category || '',
    difficulty: plan?.difficulty || 'medium',
    is_featured: plan?.is_featured || false,
    is_active: plan?.is_active ?? true,
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    onSave(plan?.id, form);
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl max-w-lg w-full max-h-[90vh] overflow-y-auto">
        <div className="p-4 border-b border-gray-200">
          <h3 className="text-lg font-semibold">{plan ? 'Edit Reading Plan' : 'Create Reading Plan'}</h3>
        </div>
        
        <form onSubmit={handleSubmit} className="p-4 space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Title</label>
            <input
              type="text"
              value={form.title}
              onChange={(e) => setForm({ ...form, title: e.target.value })}
              className="w-full border border-gray-300 rounded-lg px-3 py-2"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Slug</label>
            <input
              type="text"
              value={form.slug}
              onChange={(e) => setForm({ ...form, slug: e.target.value.toLowerCase().replace(/\s+/g, '-') })}
              className="w-full border border-gray-300 rounded-lg px-3 py-2"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
            <textarea
              value={form.description}
              onChange={(e) => setForm({ ...form, description: e.target.value })}
              className="w-full border border-gray-300 rounded-lg px-3 py-2"
              rows={3}
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Duration (days)</label>
              <input
                type="number"
                value={form.duration_days}
                onChange={(e) => setForm({ ...form, duration_days: parseInt(e.target.value) || 1 })}
                className="w-full border border-gray-300 rounded-lg px-3 py-2"
                min={1}
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Difficulty</label>
              <select
                value={form.difficulty}
                onChange={(e) => setForm({ ...form, difficulty: e.target.value })}
                className="w-full border border-gray-300 rounded-lg px-3 py-2"
              >
                {DIFFICULTY_OPTIONS.map(d => (
                  <option key={d} value={d}>{d.charAt(0).toUpperCase() + d.slice(1)}</option>
                ))}
              </select>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Category</label>
            <select
              value={form.category}
              onChange={(e) => setForm({ ...form, category: e.target.value })}
              className="w-full border border-gray-300 rounded-lg px-3 py-2"
            >
              <option value="">No Category</option>
              {categories.map(cat => (
                <option key={cat.slug} value={cat.slug}>{cat.name}</option>
              ))}
            </select>
          </div>

          <div className="flex items-center gap-6">
            <label className="flex items-center gap-2">
              <input
                type="checkbox"
                checked={form.is_featured}
                onChange={(e) => setForm({ ...form, is_featured: e.target.checked })}
                className="rounded"
              />
              <span className="text-sm">Featured</span>
            </label>
            
            <label className="flex items-center gap-2">
              <input
                type="checkbox"
                checked={form.is_active}
                onChange={(e) => setForm({ ...form, is_active: e.target.checked })}
                className="rounded"
              />
              <span className="text-sm">Active</span>
            </label>
          </div>

          <div className="flex gap-3 pt-4">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
            >
              Save
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

// Main Admin Component
export default function AdminReadingPlansPage({ embedded = false }) {
  const [plans, setPlans] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [activeTab, setActiveTab] = useState('plans'); // 'plans' | 'categories' | 'featured'
  const [editingPlan, setEditingPlan] = useState(null);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterCategory, setFilterCategory] = useState('');
  const [dragIndex, setDragIndex] = useState(null);

  // Load data
  const loadData = useCallback(async () => {
    setLoading(true);
    try {
      const [plansData, categoriesData] = await Promise.all([
        readingPlansRepository.getAllAdmin(),
        readingPlansRepository.getCategories().catch(() => []),
      ]);
      setPlans(plansData);
      setCategories(categoriesData);
      setError(null);
    } catch (err) {
      console.error('Error loading data:', err);
      setError('Failed to load reading plans');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadData();
  }, [loadData]);

  // Filter plans
  const filteredPlans = plans.filter(p => {
    const matchesSearch = !searchQuery || 
      p.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      p.description?.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = !filterCategory || p.category === filterCategory;
    return matchesSearch && matchesCategory;
  });

  // Featured plans
  const featuredPlans = plans.filter(p => p.is_featured).sort((a, b) => (a.featured_order || 0) - (b.featured_order || 0));

  // Handlers
  const handleToggleFeatured = async (id, isFeatured) => {
    try {
      await readingPlansRepository.toggleFeatured(id, isFeatured);
      setPlans(plans.map(p => p.id === id ? { ...p, is_featured: isFeatured } : p));
    } catch (err) {
      console.error('Error toggling featured:', err);
    }
  };

  const handleChangeCategory = async (id, category) => {
    try {
      await readingPlansRepository.updatePlanCategory(id, category);
      setPlans(plans.map(p => p.id === id ? { ...p, category } : p));
    } catch (err) {
      console.error('Error changing category:', err);
    }
  };

  const handleSavePlan = async (id, form) => {
    try {
      if (id) {
        await readingPlansRepository.updatePlan(id, form);
        setPlans(plans.map(p => p.id === id ? { ...p, ...form } : p));
      } else {
        const newPlan = await readingPlansRepository.createPlan(form);
        setPlans([...plans, newPlan]);
      }
      setEditingPlan(null);
      setShowCreateModal(false);
    } catch (err) {
      console.error('Error saving plan:', err);
    }
  };

  const handleDeletePlan = async (id) => {
    if (!confirm('Are you sure you want to delete this plan?')) return;
    try {
      await readingPlansRepository.deletePlan(id);
      setPlans(plans.filter(p => p.id !== id));
    } catch (err) {
      console.error('Error deleting plan:', err);
    }
  };

  // Category handlers
  const handleCreateCategory = async (form) => {
    try {
      const newCat = await readingPlansRepository.createCategory(form);
      setCategories([...categories, newCat]);
    } catch (err) {
      console.error('Error creating category:', err);
    }
  };

  const handleUpdateCategory = async (id, form) => {
    try {
      await readingPlansRepository.updateCategory(id, form);
      setCategories(categories.map(c => c.id === id ? { ...c, ...form } : c));
    } catch (err) {
      console.error('Error updating category:', err);
    }
  };

  const handleDeleteCategory = async (id) => {
    if (!confirm('Delete this category? Plans in this category will become uncategorized.')) return;
    try {
      await readingPlansRepository.deleteCategory(id);
      setCategories(categories.filter(c => c.id !== id));
    } catch (err) {
      console.error('Error deleting category:', err);
    }
  };

  // Drag and drop handlers
  const handleDragStart = (e, index) => {
    setDragIndex(index);
    e.dataTransfer.effectAllowed = 'move';
  };

  const handleDragOver = (e, index) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
  };

  const handleDrop = async (e, dropIndex) => {
    e.preventDefault();
    if (dragIndex === null || dragIndex === dropIndex) return;

    const reordered = [...filteredPlans];
    const [moved] = reordered.splice(dragIndex, 1);
    reordered.splice(dropIndex, 0, moved);

    // Update display order
    const updates = reordered.map((p, i) => ({ id: p.id, display_order: i * 10 }));
    
    try {
      await readingPlansRepository.bulkUpdateOrder(updates);
      loadData();
    } catch (err) {
      console.error('Error reordering:', err);
    }
    
    setDragIndex(null);
  };

  const containerClass = embedded 
    ? 'p-4' 
    : 'container mx-auto px-4 pt-24 pb-12';

  return (
    <div className={containerClass}>
      {!embedded && (
        <div className="mb-6">
          <h1 className="text-2xl font-bold text-gray-900">Reading Plans Admin</h1>
          <p className="text-gray-600">Manage categories, featured plans, and plan organization</p>
        </div>
      )}

      {error && (
        <div className="mb-4 p-4 bg-red-50 border border-red-200 text-red-700 rounded-lg">
          {error}
        </div>
      )}

      {/* Tabs */}
      <div className="flex gap-2 mb-6 border-b border-gray-200">
        {['plans', 'categories', 'featured'].map(tab => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={`px-4 py-2 text-sm font-medium border-b-2 -mb-px ${
              activeTab === tab 
                ? 'border-blue-600 text-blue-600' 
                : 'border-transparent text-gray-500 hover:text-gray-700'
            }`}
          >
            {tab.charAt(0).toUpperCase() + tab.slice(1)}
            {tab === 'plans' && ` (${plans.length})`}
            {tab === 'featured' && ` (${featuredPlans.length})`}
          </button>
        ))}
      </div>

      {loading ? (
        <div className="text-center py-12 text-gray-500">Loading...</div>
      ) : (
        <>
          {/* Plans Tab */}
          {activeTab === 'plans' && (
            <div>
              <div className="flex flex-wrap gap-4 mb-4">
                <input
                  type="text"
                  placeholder="Search plans..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="flex-1 min-w-[200px] border border-gray-300 rounded-lg px-3 py-2"
                />
                <select
                  value={filterCategory}
                  onChange={(e) => setFilterCategory(e.target.value)}
                  className="border border-gray-300 rounded-lg px-3 py-2"
                >
                  <option value="">All Categories</option>
                  {categories.map(cat => (
                    <option key={cat.slug} value={cat.slug}>{cat.name}</option>
                  ))}
                </select>
                <button
                  onClick={() => setShowCreateModal(true)}
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                >
                  + New Plan
                </button>
              </div>

              <div className="space-y-2">
                {filteredPlans.map((plan, index) => (
                  <DraggablePlanItem
                    key={plan.id}
                    plan={plan}
                    index={index}
                    categories={categories}
                    onDragStart={handleDragStart}
                    onDragOver={handleDragOver}
                    onDrop={handleDrop}
                    onEdit={setEditingPlan}
                    onToggleFeatured={handleToggleFeatured}
                    onChangeCategory={handleChangeCategory}
                  />
                ))}
              </div>

              {filteredPlans.length === 0 && (
                <div className="text-center py-12 text-gray-500">
                  No plans found
                </div>
              )}
            </div>
          )}

          {/* Categories Tab */}
          {activeTab === 'categories' && (
            <CategoryManager
              categories={categories}
              onUpdate={handleUpdateCategory}
              onDelete={handleDeleteCategory}
              onCreate={handleCreateCategory}
            />
          )}

          {/* Featured Tab */}
          {activeTab === 'featured' && (
            <div>
              <p className="text-sm text-gray-500 mb-4">
                Drag to reorder featured plans. These appear at the top of the Reading Plans page.
              </p>
              <div className="space-y-2">
                {featuredPlans.map((plan, index) => (
                  <DraggablePlanItem
                    key={plan.id}
                    plan={plan}
                    index={index}
                    categories={categories}
                    onDragStart={handleDragStart}
                    onDragOver={handleDragOver}
                    onDrop={handleDrop}
                    onEdit={setEditingPlan}
                    onToggleFeatured={handleToggleFeatured}
                    onChangeCategory={handleChangeCategory}
                  />
                ))}
              </div>
              {featuredPlans.length === 0 && (
                <div className="text-center py-12 text-gray-500">
                  No featured plans. Star plans from the Plans tab to feature them.
                </div>
              )}
            </div>
          )}
        </>
      )}

      {/* Edit Modal */}
      {editingPlan && (
        <PlanEditModal
          plan={editingPlan}
          categories={categories}
          onSave={handleSavePlan}
          onClose={() => setEditingPlan(null)}
        />
      )}

      {/* Create Modal */}
      {showCreateModal && (
        <PlanEditModal
          plan={null}
          categories={categories}
          onSave={handleSavePlan}
          onClose={() => setShowCreateModal(false)}
        />
      )}
    </div>
  );
}
