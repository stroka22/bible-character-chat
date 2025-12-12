import { createClient } from '@supabase/supabase-js';

export function getEnv(name) {
  return process.env[name] || process.env[name.toUpperCase()] || '';
}

export function json(res, status, body) {
  res.status(status);
  res.setHeader('Content-Type', 'application/json');
  res.end(JSON.stringify(body));
}

const SUPABASE_URL = getEnv('VITE_SUPABASE_URL') || getEnv('SUPABASE_URL') || getEnv('NEXT_PUBLIC_SUPABASE_URL');
const SERVICE_ROLE_KEY = getEnv('SUPABASE_SERVICE_ROLE_KEY') || getEnv('SUPABASE_SERVICE_ROLE') || getEnv('SUPABASE_SERVICE_KEY') || getEnv('SUPABASE_SERVICE') || getEnv('SUPABASE_SECRET');

export function getAdminClient() {
  if (!SUPABASE_URL || !SERVICE_ROLE_KEY) return null;
  return createClient(SUPABASE_URL, SERVICE_ROLE_KEY);
}

export async function requireSuperadmin(req, res) {
  const supa = getAdminClient();
  if (!supa) return { ok: false, status: 500, error: 'Server missing Supabase service role configuration' };
  const authHeader = req.headers['authorization'] || req.headers['Authorization'];
  if (!authHeader || !authHeader.toString().startsWith('Bearer ')) {
    return { ok: false, status: 401, error: 'Missing Authorization bearer token' };
  }
  const token = authHeader.toString().slice('Bearer '.length).trim();
  const { data: userRes, error: userErr } = await supa.auth.getUser(token);
  if (userErr || !userRes?.user) {
    return { ok: false, status: 401, error: 'Invalid token' };
  }
  const userId = userRes.user.id;
  const { data: profile, error: profErr } = await supa
    .from('profiles')
    .select('id, role, owner_slug, email')
    .eq('id', userId)
    .maybeSingle();
  if (profErr) return { ok: false, status: 500, error: profErr.message };
  if (!profile) return { ok: false, status: 403, error: 'Profile not found' };
  if (profile.role !== 'superadmin') return { ok: false, status: 403, error: 'Forbidden' };
  return { ok: true, supa, user: userRes.user, profile };
}

export async function optionalSuperadmin(req) {
  const supa = getAdminClient();
  if (!supa) return { ok: false };
  const authHeader = req.headers['authorization'] || req.headers['Authorization'];
  if (!authHeader || !authHeader.toString().startsWith('Bearer ')) return { ok: false };
  const token = authHeader.toString().slice('Bearer '.length).trim();
  const { data: userRes } = await supa.auth.getUser(token);
  const uid = userRes?.user?.id;
  if (!uid) return { ok: false };
  const { data: profile } = await supa.from('profiles').select('id, role, owner_slug, email').eq('id', uid).maybeSingle();
  return { ok: true, supa, user: userRes?.user || null, profile: profile || null };
}

export function parseBody(req) {
  try {
    if (typeof req.body === 'object' && req.body !== null) return req.body;
    return JSON.parse(req.body || '{}');
  } catch {
    return {};
  }
}
