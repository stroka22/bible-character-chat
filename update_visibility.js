#!/usr/bin/env node

/**
 * update_visibility.js
 * 
 * This script updates the visibility of specific Bible characters in the Supabase database.
 * It sets the is_visible field to TRUE for Jesus, Paul, and Moses.
 * 
 * Usage: node update_visibility.js
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
  red: '\x1b[31m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  cyan: '\x1b[36m'
};

/**
 * Main function to update character visibility
 */
async function updateCharacterVisibility() {
  console.log(`${COLORS.bright}${COLORS.blue}=== UPDATING CHARACTER VISIBILITY ===${COLORS.reset}\n`);
  
  // Characters to update
  const charactersToUpdate = ['Jesus', 'Paul', 'Moses'];
  console.log(`${COLORS.cyan}Setting visibility to TRUE for: ${charactersToUpdate.join(', ')}${COLORS.reset}\n`);
  
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
    
    // 2. Get current visibility status
    console.log(`${COLORS.cyan}Checking current visibility status...${COLORS.reset}`);
    const { data: beforeUpdate, error: beforeError } = await supabase
      .from('characters')
      .select('id, name, is_visible')
      .in('name', charactersToUpdate);
    
    if (beforeError) {
      console.error(`${COLORS.red}❌ Failed to fetch characters: ${beforeError.message}${COLORS.reset}`);
      return;
    }
    
    if (!beforeUpdate || beforeUpdate.length === 0) {
      console.log(`${COLORS.yellow}⚠️ No matching characters found in the database${COLORS.reset}`);
      return;
    }
    
    console.log(`${COLORS.green}Found ${beforeUpdate.length} characters to update:${COLORS.reset}`);
    beforeUpdate.forEach(char => {
      const status = char.is_visible ? 'Visible' : 'Not visible';
      console.log(`  - ${char.name}: ${status}`);
    });
    
    // 3. Update visibility
    console.log(`\n${COLORS.cyan}Updating visibility...${COLORS.reset}`);
    const { data: updateResult, error: updateError } = await supabase
      .from('characters')
      .update({ is_visible: true })
      .in('name', charactersToUpdate)
      .select('id, name');
    
    if (updateError) {
      console.error(`${COLORS.red}❌ Update failed: ${updateError.message}${COLORS.reset}`);
      return;
    }
    
    console.log(`${COLORS.green}✅ Successfully updated ${updateResult.length} characters:${COLORS.reset}`);
    updateResult.forEach(char => {
      console.log(`  - ${char.name}: Now visible`);
    });
    
    // 4. Verify the update
    console.log(`\n${COLORS.cyan}Verifying update...${COLORS.reset}`);
    const { data: afterUpdate, error: afterError } = await supabase
      .from('characters')
      .select('id, name, is_visible')
      .in('name', charactersToUpdate);
    
    if (afterError) {
      console.error(`${COLORS.red}❌ Verification failed: ${afterError.message}${COLORS.reset}`);
      return;
    }
    
    const allVisible = afterUpdate.every(char => char.is_visible);
    if (allVisible) {
      console.log(`${COLORS.green}✅ Verification successful: All characters are now visible${COLORS.reset}`);
      console.log(`\n${COLORS.bright}${COLORS.green}Characters should now appear on the home page!${COLORS.reset}`);
      console.log(`${COLORS.yellow}Note: You may need to refresh your browser or restart the server${COLORS.reset}`);
    } else {
      console.log(`${COLORS.red}❌ Verification failed: Some characters are still not visible${COLORS.reset}`);
      afterUpdate.forEach(char => {
        const status = char.is_visible ? 
          `${COLORS.green}Visible${COLORS.reset}` : 
          `${COLORS.red}Not visible${COLORS.reset}`;
        console.log(`  - ${char.name}: ${status}`);
      });
    }
    
    console.log(`\n${COLORS.bright}${COLORS.blue}=== UPDATE COMPLETE ===${COLORS.reset}`);
    
  } catch (err) {
    console.error(`${COLORS.red}${COLORS.bright} UNEXPECTED ERROR: ${err.message} ${COLORS.reset}`);
    console.error(err);
  }
}

// Run the main function
updateCharacterVisibility().catch(err => {
  console.error(`Fatal error:`, err);
  process.exit(1);
});
