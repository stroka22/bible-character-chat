#!/usr/bin/env node

/**
 * check_schema.js
 * 
 * A utility script to query the Supabase database and retrieve the schema
 * information for the 'characters' table. This helps identify the correct
 * column names for CSV imports and API operations.
 * 
 * Usage: node check_schema.js
 */

import { createClient } from '@supabase/supabase-js';

// Supabase connection details (copied from src/services/supabase.js)
const SUPABASE_URL = 'https://sihfbzltlhkerkxozadt.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InNpaGZiemx0bGhrZXJreG96YWR0Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTAwNzc2NTgsImV4cCI6MjA2NTY1MzY1OH0.5H3eQxQxSfHZnpScO9bGHrSXA3GVuorLgpcTCEIomX4';
const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

async function checkTableSchema() {
  console.log('Checking schema for the "characters" table...');
  
  try {
    // First approach: Use system schema tables to get column information
    const { data: columns, error } = await supabase
      .from('information_schema.columns')
      .select('column_name, data_type, is_nullable')
      .eq('table_name', 'characters')
      .order('ordinal_position');
    
    if (error) {
      console.error('Error querying schema information:', error);
      
      // Alternative approach: Get a single row to examine structure
      console.log('\nTrying alternative approach...');
      const { data: sampleRow, error: sampleError } = await supabase
        .from('characters')
        .select('*')
        .limit(1);
      
      if (sampleError) {
        console.error('Error fetching sample row:', sampleError);
        return;
      }
      
      if (sampleRow && sampleRow.length > 0) {
        console.log('\n--- Character Table Columns (from sample) ---');
        const columnNames = Object.keys(sampleRow[0]);
        columnNames.forEach(col => {
          const value = sampleRow[0][col];
          const type = typeof value;
          console.log(`- ${col}: ${type} ${value === null ? '(nullable)' : ''}`);
        });
      } else {
        console.log('No sample data available in the characters table.');
      }
      
      return;
    }
    
    if (columns && columns.length > 0) {
      console.log('\n--- Character Table Schema ---');
      console.log(`Found ${columns.length} columns:`);
      columns.forEach(col => {
        console.log(`- ${col.column_name}: ${col.data_type} ${col.is_nullable === 'YES' ? '(nullable)' : '(required)'}`);
      });
    } else {
      console.log('No schema information found or table might not exist.');
    }
    
    // Also try to get a sample row to verify actual data
    const { data: sampleRow, error: sampleError } = await supabase
      .from('characters')
      .select('*')
      .limit(1);
    
    if (!sampleError && sampleRow && sampleRow.length > 0) {
      console.log('\n--- Sample Character Data ---');
      Object.entries(sampleRow[0]).forEach(([key, value]) => {
        const displayValue = value === null ? 'null' : 
                             typeof value === 'object' ? JSON.stringify(value).substring(0, 50) + '...' : 
                             String(value).substring(0, 50) + (String(value).length > 50 ? '...' : '');
        console.log(`${key}: ${displayValue}`);
      });
    }
    
  } catch (err) {
    console.error('Unexpected error:', err);
  }
}

// Execute the function
checkTableSchema().then(() => {
  console.log('\nSchema check complete.');
});
