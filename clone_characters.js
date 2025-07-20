#!/usr/bin/env node

/**
 * clone_characters.js
 * 
 * This script creates visible copies of Jesus, Paul, and Moses characters
 * by cloning their data but with modified names and is_visible=true.
 * 
 * Usage: node clone_characters.js
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

// Original image URLs from the CSV for reference
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

// Character names to clone
const CHARACTERS_TO_CLONE = ['Jesus', 'Paul', 'Moses'];

/**
 * Find the original characters in the database
 */
async function findOriginalCharacters() {
  console.log(`${COLORS.cyan}Finding original characters...${COLORS.reset}`);
  
  const { data, error } = await supabase
    .from('characters')
    .select('*')
    .in('name', CHARACTERS_TO_CLONE);
  
  if (error) {
    throw new Error(`Failed to fetch original characters: ${error.message}`);
  }
  
  if (!data || data.length === 0) {
    throw new Error('No characters found to clone');
  }
  
  console.log(`${COLORS.green}Found ${data.length} characters to clone${COLORS.reset}`);
  return data;
}

/**
 * Create a clone of a character with modified properties
 */
async function cloneCharacter(originalCharacter) {
  const name = `${originalCharacter.name} (Copy)`;
  console.log(`${COLORS.cyan}Cloning ${originalCharacter.name} as "${name}"...${COLORS.reset}`);
  
  // Check if a copy already exists
  const { data: existing, error: checkError } = await supabase
    .from('characters')
    .select('id, name')
    .eq('name', name)
    .single();
  
  if (!checkError && existing) {
    console.log(`${COLORS.yellow}A copy named "${name}" already exists (ID: ${existing.id})${COLORS.reset}`);
    return existing;
  }
  
  // Prepare the clone data
  const clone = {
    ...originalCharacter,
    id: undefined, // Remove ID so a new one is generated
    name: name,
    is_visible: true,
    updated_at: new Date().toISOString(),
    created_at: new Date().toISOString()
  };
  
  // Ensure image URLs are set to the original Unsplash URLs
  if (originalCharacter.name === 'Jesus') {
    clone.avatar_url = ORIGINAL_URLS.Jesus.avatar;
    clone.feature_image_url = ORIGINAL_URLS.Jesus.feature;
  } else if (originalCharacter.name === 'Paul') {
    clone.avatar_url = ORIGINAL_URLS.Paul.avatar;
    clone.feature_image_url = ORIGINAL_URLS.Paul.feature;
  } else if (originalCharacter.name === 'Moses') {
    clone.avatar_url = ORIGINAL_URLS.Moses.avatar;
    clone.feature_image_url = ORIGINAL_URLS.Moses.feature;
  }
  
  // Insert the clone
  const { data: inserted, error: insertError } = await supabase
    .from('characters')
    .insert(clone)
    .select('id, name, is_visible, avatar_url')
    .single();
  
  if (insertError) {
    console.error(`${COLORS.red}Failed to clone ${originalCharacter.name}: ${insertError.message}${COLORS.reset}`);
    return null;
  }
  
  console.log(`${COLORS.green}Successfully cloned ${originalCharacter.name} as "${inserted.name}" (ID: ${inserted.id})${COLORS.reset}`);
  console.log(`  Visibility: ${inserted.is_visible ? 'Visible' : 'Not visible'}`);
  console.log(`  Avatar URL: ${inserted.avatar_url}`);
  
  return inserted;
}

/**
 * Main function to clone characters
 */
async function cloneCharacters() {
  console.log(`${COLORS.bright}${COLORS.blue}=== CLONING BIBLE CHARACTERS ===${COLORS.reset}\n`);
  
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
    
    // 2. Find original characters
    const originalCharacters = await findOriginalCharacters();
    
    // 3. Clone each character
    console.log(`\n${COLORS.bright}=== CLONING CHARACTERS ===${COLORS.reset}`);
    const cloneResults = [];
    
    for (const character of originalCharacters) {
      const cloned = await cloneCharacter(character);
      cloneResults.push({ original: character, clone: cloned });
    }
    
    // 4. Summary
    console.log(`\n${COLORS.bright}=== CLONE SUMMARY ===${COLORS.reset}`);
    console.log(`Total characters processed: ${cloneResults.length}`);
    
    const successful = cloneResults.filter(r => r.clone !== null).length;
    console.log(`Successfully cloned: ${successful}`);
    
    if (successful === originalCharacters.length) {
      console.log(`\n${COLORS.bright}${COLORS.green}All characters have been successfully cloned!${COLORS.reset}`);
      console.log(`${COLORS.yellow}The cloned characters should now appear on the home page.${COLORS.reset}`);
      console.log(`${COLORS.yellow}You may need to refresh your browser to see the changes.${COLORS.reset}`);
    } else {
      console.log(`\n${COLORS.bright}${COLORS.yellow}Some characters could not be cloned.${COLORS.reset}`);
      console.log(`${COLORS.yellow}Check the error messages above for details.${COLORS.reset}`);
    }
    
    console.log(`\n${COLORS.bright}${COLORS.blue}=== CLONING COMPLETE ===${COLORS.reset}`);
    
  } catch (err) {
    console.error(`${COLORS.red}${COLORS.bright} UNEXPECTED ERROR: ${err.message} ${COLORS.reset}`);
    console.error(err);
  }
}

// Run the main function
cloneCharacters().catch(err => {
  console.error(`Fatal error:`, err);
  process.exit(1);
});
