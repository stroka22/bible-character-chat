import { Resend } from 'resend';
import { createClient } from '@supabase/supabase-js';

function getEnv(name) {
  return process.env[name] || process.env[name.toUpperCase()] || '';
}

const RESEND_API_KEY = getEnv('RESEND_API_KEY');
const DEFAULT_FROM = getEnv('EMAIL_FROM') || 'FaithTalkAI Support <support@faithtalkai.com>';
const DEFAULT_REPLY_TO = getEnv('EMAIL_REPLY_TO') || 'support@faithtalkai.com';
const SUPPORT_TO = getEnv('EMAIL_TO_SUPPORT') || 'support@faithtalkai.com';
const VISITOR_FROM = getEnv('EMAIL_FROM_VISITOR') || DEFAULT_FROM;
const SUPABASE_URL = getEnv('VITE_SUPABASE_URL') || getEnv('SUPABASE_URL') || getEnv('NEXT_PUBLIC_SUPABASE_URL');
const SERVICE_ROLE_KEY = getEnv('SUPABASE_SERVICE_ROLE_KEY') || getEnv('SUPABASE_SERVICE_ROLE') || getEnv('SUPABASE_SERVICE_KEY') || getEnv('SUPABASE_SERVICE') || getEnv('SUPABASE_SECRET');

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

export async function sendLeadConfirmationVisitor(lead) {
  if (!lead || !lead.email) return;
  const roleRaw = (lead.role || '').toString().toLowerCase();
  const isPastor = roleRaw.includes('pastor');
  const templateKey = isPastor ? 'lead_visitor_pastor' : 'lead_visitor_user';
  const subject = (await getTemplateSubject(templateKey)) || 'Thanks for reaching out to FaithTalkAI';
  const baseUrl = getEnv('PUBLIC_BASE_URL') || getEnv('SITE_URL') || 'https://faithtalkai.com';
  const overrideHtml = await renderFromTemplate(templateKey, lead, baseUrl);
  const html = overrideHtml || renderLeadConfirmationHtml(lead, baseUrl);
  await sendEmail({ to: lead.email, subject, html, from: VISITOR_FROM, replyTo: DEFAULT_REPLY_TO });
}

function renderLeadConfirmationHtml(lead, baseUrl) {
  const safe = (v) => (v ? escapeHtml(String(v)) : '—');
  const roleRaw = (lead.role || '').toString().toLowerCase();
  const isPastor = roleRaw.includes('pastor');
  const showRoleLine = roleRaw && roleRaw !== 'user';
  const name = safe(lead.name);
  const role = safe(lead.role || '—');
  const org = safe(lead.organization || lead.org || '—');
  const phone = safe(lead.phone || '—');
  const intro = isPastor
    ? `We received your inquiry. We often help pastors and church leaders launch FaithTalkAI for their congregation or small groups. Here’s a quick summary of what you sent us:`
    : `We received your inquiry and will get back to you shortly. Here’s a quick summary of what you sent us:`;
  const nextSteps = isPastor
    ? `
      <ol style="margin:0 0 12px 18px;padding:0;color:#1f2a44;font-size:14px;line-height:1.6;">
        <li>We’ll reach out to schedule a quick demo tailored for church use.</li>
        <li>We’ll recommend the best setup (leaders, groups, studies) for your ministry.</li>
        <li>We’ll help you get started with onboarding resources for your team.</li>
      </ol>`
    : `
      <ol style="margin:0 0 12px 18px;padding:0;color:#1f2a44;font-size:14px;line-height:1.6;">
        <li>We’ll reply within 1 business day with answers and a brief walkthrough option.</li>
        <li>Explore FaithTalkAI features and start a conversation with a Bible character.</li>
        <li>If you’re interested, we’ll outline simple next steps to get set up.</li>
      </ol>`;
  return `
  <!DOCTYPE html>
  <html lang="en">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1" />
    <title>FaithTalkAI</title>
  </head>
  <body style="margin:0;padding:0;background:#f6f7fb;font-family:Arial,Helvetica,sans-serif;color:#0b2254;">
    <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="background:#f6f7fb;">
      <tr><td align="center" style="padding:24px 12px;">
        <table role="presentation" width="600" cellspacing="0" cellpadding="0" style="max-width:600px;background:#ffffff;border-radius:10px;overflow:hidden;border:1px solid #e6e8f0;">
          <tr>
            <td style="background:#0b2254;padding:18px 24px;color:#fff;">
              <div style="font-size:22px;font-weight:800;letter-spacing:0.2px;">Faith<span style="font-weight:900;">Talk</span><span style="color:#facc15;">AI</span></div>
              <div style="font-size:12px;opacity:.9">Bible Character Chat</div>
            </td>
          </tr>
          <tr>
            <td style="padding:24px 24px 8px;">
              <h1 style="margin:0 0 8px;font-size:20px;color:#0b2254;">Thank you for reaching out${lead.name ? `, ${escapeHtml(lead.name)}` : ''}!</h1>
              <p style="margin:0;color:#1f2a44;font-size:14px;line-height:1.6;">${intro}</p>
            </td>
          </tr>
          <tr>
            <td style="padding:8px 24px 16px;">
              <table width="100%" cellspacing="0" cellpadding="0" style="background:#f8fafc;border:1px solid #e6e8f0;border-radius:8px;">
                <tr><td style="padding:12px 16px;font-size:13px;color:#0b2254;">
                  <div><b>Name:</b> ${name}</div>
                  <div><b>Email:</b> ${escapeHtml(lead.email)}</div>
                  ${showRoleLine ? `<div><b>Role:</b> ${role}</div>` : ''}
                  <div><b>Organization:</b> ${org}</div>
                  ${lead.message ? `<div><b>Message:</b> ${escapeHtml(lead.message)}</div>` : ''}
                  ${lead.phone ? `<div><b>Phone:</b> ${phone}</div>` : ''}
                </td></tr>
              </table>
            </td>
          </tr>
          <tr>
            <td style="padding:0 24px 8px;">
              <h3 style="margin:0 0 8px;font-size:16px;">What happens next</h3>
              ${nextSteps}
            </td>
          </tr>
          <tr>
            <td style="padding:8px 24px 20px;">
              <div style="font-size:14px;color:#1f2a44;margin-bottom:10px;">Explore key features while you wait:</div>
              <table role="presentation" cellspacing="0" cellpadding="0" style="width:100%">
                <tr>
                  <td style="padding:6px 0;"><a href="${baseUrl}/chat" style="color:#0b2254;font-weight:bold;text-decoration:none;">• Chat with Bible Characters</a></td>
                </tr>
                <tr>
                  <td style="padding:6px 0;"><a href="${baseUrl}/roundtable" style="color:#0b2254;font-weight:bold;text-decoration:none;">• Roundtable discussions</a></td>
                </tr>
                <tr>
                  <td style="padding:6px 0;"><a href="${baseUrl}/studies" style="color:#0b2254;font-weight:bold;text-decoration:none;">• Biblically guided studies</a></td>
                </tr>
              </table>
            </td>
          </tr>
          <tr>
            <td style="background:#0b2254;color:#fff;padding:16px 24px;text-align:center;font-size:12px;">
              <a href="${baseUrl}" style="color:#facc15;text-decoration:none;font-weight:700;">FaithTalkAI.com</a>
            </td>
          </tr>
        </table>
      </td></tr>
    </table>
  </body>
  </html>`;
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

// ----------------------- Template helpers --------------------------
async function getAdminClient() {
  if (!SUPABASE_URL || !SERVICE_ROLE_KEY) return null;
  try { return createClient(SUPABASE_URL, SERVICE_ROLE_KEY); } catch { return null; }
}

async function getTemplate(key) {
  const supa = await getAdminClient();
  if (!supa) return null;
  try {
    const { data } = await supa.from('email_templates').select('key, subject, html').eq('key', key).maybeSingle();
    return data || null;
  } catch (e) {
    return null;
  }
}

async function getTemplateSubject(key) {
  const t = await getTemplate(key);
  return t?.subject || '';
}

function replaceVars(html, vars) {
  return html.replace(/\{\{\s*([a-zA-Z0-9_\.]+)\s*\}\}/g, (_, k) => {
    const v = vars[k];
    return v == null ? '' : String(v);
  });
}

async function renderFromTemplate(key, lead, baseUrl) {
  const t = await getTemplate(key);
  if (!t?.html) return '';
  const vars = {
    name: lead?.name || '',
    email: lead?.email || '',
    phone: lead?.phone || '',
    role: lead?.role || '',
    organization: lead?.organization || lead?.org || '',
    base_url: baseUrl,
    chat_url: `${baseUrl}/chat`,
    roundtable_url: `${baseUrl}/roundtable`,
    studies_url: `${baseUrl}/studies`,
  };
  return replaceVars(t.html, vars);
}
