import { Resend } from 'resend';

function getEnv(name) {
  return process.env[name] || process.env[name.toUpperCase()] || '';
}

const RESEND_API_KEY = getEnv('RESEND_API_KEY');
const DEFAULT_FROM = getEnv('EMAIL_FROM') || 'FaithTalk AI Support <support@faithtalkai.com>';
const DEFAULT_REPLY_TO = getEnv('EMAIL_REPLY_TO') || 'support@faithtalkai.com';
const SUPPORT_TO = getEnv('EMAIL_TO_SUPPORT') || 'support@faithtalkai.com';

let resend = null;
if (RESEND_API_KEY) {
  try {
    resend = new Resend(RESEND_API_KEY);
  } catch {
    resend = null;
  }
}

export async function sendEmail({ to, subject, html, from = DEFAULT_FROM, replyTo = DEFAULT_REPLY_TO, attachments = [] }) {
  if (!resend) return { ok: false, error: 'Email disabled: missing RESEND_API_KEY' };
  if (!to || !subject || !html) return { ok: false, error: 'Missing to/subject/html' };

  try {
    const result = await resend.emails.send({
      from,
      to: Array.isArray(to) ? to : [to],
      subject,
      html,
      reply_to: replyTo,
      attachments: Array.isArray(attachments) && attachments.length ? attachments : undefined,
    });
    const id = result?.data?.id || result?.id || null;
    return { ok: !!id, id, result: sanitizeResult(result) };
  } catch (e) {
    const code = e?.status || e?.code || undefined;
    const message = e?.message || 'Send failed';
    return { ok: false, error: message, code };
  }
}

function sanitizeResult(result) {
  try {
    return typeof result === 'object' ? JSON.parse(JSON.stringify(result)) : result;
  } catch {
    return null;
  }
}

export async function sendSupportLeadNotification(lead) {
  if (!lead || !lead.email) return;
  const subject = `New lead: ${lead.email}`;
  const html = `
    <h2>New Lead Captured</h2>
    <ul>
      <li><b>Email:</b> ${escapeHtml(lead.email)}</li>
      ${lead.name ? `<li><b>Name:</b> ${escapeHtml(lead.name)}</li>` : ''}
      ${lead.phone ? `<li><b>Phone:</b> ${escapeHtml(lead.phone)}</li>` : ''}
      ${lead.role ? `<li><b>Role:</b> ${escapeHtml(lead.role)}</li>` : ''}
      ${lead.source_path ? `<li><b>Source:</b> ${escapeHtml(lead.source_path)}</li>` : ''}
      ${lead.utm_source ? `<li><b>UTM Source:</b> ${escapeHtml(lead.utm_source)}</li>` : ''}
      ${lead.utm_medium ? `<li><b>UTM Medium:</b> ${escapeHtml(lead.utm_medium)}</li>` : ''}
      ${lead.utm_campaign ? `<li><b>UTM Campaign:</b> ${escapeHtml(lead.utm_campaign)}</li>` : ''}
      <li><b>Consent Email:</b> ${lead.consent_email ? 'yes' : 'no'}</li>
      <li><b>Consent SMS:</b> ${lead.consent_sms ? 'yes' : 'no'}</li>
    </ul>
  `;
  await sendEmail({ to: SUPPORT_TO, subject, html });
}

function escapeHtml(s) {
  return String(s)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');
}

export default { sendEmail, sendSupportLeadNotification };
