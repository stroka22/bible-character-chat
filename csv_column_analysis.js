/**
 * csv_column_analysis.js
 * 
 * This script analyzes multiple CSV files used for character imports
 * and compares their headers with the actual database schema to identify
 * mismatches that could cause import issues.
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

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

// Database columns from query_db_structure.js output
const databaseColumns = [
  'id',
  'name',
  'description',
  'persona_prompt',
  'opening_line',
  'avatar_url',
  'created_at',
  'is_visible',
  'timeline_period',
  'historical_context',
  'geographic_location',
  'key_scripture_references',
  'theological_significance',
  'relationships',
  'study_questions',
  'testament',
  'bible_book',
  'group',
  'feature_image_url',
  'updated_at',
  'key_events',
  'character_traits',
  'scriptural_context'
];

// Legacy to new column mappings
const legacyColumnMappings = {
  'character_name': 'name',
  'opening_sentence': 'opening_line',
  'short_biography': '[NOT IN DB]' // Not stored in database
};

// CSV files to analyze
const csvFiles = [
  'sample_characters.csv',
  'complete_characters.csv', 
  'fixed_test_characters.csv',
  'test_fix_import.csv',
  'corrected_test_import.csv',
  'final_test_import.csv'
];

// Function to read CSV headers
function readCSVHeaders(filePath) {
  try {
    const content = fs.readFileSync(filePath, 'utf8');
    const lines = content.split('\n');
    if (lines.length === 0) return [];
    
    // First line contains headers
    const headers = lines[0].split(',').map(header => header.trim());
    return headers;
  } catch (error) {
    console.error(`${colors.red}Error reading ${filePath}: ${error.message}${colors.reset}`);
    return [];
  }
}

// Function to compare headers with database columns
function analyzeHeaders(headers) {
  const analysis = {
    matches: [],
    mismatches: [],
    legacyColumns: [],
    unknownColumns: []
  };
  
  headers.forEach(header => {
    // Check if it's a direct match
    if (databaseColumns.includes(header)) {
      analysis.matches.push(header);
    } 
    // Check if it's a legacy column
    else if (header in legacyColumnMappings) {
      analysis.legacyColumns.push({
        legacy: header,
        maps_to: legacyColumnMappings[header]
      });
    } 
    // Otherwise it's unknown
    else {
      analysis.unknownColumns.push(header);
    }
  });
  
  // Find database columns missing from the CSV
  databaseColumns.forEach(dbColumn => {
    // Skip system columns that shouldn't be in CSVs
    const systemColumns = ['id', 'created_at', 'updated_at', 'group', 'key_events', 'character_traits'];
    if (systemColumns.includes(dbColumn)) return;
    
    // Check if column is missing
    const directMatch = headers.includes(dbColumn);
    const hasLegacyVersion = Object.entries(legacyColumnMappings)
      .some(([legacy, modern]) => modern === dbColumn && headers.includes(legacy));
    
    if (!directMatch && !hasLegacyVersion) {
      analysis.mismatches.push(dbColumn);
    }
  });
  
  return analysis;
}

// Function to display a formatted table
function displayTable(rows, headers) {
  // Calculate column widths
  const colWidths = headers.map(header => header.length);
  
  rows.forEach(row => {
    headers.forEach((header, i) => {
      const cellContent = String(row[header] || '');
      colWidths[i] = Math.max(colWidths[i], cellContent.length);
    });
  });
  
  // Create header row
  let table = '\n';
  
  // Header
  table += '┌';
  headers.forEach((_, i) => {
    table += '─'.repeat(colWidths[i] + 2);
    table += (i < headers.length - 1) ? '┬' : '┐\n';
  });
  
  // Column names
  table += '│';
  headers.forEach((header, i) => {
    const paddedHeader = header.padEnd(colWidths[i]);
    table += ` ${paddedHeader} │`;
  });
  table += '\n';
  
  // Separator
  table += '├';
  headers.forEach((_, i) => {
    table += '─'.repeat(colWidths[i] + 2);
    table += (i < headers.length - 1) ? '┼' : '┤\n';
  });
  
  // Data rows
  rows.forEach(row => {
    table += '│';
    headers.forEach((header, i) => {
      const cell = String(row[header] || '').padEnd(colWidths[i]);
      table += ` ${cell} │`;
    });
    table += '\n';
  });
  
  // Footer
  table += '└';
  headers.forEach((_, i) => {
    table += '─'.repeat(colWidths[i] + 2);
    table += (i < headers.length - 1) ? '┴' : '┘\n';
  });
  
  return table;
}

// Main function
async function analyzeCSVFiles() {
  console.log(`${colors.bright}${colors.blue}=== CSV COLUMN ANALYSIS ===\n${colors.reset}`);
  
  const results = [];
  
  // Process each CSV file
  for (const csvFile of csvFiles) {
    const filePath = path.join(__dirname, csvFile);
    
    // Check if file exists
    if (!fs.existsSync(filePath)) {
      console.log(`${colors.yellow}File not found: ${csvFile} - skipping${colors.reset}`);
      continue;
    }
    
    console.log(`${colors.cyan}Analyzing ${csvFile}...${colors.reset}`);
    
    // Read headers
    const headers = readCSVHeaders(filePath);
    if (headers.length === 0) {
      console.log(`${colors.red}No headers found in ${csvFile}${colors.reset}`);
      continue;
    }
    
    // Analyze headers
    const analysis = analyzeHeaders(headers);
    
    // Calculate match percentage
    const requiredColumns = databaseColumns.filter(col => !['id', 'created_at', 'updated_at', 'group', 'key_events', 'character_traits'].includes(col));
    const directMatches = analysis.matches.length;
    const legacyMatches = analysis.legacyColumns.length;
    const totalMatches = directMatches + legacyMatches;
    const matchPercentage = Math.round((totalMatches / requiredColumns.length) * 100);
    
    // Store results
    results.push({
      'File Name': csvFile,
      'Total Headers': headers.length,
      'Direct Matches': directMatches,
      'Legacy Columns': legacyMatches,
      'Missing DB Columns': analysis.mismatches.length,
      'Unknown Columns': analysis.unknownColumns.length,
      'Match %': `${matchPercentage}%`,
      'Status': matchPercentage >= 90 ? 'GOOD' : matchPercentage >= 70 ? 'FAIR' : 'POOR'
    });
    
    // Display detailed analysis
    console.log(`${colors.green}✅ Found ${headers.length} columns${colors.reset}`);
    console.log(`${colors.dim}Direct matches: ${analysis.matches.length}${colors.reset}`);
    console.log(`${colors.dim}Legacy columns: ${analysis.legacyColumns.length}${colors.reset}`);
    console.log(`${colors.dim}Missing DB columns: ${analysis.mismatches.length}${colors.reset}`);
    console.log(`${colors.dim}Unknown columns: ${analysis.unknownColumns.length}${colors.reset}`);
    
    // List legacy columns and their mappings
    if (analysis.legacyColumns.length > 0) {
      console.log(`\n${colors.yellow}Legacy column mappings:${colors.reset}`);
      analysis.legacyColumns.forEach(mapping => {
        console.log(`  ${mapping.legacy} → ${mapping.maps_to}`);
      });
    }
    
    // List missing columns
    if (analysis.mismatches.length > 0) {
      console.log(`\n${colors.red}Missing database columns:${colors.reset}`);
      analysis.mismatches.forEach(column => {
        console.log(`  ${column}`);
      });
    }
    
    // List unknown columns
    if (analysis.unknownColumns.length > 0) {
      console.log(`\n${colors.yellow}Unknown columns (not in database):${colors.reset}`);
      analysis.unknownColumns.forEach(column => {
        console.log(`  ${column}`);
      });
    }
    
    console.log('\n' + '─'.repeat(50) + '\n');
  }
  
  // Display summary table
  if (results.length > 0) {
    console.log(`${colors.bright}=== SUMMARY TABLE ===\n${colors.reset}`);
    const tableHeaders = [
      'File Name', 
      'Total Headers', 
      'Direct Matches', 
      'Legacy Columns', 
      'Missing DB Columns', 
      'Unknown Columns', 
      'Match %', 
      'Status'
    ];
    
    const table = displayTable(results, tableHeaders);
    console.log(table);
    
    // Recommendations
    console.log(`${colors.bright}=== RECOMMENDATIONS ===\n${colors.reset}`);
    
    // Find the best CSV format
    const bestFormat = [...results].sort((a, b) => {
      return parseInt(b['Match %']) - parseInt(a['Match %']);
    })[0];
    
    console.log(`${colors.green}Best CSV format: ${bestFormat['File Name']} (${bestFormat['Match %']} match)${colors.reset}`);
    
    // General recommendations
    console.log(`\n${colors.bright}For optimal CSV imports:${colors.reset}`);
    console.log(`1. ${colors.cyan}Use modern column names:${colors.reset} 'name' instead of 'character_name'`);
    console.log(`2. ${colors.cyan}Use 'opening_line' instead of 'opening_sentence'${colors.reset}`);
    console.log(`3. ${colors.cyan}Ensure JSON fields are properly escaped${colors.reset} (relationships)`);
    console.log(`4. ${colors.cyan}Include all required fields:${colors.reset} name, description, persona_prompt, testament, is_visible`);
    console.log(`5. ${colors.cyan}For complete character insights,${colors.reset} include: timeline_period, historical_context, geographic_location, key_scripture_references, theological_significance, study_questions`);
  }
  
  console.log(`\n${colors.blue}${colors.bright}=== ANALYSIS COMPLETE ===\n${colors.reset}`);
}

// Run the analysis
analyzeCSVFiles()
  .catch(error => {
    console.error(`\n${colors.red}FATAL ERROR: ${error.message}${colors.reset}`);
    process.exit(1);
  });
