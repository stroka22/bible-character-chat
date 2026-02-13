import React from 'react';
import { Link } from 'react-router-dom';
import FooterScroll from '../components/FooterScroll';
import PreviewLayout from '../components/PreviewLayout';
import { ScrollWrap, ScrollDivider, ScrollBackground } from '../components/ScrollWrap';

const PrivacyPageScroll = () => {
  const sections = [
    {
      title: '1. Information We Collect',
      content: `We collect information you provide directly to us, such as when you create an account, use our services, or contact us for support.

This may include:
• Account information (email, name, password)
• Conversation data with AI characters
• Usage data and preferences
• Payment information (processed securely by Stripe)`
    },
    {
      title: '2. How We Use Your Information',
      content: `We use the information we collect to:
• Provide, maintain, and improve our services
• Process transactions and send related information
• Send you technical notices and support messages
• Respond to your comments and questions
• Personalize your experience on our platform`
    },
    {
      title: '3. AI Service and Data Sharing',
      content: `FaithTalkAI uses artificial intelligence to create conversations with biblical characters. When you send a message in a chat or roundtable discussion:

Data Sent to Third Parties:
• Your message text
• Recent conversation history (for context)
• Character persona information (to maintain character voice)

Third-Party AI Provider:
Your messages are processed by OpenAI, a third-party AI service provider based in San Francisco, CA. OpenAI processes data according to their API data usage policies. Learn more at openai.com/policies.

Data Protection:
• All data is transmitted over encrypted connections (TLS)
• We do not sell your personal data to any third party
• Conversations are stored securely in your account
• You can delete your conversation history at any time from your profile

By using the chat features, you consent to this data processing. The app will ask for your explicit consent before your first AI interaction.`
    },
    {
      title: '4. Information Sharing',
      content: `We do not sell your personal information. We may share your information only in the following circumstances:
• With your consent
• With OpenAI for AI-powered chat features (as described above)
• To comply with legal obligations
• To protect our rights and safety
• With service providers who assist our operations (e.g., Stripe for payments, Supabase for data storage)`
    },
    {
      title: '5. Data Security',
      content: `We take reasonable measures to help protect your personal information from loss, theft, misuse, unauthorized access, disclosure, alteration, and destruction.

Your data is encrypted in transit and at rest. We use industry-standard security protocols to protect your information.`
    },
    {
      title: '6. Your Rights',
      content: `You have the right to:
• Access your personal data
• Correct inaccurate data
• Request deletion of your data
• Export your data
• Opt out of marketing communications
• Withdraw consent for AI data processing

To exercise these rights, please contact us at support@faithtalkai.com.`
    },
    {
      title: '7. Cookies and Tracking',
      content: `We use cookies and similar technologies to:
• Keep you logged in
• Remember your preferences
• Store your AI data consent choice
• Understand how you use our service
• Improve our platform

You can control cookies through your browser settings.`
    },
    {
      title: '8. Children\'s Privacy',
      content: `Our service is not intended for children under 13. We do not knowingly collect personal information from children under 13.

If you believe we have collected information from a child under 13, please contact us immediately.`
    },
    {
      title: '9. Changes to This Policy',
      content: `We may update this privacy policy from time to time. We will notify you of any changes by posting the new policy on this page and updating the "Last updated" date.`
    },
  ];

  return (
    <PreviewLayout>
      <ScrollBackground className="min-h-screen py-12 px-4">
        <ScrollWrap className="max-w-3xl mx-auto">
          <div className="text-center mb-10">
            <h1 className="text-4xl font-bold text-amber-900 mb-4" style={{ fontFamily: 'Cinzel, serif' }}>
              Privacy Policy
            </h1>
            <p className="text-amber-600 text-sm">Last updated: February 2026</p>
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
            <p className="text-amber-700 mb-4">Questions about your privacy?</p>
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

export default PrivacyPageScroll;
