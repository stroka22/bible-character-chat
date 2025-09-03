import { createClient } from '@supabase/supabase-js';
import { notifyLead } from './_utils/notify-lead.mjs';

function json(res, status, body) {
  res.status(status);
  res.setHeader('Content-Type', 'application/json');
  // Allow same-origin and simple cross-origin tests
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  res.end(JSON.stringify(body));
}

export default async function handler(req, res) {
  if (req.method === 'OPTIONS') {
    return json(res, 200, { ok: true });
  }
  if (req.method !== 'POST') {
    if (req.method === 'GET' || req.method === 'HEAD') {
      return json(res, 200, { ok: true });
    }
    return json(res, 405, { error: 'Method not allowed' });
  }

  const SUPABASE_URL = process.env.VITE_SUPABASE_URL || process.env.SUPABASE_URL;
  const SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!SUPABASE_URL || !SERVICE_ROLE_KEY) {
    return json(res, 500, { error: 'Supabase server env not configured' });
  }

  const admin = createClient(SUPABASE_URL, SERVICE_ROLE_KEY);

  try {
    let bodyRaw = req.body;
    if (typeof bodyRaw === 'string') {
      try { bodyRaw = JSON.parse(bodyRaw || '{}'); } catch { bodyRaw = {}; }
    } else if (bodyRaw == null) {
      bodyRaw = {};
    }
    if (Object.prototype.toString.call(bodyRaw) !== '[object Object]') {
      bodyRaw = {};
    }

    const payload = bodyRaw;
    if (!payload || typeof payload !== 'object') {
      return json(res, 400, { error: 'Invalid payload' });
    }
    const email = payload.email && String(payload.email).trim();
    if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      return json(res, 400, { error: 'Valid email is required' });
    }

    // Normalize fields to match the leads schema
    const row = {
      name: payload.name ?? null,
      email,
      phone: payload.phone ?? null,
      role: payload.role ?? 'user',
      consent_email: !!payload.consent_email,
      consent_sms: !!payload.consent_sms,
      source_path: payload.source_path ?? null,
      utm_source: payload.utm_source ?? null,
      utm_medium: payload.utm_medium ?? null,
      utm_campaign: payload.utm_campaign ?? null,
    };

    const { data, error } = await admin
      .from('leads')
      .insert(row)
      .select()
      .maybeSingle();

    if (error) {
      return json(res, 500, { error: error.message });
    }

    /* ------------------------------------------------------------------ */
    /* Side-effect notifications (non-blocking)                           */
    /* ------------------------------------------------------------------ */
    try {
      // notifyLead is internally time-bounded; await to ensure completion
      await notifyLead(data || row);
    } catch {
      /* ignore notification errors */
    }

    return json(res, 200, { lead: data });
  } catch (err) {
    return json(res, 500, { error: err?.message || 'Unexpected error' });
  }
}
