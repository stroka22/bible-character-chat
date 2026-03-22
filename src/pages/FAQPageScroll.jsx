import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { listPublishedFaqs } from '../services/faqs';
import FooterScroll from '../components/FooterScroll';
import PreviewLayout from '../components/PreviewLayout';
import { ScrollWrap, ScrollDivider, ScrollBackground } from '../components/ScrollWrap';

const FAQPageScroll = () => {
  const [faqs, setFaqs] = useState([]);
  const [categories, setCategories] = useState([]);
  const [expandedQuestions, setExpandedQuestions] = useState({});
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const loadFaqs = async () => {
      try {
        const data = await listPublishedFaqs();
        if (Array.isArray(data) && data.length > 0) {
          setFaqs(data);
          const uniqueCats = [...new Set(data.map(f => f.category || 'General'))];
          setCategories(uniqueCats);
        } else {
          // Default FAQs
          const defaults = [
            // General
            { id: 1, category: 'General', question: 'What is FaithTalkAI?', answer: 'FaithTalkAI is an AI-powered platform that lets you have meaningful conversations with Biblical characters, explore guided Bible studies and reading plans, and participate in roundtable discussions with multiple characters at once.' },
            { id: 2, category: 'General', question: 'Is this a replacement for Bible study?', answer: 'No. FaithTalkAI is designed to supplement your faith journey, not replace traditional Bible study, church attendance, or pastoral counsel. Think of it as a companion tool to help you engage with Scripture in a new and interactive way.' },
            { id: 3, category: 'General', question: 'How accurate are the character responses?', answer: 'Our AI characters are trained on Biblical scripture and historical context to provide thoughtful, scripturally-grounded responses. However, they are AI interpretations and should not be considered authoritative theological sources. Always refer to Scripture and trusted spiritual leaders for guidance.' },
            
            // Features
            { id: 4, category: 'Features', question: 'How many characters can I chat with?', answer: 'We have over 50 Biblical characters available, including figures from both the Old and New Testaments such as Moses, David, Paul, Mary, and many more.' },
            { id: 5, category: 'Features', question: 'What is a Roundtable discussion?', answer: 'A Roundtable brings multiple Biblical characters together to discuss a topic from their unique perspectives. You can select 2-5 characters and watch them engage with each other and with you on topics like faith, forgiveness, leadership, and more.' },
            { id: 6, category: 'Features', question: 'What are Bible Studies?', answer: 'Our guided Bible Studies are multi-lesson journeys through Scripture with AI-powered conversation. Each lesson includes a reading passage, discussion questions, and the ability to chat with a relevant Biblical character about what you\'re learning.' },
            { id: 7, category: 'Features', question: 'What are Reading Plans?', answer: 'Reading Plans help you establish a daily Bible reading habit. Choose from various plans covering topics like foundational readings, book studies, topical studies, and more. Track your progress and pick up where you left off.' },
            { id: 8, category: 'Features', question: 'What is My Walk?', answer: 'My Walk is your personal dashboard (Premium feature) where you can view all your saved conversations, continue past chats, track your Bible study and reading plan progress, and see your spiritual journey at a glance.' },
            
            // Account & Pricing
            { id: 9, category: 'Account & Pricing', question: 'What\'s included in the free plan?', answer: 'Free accounts get unlimited conversations with all characters. However, you won\'t be able to access your conversation history later or use premium features like My Walk, Roundtables, and Invite Friends.' },
            { id: 10, category: 'Account & Pricing', question: 'What does Premium include?', answer: 'Premium ($5.99/month or $59.99/year) unlocks My Walk dashboard to access all your saved conversations, Roundtable discussions with multiple characters, the ability to invite friends to conversations, and priority support.' },
            { id: 11, category: 'Account & Pricing', question: 'How do I upgrade to Premium?', answer: 'Tap the "Upgrade" button in the app or visit our Pricing page. You can subscribe monthly or yearly through the App Store (iOS) or directly through our website.' },
            { id: 12, category: 'Account & Pricing', question: 'Can I cancel my subscription?', answer: 'Yes, you can cancel anytime. For iOS subscriptions, manage them in your Apple ID settings. For web subscriptions, visit your account settings. You\'ll retain Premium access until the end of your billing period.' },
            
            // Technical
            { id: 13, category: 'Technical', question: 'Is my data private?', answer: 'Yes. Your conversations are private and stored securely. We do not share your personal conversations with third parties. See our Privacy Policy for full details.' },
            { id: 14, category: 'Technical', question: 'Can I use FaithTalkAI on multiple devices?', answer: 'Yes! Sign in with the same account on any device - iOS app or web browser - and your account and Premium status will sync across all devices.' },
            { id: 15, category: 'Technical', question: 'What if I encounter a problem?', answer: 'Contact us at support@FaithTalkAI.com and we\'ll help you resolve any issues. You can also use the Contact form on our website.' },
          ];
          setFaqs(defaults);
          setCategories(['General', 'Features', 'Account & Pricing', 'Technical']);
        }
      } catch (err) {
        console.error('Failed to load FAQs:', err);
      } finally {
        setIsLoading(false);
      }
    };
    loadFaqs();
  }, []);

  const toggleQuestion = (id) => {
    setExpandedQuestions(prev => ({ ...prev, [id]: !prev[id] }));
  };

  return (
    <PreviewLayout>
      <ScrollBackground className="min-h-screen py-12 px-4">
        <ScrollWrap className="max-w-4xl mx-auto">
          <div className="text-center mb-10">
            <h1 className="text-4xl font-bold text-amber-900 mb-4" style={{ fontFamily: 'Cinzel, serif' }}>
              Frequently Asked Questions
            </h1>
            <p className="text-amber-700 text-lg">Find answers to common questions about FaithTalkAI</p>
          </div>

          <ScrollDivider />

          {isLoading ? (
            <div className="text-center py-12">
              <div className="inline-block w-12 h-12 border-4 border-amber-300 border-t-amber-600 rounded-full animate-spin" />
              <p className="mt-4 text-amber-700">Loading FAQs...</p>
            </div>
          ) : (
            <div className="space-y-8 mt-8">
              {categories.map(category => {
                const categoryFaqs = faqs.filter(f => (f.category || 'General') === category);
                if (categoryFaqs.length === 0) return null;
                
                return (
                  <section key={category}>
                    <h2 className="text-2xl font-bold text-amber-800 mb-4" style={{ fontFamily: 'Cinzel, serif' }}>{category}</h2>
                    <div className="space-y-3">
                      {categoryFaqs.map(faq => (
                        <div key={faq.id} className="bg-white/80 rounded-xl border border-amber-200 overflow-hidden">
                          <button
                            onClick={() => toggleQuestion(faq.id)}
                            className="w-full px-5 py-4 text-left flex items-center justify-between hover:bg-amber-50 transition-colors"
                          >
                            <span className="font-medium text-amber-900" style={{ fontFamily: 'Georgia, serif' }}>{faq.question}</span>
                            <svg className={`w-5 h-5 text-amber-600 transform transition-transform ${expandedQuestions[faq.id] ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                            </svg>
                          </button>
                          {expandedQuestions[faq.id] && (
                            <div className="px-5 pb-4 text-amber-800" style={{ fontFamily: 'Georgia, serif' }}>
                              {faq.answer}
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                  </section>
                );
              })}
            </div>
          )}

          <div className="mt-12 text-center bg-amber-100/50 rounded-xl p-6 border border-amber-200">
            <h3 className="text-xl font-bold text-amber-900 mb-2" style={{ fontFamily: 'Cinzel, serif' }}>Still have questions?</h3>
            <p className="text-amber-700 mb-4">We're here to help!</p>
            <Link to="/contact" className="px-6 py-3 bg-amber-600 text-white rounded-lg font-medium hover:bg-amber-700">Contact Us</Link>
          </div>

          <div className="mt-8 text-center">
            <Link to="/" className="text-amber-600 hover:text-amber-800 text-sm">← Back to Home</Link>
          </div>
        </ScrollWrap>
      </ScrollBackground>
      <FooterScroll />
    </PreviewLayout>
  );
};

export default FAQPageScroll;
