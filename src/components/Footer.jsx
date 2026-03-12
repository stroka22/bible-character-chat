import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import FaithLogo from './FaithLogo';

const Footer = () => {
  const currentYear = new Date().getFullYear();
  const [email, setEmail] = useState('');
  
  const handleSubscribe = (e) => {
    e.preventDefault();
    if (email) {
      window.location.href = `mailto:newsletter@faithtalkai.com?subject=Subscribe&body=Please subscribe me with email: ${email}`;
      setEmail('');
    }
  };
  
  return (
    <footer className="bg-[#0a0a2a] text-white">
      {/* Main Footer Content */}
      <div className="container mx-auto px-4 py-10">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-8">
          {/* Brand Column */}
          <div className="col-span-1 md:col-span-2 lg:col-span-1">
            <FaithLogo variant="light" size="lg" className="mb-4" />
            <p className="text-gray-300 mt-4">
              Engage in meaningful conversations with Biblical characters through the power of AI.
            </p>
          </div>
          
          {/* Product Column */}
          <div className="col-span-1">
            <h3 className="text-yellow-400 font-bold text-lg mb-4">Product</h3>
            <ul className="space-y-2">
              <li><Link to="/how-it-works" className="text-gray-300 hover:text-yellow-400 transition-colors">How it Works</Link></li>
              <li><Link to="/bible" className="text-gray-300 hover:text-yellow-400 transition-colors">Bible</Link></li>
              <li><Link to="/pricing" className="text-gray-300 hover:text-yellow-400 transition-colors">Pricing</Link></li>
              <li><Link to="/faq" className="text-gray-300 hover:text-yellow-400 transition-colors">FAQ</Link></li>
              <li><Link to="/contact" className="text-gray-300 hover:text-yellow-400 transition-colors">Contact Us</Link></li>
            </ul>
          </div>
          
          {/* Company Column */}
          <div className="col-span-1">
            <h3 className="text-yellow-400 font-bold text-lg mb-4">Company</h3>
            <ul className="space-y-2">
              <li><Link to="/about" className="text-gray-300 hover:text-yellow-400 transition-colors">About</Link></li>
              <li><Link to="/press-kit" className="text-gray-300 hover:text-yellow-400 transition-colors">Press Kit</Link></li>
              <li><Link to="/careers" className="text-gray-300 hover:text-yellow-400 transition-colors">Careers</Link></li>
            </ul>
          </div>
          
          {/* Legal Column */}
          <div className="col-span-1">
            <h3 className="text-yellow-400 font-bold text-lg mb-4">Legal</h3>
            <ul className="space-y-2">
              <li><Link to="/terms" className="text-gray-300 hover:text-yellow-400 transition-colors">Terms of Service</Link></li>
              <li><Link to="/privacy" className="text-gray-300 hover:text-yellow-400 transition-colors">Privacy Policy</Link></li>
              <li><Link to="/cookies" className="text-gray-300 hover:text-yellow-400 transition-colors">Cookie Policy</Link></li>
            </ul>
          </div>
          
          {/* Connect Column */}
          <div className="col-span-1">
            <h3 className="text-yellow-400 font-bold text-lg mb-4">Connect With Us</h3>
            <div className="flex space-x-4 mb-4">
              {/* Social Media Icons */}
              <a href="https://www.facebook.com/faithtalkai" target="_blank" rel="noopener noreferrer" aria-label="Facebook" className="text-gray-300 hover:text-yellow-400 transition-colors">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M9 8h-3v4h3v12h5v-12h3.642l.358-4h-4v-1.667c0-.955.192-1.333 1.115-1.333h2.885v-5h-3.808c-3.596 0-5.192 1.583-5.192 4.615v3.385z" />
                </svg>
              </a>
              <a href="https://www.instagram.com/faith_talk_ai" target="_blank" rel="noopener noreferrer" aria-label="Instagram" className="text-gray-300 hover:text-yellow-400 transition-colors">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z" />
                </svg>
              </a>
              <a href="https://www.tiktok.com/@faithtalkai" target="_blank" rel="noopener noreferrer" aria-label="TikTok" className="text-gray-300 hover:text-yellow-400 transition-colors">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M12.525.02c1.31-.02 2.61-.01 3.91-.02.08 1.53.63 3.09 1.75 4.17 1.12 1.11 2.7 1.62 4.24 1.79v4.03c-1.44-.05-2.89-.35-4.2-.97-.57-.26-1.1-.59-1.62-.93-.01 2.92.01 5.84-.02 8.75-.08 1.4-.54 2.79-1.35 3.94-1.31 1.92-3.58 3.17-5.91 3.21-1.43.08-2.86-.31-4.08-1.03-2.02-1.19-3.44-3.37-3.65-5.71-.02-.5-.03-1-.01-1.49.18-1.9 1.12-3.72 2.58-4.96 1.66-1.44 3.98-2.13 6.15-1.72.02 1.48-.04 2.96-.04 4.44-.99-.32-2.15-.23-3.02.37-.63.41-1.11 1.04-1.36 1.75-.21.51-.15 1.07-.14 1.61.24 1.64 1.82 3.02 3.5 2.87 1.12-.01 2.19-.66 2.77-1.61.19-.33.4-.67.41-1.06.1-1.79.06-3.57.07-5.36.01-4.03-.01-8.05.02-12.07z" />
                </svg>
              </a>
              <a href="https://www.linkedin.com/company/faithtalkai-%E2%80%93-digital-discipleship-infrastructure" target="_blank" rel="noopener noreferrer" aria-label="LinkedIn" className="text-gray-300 hover:text-yellow-400 transition-colors">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M4.98 3.5c0 1.381-1.11 2.5-2.48 2.5s-2.48-1.119-2.48-2.5c0-1.38 1.11-2.5 2.48-2.5s2.48 1.12 2.48 2.5zm.02 4.5h-5v16h5v-16zm7.982 0h-4.968v16h4.969v-8.399c0-4.67 6.029-5.052 6.029 0v8.399h4.988v-10.131c0-7.88-8.922-7.593-11.018-3.714v-2.155z" />
                </svg>
              </a>
            </div>
            <p className="text-gray-300 mb-4">
              <a href="mailto:contact@faithtalkai.com" className="hover:text-yellow-400 transition-colors">
                contact@faithtalkai.com
              </a>
            </p>
            
            {/* Newsletter Signup */}
            <form onSubmit={handleSubscribe} className="mt-4">
              <label htmlFor="newsletter-email" className="text-sm text-gray-300 mb-2 block">Subscribe to our newsletter</label>
              {/* Flex on larger screens, stack on very small to avoid overflow */}
              <div className="flex flex-col sm:flex-row gap-2 sm:gap-0">
                <input 
                  type="email" 
                  id="newsletter-email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="Your email" 
                  className="min-w-0 w-full sm:flex-1 px-3 py-2 bg-blue-900/50 border border-blue-700 rounded-lg sm:rounded-l-lg sm:rounded-r-none focus:outline-none focus:ring-1 focus:ring-yellow-400 text-white text-sm"
                  required
                />
                <button 
                  type="submit" 
                  className="w-full sm:w-auto bg-yellow-400 hover:bg-yellow-300 text-blue-900 px-3 py-2 rounded-lg sm:rounded-r-lg sm:rounded-l-none text-sm font-medium transition-colors"
                >
                  Subscribe
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
      
      {/* AI Disclaimer */}
      <div className="border-t border-blue-800 py-4">
        <div className="container mx-auto px-4 text-center">
          <p className="text-gray-400 text-sm">
            AI-generated conversations are for educational and devotional purposes and are not a substitute for Scripture or pastoral counsel. 
            <br />Bringing Biblical wisdom to life through AI
          </p>
        </div>
      </div>
      
      {/* Copyright Bar */}
      <div className="bg-[#070718] py-4">
        <div className="container mx-auto px-4 text-center">
          <p className="text-gray-400 text-sm">
            &copy; {currentYear} FaithTalkAI.com. All rights reserved.
          </p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
