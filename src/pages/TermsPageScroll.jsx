import React from 'react';
import { Link } from 'react-router-dom';
import FooterScroll from '../components/FooterScroll';
import PreviewLayout from '../components/PreviewLayout';
import { ScrollWrap, ScrollDivider, ScrollBackground } from '../components/ScrollWrap';

const TermsPageScroll = () => {
  const sections = [
    {
      title: '1. Introduction',
      content: `Welcome to FaithTalkAI. By accessing or using our service, you agree to be bound by these Terms of Service. Please read these terms carefully before using our platform.

If you do not agree with any part of these terms, you may not access or use our service.`
    },
    {
      title: '2. User Accounts',
      content: `When you create an account with us, you must provide accurate, complete, and current information. You are responsible for safeguarding the password and for all activities that occur under your account.

You agree to notify us immediately of any unauthorized use of your account or any other breach of security. We cannot and will not be liable for any loss or damage arising from your failure to comply with this section.`
    },
    {
      title: '3. Acceptable Use',
      content: `You agree not to use FaithTalkAI for any purpose that is unlawful or prohibited by these Terms. You may not use the service in any manner that could damage, disable, overburden, or impair the service.

FaithTalkAI is intended for personal, non-commercial use. Any use of the service for commercial purposes without our express written permission is strictly prohibited.`
    },
    {
      title: '4. Intellectual Property',
      content: `The service and its original content, features, and functionality are and will remain the exclusive property of FaithTalkAI and its licensors. The service is protected by copyright, trademark, and other laws.

Our trademarks and trade dress may not be used in connection with any product or service without the prior written consent of FaithTalkAI.`
    },
    {
      title: '5. Limitation of Liability',
      content: `In no event shall FaithTalkAI, nor its directors, employees, partners, agents, suppliers, or affiliates, be liable for any indirect, incidental, special, consequential or punitive damages.

FaithTalkAI does not warrant that the service will be uninterrupted or error-free, that defects will be corrected, or that the service is free of viruses or other harmful components.`
    },
    {
      title: '6. AI-Generated Content Disclaimer',
      content: `FaithTalkAI uses artificial intelligence to generate conversations with Biblical characters. This content is for educational and devotional purposes only.

AI-generated responses should not be considered a substitute for Scripture, pastoral counsel, or professional advice. Users should verify any information with authoritative sources.`
    },
    {
      title: '7. Changes to Terms',
      content: `We reserve the right to modify or replace these Terms at any time. If a revision is material, we will try to provide at least 30 days' notice prior to any new terms taking effect.

By continuing to access or use our service after those revisions become effective, you agree to be bound by the revised terms.`
    },
  ];

  return (
    <PreviewLayout>
      <ScrollBackground className="min-h-screen py-12 px-4">
        <ScrollWrap className="max-w-3xl mx-auto">
          <div className="text-center mb-10">
            <h1 className="text-4xl font-bold text-amber-900 mb-4" style={{ fontFamily: 'Cinzel, serif' }}>
              Terms of Service
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
            <p className="text-amber-700 mb-4">Questions about our terms?</p>
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

export default TermsPageScroll;
