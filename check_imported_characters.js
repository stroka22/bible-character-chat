#!/usr/bin/env node

/**
 * check_imported_characters.js
 * 
 * This script checks the specific Jesus, Paul, and Moses entries imported via CSV
 * to verify their avatar_url and feature_image_url values and determine if they're
 * being sanitized or modified by the application.
 * 
 * Usage: node check_imported_characters.js
 */

import { createClient } from '@supabase/supabase-js';

// Supabase connection details
const SUPABASE_URL = 'https://sihfbzltlhkerkxozadt.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InNpaGZiemx0bGhrZXJreG96YWR0Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTAwNzc2NTgsImV4cCI6MjA2NTY1MzY1OH0.5H3eQxQxSfHZnpScO9bGHrSXA3GVuorLgpcTCEIomX4';
const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

// ANSI color codes for prettier output
const COLORS = {
  reset: '\x1b[0m',
  bright: '\x1b[1m',
  dim: '\x1b[2m',
  red: '\x1b[31m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  magenta: '\x1b[35m',
  cyan: '\x1b[36m'
};

// Original URLs from the CSV for comparison
const ORIGINAL_URLS = {
  Jesus: {
    avatar: 'https://images.unsplash.com/photo-1518709268805-4e9042af9f23?ixlib=rb-1.2.1&auto=format&fit=crop&w=300&q=80',
    feature: 'https://images.unsplash.com/photo-1602938016996-f7e7a6c96d7e?ixlib=rb-1.2.1&auto=format&fit=crop&w=1000&q=80'
  },
  Paul: {
    avatar: 'https://images.unsplash.com/photo-1548544149-4835e62ee5b3?ixlib=rb-1.2.1&auto=format&fit=crop&w=300&q=80',
    feature: 'https://images.unsplash.com/photo-1558021212-51b6ecfa0db9?ixlib=rb-1.2.1&auto=format&fit=crop&w=1000&q=80'
  },
  Moses: {
    avatar: 'https://images.unsplash.com/photo-1552664730-d307ca884978?ixlib=rb-1.2.1&auto=format&fit=crop&w=300&q=80',
    feature: 'https://images.unsplash.com/photo-1601142634808-38923eb7c560?ixlib=rb-1.2.1&auto=format&fit=crop&w=1000&q=80'
  }
};

// Helper function to check if URLs match
function compareUrls(original, current) {
  if (!current) return { matches: false, reason: 'URL is null or undefined' };
  if (current === original) return { matches: true };
  
  // Check if it's a fallback avatar
  if (current.includes('ui-avatars.com')) {
    return { 
      matches: false, 
      reason: 'Using fallback UI Avatars URL',
      fallback: true
    };
  }
  
  // Check if it's modified but still from the same source
  if (current.includes(new URL(original).hostname)) {
    return { 
      matches: false, 
      reason: 'Modified from original but same source',
      modified: true
    };
  }
  
  return { 
    matches: false, 
    reason: 'Completely different URL' 
  };
}

/**
 * Main function to check imported characters
 */
async function checkImportedCharacters() {
  console.log(`${COLORS.bright}${COLORS.blue}=== CHECKING IMPORTED BIBLE CHARACTERS ===${COLORS.reset}\n`);
  
  try {
    // 1. Check if we can connect to Supabase
    console.log(`${COLORS.cyan}Checking database connection...${COLORS.reset}`);
    const { data: connectionTest, error: connectionError } = await supabase
      .from('characters')
      .select('count');
    
    if (connectionError) {
      console.error(`${COLORS.red}❌ Database connection failed: ${connectionError.message}${COLORS.reset}`);
      return;
    }
    
    console.log(`${COLORS.green}✅ Database connection successful${COLORS.reset}\n`);
    
    // 2. Fetch the specific characters
    const characterNames = ['Jesus', 'Paul', 'Moses'];
    console.log(`${COLORS.cyan}Fetching specific characters: ${characterNames.join(', ')}${COLORS.reset}`);
    
    const { data: characters, error: fetchError } = await supabase
      .from('characters')
      .select('*')
      .in('name', characterNames);
    
    if (fetchError) {
      console.error(`${COLORS.red}❌ Failed to fetch characters: ${fetchError.message}${COLORS.reset}`);
      return;
    }
    
    if (!characters || characters.length === 0) {
      console.log(`${COLORS.yellow}⚠️ No matching characters found in the database${COLORS.reset}`);
      return;
    }
    
    console.log(`${COLORS.green}✅ Found ${characters.length} of ${characterNames.length} characters${COLORS.reset}\n`);
    
    // 3. Display character details
    console.log(`${COLORS.bright}=== CHARACTER DETAILS ===${COLORS.reset}`);
    
    for (const name of characterNames) {
      const character = characters.find(c => c.name === name);
      
      if (!character) {
        console.log(`\n${COLORS.yellow}⚠️ ${name} not found in database${COLORS.reset}`);
        continue;
      }
      
      console.log(`\n${COLORS.bright}${COLORS.cyan}${name}${COLORS.reset}`);
      console.log(`${COLORS.dim}ID: ${character.id}${COLORS.reset}`);
      console.log(`Testament: ${character.testament || 'Not set'}`);
      console.log(`Visible: ${character.is_visible ? 'Yes' : 'No'}`);
      console.log(`Updated: ${new Date(character.updated_at).toLocaleString()}`);
      
      // Check avatar URL
      const avatarComparison = compareUrls(ORIGINAL_URLS[name].avatar, character.avatar_url);
      console.log(`\nAvatar URL: ${character.avatar_url || 'Not set'}`);
      
      if (avatarComparison.matches) {
        console.log(`${COLORS.green}✓ Matches original CSV URL${COLORS.reset}`);
      } else {
        console.log(`${COLORS.red}✗ Does not match original CSV URL${COLORS.reset}`);
        console.log(`${COLORS.yellow}Reason: ${avatarComparison.reason}${COLORS.reset}`);
        console.log(`${COLORS.dim}Original: ${ORIGINAL_URLS[name].avatar}${COLORS.reset}`);
      }
      
      // Check feature image URL
      const featureComparison = compareUrls(ORIGINAL_URLS[name].feature, character.feature_image_url);
      console.log(`\nFeature Image URL: ${character.feature_image_url || 'Not set'}`);
      
      if (featureComparison.matches) {
        console.log(`${COLORS.green}✓ Matches original CSV URL${COLORS.reset}`);
      } else {
        console.log(`${COLORS.red}✗ Does not match original CSV URL${COLORS.reset}`);
        console.log(`${COLORS.yellow}Reason: ${featureComparison.reason}${COLORS.reset}`);
        console.log(`${COLORS.dim}Original: ${ORIGINAL_URLS[name].feature}${COLORS.reset}`);
      }
      
      console.log(`\n${COLORS.dim}----------------------------------------${COLORS.reset}`);
    }
    
    // 4. Check for URL sanitization in code
    console.log(`\n${COLORS.bright}=== URL SANITIZATION ANALYSIS ===${COLORS.reset}`);
    console.log(`${COLORS.cyan}Checking for URL sanitization...${COLORS.reset}`);
    
    // Count how many URLs were sanitized
    const sanitizedCount = characters.reduce((count, char) => {
      const name = char.name;
      const avatarSanitized = !compareUrls(ORIGINAL_URLS[name].avatar, char.avatar_url).matches;
      const featureSanitized = !compareUrls(ORIGINAL_URLS[name].feature, char.feature_image_url).matches;
      return count + (avatarSanitized ? 1 : 0) + (featureSanitized ? 1 : 0);
    }, 0);
    
    const totalUrls = characters.length * 2; // avatar + feature for each character
    
    if (sanitizedCount === totalUrls) {
      console.log(`${COLORS.yellow}⚠️ ALL URLs appear to be sanitized or modified (${sanitizedCount}/${totalUrls})${COLORS.reset}`);
      console.log(`This suggests the application is modifying URLs during import or retrieval.`);
      console.log(`Check the 'getSafeAvatarUrl' function in characterRepository.js.`);
    } else if (sanitizedCount > 0) {
      console.log(`${COLORS.yellow}⚠️ SOME URLs appear to be sanitized or modified (${sanitizedCount}/${totalUrls})${COLORS.reset}`);
      console.log(`This suggests inconsistent URL handling in the application.`);
    } else {
      console.log(`${COLORS.green}✅ NO URLs appear to be sanitized or modified (0/${totalUrls})${COLORS.reset}`);
      console.log(`The URLs in the database match the original CSV values.`);
    }
    
    // 5. Provide debugging tips
    console.log(`\n${COLORS.bright}=== DEBUGGING RECOMMENDATIONS ===${COLORS.reset}`);
    console.log(`1. ${COLORS.cyan}Check browser console${COLORS.reset} for image loading errors`);
    console.log(`2. ${COLORS.cyan}Verify CORS settings${COLORS.reset} on the image hosting servers`);
    console.log(`3. ${COLORS.cyan}Test direct URL access${COLORS.reset} to confirm images are publicly accessible`);
    console.log(`4. ${COLORS.cyan}Examine network requests${COLORS.reset} in browser developer tools`);
    console.log(`5. ${COLORS.cyan}Review getSafeAvatarUrl()${COLORS.reset} function in the code for URL sanitization logic`);
    
    console.log(`\n${COLORS.bright}${COLORS.blue}=== ANALYSIS COMPLETE ===${COLORS.reset}`);
    
  } catch (err) {
    console.error(`${COLORS.red}${COLORS.bright} UNEXPECTED ERROR: ${err.message} ${COLORS.reset}`);
    console.error(err);
  }
}

// Run the main function
checkImportedCharacters().catch(err => {
  console.error(`Fatal error:`, err);
  process.exit(1);
});
