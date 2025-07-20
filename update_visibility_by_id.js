#!/usr/bin/env node

/**
 * update_visibility_by_id.js
 * 
 * This script updates the visibility of specific Bible characters in the Supabase database
 * by using their exact IDs. It sets the is_visible field to TRUE for Jesus, Paul, and Moses.
 * 
 * Usage: node update_visibility_by_id.js
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

// Character IDs to update (from previous check)
const charactersToUpdate = [
  { id: 'b5f2667e-8311-41d9-89fc-07419287bc44', name: 'Jesus' },
  { id: '3930932f-14d2-4dee-9c48-ee5dfa5b5527', name: 'Paul' },
  { id: '4115236a-e3a2-404c-b1fc-e9dc6cebd98f', name: 'Moses' }
];

/**
 * Update a single character's visibility by ID
 */
async function updateSingleCharacter(character) {
  console.log(`${COLORS.cyan}Updating ${character.name} (ID: ${character.id})...${COLORS.reset}`);
  
  try {
    // Update the character
    const { data, error } = await supabase
      .from('characters')
      .update({ is_visible: true })
      .eq('id', character.id)
      .select('name, is_visible');
    
    if (error) {
      console.error(`${COLORS.red}❌ Failed to update ${character.name}: ${error.message}${COLORS.reset}`);
      return false;
    }
    
    if (!data || data.length === 0) {
      console.log(`${COLORS.yellow}⚠️ No rows updated for ${character.name}${COLORS.reset}`);
      return false;
    }
    
    const updated = data[0];
    if (updated.is_visible) {
      console.log(`${COLORS.green}✅ Successfully updated ${updated.name} to visible${COLORS.reset}`);
      return true;
    } else {
      console.log(`${COLORS.yellow}⚠️ Updated ${updated.name} but is_visible is still false${COLORS.reset}`);
      return false;
    }
  } catch (err) {
    console.error(`${COLORS.red}❌ Exception updating ${character.name}: ${err.message}${COLORS.reset}`);
    return false;
  }
}

/**
 * Verify a character's visibility status
 */
async function verifyCharacterVisibility(character) {
  try {
    const { data, error } = await supabase
      .from('characters')
      .select('name, is_visible')
      .eq('id', character.id)
      .single();
    
    if (error) {
      console.error(`${COLORS.red}❌ Failed to verify ${character.name}: ${error.message}${COLORS.reset}`);
      return false;
    }
    
    if (data && data.is_visible) {
      console.log(`${COLORS.green}✅ Verified ${data.name} is now visible${COLORS.reset}`);
      return true;
    } else {
      console.log(`${COLORS.red}❌ Verification failed: ${character.name} is still not visible${COLORS.reset}`);
      return false;
    }
  } catch (err) {
    console.error(`${COLORS.red}❌ Exception verifying ${character.name}: ${err.message}${COLORS.reset}`);
    return false;
  }
}

/**
 * Main function to update character visibility
 */
async function updateCharacterVisibility() {
  console.log(`${COLORS.bright}${COLORS.blue}=== UPDATING CHARACTER VISIBILITY BY ID ===${COLORS.reset}\n`);
  
  console.log(`${COLORS.cyan}Setting visibility to TRUE for: ${charactersToUpdate.map(c => c.name).join(', ')}${COLORS.reset}\n`);
  
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
    
    // 2. Update each character individually
    console.log(`${COLORS.bright}=== UPDATING CHARACTERS ===${COLORS.reset}`);
    const updateResults = [];
    
    for (const character of charactersToUpdate) {
      const success = await updateSingleCharacter(character);
      updateResults.push({ character, success });
    }
    
    // 3. Verify all updates
    console.log(`\n${COLORS.bright}=== VERIFYING UPDATES ===${COLORS.reset}`);
    const verificationResults = [];
    
    for (const character of charactersToUpdate) {
      const success = await verifyCharacterVisibility(character);
      verificationResults.push({ character, success });
    }
    
    // 4. Summary
    console.log(`\n${COLORS.bright}=== UPDATE SUMMARY ===${COLORS.reset}`);
    
    const updateSuccessCount = updateResults.filter(r => r.success).length;
    const verifySuccessCount = verificationResults.filter(r => r.success).length;
    
    console.log(`Updates attempted: ${updateResults.length}`);
    console.log(`Updates succeeded: ${updateSuccessCount}`);
    console.log(`Updates verified: ${verifySuccessCount}`);
    
    if (verifySuccessCount === charactersToUpdate.length) {
      console.log(`\n${COLORS.bright}${COLORS.green}All characters are now visible and should appear on the home page!${COLORS.reset}`);
      console.log(`${COLORS.yellow}Note: You may need to refresh your browser or restart the server${COLORS.reset}`);
    } else {
      console.log(`\n${COLORS.bright}${COLORS.yellow}Some characters may still not appear on the home page.${COLORS.reset}`);
      console.log(`${COLORS.yellow}Try manually updating the visibility in the Supabase dashboard.${COLORS.reset}`);
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
