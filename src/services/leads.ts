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
