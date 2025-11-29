import AsyncStorage from '@react-native-async-storage/async-storage';
import { supabase } from './supabase';

type TierSettings = {
  freeMessageLimit: number;
  freeCharacterLimit: number;
  freeCharacters: string[];
  freeCharacterNames: string[];
  premiumRoundtableGates?: any;
  premiumStudyIds?: string[];
  lastUpdated?: string;
};

const CACHE_KEY = (slug: string) => `tier_settings:${slug || 'default'}`;

export async function getOwnerSlug(userId?: string): Promise<string> {
  try {
    if (!userId) return 'default';
    const { data } = await supabase
      .from('profiles')
      .select('owner_slug')
      .eq('id', userId)
      .maybeSingle();
    const slug = (data?.owner_slug && String(data.owner_slug).trim()) || 'default';
    return slug;
  } catch {
    return 'default';
  }
}

function defaults(): TierSettings {
  return {
    freeMessageLimit: 5,
    freeCharacterLimit: 10,
    freeCharacters: [],
    freeCharacterNames: [],
    premiumRoundtableGates: {},
    premiumStudyIds: [],
    lastUpdated: new Date().toISOString(),
  };
}

export async function getTierSettings(slug: string): Promise<TierSettings> {
  // try cache first
  try {
    const cached = await AsyncStorage.getItem(CACHE_KEY(slug));
    if (cached) return JSON.parse(cached);
  } catch {}
  // load from supabase
  try {
    const { data, error } = await supabase
      .from('tier_settings')
      .select('*')
      .eq('owner_slug', slug)
      .maybeSingle();
    if (error) throw error;
    const s: TierSettings = {
      freeMessageLimit: data?.free_message_limit ?? 5,
      freeCharacterLimit: data?.free_character_limit ?? 10,
      freeCharacters: data?.free_characters ?? [],
      freeCharacterNames: data?.free_character_names ?? [],
      premiumRoundtableGates: data?.premium_roundtable_gates ?? {},
      premiumStudyIds: data?.premium_study_ids ?? [],
      lastUpdated: data?.updated_at ?? new Date().toISOString(),
    };
    try { await AsyncStorage.setItem(CACHE_KEY(slug), JSON.stringify(s)); } catch {}
    return s;
  } catch {
    const d = defaults();
    try { await AsyncStorage.setItem(CACHE_KEY(slug), JSON.stringify(d)); } catch {}
    return d;
  }
}

export async function isPremiumUser(userId?: string): Promise<boolean> {
  if (!userId) return false;
  try {
    const { data } = await supabase
      .from('profiles')
      .select('premium_override')
      .eq('id', userId)
      .maybeSingle();
    return !!data?.premium_override;
  } catch {
    return false;
  }
}

export async function requirePremiumOrPrompt(opts: {
  userId?: string;
  feature: 'roundtable' | 'premiumStudy' | 'other';
  studyId?: string;
  onUpgrade: () => void;
  onAllowed: () => void;
}) {
  const { userId, feature, studyId, onUpgrade, onAllowed } = opts;
  const premium = await isPremiumUser(userId);
  if (premium) return onAllowed();
  const slug = await getOwnerSlug(userId);
  const s = await getTierSettings(slug);
  // basic rules
  if (feature === 'premiumStudy' && studyId) {
    const set = new Set<string>(s.premiumStudyIds || []);
    if (set.has(String(studyId))) return onUpgrade();
  }
  if (feature === 'roundtable') {
    // default to premium if not specified
    const gates = s.premiumRoundtableGates || {};
    const isPremiumOnly = gates?.premiumOnly ?? true;
    if (isPremiumOnly) return onUpgrade();
  }
  return onAllowed();
}
