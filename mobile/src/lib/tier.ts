import AsyncStorage from '@react-native-async-storage/async-storage';
import { Platform } from 'react-native';
import { supabase } from './supabase';
import { isLocalPremiumActive } from './iap';

type PremiumRoundtableGates = {
  savingRequiresPremium: boolean;
  premiumOnly: boolean;
  allowAllSpeak: boolean;
  strictRotation: boolean;
  followUpsMin?: number | null;
  repliesPerRoundMin?: number | null;
  promptTemplate?: string;
};

type TierSettings = {
  freeMessageLimit: number;
  freeCharacterLimit: number;
  freeCharacters: string[];
  freeCharacterNames: string[];
  premiumRoundtableGates: PremiumRoundtableGates;
  premiumStudyIds: string[];
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
    premiumRoundtableGates: {
      savingRequiresPremium: true,
      premiumOnly: true,
      allowAllSpeak: false,
      strictRotation: false,
    },
    premiumStudyIds: [],
    lastUpdated: new Date().toISOString(),
  };
}

export async function getTierSettings(slug: string): Promise<TierSettings> {
  // Network-first: always try to pull latest from Supabase, then fall back to cache, then defaults.
  try {
    const { data, error } = await supabase
      .from('tier_settings')
      .select('*')
      .eq('owner_slug', slug)
      .maybeSingle();
    if (error) throw error;
    if (data) {
      const gates = data.premium_roundtable_gates || {};
      const s: TierSettings = {
        freeMessageLimit: data.free_message_limit ?? 5,
        freeCharacterLimit: data.free_character_limit ?? 10,
        freeCharacters: data.free_characters ?? [],
        freeCharacterNames: data.free_character_names ?? [],
        premiumRoundtableGates: {
          savingRequiresPremium: gates.savingRequiresPremium !== false,
          premiumOnly: gates.premiumOnly !== false,
          allowAllSpeak: !!gates.allowAllSpeak,
          strictRotation: !!gates.strictRotation,
          followUpsMin: gates.followUpsMin ?? null,
          repliesPerRoundMin: gates.repliesPerRoundMin ?? null,
          promptTemplate: gates.promptTemplate ?? '',
        },
        premiumStudyIds: data.premium_study_ids ?? [],
        lastUpdated: data.updated_at ?? new Date().toISOString(),
      };
      try { await AsyncStorage.setItem(CACHE_KEY(slug), JSON.stringify(s)); } catch {}
      return s;
    }
  } catch (e) {
    // swallow and fall back to cache/defaults
  }
  // Fallback: cache
  try {
    const cached = await AsyncStorage.getItem(CACHE_KEY(slug));
    if (cached) return JSON.parse(cached);
  } catch {}
  // Final fallback: defaults (also seed cache for next time)
  const d = defaults();
  try { await AsyncStorage.setItem(CACHE_KEY(slug), JSON.stringify(d)); } catch {}
  return d;
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
  feature: 'roundtable' | 'premiumStudy' | 'save' | 'allSpeak' | 'strictRotation' | 'other';
  studyId?: string;
  onUpgrade: () => void;
  onAllowed: () => void;
}) {
  const { userId, feature, studyId, onUpgrade, onAllowed } = opts;
  
  // Check if user has premium (via IAP on iOS or server flag)
  let hasPremium = false;
  if (Platform.OS === 'ios') {
    hasPremium = await isLocalPremiumActive();
  }
  if (!hasPremium) {
    hasPremium = await isPremiumUser(userId);
  }
  
  // If user has premium, always allow
  if (hasPremium) return onAllowed();
  
  // Check tier settings to see if the feature actually requires premium
  const slug = await getOwnerSlug(userId);
  const s = await getTierSettings(slug);
  const gates = s.premiumRoundtableGates;
  
  // Check each feature type
  if (feature === 'premiumStudy' && studyId) {
    const set = new Set<string>(s.premiumStudyIds || []);
    if (set.has(String(studyId))) return onUpgrade();
    return onAllowed(); // Study not in premium list
  }
  
  if (feature === 'roundtable') {
    if (gates.premiumOnly) return onUpgrade();
    return onAllowed();
  }
  
  if (feature === 'save') {
    if (gates.savingRequiresPremium) return onUpgrade();
    return onAllowed();
  }
  
  if (feature === 'allSpeak') {
    if (gates.allowAllSpeak) return onUpgrade();
    return onAllowed();
  }
  
  if (feature === 'strictRotation') {
    if (gates.strictRotation) return onUpgrade();
    return onAllowed();
  }
  
  return onAllowed();
}

// Local daily message counter (resets when date changes). This is a client-side guard; server should enforce too.
const MSG_KEY = (userId?: string) => `msg_count:${userId || 'anon'}`;

export async function getDailyMessageCount(userId?: string): Promise<{ date: string; count: number }> {
  try {
    const raw = await AsyncStorage.getItem(MSG_KEY(userId));
    const today = new Date().toISOString().slice(0, 10);
    if (!raw) return { date: today, count: 0 };
    const parsed = JSON.parse(raw);
    if (parsed.date !== today) return { date: today, count: 0 };
    return { date: today, count: Number(parsed.count || 0) };
  } catch {
    return { date: new Date().toISOString().slice(0, 10), count: 0 };
  }
}

export async function incrementDailyMessageCount(userId?: string): Promise<void> {
  const today = new Date().toISOString().slice(0, 10);
  const curr = await getDailyMessageCount(userId);
  const next = { date: today, count: (curr.count || 0) + 1 };
  try { await AsyncStorage.setItem(MSG_KEY(userId), JSON.stringify(next)); } catch {}
}

export async function guardMessageSend(opts: {
  userId?: string;
  onUpgrade: () => void;
  onAllowed: () => void;
}) {
  const { userId, onUpgrade, onAllowed } = opts;
  
  // Check if user has premium (via IAP on iOS or server flag)
  let hasPremium = false;
  if (Platform.OS === 'ios') {
    hasPremium = await isLocalPremiumActive();
  }
  if (!hasPremium) {
    hasPremium = await isPremiumUser(userId);
  }
  
  // Premium users have unlimited messages
  if (hasPremium) return onAllowed();
  
  // Check tier settings for message limits
  const slug = await getOwnerSlug(userId);
  const s = await getTierSettings(slug);
  const { count } = await getDailyMessageCount(userId);
  const limit = Number(s.freeMessageLimit || 0);
  if (limit > 0 && count >= limit) return onUpgrade();
  return onAllowed();
}

export function isCharacterFree(s: TierSettings, c: { id?: string; name?: string }): boolean {
  const ids: string[] = s.freeCharacters || [];
  const names: string[] = s.freeCharacterNames || [];
  if (ids.length > 0 && c.id) {
    if (ids.map(String).includes(String(c.id))) return true;
  }
  if (names.length > 0 && c.name) {
    if (names.map((n) => n.toLowerCase()).includes(String(c.name).toLowerCase())) return true;
  }
  // if no explicit lists provided, treat as free by default
  if (ids.length === 0 && names.length === 0) return true;
  return false;
}
