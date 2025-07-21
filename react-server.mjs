#!/usr/bin/env node
/**
 * react-server.mjs - Dedicated server for the Bible Character Chat React app
 * 
 * This server is specifically designed to serve the React application properly,
 * avoiding redirection issues and ensuring client-side routing works correctly.
 */

import http from 'http';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

// Get current directory
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Configuration
const PORT = process.env.PORT || 5175;
const INDEX_HTML = path.join(__dirname, 'index.html');
const PUBLIC_DIR = path.join(__dirname, 'public');
const DIST_DIR = path.join(__dirname, 'dist'); // For production builds
const SRC_DIR = path.join(__dirname, 'src');   // For development
// When true we *always* serve the React SPA (except for SW cleanup and
// obvious static assets).  Useful for environments where legacy standalone
// HTML files must be ignored.
const FORCE_REACT = process.env.FORCE_REACT === 'true';

// MIME types for different file extensions
const MIME_TYPES = {
  '.html': 'text/html',
  '.css': 'text/css',
  '.js': 'application/javascript',
  '.mjs': 'application/javascript',
  '.json': 'application/json',
  '.png': 'image/png',
  '.jpg': 'image/jpeg',
  '.jpeg': 'image/jpeg',
  '.gif': 'image/gif',
  '.svg': 'image/svg+xml',
  '.ico': 'image/x-icon',
  '.woff': 'font/woff',
  '.woff2': 'font/woff2',
  '.ttf': 'font/ttf',
  '.eot': 'application/vnd.ms-fontobject',
  '.otf': 'font/otf',
  '.map': 'application/json',
};

/**
 * Injects the service worker cleanup script into HTML if not already present
 */
function injectServiceWorkerCleanup(html) {
  if (html.includes('service-worker-cleanup.js')) {
    return html; // Already includes the script
  }

  // Add the script right before the closing head tag
  return html.replace(
    '</head>',
    '  <script id="sw-cleanup" src="/service-worker-cleanup.js"></script>\n</head>'
  );
}

/**
 * Serves a file with appropriate headers
 */
function serveFile(filePath, res, headers = {}) {
  fs.readFile(filePath, (err, data) => {
    if (err) {
      if (err.code === 'ENOENT') {
        // For missing static files, return 404
        if (!filePath.endsWith('index.html')) {
          console.error(`[404] File not found: ${filePath}`);
          res.writeHead(404, { 'Content-Type': 'text/plain' });
          res.end('404 Not Found');
          return;
        }
        
        // For routes that should be handled by React Router, serve index.html
        console.log(`[SPA] Route not found, serving index.html for: ${filePath}`);
        return serveFile(INDEX_HTML, res, headers);
      }
      
      // For other errors, return 500
      console.error(`[500] Error reading file: ${filePath}`, err);
      res.writeHead(500, { 'Content-Type': 'text/plain' });
      res.end('500 Internal Server Error');
      return;
    }
    
    // Get the file extension
    const ext = path.extname(filePath).toLowerCase();
    
    // Set content type based on file extension
    const contentType = MIME_TYPES[ext] || 'application/octet-stream';
    
    // Set cache control headers
    const responseHeaders = {
      'Content-Type': contentType,
      'Cache-Control': 'no-store, no-cache, must-revalidate, proxy-revalidate',
      'Pragma': 'no-cache',
      'Expires': '0',
      'Surrogate-Control': 'no-store',
      ...headers
    };
    
    // For HTML files, inject service worker cleanup script
    if (ext === '.html') {
      const html = data.toString();
      const modifiedHtml = injectServiceWorkerCleanup(html);
      res.writeHead(200, responseHeaders);
      res.end(modifiedHtml);
      return;
    }
    
    // For other files, serve as-is
    res.writeHead(200, responseHeaders);
    res.end(data);
  });
}

/**
 * Checks if a file exists
 */
function fileExists(filePath) {
  try {
    return fs.statSync(filePath).isFile();
  } catch (err) {
    return false;
  }
}

/**
 * Resolves a file path, checking multiple directories
 */
function resolveFilePath(urlPath) {
  // Remove query parameters and hash
  const cleanPath = urlPath.split('?')[0].split('#')[0];
  
  // Default to index.html for root path
  const relativePath = cleanPath === '/' ? '/index.html' : cleanPath;

  /* ------------------------------------------------------------------
   * 0. Short-circuit: force SPA rendering when env flag is set
   * ---------------------------------------------------------------- */
  if (FORCE_REACT) {
    // allow the service-worker cleanup script to pass through
    if (relativePath.endsWith('/service-worker-cleanup.js')) {
      return path.join(PUBLIC_DIR, 'service-worker-cleanup.js');
    }
    return INDEX_HTML;
  }
  
  // Check if file exists in public directory
  const publicPath = path.join(PUBLIC_DIR, relativePath);
  if (fileExists(publicPath)) {
    // Never serve standalone *.html files from /public – they belong to the
    // old demo build and would shadow the React SPA.  CSS/JS/images are OK.
    if (path.extname(relativePath).toLowerCase() !== '.html') {
      return publicPath;
    }
  }
  
  // Check if file exists in dist directory (for production builds)
  const distPath = path.join(DIST_DIR, relativePath);
  if (fileExists(distPath)) {
    return distPath;
  }
  
  // Check if file exists in src directory (for development)
  const srcPath = path.join(SRC_DIR, relativePath);
  if (fileExists(srcPath)) {
    return srcPath;
  }
  
  // For static assets that don't exist, return null to trigger 404
  if (path.extname(relativePath) !== '') {
    return null;
  }
  
  // For routes that should be handled by React Router, return index.html
  return INDEX_HTML;
}

// Create HTTP server
const server = http.createServer((req, res) => {
  const timestamp = new Date().toISOString().split('T')[1].slice(0, 8);
  console.log(`[${timestamp}] ${req.method} ${req.url}`);
  
  // Handle CORS for development
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  
  // Handle OPTIONS requests (CORS preflight)
  if (req.method === 'OPTIONS') {
    res.writeHead(204);
    res.end();
    return;
  }
  
  // Only handle GET requests
  if (req.method !== 'GET') {
    res.writeHead(405, { 'Content-Type': 'text/plain' });
    res.end('Method Not Allowed');
    return;
  }
  
  try {
    // Special case for service-worker-cleanup.js
    if (req.url.endsWith('/service-worker-cleanup.js')) {
      const swCleanupPath = path.join(PUBLIC_DIR, 'service-worker-cleanup.js');
      if (fileExists(swCleanupPath)) {
        serveFile(swCleanupPath, res);
        return;
      }
    }
    
    // Resolve the file path
    const filePath = resolveFilePath(req.url);
    
    // If file doesn't exist, serve index.html for client-side routing
    if (!filePath) {
      console.log(`[SPA] File not found, serving index.html for: ${req.url}`);
      serveFile(INDEX_HTML, res);
      return;
    }
    
    // Serve the file
    serveFile(filePath, res);
  } catch (err) {
    console.error(`[ERROR] Unhandled exception:`, err);
    res.writeHead(500, { 'Content-Type': 'text/plain' });
    res.end('500 Internal Server Error');
  }
});

// Start the server
server.listen(PORT, () => {
  console.log(`
┌───────────────────────────────────────────────┐
│                                               │
│   Bible Character Chat - React Server         │
│                                               │
│   🚀 Server running at http://localhost:${PORT}   │
│                                               │
│   • All routes serve the React app            │
│   • Service worker cleanup enabled            │
│   • Cache headers prevent redirection issues  │
│                                               │
└───────────────────────────────────────────────┘
`);
});

// Handle server errors
server.on('error', (err) => {
  if (err.code === 'EADDRINUSE') {
    console.error(`
┌───────────────────────────────────────────────┐
│                                               │
│   ❌ ERROR: Port ${PORT} is already in use        │
│                                               │
│   Try a different port:                       │
│   node react-server.mjs PORT=5176             │
│                                               │
└───────────────────────────────────────────────┘
`);
  } else {
    console.error(`Server error:`, err);
  }
  process.exit(1);
});

// Handle process termination
process.on('SIGINT', () => {
  console.log('\nShutting down server...');
  server.close(() => {
    console.log('Server stopped');
    process.exit(0);
  });
});
