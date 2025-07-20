import http from 'http';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

// Get current directory
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Configuration
const PORT = 3000;
const PUBLIC_DIR = path.join(__dirname, 'public');
const DEFAULT_FILE = 'bible-characters.html';
// React-app integration --------------------------------------------------
//  • Set SERVE_REACT=false (env) to disable React fall-back completely
//  • Any request that starts with /react or /app will be routed to index.html
//    so React-Router can do its thing.
const SERVE_REACT = process.env.SERVE_REACT !== 'false';
const REACT_ENTRY = path.join(__dirname, 'index.html'); // Vite dev build output

// MIME types for different file extensions
const MIME_TYPES = {
  '.html': 'text/html',
  '.css': 'text/css',
  '.js': 'application/javascript',
  '.json': 'application/json',
  '.png': 'image/png',
  '.jpg': 'image/jpeg',
  '.jpeg': 'image/jpeg',
  '.gif': 'image/gif',
  '.svg': 'image/svg+xml',
  '.ico': 'image/x-icon',
};

// Create a simple HTTP server
const server = http.createServer((req, res) => {
  console.log(`${req.method} ${req.url}`);
  
  // Parse the URL to get the pathname
  let filePath;
  const cleanUrl = req.url.split('?')[0].split('#')[0];
  
  // ---------------------------------------------------------------------
  // 1) React routing support (  /react/*  or  /app/*  )
  // ---------------------------------------------------------------------
  const isReactRoute =
    SERVE_REACT && /^\/(?:react|app)(\/.*)?$/.test(cleanUrl ?? '');

  if (isReactRoute) {
    filePath = REACT_ENTRY;
    console.log(`[ROUTER] React route → ${filePath}`);
    serveFile(filePath, res);
    return;
  }

  // ---------------------------------------------------------------------
  // 2) Stand-alone HTML default handling
  // ---------------------------------------------------------------------
  if (cleanUrl === '/' || cleanUrl === '/index.html') {
    filePath = path.join(PUBLIC_DIR, DEFAULT_FILE);
    console.log(`[ROOT] Serving ${DEFAULT_FILE}`);
  } else {
    filePath = path.join(PUBLIC_DIR, cleanUrl);
  }
  
  // Check if the file exists
  fs.access(filePath, fs.constants.F_OK, (err) => {
    if (err) {
      console.log(`File not found: ${filePath}, serving default`);
      // If file not found, serve the default file
      filePath = path.join(PUBLIC_DIR, DEFAULT_FILE);
      serveFile(filePath, res);
      return;
    }
    
    serveFile(filePath, res);
  });
});

// Function to serve a file
function serveFile(filePath, res) {
  // Get the file extension
  const ext = path.extname(filePath);
  
  // Determine the content type
  const contentType = MIME_TYPES[ext] || 'application/octet-stream';
  
  // Read and serve the file
  fs.readFile(filePath, (err, data) => {
    if (err) {
      console.error(`[ERROR] reading file: ${filePath}`, err.code || err);
      res.writeHead(500, { 'Content-Type': 'text/plain' });
      res.end('500 Internal Server Error');
      return;
    }
    
    // Add cache control headers to prevent caching
    res.writeHead(200, {
      'Content-Type': contentType,
      'Cache-Control': 'no-store, no-cache, must-revalidate',
      'Pragma': 'no-cache',
      'Expires': '0'
    });
    
    res.end(data);
    console.log(`Successfully served: ${filePath}`);
  });
}

// Start the server
server.listen(PORT, () => {
  console.log(`\n==== BYPASS SERVER ====`);
  console.log(`Server running at http://localhost:${PORT}/`);
  console.log(`Serving files from: ${PUBLIC_DIR}`);
  console.log(`Default file: ${DEFAULT_FILE}`);
  console.log(`========================\n`);
});
