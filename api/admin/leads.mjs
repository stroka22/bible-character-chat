import { json, requireSuperadmin, parseBody } from './_auth.mjs';
import { createClient } from '@supabase/supabase-js';
import { getEnv } from './_auth.mjs';

const SUPABASE_URL = getEnv('VITE_SUPABASE_URL') || getEnv('SUPABASE_URL') || getEnv('NEXT_PUBLIC_SUPABASE_URL');
const SERVICE_ROLE_KEY = getEnv('SUPABASE_SERVICE_ROLE_KEY') || getEnv('SUPABASE_SERVICE_ROLE') || getEnv('SUPABASE_SERVICE_KEY') || getEnv('SUPABASE_SERVICE') || getEnv('SUPABASE_SECRET');

export default async function handler(req, res) {
  // CORS preflight
  if (req.method === 'OPTIONS') {
    res.status(204).end();
    return;
  }

  const gate = await requireSuperadmin(req, res);
  if (!gate.ok) return json(res, gate.status, { error: gate.error });
  const admin = createClient(SUPABASE_URL, SERVICE_ROLE_KEY);

  if (req.method === 'GET') {
    const url = new URL(req.url, `http://${req.headers.host || 'localhost'}`);
    const q = (url.searchParams.get('q') || '').trim();
    const page = Math.max(1, parseInt(url.searchParams.get('page') || '1', 10));
    const pageSize = Math.min(200, Math.max(1, parseInt(url.searchParams.get('pageSize') || '25', 10)));
    const from = (page - 1) * pageSize;
    const to = from + pageSize - 1;

    try {
      let query = admin.from('leads').select('*', { count: 'exact' }).order('created_at', { ascending: false }).range(from, to);
      if (q) {
        query = query.or(`name.ilike.%${q}%,email.ilike.%${q}%,phone.ilike.%${q}%`);
      }
      const { data, error, count } = await query;
      if (error) return json(res, 500, { error: error.message });
      return json(res, 200, { items: data || [], page, pageSize, total: count || 0 });
    } catch (e) {
      return json(res, 500, { error: e?.message || 'Failed to list leads' });
    }
  }

  if (req.method === 'POST') {
    try {
      const body = parseBody(req);
      const row = {
        name: body.name ?? null,
        email: body.email,
        phone: body.phone ?? null,
        role: body.role ?? null,
        consent_email: !!body.consent_email,
        consent_sms: !!body.consent_sms,
        source_path: body.source_path ?? null,
        utm_source: body.utm_source ?? null,
        utm_medium: body.utm_medium ?? null,
        utm_campaign: body.utm_campaign ?? null,
      };
      const { data, error } = await admin.from('leads').insert(row).select('*').maybeSingle();
      if (error) return json(res, 500, { error: error.message });
      return json(res, 200, { lead: data });
    } catch (e) {
      return json(res, 400, { error: e?.message || 'Invalid payload' });
    }
  }

  if (req.method === 'DELETE') {
    try {
      const body = parseBody(req);
      const ids = Array.isArray(body.ids) ? body.ids.filter(Boolean) : [];
      if (!ids.length) return json(res, 400, { error: 'ids array required' });
      const { error } = await admin.from('leads').delete().in('id', ids);
      if (error) return json(res, 500, { error: error.message });
      return json(res, 200, { ok: true, deleted: ids.length });
    } catch (e) {
      return json(res, 400, { error: e?.message || 'Invalid payload' });
    }
  }

  res.setHeader('Allow', 'GET,POST,DELETE,OPTIONS');
  return json(res, 405, { error: 'Method Not Allowed' });
}
