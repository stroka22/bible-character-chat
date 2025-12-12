import { json, requireSuperadmin, parseBody } from './_auth.mjs';
import { createClient } from '@supabase/supabase-js';
import { getEnv } from './_auth.mjs';
import { sendEmail } from '../_utils/email.mjs';

const SUPABASE_URL = getEnv('VITE_SUPABASE_URL') || getEnv('SUPABASE_URL') || getEnv('NEXT_PUBLIC_SUPABASE_URL');
const SERVICE_ROLE_KEY = getEnv('SUPABASE_SERVICE_ROLE_KEY') || getEnv('SUPABASE_SERVICE_ROLE') || getEnv('SUPABASE_SERVICE_KEY') || getEnv('SUPABASE_SERVICE') || getEnv('SUPABASE_SECRET');

export default async function handler(req, res) {
  const gate = await requireSuperadmin(req, res);
  if (!gate.ok) return json(res, gate.status, { error: gate.error });
  const admin = createClient(SUPABASE_URL, SERVICE_ROLE_KEY);

  if (req.method !== 'POST') {
    res.setHeader('Allow', 'POST');
    return json(res, 405, { error: 'Method Not Allowed' });
  }

  try {
    const body = parseBody(req);
    const subject = (body.subject || '').toString();
    const html = (body.html || '').toString();
    const ids = Array.isArray(body.ids) ? body.ids : [];
    const filter = (body.filter || '').toString();
    const preview = !!body.preview;
    if (!subject || !html) return json(res, 400, { error: 'subject and html required' });

    let recipients = [];
    if (ids.length) {
      const { data, error } = await admin.from('leads').select('email,name').in('id', ids);
      if (error) return json(res, 500, { error: error.message });
      recipients = data || [];
    } else {
      let query = admin.from('leads').select('email,name');
      if (filter) query = query.or(`name.ilike.%${filter}%,email.ilike.%${filter}%`);
      const { data, error } = await query.limit(1000);
      if (error) return json(res, 500, { error: error.message });
      recipients = data || [];
    }

    // Remove invalid emails
    recipients = recipients.filter(r => r?.email && /@/.test(r.email));
    if (!recipients.length) return json(res, 400, { error: 'No recipients' });

    if (preview) {
      // Only send to requesting superadmin email if available
      const to = gate.profile?.email || recipients[0].email;
      const resp = await sendEmail({ to, subject, html });
      return json(res, 200, { ok: !!resp.ok, preview_to: to, result: resp });
    }

    // Send in small batches to respect provider limits
    const BATCH = 30;
    let sent = 0, failures = 0;
    for (let i = 0; i < recipients.length; i += BATCH) {
      const batch = recipients.slice(i, i + BATCH);
      const to = batch.map(r => r.email);
      const resp = await sendEmail({ to, subject, html });
      if (resp.ok) sent += to.length; else failures += to.length;
    }
    return json(res, 200, { ok: true, sent, failures });
  } catch (e) {
    return json(res, 500, { error: e?.message || 'Send failed' });
  }
}
