import React from 'react';
import Header from '../components/Header';
import Footer from '../components/Footer';

const PrivacyPage = () => {
  return (
    <div className="min-h-screen bg-gradient-to-b from-blue-900 via-blue-800 to-blue-700 text-white">
      <Header />
      
      <div className="container mx-auto px-4 py-8 pt-24">
        <div className="max-w-3xl mx-auto">
          <h1 className="text-3xl md:text-4xl font-bold text-yellow-300 mb-8">Privacy Policy</h1>
          
          {/* Introduction */}
          <div className="bg-white/5 backdrop-blur-md border border-white/15 rounded-xl p-6 mb-8">
            <h2 className="text-xl font-semibold text-yellow-300 mb-4">1. Introduction</h2>
            <p className="text-blue-100 mb-4">
              At FaithTalkAI, we respect your privacy and are committed to protecting your personal data. 
              This Privacy Policy explains how we collect, use, and safeguard your information when you use our service.
            </p>
            <p className="text-blue-100">
              Please read this Privacy Policy carefully. If you do not agree with our policies, please do not use our service.
            </p>
          </div>
          
          {/* Information Collection */}
          <div className="bg-white/5 backdrop-blur-md border border-white/15 rounded-xl p-6 mb-8">
            <h2 className="text-xl font-semibold text-yellow-300 mb-4">2. Information We Collect</h2>
            <p className="text-blue-100 mb-4">
              We collect several types of information for various purposes to provide and improve our service to you:
            </p>
            <ul className="text-blue-100 space-y-2 mb-4 list-disc pl-5">
              <li>Personal Data: Email address, name, and account preferences</li>
              <li>Usage Data: Information on how you access and use our service</li>
              <li>Conversation Data: Content of your conversations with biblical characters</li>
              <li>Device Data: IP address, browser type, and device information</li>
            </ul>
            <p className="text-blue-100">
              We collect this information when you register an account, use our service, or contact us directly.
            </p>
          </div>
          
          {/* Use of Information */}
          <div className="bg-white/5 backdrop-blur-md border border-white/15 rounded-xl p-6 mb-8">
            <h2 className="text-xl font-semibold text-yellow-300 mb-4">3. How We Use Your Information</h2>
            <p className="text-blue-100 mb-4">
              We use the collected data for various purposes:
            </p>
            <ul className="text-blue-100 space-y-2 mb-4 list-disc pl-5">
              <li>To provide and maintain our service</li>
              <li>To notify you about changes to our service</li>
              <li>To provide customer support</li>
              <li>To improve our service and develop new features</li>
              <li>To monitor usage of our service</li>
              <li>To detect, prevent, and address technical issues</li>
            </ul>
            <p className="text-blue-100">
              We will never sell your personal information to third parties.
            </p>
          </div>
          
          {/* Data Security */}
          <div className="bg-white/5 backdrop-blur-md border border-white/15 rounded-xl p-6 mb-8">
            <h2 className="text-xl font-semibold text-yellow-300 mb-4">4. Data Security</h2>
            <p className="text-blue-100 mb-4">
              The security of your data is important to us. We strive to use commercially acceptable means to protect your 
              personal information, but no method of transmission over the Internet or method of electronic storage is 100% secure.
            </p>
            <p className="text-blue-100">
              While we implement safeguards designed to protect your information, we cannot guarantee its absolute security.
            </p>
          </div>
          
          {/* Cookies */}
          <div className="bg-white/5 backdrop-blur-md border border-white/15 rounded-xl p-6 mb-8">
            <h2 className="text-xl font-semibold text-yellow-300 mb-4">5. Cookies</h2>
            <p className="text-blue-100 mb-4">
              We use cookies and similar tracking technologies to track activity on our service and hold certain information. 
              Cookies are files with a small amount of data which may include an anonymous unique identifier.
            </p>
            <p className="text-blue-100">
              You can instruct your browser to refuse all cookies or to indicate when a cookie is being sent. However, 
              if you do not accept cookies, you may not be able to use some portions of our service.
            </p>
          </div>
          
          {/* Third-party Services */}
          <div className="bg-white/5 backdrop-blur-md border border-white/15 rounded-xl p-6 mb-8">
            <h2 className="text-xl font-semibold text-yellow-300 mb-4">6. Service Providers</h2>
            <p className="text-blue-100 mb-4">
              We may employ third-party companies and individuals to facilitate our service, provide the service on our behalf, 
              perform service-related services, or assist us in analyzing how our service is used.
            </p>
            <p className="text-blue-100">
              These third parties have access to your personal data only to perform these tasks on our behalf and are 
              obligated not to disclose or use it for any other purpose.
            </p>
          </div>
          
          {/* Children's Privacy */}
          <div className="bg-white/5 backdrop-blur-md border border-white/15 rounded-xl p-6 mb-8">
            <h2 className="text-xl font-semibold text-yellow-300 mb-4">7. Children's Privacy</h2>
            <p className="text-blue-100">
              Our service is not intended for use by children under the age of 13. We do not knowingly collect personally 
              identifiable information from children under 13. If you are a parent or guardian and you are aware that your 
              child has provided us with personal data, please contact us so that we can take necessary actions.
            </p>
          </div>
          
          {/* Changes to Privacy Policy */}
          <div className="bg-white/5 backdrop-blur-md border border-white/15 rounded-xl p-6 mb-8">
            <h2 className="text-xl font-semibold text-yellow-300 mb-4">8. Changes to This Privacy Policy</h2>
            <p className="text-blue-100">
              We may update our Privacy Policy from time to time. We will notify you of any changes by posting the new 
              Privacy Policy on this page and updating the "Last updated" date. You are advised to review this Privacy 
              Policy periodically for any changes.
            </p>
          </div>
          
          {/* Contact */}
          <div className="bg-white/5 backdrop-blur-md border border-white/15 rounded-xl p-6 mb-8">
            <h2 className="text-xl font-semibold text-yellow-300 mb-4">9. Contact Us</h2>
            <p className="text-blue-100">
              If you have any questions about this Privacy Policy, please contact us at privacy@faithtalkai.com.
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

export default PrivacyPage;
