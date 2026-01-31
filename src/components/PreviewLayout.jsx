import React from 'react';
import HeaderScroll from './HeaderScroll';

/**
 * Layout wrapper for preview pages
 * Uses the nostalgic HeaderScroll instead of the default Header
 */
const PreviewLayout = ({ children }) => {
  return (
    <div className="flex flex-col min-h-screen">
      <HeaderScroll />
      <main className="flex-1">
        {children}
      </main>
    </div>
  );
};

export default PreviewLayout;
