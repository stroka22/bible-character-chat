#!/usr/bin/env node

/**
 * check_characters.js
 * 
 * Diagnostic script to check characters in the Supabase database
 * and analyze why they might not be showing on the home page.
 * 
 * Usage: node check_characters.js
 */

import { createClient } from '@supabase/supabase-js';

// Supabase connection details (copied from src/services/supabase.js)
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
  cyan: '\x1b[36m',
  bgRed: '\x1b[41m',
  bgGreen: '\x1b[42m',
  bgYellow: '\x1b[43m',
  bgBlue: '\x1b[44m'
};

/**
 * Main function to check characters in the database
 */
async function checkCharacters() {
  console.log(`${COLORS.bright}${COLORS.blue}=== BIBLE CHARACTER CHAT - DATABASE ANALYSIS ===${COLORS.reset}\n`);
  
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
    
    // 2. Get all characters
    console.log(`${COLORS.cyan}Fetching all characters...${COLORS.reset}`);
    const { data: allCharacters, error: fetchError } = await supabase
      .from('characters')
      .select('id, name, is_visible, testament, created_at, updated_at')
      .order('name');
    
    if (fetchError) {
      console.error(`${COLORS.red}❌ Failed to fetch characters: ${fetchError.message}${COLORS.reset}`);
      return;
    }
    
    if (!allCharacters || allCharacters.length === 0) {
      console.log(`${COLORS.yellow}⚠️ No characters found in the database${COLORS.reset}`);
      console.log(`${COLORS.yellow}Possible reasons:${COLORS.reset}`);
      console.log(`  1. The CSV import failed completely`);
      console.log(`  2. The characters table is empty`);
      console.log(`  3. There's a permission issue with the Supabase client`);
      return;
    }
    
    console.log(`${COLORS.green}✅ Found ${allCharacters.length} characters in the database${COLORS.reset}\n`);
    
    // 3. Display character summary
    console.log(`${COLORS.bright}=== CHARACTER SUMMARY ===${COLORS.reset}`);
    console.log(`${COLORS.dim}ID                                  | Name                 | Visible | Testament | Updated At${COLORS.reset}`);
    console.log(`${COLORS.dim}------------------------------------ | -------------------- | ------- | --------- | -------------------${COLORS.reset}`);
    
    allCharacters.forEach(char => {
      const visibleMark = char.is_visible 
        ? `${COLORS.green}Yes${COLORS.reset}` 
        : `${COLORS.red}No ${COLORS.reset}`;
      
      console.log(
        `${char.id.substring(0, 36).padEnd(36)} | ` +
        `${char.name.substring(0, 20).padEnd(20)} | ` +
        `${visibleMark.padEnd(12)} | ` +
        `${(char.testament || 'N/A').padEnd(9)} | ` +
        `${new Date(char.updated_at).toLocaleString()}`
      );
    });
    
    // 4. Check for specific characters
    console.log(`\n${COLORS.bright}=== CHECKING SPECIFIC CHARACTERS ===${COLORS.reset}`);
    const targetCharacters = ['Jesus', 'Paul', 'Moses'];
    
    targetCharacters.forEach(name => {
      const character = allCharacters.find(c => c.name.toLowerCase() === name.toLowerCase());
      
      if (!character) {
        console.log(`${COLORS.red}❌ ${name}: Not found in database${COLORS.reset}`);
      } else {
        const visibleStatus = character.is_visible 
          ? `${COLORS.green}Visible (should appear on home page)${COLORS.reset}` 
          : `${COLORS.red}Not visible (won't appear on home page)${COLORS.reset}`;
        
        console.log(`${COLORS.cyan}${name}:${COLORS.reset}`);
        console.log(`  - ID: ${character.id}`);
        console.log(`  - Status: ${visibleStatus}`);
        console.log(`  - Testament: ${character.testament || 'Not set'}`);
        console.log(`  - Last Updated: ${new Date(character.updated_at).toLocaleString()}`);
      }
    });
    
    // 5. Check visibility distribution
    const visibleCount = allCharacters.filter(c => c.is_visible).length;
    const invisibleCount = allCharacters.length - visibleCount;
    
    console.log(`\n${COLORS.bright}=== VISIBILITY ANALYSIS ===${COLORS.reset}`);
    console.log(`Total characters: ${allCharacters.length}`);
    console.log(`Visible characters: ${visibleCount}`);
    console.log(`Invisible characters: ${invisibleCount}`);
    
    // 6. Analyze potential issues
    console.log(`\n${COLORS.bright}${COLORS.yellow}=== WHY CHARACTERS MIGHT NOT SHOW ON HOME PAGE ===${COLORS.reset}`);
    
    // Check if any characters are visible
    if (visibleCount === 0) {
      console.log(`${COLORS.red}❌ NO VISIBLE CHARACTERS: All characters have is_visible=false${COLORS.reset}`);
      console.log(`   Solution: Set is_visible=true for characters you want to display`);
    }
    
    // Check if the specific characters are visible
    const missingTargets = targetCharacters.filter(name => 
      !allCharacters.find(c => c.name.toLowerCase() === name.toLowerCase() && c.is_visible)
    );
    
    if (missingTargets.length > 0) {
      console.log(`${COLORS.yellow}⚠️ TARGET CHARACTERS NOT VISIBLE: ${missingTargets.join(', ')}${COLORS.reset}`);
      console.log(`   Solution: Check if these characters exist and have is_visible=true`);
    }
    
    // Check for potential frontend issues
    console.log(`\n${COLORS.bright}Other potential issues:${COLORS.reset}`);
    console.log(`1. ${COLORS.yellow}Frontend Caching:${COLORS.reset} The browser might be caching old data`);
    console.log(`   Solution: Hard refresh (Ctrl+F5 or Cmd+Shift+R) or clear browser cache`);
    
    console.log(`2. ${COLORS.yellow}API/Mock Data:${COLORS.reset} The frontend might be using mock data instead of the database`);
    console.log(`   Solution: Check browser console for API errors or mock data messages`);
    
    console.log(`3. ${COLORS.yellow}Authorization:${COLORS.reset} The frontend might not have proper permissions`);
    console.log(`   Solution: Check if VITE_SKIP_AUTH=true or if you're properly logged in`);
    
    console.log(`4. ${COLORS.yellow}Filtering:${COLORS.reset} The home page might be applying filters (e.g., testament)`);
    console.log(`   Solution: Check if there are active filters on the UI`);
    
    console.log(`5. ${COLORS.yellow}Server Restart:${COLORS.reset} The server might need to be restarted`);
    console.log(`   Solution: Stop and restart the server with npm run preview -- --port 5186`);
    
    console.log(`\n${COLORS.bright}${COLORS.blue}=== ANALYSIS COMPLETE ===${COLORS.reset}`);
    
  } catch (err) {
    console.error(`${COLORS.bgRed}${COLORS.bright} UNEXPECTED ERROR: ${err.message} ${COLORS.reset}`);
    console.error(err);
  }
}

// Run the main function
checkCharacters().catch(err => {
  console.error(`Fatal error:`, err);
  process.exit(1);
});
