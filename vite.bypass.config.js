import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { resolve } from 'path';

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  
  // Use the bypass entry point instead of the regular main.jsx
  build: {
    outDir: 'dist-bypass',
    rollupOptions: {
      input: {
        main: resolve(__dirname, 'index.html'),
      },
    },
    // Ensure source maps for easier debugging
    sourcemap: true,
  },
  
  // Override the default entry point
  resolve: {
    alias: {
      // Replace the standard entry point with our bypass version
      './src/main.jsx': './src/bypass-main.jsx'
    }
  },
  
  // Make environment variables available in the client
  define: {
    // Expose a BYPASS_MODE flag to the client
    'import.meta.env.BYPASS_MODE': JSON.stringify(true),
  },
  
  // Use a different port to avoid conflicts with the main app
  server: {
    port: 5180,
    strictPort: true,
    open: true,
  },
  
  // Customize the HTML title for the bypass version
  experimental: {
    renderBuiltUrl(filename) {
      // This helps avoid caching issues
      return '/' + filename + '?bypass=1';
    }
  }
});
