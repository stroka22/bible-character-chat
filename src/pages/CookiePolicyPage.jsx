import React from 'react';
import Header from '../components/Header';
import Footer from '../components/Footer';

const CookiePolicyPage = () => {
  return (
    <div className="min-h-screen bg-gradient-to-b from-blue-900 via-blue-800 to-blue-700 text-white">
      <Header />
      
      <div className="container mx-auto px-4 py-8 pt-24">
        <div className="max-w-3xl mx-auto">
          <h1 className="text-3xl md:text-4xl font-bold text-yellow-300 mb-8">Cookie Policy</h1>
          
          {/* Introduction */}
          <div className="bg-white/5 backdrop-blur-md border border-white/15 rounded-xl p-6 mb-8">
            <h2 className="text-xl font-semibold text-yellow-300 mb-4">1. Introduction</h2>
            <p className="text-blue-100 mb-4">
              This Cookie Policy explains how FaithTalkAI uses cookies and similar technologies to recognize you when you 
              visit our website. It explains what these technologies are and why we use them, as well as your rights to 
              control our use of them.
            </p>
            <p className="text-blue-100">
              Please read this Cookie Policy carefully. If you do not agree with our policies, please do not use our service.
            </p>
          </div>
          
          {/* What are Cookies */}
          <div className="bg-white/5 backdrop-blur-md border border-white/15 rounded-xl p-6 mb-8">
            <h2 className="text-xl font-semibold text-yellow-300 mb-4">2. What are Cookies?</h2>
            <p className="text-blue-100 mb-4">
              Cookies are small data files that are placed on your computer or mobile device when you visit a website. 
              Cookies are widely used by website owners to make their websites work, or to work more efficiently, as well 
              as to provide reporting information.
            </p>
            <p className="text-blue-100">
              Cookies set by the website owner (in this case, FaithTalkAI) are called "first-party cookies." Cookies set 
              by parties other than the website owner are called "third-party cookies." Third-party cookies enable third-party 
              features or functionality to be provided on or through the website (e.g., advertising, interactive content, and analytics).
            </p>
          </div>
          
          {/* Types of Cookies */}
          <div className="bg-white/5 backdrop-blur-md border border-white/15 rounded-xl p-6 mb-8">
            <h2 className="text-xl font-semibold text-yellow-300 mb-4">3. Types of Cookies We Use</h2>
            <p className="text-blue-100 mb-4">
              We use the following types of cookies:
            </p>
            <ul className="text-blue-100 space-y-2 mb-4 list-disc pl-5">
              <li><strong className="text-yellow-200">Essential Cookies:</strong> These cookies are necessary for the website to function and cannot be switched off in our systems. They are usually only set in response to actions made by you which amount to a request for services, such as setting your privacy preferences, logging in, or filling in forms.</li>
              <li><strong className="text-yellow-200">Performance Cookies:</strong> These cookies allow us to count visits and traffic sources so we can measure and improve the performance of our site. They help us to know which pages are the most and least popular and see how visitors move around the site.</li>
              <li><strong className="text-yellow-200">Functionality Cookies:</strong> These cookies enable the website to provide enhanced functionality and personalization. They may be set by us or by third-party providers whose services we have added to our pages.</li>
              <li><strong className="text-yellow-200">Targeting Cookies:</strong> These cookies may be set through our site by our advertising partners. They may be used by those companies to build a profile of your interests and show you relevant advertisements on other sites.</li>
            </ul>
          </div>
          
          {/* How to Control Cookies */}
          <div className="bg-white/5 backdrop-blur-md border border-white/15 rounded-xl p-6 mb-8">
            <h2 className="text-xl font-semibold text-yellow-300 mb-4">4. How to Control Cookies</h2>
            <p className="text-blue-100 mb-4">
              You can set or amend your web browser controls to accept or refuse cookies. If you choose to reject cookies, 
              you may still use our website though your access to some functionality and areas of our website may be restricted.
            </p>
            <p className="text-blue-100 mb-4">
              The specific way to manage cookies varies by browser. Please refer to your browser's help menu for instructions:
            </p>
            <ul className="text-blue-100 space-y-2 mb-4 list-disc pl-5">
              <li>Google Chrome</li>
              <li>Microsoft Edge</li>
              <li>Mozilla Firefox</li>
              <li>Microsoft Internet Explorer</li>
              <li>Opera</li>
              <li>Apple Safari</li>
            </ul>
            <p className="text-blue-100">
              In addition, most advertising networks offer you a way to opt out of targeted advertising. Please visit 
              <a href="http://www.aboutads.info/choices/" className="text-yellow-300 hover:text-yellow-200 ml-1">www.aboutads.info/choices</a> or 
              <a href="http://www.youronlinechoices.com" className="text-yellow-300 hover:text-yellow-200 ml-1">www.youronlinechoices.com</a>.
            </p>
          </div>
          
          {/* Updates to Cookie Policy */}
          <div className="bg-white/5 backdrop-blur-md border border-white/15 rounded-xl p-6 mb-8">
            <h2 className="text-xl font-semibold text-yellow-300 mb-4">5. Updates to This Cookie Policy</h2>
            <p className="text-blue-100">
              We may update this Cookie Policy from time to time in order to reflect changes to the cookies we use or for 
              other operational, legal, or regulatory reasons. Please therefore revisit this Cookie Policy regularly to 
              stay informed about our use of cookies and related technologies.
            </p>
          </div>
          
          {/* Contact */}
          <div className="bg-white/5 backdrop-blur-md border border-white/15 rounded-xl p-6 mb-8">
            <h2 className="text-xl font-semibold text-yellow-300 mb-4">6. Contact Us</h2>
            <p className="text-blue-100">
              If you have any questions about our use of cookies or other technologies, please contact us at privacy@faithtalkai.com.
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

export default CookiePolicyPage;
