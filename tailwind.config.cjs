/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        primary: {
          50: '#f0f9ff',
          100: '#e0f2fe',
          200: '#bae6fd',
          300: '#7dd3fc',
          400: '#38bdf8',
          500: '#0ea5e9',
          600: '#0284c7',
          700: '#0369a1',
          800: '#075985',
          900: '#0c4a6e',
          950: '#082f49',
        },
        secondary: {
          50: '#f5f3ff',
          100: '#ede9fe',
          200: '#ddd6fe',
          300: '#c4b5fd',
          400: '#a78bfa',
          500: '#8b5cf6',
          600: '#7c3aed',
          700: '#6d28d9',
          800: '#5b21b6',
          900: '#4c1d95',
          950: '#2e1065',
        },
        // Custom colors for timeline nodes
        timeline: {
          node: '#7c3aed', // secondary-600
          line: '#d1d5db', // gray-300
          nodeActive: '#6d28d9', // secondary-700
          nodePulse: '#c4b5fd', // secondary-300
        },
      },
      animation: {
        'typing': 'typing 1.2s steps(3) infinite',
        // soft glowing pulse used for halo effects
        'halo': 'haloPulse 3s ease-in-out infinite',
        // cloud floating effects
        'float': 'float 10s ease-in-out infinite',
        'float-delayed': 'float 12s ease-in-out infinite 2s',
        'float-slow': 'float 20s ease-in-out infinite',
        // light-ray breathing effect
        'ray-pulse': 'ray-pulse 5s ease-in-out infinite',
      },
      keyframes: {
        typing: {
          '0%, 100%': { content: '"."' },
          '33%': { content: '".."' },
          '66%': { content: '"..."' },
        },
        haloPulse: {
          '0%, 100%': { opacity: '0.2', transform: 'scale(1)' },
          '50%': { opacity: '0.35', transform: 'scale(1.15)' },
        },
        float: {
          '0%, 100%': { transform: 'translateY(0)' },
          '50%': { transform: 'translateY(-10px)' },
        }
      },
      /* Perspective utilities for 3-D card carousel */
      perspective: {
        none: 'none',
        500: '500px',
        1000: '1000px',
      },
      // Animation delay utilities for typing indicators
      animationDelay: {
        100: '100ms',
        200: '200ms',
        300: '300ms',
        400: '400ms',
        500: '500ms',
      },
    },
  },
  plugins: [
    /* Line-clamp for text truncation */
    require('@tailwindcss/line-clamp'),

    /* Perspective utility generator  */
    function ({ matchUtilities, theme }) {
      matchUtilities(
        {
          perspective: (value) => ({
            perspective: value,
          }),
        },
        { values: theme('perspective') }
      );
    },

    // Plugin to generate animation-delay utilities
    function ({ matchUtilities, theme }) {
      matchUtilities(
        {
          'animation-delay': (value) => {
            return {
              'animation-delay': value,
            };
          },
        },
        {
          values: theme('animationDelay'),
        }
      );
    },
  ],
}
