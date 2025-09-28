#!/usr/bin/env node
/*
 Simple RLS verification for public.profiles
 - superadmin should see many rows (>= admin)
 - admin should only see rows for their owner_slug
 - user should only see self (count === 1)
 - user cannot insert arbitrary profile (expect failure)
*/

const { createClient } = require('@supabase/supabase-js');
require('dotenv').config();

const url = process.env.VITE_SUPABASE_URL;
const key = process.env.VITE_SUPABASE_ANON_KEY;
const password = process.env.TEST_PASSWORD;
if (!password) {
  console.error('Missing TEST_PASSWORD in environment');
  process.exit(1);
}

const accounts = [
  { role: 'superadmin', email: process.env.TEST_SUPERADMIN_EMAIL || 'stroka22@yahoo.com' },
  { role: 'admin',      email: process.env.TEST_ADMIN_EMAIL || 'stroka22+admin@yahoo.com' },
  { role: 'user',       email: process.env.TEST_USER_EMAIL || 'stroka22+user@yahoo.com' },
];

async function signIn(email) {
  const supa = createClient(url, key);
  const { data, error } = await supa.auth.signInWithPassword({ email, password });
  if (error) throw new Error(`${email}: auth failed: ${error.message}`);
  return supa;
}

async function main() {
  let ok = true;

  // Fetch owner_slug for admin to validate scoping
  const adminClient = await signIn(accounts[1].email);
  const { data: adminProfile } = await adminClient
    .from('profiles')
    .select('owner_slug')
    .eq('id', (await adminClient.auth.getUser()).data.user.id)
    .single();
  const adminOwner = adminProfile?.owner_slug ?? null;
  await adminClient.auth.signOut();

  const results = {};

  for (const acc of accounts) {
    const supa = await signIn(acc.email);
    const { data: rows, count, error } = await supa
      .from('profiles')
      .select('id, owner_slug, email', { count: 'exact' })
      .limit(50);
    if (error) throw new Error(`${acc.role}: select error: ${error.message}`);

    results[acc.role] = { count, sample: rows?.slice(0, 3) || [] };

    if (acc.role === 'user') {
      if (count !== 1) { ok = false; results.user_error = `user sees ${count}, expected 1`; }
      // Negative insert: try to insert arbitrary profile
      const { error: insErr } = await supa
        .from('profiles')
        .insert({ id: crypto.randomUUID(), email: 'fake+insert@test.invalid' });
      if (!insErr) { ok = false; results.user_insert_error = 'user insert unexpectedly succeeded'; }
    }

    if (acc.role === 'admin' && adminOwner) {
      const bad = (rows || []).find(r => r.owner_slug !== null && r.owner_slug !== adminOwner);
      if (bad) { ok = false; results.admin_error = `admin saw foreign owner_slug: ${bad.owner_slug}`; }
    }

    await supa.auth.signOut();
  }

  // Relationship checks
  if (results.superadmin.count < results.admin.count) {
    ok = false; results.compare_error = 'superadmin count < admin count';
  }

  console.log(JSON.stringify({ ok, results }, null, 2));
  process.exit(ok ? 0 : 1);
}

main().catch(e => { console.error(e); process.exit(1); });
