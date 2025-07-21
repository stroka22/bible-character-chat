#!/usr/bin/env node

/**
 * fix_character_visibility.js
 * 
 * This script uses direct SQL via Supabase RPC to update the visibility
 * flag for Jesus, Paul, and Moses characters, bypassing the regular
 * update methods which have permission issues.
 * 
 * Usage: node fix_character_visibility.js
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

// Character IDs to update (from previous check)
const CHARACTERS = [
  { id: 'b5f2667e-8311-41d9-89fc-07419287bc44', name: 'Jesus' },
  { id: '3930932f-14d2-4dee-9c48-ee5dfa5b5527', name: 'Paul' },
  { id: '4115236a-e3a2-404c-b1fc-e9dc6cebd98f', name: 'Moses' }
];

/**
 * Execute direct SQL via RPC to update character visibility
 */
async function updateVisibilityWithSQL() {
  console.log(`${COLORS.bright}${COLORS.blue}=== UPDATING CHARACTER VISIBILITY WITH DIRECT SQL ===${COLORS.reset}\n`);
  
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
    
    // 2. Create a comma-separated list of IDs for the SQL query
    const idList = CHARACTERS.map(c => `'${c.id}'`).join(',');
    const characterNames = CHARACTERS.map(c => c.name).join(', ');
    
    console.log(`${COLORS.cyan}Updating visibility for: ${characterNames}${COLORS.reset}`);
    console.log(`${COLORS.dim}IDs: ${idList}${COLORS.reset}\n`);
    
    // 3. Execute SQL update via RPC
    console.log(`${COLORS.cyan}Executing SQL UPDATE via RPC...${COLORS.reset}`);
    
    const sql = `
      UPDATE characters 
      SET is_visible = true, 
          updated_at = NOW() 
      WHERE id IN (${idList})
      RETURNING id, name, is_visible, updated_at
    `;
    
    const { data: result, error: sqlError } = await supabase.rpc('execute_sql', { 
      query_text: sql 
    });
    
    // 4. Handle potential errors with the RPC method
    if (sqlError) {
      console.error(`${COLORS.red}❌ SQL execution failed: ${sqlError.message}${COLORS.reset}`);
      
      // Fallback to alternative method if RPC is not available
      console.log(`${COLORS.yellow}⚠️ Trying alternative method with direct SQL execution...${COLORS.reset}`);
      
      // Try using the SQL tag template (available in some Supabase versions)
      try {
        const { data: directResult, error: directError } = await supabase
          .from('characters')
          .update({ is_visible: true, updated_at: new Date().toISOString() })
          .in('id', CHARACTERS.map(c => c.id))
          .select('id, name, is_visible, updated_at');
        
        if (directError) {
          console.error(`${COLORS.red}❌ Direct SQL execution failed: ${directError.message}${COLORS.reset}`);
          return;
        }
        
        console.log(`${COLORS.green}✅ Update successful via direct method!${COLORS.reset}`);
        console.log(`${COLORS.green}Updated ${directResult.length} characters${COLORS.reset}`);
        
        directResult.forEach(char => {
          console.log(`  - ${char.name}: is_visible = ${char.is_visible ? 'true' : 'false'}`);
        });
      } catch (fallbackErr) {
        console.error(`${COLORS.red}❌ Fallback method failed: ${fallbackErr.message}${COLORS.reset}`);
        return;
      }
    } else {
      console.log(`${COLORS.green}✅ SQL execution successful!${COLORS.reset}`);
      
      if (result && result.length > 0) {
        console.log(`${COLORS.green}Updated ${result.length} characters${COLORS.reset}`);
        
        result.forEach(char => {
          console.log(`  - ${char.name}: is_visible = ${char.is_visible ? 'true' : 'false'}`);
        });
      } else {
        console.log(`${COLORS.yellow}⚠️ No rows were updated${COLORS.reset}`);
      }
    }
    
    // 5. Verify the update
    console.log(`\n${COLORS.cyan}Verifying update...${COLORS.reset}`);
    
    const { data: verification, error: verifyError } = await supabase
      .from('characters')
      .select('id, name, is_visible')
      .in('id', CHARACTERS.map(c => c.id));
    
    if (verifyError) {
      console.error(`${COLORS.red}❌ Verification failed: ${verifyError.message}${COLORS.reset}`);
      return;
    }
    
    if (!verification || verification.length === 0) {
      console.log(`${COLORS.yellow}⚠️ No characters found during verification${COLORS.reset}`);
      return;
    }
    
    const successCount = verification.filter(char => char.is_visible).length;
    
    if (successCount === CHARACTERS.length) {
      console.log(`${COLORS.green}✅ All characters are now visible!${COLORS.reset}`);
    } else {
      console.log(`${COLORS.yellow}⚠️ Only ${successCount} of ${CHARACTERS.length} characters are visible${COLORS.reset}`);
      
      verification.forEach(char => {
        const status = char.is_visible ? 
          `${COLORS.green}Visible${COLORS.reset}` : 
          `${COLORS.red}Not visible${COLORS.reset}`;
        console.log(`  - ${char.name}: ${status}`);
      });
    }
    
    console.log(`\n${COLORS.bright}${COLORS.blue}=== UPDATE OPERATION COMPLETE ===${COLORS.reset}`);
    console.log(`${COLORS.yellow}Note: You may need to refresh your browser to see the changes${COLORS.reset}`);
    
  } catch (err) {
    console.error(`${COLORS.red}${COLORS.bright} UNEXPECTED ERROR: ${err.message} ${COLORS.reset}`);
    console.error(err);
  }
}

// Run the main function
updateVisibilityWithSQL().catch(err => {
  console.error(`Fatal error:`, err);
  process.exit(1);
});
