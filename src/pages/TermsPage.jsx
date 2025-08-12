import React from 'react';
import Header from '../components/Header';
import Footer from '../components/Footer';

const TermsPage = () => {
  return (
    <div className="min-h-screen bg-gradient-to-b from-blue-900 via-blue-800 to-blue-700 text-white">
      <Header />
      
      <div className="container mx-auto px-4 py-8 pt-24">
        <div className="max-w-3xl mx-auto">
          <h1 className="text-3xl md:text-4xl font-bold text-yellow-300 mb-8">Terms of Service</h1>
          
          {/* Introduction */}
          <div className="bg-white/5 backdrop-blur-md border border-white/15 rounded-xl p-6 mb-8">
            <h2 className="text-xl font-semibold text-yellow-300 mb-4">1. Introduction</h2>
            <p className="text-blue-100 mb-4">
              Welcome to FaithTalkAI. By accessing or using our service, you agree to be bound by these Terms of Service. 
              Please read these terms carefully before using our platform.
            </p>
            <p className="text-blue-100">
              If you do not agree with any part of these terms, you may not access or use our service.
            </p>
          </div>
          
          {/* User Accounts */}
          <div className="bg-white/5 backdrop-blur-md border border-white/15 rounded-xl p-6 mb-8">
            <h2 className="text-xl font-semibold text-yellow-300 mb-4">2. User Accounts</h2>
            <p className="text-blue-100 mb-4">
              When you create an account with us, you must provide accurate, complete, and current information. You are responsible 
              for safeguarding the password and for all activities that occur under your account.
            </p>
            <p className="text-blue-100">
              You agree to notify us immediately of any unauthorized use of your account or any other breach of security. We cannot 
              and will not be liable for any loss or damage arising from your failure to comply with this section.
            </p>
          </div>
          
          {/* Acceptable Use */}
          <div className="bg-white/5 backdrop-blur-md border border-white/15 rounded-xl p-6 mb-8">
            <h2 className="text-xl font-semibold text-yellow-300 mb-4">3. Acceptable Use</h2>
            <p className="text-blue-100 mb-4">
              You agree not to use FaithTalkAI for any purpose that is unlawful or prohibited by these Terms. You may not use 
              the service in any manner that could damage, disable, overburden, or impair the service.
            </p>
            <p className="text-blue-100">
              FaithTalkAI is intended for personal, non-commercial use. Any use of the service for commercial purposes without 
              our express written permission is strictly prohibited.
            </p>
          </div>
          
          {/* Intellectual Property */}
          <div className="bg-white/5 backdrop-blur-md border border-white/15 rounded-xl p-6 mb-8">
            <h2 className="text-xl font-semibold text-yellow-300 mb-4">4. Intellectual Property</h2>
            <p className="text-blue-100 mb-4">
              The service and its original content, features, and functionality are and will remain the exclusive property of 
              FaithTalkAI and its licensors. The service is protected by copyright, trademark, and other laws.
            </p>
            <p className="text-blue-100">
              Our trademarks and trade dress may not be used in connection with any product or service without the prior 
              written consent of FaithTalkAI.
            </p>
          </div>
          
          {/* Limitation of Liability */}
          <div className="bg-white/5 backdrop-blur-md border border-white/15 rounded-xl p-6 mb-8">
            <h2 className="text-xl font-semibold text-yellow-300 mb-4">5. Limitation of Liability</h2>
            <p className="text-blue-100 mb-4">
              In no event shall FaithTalkAI, nor its directors, employees, partners, agents, suppliers, or affiliates, be liable 
              for any indirect, incidental, special, consequential or punitive damages, including without limitation, loss of profits, 
              data, use, goodwill, or other intangible losses, resulting from your access to or use of or inability to access or use the service.
            </p>
            <p className="text-blue-100">
              FaithTalkAI does not warrant that the service will be uninterrupted or error-free, that defects will be corrected, 
              or that the service is free of viruses or other harmful components.
            </p>
          </div>
          
          {/* Changes to Terms */}
          <div className="bg-white/5 backdrop-blur-md border border-white/15 rounded-xl p-6 mb-8">
            <h2 className="text-xl font-semibold text-yellow-300 mb-4">6. Changes to Terms</h2>
            <p className="text-blue-100">
              We reserve the right, at our sole discretion, to modify or replace these Terms at any time. If a revision is material, 
              we will try to provide at least 30 days' notice prior to any new terms taking effect. What constitutes a material change 
              will be determined at our sole discretion.
            </p>
          </div>
          
          {/* Contact */}
          <div className="bg-white/5 backdrop-blur-md border border-white/15 rounded-xl p-6 mb-8">
            <h2 className="text-xl font-semibold text-yellow-300 mb-4">7. Contact Us</h2>
            <p className="text-blue-100">
              If you have any questions about these Terms, please contact us at support@faithtalkai.com.
            </p>
          </div>
          
          {/* Last Updated */}
          <p className="text-blue-100 text-sm text-center mb-8">
            Last updated: {new Date().toLocaleDateString('en-US', {month: 'long', day: 'numeric', year: 'numeric'})}
          </p>
        </div>
      </div>
      
      <Footer />
    </div>
  );
};

export default TermsPage;
