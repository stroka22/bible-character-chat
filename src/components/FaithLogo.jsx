import React from 'react';

/**
 * FaithLogo Component
 * 
 * A reusable component for the FaithTalkAI logo
 * 
 * @param {Object} props
 * @param {('light'|'dark')} [props.variant='dark'] - Color variant (light for white text, dark for blue text)
 * @param {('sm'|'md'|'lg'|'xl'|number)} [props.size='md'] - Size of the logo
 * @param {string} [props.className] - Additional CSS classes
 * @returns {JSX.Element} The FaithTalkAI logo
 */
const FaithLogo = ({ 
  variant = 'dark', 
  size = 'md', 
  className = '',
  ...props
}) => {
  // Define color scheme based on variant
  const colors = {
    dark: {
      text: '#2A3F5F',        // Navy
      bubble: '#2A3F5F',      // Navy
      cross: '#FACC15',       // Gold
      ai: '#FACC15',          // Gold
    },
    light: {
      text: '#FFFFFF',        // White
      bubble: '#FFFFFF',      // White outline
      cross: '#FACC15',       // Gold
      ai: '#FACC15',          // Gold
    },
  };

  // Define sizes (in pixels)
  const sizes = {
    sm: { height: 24, fontSize: 16, iconSize: 20 },
    md: { height: 32, fontSize: 20, iconSize: 24 },
    lg: { height: 48, fontSize: 28, iconSize: 36 },
    xl: { height: 64, fontSize: 36, iconSize: 48 }
  };

  // Determine actual size values
  const sizeValues = typeof size === 'number' 
    ? { height: size, fontSize: size * 0.6, iconSize: size * 0.75 } 
    : sizes[size] || sizes.md;

  return (
    <div 
      className={`flex items-center ${className}`}
      style={{ height: sizeValues.height }}
      {...props}
    >
      {/* Speech Bubble with Cross Icon */}
      <div
        className="relative mr-2 flex-shrink-0"
        style={{ height: sizeValues.iconSize, width: sizeValues.iconSize }}
      >
        <svg 
          xmlns="http://www.w3.org/2000/svg" 
          viewBox="0 0 100 100"
          height={sizeValues.iconSize} 
          width={sizeValues.iconSize}
          fill="none"
          stroke={colors[variant].bubble}
          strokeWidth="6"
          className="transition-colors duration-300"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          {/* Speech Bubble */}
          <path
            d="
              M50 8
              C72 8 88 23 88 42
              C88 60 72 74 52 74
              C48 74 42 73 38 72
              L20 86
              L22 66
              C14 58 12 50 12 42
              C12 23 28 8 50 8
            "
          />
          
          {/* Cross */}
          <path 
            d="M35 42 L65 42 M50 27 L50 57"
            stroke={colors[variant].cross}
            strokeWidth="8"
            strokeLinecap="round"
          />
        </svg>
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
