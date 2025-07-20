#!/usr/bin/env node

/**
 * fix_imageUtils.js
 * 
 * This script modifies the src/utils/imageUtils.js file to better handle
 * Unsplash image URLs by updating the getSafeAvatarUrl function to explicitly
 * whitelist Unsplash domains.
 * 
 * Usage: node fix_imageUtils.js
 */

import fs from 'fs/promises';
import path from 'path';

// File path
const filePath = path.join(process.cwd(), 'src', 'utils', 'imageUtils.js');

// ANSI color codes for prettier output
const COLORS = {
  reset: '\x1b[0m',
  bright: '\x1b[1m',
  red: '\x1b[31m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  cyan: '\x1b[36m'
};

/**
 * Updates the getSafeAvatarUrl function to whitelist Unsplash domains
 */
async function fixImageUtils() {
  console.log(`${COLORS.bright}${COLORS.blue}=== UPDATING imageUtils.js ===\n${COLORS.reset}`);
  
  try {
    // 1. Read the existing file
    console.log(`${COLORS.cyan}Reading ${filePath}...${COLORS.reset}`);
    const fileContent = await fs.readFile(filePath, 'utf8');
    
    // 2. Check if the file already has the fix
    if (fileContent.includes('allowedHosts')) {
      console.log(`${COLORS.yellow}File already contains the Unsplash whitelist. No changes needed.${COLORS.reset}`);
      return;
    }
    
    // 3. Replace the getSafeAvatarUrl function with the updated version
    console.log(`${COLORS.cyan}Updating getSafeAvatarUrl function...${COLORS.reset}`);
    
    // Original function pattern to match
    const originalFunctionPattern = /export const getSafeAvatarUrl = \(name, url\) => {[\s\S]*?return generateFallbackAvatar\(name\);[\s\S]*?};/;
    
    // Updated function with Unsplash whitelist
    const updatedFunction = `export const getSafeAvatarUrl = (name, url) => {
    if (!url)
        return generateFallbackAvatar(name);
    try {
        const { hostname } = new URL(url);
        // Explicitly allow Unsplash-hosted images (and sub-domains).
        const allowedHosts = ['images.unsplash.com', 'unsplash.com'];
        const isAllowed = allowedHosts.includes(hostname) || hostname.endsWith('.unsplash.com');

        if (isAllowed) {
            return url;
        }

        // Block known placeholders / private hosts
        if (hostname === 'example.com' ||
            hostname.endsWith('.example.com') ||
            hostname === 'localhost') {
            return generateFallbackAvatar(name);
        }

        // Fallback for any other un-recognised host
        return generateFallbackAvatar(name);
    }
    catch {
        return generateFallbackAvatar(name);
    }
};`;
    
    // Replace the function in the file content
    const updatedContent = fileContent.replace(originalFunctionPattern, updatedFunction);
    
    // 4. Write the updated content back to the file
    console.log(`${COLORS.cyan}Writing updated content to ${filePath}...${COLORS.reset}`);
    await fs.writeFile(filePath, updatedContent, 'utf8');
    
    console.log(`${COLORS.green}✅ Successfully updated imageUtils.js!${COLORS.reset}`);
    console.log(`${COLORS.green}The getSafeAvatarUrl function now explicitly allows Unsplash image URLs.${COLORS.reset}`);
    
    // 5. Create a backup of the original file
    const backupPath = `${filePath}.bak`;
    console.log(`${COLORS.cyan}Creating backup of original file at ${backupPath}...${COLORS.reset}`);
    await fs.writeFile(backupPath, fileContent, 'utf8');
    console.log(`${COLORS.green}✅ Backup created successfully.${COLORS.reset}`);
    
    console.log(`\n${COLORS.bright}${COLORS.blue}=== UPDATE COMPLETE ===\n${COLORS.reset}`);
    console.log(`${COLORS.yellow}You may need to rebuild the application for changes to take effect:${COLORS.reset}`);
    console.log(`npm run build`);
    console.log(`npm run preview -- --port 5186`);
    
  } catch (error) {
    console.error(`${COLORS.red}ERROR: ${error.message}${COLORS.reset}`);
    console.error(error);
    process.exit(1);
  }
}

// Run the function
fixImageUtils();
