import React from 'react';

// Scroll wrap container - makes content look like it's on an unfurled scroll
export const ScrollWrap = ({ children, className = '' }) => (
  <div className={`relative ${className}`}>
    {/* Top scroll roll - SVG based */}
    <div className="relative h-12 md:h-14">
      <svg 
        className="absolute inset-x-0 top-0 w-full h-full overflow-visible" 
        viewBox="0 0 800 60" 
        preserveAspectRatio="xMidYMax meet"
        style={{ filter: 'drop-shadow(0 4px 6px rgba(0,0,0,0.3))' }}
      >
        <defs>
          <linearGradient id="rollGradientTop" x1="0%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" stopColor="#92400e" />
            <stop offset="20%" stopColor="#b45309" />
            <stop offset="40%" stopColor="#d97706" />
            <stop offset="60%" stopColor="#b45309" />
            <stop offset="80%" stopColor="#92400e" />
            <stop offset="100%" stopColor="#78350f" />
          </linearGradient>
          <radialGradient id="capGradient" cx="50%" cy="50%" r="50%">
            <stop offset="0%" stopColor="#d97706" />
            <stop offset="50%" stopColor="#b45309" />
            <stop offset="100%" stopColor="#78350f" />
          </radialGradient>
        </defs>
        
        <ellipse cx="400" cy="22" rx="390" ry="22" fill="url(#rollGradientTop)" />
        <ellipse cx="400" cy="14" rx="370" ry="8" fill="rgba(255,255,255,0.15)" />
        
        <circle cx="20" cy="22" r="22" fill="url(#capGradient)" />
        <circle cx="20" cy="22" r="15" fill="none" stroke="rgba(120,53,15,0.5)" strokeWidth="2" />
        <circle cx="20" cy="22" r="6" fill="#78350f" />
        
        <circle cx="780" cy="22" r="22" fill="url(#capGradient)" />
        <circle cx="780" cy="22" r="15" fill="none" stroke="rgba(120,53,15,0.5)" strokeWidth="2" />
        <circle cx="780" cy="22" r="6" fill="#78350f" />
        
        <rect x="20" y="44" width="760" height="16" fill="url(#shadowGradientTop)" />
        <defs>
          <linearGradient id="shadowGradientTop" x1="0%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" stopColor="rgba(120,53,15,0.3)" />
            <stop offset="100%" stopColor="rgba(120,53,15,0)" />
          </linearGradient>
        </defs>
      </svg>
    </div>
    
    {/* Parchment content area */}
    <div className="relative -mt-1 mx-[5%] bg-gradient-to-b from-amber-100 via-amber-50 to-amber-100 
                    shadow-[inset_12px_0_20px_-12px_rgba(120,53,15,0.25),inset_-12px_0_20px_-12px_rgba(120,53,15,0.25)]
                    border-l-2 border-r-2 border-amber-300/40
                    px-4 md:px-8 py-4">
      <div 
        className="absolute inset-0 pointer-events-none opacity-30"
        style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 400 400' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noiseFilter'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.8' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noiseFilter)'/%3E%3C/svg%3E")`,
        }}
      />
      
      <div className="absolute top-10 left-10 w-32 h-32 bg-amber-200/20 rounded-full blur-2xl pointer-events-none" />
      <div className="absolute bottom-20 right-16 w-40 h-40 bg-orange-200/15 rounded-full blur-3xl pointer-events-none" />
      
      <div className="relative z-10">
        {children}
      </div>
    </div>
    
    {/* Bottom scroll roll */}
    <div className="relative h-12 md:h-14">
      <svg 
        className="absolute inset-x-0 top-0 w-full h-full overflow-visible" 
        viewBox="0 0 800 60" 
        preserveAspectRatio="xMidYMin meet"
        style={{ filter: 'drop-shadow(0 4px 6px rgba(0,0,0,0.3))' }}
      >
        <defs>
          <linearGradient id="rollGradientBottom" x1="0%" y1="100%" x2="0%" y2="0%">
            <stop offset="0%" stopColor="#92400e" />
            <stop offset="20%" stopColor="#b45309" />
            <stop offset="40%" stopColor="#d97706" />
            <stop offset="60%" stopColor="#b45309" />
            <stop offset="80%" stopColor="#92400e" />
            <stop offset="100%" stopColor="#78350f" />
          </linearGradient>
          <linearGradient id="shadowGradientBottom" x1="0%" y1="100%" x2="0%" y2="0%">
            <stop offset="0%" stopColor="rgba(120,53,15,0.3)" />
            <stop offset="100%" stopColor="rgba(120,53,15,0)" />
          </linearGradient>
        </defs>
        
        <rect x="20" y="0" width="760" height="16" fill="url(#shadowGradientBottom)" />
        <ellipse cx="400" cy="38" rx="390" ry="22" fill="url(#rollGradientBottom)" />
        <ellipse cx="400" cy="46" rx="370" ry="8" fill="rgba(255,255,255,0.15)" />
        
        <circle cx="20" cy="38" r="22" fill="url(#capGradient)" />
        <circle cx="20" cy="38" r="15" fill="none" stroke="rgba(120,53,15,0.5)" strokeWidth="2" />
        <circle cx="20" cy="38" r="6" fill="#78350f" />
        
        <circle cx="780" cy="38" r="22" fill="url(#capGradient)" />
        <circle cx="780" cy="38" r="15" fill="none" stroke="rgba(120,53,15,0.5)" strokeWidth="2" />
        <circle cx="780" cy="38" r="6" fill="#78350f" />
      </svg>
    </div>
  </div>
);

// Decorative scroll divider
export const ScrollDivider = ({ className = '' }) => (
  <div className={`flex items-center justify-center gap-4 ${className}`}>
    <div className="flex-1 h-px bg-gradient-to-r from-transparent via-amber-400/50 to-amber-400/50" />
    <div className="w-3 h-3 rotate-45 border-2 border-amber-400/50 bg-amber-200/50" />
    <div className="flex-1 h-px bg-gradient-to-l from-transparent via-amber-400/50 to-amber-400/50" />
  </div>
);

// Scroll page background
export const ScrollBackground = ({ children }) => (
  <div className="min-h-screen bg-gradient-to-b from-amber-900 via-amber-800 to-amber-900 pt-20 pb-10">
    {children}
  </div>
);

export default ScrollWrap;
