import { createClient } from '@supabase/supabase-js';
import Stripe from 'stripe';
import { sendEmail } from './_utils/email.mjs';

function json(res, status, body) {
  res.status(status);
  res.setHeader('Content-Type', 'application/json');
  res.end(JSON.stringify(body));
}

function getEnv(name) {
  return process.env[name] || process.env[name.toUpperCase()] || '';
}

const SUPABASE_URL = getEnv('VITE_SUPABASE_URL') || getEnv('SUPABASE_URL') || getEnv('NEXT_PUBLIC_SUPABASE_URL');
const SERVICE_ROLE_KEY = getEnv('SUPABASE_SERVICE_ROLE_KEY') || getEnv('SUPABASE_SERVICE_ROLE') || getEnv('SUPABASE_SERVICE_KEY') || getEnv('SUPABASE_SERVICE') || getEnv('SUPABASE_SECRET');
const STRIPE_SECRET_KEY = getEnv('STRIPE_SECRET_KEY') || getEnv('STRIPE_API_KEY');

const ADMIN_ROLES = new Set(['admin', 'superadmin']);

// Helper: CSV escaping
function csvEscape(value) {
  if (value === null || value === undefined) return '';
  const s = String(value);
  if (/[",\n\r]/.test(s)) {
    return '"' + s.replace(/"/g, '""') + '"';
  }
  return s;
}

function toISOSeconds(ts) {
  if (!ts) return '';
  try { return new Date(ts).toISOString(); } catch { return ''; }
}

async function fetchStripeSubsByCustomer(stripe, customerId) {
  if (!customerId) return [];
  const subs = await stripe.subscriptions.list({ customer: customerId, status: 'all', expand: ['data.default_payment_method'] });
  return subs?.data || [];
}

async function fetchStripeSubsByEmail(stripe, email) {
  if (!email) return [];
  const customers = await stripe.customers.list({ email, limit: 10 });
  const all = [];
  for (const c of customers.data) {
    const subs = await stripe.subscriptions.list({ customer: c.id, status: 'all' });
    for (const s of subs.data) all.push(s);
  }
  return all;
}

function classifySubscription(s) {
  const periodEndMs = (s?.current_period_end || 0) * 1000;
  const isActive = ['active','trialing'].includes(s?.status) || (!!s?.cancel_at_period_end && periodEndMs > Date.now());
  return { isActive, status: s?.status, cancelAtPeriodEnd: !!s?.cancel_at_period_end, currentPeriodEnd: s?.current_period_end };
}

async function computeMemberStatus(stripe, member) {
  // Prefer local subscriptions table first if present later; for now, Stripe direct
  let subs = [];
  if (member.stripe_customer_id) {
    subs = await fetchStripeSubsByCustomer(stripe, member.stripe_customer_id);
  }
  if (!subs || subs.length === 0) {
    subs = await fetchStripeSubsByEmail(stripe, member.email);
  }
  if (!subs || subs.length === 0) {
    return { premium: member.premium_override ? 'Override' : 'Free', isStripe: false, isOverride: !!member.premium_override, sub: null };
  }
  // Prefer active/trialing
  const s = subs.find(x => ['active','trialing'].includes(x.status)) || subs[0];
  const c = classifySubscription(s);
  if (c.isActive) return { premium: 'Stripe', isStripe: true, isOverride: false, sub: s };
  if (member.premium_override) return { premium: 'Override', isStripe: false, isOverride: true, sub: s };
  return { premium: 'Free', isStripe: false, isOverride: false, sub: s };
}

async function buildCsvForRecipient(admin, owners, supa, stripe) {
  // Determine which orgs to include
  let orgs = [];
  if (admin.role === 'superadmin') {
    orgs = owners.map(o => ({ owner_slug: o.owner_slug, display_name: o.display_name }));
  } else {
    if (admin.owner_slug) {
      const o = owners.find(x => x.owner_slug === admin.owner_slug);
      if (o) orgs.push(o); else orgs.push({ owner_slug: admin.owner_slug, display_name: admin.owner_slug });
    } else {
      orgs = [];
    }
  }

  const header = [
    'organization_slug',
    'organization_name',
    'user_id',
    'email',
    'display_name',
    'first_name',
    'last_name',
    'role',
    'premium_status',
    'stripe_status',
    'cancel_at_period_end',
    'current_period_end',
    'stripe_customer_id',
    'created_at'
  ];
  const rows = [header.join(',')];

  const summary = [];

  for (const org of orgs) {
    const { data: members, error } = await supa
      .from('profiles')
      .select('id,email,display_name,role,owner_slug,stripe_customer_id,premium_override,created_at')
      .eq('owner_slug', org.owner_slug);
    if (error) continue;

    let total = members?.length || 0;
    let premium = 0; let overrides = 0; let free = 0;

    for (const m of (members || [])) {
      const status = await computeMemberStatus(stripe, m);
      if (status.premium === 'Stripe') premium++; else if (status.premium === 'Override') overrides++; else free++;
      const s = status.sub;
      // Derive first/last from display_name if present; fallback to email local-part
      const displayName = m.display_name || '';
      let firstName = '';
      let lastName = '';
      if (displayName) {
        const parts = String(displayName).trim().split(/\s+/);
        firstName = parts[0] || '';
        lastName = parts.length > 1 ? parts.slice(1).join(' ') : '';
      } else if (m.email) {
        const local = String(m.email).split('@')[0].replace(/[._-]+/g, ' ').trim();
        const parts = local.split(/\s+/);
        firstName = parts[0] || '';
        lastName = parts.length > 1 ? parts.slice(1).join(' ') : '';
      }

      rows.push([
        csvEscape(org.owner_slug),
        csvEscape(org.display_name || ''),
        csvEscape(m.id),
        csvEscape(m.email || ''),
        csvEscape(displayName),
        csvEscape(firstName),
        csvEscape(lastName),
        csvEscape(m.role || ''),
        csvEscape(status.premium),
        csvEscape(s?.status || ''),
        csvEscape(s?.cancel_at_period_end ? 'true' : 'false'),
        csvEscape(s?.current_period_end ? new Date(s.current_period_end * 1000).toISOString() : ''),
        csvEscape(m.stripe_customer_id || ''),
        csvEscape(toISOSeconds(m.created_at)),
      ].join(','));
    }

    summary.push({ owner_slug: org.owner_slug, display_name: org.display_name, total, premium, overrides, free });
  }

  const summaryCsv = ['organization_slug,organization_name,total,premium,overrides,free'].concat(
    summary.map(s => [csvEscape(s.owner_slug), csvEscape(s.display_name||''), s.total, s.premium, s.overrides, s.free].join(','))
  ).join('\n');

  const detailCsv = rows.join('\n');
  return { summaryCsv, detailCsv, orgCount: orgs.length, memberCount: rows.length - 1 };
}

export default async function handler(req, res) {
  if (!SUPABASE_URL || !SERVICE_ROLE_KEY || !STRIPE_SECRET_KEY) {
    return json(res, 500, { error: 'Missing server env: SUPABASE_URL / SERVICE_ROLE / STRIPE_SECRET_KEY' });
  }

  const supa = createClient(SUPABASE_URL, SERVICE_ROLE_KEY);
  const stripe = new Stripe(STRIPE_SECRET_KEY, { apiVersion: '2024-12-18.acacia' });

  try {
    // Parse query/body
    const url = new URL(req.url, `http://${req.headers.host || 'localhost'}`);
    const forceTo = url.searchParams.get('force_to') || url.searchParams.get('to') || req.query?.force_to || req.body?.force_to || null;

    // Owners list
    const { data: owners, error: ownersErr } = await supa
      .from('owners')
      .select('owner_slug, display_name');
    const ownersList = ownersErr ? [] : (owners || []);

    // Target recipients
    let admins = [];
    let adminsErr = null;
    if (!forceTo) {
      const q = await supa
        .from('profiles')
        .select('id,email,role,owner_slug,weekly_csv_enabled')
        .in('role', ['admin','superadmin'])
        .eq('weekly_csv_enabled', true)
        .not('email', 'is', null);
      admins = q.data;
      adminsErr = q.error;
    }

    if (!forceTo && adminsErr) {
      return json(res, 500, { error: adminsErr.message });
    }

    const targets = (admins || []).filter(a => ADMIN_ROLES.has(a.role) && a.email);

    // Optional manual test: only ?email=... (must still be admin)
    const onlyEmail = req.query?.email || req.body?.email || null;
    let recipients = onlyEmail ? targets.filter(t => t.email === onlyEmail) : targets;

    // Force mode: send to arbitrary address as superadmin (includes all orgs)
    if (forceTo) {
      recipients = [{ email: forceTo, role: 'superadmin', owner_slug: null, weekly_csv_enabled: true }];
    }

    const results = [];
    for (const admin of recipients) {
      const { summaryCsv, detailCsv, orgCount, memberCount } = await buildCsvForRecipient(admin, ownersList, supa, stripe);
      const dateStr = new Date().toISOString().slice(0,10);
      const attachments = [
        { filename: `org-summary-${dateStr}.csv`, content: Buffer.from(summaryCsv).toString('base64') },
        { filename: `members-${dateStr}.csv`, content: Buffer.from(detailCsv).toString('base64') },
      ];
      const html = `
        <div>
          <p>Hello ${admin.role === 'superadmin' ? 'Superadmin' : 'Admin'},</p>
          <p>Your weekly CSV reports are attached.</p>
          <ul>
            <li>Organizations: ${orgCount}</li>
            <li>Members listed: ${memberCount}</li>
          </ul>
          <p>Schedule: Mondays 9:00 AM EST.</p>
        </div>
      `;
      const resp = await sendEmail({ to: admin.email, subject: `Weekly Org Report – ${dateStr}`, html, attachments });
      results.push({ email: admin.email, ok: resp.ok, error: resp.error });
    }
    return json(res, 200, { sent: results.length, results });
  } catch (e) {
    return json(res, 500, { error: e?.message || 'Unexpected error' });
  }
}
