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
      text: '#2A3F5F', // Dark blue
      bubble: '#2A3F5F', // Dark blue
      cross: '#FACC15', // Yellow/gold
      ai: '#FACC15', // Yellow/gold
    },
    light: {
      text: '#FFFFFF', // White
      bubble: '#FFFFFF', // White
      cross: '#FACC15', // Yellow/gold
      ai: '#FACC15', // Yellow/gold
    }
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
      <div className="relative mr-2" style={{ height: sizeValues.iconSize, width: sizeValues.iconSize }}>
        <svg 
          xmlns="http://www.w3.org/2000/svg" 
          viewBox="0 0 100 100"
          height={sizeValues.iconSize} 
          width={sizeValues.iconSize}
          fill="none"
          stroke={colors[variant].bubble}
          strokeWidth="6"
          className="transition-colors duration-300"
        >
          {/* Speech Bubble */}
          <path 
            d="M85 40C85 61.5 65.5 75 50 75C45.5 75 35.5 74 30 72.5L15 85L15 65C8 58.5 15 40 15 40C15 18.5 30.5 5 50 5C69.5 5 85 18.5 85 40Z" 
          />
          
          {/* Cross */}
          <path 
            d="M35 40L65 40M50 25L50 55" 
            stroke={colors[variant].cross}
            strokeWidth="8"
            strokeLinecap="round"
          />
        </svg>
      </div>

      {/* Text: FaithTalk */}
      <div className="flex items-center font-bold tracking-tight transition-colors duration-300">
        <span 
          className="font-semibold transition-colors duration-300" 
          style={{ 
            color: colors[variant].text,
            fontSize: sizeValues.fontSize
          }}
        >
          Faith<span className="font-bold">Talk</span>
        </span>
        
        {/* AI (highlighted) */}
        <span 
          className="font-bold transition-colors duration-300" 
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
