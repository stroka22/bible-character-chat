import React, { useState } from 'react';
import { Link } from 'react-router-dom';

/**
 * Nostalgic Footer Component for Preview Pages
 * Styled like an aged manuscript/parchment
 */
const FooterScroll = () => {
  const currentYear = new Date().getFullYear();
  const [email, setEmail] = useState('');
  
  const handleSubscribe = (e) => {
    e.preventDefault();
    if (email) {
      window.location.href = `mailto:newsletter@faithtalkai.com?subject=Subscribe&body=Please subscribe me with email: ${email}`;
      setEmail('');
    }
  };

  // Ornate divider
  const OrnateDivider = () => (
    <div className="flex items-center justify-center gap-4 my-6">
      <div className="flex-1 h-px bg-gradient-to-r from-transparent via-amber-600/40 to-amber-600/50" />
      <svg className="w-6 h-6 text-amber-700/50" viewBox="0 0 24 24" fill="currentColor">
        <path d="M12 2L14.5 9H22L16 13.5L18.5 21L12 16.5L5.5 21L8 13.5L2 9H9.5L12 2Z" />
      </svg>
      <div className="flex-1 h-px bg-gradient-to-l from-transparent via-amber-600/40 to-amber-600/50" />
    </div>
  );

  // Corner flourish
  const CornerFlourish = ({ className = '' }) => (
    <svg className={`w-12 h-12 text-amber-700/25 ${className}`} viewBox="0 0 48 48" fill="currentColor">
      <path d="M4,44 Q4,24 16,12 Q28,4 44,4 L44,8 Q30,8 20,18 Q10,28 8,44 Z" />
      <circle cx="44" cy="4" r="3" />
      <circle cx="4" cy="44" r="3" />
      <path d="M12,40 Q12,30 20,22 Q28,14 40,12" fill="none" stroke="currentColor" strokeWidth="1" opacity="0.5"/>
    </svg>
  );
  
  return (
    <footer 
      className="relative"
      style={{
        background: 'linear-gradient(to bottom, #92400e 0%, #78350f 30%, #451a03 100%)'
      }}
    >
      {/* Decorative top border */}
      <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-transparent via-amber-400/40 to-transparent" />
      
      {/* Ornate top edge */}
      <svg className="absolute -top-2 left-0 right-0 w-full h-4" preserveAspectRatio="none" viewBox="0 0 800 16">
        <path d="M0,16 L0,8 Q100,0 200,8 Q300,16 400,8 Q500,0 600,8 Q700,16 800,8 L800,16 Z" fill="#92400e"/>
      </svg>

      {/* Main Footer Content */}
      <div className="container mx-auto px-4 py-10 relative">
        {/* Corner flourishes */}
        <CornerFlourish className="absolute top-4 left-4 hidden lg:block" />
        <CornerFlourish className="absolute top-4 right-4 hidden lg:block scale-x-[-1]" />
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-8">
          {/* Brand Column */}
          <div className="col-span-1 md:col-span-2 lg:col-span-1">
            <div className="flex items-center gap-2 mb-4">
              <svg className="w-10 h-10 text-amber-300" viewBox="0 0 24 24" fill="currentColor">
                <path d="M12 4.5C7 4.5 2.73 7.61 1 12c1.73 4.39 6 7.5 11 7.5s9.27-3.11 11-7.5c-1.73-4.39-6-7.5-11-7.5zM12 17c-2.76 0-5-2.24-5-5s2.24-5 5-5 5 2.24 5 5-2.24 5-5 5zm0-8c-1.66 0-3 1.34-3 3s1.34 3 3 3 3-1.34 3-3-1.34-3-3-3z"/>
              </svg>
              <span 
                className="text-2xl font-bold text-amber-200"
                style={{ fontFamily: 'Cinzel, serif', textShadow: '1px 1px 2px rgba(0,0,0,0.5)' }}
              >
                FaithTalk<span className="text-amber-400">AI</span>
              </span>
            </div>
            <p 
              className="text-amber-200/80 text-sm leading-relaxed"
              style={{ fontFamily: 'Georgia, serif' }}
            >
              Engage in meaningful conversations with Biblical characters through the power of AI. 
              Bringing ancient wisdom to modern seekers.
            </p>
            
            {/* Decorative quill */}
            <svg className="w-16 h-16 text-amber-600/30 mt-4" viewBox="0 0 64 64" fill="currentColor">
              <path d="M56,8 Q48,16 40,24 L36,20 Q44,12 52,4 Q58,6 56,8 Z M38,22 L42,26 L16,52 L12,56 L8,52 L12,48 Z M10,54 L6,58 L4,56 L8,52 Z"/>
            </svg>
          </div>
          
          {/* Product Column */}
          <div className="col-span-1">
            <h3 
              className="text-amber-300 font-bold text-lg mb-4 border-b border-amber-600/30 pb-2"
              style={{ fontFamily: 'Cinzel, serif' }}
            >
              Explore
            </h3>
            <ul className="space-y-2" style={{ fontFamily: 'Georgia, serif' }}>
              <li><Link to="/how-it-works" className="text-amber-200/80 hover:text-amber-200 transition-colors text-sm flex items-center gap-2"><span className="text-amber-500">&#8226;</span> How it Works</Link></li>
              <li><Link to="/bible" className="text-amber-200/80 hover:text-amber-200 transition-colors text-sm flex items-center gap-2"><span className="text-amber-500">&#8226;</span> Bible</Link></li>
              <li><Link to="/reading-plans/preview" className="text-amber-200/80 hover:text-amber-200 transition-colors text-sm flex items-center gap-2"><span className="text-amber-500">&#8226;</span> Reading Plans</Link></li>
              <li><Link to="/studies/preview" className="text-amber-200/80 hover:text-amber-200 transition-colors text-sm flex items-center gap-2"><span className="text-amber-500">&#8226;</span> Bible Studies</Link></li>
              <li><Link to="/pricing" className="text-amber-200/80 hover:text-amber-200 transition-colors text-sm flex items-center gap-2"><span className="text-amber-500">&#8226;</span> Pricing</Link></li>
              <li><Link to="/faq" className="text-amber-200/80 hover:text-amber-200 transition-colors text-sm flex items-center gap-2"><span className="text-amber-500">&#8226;</span> FAQ</Link></li>
            </ul>
          </div>
          
          {/* Company Column */}
          <div className="col-span-1">
            <h3 
              className="text-amber-300 font-bold text-lg mb-4 border-b border-amber-600/30 pb-2"
              style={{ fontFamily: 'Cinzel, serif' }}
            >
              About
            </h3>
            <ul className="space-y-2" style={{ fontFamily: 'Georgia, serif' }}>
              <li><Link to="/about" className="text-amber-200/80 hover:text-amber-200 transition-colors text-sm flex items-center gap-2"><span className="text-amber-500">&#8226;</span> Our Story</Link></li>
              <li><Link to="/contact" className="text-amber-200/80 hover:text-amber-200 transition-colors text-sm flex items-center gap-2"><span className="text-amber-500">&#8226;</span> Contact</Link></li>
              <li><Link to="/press-kit" className="text-amber-200/80 hover:text-amber-200 transition-colors text-sm flex items-center gap-2"><span className="text-amber-500">&#8226;</span> Press Kit</Link></li>
              <li><Link to="/careers" className="text-amber-200/80 hover:text-amber-200 transition-colors text-sm flex items-center gap-2"><span className="text-amber-500">&#8226;</span> Careers</Link></li>
            </ul>
          </div>
          
          {/* Legal Column */}
          <div className="col-span-1">
            <h3 
              className="text-amber-300 font-bold text-lg mb-4 border-b border-amber-600/30 pb-2"
              style={{ fontFamily: 'Cinzel, serif' }}
            >
              Legal
            </h3>
            <ul className="space-y-2" style={{ fontFamily: 'Georgia, serif' }}>
              <li><Link to="/terms" className="text-amber-200/80 hover:text-amber-200 transition-colors text-sm flex items-center gap-2"><span className="text-amber-500">&#8226;</span> Terms of Service</Link></li>
              <li><Link to="/privacy" className="text-amber-200/80 hover:text-amber-200 transition-colors text-sm flex items-center gap-2"><span className="text-amber-500">&#8226;</span> Privacy Policy</Link></li>
              <li><Link to="/cookies" className="text-amber-200/80 hover:text-amber-200 transition-colors text-sm flex items-center gap-2"><span className="text-amber-500">&#8226;</span> Cookie Policy</Link></li>
            </ul>
          </div>
          
          {/* Connect Column */}
          <div className="col-span-1">
            <h3 
              className="text-amber-300 font-bold text-lg mb-4 border-b border-amber-600/30 pb-2"
              style={{ fontFamily: 'Cinzel, serif' }}
            >
              Connect
            </h3>
            
            {/* Social icons with parchment style */}
            <div className="flex space-x-3 mb-4">
              {[
                { href: 'https://facebook.com', label: 'Facebook', path: 'M9 8h-3v4h3v12h5v-12h3.642l.358-4h-4v-1.667c0-.955.192-1.333 1.115-1.333h2.885v-5h-3.808c-3.596 0-5.192 1.583-5.192 4.615v3.385z' },
                { href: 'https://twitter.com', label: 'Twitter', path: 'M24 4.557c-.883.392-1.832.656-2.828.775 1.017-.609 1.798-1.574 2.165-2.724-.951.564-2.005.974-3.127 1.195-.897-.957-2.178-1.555-3.594-1.555-3.179 0-5.515 2.966-4.797 6.045-4.091-.205-7.719-2.165-10.148-5.144-1.29 2.213-.669 5.108 1.523 6.574-.806-.026-1.566-.247-2.229-.616-.054 2.281 1.581 4.415 3.949 4.89-.693.188-1.452.232-2.224.084.626 1.956 2.444 3.379 4.6 3.419-2.07 1.623-4.678 2.348-7.29 2.04 2.179 1.397 4.768 2.212 7.548 2.212 9.142 0 14.307-7.721 13.995-14.646.962-.695 1.797-1.562 2.457-2.549z' },
                { href: 'https://instagram.com', label: 'Instagram', path: 'M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z' },
              ].map(({ href, label, path }) => (
                <a 
                  key={label}
                  href={href} 
                  target="_blank" 
                  rel="noopener noreferrer" 
                  aria-label={label}
                  className="w-9 h-9 rounded-full bg-amber-800/50 border border-amber-600/30 flex items-center justify-center text-amber-300 hover:bg-amber-700/50 hover:text-amber-200 transition-colors"
                >
                  <svg className="h-4 w-4" fill="currentColor" viewBox="0 0 24 24">
                    <path d={path} />
                  </svg>
                </a>
              ))}
            </div>
            
            <p className="text-amber-200/80 text-sm mb-4" style={{ fontFamily: 'Georgia, serif' }}>
              <a href="mailto:contact@faithtalkai.com" className="hover:text-amber-200 transition-colors">
                contact@faithtalkai.com
              </a>
            </p>
            
            {/* Newsletter with parchment style */}
            <form onSubmit={handleSubscribe}>
              <label 
                htmlFor="newsletter-email-scroll" 
                className="text-xs text-amber-300/80 mb-2 block"
                style={{ fontFamily: 'Georgia, serif' }}
              >
                Subscribe to our newsletter
              </label>
              <div className="flex flex-col sm:flex-row gap-2">
                <input 
                  type="email" 
                  id="newsletter-email-scroll"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="Your email" 
                  className="min-w-0 flex-1 px-3 py-2 bg-amber-900/50 border border-amber-600/40 rounded-lg focus:outline-none focus:ring-1 focus:ring-amber-400 text-amber-100 text-sm placeholder-amber-400/50"
                  style={{ fontFamily: 'Georgia, serif' }}
                  required
                />
                <button 
                  type="submit" 
                  className="bg-amber-600 hover:bg-amber-500 text-amber-100 px-4 py-2 rounded-lg text-sm font-medium transition-colors border border-amber-500/50"
                  style={{ fontFamily: 'Georgia, serif' }}
                >
                  Subscribe
                </button>
              </div>
            </form>
          </div>
        </div>

        <OrnateDivider />
        
        {/* AI Disclaimer with scroll styling */}
        <div 
          className="text-center px-4 py-4 rounded-lg border border-amber-600/20"
          style={{ background: 'rgba(120,53,15,0.2)' }}
        >
          <p 
            className="text-amber-200/70 text-sm italic"
            style={{ fontFamily: 'Georgia, serif' }}
          >
            "AI-generated conversations are for educational and devotional purposes 
            and are not a substitute for Scripture or pastoral counsel."
          </p>
          <p className="text-amber-400/60 text-xs mt-2" style={{ fontFamily: 'Cinzel, serif' }}>
            Bringing Biblical wisdom to life through AI
          </p>
        </div>
      </div>
      
      {/* Copyright Bar with aged look */}
      <div 
        className="py-4 border-t border-amber-800/50"
        style={{ background: 'rgba(0,0,0,0.3)' }}
      >
        <div className="container mx-auto px-4 text-center">
          <p 
            className="text-amber-400/50 text-sm"
            style={{ fontFamily: 'Georgia, serif' }}
          >
            &#8212; &copy; {currentYear} FaithTalkAI.com &#8212; All rights reserved &#8212;
          </p>
        </div>
      </div>
      
      {/* Bottom corner flourishes */}
      <CornerFlourish className="absolute bottom-12 left-4 hidden lg:block rotate-180" />
      <CornerFlourish className="absolute bottom-12 right-4 hidden lg:block rotate-180 scale-x-[-1]" />
    </footer>
  );
};

export default FooterScroll;
