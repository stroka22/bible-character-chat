import React, { useState, useEffect, useCallback } from 'react';
// Auth & Supabase helpers
import { useAuth } from '../../contexts/AuthContext';
import {
  listAllFaqs,
  upsertFaq as upsertFaqRow,
  deleteFaq as deleteFaqRow,
} from '../../services/faqs';

/**
 * AdminFAQEditor Component
 * 
 * Allows administrators to manage FAQ entries with the following features:
 * - Add new FAQ entries
 * - Edit existing FAQ entries
 * - Delete FAQ entries
 * - View all FAQ entries
 * - Persistence through localStorage
 * - Categorize FAQs and control display order
 */
const AdminFAQEditor = () => {
  /* ------------------------------------------------------------------
   * Storage keys (shared with FAQPage)
   * ------------------------------------------------------------------ */
  const FAQ_STORAGE_KEY = 'faithTalkAI_faqs';
  const LEGACY_KEY = 'faqItems';

  // State for the list of FAQs
  const [faqs, setFaqs] = useState([]);
  
  // Form state
  const [question, setQuestion] = useState('');
  const [answer, setAnswer] = useState('');
  const [category, setCategory] = useState('General');
  const [orderIndex, setOrderIndex] = useState('');
  const [editingId, setEditingId] = useState(null);
  
  // UI state
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const [successMessage, setSuccessMessage] = useState(null);

  /* ------------------------------------------------------------------
   * Admin detection (uses AuthContext)
   * ------------------------------------------------------------------ */
  const { isAdmin } = useAuth();
  const isAdminUser = typeof isAdmin === 'function' ? isAdmin() : false;

  // Load FAQs from localStorage on component mount
  useEffect(() => {
    (async () => {
      /* --------------------------------------------------------------
       * 0) If admin – pull canonical list from Supabase first
       * ------------------------------------------------------------ */
      if (isAdminUser) {
        setIsLoading(true);
        try {
          const rows = await listAllFaqs();
          if (Array.isArray(rows)) {
            const normalized = rows.map((r) => ({
              id: r.id,
              question: r.question,
              answer: r.answer,
              category: r.category || 'General',
              isPublished: r.is_published !== false,
              order_index: r.order_index ?? null,
              createdAt: r.created_at || new Date().toISOString(),
              updatedAt: r.updated_at || r.created_at || new Date().toISOString(),
            }));
            setFaqs(normalized);
            // cache published list for FAQPage fallback
            try {
              const published = normalized.filter((f) => f.isPublished !== false);
              localStorage.setItem(FAQ_STORAGE_KEY, JSON.stringify(published));
            } catch {}
            setIsLoading(false);
            return; // stop fallback chain
          }
        } catch (err) {
          console.warn('[AdminFAQEditor] Supabase fetch failed, falling back:', err);
        } finally {
          setIsLoading(false);
        }
      }

      /* --------------------------------------------------------------
       * Fallback – load from localStorage (legacy behaviour)
       * ------------------------------------------------------------ */
      try {
      // Prefer new namespaced key, but support migration from legacy key
      const savedRaw =
        localStorage.getItem(FAQ_STORAGE_KEY) ||
        localStorage.getItem(LEGACY_KEY);

      if (savedRaw) {
        const parsed = JSON.parse(savedRaw);
        setFaqs(parsed);

        // If we loaded from the legacy key, migrate it to the new key
        if (!localStorage.getItem(FAQ_STORAGE_KEY)) {
          try {
            localStorage.setItem(FAQ_STORAGE_KEY, savedRaw);
          } catch {
            /* ignore quota errors */
          }
        }
      }
    } catch (err) {
      console.error('Error loading FAQs from localStorage:', err);
      setError('Failed to load saved FAQs. Please try refreshing the page.');
    }
    })();
  }, []);

  // Save FAQs to localStorage whenever they change
  useEffect(() => {
    try {
      localStorage.setItem(FAQ_STORAGE_KEY, JSON.stringify(faqs));
    } catch (err) {
      console.error('Error saving FAQs to localStorage:', err);
      setError('Failed to save FAQs. Please check your browser storage settings.');
      // For admin persistence we handle Supabase writes inside handleSubmit /
      // handleDelete so this effect stays synchronous.

  } // ← close try/catch/useEffect body

  }, [faqs]);

  // Reset form fields
  const resetForm = useCallback(() => {
    setQuestion('');
    setAnswer('');
    setCategory('General');
    setOrderIndex('');
    setEditingId(null);
  }, []);

  // Handle form submission for adding/editing FAQs
  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);
    setSuccessMessage(null);

    try {
      // Validate inputs
      if (!question.trim() || !answer.trim()) {
        throw new Error('Question and answer are required.');
      }

      // Convert orderIndex to number or null
      const order_index = Number.isFinite(Number(orderIndex)) ? Number(orderIndex) : null;

      // Create or update FAQ
      if (isAdminUser) {
        /* --------------------------------------------------------
         * Admin branch – persist to Supabase first
         * ------------------------------------------------------ */
        if (editingId !== null) {
          // update
          const saved = await upsertFaqRow({
            id: editingId,
            question,
            answer,
            category,
            is_published: true,
            order_index,
          });
          setFaqs(prevFaqs =>
            prevFaqs.map(f =>
              f.id === editingId
                ? { 
                    ...f, 
                    question: saved.question, 
                    answer: saved.answer, 
                    category: saved.category || 'General',
                    order_index: saved.order_index,
                    updatedAt: saved.updated_at || new Date().toISOString() 
                  }
                : f,
            ),
          );
          setSuccessMessage('FAQ updated successfully!');
        } else {
          // add new
          const saved = await upsertFaqRow({
            question,
            answer,
            category,
            is_published: true,
            order_index,
          });
          const newFaq = {
            id: saved.id,
            question: saved.question,
            answer: saved.answer,
            category: saved.category || 'General',
            order_index: saved.order_index,
            createdAt: saved.created_at || new Date().toISOString(),
            updatedAt: saved.updated_at || new Date().toISOString(),
            isPublished: true,
          };
          setFaqs(prev => [...prev, newFaq]);
          setSuccessMessage('New FAQ added successfully!');
        }

        // refresh localStorage cache of published items
        try {
          localStorage.setItem(
            FAQ_STORAGE_KEY,
            JSON.stringify(
              (editingId
                ? faqs.map(f =>
                    f.id === editingId
                      ? { ...f, question, answer, category, order_index }
                      : f,
                  )
                : [...faqs, { 
                    id: editingId, 
                    question, 
                    answer, 
                    category, 
                    order_index, 
                    isPublished: true 
                  }]
              ).filter(f => f.isPublished !== false),
            ),
          );
        } catch {/* ignore quota */}
      } else if (editingId !== null) {
        // Update existing FAQ
        setFaqs(prevFaqs => 
          prevFaqs.map(faq => 
            faq.id === editingId 
              ? { 
                  ...faq, 
                  question, 
                  answer, 
                  category, 
                  order_index, 
                  updatedAt: new Date().toISOString() 
                } 
              : faq
          )
        );
        setSuccessMessage('FAQ updated successfully!');
      } else {
        // Add new FAQ
        const newFaq = {
          id: Date.now().toString(),
          question,
          answer,
          category,
          order_index,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
          isPublished: true
        };
        setFaqs(prevFaqs => [...prevFaqs, newFaq]);
        setSuccessMessage('New FAQ added successfully!');
      }

      // Reset form
      resetForm();
    } catch (err) {
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  };

  // Handle editing an FAQ
  const handleEdit = (faq) => {
    setQuestion(faq.question);
    setAnswer(faq.answer);
    setCategory(faq.category || 'General');
    setOrderIndex(faq.order_index !== null ? String(faq.order_index) : '');
    setEditingId(faq.id);
    
    // Scroll to form
    document.getElementById('faqForm').scrollIntoView({ behavior: 'smooth' });
  };

  // Handle deleting an FAQ
  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this FAQ? This action cannot be undone.')) {
      return;
    }

    setIsLoading(true);
    setError(null);
    setSuccessMessage(null);

    try {
      if (isAdminUser) {
        try {
          await deleteFaqRow(id);
        } catch (err) {
          console.error('[AdminFAQEditor] Supabase delete failed:', err);
          throw err;
        }
      }

      setFaqs(prevFaqs => prevFaqs.filter(faq => faq.id !== id));
      try {
        const published = faqs.filter((f) => f.id !== id && f.isPublished !== false);
        localStorage.setItem(FAQ_STORAGE_KEY, JSON.stringify(published));
      } catch {}
      setSuccessMessage('FAQ deleted successfully!');
    } catch (err) {
      setError('Failed to delete FAQ. Please try again.');
      console.error('Error deleting FAQ:', err);
    } finally {
      setIsLoading(false);
    }
  };

  // Handle toggling FAQ visibility
  const handleToggleVisibility = (id) => {
    setFaqs((prevFaqs) =>
      prevFaqs.map((faq) =>
        faq.id === id ? { ...faq, isPublished: !faq.isPublished } : faq,
      ),
    );

    const target = faqs.find((f) => f.id === id);
    if (!target) return;
    const nextPublished = !target.isPublished;

    (async () => {
      if (isAdminUser) {
        try {
          await upsertFaqRow({ id, is_published: nextPublished });
        } catch (err) {
          console.error('[AdminFAQEditor] Supabase toggle failed:', err);
        }
      }
      try {
        const published = faqs
          .map((f) =>
            f.id === id ? { ...f, isPublished: nextPublished } : f,
          )
          .filter((f) => f.isPublished !== false);
        localStorage.setItem(FAQ_STORAGE_KEY, JSON.stringify(published));
      } catch {}
    })();
  };

  // Sort FAQs by creation date (newest first)
  const sortedFaqs = [...faqs].sort((a, b) => 
    new Date(b.createdAt) - new Date(a.createdAt)
  );

  return (
    <div className="bg-white rounded-lg shadow-md p-6">
      <h2 className="text-2xl font-semibold text-gray-800 mb-6">FAQ Management</h2>
      
      {/* Status Messages */}
      {error && (
        <div className="mb-4 p-3 bg-red-100 text-red-700 rounded">
          Error: {error}
        </div>
      )}
      
      {successMessage && (
        <div className="mb-4 p-3 bg-green-100 text-green-700 rounded">
          Success: {successMessage}
        </div>
      )}
      
      {/* FAQ Form */}
      <form id="faqForm" onSubmit={handleSubmit} className="mb-8 bg-gray-50 p-4 rounded-lg border border-gray-200">
        <h3 className="text-xl font-medium text-gray-700 mb-4">
          {editingId ? 'Edit FAQ' : 'Add New FAQ'}
        </h3>
        
        <div className="mb-4">
          <label htmlFor="question" className="block text-sm font-medium text-gray-700 mb-1">
            Question
          </label>
          <input
            type="text"
            id="question"
            value={question}
            onChange={(e) => setQuestion(e.target.value)}
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500"
            placeholder="Enter the frequently asked question"
          />
        </div>
        
        <div className="mb-4">
          <label htmlFor="answer" className="block text-sm font-medium text-gray-700 mb-1">
            Answer
          </label>
          <textarea
            id="answer"
            value={answer}
            onChange={(e) => setAnswer(e.target.value)}
            rows={5}
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500"
            placeholder="Enter the answer to the question"
          />
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
          <div>
            <label htmlFor="category" className="block text-sm font-medium text-gray-700 mb-1">
              Category
            </label>
            <input
              type="text"
              id="category"
              value={category}
              onChange={(e) => setCategory(e.target.value)}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500"
              placeholder="General"
            />
          </div>
          
          <div>
            <label htmlFor="orderIndex" className="block text-sm font-medium text-gray-700 mb-1">
              Order Index (lower numbers appear first)
            </label>
            <input
              type="number"
              id="orderIndex"
              value={orderIndex}
              onChange={(e) => setOrderIndex(e.target.value)}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500"
              placeholder="Leave empty for default ordering"
            />
          </div>
        </div>
        
        <div className="flex space-x-4">
          <button
            type="submit"
            disabled={isLoading}
            className="px-4 py-2 bg-primary-600 text-white rounded-md hover:bg-primary-700 disabled:bg-gray-400"
          >
            {isLoading ? 'Saving...' : editingId ? 'Update FAQ' : 'Add FAQ'}
          </button>
          
          {editingId && (
            <button
              type="button"
              onClick={resetForm}
              className="px-4 py-2 bg-gray-200 text-gray-700 rounded-md hover:bg-gray-300"
            >
              Cancel
            </button>
          )}
        </div>
      </form>
      
      {/* FAQ List */}
      <div>
        {/* Toolbar */}
        <div className="mb-4 flex items-center gap-2">
          <h3 className="text-xl font-medium text-gray-700 flex-1">Existing FAQs</h3>
          {isAdminUser && (
            <button
              type="button"
              onClick={handleImportLocalToSupabase}
              className="px-3 py-1.5 text-sm bg-blue-600 text-white rounded hover:bg-blue-500"
            >
              Import localStorage → Supabase
            </button>
          )}
        </div>
        
        {sortedFaqs.length === 0 ? (
          <p className="text-gray-500 italic">No FAQs found. Add your first FAQ above.</p>
        ) : (
          <div className="space-y-4">
            {sortedFaqs.map((faq) => (
              <div 
                key={faq.id}
                className={`border rounded-lg p-4 transition-all ${
                  faq.isPublished ? 'bg-white border-gray-200' : 'bg-gray-50 border-gray-300'
                }`}
              >
                <div className="flex justify-between items-start mb-2">
                  <div>
                    <h4 className="text-lg font-medium text-gray-800">
                      {faq.question}
                      {!faq.isPublished && (
                        <span className="ml-2 text-xs bg-gray-200 text-gray-600 px-2 py-1 rounded-full">
                          Hidden
                        </span>
                      )}
                    </h4>
                    <div className="text-xs text-gray-500 mt-1">
                      Category: {faq.category || 'General'}
                      {faq.order_index !== null && (
                        <span className="ml-2">• Order: {faq.order_index}</span>
                      )}
                    </div>
                  </div>
                  
                  <div className="flex space-x-2">
                    <button
                      onClick={() => handleToggleVisibility(faq.id)}
                      className={`p-1 rounded ${
                        faq.isPublished
                          ? 'text-green-600 hover:bg-green-50'
                          : 'text-gray-400 hover:bg-gray-100'
                      }`}
                      title={faq.isPublished ? 'Hide FAQ' : 'Show FAQ'}
                    >
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                        {faq.isPublished ? (
                          <path d="M10 12a2 2 0 100-4 2 2 0 000 4z" />
                        ) : (
                          <path d="M13.875 7.5a1.125 1.125 0 10-2.25 0 1.125 1.125 0 002.25 0z" />
                        )}
                        <path fillRule="evenodd" d="M0 10s3-5.5 10-5.5 10 5.5 10 5.5-3 5.5-10 5.5S0 10 0 10zm10 3.5a3.5 3.5 0 100-7 3.5 3.5 0 000 7z" clipRule="evenodd" />
                      </svg>
                    </button>
                    
                    <button
                      onClick={() => handleEdit(faq)}
                      className="p-1 text-blue-600 hover:bg-blue-50 rounded"
                      title="Edit FAQ"
                    >
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                        <path d="M17.414 2.586a2 2 0 00-2.828 0L7 10.172V13h2.828l7.586-7.586a2 2 0 000-2.828z" />
                        <path fillRule="evenodd" d="M2 6a2 2 0 012-2h4a1 1 0 010 2H4v10h10v-4a1 1 0 112 0v4a2 2 0 01-2 2H4a2 2 0 01-2-2V6z" clipRule="evenodd" />
                      </svg>
                    </button>
                    
                    <button
                      onClick={() => handleDelete(faq.id)}
                      className="p-1 text-red-600 hover:bg-red-50 rounded"
                      title="Delete FAQ"
                    >
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                        <path fillRule="evenodd" d="M9 2a1 1 0 00-.894.553L7.382 4H4a1 1 0 000 2v10a2 2 0 002 2h8a2 2 0 002-2V6a1 1 0 100-2h-3.382l-.724-1.447A1 1 0 0011 2H9zM7 8a1 1 0 012 0v6a1 1 0 11-2 0V8zm5-1a1 1 0 00-1 1v6a1 1 0 102 0V8a1 1 0 00-1-1z" clipRule="evenodd" />
                      </svg>
                    </button>
                  </div>
                </div>
                
                <p className="text-gray-600 whitespace-pre-line">{faq.answer}</p>
                
                <div className="mt-2 text-xs text-gray-400">
                  Created: {new Date(faq.createdAt).toLocaleDateString()}
                  {faq.updatedAt !== faq.createdAt && (
                    <span className="ml-2">
                      • Updated: {new Date(faq.updatedAt).toLocaleDateString()}
                    </span>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );

  /* --------------------------------------------------------------
   * Import helper – pushes local FAQs into Supabase
   * ------------------------------------------------------------ */
  async function handleImportLocalToSupabase() {
    setIsLoading(true);
    setError(null);
    setSuccessMessage(null);
    try {
      const raw =
        localStorage.getItem(FAQ_STORAGE_KEY) || localStorage.getItem(LEGACY_KEY);
      if (!raw) throw new Error('No localStorage FAQs found.');
      const arr = JSON.parse(raw);
      if (!Array.isArray(arr) || arr.length === 0)
        throw new Error('Local FAQs list is empty.');

      let count = 0;
      for (const item of arr) {
        await upsertFaqRow({
          id: typeof item.id === 'string' && item.id.length > 0 ? item.id : undefined,
          question: item.question ?? '',
          answer: item.answer ?? '',
          category: item.category ?? 'General',
          is_published:
            item.is_published ?? item.isPublished ?? item.isVisible ?? true,
          order_index: item.order_index ?? null,
        });
        count++;
      }
      setSuccessMessage(`Imported ${count} FAQs to Supabase.`);

      // refresh list
      try {
        const rows = await listAllFaqs();
        const normalized = rows.map((r) => ({
          id: r.id,
          question: r.question,
          answer: r.answer,
          category: r.category || 'General',
          isPublished: r.is_published !== false,
          order_index: r.order_index ?? null,
          createdAt: r.created_at,
          updatedAt: r.updated_at,
        }));
        setFaqs(normalized);
        localStorage.setItem(
          FAQ_STORAGE_KEY,
          JSON.stringify(normalized.filter((f) => f.isPublished !== false)),
        );
      } catch {}
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Import failed.');
    } finally {
      setIsLoading(false);
    }
  }
};

export default AdminFAQEditor;
