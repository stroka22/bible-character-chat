import { createClient } from '@supabase/supabase-js';
import { sendEmail } from './_utils/email.mjs';

function json(res, status, body) {
  res.status(status);
  res.setHeader('Content-Type', 'application/json');
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  res.end(JSON.stringify(body));
}

function getEnv(name) {
  return process.env[name] || process.env[name.toUpperCase()] || '';
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

  const SUPABASE_URL =
    process.env.VITE_SUPABASE_URL ||
    process.env.SUPABASE_URL ||
    process.env.NEXT_PUBLIC_SUPABASE_URL;

  const SERVICE_ROLE_KEY =
    process.env.SUPABASE_SERVICE_ROLE_KEY ||
    process.env.SUPABASE_SERVICE_ROLE ||
    process.env.SUPABASE_SERVICE_KEY ||
    process.env.SUPABASE_SERVICE ||
    process.env.SUPABASE_SECRET;

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

    const payload = bodyRaw;
    if (!payload || typeof payload !== 'object') {
      return json(res, 400, { error: 'Invalid payload' });
    }

    const name = payload.name && String(payload.name).trim();
    const email = payload.email && String(payload.email).trim();
    const subject = payload.subject && String(payload.subject).trim();
    const message = payload.message && String(payload.message).trim();

    if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      return json(res, 400, { error: 'Valid email is required' });
    }
    if (!subject) {
      return json(res, 400, { error: 'Subject is required' });
    }
    if (!message) {
      return json(res, 400, { error: 'Message is required' });
    }

    // Save to database
    const row = {
      name: name || null,
      email,
      subject,
      message,
      status: 'new',
    };

    const { data, error } = await admin
      .from('contact_submissions')
      .insert(row)
      .select()
      .maybeSingle();

    if (error) {
      console.error('Contact submission insert error:', error);
      return json(res, 500, { error: error.message });
    }

    // Send email notification to support
    const SUPPORT_EMAIL = getEnv('EMAIL_TO_SUPPORT') || 'support@faithtalkai.com';
    
    try {
      await sendEmail({
        to: SUPPORT_EMAIL,
        subject: `[Contact Form] ${subject}`,
        html: `
          <h2>New Contact Form Submission</h2>
          <table style="border-collapse: collapse; width: 100%; max-width: 600px;">
            <tr>
              <td style="padding: 8px; border: 1px solid #ddd; font-weight: bold; width: 120px;">Name:</td>
              <td style="padding: 8px; border: 1px solid #ddd;">${escapeHtml(name || 'Not provided')}</td>
            </tr>
            <tr>
              <td style="padding: 8px; border: 1px solid #ddd; font-weight: bold;">Email:</td>
              <td style="padding: 8px; border: 1px solid #ddd;"><a href="mailto:${escapeHtml(email)}">${escapeHtml(email)}</a></td>
            </tr>
            <tr>
              <td style="padding: 8px; border: 1px solid #ddd; font-weight: bold;">Subject:</td>
              <td style="padding: 8px; border: 1px solid #ddd;">${escapeHtml(subject)}</td>
            </tr>
            <tr>
              <td style="padding: 8px; border: 1px solid #ddd; font-weight: bold; vertical-align: top;">Message:</td>
              <td style="padding: 8px; border: 1px solid #ddd; white-space: pre-wrap;">${escapeHtml(message)}</td>
            </tr>
          </table>
          <p style="margin-top: 16px; color: #666; font-size: 12px;">
            Reply directly to this email to respond to ${escapeHtml(name || 'the sender')}.
          </p>
        `,
        replyTo: email,
      });
    } catch (emailErr) {
      console.error('Failed to send contact notification email:', emailErr);
      // Don't fail the request if email fails - submission is saved
    }

    // Send confirmation to the submitter
    try {
      await sendEmail({
        to: email,
        subject: 'We received your message - FaithTalkAI',
        html: `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
            <div style="background: #0b2254; padding: 20px; text-align: center;">
              <h1 style="color: #fff; margin: 0; font-size: 24px;">
                Faith<span style="font-weight: 900;">Talk</span><span style="color: #facc15;">AI</span>
              </h1>
            </div>
            <div style="padding: 24px; background: #fff;">
              <h2 style="color: #0b2254; margin-top: 0;">Thank you for contacting us${name ? `, ${escapeHtml(name)}` : ''}!</h2>
              <p style="color: #333; line-height: 1.6;">
                We've received your message and will get back to you as soon as possible, typically within 1-2 business days.
              </p>
              <div style="background: #f8f9fa; padding: 16px; border-radius: 8px; margin: 20px 0;">
                <p style="margin: 0 0 8px; color: #666; font-size: 14px;"><strong>Your message:</strong></p>
                <p style="margin: 0 0 8px; color: #333;"><strong>Subject:</strong> ${escapeHtml(subject)}</p>
                <p style="margin: 0; color: #333; white-space: pre-wrap;">${escapeHtml(message)}</p>
              </div>
              <p style="color: #333; line-height: 1.6;">
                In the meantime, feel free to explore FaithTalkAI:
              </p>
              <ul style="color: #333; line-height: 1.8;">
                <li><a href="https://faithtalkai.com/chat" style="color: #0b2254;">Chat with Bible Characters</a></li>
                <li><a href="https://faithtalkai.com/roundtable" style="color: #0b2254;">Join a Roundtable Discussion</a></li>
                <li><a href="https://faithtalkai.com/studies" style="color: #0b2254;">Explore Bible Studies</a></li>
              </ul>
            </div>
            <div style="background: #0b2254; padding: 16px; text-align: center;">
              <a href="https://faithtalkai.com" style="color: #facc15; text-decoration: none; font-weight: bold;">FaithTalkAI.com</a>
            </div>
          </div>
        `,
      });
    } catch (confirmErr) {
      console.error('Failed to send contact confirmation email:', confirmErr);
    }

    return json(res, 200, { ok: true, submission: data });
  } catch (err) {
    console.error('Contact handler error:', err);
    return json(res, 500, { error: err?.message || 'Unexpected error' });
  }
}

function escapeHtml(s) {
  return String(s || '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');
}
