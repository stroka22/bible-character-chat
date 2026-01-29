#!/usr/bin/env node
import pg from 'pg';
import { readFileSync } from 'fs';

const { Client } = pg;

const DATABASE_URL = process.env.DATABASE_URL;

if (!DATABASE_URL) {
  console.error('Error: DATABASE_URL environment variable is required');
  console.error('');
  console.error('Get it from: Supabase Dashboard -> Project Settings -> Database -> Connection string -> URI');
  console.error('');
  console.error('Run as:');
  console.error('DATABASE_URL="postgresql://postgres:PASSWORD@db.sihfbzltlhkerkxozadt.supabase.co:5432/postgres" node scripts/apply_sql.mjs <file.sql>');
  process.exit(1);
}

const sqlFile = process.argv[2];
if (!sqlFile) {
  console.error('Usage: DATABASE_URL="..." node scripts/apply_sql.mjs <sql_file>');
  process.exit(1);
}

console.log(`Reading ${sqlFile}...`);
const sql = readFileSync(sqlFile, 'utf8');

const client = new Client({
  connectionString: DATABASE_URL,
  ssl: { rejectUnauthorized: false }
});

try {
  console.log('Connecting to database...');
  await client.connect();
  
  console.log('Executing SQL...');
  const result = await client.query(sql);
  
  console.log('Success!');
  if (Array.isArray(result)) {
    console.log(`Executed ${result.length} statements`);
  }
} catch (err) {
  console.error('Error:', err.message);
  process.exit(1);
} finally {
  await client.end();
}
