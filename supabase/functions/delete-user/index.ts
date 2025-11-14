import { serve } from 'https://deno.land/std@0.168.0/http/server.ts';
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.39.8';

const supabaseUrl = Deno.env.get('SUPABASE_URL') as string;
const serviceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') as string;

serve(async (req: Request) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, {
      status: 204,
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': 'POST, OPTIONS',
        // Allow Supabase JS client headers used by functions.invoke
        'Access-Control-Allow-Headers': 'Content-Type, Authorization, apikey, X-Client-Info, x-client-info',
      },
    });
  }

  try {
    if (req.method !== 'POST') {
      return new Response(JSON.stringify({ error: 'Method not allowed' }), { status: 405, headers: { 'Access-Control-Allow-Origin': '*' } });
    }

    const authHeader = req.headers.get('Authorization') || '';
    const accessToken = authHeader.startsWith('Bearer ') ? authHeader.slice(7) : null;
    if (!accessToken) {
      return new Response(JSON.stringify({ error: 'Unauthorized' }), { status: 401, headers: { 'Access-Control-Allow-Origin': '*' } });
    }

    const client = createClient(supabaseUrl, serviceKey, {
      global: { headers: { Authorization: `Bearer ${accessToken}` } },
    });
    const admin = createClient(supabaseUrl, serviceKey);

    const { userId } = await req.json();
    if (!userId) return new Response(JSON.stringify({ error: 'Missing userId' }), { status: 400, headers: { 'Access-Control-Allow-Origin': '*' } });

    // Get requester
    const { data: meData, error: meErr } = await client.auth.getUser();
    if (meErr || !meData?.user) {
      return new Response(JSON.stringify({ error: 'Unauthorized' }), { status: 401, headers: { 'Access-Control-Allow-Origin': '*' } });
    }
    const requesterId = meData.user.id;

    // Load requester role and org
    const { data: meProfile } = await admin
      .from('profiles')
      .select('id, role, owner_slug')
      .eq('id', requesterId)
      .maybeSingle();
    if (!meProfile) return new Response(JSON.stringify({ error: 'Forbidden' }), { status: 403, headers: { 'Access-Control-Allow-Origin': '*' } });

    // Load target profile
    const { data: target } = await admin
      .from('profiles')
      .select('id, role, owner_slug')
      .eq('id', userId)
      .maybeSingle();
    if (!target) return new Response(JSON.stringify({ error: 'User not found' }), { status: 404, headers: { 'Access-Control-Allow-Origin': '*' } });

    // Authorization rules:
    // - superadmin can delete anyone except another superadmin
    // - admin can delete users in same owner_slug, but not admins/superadmins
    const isSuperadmin = meProfile.role === 'superadmin';
    const isAdmin = meProfile.role === 'admin';
    if (isSuperadmin) {
      if (target.role === 'superadmin') {
        return new Response(JSON.stringify({ error: 'Cannot delete superadmin' }), { status: 403, headers: { 'Access-Control-Allow-Origin': '*' } });
      }
    } else if (isAdmin) {
      if (target.owner_slug !== meProfile.owner_slug || target.role !== 'user') {
        return new Response(JSON.stringify({ error: 'Forbidden' }), { status: 403, headers: { 'Access-Control-Allow-Origin': '*' } });
      }
    } else {
      return new Response(JSON.stringify({ error: 'Forbidden' }), { status: 403, headers: { 'Access-Control-Allow-Origin': '*' } });
    }

    // Delete dependent data if needed (conversations, etc.) – optional
    // For now, remove profile and auth user
    await admin.from('profiles').delete().eq('id', userId);
    await admin.auth.admin.deleteUser(userId);

    return new Response(JSON.stringify({ ok: true }), { status: 200, headers: { 'Access-Control-Allow-Origin': '*' } });
  } catch (e) {
    console.error('delete-user error', e);
    return new Response(JSON.stringify({ error: 'Server error' }), { status: 500, headers: { 'Access-Control-Allow-Origin': '*' } });
  }
});
