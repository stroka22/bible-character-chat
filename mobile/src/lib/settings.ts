import AsyncStorage from '@react-native-async-storage/async-storage';
import { supabase } from './supabase';
import { getOwnerSlug } from './tier';

export type SiteSettings = {
  defaultFeaturedCharacterId: string | null;
  enforceAdminDefault: boolean;
  updatedAt?: string | null;
};

export type RoundtableSettings = {
  defaults: {
    repliesPerRound: number;
    followUpsPerRound: number;
    maxWordsPerReply: number;
    allowAllSpeak: boolean;
    strictRotation: boolean;
    creativity: number;
    maxParticipants: number;
    saveByDefault: boolean;
    enableAdvanceRound: boolean;
  };
  limits: {
    free: { repliesPerRound: { min: number; max: number }; followUpsPerRound: { min: number; max: number }; maxWordsPerReply: { min: number; max: number }; creativity: { min: number; max: number }; maxParticipants: number };
    premium: { repliesPerRound: { min: number; max: number }; followUpsPerRound: { min: number; max: number }; maxWordsPerReply: { min: number; max: number }; creativity: { min: number; max: number }; maxParticipants: number };
  };
  locks: { allowAllSpeak: boolean; strictRotation: boolean; enableAdvanceRound: boolean; saveByDefault: boolean };
  updatedAt?: string | null;
};

const SITE_KEY = (slug: string) => `site_settings:${slug || 'default'}`;
const RT_KEY = (slug: string) => `roundtable_settings:${slug || 'default'}`;
const TIER_KEY = (slug: string) => `tier_settings:${slug || 'default'}`; // from tier.ts

const DEFAULT_ROUNDTABLE: RoundtableSettings = {
  defaults: {
    repliesPerRound: 3,
    followUpsPerRound: 2,
    maxWordsPerReply: 110,
    allowAllSpeak: false,
    strictRotation: false,
    creativity: 0.7,
    maxParticipants: 8,
    saveByDefault: true,
    enableAdvanceRound: true,
  },
  limits: {
    free: { repliesPerRound: { min: 1, max: 4 }, followUpsPerRound: { min: 0, max: 2 }, maxWordsPerReply: { min: 60, max: 140 }, creativity: { min: 0.2, max: 0.9 }, maxParticipants: 8 },
    premium: { repliesPerRound: { min: 1, max: 6 }, followUpsPerRound: { min: 0, max: 3 }, maxWordsPerReply: { min: 60, max: 160 }, creativity: { min: 0.2, max: 1.0 }, maxParticipants: 12 },
  },
  locks: { allowAllSpeak: false, strictRotation: false, enableAdvanceRound: false, saveByDefault: false },
};

export async function getSiteSettings(slug: string): Promise<SiteSettings> {
  // Network-first
  try {
    const { data } = await supabase
      .from('site_settings')
      .select('default_featured_character_id,enforce_admin_default,updated_at')
      .eq('owner_slug', slug)
      .maybeSingle();
    const out: SiteSettings = {
      defaultFeaturedCharacterId: data?.default_featured_character_id ?? null,
      enforceAdminDefault: !!data?.enforce_admin_default,
      updatedAt: data?.updated_at ?? null,
    };
    try { await AsyncStorage.setItem(SITE_KEY(slug), JSON.stringify(out)); } catch {}
    return out;
  } catch {}
  // Fallback to cache then defaults
  try {
    const cached = await AsyncStorage.getItem(SITE_KEY(slug));
    if (cached) return JSON.parse(cached);
  } catch {}
  const out: SiteSettings = { defaultFeaturedCharacterId: null, enforceAdminDefault: false, updatedAt: null };
  try { await AsyncStorage.setItem(SITE_KEY(slug), JSON.stringify(out)); } catch {}
  return out;
}

export async function getSiteSettingsForUser(userId?: string | null): Promise<SiteSettings> {
  const slug = await getOwnerSlug(userId || undefined);
  return getSiteSettings(slug);
}

export async function getRoundtableSettings(slug: string): Promise<RoundtableSettings> {
  // Network-first
  try {
    const { data } = await supabase
      .from('roundtable_settings')
      .select('*')
      .eq('owner_slug', slug)
      .maybeSingle();
    if (!data) {
      try { await AsyncStorage.setItem(RT_KEY(slug), JSON.stringify(DEFAULT_ROUNDTABLE)); } catch {}
      return DEFAULT_ROUNDTABLE;
    }
    const incomingLimits = data.limits || {};
    const merged: RoundtableSettings = {
      defaults: { ...DEFAULT_ROUNDTABLE.defaults, ...(data.defaults || {}) },
      limits: ((): RoundtableSettings['limits'] => {
        if (incomingLimits.free || incomingLimits.premium) {
          return {
            free: { ...DEFAULT_ROUNDTABLE.limits.free, ...(incomingLimits.free || {}) },
            premium: { ...DEFAULT_ROUNDTABLE.limits.premium, ...(incomingLimits.premium || {}) },
          };
        }
        return {
          free: { ...DEFAULT_ROUNDTABLE.limits.free, ...incomingLimits },
          premium: { ...DEFAULT_ROUNDTABLE.limits.premium, ...incomingLimits },
        };
      })(),
      locks: { ...DEFAULT_ROUNDTABLE.locks, ...(data.locks || {}) },
      updatedAt: data.updated_at || null,
    };
    try { await AsyncStorage.setItem(RT_KEY(slug), JSON.stringify(merged)); } catch {}
    return merged;
  } catch {}
  // Fallback to cache then defaults
  try {
    const cached = await AsyncStorage.getItem(RT_KEY(slug));
    if (cached) return JSON.parse(cached);
  } catch {}
  try { await AsyncStorage.setItem(RT_KEY(slug), JSON.stringify(DEFAULT_ROUNDTABLE)); } catch {}
  return DEFAULT_ROUNDTABLE;
}

export async function refreshAllSettingsForUser(userId?: string | null): Promise<void> {
  const slug = await getOwnerSlug(userId || undefined);
  try { await AsyncStorage.removeItem(SITE_KEY(slug)); } catch {}
  try { await AsyncStorage.removeItem(RT_KEY(slug)); } catch {}
  try { await AsyncStorage.removeItem(TIER_KEY(slug)); } catch {}
  // Prewarm tier settings to ensure latest limits immediately after foreground
  try { await (await import('./tier')).getTierSettings(slug); } catch {}
}

export async function startSettingsRealtime(slug: string): Promise<() => void> {
  const channel = supabase.channel(`settings:${slug}`);
  const clear = async (key: string) => { try { await AsyncStorage.removeItem(key); } catch {} };
  channel.on('postgres_changes', { event: '*', schema: 'public', table: 'site_settings', filter: `owner_slug=eq.${slug}` }, async () => {
    await clear(SITE_KEY(slug));
  });
  channel.on('postgres_changes', { event: '*', schema: 'public', table: 'roundtable_settings', filter: `owner_slug=eq.${slug}` }, async () => {
    await clear(RT_KEY(slug));
  });
  channel.on('postgres_changes', { event: '*', schema: 'public', table: 'tier_settings', filter: `owner_slug=eq.${slug}` }, async () => {
    await clear(TIER_KEY(slug));
  });
  channel.subscribe();
  return () => { try { supabase.removeChannel(channel); } catch {} };
}

export async function startSettingsRealtimeForUser(userId?: string | null): Promise<() => void> {
  const slug = await getOwnerSlug(userId || undefined);
  return startSettingsRealtime(slug);
}
