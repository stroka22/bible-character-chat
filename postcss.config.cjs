/**
 * PostCSS configuration
 * Uses the standard Tailwind CSS PostCSS plugin.
 * The configuration is exported via CommonJS (`module.exports`) since many
 * PostCSS tools expect this format.
 */

module.exports = {
  plugins: {
    // Standard Tailwind CSS PostCSS plugin (v3.x)
    tailwindcss: {},
    autoprefixer: {},
  },
};
