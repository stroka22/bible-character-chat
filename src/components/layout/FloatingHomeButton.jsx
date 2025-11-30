import React from 'react';
import { Link } from 'react-router-dom';

const FloatingHomeButton = ({ className = '' }) => {
  return (
    <Link
      to="/?view=characters"
      aria-label="Go to Home"
      className={
        `fixed bottom-4 left-4 md:bottom-6 md:left-6 z-[60] ` +
        `inline-flex items-center gap-2 px-3 py-2 md:px-4 md:py-2.5 ` +
        `rounded-full shadow-lg shadow-black/30 ` +
        `text-blue-900 bg-yellow-400 hover:bg-yellow-300 border border-yellow-500 ` +
        `transition-colors ${className}`
      }
    >
      <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
        <path d="M10.707 1.293a1 1 0 00-1.414 0l-8 8A1 1 0 002 11h1v7a1 1 0 001 1h4a1 1 0 001-1v-4h2v4a1 1 0 001 1h4a1 1 0 001-1v-7h1a1 1 0 00.707-1.707l-8-8z" />
      </svg>
      <span className="hidden md:inline text-sm font-semibold">Home</span>
    </Link>
  );
};

export default FloatingHomeButton;
