import { json, requireSuperadmin, parseBody } from './_auth.mjs';
import { createClient } from '@supabase/supabase-js';
import { getEnv } from './_auth.mjs';

const SUPABASE_URL = getEnv('VITE_SUPABASE_URL') || getEnv('SUPABASE_URL') || getEnv('NEXT_PUBLIC_SUPABASE_URL');
const SERVICE_ROLE_KEY = getEnv('SUPABASE_SERVICE_ROLE_KEY') || getEnv('SUPABASE_SERVICE_ROLE') || getEnv('SUPABASE_SERVICE_KEY') || getEnv('SUPABASE_SERVICE') || getEnv('SUPABASE_SECRET');

function parseCSV(text) {
  const lines = text.split(/\r?\n/).filter(Boolean);
  if (!lines.length) return [];
  const header = lines[0].split(',').map(h => h.trim().toLowerCase());
  const rows = [];
  for (let i = 1; i < lines.length; i++) {
    const cols = lines[i].split(',').map(c => c.trim());
    const r = {};
    header.forEach((h, idx) => { r[h] = cols[idx] || ''; });
    rows.push(r);
  }
  return rows;
}

export default async function handler(req, res) {
  const gate = await requireSuperadmin(req, res);
  if (!gate.ok) return json(res, gate.status, { error: gate.error });
  const admin = createClient(SUPABASE_URL, SERVICE_ROLE_KEY);

  if (req.method !== 'POST') {
    res.setHeader('Allow', 'POST');
    return json(res, 405, { error: 'Method Not Allowed' });
  }

  try {
    let body = parseBody(req);
    let rows = [];
    if (Array.isArray(body)) {
      rows = body;
    } else if (body.rows && Array.isArray(body.rows)) {
      rows = body.rows;
    } else if (typeof body.csv === 'string') {
      rows = parseCSV(body.csv);
    } else if (typeof req.body === 'string') {
      // Allow raw CSV upload
      rows = parseCSV(req.body);
    }
    if (!rows.length) return json(res, 400, { error: 'No rows to import' });

    const mapped = rows.map(r => ({
      name: r.name || r.full_name || null,
      email: r.email,
      phone: r.phone || r.phone_number || null,
      role: r.role || null,
      consent_email: String(r.consent_email || r.email_opt_in || '').toLowerCase() === 'true',
      consent_sms: String(r.consent_sms || r.sms_opt_in || '').toLowerCase() === 'true',
      source_path: r.source_path || r.source || null,
      utm_source: r.utm_source || null,
      utm_medium: r.utm_medium || null,
      utm_campaign: r.utm_campaign || null,
    }));

    const chunks = [];
    const size = 500;
    for (let i = 0; i < mapped.length; i += size) chunks.push(mapped.slice(i, i + size));
    let inserted = 0;
    for (const chunk of chunks) {
      const { data, error } = await admin.from('leads').insert(chunk).select('id');
      if (error) return json(res, 500, { error: error.message });
      inserted += data?.length || 0;
    }
    return json(res, 200, { ok: true, inserted });
  } catch (e) {
    return json(res, 500, { error: e?.message || 'Import failed' });
  }
}
