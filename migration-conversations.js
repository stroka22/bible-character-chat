#!/usr/bin/env node
/**
 * Bible Character Chat - Conversation Schema Migration
 * 
 * This script applies the conversation schema migration to Supabase.
 * It creates the necessary tables, functions, and policies for the
 * conversation persistence feature.
 */

const fs = require('fs').promises;
const path = require('path');
const { createClient } = require('@supabase/supabase-js');
require('dotenv').config();

// ANSI color codes for better logging
const colors = {
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

/**
 * Log a message with optional color
 */
function log(message, color = colors.reset) {
  console.log(`${color}${message}${colors.reset}`);
}

/**
 * Log an error message
 */
function logError(message, error = null) {
  console.error(`${colors.red}ERROR: ${message}${colors.reset}`);
  if (error) {
    console.error(`${colors.dim}${error.stack || error}${colors.reset}`);
  }
}

/**
 * Main function to apply the migration
 */
async function applyMigration() {
  log(`${colors.bright}${colors.blue}Bible Character Chat - Conversation Schema Migration${colors.reset}`, colors.bright);
  log('Starting migration process...', colors.cyan);

  try {
    // Validate environment variables
    const supabaseUrl = process.env.SUPABASE_URL;
    const supabaseKey = process.env.SUPABASE_SERVICE_KEY || process.env.SUPABASE_ADMIN_KEY;

    if (!supabaseUrl || !supabaseKey) {
      throw new Error(
        'Missing required environment variables. Please ensure SUPABASE_URL and ' +
        'either SUPABASE_SERVICE_KEY or SUPABASE_ADMIN_KEY are set in your .env file.'
      );
    }

    // Read the SQL file
    log('Reading SQL migration file...', colors.cyan);
    const sqlFilePath = path.join(__dirname, 'sql', 'conversation_schema.sql');
    const sql = await fs.readFile(sqlFilePath, 'utf8');
    log(`SQL file loaded: ${sqlFilePath}`, colors.green);

    // Connect to Supabase
    log('Connecting to Supabase...', colors.cyan);
    const supabase = createClient(supabaseUrl, supabaseKey, {
      auth: {
        autoRefreshToken: false,
        persistSession: false
      }
    });
    log('Connected to Supabase successfully', colors.green);

    // Execute the SQL
    log('Applying migration...', colors.cyan);
    log('This may take a moment as we create tables, indexes, functions, and policies.', colors.yellow);
    
    const { error } = await supabase.rpc('exec_sql', { sql });
    
    if (error) {
      throw new Error(`Failed to execute SQL: ${error.message}`);
    }

    // Migration successful
    log(`${colors.bright}${colors.green}Migration completed successfully!${colors.reset}`, colors.bright);
    log('The following changes were applied:', colors.cyan);
    log('  - Created conversations table', colors.green);
    log('  - Created messages table', colors.green);
    log('  - Created indexes for efficient querying', colors.green);
    log('  - Added triggers for automatic timestamp updates', colors.green);
    log('  - Set up Row Level Security (RLS) policies', colors.green);
    log('  - Created helper functions for conversation management', colors.green);
    
    log('\nYou can now use the conversation persistence features in the application.', colors.bright);
    process.exit(0);
  } catch (error) {
    logError('Migration failed', error);
    
    // Provide helpful troubleshooting advice based on common errors
    if (error.message.includes('permission denied')) {
      log('\nTROUBLESHOOTING:', colors.yellow);
      log('This error suggests your Supabase key doesn\'t have sufficient permissions.', colors.yellow);
      log('Make sure you\'re using the service_role key or admin key, not the anon key.', colors.yellow);
    } else if (error.message.includes('relation') && error.message.includes('already exists')) {
      log('\nTROUBLESHOOTING:', colors.yellow);
      log('The tables already exist. If you want to recreate them:', colors.yellow);
      log('1. Drop the existing tables first, or', colors.yellow);
      log('2. Modify the SQL to use CREATE TABLE IF NOT EXISTS', colors.yellow);
    } else if (error.message.includes('ENOENT') || error.message.includes('no such file')) {
      log('\nTROUBLESHOOTING:', colors.yellow);
      log(`Make sure the SQL file exists at: ${path.join(__dirname, 'sql', 'conversation_schema.sql')}`, colors.yellow);
      log('Run this script from the project root directory.', colors.yellow);
    } else if (error.message.includes('exec_sql')) {
      log('\nTROUBLESHOOTING:', colors.yellow);
      log('The exec_sql function is missing in your Supabase instance.', colors.yellow);
      log('You need to create this function first. Try running:', colors.yellow);
      log(`
CREATE OR REPLACE FUNCTION exec_sql(sql text)
RETURNS void AS $$
BEGIN
  EXECUTE sql;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
      `, colors.dim);
    }
    
    process.exit(1);
  }
}

// Run the migration
applyMigration();
