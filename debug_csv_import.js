/**
 * debug_csv_import.js
 * 
 * This script performs detailed debugging of the CSV import process by:
 * 1. Loading test_comma_quotes.csv
 * 2. Parsing it with our new robust CSV parser
 * 3. Logging the exact data that would be sent to the database
 * 4. Inserting one record directly via Supabase (bypassing repository)
 * 5. Retrieving the inserted record to verify what was actually stored
 * 6. Providing detailed logging of the entire process
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { parseCSV, tryParseJson } from './src/utils/csvParser.js';
import { supabase } from './src/services/supabase.js';

// Re-create __dirname for ESM
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// ANSI color codes for terminal output
const colors = {
  reset: '\x1b[0m',
  bright: '\x1b[1m',
  dim: '\x1b[2m',
  red: '\x1b[31m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  cyan: '\x1b[36m',
  magenta: '\x1b[35m',
  bgRed: '\x1b[41m',
  bgGreen: '\x1b[42m',
  bgYellow: '\x1b[43m',
  bgBlue: '\x1b[44m'
};

/**
 * Logs an object with field-by-field inspection
 */
function inspectObject(obj, title = 'Object Inspection') {
  console.log(`\n${colors.bright}${colors.blue}=== ${title} ===\n${colors.reset}`);
  
  if (!obj || typeof obj !== 'object') {
    console.log(`${colors.red}Not an object: ${typeof obj}${colors.reset}`);
    console.log(obj);
    return;
  }
  
  // Get all keys and sort them
  const keys = Object.keys(obj).sort();
  
  // Calculate the longest key for padding
  const longestKey = Math.max(...keys.map(k => k.length));
  
  // Print each key-value pair
  keys.forEach(key => {
    const value = obj[key];
    const valueType = typeof value;
    const keyStr = `${key}:`.padEnd(longestKey + 2);
    
    let displayValue;
    let valueColor = colors.reset;
    
    if (value === null) {
      displayValue = 'null';
      valueColor = colors.dim;
    } else if (value === undefined) {
      displayValue = 'undefined';
      valueColor = colors.dim;
    } else if (valueType === 'string') {
      // Highlight empty strings
      if (value.trim() === '') {
        displayValue = '""';
        valueColor = colors.yellow;
      } else if (key.includes('url') || key.includes('image')) {
        // Highlight URLs
        displayValue = value;
        valueColor = colors.green;
      } else {
        displayValue = value.length > 100 ? `${value.substring(0, 97)}...` : value;
      }
    } else if (valueType === 'object') {
      if (Array.isArray(value)) {
        displayValue = `Array(${value.length}): ${JSON.stringify(value)}`;
        valueColor = colors.cyan;
      } else {
        displayValue = JSON.stringify(value);
        valueColor = colors.magenta;
      }
    } else {
      displayValue = String(value);
    }
    
    console.log(`  ${colors.bright}${keyStr}${colors.reset} ${valueColor}${displayValue}${colors.reset}`);
  });
}

/**
 * Compares two objects and logs differences
 */
function compareObjects(original, stored, title = 'Object Comparison') {
  console.log(`\n${colors.bright}${colors.blue}=== ${title} ===\n${colors.reset}`);
  
  if (!original || !stored || typeof original !== 'object' || typeof stored !== 'object') {
    console.log(`${colors.red}Cannot compare: invalid objects${colors.reset}`);
    return;
  }
  
  // Get all keys from both objects
  const allKeys = [...new Set([...Object.keys(original), ...Object.keys(stored)])].sort();
  
  // Calculate the longest key for padding
  const longestKey = Math.max(...allKeys.map(k => k.length));
  
  let differences = 0;
  
  // Compare each key
  allKeys.forEach(key => {
    const origValue = original[key];
    const storedValue = stored[key];
    const keyStr = `${key}:`.padEnd(longestKey + 2);
    
    // Skip system-generated fields
    if (['id', 'created_at', 'updated_at'].includes(key)) {
      console.log(`  ${colors.dim}${keyStr} [System field - skipped]${colors.reset}`);
      return;
    }
    
    let status = '';
    let statusColor = colors.green;
    
    // Special handling for relationships (JSON object)
    if (key === 'relationships') {
      const origJSON = typeof origValue === 'string' ? tryParseJson(origValue) : origValue;
      const storedJSON = storedValue;
      
      if (JSON.stringify(origJSON) !== JSON.stringify(storedJSON)) {
        status = 'DIFFERENT';
        statusColor = colors.red;
        differences++;
        
        console.log(`  ${colors.bright}${keyStr}${colors.reset} ${statusColor}${status}${colors.reset}`);
        console.log(`    ${colors.yellow}Original:${colors.reset} ${JSON.stringify(origJSON)}`);
        console.log(`    ${colors.yellow}Stored:  ${colors.reset} ${JSON.stringify(storedJSON)}`);
        return;
      }
    }
    // Compare other values
    else if (origValue !== storedValue) {
      // Handle null/undefined cases
      if (
        (origValue === null && storedValue === undefined) ||
        (origValue === undefined && storedValue === null) ||
        (origValue === '' && storedValue === null) ||
        (origValue === null && storedValue === '')
      ) {
        status = 'EQUIVALENT NULL';
        statusColor = colors.yellow;
      } else {
        status = 'DIFFERENT';
        statusColor = colors.red;
        differences++;
      }
      
      console.log(`  ${colors.bright}${keyStr}${colors.reset} ${statusColor}${status}${colors.reset}`);
      console.log(`    ${colors.yellow}Original:${colors.reset} ${origValue === undefined ? 'undefined' : origValue === null ? 'null' : origValue}`);
      console.log(`    ${colors.yellow}Stored:  ${colors.reset} ${storedValue === undefined ? 'undefined' : storedValue === null ? 'null' : storedValue}`);
    } else {
      status = 'MATCH';
      console.log(`  ${colors.bright}${keyStr}${colors.reset} ${statusColor}${status}${colors.reset}`);
    }
  });
  
  // Summary
  if (differences === 0) {
    console.log(`\n${colors.bgGreen}${colors.bright} ALL FIELDS MATCH! ${colors.reset}`);
  } else {
    console.log(`\n${colors.bgRed}${colors.bright} ${differences} FIELD DIFFERENCES FOUND ${colors.reset}`);
  }
}

/**
 * Verifies an image URL is accessible
 */
async function verifyImageUrl(url, label = 'Image') {
  if (!url) {
    console.log(`  ${colors.yellow}${label} URL is empty${colors.reset}`);
    return false;
  }
  
  try {
    console.log(`  ${colors.cyan}Verifying ${label} URL: ${url}${colors.reset}`);
    const response = await fetch(url, { method: 'HEAD' });
    
    if (response.ok) {
      const contentType = response.headers.get('content-type');
      if (contentType && contentType.startsWith('image/')) {
        console.log(`  ${colors.green}✓ ${label} URL is valid and returns an image (${contentType})${colors.reset}`);
        return true;
      } else {
        console.log(`  ${colors.red}✗ ${label} URL returns non-image content: ${contentType}${colors.reset}`);
        return false;
      }
    } else {
      console.log(`  ${colors.red}✗ ${label} URL returned status ${response.status}: ${response.statusText}${colors.reset}`);
      return false;
    }
  } catch (error) {
    console.log(`  ${colors.red}✗ Error checking ${label} URL: ${error.message}${colors.reset}`);
    return false;
  }
}

/**
 * Main function
 */
async function debugCSVImport() {
  console.log(`${colors.bright}${colors.blue}=== CSV IMPORT DEBUGGING ===\n${colors.reset}`);
  
  try {
    // Step 1: Read the CSV file
    console.log(`${colors.cyan}Reading test_comma_quotes.csv file...${colors.reset}`);
    const csvPath = path.join(__dirname, 'test_comma_quotes.csv');
    const csvContent = fs.readFileSync(csvPath, 'utf8');
    console.log(`${colors.green}✅ CSV file read successfully (${csvContent.length} bytes)${colors.reset}`);
    
    // Print first 100 characters as a preview
    console.log(`${colors.dim}CSV preview: ${csvContent.substring(0, 100)}...${colors.reset}`);
    
    // Step 2: Parse the CSV content
    console.log(`\n${colors.cyan}Parsing CSV content with robust parser...${colors.reset}`);
    const parsedData = parseCSV(csvContent);
    console.log(`${colors.green}✅ CSV parsed successfully. Found ${parsedData.length} characters${colors.reset}`);
    
    // Step 3: Prepare character data for import (first row only)
    console.log(`\n${colors.cyan}Preparing first character for detailed inspection...${colors.reset}`);
    
    if (parsedData.length === 0) {
      throw new Error('No data found in CSV');
    }
    
    const firstRow = parsedData[0];
    console.log(`${colors.green}Selected character: ${firstRow.name}${colors.reset}`);
    
    // Inspect the raw CSV row
    inspectObject(firstRow, 'Raw CSV Row Data');
    
    // Step 4: Prepare data for database insertion
    const characterToInsert = {
      // Use a unique name to avoid conflicts
      name: `${firstRow.name} (Debug ${Date.now()})`,
      description: firstRow.description || '',
      persona_prompt: firstRow.persona_prompt || '',
      opening_line: firstRow.opening_line || '',
      avatar_url: firstRow.avatar_url || '',
      feature_image_url: firstRow.feature_image_url || '',
      is_visible: firstRow.is_visible ? firstRow.is_visible.toLowerCase() === 'true' : false,
      testament: (firstRow.testament || 'new').toLowerCase() === 'old' ? 'old' : 'new',
      bible_book: firstRow.bible_book || '',
      timeline_period: firstRow.timeline_period || '',
      historical_context: firstRow.historical_context || '',
      geographic_location: firstRow.geographic_location || '',
      key_scripture_references: firstRow.key_scripture_references || '',
      theological_significance: firstRow.theological_significance || '',
      relationships: tryParseJson(firstRow.relationships) || {},
      study_questions: firstRow.study_questions || '',
      scriptural_context: firstRow.scriptural_context || ''
    };
    
    // Inspect the prepared character
    inspectObject(characterToInsert, 'Prepared Character Object');
    
    // Step 5: Verify image URLs
    console.log(`\n${colors.cyan}Verifying image URLs...${colors.reset}`);
    await verifyImageUrl(characterToInsert.avatar_url, 'Avatar');
    await verifyImageUrl(characterToInsert.feature_image_url, 'Feature Image');
    
    // Step 6: Insert directly via Supabase
    console.log(`\n${colors.cyan}Inserting character directly via Supabase...${colors.reset}`);
    console.log(`${colors.dim}Bypassing characterRepository to test raw database access${colors.reset}`);
    
    const { data: insertedChar, error: insertError } = await supabase
      .from('characters')
      .insert(characterToInsert)
      .select('*')
      .single();
    
    if (insertError) {
      console.error(`${colors.red}ERROR: Failed to insert character${colors.reset}`);
      console.error(insertError);
      
      // Check for specific error types
      if (insertError.code === '42501') {
        console.log(`${colors.bgRed}${colors.bright} ROW LEVEL SECURITY ERROR ${colors.reset}`);
        console.log(`${colors.yellow}This suggests RLS policies are preventing the insert.${colors.reset}`);
        console.log(`Try running this script while logged in as an admin or with RLS temporarily disabled.`);
      } else if (insertError.code === '23505') {
        console.log(`${colors.yellow}Duplicate key error - a character with this name already exists.${colors.reset}`);
      }
      
      throw insertError;
    }
    
    console.log(`${colors.green}✅ Character inserted successfully with ID: ${insertedChar.id}${colors.reset}`);
    
    // Step 7: Fetch the inserted character
    console.log(`\n${colors.cyan}Fetching the inserted character to verify fields...${colors.reset}`);
    
    const { data: fetchedChar, error: fetchError } = await supabase
      .from('characters')
      .select('*')
      .eq('id', insertedChar.id)
      .single();
    
    if (fetchError) {
      console.error(`${colors.red}ERROR: Failed to fetch inserted character${colors.reset}`);
      console.error(fetchError);
      throw fetchError;
    }
    
    console.log(`${colors.green}✅ Character fetched successfully${colors.reset}`);
    
    // Step 8: Inspect the fetched character
    inspectObject(fetchedChar, 'Character As Stored In Database');
    
    // Step 9: Compare what we sent vs. what was stored
    compareObjects(characterToInsert, fetchedChar, 'Sent vs. Stored Comparison');
    
    // Step 10: Cleanup (optional)
    console.log(`\n${colors.cyan}Cleaning up test data...${colors.reset}`);
    
    const { error: deleteError } = await supabase
      .from('characters')
      .delete()
      .eq('id', insertedChar.id);
    
    if (deleteError) {
      console.warn(`${colors.yellow}WARNING: Could not delete test character${colors.reset}`);
      console.warn(deleteError);
    } else {
      console.log(`${colors.green}✅ Test character deleted successfully${colors.reset}`);
    }
    
  } catch (error) {
    console.error(`\n${colors.bgRed}${colors.bright} FATAL ERROR ${colors.reset}`);
    console.error(`${colors.red}${error.message}${colors.reset}`);
    console.error(error);
    process.exit(1);
  }
  
  console.log(`\n${colors.blue}${colors.bright}=== DEBUG COMPLETE ===\n${colors.reset}`);
}

// Run the debug function
debugCSVImport()
  .then(() => {
    console.log(`${colors.green}Debug process completed successfully${colors.reset}`);
  })
  .catch(error => {
    console.error(`${colors.red}Unhandled error in debug process: ${error.message}${colors.reset}`);
    process.exit(1);
  });
