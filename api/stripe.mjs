import Stripe from 'stripe';

function json(res, status, body) {
  res.status(status);
  res.setHeader('Content-Type', 'application/json');
  res.end(JSON.stringify(body));
}

export default async function handler(req, res) {
  const url = new URL(req.url, `http://${req.headers.host || 'localhost'}`);
  const path = (url.searchParams.get('path') || '').trim();

  if (req.method === 'OPTIONS') return res.status(204).end();

  try {
    switch (path) {
      case 'create-checkout-session':
        return await createCheckoutSession(req, res);
      case 'create-billing-portal-session':
        return await createBillingPortalSession(req, res);
      case 'price-ids':
        return await priceIds(req, res);
      case 'subscriptions':
        return await subscriptions(req, res);
      case 'subscriptions-by-email':
        return await subscriptionsByEmail(req, res);
      case 'premium-confirmation':
        return await premiumConfirmation(req, res);
      default:
        res.setHeader('Allow', 'GET,POST,OPTIONS');
        return json(res, 404, { error: 'Not Found', path });
    }
  } catch (e) {
    return json(res, 500, { error: e?.message || 'Server error' });
  }
}

async function createCheckoutSession(req, res) {
  if (req.method !== 'POST') { res.setHeader('Allow', 'POST'); return json(res, 405, { error: 'Method Not Allowed' }); }
  const { STRIPE_SECRET_KEY } = process.env;
  if (!STRIPE_SECRET_KEY) return json(res, 500, { error: 'Server mis-configuration: Stripe secret key missing' });
  const { priceId, successUrl, cancelUrl, customerId, customerEmail, metadata } = (typeof req.body === 'string' ? JSON.parse(req.body || '{}') : (req.body || {}));
  if (!priceId || !successUrl || !cancelUrl) return json(res, 400, { error: 'Missing required parameters: priceId, successUrl, cancelUrl' });
  const isLiveMode = STRIPE_SECRET_KEY.startsWith('sk_live_');
  const isTestPrice = String(priceId).startsWith('price_test_');
  if (isLiveMode && isTestPrice) return json(res, 400, { error: 'Environment Mismatch: test price in live mode' });
  const stripe = new Stripe(STRIPE_SECRET_KEY, { apiVersion: '2023-10-16' });
  const session = await stripe.checkout.sessions.create({
    payment_method_types: ['card'],
    mode: 'subscription',
    line_items: [{ price: priceId, quantity: 1 }],
    customer: customerId,
    customer_email: customerEmail,
    success_url: successUrl,
    cancel_url: cancelUrl,
    metadata,
    allow_promotion_codes: true,
  });
  if (!session?.url) return json(res, 500, { error: 'Failed to create checkout session URL' });
  return json(res, 200, { id: session.id, url: session.url });
}

async function createBillingPortalSession(req, res) {
  // Accept GET or POST
  if (!['GET', 'POST'].includes(req.method)) { res.setHeader('Allow', 'GET,POST'); return json(res, 405, { error: 'Method Not Allowed' }); }
  const SUPABASE_URL = process.env.VITE_SUPABASE_URL || process.env.SUPABASE_URL;
  const SUPABASE_ANON_KEY = process.env.VITE_SUPABASE_ANON_KEY || process.env.SUPABASE_ANON_KEY;
  if (!SUPABASE_URL || !SUPABASE_ANON_KEY) {
    const missing = [];
    if (!SUPABASE_URL) missing.push('SUPABASE_URL');
    if (!SUPABASE_ANON_KEY) missing.push('SUPABASE_ANON_KEY');
    return json(res, 500, { error: 'Missing Supabase env configuration', missing });
  }
  let userId, returnUrl;
  if (req.method === 'POST') {
    const body = typeof req.body === 'string' ? JSON.parse(req.body || '{}') : (req.body || {});
    userId = body.userId; returnUrl = body.returnUrl;
  } else {
    const url = new URL(req.url, `http://${req.headers.host || 'localhost'}`);
    userId = url.searchParams.get('userId');
    returnUrl = url.searchParams.get('returnUrl');
  }
  if (!userId) return json(res, 400, { error: 'Missing userId' });

  const fnUrl = `${SUPABASE_URL}/functions/v1/create-billing-portal-session`;
  const upstream = await fetch(fnUrl, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      apikey: SUPABASE_ANON_KEY,
      Authorization: `Bearer ${SUPABASE_ANON_KEY}`,
      Accept: 'application/json'
    },
    body: JSON.stringify({ userId, returnUrl })
  });
  const text = await upstream.text();
  let jsonBody; try { jsonBody = JSON.parse(text); } catch { jsonBody = { error: 'Invalid JSON', raw: text }; }
  if (!upstream.ok) return json(res, upstream.status, { error: jsonBody?.error || 'Upstream error', raw: jsonBody });
  return json(res, upstream.status, jsonBody);
}

async function priceIds(_req, res) {
  const monthly = (process.env.VITE_STRIPE_PRICE_ADMIN_ORG_MONTHLY || '').trim();
  const yearly = (process.env.VITE_STRIPE_PRICE_ADMIN_ORG_YEARLY || '').trim();
  const mode = (process.env.STRIPE_SECRET_KEY || '').startsWith('sk_live_') ? 'live' : 'test';
  const presence = {
    VITE_STRIPE_PRICE_ADMIN_ORG_MONTHLY: Boolean(process.env.VITE_STRIPE_PRICE_ADMIN_ORG_MONTHLY),
    VITE_STRIPE_PRICE_ADMIN_ORG_YEARLY: Boolean(process.env.VITE_STRIPE_PRICE_ADMIN_ORG_YEARLY),
    STRIPE_SECRET_KEY: Boolean(process.env.STRIPE_SECRET_KEY),
  };
  return json(res, 200, { monthly: monthly || null, yearly: yearly || null, mode, presence });
}

async function subscriptions(req, res) {
  if (req.method !== 'POST') { res.setHeader('Allow', 'POST'); return json(res, 405, { error: 'Method Not Allowed' }); }
  const { STRIPE_SECRET_KEY } = process.env;
  if (!STRIPE_SECRET_KEY) return json(res, 500, { error: 'Missing STRIPE_SECRET_KEY' });
  const body = typeof req.body === 'string' ? JSON.parse(req.body || '{}') : (req.body || {});
  const customerId = body.customerId;
  if (!customerId || typeof customerId !== 'string') return json(res, 400, { error: 'Missing customerId' });
  const stripe = new Stripe(STRIPE_SECRET_KEY, { apiVersion: '2023-10-16' });
  const subs = await stripe.subscriptions.list({ customer: customerId, status: 'all', expand: ['data.items.data.price'] });
  return json(res, 200, { subscriptions: subs.data || [] });
}

async function subscriptionsByEmail(req, res) {
  if (req.method !== 'POST') { res.setHeader('Allow', 'POST'); return json(res, 405, { error: 'Method Not Allowed' }); }
  const { STRIPE_SECRET_KEY } = process.env;
  if (!STRIPE_SECRET_KEY) return json(res, 500, { error: 'Missing STRIPE_SECRET_KEY' });
  const body = typeof req.body === 'string' ? JSON.parse(req.body || '{}') : (req.body || {});
  const email = body.email;
  if (!email || typeof email !== 'string') return json(res, 400, { error: 'Missing email' });
  const stripe = new Stripe(STRIPE_SECRET_KEY, { apiVersion: '2023-10-16' });
  const customers = await stripe.customers.list({ email, limit: 10 });
  const subsAll = [];
  for (const c of customers.data || []) {
    const subs = await stripe.subscriptions.list({ customer: c.id, status: 'all', expand: ['data.items.data.price'] });
    subsAll.push(...subs.data);
  }
  return json(res, 200, { subscriptions: subsAll });
}

async function premiumConfirmation(req, res) {
  if (req.method !== 'POST') { res.setHeader('Allow', 'POST'); return json(res, 405, { ok: false, error: 'Method not allowed' }); }
  const body = typeof req.body === 'string' ? JSON.parse(req.body || '{}') : (req.body || {});
  const email = body.email; const name = body.name;
  if (!email || typeof email !== 'string') return json(res, 400, { ok: false, error: 'Missing email' });

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
      </div>`;

  // Try SendGrid
  if (process.env.SENDGRID_API_KEY && process.env.SENDGRID_FROM) {
    try {
      const resp = await fetch('https://api.sendgrid.com/v3/mail/send', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${process.env.SENDGRID_API_KEY}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ personalizations: [{ to: [{ email }] }], from: { email: process.env.SENDGRID_FROM }, subject, content: [{ type: 'text/html', value: html }] })
      });
      if (resp.ok) return json(res, 200, { ok: true, provider: 'sendgrid' });
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
        body: JSON.stringify({ from: process.env.RESEND_FROM, to: [email], subject, html })
      });
      if (resp.ok) return json(res, 200, { ok: true, provider: 'resend' });
    } catch {}
  }

  // Fallback: webhook
  if (process.env.LEADS_WEBHOOK_URL) {
    try {
      await fetch(process.env.LEADS_WEBHOOK_URL, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ type: 'premium_purchase', email, name }) });
      return json(res, 200, { ok: true, provider: 'webhook' });
    } catch {}
  }

  return json(res, 200, { ok: false, error: 'No email provider configured' });
}
