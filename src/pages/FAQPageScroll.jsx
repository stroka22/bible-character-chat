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
            { id: 1, category: 'General', question: 'What is FaithTalkAI?', answer: 'FaithTalkAI is an AI-powered platform that allows you to have meaningful conversations with Biblical characters, explore guided Bible studies, and participate in roundtable discussions.' },
            { id: 2, category: 'General', question: 'Is this a replacement for Bible study?', answer: 'No. FaithTalkAI is designed to supplement your faith journey, not replace traditional Bible study, church attendance, or pastoral counsel.' },
            { id: 3, category: 'Features', question: 'How many characters can I chat with?', answer: 'We have over 30 Biblical characters available, including figures from both the Old and New Testaments.' },
            { id: 4, category: 'Features', question: 'What is a Roundtable discussion?', answer: 'A Roundtable brings multiple Biblical characters together to discuss a topic from their unique perspectives.' },
            { id: 5, category: 'Account', question: 'Is there a free plan?', answer: 'Yes! Our free plan includes access to many characters, limited saved conversations, and basic features.' },
            { id: 6, category: 'Account', question: 'How do I upgrade to Premium?', answer: 'Visit our Pricing page to see subscription options and upgrade your account.' },
          ];
          setFaqs(defaults);
          setCategories(['General', 'Features', 'Account']);
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
            <Link to="/contact/preview" className="px-6 py-3 bg-amber-600 text-white rounded-lg font-medium hover:bg-amber-700">Contact Us</Link>
          </div>

          <div className="mt-8 text-center">
            <Link to="/preview" className="text-amber-600 hover:text-amber-800 text-sm">← Back to Home</Link>
          </div>
        </ScrollWrap>
      </ScrollBackground>
      <FooterScroll />
    </PreviewLayout>
  );
};

export default FAQPageScroll;
