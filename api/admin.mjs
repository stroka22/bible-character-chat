import { createClient } from '@supabase/supabase-js';
import { getAdminClient, jsonNode, parseBodyNode, getEnv, requireSuperadminNode } from '../src/server/_auth.mjs';

export default async function handler(req, res) {
  const url = new URL(req.url, `http://${req.headers.host || 'localhost'}`);
  const path = (url.searchParams.get('path') || '').trim();

  // CORS preflight
  if (req.method === 'OPTIONS') return res.status(204).end();

  const gate = await requireSuperadminNode(req);
  if (!gate.ok) return jsonNode(res, gate.status, { error: gate.error });
  const supa = getAdminClient();
  const SUPABASE_URL = getEnv('VITE_SUPABASE_URL') || getEnv('SUPABASE_URL') || getEnv('NEXT_PUBLIC_SUPABASE_URL');
  const SERVICE_ROLE_KEY = getEnv('SUPABASE_SERVICE_ROLE_KEY') || getEnv('SUPABASE_SERVICE_ROLE') || getEnv('SUPABASE_SERVICE_KEY') || getEnv('SUPABASE_SERVICE') || getEnv('SUPABASE_SECRET');
  const admin = createClient(SUPABASE_URL, SERVICE_ROLE_KEY);

  try {
    switch (path) {
      case 'leads':
        return await handleLeads(req, res, admin);
      case 'leads-import':
        return await handleLeadsImport(req, res, admin);
      case 'leads-send':
        return await handleLeadsSend(req, res, admin, gate);
      case 'templates':
        return await handleTemplates(req, res, admin, gate);
      default:
        res.setHeader('Allow', 'GET,POST,DELETE,PUT,OPTIONS');
        return jsonNode(res, 404, { error: 'Not Found', path });
    }
  } catch (e) {
    return jsonNode(res, 500, { error: e?.message || 'Server error' });
  }
}

async function handleLeads(req, res, admin) {
  if (req.method === 'GET') {
    const url = new URL(req.url, `http://${req.headers.host || 'localhost'}`);
    const q = (url.searchParams.get('q') || '').trim();
    const page = Math.max(1, parseInt(url.searchParams.get('page') || '1', 10));
    const pageSize = Math.min(200, Math.max(1, parseInt(url.searchParams.get('pageSize') || '25', 10)));
    const from = (page - 1) * pageSize;
    const to = from + pageSize - 1;

    let query = admin.from('leads').select('*', { count: 'exact' }).order('created_at', { ascending: false }).range(from, to);
    if (q) query = query.or(`name.ilike.%${q}%,email.ilike.%${q}%,phone.ilike.%${q}%`);
    const { data, error, count } = await query;
    if (error) return jsonNode(res, 500, { error: error.message });
    return jsonNode(res, 200, { items: data || [], page, pageSize, total: count || 0 });
  }

  if (req.method === 'POST') {
    const body = parseBodyNode(req);
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
    if (error) return jsonNode(res, 500, { error: error.message });
    return jsonNode(res, 200, { lead: data });
  }

  if (req.method === 'DELETE') {
    const body = parseBodyNode(req);
    const ids = Array.isArray(body.ids) ? body.ids.filter(Boolean) : [];
    if (!ids.length) return jsonNode(res, 400, { error: 'ids array required' });
    const { error } = await admin.from('leads').delete().in('id', ids);
    if (error) return jsonNode(res, 500, { error: error.message });
    return jsonNode(res, 200, { ok: true, deleted: ids.length });
  }

  res.setHeader('Allow', 'GET,POST,DELETE');
  return jsonNode(res, 405, { error: 'Method Not Allowed' });
}

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

async function handleLeadsImport(req, res, admin) {
  if (req.method !== 'POST') {
    res.setHeader('Allow', 'POST');
    return jsonNode(res, 405, { error: 'Method Not Allowed' });
  }
  let body = parseBodyNode(req);
  let rows = [];
  if (Array.isArray(body)) rows = body;
  else if (body.rows && Array.isArray(body.rows)) rows = body.rows;
  else if (typeof body.csv === 'string') rows = parseCSV(body.csv);
  else if (typeof req.body === 'string') rows = parseCSV(req.body);
  if (!rows.length) return jsonNode(res, 400, { error: 'No rows to import' });

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

  const size = 500;
  let inserted = 0;
  for (let i = 0; i < mapped.length; i += size) {
    const chunk = mapped.slice(i, i + size);
    const { data, error } = await admin.from('leads').insert(chunk).select('id');
    if (error) return jsonNode(res, 500, { error: error.message });
    inserted += data?.length || 0;
  }
  return jsonNode(res, 200, { ok: true, inserted });
}

import { sendEmail } from './_utils/email.mjs';
async function handleLeadsSend(req, res, admin, gate) {
  if (req.method !== 'POST') {
    res.setHeader('Allow', 'POST');
    return jsonNode(res, 405, { error: 'Method Not Allowed' });
  }
  const body = parseBodyNode(req);
  const subject = (body.subject || '').toString();
  const html = (body.html || '').toString();
  const ids = Array.isArray(body.ids) ? body.ids : [];
  const filter = (body.filter || '').toString();
  const preview = !!body.preview;
  if (!subject || !html) return jsonNode(res, 400, { error: 'subject and html required' });

  let recipients = [];
  if (ids.length) {
    const { data, error } = await admin.from('leads').select('email,name').in('id', ids);
    if (error) return jsonNode(res, 500, { error: error.message });
    recipients = data || [];
  } else {
    let query = admin.from('leads').select('email,name');
    if (filter) query = query.or(`name.ilike.%${filter}%,email.ilike.%${filter}%`);
    const { data, error } = await query.limit(1000);
    if (error) return jsonNode(res, 500, { error: error.message });
    recipients = data || [];
  }

  recipients = recipients.filter(r => r?.email && /@/.test(r.email));
  if (!recipients.length) return jsonNode(res, 400, { error: 'No recipients' });

  if (preview) {
    const to = gate.profile?.email || recipients[0].email;
    const resp = await sendEmail({ to, subject, html });
    return jsonNode(res, 200, { ok: !!resp.ok, preview_to: to, result: resp });
  }

  const BATCH = 30;
  let sent = 0, failures = 0;
  for (let i = 0; i < recipients.length; i += BATCH) {
    const batch = recipients.slice(i, i + BATCH);
    const to = batch.map(r => r.email);
    const resp = await sendEmail({ to, subject, html });
    if (resp.ok) sent += to.length; else failures += to.length;
  }
  return jsonNode(res, 200, { ok: true, sent, failures });
}

async function handleTemplates(req, res, admin, gate) {
  const url = new URL(req.url, `http://${req.headers.host || 'localhost'}`);
  const key = (url.searchParams.get('key') || '').trim();
  if (!key) return jsonNode(res, 400, { error: 'key is required' });

  if (req.method === 'GET') {
    try {
      const { data, error } = await admin
        .from('email_templates')
        .select('key, subject, html, updated_at, updated_by')
        .eq('key', key)
        .maybeSingle();
      if (error) return jsonNode(res, 500, { error: error.message });
      if (!data) return jsonNode(res, 404, { error: 'Not found' });
      return jsonNode(res, 200, { template: data });
    } catch (e) {
      const msg = e?.message || '';
      if (msg.includes('relation') || msg.includes('does not exist')) {
        return jsonNode(res, 404, { error: 'templates_table_missing' });
      }
      return jsonNode(res, 500, { error: e?.message || 'Failed to load template' });
    }
  }

  if (req.method === 'PUT') {
    try {
      const body = parseBodyNode(req);
      const subject = (body.subject || '').toString();
      const html = (body.html || '').toString();
      const payload = { key, subject, html, updated_at: new Date().toISOString(), updated_by: gate.user.id };
      const { data, error } = await admin
        .from('email_templates')
        .upsert(payload, { onConflict: 'key' })
        .select('key, subject, html, updated_at, updated_by')
        .maybeSingle();
      if (error) return jsonNode(res, 500, { error: error.message });
      return jsonNode(res, 200, { template: data });
    } catch (e) {
      const msg = e?.message || '';
      if (msg.includes('relation') || msg.includes('does not exist')) {
        return jsonNode(res, 404, { error: 'templates_table_missing' });
      }
      return jsonNode(res, 500, { error: e?.message || 'Failed to save template' });
    }
  }

  res.setHeader('Allow', 'GET,PUT');
  return jsonNode(res, 405, { error: 'Method Not Allowed' });
}
