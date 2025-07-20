#!/usr/bin/env node

/**
 * add_test_characters.js
 * 
 * A simple script to directly add test characters to the Supabase database.
 * This bypasses the CSV upload functionality to ensure we can get basic data in.
 * 
 * Usage: node add_test_characters.js
 */

// Import the Supabase client
// Using ES-module import (project is `"type": "module"`)
import { createClient } from '@supabase/supabase-js';

// Supabase connection details (copied from src/services/supabase.js)
const SUPABASE_URL = 'https://sihfbzltlhkerkxozadt.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InNpaGZiemx0bGhrZXJreG96YWR0Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTAwNzc2NTgsImV4cCI6MjA2NTY1MzY1OH0.5H3eQxQxSfHZnpScO9bGHrSXA3GVuorLgpcTCEIomX4';
const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

// Define minimal character data for our three test characters
const characters = [
  {
    name: 'Jesus',
    description: 'The Son of God who taught about God\'s kingdom and performed miracles.',
    persona_prompt: 'I am Jesus of Nazareth who taught about love and forgiveness and gave my life as a ransom for many.',
    is_visible: true,
    bible_book: 'Matthew, Mark, Luke, John',
    opening_line: 'Peace be with you. I am Jesus, whom many call the Christ.',
    testament: 'new',
    relationships: {}  // Empty object instead of null or complex JSON
  },
  {
    name: 'Paul',
    description: 'The apostle to the Gentiles who spread Christianity throughout the Roman Empire.',
    persona_prompt: 'I am Paul, formerly known as Saul of Tarsus, who was transformed from a persecutor to an apostle of Christ.',
    is_visible: true,
    bible_book: 'Acts, Romans, 1 & 2 Corinthians, Galatians, Ephesians, Philippians, Colossians, 1 & 2 Thessalonians, 1 & 2 Timothy, Titus, Philemon',
    opening_line: 'I am Paul, once a persecutor of the church, now an apostle of Christ Jesus by the will of God.',
    testament: 'new',
    relationships: {}
  },
  {
    name: 'Moses',
    description: 'The great lawgiver and prophet who led the Israelites out of Egypt.',
    persona_prompt: 'I am Moses who encountered God at the burning bush and led God\'s people out of slavery in Egypt.',
    is_visible: true,
    bible_book: 'Exodus, Leviticus, Numbers, Deuteronomy',
    opening_line: 'I am Moses, who stood before the burning bush and led God\'s people out of slavery in Egypt.',
    testament: 'old',
    relationships: {}
  }
];

// Function to insert a single character with error handling
async function insertCharacter(character) {
  console.log(`Attempting to insert character: ${character.name}`);
  
  try {
    // First check if character already exists to avoid duplicates
    const { data: existingChar, error: checkError } = await supabase
      .from('characters')
      .select('id, name')
      .eq('name', character.name)
      .maybeSingle();
    
    if (checkError) {
      console.error(`Error checking for existing character ${character.name}:`, checkError);
      return false;
    }
    
    if (existingChar) {
      console.log(`Character ${character.name} already exists with ID ${existingChar.id}. Updating instead...`);
      
      // Update existing character
      const { data: updatedChar, error: updateError } = await supabase
        .from('characters')
        .update(character)
        .eq('id', existingChar.id)
        .select();
      
      if (updateError) {
        console.error(`Error updating character ${character.name}:`, updateError);
        return false;
      }

      // updatedChar is an array; log first element if present
      if (Array.isArray(updatedChar) && updatedChar.length > 0) {
        console.log(`Successfully updated character: ${updatedChar[0].name} (ID: ${updatedChar[0].id})`);
      } else {
        console.log(`Successfully updated character: ${character.name}`);
      }
      return true;
    }
    
    // Insert new character
    const { data, error } = await supabase
      .from('characters')
      .insert(character)
      .select()
      .single();
    
    if (error) {
      console.error(`Error inserting character ${character.name}:`, error);
      return false;
    }
    
    console.log(`Successfully inserted character: ${data.name} (ID: ${data.id})`);
    return true;
  } catch (err) {
    console.error(`Unexpected error with character ${character.name}:`, err);
    return false;
  }
}

// Main function to process all characters
async function main() {
  console.log('Starting character insertion...');
  
  let successCount = 0;
  let failureCount = 0;
  
  for (const character of characters) {
    const success = await insertCharacter(character);
    if (success) {
      successCount++;
    } else {
      failureCount++;
    }
  }
  
  console.log('\n--- Summary ---');
  console.log(`Total characters processed: ${characters.length}`);
  console.log(`Successfully inserted/updated: ${successCount}`);
  console.log(`Failed: ${failureCount}`);
  
  if (failureCount > 0) {
    console.log('\nSome characters failed to insert. Check the logs above for details.');
    process.exit(1);
  } else {
    console.log('\nAll characters successfully added to the database!');
    process.exit(0);
  }
}

// Run the main function
main().catch(err => {
  console.error('Fatal error:', err);
  process.exit(1);
});
