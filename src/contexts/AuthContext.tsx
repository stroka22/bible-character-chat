import type { ReactNode } from "react";
import { createContext, useContext, useState, useEffect } from 'react';
// Importing as `type` ensures these interfaces are erased during compilation,
// preventing runtime "export not found" errors while still providing full
// TypeScript support.
import type { Session, User } from '@supabase/supabase-js';
import { supabase } from '../services/supabase';

// Define the shape of our auth context
interface AuthContextType {
  session: Session | null;
  user: User | null;
  /** Full row from `profiles` table (may be null if not yet fetched) */
  profile: Profile | null;
  /** Convenience role string: 'admin' | 'pastor' | 'user' | 'unknown' */
  role: UserRole;
  loading: boolean;
  error: string | null;
  /** `true` when `user` is non-null */
  isAuthenticated: boolean;
  /** Returns true for admin role */
  isAdmin: () => boolean;
  /** Returns true for pastor (or admin) role */
  isPastor: () => boolean;
  signIn: (email: string, password: string) => Promise<void>;
  signUp: (email: string, password: string) => Promise<void>;
  signOut: () => Promise<void>;
  resetPassword: (email: string) => Promise<void>;
  updateProfile: (data: { username?: string; website?: string; avatar_url?: string }) => Promise<void>;
  /** Manually re-query the user's profile (role) */
  refreshProfile: () => Promise<void>;
  /** Force-refresh Supabase auth session & pull fresh profile */
  refreshSession: () => Promise<void>;
}

// Create the context with a default value
const AuthContext = createContext<AuthContextType | undefined>(undefined);

// Props for the AuthProvider component
interface AuthProviderProps {
  children: ReactNode;
}

type UserRole = 'admin' | 'pastor' | 'user' | 'unknown';
interface Profile {
  id: string;
  role: UserRole;
  email?: string;
  display_name?: string;
  avatar_url?: string;
}

// Provider component that wraps the app and makes auth available to any child component
export function AuthProvider({ children }: AuthProviderProps) {
  const [session, setSession] = useState<Session | null>(null);
  const [user, setUser] = useState<User | null>(null);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [role, setRole] = useState<UserRole>('unknown');
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  /* ------------------------------------------------------------------
   * Debug helpers
   * ---------------------------------------------------------------- */
  /**
   * Toggle verbose auth debugging by setting VITE_AUTH_DEBUG=true
   * in your Vite/CRA env file or shell.  Defaults to false.
   */
  const DEBUG = import.meta.env.VITE_AUTH_DEBUG === 'true';

  const dbg = (...args: unknown[]) => {
    if (DEBUG) console.debug('[AuthContext]', ...args);
  };
  const dbgwarn = (...args: unknown[]) => {
    if (DEBUG) console.warn('[AuthContext]', ...args);
  };
  // NOTE: We intentionally *do not* suppress console.error – errors should
  // always surface in the console for production troubleshooting.

  /* ------------------------------------------------------------------
   * Helper – retrieve profile/role for current user with enhanced debugging
   * ---------------------------------------------------------------- */
  const fetchProfile = async (uid: string | undefined | null = user?.id, retryCount = 0) => {
    const MAX_RETRIES = 3;
    const RETRY_DELAY = 1000; // ms
    
    if (!uid) {
      dbg('fetchProfile: No user ID provided, skipping profile fetch');
      setProfile(null);
      setRole('unknown');
      return;
    }

    dbg(
      `fetchProfile: Fetching profile for user ID ${uid} ` +
        `(attempt ${retryCount + 1}/${MAX_RETRIES + 1})`,
    );
    
    try {
      const { data, error, status } = await supabase
        .from('profiles')
        .select('id, role, email, display_name, avatar_url')
        .eq('id', uid)
        .maybeSingle();

      console.log(`fetchProfile: Query completed with status ${status}`);
      dbg(
        `fetchProfile: data ${
          data ? 'received' : 'null'
        } | error ${error ? 'present' : 'none'}`,
      );
      
      if (error) {
        console.error('fetchProfile: Failed to fetch profile:', error);
        setProfile(null);
        setRole('unknown');
        return;
      }
      
      if (!data && retryCount < MAX_RETRIES) {
        dbgwarn(
          `fetchProfile: No profile found for user ${uid}, retrying in ${RETRY_DELAY}ms...`,
        );
        // Wait before retrying to allow for potential database propagation delay
        setTimeout(() => fetchProfile(uid, retryCount + 1), RETRY_DELAY);
        return;
      }
      
      if (!data) {
        console.error(`fetchProfile: No profile found for user ${uid} after ${retryCount + 1} attempts`);
        setProfile(null);
        setRole('unknown');
        return;
      }
      
      dbg('fetchProfile: Successfully retrieved profile:', {
        id: data.id,
        email: data.email,
        role: data.role,
        hasDisplayName: !!data.display_name,
        hasAvatar: !!data.avatar_url
      });
      
      setProfile(data);
      setRole(data.role ?? 'unknown');
      dbg(`fetchProfile: User role set to "${data.role || 'unknown'}"`);
    } catch (unexpectedError) {
      console.error('fetchProfile: Unexpected error during profile fetch:', unexpectedError);
      setProfile(null);
      setRole('unknown');
    }
  };

  // Initialize the auth state when the component mounts
  useEffect(() => {
    // Get the current session
    // We keep a reference to whatever unsubscribe function the auth listener
    // gives us so the effect can clean it up **synchronously**, instead of
    // trying to await an async function's return value.
    let cleanup: (() => void) | undefined;

    const initAuth = async () => {
      try {
        setLoading(true);
        
        // Check for an existing session
        const { data: { session: currentSession } } = await supabase.auth.getSession();
        setSession(currentSession);
        setUser(currentSession?.user ?? null);
        if (currentSession?.user) {
          await fetchProfile(currentSession.user.id);
        }
        
        // Set up auth state listener for future changes
        const { data: { subscription } } = await supabase.auth.onAuthStateChange(
          (_event, newSession) => {
            setSession(newSession);
            setUser(newSession?.user ?? null);
            // when auth state changes, refresh profile
            if (newSession?.user) {
              fetchProfile(newSession.user.id);
            } else {
              setProfile(null);
              setRole('unknown');
            }
          }
        );

        // Assign the unsubscribe function so it can be called later
        cleanup = () => subscription.unsubscribe();
      } catch (error) {
        if (error instanceof Error) {
          setError(error.message);
        } else {
          setError('An unknown error occurred');
        }
      } finally {
        setLoading(false);
      }
    };

    // Kick off the async auth initialisation
    initAuth();

    // Clean up subscription on unmount
    return () => {
      if (cleanup) cleanup();
    };
  }, []);

  // Sign in with email and password
  const signIn = async (email: string, password: string) => {
    try {
      setLoading(true);
      setError(null);
      
      dbg(`signIn: Attempting to sign in user ${email}`);
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });
      
      if (error) {
        console.error('signIn: Authentication failed:', error);
        throw error;
      }
      
      dbg('signIn: Authentication successful, fetching profile');
      // refresh profile after successful login
      if (data?.user) {
        await fetchProfile(data.user.id);
      } else {
        dbgwarn('signIn: Authentication succeeded but no user data returned');
      }
    } catch (error) {
      if (error instanceof Error) {
        setError(error.message);
      } else {
        setError('Failed to sign in');
      }
      throw error;
    } finally {
      setLoading(false);
    }
  };

  // Sign up with email and password
  const signUp = async (email: string, password: string) => {
    try {
      setLoading(true);
      setError(null);
      
      const { error } = await supabase.auth.signUp({
        email,
        password,
      });
      
      if (error) {
        throw error;
      }
      // new users start with 'user' role; fetch profile row
      await fetchProfile();
    } catch (error) {
      if (error instanceof Error) {
        setError(error.message);
      } else {
        setError('Failed to sign up');
      }
      throw error;
    } finally {
      setLoading(false);
    }
  };

  // Sign out
  const signOut = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const { error } = await supabase.auth.signOut();
      
      if (error) {
        throw error;
      }
      // clear local profile/role
      setProfile(null);
      setRole('unknown');
    } catch (error) {
      if (error instanceof Error) {
        setError(error.message);
      } else {
        setError('Failed to sign out');
      }
      throw error;
    } finally {
      setLoading(false);
    }
  };

  // Reset password
  const resetPassword = async (email: string) => {
    try {
      setLoading(true);
      setError(null);

      const { error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: `${window.location.origin}/reset-password`,
      });

      if (error) {
        throw error;
      }
    } catch (error) {
      if (error instanceof Error) {
        setError(error.message);
      } else {
        setError('Failed to send password reset email');
      }
      throw error;
    } finally {
      setLoading(false);
    }
  };

  /* ------------------------------------------------------------------
   * Force refresh the Supabase session & profile
   * ---------------------------------------------------------------- */
  const refreshSession = async () => {
    try {
      setLoading(true);
      setError(null);

      dbg('refreshSession: Forcing session refresh via Supabase');
      const { data, error } = await supabase.auth.refreshSession();

      if (error) {
        console.error('refreshSession: Supabase returned error:', error);
        throw error;
      }

      // Update local state with new session
      setSession(data.session);
      setUser(data.session?.user ?? null);

      // Pull fresh profile/role
      if (data.session?.user) {
        await fetchProfile(data.session.user.id);
      } else {
        setProfile(null);
        setRole('unknown');
      }

      dbg('refreshSession: Session and profile successfully refreshed');
    } catch (error) {
      if (error instanceof Error) {
        setError(error.message);
      } else {
        setError('Failed to refresh session');
      }
      throw error;
    } finally {
      setLoading(false);
    }
  };

  // Update user profile
  const updateProfile = async (data: { username?: string; website?: string; avatar_url?: string }) => {
    try {
      setLoading(true);
      setError(null);
      
      if (!user) {
        throw new Error('No user logged in');
      }
      
      const updates: Partial<Profile> & { id: string; updated_at: string } = {
        id: user.id,
        updated_at: new Date().toISOString(),
      };

      if (data.username) {
        updates.display_name = data.username;
      }

      if (data.avatar_url) {
        updates.avatar_url = data.avatar_url;
      }

      const { error } = await supabase.from('profiles').upsert(updates);
      
      if (error) {
        throw error;
      }
    } catch (error) {
      if (error instanceof Error) {
        setError(error.message);
      } else {
        setError('Failed to update profile');
      }
      throw error;
    } finally {
      setLoading(false);
    }
  };

  /* ------------------------------------------------------------------
   * Role helpers
   * ---------------------------------------------------------------- */
  const isAdmin = () => role === 'admin';
  const isPastor = () => role === 'pastor' || role === 'admin';

  // Create the value object that will be provided to consumers
  const value = {
    session,
    user,
    profile,
    role,
    loading,
    error,
    isAuthenticated: !!user,
    isAdmin,
    isPastor,
    signIn,
    signUp,
    signOut,
    resetPassword,
    updateProfile,
    refreshProfile: fetchProfile,
    refreshSession,
  };

  // Provide the auth context to children components
  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

// Custom hook to use the auth context
export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
