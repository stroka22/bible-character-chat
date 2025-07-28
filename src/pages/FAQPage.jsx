import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import Header from '../components/Header';
import Footer from '../components/Footer';

/**
 * FAQPage Component
 * 
 * Displays frequently asked questions in an organized, expandable format.
 * Pulls data from the same source used by the admin FAQ editor.
 */
const FAQPage = () => {
  const [faqs, setFaqs] = useState([]);
  const [categories, setCategories] = useState([]);
  const [expandedQuestions, setExpandedQuestions] = useState({});
  const [expandedCategories, setExpandedCategories] = useState({});
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  // Load FAQs from localStorage (same source as admin editor)
  useEffect(() => {
    setIsLoading(true);
    try {
      // Get FAQs from localStorage
      const savedFaqs = localStorage.getItem('faqItems');
      
      if (savedFaqs) {
        const parsedFaqs = JSON.parse(savedFaqs);
        setFaqs(parsedFaqs);
        
        // Extract unique categories
        const uniqueCategories = [...new Set(parsedFaqs.map(faq => faq.category || 'General'))];
        setCategories(uniqueCategories);
        
        // Initialize all categories as expanded
        const initialExpandedCategories = {};
        uniqueCategories.forEach(category => {
          initialExpandedCategories[category] = true;
        });
        setExpandedCategories(initialExpandedCategories);
      } else {
        // If no FAQs in localStorage, use default FAQs from pricing page
        const defaultFaqs = [
          { 
            id: '1', 
            question: 'What is Bible Character Chat?', 
            answer: 'Bible Character Chat is an interactive platform that allows you to have conversations with AI representations of biblical figures. Our goal is to make Bible study more engaging and personal.',
            category: 'General',
            isVisible: true 
          },
          { 
            id: '2', 
            question: 'How accurate are the character responses?', 
            answer: 'Our AI characters are designed to respond based on biblical accounts, historical context, and theological understanding. While we strive for accuracy, the conversations are meant to be educational and inspirational rather than definitive theological statements.',
            category: 'General',
            isVisible: true 
          },
          { 
            id: '3', 
            question: 'What\'s included in the premium subscription?', 
            answer: 'Premium subscribers get unlimited messages with all biblical characters, no advertisements, priority support, and access to exclusive characters not available to free users.',
            category: 'Pricing',
            isVisible: true 
          },
          { 
            id: '4', 
            question: 'Can I cancel my subscription anytime?', 
            answer: 'Yes, you can cancel your subscription at any time. Your premium access will continue until the end of your current billing period.',
            category: 'Pricing',
            isVisible: true 
          },
          { 
            id: '5', 
            question: 'How do I save my conversations?', 
            answer: 'All conversations are automatically saved to your account. You can access them anytime from the "My Conversations" page when you\'re logged in.',
            category: 'Usage',
            isVisible: true 
          }
        ];
        
        setFaqs(defaultFaqs);
        
        // Extract unique categories from default FAQs
        const uniqueCategories = [...new Set(defaultFaqs.map(faq => faq.category || 'General'))];
        setCategories(uniqueCategories);
        
        // Initialize all categories as expanded
        const initialExpandedCategories = {};
        uniqueCategories.forEach(category => {
          initialExpandedCategories[category] = true;
        });
        setExpandedCategories(initialExpandedCategories);
      }
    } catch (err) {
      console.error('Error loading FAQs:', err);
      setError('Failed to load FAQ content. Please try again later.');
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Toggle a question's expanded state
  const toggleQuestion = (id) => {
    setExpandedQuestions(prev => ({
      ...prev,
      [id]: !prev[id]
    }));
  };

  // Toggle a category's expanded state
  const toggleCategory = (category) => {
    setExpandedCategories(prev => ({
      ...prev,
      [category]: !prev[category]
    }));
  };

  // Filter FAQs by visibility
  const visibleFaqs = faqs.filter(faq => faq.isVisible !== false);

  // Group FAQs by category
  const faqsByCategory = categories.reduce((acc, category) => {
    acc[category] = visibleFaqs.filter(faq => (faq.category || 'General') === category);
    return acc;
  }, {});

  return (
    <div className="min-h-screen bg-blue-900 text-white">
      <Header />
      <div className="container mx-auto px-4 py-8 pt-24">
        <div className="max-w-4xl mx-auto">
          <div className="flex items-center justify-between mb-8">
            <h1 className="text-3xl font-bold text-yellow-300">Frequently Asked Questions</h1>
            <Link
              to="/"
              className="px-4 py-2 bg-blue-800 text-white rounded-lg font-medium hover:bg-blue-700 transition-colors"
            >
              Back to Home
            </Link>
          </div>

          {/* Loading state */}
          {isLoading && (
            <div className="flex justify-center my-12">
              <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-yellow-400" />
            </div>
          )}

          {/* Error message */}
          {error && (
            <div className="bg-red-900/50 border border-red-500 rounded-lg p-4 mb-6">
              <p className="text-red-200">{error}</p>
            </div>
          )}

          {/* No FAQs message */}
          {!isLoading && !error && visibleFaqs.length === 0 && (
            <div className="bg-[rgba(255,255,255,0.05)] rounded-lg p-8 text-center">
              <h3 className="text-xl font-semibold text-yellow-300 mb-4">
                No FAQs Available
              </h3>
              <p className="text-blue-100 mb-6">
                Check back later for frequently asked questions and answers.
              </p>
            </div>
          )}

          {/* FAQ Categories and Questions */}
          {!isLoading && !error && categories.map(category => (
            <div 
              key={category} 
              className="mb-8 bg-blue-800/50 rounded-lg overflow-hidden shadow-lg"
            >
              {/* Category Header */}
              <button
                onClick={() => toggleCategory(category)}
                className="w-full px-6 py-4 flex justify-between items-center bg-blue-800 hover:bg-blue-700 transition-colors"
              >
                <h2 className="text-xl font-semibold text-yellow-300">{category}</h2>
                <svg 
                  xmlns="http://www.w3.org/2000/svg" 
                  className={`h-5 w-5 text-yellow-300 transition-transform duration-300 ${expandedCategories[category] ? 'rotate-180' : ''}`} 
                  viewBox="0 0 20 20" 
                  fill="currentColor"
                >
                  <path 
                    fillRule="evenodd" 
                    d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" 
                    clipRule="evenodd" 
                  />
                </svg>
              </button>

              {/* Questions in this category */}
              {expandedCategories[category] && (
                <div className="px-6 py-2">
                  {faqsByCategory[category].length === 0 ? (
                    <p className="text-blue-200 py-4 italic">No questions in this category</p>
                  ) : (
                    <div className="divide-y divide-blue-700/50">
                      {faqsByCategory[category].map(faq => (
                        <div key={faq.id} className="py-4">
                          <button
                            onClick={() => toggleQuestion(faq.id)}
                            className="w-full flex justify-between items-start text-left"
                          >
                            <h3 className="text-lg font-medium text-white pr-8">{faq.question}</h3>
                            <svg 
                              xmlns="http://www.w3.org/2000/svg" 
                              className={`h-5 w-5 text-yellow-300 mt-1 flex-shrink-0 transition-transform duration-300 ${expandedQuestions[faq.id] ? 'rotate-180' : ''}`}
                              viewBox="0 0 20 20" 
                              fill="currentColor"
                            >
                              <path 
                                fillRule="evenodd" 
                                d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" 
                                clipRule="evenodd" 
                              />
                            </svg>
                          </button>
                          
                          {/* Answer (collapsible) */}
                          {expandedQuestions[faq.id] && (
                            <div className="mt-3 text-blue-100 bg-blue-800/30 p-4 rounded-lg">
                              <p className="whitespace-pre-line">{faq.answer}</p>
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}
            </div>
          ))}

          {/* Contact section */}
          <div className="mt-12 bg-blue-800/30 rounded-lg p-6 text-center">
            <h2 className="text-xl font-semibold text-yellow-300 mb-4">
              Still have questions?
            </h2>
            <p className="text-blue-100 mb-6">
              If you couldn't find the answer you were looking for, feel free to reach out to our support team.
            </p>
            <Link
              to="/contact"
              className="px-6 py-3 bg-yellow-400 text-blue-900 rounded-lg font-semibold hover:bg-yellow-300 transition-colors inline-block"
            >
              Contact Us
            </Link>
          </div>
        </div>
      </div>
      <Footer />
    </div>
  );
};

export default FAQPage;
