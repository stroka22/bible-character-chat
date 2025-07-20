#!/usr/bin/env node

/**
 * test_single_insert.js
 * 
 * A diagnostic script to test inserting a single character into Supabase.
 * This helps isolate issues with the CSV bulk upload functionality.
 * 
 * Usage: node test_single_insert.js
 */

import { createClient } from '@supabase/supabase-js';

// Supabase connection details (copied from src/services/supabase.js)
const SUPABASE_URL = 'https://sihfbzltlhkerkxozadt.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InNpaGZiemx0bGhrZXJreG96YWR0Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTAwNzc2NTgsImV4cCI6MjA2NTY1MzY1OH0.5H3eQxQxSfHZnpScO9bGHrSXA3GVuorLgpcTCEIomX4';
const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

// Define a minimal test character with only the required fields
const testCharacter = {
  name: 'Test Character ' + new Date().toISOString().slice(0, 19).replace('T', ' '), // Unique name
  description: 'A test character for debugging database issues',
  persona_prompt: 'I am a test character created to diagnose database connectivity issues',
  testament: 'new', // Required field with specific values ('new' or 'old')
  is_visible: false, // Keep test character hidden from users
  // No other fields to minimize potential issues
};

/**
 * Attempts to insert a single character and logs detailed results
 */
async function testSingleInsert() {
  console.log('=== SUPABASE SINGLE CHARACTER INSERT TEST ===');
  console.log('Test character:', testCharacter);
  
  try {
    console.log('\nStep 1: Testing database connection...');
    const { data: connectionTest, error: connectionError } = await supabase.from('characters').select('count');
    
    if (connectionError) {
      console.error('❌ Connection test failed:', connectionError);
      return;
    }
    
    console.log('✅ Connection successful');
    
    console.log('\nStep 2: Checking if character already exists...');
    const { data: existingChar, error: lookupError } = await supabase
      .from('characters')
      .select('id, name')
      .eq('name', testCharacter.name)
      .maybeSingle();
    
    if (lookupError) {
      console.error('❌ Lookup check failed:', lookupError);
      return;
    }
    
    if (existingChar) {
      console.log(`Character "${testCharacter.name}" already exists with ID ${existingChar.id}`);
      console.log('\nStep 3: Updating existing character...');
      
      const { data: updated, error: updateError } = await supabase
        .from('characters')
        .update({ 
          ...testCharacter,
          updated_at: new Date().toISOString() 
        })
        .eq('id', existingChar.id)
        .select('*')
        .single();
      
      if (updateError) {
        console.error('❌ Update failed:', updateError);
        console.error('Error code:', updateError.code);
        console.error('Error message:', updateError.message);
        console.error('Error details:', updateError.details);
        return;
      }
      
      console.log('✅ Character updated successfully:', updated);
    } else {
      console.log('Character does not exist, proceeding with insert');
      console.log('\nStep 3: Inserting new character...');
      
      // Try inserting with minimal fields first
      const { data: inserted, error: insertError } = await supabase
        .from('characters')
        .insert(testCharacter)
        .select('*')
        .single();
      
      if (insertError) {
        console.error('❌ Insert failed:', insertError);
        console.error('Error code:', insertError.code);
        console.error('Error message:', insertError.message);
        console.error('Error details:', insertError.details);
        
        // Additional diagnostic info
        console.log('\nDiagnostic information:');
        console.log('- Character object keys:', Object.keys(testCharacter));
        console.log('- Testament value:', testCharacter.testament);
        console.log('- is_visible type:', typeof testCharacter.is_visible);
        return;
      }
      
      console.log('✅ Character inserted successfully:', inserted);
    }
    
    console.log('\nStep 4: Verifying character in database...');
    const { data: verification, error: verifyError } = await supabase
      .from('characters')
      .select('*')
      .eq('name', testCharacter.name)
      .single();
    
    if (verifyError) {
      console.error('❌ Verification failed:', verifyError);
      return;
    }
    
    console.log('✅ Character verified in database:', verification);
    console.log('\n=== TEST COMPLETED SUCCESSFULLY ===');
    
  } catch (err) {
    console.error('❌ Unexpected error:', err);
  }
}

// Run the test
testSingleInsert().catch(err => {
  console.error('Fatal error:', err);
  process.exit(1);
});
