import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import Header from '../components/Header';
import Footer from '../components/Footer';
import { listPublishedFaqs } from '../services/faqs';

/**
 * FAQPage Component
 * 
 * Displays frequently asked questions in an organized, expandable format.
 * Merges default FAQs with database FAQs - defaults take priority for matching questions.
 */
const FAQPage = () => {
  const [faqs, setFaqs] = useState([]);
  const [categories, setCategories] = useState([]);
  const [expandedQuestions, setExpandedQuestions] = useState({});
  const [expandedCategories, setExpandedCategories] = useState({});
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  // Default FAQs - always included, merged with database FAQs
  const defaultFaqs = [
    // General
    { id: 'default-1', category: 'General', question: 'What is FaithTalkAI?', answer: 'FaithTalkAI is an AI-powered platform that lets you have meaningful conversations with Biblical characters, explore guided Bible studies and reading plans, and participate in roundtable discussions with multiple characters at once.', isVisible: true },
    { id: 'default-2', category: 'General', question: 'Is this a replacement for Bible study?', answer: 'No. FaithTalkAI is designed to supplement your faith journey, not replace traditional Bible study, church attendance, or pastoral counsel. Think of it as a companion tool to help you engage with Scripture in a new and interactive way.', isVisible: true },
    { id: 'default-3', category: 'General', question: 'How accurate are the character responses?', answer: 'Our AI characters are trained on Biblical scripture and historical context to provide thoughtful, scripturally-grounded responses. However, they are AI interpretations and should not be considered authoritative theological sources. Always refer to Scripture and trusted spiritual leaders for guidance.', isVisible: true },
    
    // Features
    { id: 'default-4', category: 'Features', question: 'How many characters can I chat with?', answer: 'We have over 50 Biblical characters available, including figures from both the Old and New Testaments such as Moses, David, Paul, Mary, and many more.', isVisible: true },
    { id: 'default-5', category: 'Features', question: 'What is a Roundtable discussion?', answer: 'A Roundtable brings multiple Biblical characters together to discuss a topic from their unique perspectives. You can select 2-5 characters and watch them engage with each other and with you on topics like faith, forgiveness, leadership, and more.', isVisible: true },
    { id: 'default-6', category: 'Features', question: 'What are Bible Studies?', answer: 'Our guided Bible Studies are multi-lesson journeys through Scripture with AI-powered conversation. Each lesson includes a reading passage, discussion questions, and the ability to chat with a relevant Biblical character about what you\'re learning.', isVisible: true },
    { id: 'default-7', category: 'Features', question: 'What are Reading Plans?', answer: 'Reading Plans help you establish a daily Bible reading habit. Choose from various plans covering topics like foundational readings, book studies, topical studies, and more. Track your progress and pick up where you left off.', isVisible: true },
    { id: 'default-8', category: 'Features', question: 'What is My Walk?', answer: 'My Walk is your personal dashboard (Premium feature) where you can view all your saved conversations, continue past chats, track your Bible study and reading plan progress, and see your spiritual journey at a glance.', isVisible: true },
    
    // Account & Pricing
    { id: 'default-9', category: 'Account & Pricing', question: 'What\'s included in the free plan?', answer: 'Free accounts get unlimited conversations with all characters. However, you won\'t be able to access your conversation history later or use premium features like My Walk, Roundtables, and Invite Friends.', isVisible: true },
    { id: 'default-10', category: 'Account & Pricing', question: 'What does Premium include?', answer: 'Premium ($5.99/month or $59.99/year) unlocks My Walk dashboard to access all your saved conversations, Roundtable discussions with multiple characters, the ability to invite friends to conversations, and priority support.', isVisible: true },
    { id: 'default-11', category: 'Account & Pricing', question: 'How do I upgrade to Premium?', answer: 'Tap the "Upgrade" button in the app or visit our Pricing page. You can subscribe monthly or yearly through the App Store (iOS) or directly through our website.', isVisible: true },
    { id: 'default-12', category: 'Account & Pricing', question: 'Can I cancel my subscription?', answer: 'Yes, you can cancel anytime. For iOS subscriptions, manage them in your Apple ID settings. For web subscriptions, visit your account settings. You\'ll retain Premium access until the end of your billing period.', isVisible: true },
    
    // Technical
    { id: 'default-13', category: 'Technical', question: 'Is my data private?', answer: 'Yes. Your conversations are private and stored securely. We do not share your personal conversations with third parties. See our Privacy Policy for full details.', isVisible: true },
    { id: 'default-14', category: 'Technical', question: 'Can I use FaithTalkAI on multiple devices?', answer: 'Yes! Sign in with the same account on any device - iOS app or web browser - and your account and Premium status will sync across all devices.', isVisible: true },
    { id: 'default-15', category: 'Technical', question: 'What if I encounter a problem?', answer: 'Contact us at support@FaithTalkAI.com and we\'ll help you resolve any issues. You can also use the Contact form on our website.', isVisible: true },
  ];

  useEffect(() => {
    setIsLoading(true);
    (async () => {
      try {
        const dbData = await listPublishedFaqs();
        
        // Merge: defaults take priority, db FAQs with non-matching questions are added
        const normalizeQuestion = (q) => q.toLowerCase().replace(/[^a-z0-9]/g, '');
        const defaultQuestions = new Set(defaultFaqs.map(f => normalizeQuestion(f.question)));
        
        // Filter out db FAQs that match default questions (defaults win)
        const uniqueDbFaqs = (dbData || []).filter(
          dbFaq => !defaultQuestions.has(normalizeQuestion(dbFaq.question))
        );
        
        // Combine: defaults first, then unique db FAQs
        const mergedFaqs = [...defaultFaqs, ...uniqueDbFaqs];
        
        setFaqs(mergedFaqs);
        
        // Build categories with our preferred order
        const uniqueCats = [...new Set(mergedFaqs.map(f => f.category || 'General'))];
        const orderedCats = ['General', 'Features', 'Account & Pricing', 'Technical'];
        const otherCats = uniqueCats.filter(c => !orderedCats.includes(c));
        const finalCats = [...orderedCats.filter(c => uniqueCats.includes(c)), ...otherCats];
        setCategories(finalCats);
        
        // Initialize all categories as expanded
        const initCat = {};
        finalCats.forEach(c => (initCat[c] = true));
        setExpandedCategories(initCat);
      } catch (err) {
        console.error('Error loading FAQs:', err);
        // On error, just use defaults
        setFaqs(defaultFaqs);
        const defaultCats = ['General', 'Features', 'Account & Pricing', 'Technical'];
        setCategories(defaultCats);
        const initCat = {};
        defaultCats.forEach(c => (initCat[c] = true));
        setExpandedCategories(initCat);
      } finally {
        setIsLoading(false);
      }
    })();
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
  const visibleFaqs = faqs.filter(
    faq => faq.isVisible !== false && faq.isPublished !== false,
  );

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
