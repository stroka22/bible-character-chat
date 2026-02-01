import React from 'react';
import { Link } from 'react-router-dom';
import FooterScroll from '../components/FooterScroll';
import PreviewLayout from '../components/PreviewLayout';
import { ScrollWrap, ScrollDivider, ScrollBackground } from '../components/ScrollWrap';

const CookiePolicyPageScroll = () => {
  const sections = [
    {
      title: 'What Are Cookies?',
      content: `Cookies are small text files that are stored on your device when you visit a website. They help websites remember your preferences and improve your browsing experience.`
    },
    {
      title: 'How We Use Cookies',
      content: `FaithTalkAI uses cookies for the following purposes:

Essential Cookies: Required for the website to function properly. These cookies enable core functionality such as security, authentication, and accessibility.

Preference Cookies: Allow us to remember your settings and preferences, such as theme choice and language.

Analytics Cookies: Help us understand how visitors interact with our website by collecting anonymous information.`
    },
    {
      title: 'Types of Cookies We Use',
      content: `Session Cookies: Temporary cookies that are deleted when you close your browser.

Persistent Cookies: Remain on your device for a set period or until you delete them.

First-Party Cookies: Set by FaithTalkAI directly.

Third-Party Cookies: Set by our service providers (e.g., analytics, payment processing).`
    },
    {
      title: 'Cookie List',
      content: `• Authentication: Keeps you logged into your account
• Preferences: Stores your theme and display preferences
• Analytics: Helps us improve our service (anonymized)
• Security: Protects against fraud and abuse`
    },
    {
      title: 'Managing Cookies',
      content: `You can control cookies through your browser settings. Most browsers allow you to:
• View what cookies are stored
• Delete individual or all cookies
• Block cookies from specific sites
• Block all cookies

Note: Blocking essential cookies may affect website functionality.`
    },
    {
      title: 'Changes to This Policy',
      content: `We may update this Cookie Policy from time to time. Any changes will be posted on this page with an updated revision date.`
    },
  ];

  return (
    <PreviewLayout>
      <ScrollBackground className="min-h-screen py-12 px-4">
        <ScrollWrap className="max-w-3xl mx-auto">
          <div className="text-center mb-10">
            <h1 className="text-4xl font-bold text-amber-900 mb-4" style={{ fontFamily: 'Cinzel, serif' }}>
              Cookie Policy
            </h1>
            <p className="text-amber-600 text-sm">Last updated: January 2025</p>
          </div>

          <ScrollDivider />

          <div className="space-y-6 mt-8">
            {sections.map((section, i) => (
              <section key={i} className="bg-white/80 rounded-xl border border-amber-200 p-6">
                <h2 className="text-xl font-bold text-amber-800 mb-3" style={{ fontFamily: 'Cinzel, serif' }}>{section.title}</h2>
                <div className="text-amber-800 whitespace-pre-line" style={{ fontFamily: 'Georgia, serif' }}>{section.content}</div>
              </section>
            ))}
          </div>

          <div className="mt-10 text-center">
            <p className="text-amber-700 mb-4">Questions about cookies?</p>
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

export default CookiePolicyPageScroll;
