#!/usr/bin/env node

/**
 * Supabase SQL Runner
 * 
 * Runs SQL files against a Supabase project using the REST API.
 * Usage: node run_sql.js path/to/sql/file.sql
 * 
 * Required environment variables:
 * - SUPABASE_PROJECT_REF: The Supabase project reference ID
 * - SUPABASE_ACCESS_TOKEN: Your Supabase access token
 */

const fs = require('fs');
const path = require('path');

// Check for required command line argument
const sqlFilePath = process.argv[2];
if (!sqlFilePath) {
  console.error('Error: SQL file path is required');
  console.error('Usage: node run_sql.js path/to/sql/file.sql');
  process.exit(1);
}

// Check for required environment variables
const projectRef = process.env.SUPABASE_PROJECT_REF;
const accessToken = process.env.SUPABASE_ACCESS_TOKEN;

if (!projectRef) {
  console.error('Error: SUPABASE_PROJECT_REF environment variable is required');
  process.exit(1);
}

if (!accessToken) {
  console.error('Error: SUPABASE_ACCESS_TOKEN environment variable is required');
  process.exit(1);
}

// Read the SQL file
let sqlContent;
try {
  sqlContent = fs.readFileSync(sqlFilePath, 'utf8');
  console.log(`Read SQL file: ${path.basename(sqlFilePath)}`);
} catch (error) {
  console.error(`Error reading SQL file: ${error.message}`);
  process.exit(1);
}

// Execute the SQL against the Supabase API
async function executeSql() {
  const apiUrl = `https://api.supabase.com/v1/projects/${projectRef}/database/query`;
  
  console.log(`Executing SQL against project: ${projectRef}`);
  
  try {
    const response = await fetch(apiUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${accessToken}`
      },
      body: JSON.stringify({ query: sqlContent })
    });
    
    const responseText = await response.text();
    
    // Log the response
    console.log('Response:');
    console.log(responseText);
    
    // Exit with error code if the request failed
    if (response.status >= 400) {
      console.error(`Error: Request failed with status ${response.status}`);
      process.exit(1);
    }
    
    console.log('SQL executed successfully');
  } catch (error) {
    console.error(`Error executing SQL: ${error.message}`);
    process.exit(1);
  }
}

// Run the function
executeSql().catch(error => {
  console.error(`Unhandled error: ${error.message}`);
  process.exit(1);
});
