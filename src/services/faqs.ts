import { supabase } from './supabase';

export type Faq = {
  id?: string;
  question: string;
  answer: string;
  category?: string | null;
  is_published?: boolean | null;
  order_index?: number | null;
  created_at?: string;
  updated_at?: string;
};

const table = 'faqs';

export async function listPublishedFaqs(): Promise<Faq[]> {
  const { data, error } = await supabase
    .from(table)
    .select('id, question, answer, category, is_published, order_index, created_at, updated_at')
    .eq('is_published', true)
    .order('order_index', { ascending: true, nullsFirst: false })
    .order('created_at', { ascending: true });
  if (error) throw error;
  return data || [];
}

export async function listAllFaqs(): Promise<Faq[]> {
  const { data, error } = await supabase
    .from(table)
    .select('id, question, answer, category, is_published, order_index, created_at, updated_at')
    .order('order_index', { ascending: true, nullsFirst: false })
    .order('created_at', { ascending: true });
  if (error) throw error;
  return data || [];
}

export async function upsertFaq(faq: Faq): Promise<Faq> {
  const payload = { ...faq };
  // Normalize booleans/strings
  if (typeof payload.is_published === 'undefined') payload.is_published = true;
  const { data, error } = await supabase
    .from(table)
    .upsert(payload, { onConflict: 'id' })
    .select()
    .maybeSingle();
  if (error) throw error;
  return data as Faq;
}

export async function deleteFaq(id: string): Promise<void> {
  const { error } = await supabase.from(table).delete().eq('id', id);
  if (error) throw error;
}

export async function reorderFaq(id: string, order_index: number): Promise<void> {
  const { error } = await supabase.from(table).update({ order_index }).eq('id', id);
  if (error) throw error;
}
