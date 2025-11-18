import { sendEmail } from './_utils/email.mjs';

export default async function handler(req, res) {
  if (req.method === 'OPTIONS') {
    res.status(204).end();
    return;
  }
  const url = new URL(req.url, `http://${req.headers.host || 'localhost'}`);
  const debug = url.searchParams.get('debug') === '1';
  if (req.method !== 'POST') {
    res.status(200).json({ ok: true, endpoint: 'email-test', debugTips: debug ? {
      hasApiKey: !!process.env.RESEND_API_KEY,
      from: process.env.EMAIL_FROM || null,
      replyTo: process.env.EMAIL_REPLY_TO || null,
    } : undefined });
    return;
  }

  try {
    const body = typeof req.body === 'string' ? JSON.parse(req.body || '{}') : (req.body || {});
    const to = body.to;
    const subject = body.subject || 'Test email from FaithTalk AI';
    const html = body.html || '<p>This is a test email sent via Resend.</p>';

    const result = await sendEmail({ to, subject, html });
    const payload = debug ? { ok: result.ok, id: result.id, error: result.error, code: result.code } : { id: result.id };
    res.status(result.ok ? 200 : 500).json(payload);
  } catch (e) {
    res.status(400).json({ error: e?.message || 'Invalid request' });
  }
}
