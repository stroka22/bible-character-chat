export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ ok: false, error: 'Method not allowed' });
  }
  try {
    const { email, name } = req.body || {};
    if (!email || typeof email !== 'string') {
      return res.status(400).json({ ok: false, error: 'Missing email' });
    }

    const subject = 'Your Premium subscription is active – Welcome!';
    const html = `
      <div style="font-family: -apple-system, Segoe UI, Roboto, Helvetica, Arial, sans-serif; line-height: 1.6; color: #0f172a;">
        <h2 style="color:#7c3aed;">FaithTalkAI Premium is live</h2>
        <p>Hi${name ? ' ' + name : ''},</p>
        <p>Thank you for upgrading. Your premium access is now active.</p>
        <ul>
          <li>Full character library</li>
          <li>Unlimited conversation length</li>
          <li>All denominations and features unlocked</li>
        </ul>
        <p>
          Start here: <a href="https://faithtalkai.com/conversations" target="_blank">Your Conversations</a><br/>
          Browse characters: <a href="https://faithtalkai.com/" target="_blank">Home</a>
        </p>
        <p style="margin-top: 24px; color:#334155; font-size: 12px;">If you did not authorize this purchase, reply to this email and we'll help immediately.</p>
      </div>
    `;

    // Try SendGrid
    if (process.env.SENDGRID_API_KEY && process.env.SENDGRID_FROM) {
      try {
        const resp = await fetch('https://api.sendgrid.com/v3/mail/send', {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${process.env.SENDGRID_API_KEY}`,
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({
            personalizations: [{ to: [{ email }] }],
            from: { email: process.env.SENDGRID_FROM },
            subject,
            content: [{ type: 'text/html', value: html }]
          })
        });
        if (resp.ok) return res.status(200).json({ ok: true, provider: 'sendgrid' });
      } catch {}
    }

    // Try Resend
    if (process.env.RESEND_API_KEY && process.env.RESEND_FROM) {
      try {
        const resp = await fetch('https://api.resend.com/emails', {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${process.env.RESEND_API_KEY}`,
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({
            from: process.env.RESEND_FROM,
            to: [email],
            subject,
            html
          })
        });
        if (resp.ok) return res.status(200).json({ ok: true, provider: 'resend' });
      } catch {}
    }

    // Fallback: forward to LEADS webhook/CRM if configured
    if (process.env.LEADS_WEBHOOK_URL) {
      try {
        await fetch(process.env.LEADS_WEBHOOK_URL, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ type: 'premium_purchase', email, name })
        });
        return res.status(200).json({ ok: true, provider: 'webhook' });
      } catch {}
    }

    // If no provider configured, return success=false but do not hard-fail the UX
    return res.status(200).json({ ok: false, error: 'No email provider configured' });
  } catch (e) {
    return res.status(500).json({ ok: false, error: 'Server error' });
  }
}
