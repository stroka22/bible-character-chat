// Amber/Parchment theme to match web scroll design
export const theme = {
  colors: {
    // Backgrounds - warm parchment tones
    background: '#fef3c7', // amber-100
    surface: '#fde68a',    // amber-200
    card: '#fffbeb',       // amber-50
    
    // Text colors
    text: '#78350f',       // amber-900
    muted: '#92400e',      // amber-800
    
    // Borders
    border: '#fcd34d',     // amber-300
    
    // Primary action color
    primary: '#d97706',    // amber-600
    primaryText: '#ffffff',
    
    // Accent for highlights
    accent: '#b45309',     // amber-700
    
    // Additional semantic colors
    success: '#16a34a',    // green-600
    error: '#dc2626',      // red-600
    warning: '#ca8a04',    // yellow-600
  },
  
  // Font families
  fonts: {
    heading: 'Cinzel_700Bold',  // Serif for headers
    body: 'System',              // System default
  },
};

export type Theme = typeof theme;
