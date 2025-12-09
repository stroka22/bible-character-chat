import { supabase } from './supabase';

export type FavoriteCharacter = {
  user_id: string;
  character_id: string;
  created_at: string;
};

export async function listFavoriteCharacters(userId: string) {
  const { data, error } = await supabase
    .from('user_favorites')
    .select('character_id, created_at, characters:character_id ( id, name, description, avatar_url, is_visible )')
    .eq('user_id', userId)
    .order('created_at', { ascending: false });
  if (error) return [] as any[];
  // Filter out explicitly hidden; allow null/true
  return (data || [])
    .map((row: any) => ({ ...row.characters }))
    .filter((c: any) => c && (c.is_visible === null || c.is_visible === undefined || c.is_visible === true));
}

export async function getFavoriteCharacterIds(userId: string): Promise<Set<string>> {
  const { data } = await supabase
    .from('user_favorites')
    .select('character_id')
    .eq('user_id', userId);
  return new Set((data || []).map((r: any) => String(r.character_id)));
}

export async function setFavoriteCharacter(userId: string, characterId: string, next: boolean) {
  if (next) {
    const { error } = await supabase.from('user_favorites').upsert({ user_id: userId, character_id: characterId } as any, { onConflict: 'user_id,character_id' });
    if (error) throw error;
  } else {
    const { error } = await supabase.from('user_favorites').delete().eq('user_id', userId).eq('character_id', characterId);
    if (error) throw error;
  }
}

// SQL helper for README/PR description
export const FAVORITES_SQL = `
create table if not exists public.user_favorites (
  user_id uuid not null references auth.users(id) on delete cascade,
  character_id uuid not null references public.characters(id) on delete cascade,
  created_at timestamp with time zone default now(),
  primary key (user_id, character_id)
);
`; 
