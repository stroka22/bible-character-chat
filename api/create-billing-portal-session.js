// Vercel Edge/Node-compatible API route for creating a Stripe Billing Portal session via Supabase Edge Function
export const config = { runtime: 'edge' };

export default async function handler(req) {
  const corsHeaders = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type, Authorization',
    'Content-Type': 'application/json'
  };

  if (req.method === 'OPTIONS') {
    return new Response(null, { status: 204, headers: corsHeaders });
  }
  // Accept both POST (preferred) and GET (fallback for quick testing)

  try {
    let userId, returnUrl;
    if (req.method === 'POST') {
      try {
        const body = await req.json();
        userId = body?.userId;
        returnUrl = body?.returnUrl;
      } catch {
        // Fall back to URL params if body parse fails
        const url = new URL(req.url);
        userId = url.searchParams.get('userId');
        returnUrl = url.searchParams.get('returnUrl');
      }
    } else if (req.method === 'GET') {
      const url = new URL(req.url);
      userId = url.searchParams.get('userId');
      returnUrl = url.searchParams.get('returnUrl');
    } else {
      return new Response(JSON.stringify({ error: 'Method Not Allowed' }), { status: 405, headers: corsHeaders });
    }
    if (!userId) {
      return new Response(JSON.stringify({ error: 'Missing userId' }), { status: 400, headers: corsHeaders });
    }

    const SUPABASE_URL = process.env.VITE_SUPABASE_URL || process.env.SUPABASE_URL;
    const SUPABASE_ANON_KEY = process.env.VITE_SUPABASE_ANON_KEY || process.env.SUPABASE_ANON_KEY;
    if (!SUPABASE_URL || !SUPABASE_ANON_KEY) {
      const missing = [];
      if (!SUPABASE_URL) missing.push('SUPABASE_URL');
      if (!SUPABASE_ANON_KEY) missing.push('SUPABASE_ANON_KEY');
      return new Response(
        JSON.stringify({ error: 'Missing Supabase env configuration', missing }),
        { status: 500, headers: corsHeaders }
      );
    }

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
    let json;
    try { json = JSON.parse(text); } catch { json = { error: 'Invalid JSON from edge', raw: text }; }

    if (!upstream.ok) {
      // Bubble up rich error details for easier debugging
      const enriched = {
        error: json?.error || 'Upstream error',
        upstreamStatus: upstream.status,
        upstreamBody: json?.raw ? undefined : json,
        upstreamRaw: json?.raw || text,
      };
      return new Response(JSON.stringify(enriched), { status: upstream.status, headers: corsHeaders });
    }

    return new Response(JSON.stringify(json), { status: upstream.status, headers: corsHeaders });
  } catch (err) {
    return new Response(JSON.stringify({ error: 'Server error' }), { status: 500, headers: corsHeaders });
  }
}
