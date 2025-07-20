#!/usr/bin/env node

/**
 * query_db_structure.js
 * 
 * This script examines the structure of the 'characters' table in Supabase
 * to determine which columns already exist in the database.
 * 
 * Usage: node query_db_structure.js
 */

import { createClient } from '@supabase/supabase-js';

// Supabase connection details (copied from src/services/supabase.js)
const SUPABASE_URL = 'https://sihfbzltlhkerkxozadt.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InNpaGZiemx0bGhrZXJreG96YWR0Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTAwNzc2NTgsImV4cCI6MjA2NTY1MzY1OH0.5H3eQxQxSfHZnpScO9bGHrSXA3GVuorLgpcTCEIomX4';
const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

/**
 * Attempts to query the database structure in multiple ways
 */
async function examineTableStructure() {
  console.log('=== CHARACTERS TABLE STRUCTURE ANALYSIS ===\n');
  
  try {
    // Approach 1: Try to use system tables (may require higher privileges)
    console.log('Attempting to query system tables...');
    try {
      const { data: columns, error } = await supabase
        .rpc('get_table_columns', { table_name: 'characters' });
      
      if (error) {
        console.log('  ❌ RPC method not available:', error.message);
      } else if (columns && columns.length) {
        console.log('  ✅ Columns from RPC call:');
        columns.forEach(col => {
          console.log(`  - ${col.column_name} (${col.data_type})`);
        });
      }
    } catch (err) {
      console.log('  ❌ RPC approach failed:', err.message);
    }
    
    console.log('\n');

    // Approach 2: Try information_schema (may require higher privileges)
    console.log('Attempting to query information_schema...');
    try {
      const { data: schemaInfo, error: schemaError } = await supabase
        .from('information_schema.columns')
        .select('column_name, data_type, is_nullable')
        .eq('table_name', 'characters')
        .order('ordinal_position');
      
      if (schemaError) {
        console.log('  ❌ Information schema query failed:', schemaError.message);
      } else if (schemaInfo && schemaInfo.length) {
        console.log('  ✅ Columns from information_schema:');
        schemaInfo.forEach(col => {
          console.log(`  - ${col.column_name} (${col.data_type}, ${col.is_nullable === 'YES' ? 'nullable' : 'required'})`);
        });
      } else {
        console.log('  ⚠️ No information schema data returned');
      }
    } catch (err) {
      console.log('  ❌ Information schema approach failed:', err.message);
    }
    
    console.log('\n');
    
    // Approach 3: Get a sample row to examine its structure (most reliable)
    console.log('Fetching a sample row to examine structure...');
    const { data: sampleRow, error: sampleError } = await supabase
      .from('characters')
      .select('*')
      .limit(1)
      .single();
    
    if (sampleError) {
      console.log('  ❌ Failed to fetch sample row:', sampleError.message);
    } else if (sampleRow) {
      console.log('  ✅ Sample row structure:');
      const columnList = Object.keys(sampleRow);
      
      console.log(`  Found ${columnList.length} columns:`);
      columnList.forEach(colName => {
        const value = sampleRow[colName];
        const valueType = typeof value;
        const valuePreview = value === null ? 'NULL' : 
                            valueType === 'object' ? JSON.stringify(value).substring(0, 30) + '...' :
                            String(value).substring(0, 30) + (String(value).length > 30 ? '...' : '');
        
        console.log(`  - ${colName} (${valueType}): ${valuePreview}`);
      });
      
      // Print full sample row as JSON for reference
      console.log('\n=== FULL SAMPLE ROW (JSON) ===');
      console.log(JSON.stringify(sampleRow, null, 2));
    } else {
      console.log('  ⚠️ No sample row returned');
    }
    
    // Approach 4: Try to query for specific columns we're interested in
    console.log('\n=== TESTING SPECIFIC COLUMNS ===');
    const columnsToTest = [
      'timeline_period',
      'geographic_location', 
      'historical_context',
      'key_scripture_references',
      'theological_significance',
      'study_questions',
      'scriptural_context'
    ];
    
    for (const column of columnsToTest) {
      try {
        const { data, error } = await supabase
          .from('characters')
          .select(column)
          .limit(1);
        
        if (error) {
          console.log(`  ❌ Column '${column}' test failed: ${error.message}`);
        } else {
          console.log(`  ✅ Column '${column}' exists in the database`);
        }
      } catch (err) {
        console.log(`  ❌ Column '${column}' test failed with exception: ${err.message}`);
      }
    }
    
  } catch (err) {
    console.error('Unexpected error during database examination:', err);
  }
}

// Execute the function
examineTableStructure().then(() => {
  console.log('\n=== DATABASE STRUCTURE ANALYSIS COMPLETE ===');
});
