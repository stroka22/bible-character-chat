import { createClient } from '@supabase/supabase-js';

function json(res, status, body) {
  res.status(status);
  res.setHeader('Content-Type', 'application/json');
  res.end(JSON.stringify(body));
}

function getEnv(name) {
  return process.env[name] || process.env[name.toUpperCase()] || '';
}

const SUPABASE_URL = getEnv('VITE_SUPABASE_URL') || getEnv('SUPABASE_URL') || getEnv('NEXT_PUBLIC_SUPABASE_URL');
const SERVICE_ROLE_KEY = getEnv('SUPABASE_SERVICE_ROLE_KEY') || getEnv('SUPABASE_SERVICE_ROLE') || getEnv('SUPABASE_SERVICE_KEY') || getEnv('SUPABASE_SERVICE') || getEnv('SUPABASE_SECRET');

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    res.setHeader('Allow', 'POST');
    return json(res, 405, { error: 'Method Not Allowed' });
  }

  if (!SUPABASE_URL || !SERVICE_ROLE_KEY) {
    return json(res, 500, { error: 'Server misconfiguration: missing SUPABASE_URL or SERVICE ROLE key' });
  }

  try {
    const authHeader = req.headers['authorization'] || req.headers['Authorization'];
    if (!authHeader || !authHeader.toString().startsWith('Bearer ')) {
      return json(res, 401, { error: 'Missing Authorization bearer token' });
    }
    const token = authHeader.toString().slice('Bearer '.length).trim();

    const supaAdmin = createClient(SUPABASE_URL, SERVICE_ROLE_KEY);

    // Validate token and get user
    const { data: userRes, error: userErr } = await supaAdmin.auth.getUser(token);
    if (userErr || !userRes?.user) {
      return json(res, 401, { error: 'Invalid token' });
    }

    const userId = userRes.user.id;
    // Load profile to determine role and owner scope
    const { data: profile, error: profErr } = await supaAdmin
      .from('profiles')
      .select('id, role, owner_slug')
      .eq('id', userId)
      .maybeSingle();
    if (profErr) return json(res, 500, { error: profErr.message });
    if (!profile) return json(res, 403, { error: 'Profile not found' });

    const isAdmin = profile.role === 'admin' || profile.role === 'superadmin';
    const isSuperadmin = profile.role === 'superadmin';
    if (!isAdmin) return json(res, 403, { error: 'Forbidden' });

    // Parse body
    let body = {};
    try {
      body = typeof req.body === 'object' && req.body !== null ? req.body : JSON.parse(req.body || '{}');
    } catch (_) {
      return json(res, 400, { error: 'Invalid JSON body' });
    }

    const owner_slug = (body.owner_slug || '').toString();
    const defaults = body.defaults || {};
    const limits = body.limits || {};
    const locks = body.locks || {};

    if (!owner_slug) return json(res, 400, { error: 'owner_slug is required' });

    // Admins can only write for their own owner_slug; superadmin can write any
    if (!isSuperadmin && profile.owner_slug && profile.owner_slug !== owner_slug) {
      return json(res, 403, { error: 'Cannot modify another organization\'s settings' });
    }

    const payload = {
      owner_slug,
      defaults,
      limits,
      locks,
      updated_at: new Date().toISOString(),
    };

    const { data, error } = await supaAdmin
      .from('roundtable_settings')
      .upsert(payload, { onConflict: 'owner_slug' })
      .select('*')
      .single();

    if (error) return json(res, 500, { error: error.message });
    return json(res, 200, { data });
  } catch (e) {
    return json(res, 500, { error: e?.message || 'Unexpected error' });
  }
}
