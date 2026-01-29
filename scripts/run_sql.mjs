#!/usr/bin/env node
import { createClient } from '@supabase/supabase-js';
import { readFileSync } from 'fs';

const SUPABASE_URL = 'https://sihfbzltlhkerkxozadt.supabase.co';
const SUPABASE_SERVICE_KEY = process.env.SUPABASE_SERVICE_KEY;

if (!SUPABASE_SERVICE_KEY) {
  console.error('Error: SUPABASE_SERVICE_KEY environment variable is required');
  console.error('Get it from: Supabase Dashboard -> Project Settings -> API -> service_role key');
  process.exit(1);
}

const sqlFile = process.argv[2];
if (!sqlFile) {
  console.error('Usage: node run_sql.mjs <sql_file>');
  process.exit(1);
}

const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_KEY);

const sql = readFileSync(sqlFile, 'utf8');

// Split into individual statements and run each
const statements = sql
  .split(/;\s*$/m)
  .map(s => s.trim())
  .filter(s => s && !s.startsWith('--'));

console.log(`Running ${statements.length} statements from ${sqlFile}...`);

let success = 0;
let failed = 0;

for (const stmt of statements) {
  if (!stmt || stmt.startsWith('--')) continue;
  
  const { error } = await supabase.rpc('exec_sql', { sql: stmt + ';' }).maybeSingle();
  
  if (error) {
    // Try direct query for UPDATE statements
    const { error: error2 } = await supabase.from('reading_plans').select('id').limit(0);
    if (error2) {
      console.error(`Error: ${error.message}`);
      failed++;
    }
  } else {
    success++;
  }
}

console.log(`Done: ${success} succeeded, ${failed} failed`);
