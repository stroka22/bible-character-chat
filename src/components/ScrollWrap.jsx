import React from 'react';

// Realistic scroll wrap container with aged parchment and wooden rollers
export const ScrollWrap = ({ children, className = '' }) => (
  <div className={`relative ${className}`}>
    {/* Top scroll roll - enhanced SVG */}
    <div className="relative h-16 md:h-20">
      <svg 
        className="absolute inset-x-0 top-0 w-full h-full overflow-visible" 
        viewBox="0 0 800 80" 
        preserveAspectRatio="xMidYMax meet"
      >
        <defs>
          {/* Wood grain pattern */}
          <pattern id="woodGrain" patternUnits="userSpaceOnUse" width="100" height="10">
            <rect width="100" height="10" fill="#a16207"/>
            <path d="M0,2 Q25,0 50,3 T100,2" stroke="#92400e" strokeWidth="0.5" fill="none" opacity="0.6"/>
            <path d="M0,5 Q25,7 50,4 T100,6" stroke="#78350f" strokeWidth="0.3" fill="none" opacity="0.4"/>
            <path d="M0,8 Q25,6 50,9 T100,7" stroke="#92400e" strokeWidth="0.4" fill="none" opacity="0.5"/>
          </pattern>
          
          {/* Main roll gradient with more depth */}
          <linearGradient id="rollGradientTopMain" x1="0%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" stopColor="#78350f" />
            <stop offset="8%" stopColor="#92400e" />
            <stop offset="20%" stopColor="#b45309" />
            <stop offset="35%" stopColor="#d97706" />
            <stop offset="50%" stopColor="#f59e0b" />
            <stop offset="65%" stopColor="#d97706" />
            <stop offset="80%" stopColor="#b45309" />
            <stop offset="92%" stopColor="#92400e" />
            <stop offset="100%" stopColor="#78350f" />
          </linearGradient>
          
          {/* Specular highlight */}
          <linearGradient id="rollHighlight" x1="0%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" stopColor="transparent" />
            <stop offset="30%" stopColor="rgba(255,255,255,0.3)" />
            <stop offset="50%" stopColor="rgba(255,255,255,0.1)" />
            <stop offset="100%" stopColor="transparent" />
          </linearGradient>
          
          {/* End cap with carved detail */}
          <radialGradient id="capGradientEnhanced" cx="30%" cy="30%" r="70%">
            <stop offset="0%" stopColor="#d97706" />
            <stop offset="40%" stopColor="#b45309" />
            <stop offset="70%" stopColor="#92400e" />
            <stop offset="100%" stopColor="#78350f" />
          </radialGradient>
          
          {/* Inner cap shadow */}
          <radialGradient id="capInnerShadow" cx="50%" cy="50%" r="50%">
            <stop offset="0%" stopColor="#451a03" />
            <stop offset="60%" stopColor="#78350f" />
            <stop offset="100%" stopColor="#92400e" />
          </radialGradient>
          
          {/* Shadow under roll */}
          <linearGradient id="rollShadowTop" x1="0%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" stopColor="rgba(69,26,3,0.5)" />
            <stop offset="50%" stopColor="rgba(69,26,3,0.2)" />
            <stop offset="100%" stopColor="rgba(69,26,3,0)" />
          </linearGradient>
          
          {/* Parchment edge curl shadow */}
          <linearGradient id="parchmentCurl" x1="0%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" stopColor="rgba(120,53,15,0.4)" />
            <stop offset="100%" stopColor="rgba(245,233,210,0)" />
          </linearGradient>
          
          {/* Drop shadow filter */}
          <filter id="rollDropShadow" x="-20%" y="-20%" width="140%" height="140%">
            <feDropShadow dx="0" dy="4" stdDeviation="4" floodColor="#451a03" floodOpacity="0.4"/>
          </filter>
          
          {/* Emboss filter for wood texture */}
          <filter id="woodEmboss">
            <feGaussianBlur in="SourceAlpha" stdDeviation="1" result="blur"/>
            <feOffset in="blur" dx="1" dy="1" result="offsetBlur"/>
            <feComposite in="SourceGraphic" in2="offsetBlur" operator="over"/>
          </filter>
        </defs>
        
        {/* Main wooden roll body */}
        <ellipse cx="400" cy="30" rx="385" ry="28" fill="url(#rollGradientTopMain)" filter="url(#rollDropShadow)"/>
        
        {/* Wood grain overlay */}
        <ellipse cx="400" cy="30" rx="383" ry="26" fill="url(#woodGrain)" opacity="0.3"/>
        
        {/* Specular highlight on roll */}
        <ellipse cx="400" cy="20" rx="360" ry="12" fill="url(#rollHighlight)"/>
        
        {/* Subtle ring details on roll */}
        <ellipse cx="400" cy="30" rx="385" ry="28" fill="none" stroke="rgba(120,53,15,0.3)" strokeWidth="1"/>
        <ellipse cx="400" cy="30" rx="375" ry="24" fill="none" stroke="rgba(69,26,3,0.15)" strokeWidth="0.5"/>
        
        {/* Left end cap - more detailed */}
        <circle cx="22" cy="30" r="28" fill="url(#capGradientEnhanced)" filter="url(#rollDropShadow)"/>
        <circle cx="22" cy="30" r="22" fill="none" stroke="rgba(120,53,15,0.6)" strokeWidth="2"/>
        <circle cx="22" cy="30" r="16" fill="none" stroke="rgba(120,53,15,0.4)" strokeWidth="1.5"/>
        <circle cx="22" cy="30" r="10" fill="url(#capInnerShadow)"/>
        <circle cx="22" cy="30" r="5" fill="#451a03"/>
        <circle cx="19" cy="27" r="3" fill="rgba(255,255,255,0.2)"/>
        
        {/* Right end cap - more detailed */}
        <circle cx="778" cy="30" r="28" fill="url(#capGradientEnhanced)" filter="url(#rollDropShadow)"/>
        <circle cx="778" cy="30" r="22" fill="none" stroke="rgba(120,53,15,0.6)" strokeWidth="2"/>
        <circle cx="778" cy="30" r="16" fill="none" stroke="rgba(120,53,15,0.4)" strokeWidth="1.5"/>
        <circle cx="778" cy="30" r="10" fill="url(#capInnerShadow)"/>
        <circle cx="778" cy="30" r="5" fill="#451a03"/>
        <circle cx="775" cy="27" r="3" fill="rgba(255,255,255,0.2)"/>
        
        {/* Shadow cast onto parchment */}
        <path d="M30,58 Q400,70 770,58 L770,80 Q400,75 30,80 Z" fill="url(#rollShadowTop)"/>
      </svg>
    </div>
    
    {/* Parchment content area - enhanced aging effects */}
    <div className="relative -mt-3 mx-[3%]">
      {/* Outer edge curl effect */}
      <div className="absolute inset-0 rounded-sm"
           style={{
             boxShadow: `
               inset 8px 0 12px -4px rgba(120,53,15,0.3),
               inset -8px 0 12px -4px rgba(120,53,15,0.3),
               inset 0 8px 12px -4px rgba(120,53,15,0.2),
               inset 0 -8px 12px -4px rgba(120,53,15,0.2),
               4px 0 8px -2px rgba(0,0,0,0.1),
               -4px 0 8px -2px rgba(0,0,0,0.1)
             `
           }}
      />
      
      {/* Main parchment background with realistic color */}
      <div className="relative bg-gradient-to-b from-[#f5e6d3] via-[#faf6f0] to-[#f5e6d3] px-5 md:px-10 py-6"
           style={{
             backgroundImage: `
               linear-gradient(to bottom, #f5e6d3 0%, #faf6f0 15%, #fdf9f3 50%, #faf6f0 85%, #f5e6d3 100%)
             `
           }}
      >
        {/* Paper fiber texture */}
        <div 
          className="absolute inset-0 pointer-events-none opacity-[0.15]"
          style={{
            backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noise'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noise)'/%3E%3C/svg%3E")`,
          }}
        />
        
        {/* Aged spots and foxing */}
        <div className="absolute top-[8%] left-[12%] w-20 h-16 bg-amber-300/10 rounded-full blur-xl pointer-events-none" />
        <div className="absolute top-[15%] right-[8%] w-12 h-12 bg-amber-400/8 rounded-full blur-lg pointer-events-none" />
        <div className="absolute bottom-[20%] left-[5%] w-24 h-20 bg-amber-200/12 rounded-full blur-2xl pointer-events-none" />
        <div className="absolute bottom-[12%] right-[15%] w-16 h-14 bg-orange-200/10 rounded-full blur-xl pointer-events-none" />
        <div className="absolute top-[40%] left-[25%] w-8 h-8 bg-amber-300/8 rounded-full blur-md pointer-events-none" />
        <div className="absolute top-[60%] right-[30%] w-10 h-10 bg-amber-200/10 rounded-full blur-lg pointer-events-none" />
        
        {/* Water stain effect */}
        <div className="absolute top-[5%] right-[20%] w-32 h-28 pointer-events-none"
             style={{
               background: 'radial-gradient(ellipse at center, transparent 40%, rgba(194,166,128,0.08) 60%, transparent 75%)',
               transform: 'rotate(-15deg)'
             }}
        />
        
        {/* Subtle fold/crease lines */}
        <div className="absolute inset-y-0 left-1/3 w-px bg-gradient-to-b from-transparent via-amber-400/10 to-transparent pointer-events-none" />
        <div className="absolute inset-y-0 right-1/3 w-px bg-gradient-to-b from-transparent via-amber-400/8 to-transparent pointer-events-none" />
        
        {/* Darkened edges (vignette effect) */}
        <div className="absolute inset-0 pointer-events-none"
             style={{
               background: 'radial-gradient(ellipse at center, transparent 50%, rgba(120,53,15,0.06) 100%)'
             }}
        />
        
        {/* Top edge wear */}
        <div className="absolute top-0 left-0 right-0 h-3 pointer-events-none"
             style={{
               background: 'linear-gradient(to bottom, rgba(120,53,15,0.12), transparent)'
             }}
        />
        
        {/* Bottom edge wear */}
        <div className="absolute bottom-0 left-0 right-0 h-3 pointer-events-none"
             style={{
               background: 'linear-gradient(to top, rgba(120,53,15,0.12), transparent)'
             }}
        />
        
        {/* Content */}
        <div className="relative z-10">
          {children}
        </div>
      </div>
    </div>
    
    {/* Bottom scroll roll - enhanced */}
    <div className="relative h-16 md:h-20 -mt-3">
      <svg 
        className="absolute inset-x-0 bottom-0 w-full h-full overflow-visible" 
        viewBox="0 0 800 80" 
        preserveAspectRatio="xMidYMin meet"
      >
        <defs>
          <linearGradient id="rollGradientBottomMain" x1="0%" y1="100%" x2="0%" y2="0%">
            <stop offset="0%" stopColor="#78350f" />
            <stop offset="8%" stopColor="#92400e" />
            <stop offset="20%" stopColor="#b45309" />
            <stop offset="35%" stopColor="#d97706" />
            <stop offset="50%" stopColor="#f59e0b" />
            <stop offset="65%" stopColor="#d97706" />
            <stop offset="80%" stopColor="#b45309" />
            <stop offset="92%" stopColor="#92400e" />
            <stop offset="100%" stopColor="#78350f" />
          </linearGradient>
          
          <linearGradient id="rollShadowBottom" x1="0%" y1="100%" x2="0%" y2="0%">
            <stop offset="0%" stopColor="rgba(69,26,3,0.5)" />
            <stop offset="50%" stopColor="rgba(69,26,3,0.2)" />
            <stop offset="100%" stopColor="rgba(69,26,3,0)" />
          </linearGradient>
        </defs>
        
        {/* Shadow cast from parchment onto roll */}
        <path d="M30,0 Q400,5 770,0 L770,22 Q400,10 30,22 Z" fill="url(#rollShadowBottom)"/>
        
        {/* Main wooden roll body */}
        <ellipse cx="400" cy="50" rx="385" ry="28" fill="url(#rollGradientBottomMain)" filter="url(#rollDropShadow)"/>
        
        {/* Wood grain overlay */}
        <ellipse cx="400" cy="50" rx="383" ry="26" fill="url(#woodGrain)" opacity="0.3"/>
        
        {/* Specular highlight on roll */}
        <ellipse cx="400" cy="60" rx="360" ry="12" fill="url(#rollHighlight)"/>
        
        {/* Ring details */}
        <ellipse cx="400" cy="50" rx="385" ry="28" fill="none" stroke="rgba(120,53,15,0.3)" strokeWidth="1"/>
        
        {/* Left end cap */}
        <circle cx="22" cy="50" r="28" fill="url(#capGradientEnhanced)" filter="url(#rollDropShadow)"/>
        <circle cx="22" cy="50" r="22" fill="none" stroke="rgba(120,53,15,0.6)" strokeWidth="2"/>
        <circle cx="22" cy="50" r="16" fill="none" stroke="rgba(120,53,15,0.4)" strokeWidth="1.5"/>
        <circle cx="22" cy="50" r="10" fill="url(#capInnerShadow)"/>
        <circle cx="22" cy="50" r="5" fill="#451a03"/>
        <circle cx="19" cy="47" r="3" fill="rgba(255,255,255,0.2)"/>
        
        {/* Right end cap */}
        <circle cx="778" cy="50" r="28" fill="url(#capGradientEnhanced)" filter="url(#rollDropShadow)"/>
        <circle cx="778" cy="50" r="22" fill="none" stroke="rgba(120,53,15,0.6)" strokeWidth="2"/>
        <circle cx="778" cy="50" r="16" fill="none" stroke="rgba(120,53,15,0.4)" strokeWidth="1.5"/>
        <circle cx="778" cy="50" r="10" fill="url(#capInnerShadow)"/>
        <circle cx="778" cy="50" r="5" fill="#451a03"/>
        <circle cx="775" cy="47" r="3" fill="rgba(255,255,255,0.2)"/>
      </svg>
    </div>
  </div>
);

// Decorative scroll divider with ornate design
export const ScrollDivider = ({ className = '' }) => (
  <div className={`flex items-center justify-center gap-3 py-2 ${className}`}>
    <div className="flex-1 h-px bg-gradient-to-r from-transparent via-amber-600/30 to-amber-600/40" />
    <svg className="w-8 h-8 text-amber-700/50" viewBox="0 0 32 32">
      <path d="M16 4 L20 12 L28 14 L22 20 L24 28 L16 24 L8 28 L10 20 L4 14 L12 12 Z" 
            fill="currentColor" opacity="0.3"/>
      <circle cx="16" cy="16" r="4" fill="currentColor" opacity="0.5"/>
    </svg>
    <div className="flex-1 h-px bg-gradient-to-l from-transparent via-amber-600/30 to-amber-600/40" />
  </div>
);

// Scroll page background with subtle texture
export const ScrollBackground = ({ children }) => (
  <div className="min-h-screen pt-20 pb-10"
       style={{
         background: `
           radial-gradient(ellipse at top, #92400e 0%, #78350f 50%, #451a03 100%)
         `
       }}
  >
    {/* Subtle vignette overlay */}
    <div className="fixed inset-0 pointer-events-none"
         style={{
           background: 'radial-gradient(ellipse at center, transparent 30%, rgba(0,0,0,0.3) 100%)'
         }}
    />
    <div className="relative z-10">
      {children}
    </div>
  </div>
);

export default ScrollWrap;
