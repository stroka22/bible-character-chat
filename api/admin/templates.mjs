import { json, requireSuperadmin, parseBody } from './_auth.mjs';
import { createClient } from '@supabase/supabase-js';
import { getEnv } from './_auth.mjs';

const SUPABASE_URL = getEnv('VITE_SUPABASE_URL') || getEnv('SUPABASE_URL') || getEnv('NEXT_PUBLIC_SUPABASE_URL');
const SERVICE_ROLE_KEY = getEnv('SUPABASE_SERVICE_ROLE_KEY') || getEnv('SUPABASE_SERVICE_ROLE') || getEnv('SUPABASE_SERVICE_KEY') || getEnv('SUPABASE_SERVICE') || getEnv('SUPABASE_SECRET');

export default async function handler(req, res) {
  const gate = await requireSuperadmin(req, res);
  if (!gate.ok) return json(res, gate.status, { error: gate.error });
  const admin = createClient(SUPABASE_URL, SERVICE_ROLE_KEY);

  const url = new URL(req.url, `http://${req.headers.host || 'localhost'}`);
  const key = (url.searchParams.get('key') || '').trim();
  if (!key) return json(res, 400, { error: 'key is required' });

  if (req.method === 'GET') {
    try {
      const { data, error } = await admin
        .from('email_templates')
        .select('key, subject, html, updated_at, updated_by')
        .eq('key', key)
        .maybeSingle();
      if (error) return json(res, 500, { error: error.message });
      if (!data) return json(res, 404, { error: 'Not found' });
      return json(res, 200, { template: data });
    } catch (e) {
      const msg = e?.message || '';
      if (msg.includes('relation') || msg.includes('does not exist')) {
        return json(res, 404, { error: 'templates_table_missing' });
      }
      return json(res, 500, { error: e?.message || 'Failed to load template' });
    }
  }

  if (req.method === 'PUT') {
    try {
      const body = parseBody(req);
      const subject = (body.subject || '').toString();
      const html = (body.html || '').toString();
      const payload = {
        key,
        subject,
        html,
        updated_at: new Date().toISOString(),
        updated_by: gate.user.id,
      };
      const { data, error } = await admin
        .from('email_templates')
        .upsert(payload, { onConflict: 'key' })
        .select('key, subject, html, updated_at, updated_by')
        .maybeSingle();
      if (error) return json(res, 500, { error: error.message });
      return json(res, 200, { template: data });
    } catch (e) {
      const msg = e?.message || '';
      if (msg.includes('relation') || msg.includes('does not exist')) {
        return json(res, 404, { error: 'templates_table_missing' });
      }
      return json(res, 500, { error: e?.message || 'Failed to save template' });
    }
  }

  res.setHeader('Allow', 'GET,PUT');
  return json(res, 405, { error: 'Method Not Allowed' });
}
