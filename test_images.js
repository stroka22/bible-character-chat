#!/usr/bin/env node

/**
 * test_images.js
 * 
 * This script tests if the Unsplash image URLs used in the CSV file are accessible
 * and have the proper CORS headers to allow embedding in our application.
 * 
 * Usage: node test_images.js
 * 
 * Requirements: Node 18+ (uses global fetch)
 */

async function fetchHead(url, options = {}) {
  return fetch(url, options);
}

// ANSI color codes for prettier console output
const COLORS = {
  reset: '\x1b[0m',
  bright: '\x1b[1m',
  dim: '\x1b[2m',
  red: '\x1b[31m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  magenta: '\x1b[35m',
  cyan: '\x1b[36m',
  bgRed: '\x1b[41m',
  bgGreen: '\x1b[42m'
};

// Image URLs from the CSV file to test
const IMAGE_URLS = [
  {
    character: 'Jesus',
    type: 'avatar',
    url: 'https://images.unsplash.com/photo-1518709268805-4e9042af9f23?ixlib=rb-1.2.1&auto=format&fit=crop&w=300&q=80'
  },
  {
    character: 'Jesus',
    type: 'feature',
    url: 'https://images.unsplash.com/photo-1602938016996-f7e7a6c96d7e?ixlib=rb-1.2.1&auto=format&fit=crop&w=1000&q=80'
  },
  {
    character: 'Paul',
    type: 'avatar',
    url: 'https://images.unsplash.com/photo-1548544149-4835e62ee5b3?ixlib=rb-1.2.1&auto=format&fit=crop&w=300&q=80'
  },
  {
    character: 'Paul',
    type: 'feature',
    url: 'https://images.unsplash.com/photo-1558021212-51b6ecfa0db9?ixlib=rb-1.2.1&auto=format&fit=crop&w=1000&q=80'
  },
  {
    character: 'Moses',
    type: 'avatar',
    url: 'https://images.unsplash.com/photo-1552664730-d307ca884978?ixlib=rb-1.2.1&auto=format&fit=crop&w=300&q=80'
  },
  {
    character: 'Moses',
    type: 'feature',
    url: 'https://images.unsplash.com/photo-1601142634808-38923eb7c560?ixlib=rb-1.2.1&auto=format&fit=crop&w=1000&q=80'
  }
];

// Our application domain (for CORS testing)
const APP_ORIGIN = 'http://localhost:5186';

/**
 * Tests a single image URL for accessibility and CORS configuration
 */
async function testImageUrl(imageInfo) {
  console.log(`\n${COLORS.bright}${COLORS.cyan}Testing ${imageInfo.character}'s ${imageInfo.type} image:${COLORS.reset}`);
  console.log(`${COLORS.dim}URL: ${imageInfo.url}${COLORS.reset}`);
  
  try {
    // Attempt to fetch the image with appropriate headers
    const response = await fetchHead(imageInfo.url, {
      method: 'HEAD', // Just get headers, not the full image
      headers: {
        'Origin': APP_ORIGIN,
        'Referer': `${APP_ORIGIN}/`,
        'User-Agent': 'Mozilla/5.0 Bible Character Chat App'
      }
    });
    
    // Basic response status check
    const statusColor = response.ok ? COLORS.green : COLORS.red;
    console.log(`Status: ${statusColor}${response.status} ${response.statusText}${COLORS.reset}`);
    
    if (!response.ok) {
      console.log(`${COLORS.red}❌ Image is not accessible (status ${response.status})${COLORS.reset}`);
      return {
        success: false,
        status: response.status,
        error: `HTTP ${response.status} ${response.statusText}`
      };
    }
    
    // Get and display all headers
    console.log(`\n${COLORS.bright}Response Headers:${COLORS.reset}`);
    const headers = {};
    response.headers.forEach((value, name) => {
      headers[name] = value;
      console.log(`${COLORS.dim}${name}:${COLORS.reset} ${value}`);
    });
    
    // Check for CORS headers specifically
    console.log(`\n${COLORS.bright}CORS Analysis:${COLORS.reset}`);
    
    const corsHeaders = {
      'access-control-allow-origin': headers['access-control-allow-origin'],
      'access-control-allow-methods': headers['access-control-allow-methods'],
      'access-control-allow-headers': headers['access-control-allow-headers'],
      'access-control-expose-headers': headers['access-control-expose-headers'],
      'access-control-max-age': headers['access-control-max-age'],
      'access-control-allow-credentials': headers['access-control-allow-credentials'],
      'timing-allow-origin': headers['timing-allow-origin']
    };
    
    let corsConfigured = false;
    let corsIssues = [];
    
    // Check Access-Control-Allow-Origin
    if (corsHeaders['access-control-allow-origin']) {
      const allowOrigin = corsHeaders['access-control-allow-origin'];
      if (allowOrigin === '*') {
        console.log(`${COLORS.green}✓ Access-Control-Allow-Origin: * (allows all origins)${COLORS.reset}`);
        corsConfigured = true;
      } else if (allowOrigin === APP_ORIGIN) {
        console.log(`${COLORS.green}✓ Access-Control-Allow-Origin: ${allowOrigin} (matches our origin)${COLORS.reset}`);
        corsConfigured = true;
      } else {
        console.log(`${COLORS.yellow}⚠️ Access-Control-Allow-Origin: ${allowOrigin} (doesn't match our origin)${COLORS.reset}`);
        corsIssues.push(`CORS origin mismatch: ${allowOrigin} vs ${APP_ORIGIN}`);
      }
    } else {
      console.log(`${COLORS.yellow}⚠️ No Access-Control-Allow-Origin header found${COLORS.reset}`);
      corsIssues.push('No Access-Control-Allow-Origin header');
    }
    
    // Check other CORS headers
    Object.entries(corsHeaders).forEach(([name, value]) => {
      if (name !== 'access-control-allow-origin' && value) {
        console.log(`${COLORS.green}✓ ${name}: ${value}${COLORS.reset}`);
      }
    });
    
    // Check Content-Type
    if (headers['content-type']) {
      const isImage = headers['content-type'].startsWith('image/');
      const statusIcon = isImage ? '✓' : '⚠️';
      const statusColor = isImage ? COLORS.green : COLORS.yellow;
      console.log(`${statusColor}${statusIcon} Content-Type: ${headers['content-type']}${COLORS.reset}`);
      
      if (!isImage) {
        corsIssues.push(`Content-Type is not an image: ${headers['content-type']}`);
      }
    } else {
      console.log(`${COLORS.yellow}⚠️ No Content-Type header found${COLORS.reset}`);
      corsIssues.push('No Content-Type header');
    }
    
    // Overall CORS assessment
    if (corsConfigured && corsIssues.length === 0) {
      console.log(`\n${COLORS.bgGreen}${COLORS.bright} CORS CONFIGURED CORRECTLY ${COLORS.reset}`);
    } else if (corsConfigured) {
      console.log(`\n${COLORS.yellow}${COLORS.bright} CORS PARTIALLY CONFIGURED ${COLORS.reset}`);
      console.log(`${COLORS.yellow}Issues: ${corsIssues.join(', ')}${COLORS.reset}`);
    } else {
      console.log(`\n${COLORS.bgRed}${COLORS.bright} CORS NOT PROPERLY CONFIGURED ${COLORS.reset}`);
      console.log(`${COLORS.red}Issues: ${corsIssues.join(', ')}${COLORS.reset}`);
    }
    
    return {
      success: response.ok,
      status: response.status,
      corsConfigured,
      corsIssues,
      headers
    };
    
  } catch (error) {
    console.log(`${COLORS.red}❌ Error fetching image: ${error.message}${COLORS.reset}`);
    return {
      success: false,
      error: error.message
    };
  }
}

/**
 * Tests all image URLs and provides a summary
 */
async function testAllImages() {
  console.log(`${COLORS.bright}${COLORS.blue}=== TESTING IMAGE URLS FROM CSV ===\n${COLORS.reset}`);
  console.log(`Testing ${IMAGE_URLS.length} image URLs from the CSV file...`);
  console.log(`Testing against origin: ${APP_ORIGIN}`);
  
  const results = [];
  
  for (const imageInfo of IMAGE_URLS) {
    const result = await testImageUrl(imageInfo);
    results.push({
      ...imageInfo,
      result
    });
  }
  
  // Generate summary
  console.log(`\n${COLORS.bright}${COLORS.blue}=== SUMMARY ===\n${COLORS.reset}`);
  
  const successful = results.filter(r => r.result.success);
  const corsConfigured = results.filter(r => r.result.corsConfigured);
  
  console.log(`Total URLs tested: ${results.length}`);
  console.log(`Successfully accessed: ${successful.length} (${Math.round(successful.length / results.length * 100)}%)`);
  console.log(`CORS properly configured: ${corsConfigured.length} (${Math.round(corsConfigured.length / results.length * 100)}%)`);
  
  if (successful.length < results.length) {
    console.log(`\n${COLORS.yellow}${COLORS.bright}INACCESSIBLE IMAGES:${COLORS.reset}`);
    results.filter(r => !r.result.success).forEach(r => {
      console.log(`- ${r.character}'s ${r.type} image: ${COLORS.red}${r.result.error}${COLORS.reset}`);
    });
  }
  
  if (corsConfigured.length < successful.length) {
    console.log(`\n${COLORS.yellow}${COLORS.bright}IMAGES WITH CORS ISSUES:${COLORS.reset}`);
    results.filter(r => r.result.success && !r.result.corsConfigured).forEach(r => {
      console.log(`- ${r.character}'s ${r.type} image: ${COLORS.yellow}${r.result.corsIssues.join(', ')}${COLORS.reset}`);
    });
  }
  
  // Provide recommendations
  console.log(`\n${COLORS.bright}${COLORS.blue}=== RECOMMENDATIONS ===\n${COLORS.reset}`);
  
  if (successful.length === results.length && corsConfigured.length === results.length) {
    console.log(`${COLORS.green}✅ All images are accessible and have proper CORS configuration.${COLORS.reset}`);
    console.log(`If images still aren't displaying in the app, check the following:`);
    console.log(`1. Browser cache - try a hard refresh (Ctrl+F5 or Cmd+Shift+R)`);
    console.log(`2. Application code - ensure the image URLs are being passed correctly`);
    console.log(`3. CSS styling - check if images are being hidden or improperly sized`);
  } else if (successful.length < results.length) {
    console.log(`${COLORS.red}❌ Some images are not accessible. Consider:${COLORS.reset}`);
    console.log(`1. Using different image URLs from Unsplash or another source`);
    console.log(`2. Hosting the images yourself on your own server`);
    console.log(`3. Using placeholder images until you can resolve the access issues`);
  } else if (corsConfigured.length < successful.length) {
    console.log(`${COLORS.yellow}⚠️ Some images have CORS issues. Consider:${COLORS.reset}`);
    console.log(`1. Using a CORS proxy service to access the images`);
    console.log(`2. Hosting the images yourself on your own server`);
    console.log(`3. Finding alternative image sources with proper CORS headers`);
    console.log(`4. Adding the 'crossorigin="anonymous"' attribute to img tags in your HTML`);
  }
  
  console.log(`\n${COLORS.bright}${COLORS.blue}=== TEST COMPLETE ===\n${COLORS.reset}`);
}

// Execute the tests
testAllImages().catch(error => {
  console.error(`${COLORS.red}${COLORS.bright}Fatal error:${COLORS.reset}`, error);
  process.exit(1);
});
