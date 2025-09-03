function json(res, status, body) {
  res.status(status);
  res.setHeader('Content-Type', 'application/json');
  // Allow same-origin and simple cross-origin tests
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, HEAD, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  res.end(JSON.stringify(body));
}

export default async function handler(req, res) {
  if (req.method === 'OPTIONS') {
    return json(res, 200, { ok: true });
  }
  
  if (req.method !== 'GET' && req.method !== 'HEAD') {
    return json(res, 405, { error: 'Method not allowed' });
  }

  // Check URL environment variables
  const has_VITE_SUPABASE_URL = !!process.env.VITE_SUPABASE_URL;
  const has_SUPABASE_URL = !!process.env.SUPABASE_URL;
  const has_NEXT_PUBLIC_SUPABASE_URL = !!process.env.NEXT_PUBLIC_SUPABASE_URL;

  // Check service role environment variables
  const has_SUPABASE_SERVICE_ROLE_KEY = !!process.env.SUPABASE_SERVICE_ROLE_KEY;
  const has_SUPABASE_SERVICE_ROLE = !!process.env.SUPABASE_SERVICE_ROLE;
  const has_SUPABASE_SERVICE_KEY = !!process.env.SUPABASE_SERVICE_KEY;
  const has_SUPABASE_SERVICE = !!process.env.SUPABASE_SERVICE;
  const has_SUPABASE_SECRET = !!process.env.SUPABASE_SECRET;

  // Get Node.js version
  const node_version = process.version;

  return json(res, 200, {
    // URL variables
    has_VITE_SUPABASE_URL,
    has_SUPABASE_URL,
    has_NEXT_PUBLIC_SUPABASE_URL,
    
    // Service role variables
    has_SUPABASE_SERVICE_ROLE_KEY,
    has_SUPABASE_SERVICE_ROLE,
    has_SUPABASE_SERVICE_KEY,
    has_SUPABASE_SERVICE,
    has_SUPABASE_SECRET,
    
    // Node version
    node_version
  });
}
