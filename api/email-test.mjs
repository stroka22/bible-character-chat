import { sendEmail } from './_utils/email.mjs';

export default async function handler(req, res) {
  if (req.method === 'OPTIONS') {
    res.status(204).end();
    return;
  }
  if (req.method !== 'POST') {
    res.status(405).json({ error: 'Method not allowed' });
    return;
  }

  try {
    const body = typeof req.body === 'string' ? JSON.parse(req.body || '{}') : (req.body || {});
    const to = body.to;
    const subject = body.subject || 'Test email from FaithTalk AI';
    const html = body.html || '<p>This is a test email sent via Resend.</p>';

    const result = await sendEmail({ to, subject, html });
    if (!result.ok) {
      res.status(500).json({ error: result.error });
      return;
    }
    res.status(200).json({ id: result.id });
  } catch (e) {
    res.status(400).json({ error: e?.message || 'Invalid request' });
  }
}
