import React, { useState, useEffect, useCallback } from 'react';

/**
 * AdminFAQEditor Component
 * 
 * Allows administrators to manage FAQ entries with the following features:
 * - Add new FAQ entries
 * - Edit existing FAQ entries
 * - Delete FAQ entries
 * - View all FAQ entries
 * - Persistence through localStorage
 */
const AdminFAQEditor = () => {
  // State for the list of FAQs
  const [faqs, setFaqs] = useState([]);
  
  // Form state
  const [question, setQuestion] = useState('');
  const [answer, setAnswer] = useState('');
  const [editingId, setEditingId] = useState(null);
  
  // UI state
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const [successMessage, setSuccessMessage] = useState(null);

  // Load FAQs from localStorage on component mount
  useEffect(() => {
    try {
      const savedFaqs = localStorage.getItem('faithTalkAI_faqs');
      if (savedFaqs) {
        setFaqs(JSON.parse(savedFaqs));
      }
    } catch (err) {
      console.error('Error loading FAQs from localStorage:', err);
      setError('Failed to load saved FAQs. Please try refreshing the page.');
    }
  }, []);

  // Save FAQs to localStorage whenever they change
  useEffect(() => {
    try {
      localStorage.setItem('faithTalkAI_faqs', JSON.stringify(faqs));
    } catch (err) {
      console.error('Error saving FAQs to localStorage:', err);
      setError('Failed to save FAQs. Please check your browser storage settings.');
    }
  }, [faqs]);

  // Reset form fields
  const resetForm = useCallback(() => {
    setQuestion('');
    setAnswer('');
    setEditingId(null);
  }, []);

  // Handle form submission for adding/editing FAQs
  const handleSubmit = (e) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);
    setSuccessMessage(null);

    try {
      // Validate inputs
      if (!question.trim() || !answer.trim()) {
        throw new Error('Question and answer are required.');
      }

      // Create or update FAQ
      if (editingId !== null) {
        // Update existing FAQ
        setFaqs(prevFaqs => 
          prevFaqs.map(faq => 
            faq.id === editingId 
              ? { ...faq, question, answer, updatedAt: new Date().toISOString() } 
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
    setEditingId(faq.id);
    
    // Scroll to form
    document.getElementById('faqForm').scrollIntoView({ behavior: 'smooth' });
  };

  // Handle deleting an FAQ
  const handleDelete = (id) => {
    if (!window.confirm('Are you sure you want to delete this FAQ? This action cannot be undone.')) {
      return;
    }

    setIsLoading(true);
    setError(null);
    setSuccessMessage(null);

    try {
      setFaqs(prevFaqs => prevFaqs.filter(faq => faq.id !== id));
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
    setFaqs(prevFaqs => 
      prevFaqs.map(faq => 
        faq.id === id 
          ? { ...faq, isPublished: !faq.isPublished } 
          : faq
      )
    );
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
        <h3 className="text-xl font-medium text-gray-700 mb-4">Existing FAQs</h3>
        
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
                  <h4 className="text-lg font-medium text-gray-800">
                    {faq.question}
                    {!faq.isPublished && (
                      <span className="ml-2 text-xs bg-gray-200 text-gray-600 px-2 py-1 rounded-full">
                        Hidden
                      </span>
                    )}
                  </h4>
                  
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
};

export default AdminFAQEditor;
