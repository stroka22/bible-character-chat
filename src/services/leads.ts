import { supabase } from './supabase';

export type Lead = {
  id?: string;
  name?: string | null;
  email: string;
  phone?: string | null;
  role?: 'user' | 'pastor' | 'leader' | 'other' | null;
  consent_email?: boolean | null;
  consent_sms?: boolean | null;
  source_path?: string | null;
  utm_source?: string | null;
  utm_medium?: string | null;
  utm_campaign?: string | null;
  created_at?: string;
};

const table = 'leads';

export async function createLead(payload: Lead): Promise<Lead> {
  // 1) Try serverless endpoint first (works in production, bypasses RLS)
  try {
    const resp = await fetch('/api/leads', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    }).catch(() => null); // network / CORS error

    if (resp && resp.ok) {
      const json = await resp.json().catch(() => ({}));
      if (json?.lead) return json.lead as Lead;
      // If schema changes, fall back to Supabase
    } else if (resp && (resp.status === 404 || resp.status === 405)) {
      // Endpoint not available (e.g., local dev) → fall through
    } else if (resp) {
      // Endpoint returned an error – extract message and throw
      const { error } = await resp.json().catch(() => ({ error: 'Unknown error' }));
      throw new Error(error || `Lead API error ${resp.status}`);
    }
  } catch (err) {
    // Network or other unexpected error – proceed to Supabase fallback
    console.warn('[leads] /api/leads failed, falling back to direct insert:', err);
  }

  // 2) Fallback: direct Supabase insert (requires correct RLS/keys)
  const { data, error } = await supabase
    .from(table)
    .insert(payload)
    .select()
    .maybeSingle();
  if (error) throw error;
  return data as Lead;
}

export async function listLeads(): Promise<Lead[]> {
  const { data, error } = await supabase
    .from(table)
    .select('*')
    .order('created_at', { ascending: false });
  if (error) throw error;
  return data || [];
}

export async function getLeadById(id: string): Promise<Lead | null> {
  const { data, error } = await supabase
    .from(table)
    .select('*')
    .eq('id', id)
    .maybeSingle();
  if (error) throw error;
  return data as Lead | null;
}

export async function getLeadByEmail(email: string): Promise<Lead | null> {
  const { data, error } = await supabase
    .from(table)
    .select('*')
    .eq('email', email)
    .maybeSingle();
  if (error) throw error;
  return data as Lead | null;
}

export async function updateLead(id: string, payload: Partial<Lead>): Promise<Lead> {
  const { data, error } = await supabase
    .from(table)
    .update(payload)
    .eq('id', id)
    .select()
    .maybeSingle();
  if (error) throw error;
  return data as Lead;
}

export async function deleteLead(id: string): Promise<void> {
  const { error } = await supabase
    .from(table)
    .delete()
    .eq('id', id);
  if (error) throw error;
}

export async function searchLeads(query: string): Promise<Lead[]> {
  const { data, error } = await supabase
    .from(table)
    .select('*')
    .or(`name.ilike.%${query}%,email.ilike.%${query}%,phone.ilike.%${query}%`)
    .order('created_at', { ascending: false });
  if (error) throw error;
  return data || [];
}
