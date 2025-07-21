#!/usr/bin/env node

/**
 * update_character_images.js
 * 
 * This script directly updates the avatar_url and feature_image_url fields
 * for Jesus, Paul, and Moses in the Supabase database to use the original
 * Unsplash URLs from the CSV import, bypassing any sanitization logic.
 * 
 * Usage: node update_character_images.js
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

// Character data with IDs and original URLs from CSV
const CHARACTERS = [
  {
    id: 'b5f2667e-8311-41d9-89fc-07419287bc44',
    name: 'Jesus',
    avatar_url: 'https://images.unsplash.com/photo-1518709268805-4e9042af9f23?ixlib=rb-1.2.1&auto=format&fit=crop&w=300&q=80',
    feature_image_url: 'https://images.unsplash.com/photo-1602938016996-f7e7a6c96d7e?ixlib=rb-1.2.1&auto=format&fit=crop&w=1000&q=80',
    is_visible: true
  },
  {
    id: '3930932f-14d2-4dee-9c48-ee5dfa5b5527',
    name: 'Paul',
    avatar_url: 'https://images.unsplash.com/photo-1548544149-4835e62ee5b3?ixlib=rb-1.2.1&auto=format&fit=crop&w=300&q=80',
    feature_image_url: 'https://images.unsplash.com/photo-1558021212-51b6ecfa0db9?ixlib=rb-1.2.1&auto=format&fit=crop&w=1000&q=80',
    is_visible: true
  },
  {
    id: '4115236a-e3a2-404c-b1fc-e9dc6cebd98f',
    name: 'Moses',
    avatar_url: 'https://images.unsplash.com/photo-1552664730-d307ca884978?ixlib=rb-1.2.1&auto=format&fit=crop&w=300&q=80',
    feature_image_url: 'https://images.unsplash.com/photo-1601142634808-38923eb7c560?ixlib=rb-1.2.1&auto=format&fit=crop&w=1000&q=80',
    is_visible: true
  }
];

/**
 * Update a single character's image URLs by ID
 */
async function updateCharacterImages(character) {
  console.log(`${COLORS.cyan}Updating ${character.name} (ID: ${character.id})...${COLORS.reset}`);
  
  try {
    // Update the character
    const { data, error } = await supabase
      .from('characters')
      .update({
        avatar_url: character.avatar_url,
        feature_image_url: character.feature_image_url,
        is_visible: character.is_visible,
        updated_at: new Date().toISOString()
      })
      .eq('id', character.id)
      .select('name, avatar_url, feature_image_url, is_visible');
    
    if (error) {
      console.error(`${COLORS.red}❌ Failed to update ${character.name}: ${error.message}${COLORS.reset}`);
      return false;
    }
    
    if (!data || data.length === 0) {
      console.log(`${COLORS.yellow}⚠️ No rows updated for ${character.name}${COLORS.reset}`);
      return false;
    }
    
    const updated = data[0];
    const avatarSuccess = updated.avatar_url === character.avatar_url;
    const featureSuccess = updated.feature_image_url === character.feature_image_url;
    const visibilitySuccess = updated.is_visible === character.is_visible;
    
    if (avatarSuccess && featureSuccess && visibilitySuccess) {
      console.log(`${COLORS.green}✅ Successfully updated ${updated.name}'s images and visibility${COLORS.reset}`);
      return true;
    } else {
      console.log(`${COLORS.yellow}⚠️ Partial update for ${updated.name}:${COLORS.reset}`);
      console.log(`  Avatar URL: ${avatarSuccess ? 'Updated' : 'Failed'}`);
      console.log(`  Feature Image URL: ${featureSuccess ? 'Updated' : 'Failed'}`);
      console.log(`  Visibility: ${visibilitySuccess ? 'Updated' : 'Failed'}`);
      return false;
    }
  } catch (err) {
    console.error(`${COLORS.red}❌ Exception updating ${character.name}: ${err.message}${COLORS.reset}`);
    return false;
  }
}

/**
 * Verify a character's image URLs
 */
async function verifyCharacterImages(character) {
  try {
    const { data, error } = await supabase
      .from('characters')
      .select('name, avatar_url, feature_image_url, is_visible')
      .eq('id', character.id)
      .single();
    
    if (error) {
      console.error(`${COLORS.red}❌ Failed to verify ${character.name}: ${error.message}${COLORS.reset}`);
      return false;
    }
    
    const avatarSuccess = data.avatar_url === character.avatar_url;
    const featureSuccess = data.feature_image_url === character.feature_image_url;
    const visibilitySuccess = data.is_visible === character.is_visible;
    
    if (avatarSuccess && featureSuccess && visibilitySuccess) {
      console.log(`${COLORS.green}✅ Verified ${data.name}'s images and visibility are correct${COLORS.reset}`);
      return true;
    } else {
      console.log(`${COLORS.red}❌ Verification failed for ${character.name}:${COLORS.reset}`);
      
      if (!avatarSuccess) {
        console.log(`  Avatar URL mismatch:`);
        console.log(`  ${COLORS.dim}Expected: ${character.avatar_url}${COLORS.reset}`);
        console.log(`  ${COLORS.dim}Actual: ${data.avatar_url}${COLORS.reset}`);
      }
      
      if (!featureSuccess) {
        console.log(`  Feature Image URL mismatch:`);
        console.log(`  ${COLORS.dim}Expected: ${character.feature_image_url}${COLORS.reset}`);
        console.log(`  ${COLORS.dim}Actual: ${data.feature_image_url}${COLORS.reset}`);
      }
      
      if (!visibilitySuccess) {
        console.log(`  Visibility mismatch:`);
        console.log(`  ${COLORS.dim}Expected: ${character.is_visible}${COLORS.reset}`);
        console.log(`  ${COLORS.dim}Actual: ${data.is_visible}${COLORS.reset}`);
      }
      
      return false;
    }
  } catch (err) {
    console.error(`${COLORS.red}❌ Exception verifying ${character.name}: ${err.message}${COLORS.reset}`);
    return false;
  }
}

/**
 * Main function to update character image URLs
 */
async function updateCharacterImageUrls() {
  console.log(`${COLORS.bright}${COLORS.blue}=== UPDATING CHARACTER IMAGE URLS ===${COLORS.reset}\n`);
  
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
    
    for (const character of CHARACTERS) {
      const success = await updateCharacterImages(character);
      updateResults.push({ character, success });
    }
    
    // 3. Verify all updates
    console.log(`\n${COLORS.bright}=== VERIFYING UPDATES ===${COLORS.reset}`);
    const verificationResults = [];
    
    for (const character of CHARACTERS) {
      const success = await verifyCharacterImages(character);
      verificationResults.push({ character, success });
    }
    
    // 4. Summary
    console.log(`\n${COLORS.bright}=== UPDATE SUMMARY ===${COLORS.reset}`);
    
    const updateSuccessCount = updateResults.filter(r => r.success).length;
    const verifySuccessCount = verificationResults.filter(r => r.success).length;
    
    console.log(`Updates attempted: ${updateResults.length}`);
    console.log(`Updates succeeded: ${updateSuccessCount}`);
    console.log(`Updates verified: ${verifySuccessCount}`);
    
    if (verifySuccessCount === CHARACTERS.length) {
      console.log(`\n${COLORS.bright}${COLORS.green}All character images have been successfully updated!${COLORS.reset}`);
      console.log(`${COLORS.yellow}Note: You may need to refresh your browser or restart the server to see the changes${COLORS.reset}`);
    } else {
      console.log(`\n${COLORS.bright}${COLORS.yellow}Some character images could not be updated.${COLORS.reset}`);
      console.log(`${COLORS.yellow}You may need to manually update them in the Supabase dashboard.${COLORS.reset}`);
    }
    
    console.log(`\n${COLORS.bright}${COLORS.blue}=== UPDATE COMPLETE ===${COLORS.reset}`);
    
  } catch (err) {
    console.error(`${COLORS.red}${COLORS.bright} UNEXPECTED ERROR: ${err.message} ${COLORS.reset}`);
    console.error(err);
  }
}

// Run the main function
updateCharacterImageUrls().catch(err => {
  console.error(`Fatal error:`, err);
  process.exit(1);
});
