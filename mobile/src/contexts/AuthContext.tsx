import React, { createContext, useContext, useEffect, useMemo, useState } from 'react';
import * as SecureStore from 'expo-secure-store';
import { supabase } from '../lib/supabase';

type AuthContextType = {
  session: any | null;
  user: any | null;
  loading: boolean;
  signInWithPassword: (email: string, password: string) => Promise<{ error?: any }|void>;
  signOut: () => Promise<void>;
};

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [session, setSession] = useState<any | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let unsub: any;
    (async () => {
      try {
        if (!supabase) return setLoading(false);
        const { data } = await supabase.auth.getSession();
        setSession(data.session);
        unsub = supabase.auth.onAuthStateChange((_event, s) => {
          setSession(s);
        }).data.subscription;
      } finally {
        setLoading(false);
      }
    })();
    return () => {
      try { unsub?.unsubscribe?.(); } catch {}
    };
  }, []);

  const value = useMemo<AuthContextType>(() => ({
    session,
    user: session?.user ?? null,
    loading,
    async signInWithPassword(email: string, password: string) {
      if (!supabase) return { error: new Error('Supabase not configured') };
      const { error } = await supabase.auth.signInWithPassword({ email, password });
      return { error };
    },
    async signOut() {
      if (!supabase) return;
      await supabase.auth.signOut();
      try { await SecureStore.deleteItemAsync('supabase.session'); } catch {}
    }
  }), [session, loading]);

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
}
