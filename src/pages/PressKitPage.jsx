import React from 'react';
import { Link } from 'react-router-dom';
import Header from '../components/Header';
import Footer from '../components/Footer';

const PressKitPage = () => {
  return (
    <div className="min-h-screen bg-gradient-to-b from-blue-900 via-blue-800 to-blue-700 text-white">
      <Header />
      
      <div className="container mx-auto px-4 py-8 pt-24">
        <div className="max-w-3xl mx-auto">
          <h1 className="text-3xl md:text-4xl font-bold text-yellow-300 mb-8">Press Kit</h1>
          
          {/* Introduction */}
          <div className="bg-white/5 backdrop-blur-md border border-white/15 rounded-xl p-6 mb-8">
            <h2 className="text-xl font-semibold text-yellow-300 mb-4">About FaithTalkAI</h2>
            <p className="text-blue-100 mb-4">
              FaithTalkAI is a platform that enables meaningful conversations with biblical characters through 
              AI technology. Our mission is to make scripture more accessible and engaging for believers and 
              seekers alike.
            </p>
            <p className="text-blue-100">
              This press kit provides resources for media professionals, content creators, and partners who 
              wish to feature or write about FaithTalkAI.
            </p>
          </div>
          
          {/* Media Inquiries */}
          <div className="bg-white/5 backdrop-blur-md border border-white/15 rounded-xl p-6 mb-8">
            <h2 className="text-xl font-semibold text-yellow-300 mb-4">Media Inquiries</h2>
            <p className="text-blue-100 mb-4">
              For press inquiries, interview requests, or additional information, please contact our media relations team:
            </p>
            <a 
              href="mailto:press@faithtalkai.com" 
              className="inline-flex items-center px-5 py-3 bg-blue-600 hover:bg-blue-500 rounded-lg transition-colors"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" viewBox="0 0 20 20" fill="currentColor">
                <path d="M2.003 5.884L10 9.882l7.997-3.998A2 2 0 0016 4H4a2 2 0 00-1.997 1.884z" />
                <path d="M18 8.118l-8 4-8-4V14a2 2 0 002 2h12a2 2 0 002-2V8.118z" />
              </svg>
              press@faithtalkai.com
            </a>
          </div>
          
          {/* Brand Assets */}
          <div className="bg-white/5 backdrop-blur-md border border-white/15 rounded-xl p-6 mb-8">
            <h2 className="text-xl font-semibold text-yellow-300 mb-4">Brand Assets</h2>
            <p className="text-blue-100 mb-6">
              Download our logos, screenshots, and other brand assets for use in articles, features, and promotions.
            </p>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <a 
                href="#" 
                className="flex items-center justify-center px-4 py-3 bg-yellow-400 hover:bg-yellow-300 text-blue-900 rounded-lg font-semibold transition-colors"
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M3 17a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm3.293-7.707a1 1 0 011.414 0L9 10.586V3a1 1 0 112 0v7.586l1.293-1.293a1 1 0 111.414 1.414l-3 3a1 1 0 01-1.414 0l-3-3a1 1 0 010-1.414z" clipRule="evenodd" />
                </svg>
                Logo Package (.zip)
              </a>
              
              <a 
                href="#" 
                className="flex items-center justify-center px-4 py-3 bg-yellow-400 hover:bg-yellow-300 text-blue-900 rounded-lg font-semibold transition-colors"
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M3 17a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm3.293-7.707a1 1 0 011.414 0L9 10.586V3a1 1 0 112 0v7.586l1.293-1.293a1 1 0 111.414 1.414l-3 3a1 1 0 01-1.414 0l-3-3a1 1 0 010-1.414z" clipRule="evenodd" />
                </svg>
                Product Screenshots (.zip)
              </a>
              
              <a 
                href="#" 
                className="flex items-center justify-center px-4 py-3 bg-yellow-400 hover:bg-yellow-300 text-blue-900 rounded-lg font-semibold transition-colors"
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M3 17a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm3.293-7.707a1 1 0 011.414 0L9 10.586V3a1 1 0 112 0v7.586l1.293-1.293a1 1 0 111.414 1.414l-3 3a1 1 0 01-1.414 0l-3-3a1 1 0 010-1.414z" clipRule="evenodd" />
                </svg>
                Brand Guidelines (.pdf)
              </a>
              
              <a 
                href="#" 
                className="flex items-center justify-center px-4 py-3 bg-yellow-400 hover:bg-yellow-300 text-blue-900 rounded-lg font-semibold transition-colors"
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M3 17a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm3.293-7.707a1 1 0 011.414 0L9 10.586V3a1 1 0 112 0v7.586l1.293-1.293a1 1 0 111.414 1.414l-3 3a1 1 0 01-1.414 0l-3-3a1 1 0 010-1.414z" clipRule="evenodd" />
                </svg>
                Media Kit (.zip)
              </a>
            </div>
          </div>
          
          {/* Brand Guidelines */}
          <div className="bg-white/5 backdrop-blur-md border border-white/15 rounded-xl p-6 mb-8">
            <h2 className="text-xl font-semibold text-yellow-300 mb-4">Brand Guidelines</h2>
            <div className="space-y-4">
              <div>
                <h3 className="text-lg font-medium text-yellow-200 mb-2">Logo Usage</h3>
                <p className="text-blue-100">
                  Please maintain clear space around our logo equal to the height of the "F" in our wordmark. 
                  Do not alter, rotate, or modify our logo in any way. Always use the provided logo files.
                </p>
              </div>
              
              <div>
                <h3 className="text-lg font-medium text-yellow-200 mb-2">Colors</h3>
                <p className="text-blue-100">
                  Primary: Blue (#0a0a2a), Yellow (#FACC15)<br />
                  Secondary: Light Blue (#93C5FD), White (#FFFFFF)
                </p>
              </div>
              
              <div>
                <h3 className="text-lg font-medium text-yellow-200 mb-2">Typography</h3>
                <p className="text-blue-100">
                  FaithTalkAI uses the Inter font family for all digital communications.
                </p>
              </div>
              
              <div>
                <h3 className="text-lg font-medium text-yellow-200 mb-2">Name Usage</h3>
                <p className="text-blue-100">
                  Always write our name as "FaithTalkAI" (no spaces, with "AI" capitalized).
                </p>
              </div>
            </div>
          </div>
          
          {/* Company Info */}
          <div className="bg-white/5 backdrop-blur-md border border-white/15 rounded-xl p-6 mb-8">
            <h2 className="text-xl font-semibold text-yellow-300 mb-4">Company Information</h2>
            <p className="text-blue-100 mb-4">
              Founded: 2023<br />
              Headquarters: United States<br />
              Mission: To bring scripture to life through meaningful AI-powered conversations with biblical characters
            </p>
            <p className="text-blue-100">
              For more information about our company, please visit our <Link to="/about" className="text-yellow-300 hover:text-yellow-200">About page</Link>.
            </p>
          </div>
        </div>
      </div>
      
      <Footer />
    </div>
  );
};

export default PressKitPage;
