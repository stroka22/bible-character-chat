import React, { useState, useEffect } from 'react';

const APP_STORE_URL = 'https://apps.apple.com/app/faith-talk-ai/id6742852830';
const APP_SCHEME = 'faithtalkai://';

export default function SmartAppBanner() {
  const [show, setShow] = useState(false);
  const [isIOS, setIsIOS] = useState(false);

  useEffect(() => {
    // Check if iOS device
    const userAgent = navigator.userAgent || navigator.vendor || '';
    const isIOSDevice = /iPad|iPhone|iPod/.test(userAgent) && !window.MSStream;
    
    // Check if already in the app (standalone mode or app scheme)
    const isStandalone = window.navigator.standalone === true;
    const isInApp = window.location.href.includes('faithtalkai://');
    
    // Check if already dismissed this session
    const dismissed = sessionStorage.getItem('appBannerDismissed');
    
    // Only show on iOS mobile browsers, not in app, and not dismissed
    if (isIOSDevice && !isStandalone && !isInApp && !dismissed) {
      setIsIOS(true);
      setShow(true);
    }
  }, []);

  const handleDismiss = () => {
    sessionStorage.setItem('appBannerDismissed', 'true');
    setShow(false);
  };

  const handleOpenApp = () => {
    // Try to open the app first
    const now = Date.now();
    window.location.href = APP_SCHEME;
    
    // If app doesn't open within 1.5s, redirect to App Store
    setTimeout(() => {
      if (Date.now() - now < 2000) {
        window.location.href = APP_STORE_URL;
      }
    }, 1500);
  };

  if (!show || !isIOS) return null;

  return (
    <div className="fixed top-0 left-0 right-0 z-50 bg-gradient-to-r from-amber-600 to-amber-500 text-white px-4 py-3 shadow-lg">
      <div className="max-w-4xl mx-auto flex items-center justify-between gap-3">
        <div className="flex items-center gap-3 flex-1 min-w-0">
          <img 
            src="/downloads/logo-pack/favicons/favicon-180.png" 
            alt="Faith Talk AI" 
            className="w-10 h-10 rounded-xl shadow"
          />
          <div className="min-w-0">
            <div className="font-bold text-sm truncate">Faith Talk AI</div>
            <div className="text-amber-100 text-xs">Better experience in the app</div>
          </div>
        </div>
        
        <div className="flex items-center gap-2 flex-shrink-0">
          <button
            onClick={handleOpenApp}
            className="px-4 py-1.5 bg-white text-amber-700 font-bold text-sm rounded-full hover:bg-amber-50 transition-colors"
          >
            Open
          </button>
          <button
            onClick={handleDismiss}
            className="p-1.5 text-amber-200 hover:text-white transition-colors"
            aria-label="Dismiss"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
      </div>
    </div>
  );
}
