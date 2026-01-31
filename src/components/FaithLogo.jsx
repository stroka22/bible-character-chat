import React from 'react';

/**
 * Bible Icon Component - A book-shaped Bible with cross
 */
export const BibleIcon = ({ size = 24, variant = 'light', className = '' }) => {
  const colors = {
    dark: {
      cover: '#2A3F5F',
      pages: '#f5f5dc',
      cross: '#FACC15',
      spine: '#1a2a3f',
      ribbon: '#dc2626',
    },
    light: {
      cover: '#78350f',
      pages: '#fef3c7',
      cross: '#FACC15',
      spine: '#451a03',
      ribbon: '#dc2626',
    },
  };
  
  const c = colors[variant] || colors.light;
  
  return (
    <svg 
      xmlns="http://www.w3.org/2000/svg" 
      viewBox="0 0 100 100"
      width={size}
      height={size}
      className={className}
    >
      <defs>
        {/* Book cover gradient */}
        <linearGradient id={`bookCover-${variant}`} x1="0%" y1="0%" x2="100%" y2="0%">
          <stop offset="0%" stopColor={c.spine} />
          <stop offset="15%" stopColor={c.cover} />
          <stop offset="85%" stopColor={c.cover} />
          <stop offset="100%" stopColor={c.spine} />
        </linearGradient>
        {/* Page edges gradient */}
        <linearGradient id={`pageEdges-${variant}`} x1="0%" y1="0%" x2="100%" y2="0%">
          <stop offset="0%" stopColor="#d4d4d4" />
          <stop offset="50%" stopColor="#fafafa" />
          <stop offset="100%" stopColor="#d4d4d4" />
        </linearGradient>
      </defs>
      
      {/* Book shadow */}
      <ellipse cx="52" cy="92" rx="35" ry="6" fill="rgba(0,0,0,0.2)" />
      
      {/* Back cover */}
      <path 
        d="M15 12 L15 82 Q15 88 21 88 L79 88 Q85 88 85 82 L85 12 Q85 6 79 6 L21 6 Q15 6 15 12 Z"
        fill={c.spine}
      />
      
      {/* Page block (visible at bottom) */}
      <rect x="20" y="78" width="60" height="8" rx="1" fill={`url(#pageEdges-${variant})`} />
      
      {/* Front cover */}
      <path 
        d="M12 10 L12 80 Q12 86 18 86 L82 86 Q88 86 88 80 L88 10 Q88 4 82 4 L18 4 Q12 4 12 10 Z"
        fill={`url(#bookCover-${variant})`}
      />
      
      {/* Spine detail */}
      <rect x="12" y="4" width="8" height="82" rx="2" fill={c.spine} opacity="0.5" />
      
      {/* Cover border/emboss */}
      <rect x="22" y="12" width="56" height="66" rx="2" fill="none" stroke={c.cross} strokeWidth="2" opacity="0.6" />
      
      {/* Cross on cover */}
      <g>
        {/* Vertical bar */}
        <rect x="46" y="22" width="8" height="46" rx="1" fill={c.cross} />
        {/* Horizontal bar */}
        <rect x="32" y="32" width="36" height="8" rx="1" fill={c.cross} />
        {/* Cross glow effect */}
        <rect x="46" y="22" width="8" height="46" rx="1" fill="white" opacity="0.3" />
        <rect x="32" y="32" width="36" height="8" rx="1" fill="white" opacity="0.3" />
      </g>
      
      {/* Ribbon bookmark */}
      <path 
        d="M70 4 L70 25 L74 20 L78 25 L78 4"
        fill={c.ribbon}
      />
      
      {/* Page edges visible on right side */}
      <path 
        d="M88 15 L90 15 L90 75 L88 75"
        fill="#e5e5e5"
        stroke="#d4d4d4"
        strokeWidth="0.5"
      />
    </svg>
  );
};

/**
 * FaithLogo Component
 * 
 * A reusable component for the FaithTalkAI logo with Bible icon
 */
const FaithLogo = ({ 
  variant = 'dark', 
  size = 'md', 
  className = '',
  ...props
}) => {
  const colors = {
    dark: {
      text: '#2A3F5F',
      ai: '#FACC15',
    },
    light: {
      text: '#FFFFFF',
      ai: '#FACC15',
    },
  };

  const sizes = {
    sm: { height: 24, fontSize: 16, iconSize: 22 },
    md: { height: 32, fontSize: 20, iconSize: 28 },
    lg: { height: 48, fontSize: 28, iconSize: 40 },
    xl: { height: 64, fontSize: 36, iconSize: 52 }
  };

  const sizeValues = typeof size === 'number' 
    ? { height: size, fontSize: size * 0.6, iconSize: size * 0.8 } 
    : sizes[size] || sizes.md;

  return (
    <div 
      className={`flex items-center ${className}`}
      style={{ height: sizeValues.height }}
      {...props}
    >
      {/* Bible Icon */}
      <div className="relative mr-2 flex-shrink-0">
        <BibleIcon 
          size={sizeValues.iconSize} 
          variant={variant === 'light' ? 'light' : 'dark'} 
        />
      </div>

      {/* Text: FaithTalk */}
      <div className="flex items-center font-bold tracking-tight transition-colors duration-300">
        <span 
          className="transition-colors duration-300 font-medium" 
          style={{ 
            color: colors[variant].text,
            fontSize: sizeValues.fontSize
          }}
        >
          Faith<span className="font-bold">Talk</span>
        </span>
        
        {/* AI (highlighted) */}
        <span 
          className="font-extrabold ml-1 transition-colors duration-300" 
          style={{ 
            color: colors[variant].ai,
            fontSize: sizeValues.fontSize
          }}
        >
          AI
        </span>
      </div>
    </div>
  );
};

export default FaithLogo;
