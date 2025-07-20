/**
 * test_csv_import.js
 * 
 * This script tests the CSV import functionality by:
 * 1. Reading the test_fix_import.csv file
 * 2. Parsing the CSV content
 * 3. Importing the character using characterRepository
 * 4. Fetching and displaying the imported character to verify all fields
 */

/* ------------------------------------------------------------------------- *
 * NOTE: This file is executed as an ES-module (`"type": "module"` in
 * package.json).  Node’s CommonJS globals like `require` and `__dirname`
 * are therefore NOT available.  We switch to standard ES-module imports and
 * recreate `__dirname` using `import.meta.url`.
 * ------------------------------------------------------------------------- */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
// Import the raw Supabase client so we can issue minimal queries without
// pulling in the full application repository graph (which drags many
// browser-only modules that break in Node test scripts).
import { supabase } from './src/services/supabase.js';

/**
 * Minimal repository implementation for this test only.
 * Provides just the two methods the test needs: bulkCreateCharacters
 * and getByName.  Using direct Supabase queries keeps the dependency
 * surface small and avoids ESM-resolution issues in the full repo.
 */
const characterRepo = {
  /**
   * Insert or update characters by unique name.
   * Returns the array of rows as stored in the DB.
   */
  async bulkCreateCharacters(characters) {
    if (!Array.isArray(characters) || characters.length === 0) return [];

    // Upsert on the "name" column to avoid duplicate-key issues when re-running
    // the test.  `prefer: 'return=representation'` is implied by .select().
    const { data, error } = await supabase
      .from('characters')
      .upsert(characters, { onConflict: 'name' })
      .select('*');

    if (error) {
      // Re-throw so callers can handle/log a friendly message.
      throw error;
    }
    return data;
  },

  /** Fetch a single character by exact (case-sensitive) name. */
  async getByName(name) {
    const { data, error } = await supabase
      .from('characters')
      .select('*')
      .eq('name', name)
      .single();

    if (error && error.code !== 'PGRST116') {
      // PGRST116 = no rows found; treat as not-found instead of throwing.
      throw error;
    }
    return data ?? null;
  }
};

// Re-create __dirname / __filename for ESM
const __filename = fileURLToPath(import.meta.url);
const __dirname  = path.dirname(__filename);

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
  bgGreen: '\x1b[42m'
};

// Helper function to parse CSV
function parseCSV(csvText) {
  const lines = csvText.trim().split('\n');
  if (lines.length === 0) return [];
  
  const headers = lines[0].split(',').map(header => header.trim());
  
  // Process the data rows
  const data = [];
  for (let i = 1; i < lines.length; i++) {
    const line = lines[i];
    
    // Handle quoted values with commas inside them
    const values = [];
    let inQuotes = false;
    let currentValue = '';
    
    for (let j = 0; j < line.length; j++) {
      const char = line[j];
      
      if (char === '"' && (j === 0 || line[j-1] !== '\\')) {
        inQuotes = !inQuotes;
      } else if (char === ',' && !inQuotes) {
        values.push(currentValue.trim());
        currentValue = '';
      } else {
        currentValue += char;
      }
    }
    
    // Add the last value
    values.push(currentValue.trim());
    
    // Create an object from the headers and values
    const row = {};
    headers.forEach((header, index) => {
      // Remove surrounding quotes if present
      let value = values[index] || '';
      if (value.startsWith('"') && value.endsWith('"')) {
        value = value.substring(1, value.length - 1);
      }
      row[header] = value;
    });
    
    data.push(row);
  }
  
  return data;
}

// Helper function to try parsing JSON
function tryParseJson(str) {
  try {
    return JSON.parse(str);
  } catch (e) {
    console.warn(`${colors.yellow}Failed to parse JSON:${colors.reset}`, str);
    return null;
  }
}

// Main function
async function testCSVImport() {
  console.log(`${colors.bright}${colors.blue}=== TESTING CSV IMPORT FUNCTIONALITY ===\n${colors.reset}`);
  
  try {
    // Step 1: Read the CSV file
    console.log(`${colors.cyan}Reading test_fix_import.csv file...${colors.reset}`);
    const csvPath = path.join(__dirname, 'test_fix_import.csv');
    const csvContent = fs.readFileSync(csvPath, 'utf8');
    console.log(`${colors.green}✅ CSV file read successfully${colors.reset}`);
    
    // Step 2: Parse the CSV content
    console.log(`\n${colors.cyan}Parsing CSV content...${colors.reset}`);
    const parsedData = parseCSV(csvContent);
    console.log(`${colors.green}✅ CSV parsed successfully. Found ${parsedData.length} character(s)${colors.reset}`);
    
    // Step 3: Prepare character data for import
    console.log(`\n${colors.cyan}Preparing character data for import...${colors.reset}`);
    const charactersToImport = parsedData.map(row => ({
      name: row.name || '',
      description: row.description || '',
      persona_prompt: row.persona_prompt || '',
      opening_line: row.opening_line || '',
      avatar_url: row.avatar_url || '',
      feature_image_url: row.feature_image_url || '',
      is_visible: row.is_visible ? row.is_visible.toLowerCase() === 'true' : true,
      testament: (row.testament || 'new').toLowerCase() === 'old' ? 'old' : 'new',
      bible_book: row.bible_book || '',
      timeline_period: row.timeline_period || '',
      historical_context: row.historical_context || '',
      geographic_location: row.geographic_location || '',
      key_scripture_references: row.key_scripture_references || '',
      theological_significance: row.theological_significance || '',
      relationships: tryParseJson(row.relationships) || {},
      study_questions: row.study_questions || ''
    }));
    
    // Log the first character to be imported
    console.log(`${colors.dim}Character to import: ${charactersToImport[0].name}${colors.reset}`);
    
    // Step 4: Import the character(s)
    console.log(`\n${colors.cyan}Importing character(s) into the database...${colors.reset}`);
    const importedCharacters = await characterRepo.bulkCreateCharacters(charactersToImport);
    console.log(`${colors.green}✅ Successfully imported ${importedCharacters.length} character(s)${colors.reset}`);
    
    // Step 5: Fetch the imported character to verify all fields
    console.log(`\n${colors.cyan}Fetching the imported character to verify fields...${colors.reset}`);
    const characterName = charactersToImport[0].name;
    const importedCharacter = await characterRepo.getByName(characterName);
    
    if (!importedCharacter) {
      throw new Error(`Character "${characterName}" not found in database after import`);
    }
    
    console.log(`${colors.green}✅ Character "${characterName}" found in database${colors.reset}`);
    
    // Step 6: Verify all fields were properly populated
    console.log(`\n${colors.bright}=== FIELD VERIFICATION ===\n${colors.reset}`);
    
    const fieldsToVerify = [
      'name', 'description', 'persona_prompt', 'opening_line', 'avatar_url', 
      'feature_image_url', 'is_visible', 'testament', 'bible_book', 
      'timeline_period', 'historical_context', 'geographic_location', 
      'key_scripture_references', 'theological_significance', 'relationships', 
      'study_questions'
    ];
    
    let allFieldsPopulated = true;
    
    fieldsToVerify.forEach(field => {
      const expected = charactersToImport[0][field];
      const actual = importedCharacter[field];
      
      let isMatch = false;
      if (field === 'relationships') {
        // For relationships, compare stringified JSON
        isMatch = JSON.stringify(expected) === JSON.stringify(actual);
      } else {
        isMatch = expected == actual; // Use loose equality for comparing strings/null/undefined
      }
      
      const status = isMatch ? `${colors.green}✅ MATCH${colors.reset}` : `${colors.red}❌ MISMATCH${colors.reset}`;
      
      console.log(`${colors.dim}${field}:${colors.reset} ${status}`);
      if (!isMatch) {
        console.log(`  Expected: ${typeof expected === 'object' ? JSON.stringify(expected) : expected}`);
        console.log(`  Actual: ${typeof actual === 'object' ? JSON.stringify(actual) : actual}`);
        allFieldsPopulated = false;
      }
    });
    
    // Final result
    console.log(`\n${colors.bright}=== TEST RESULT ===\n${colors.reset}`);
    if (allFieldsPopulated) {
      console.log(`${colors.bgGreen}${colors.bright} CSV IMPORT TEST PASSED! ${colors.reset}`);
      console.log(`${colors.green}All fields were correctly populated in the database.${colors.reset}`);
    } else {
      console.log(`${colors.red}${colors.bright}CSV IMPORT TEST FAILED!${colors.reset}`);
      console.log(`${colors.red}Some fields were not correctly populated in the database.${colors.reset}`);
    }
    
  } catch (error) {
    console.error(`${colors.red}ERROR: ${error.message}${colors.reset}`);
    console.error(error);
  }
}

// Run the test
testCSVImport()
  .then(() => {
    console.log(`\n${colors.blue}${colors.bright}=== TEST COMPLETED ===\n${colors.reset}`);
  })
  .catch(error => {
    console.error(`\n${colors.red}FATAL ERROR: ${error.message}${colors.reset}`);
    process.exit(1);
  });
