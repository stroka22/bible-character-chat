import { jsx as _jsx } from "react/jsx-runtime";
import { createContext, useContext, useState, useEffect } from 'react';
import { supabase } from '../services/supabase';
import { getActiveSubscription } from '../services/stripe';

const AuthContext = createContext(undefined);

export function AuthProvider({ children }) {
    const [session, setSession] = useState(null);
    const [user, setUser] = useState(null);
    const [profile, setProfile] = useState(null);
    const [role, setRole] = useState('unknown');
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [subscription, setSubscription] = useState(null);
    const [isPremium, setIsPremium] = useState(false);

    const DEBUG = import.meta.env.VITE_AUTH_DEBUG === 'true';
    
    const dbg = (...args) => {
        if (DEBUG)
            console.debug('[AuthContext]', ...args);
    };
    
    const dbgwarn = (...args) => {
        if (DEBUG)
            console.warn('[AuthContext]', ...args);
    };
    
    const fetchProfile = async (uid = user?.id, retryCount = 0) => {
        const MAX_RETRIES = 3;
        const RETRY_DELAY = 1000;
        if (!uid) {
            dbg('fetchProfile: No user ID provided, skipping profile fetch');
            setProfile(null);
            setRole('unknown');
            return;
        }
        dbg(`fetchProfile: Fetching profile for user ID ${uid} ` +
            `(attempt ${retryCount + 1}/${MAX_RETRIES + 1})`);
        try {
            const { data, error, status } = await supabase
                .from('profiles')
                .select('id, role, email, display_name, avatar_url')
                .eq('id', uid)
                .maybeSingle();
            console.log(`fetchProfile: Query completed with status ${status}`);
            dbg(`fetchProfile: data ${data ? 'received' : 'null'} | error ${error ? 'present' : 'none'}`);
            if (error) {
                console.error('fetchProfile: Failed to fetch profile:', error);
                setProfile(null);
                setRole('unknown');
                return;
            }
            if (!data && retryCount < MAX_RETRIES) {
                dbgwarn(`fetchProfile: No profile found for user ${uid}, retrying in ${RETRY_DELAY}ms...`);
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
        }
        catch (unexpectedError) {
            console.error('fetchProfile: Unexpected error during profile fetch:', unexpectedError);
            setProfile(null);
            setRole('unknown');
        }
    };

    const refreshSubscription = async (uid = user?.id) => {
        if (!uid) {
            dbg('refreshSubscription: No user ID provided, clearing subscription state');
            setSubscription(null);
            setIsPremium(false);
            return;
        }

        dbg(`refreshSubscription: Checking subscription status for user ID ${uid}`);
        try {
            const sub = await getActiveSubscription(uid);
            setSubscription(sub);
            
            // Set premium status based on subscription status
            const premiumStatus = sub && (sub.status === 'active' || sub.status === 'trialing');
            setIsPremium(premiumStatus);
            
            dbg(`refreshSubscription: User premium status: ${premiumStatus ? 'PREMIUM' : 'FREE'}`);
        } catch (error) {
            console.error('refreshSubscription: Error fetching subscription:', error);
            
            // Fall back to localStorage flag if available
            try {
                const localIsPremium = localStorage.getItem('isPremium') === 'true';
                setIsPremium(localIsPremium);
                dbg(`refreshSubscription: Falling back to localStorage isPremium=${localIsPremium}`);
            } catch (storageError) {
                console.error('refreshSubscription: Error accessing localStorage:', storageError);
                setIsPremium(false);
            }
        }
    };

    useEffect(() => {
        let cleanup;
        const initAuth = async () => {
            try {
                setLoading(true);
                const { data: { session: currentSession } } = await supabase.auth.getSession();
                setSession(currentSession);
                setUser(currentSession?.user ?? null);
                if (currentSession?.user) {
                    await fetchProfile(currentSession.user.id);
                    await refreshSubscription(currentSession.user.id);
                }
                const { data: { subscription } } = await supabase.auth.onAuthStateChange((_event, newSession) => {
                    setSession(newSession);
                    setUser(newSession?.user ?? null);
                    if (newSession?.user) {
                        fetchProfile(newSession.user.id);
                        refreshSubscription(newSession.user.id);
                    }
                    else {
                        setProfile(null);
                        setRole('unknown');
                        setSubscription(null);
                        setIsPremium(false);
                    }
                });
                cleanup = () => subscription.unsubscribe();
            }
            catch (error) {
                if (error instanceof Error) {
                    setError(error.message);
                }
                else {
                    setError('An unknown error occurred');
                }
            }
            finally {
                setLoading(false);
            }
        };
        initAuth();
        return () => {
            if (cleanup)
                cleanup();
        };
    }, []);
    
    const signIn = async (email, password) => {
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
            if (data?.user) {
                await fetchProfile(data.user.id);
                await refreshSubscription(data.user.id);
            }
            else {
                dbgwarn('signIn: Authentication succeeded but no user data returned');
            }
        }
        catch (error) {
            if (error instanceof Error) {
                setError(error.message);
            }
            else {
                setError('Failed to sign in');
            }
            throw error;
        }
        finally {
            setLoading(false);
        }
    };
    
    const signUp = async (email, password) => {
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
            await fetchProfile();
        }
        catch (error) {
            if (error instanceof Error) {
                setError(error.message);
            }
            else {
                setError('Failed to sign up');
            }
            throw error;
        }
        finally {
            setLoading(false);
        }
    };
    
    const signOut = async () => {
        try {
            setLoading(true);
            setError(null);
            const { error } = await supabase.auth.signOut();
            if (error) {
                throw error;
            }
            // Immediately clear local auth state so UI updates without waiting for listener
            setSession(null);
            setUser(null);
            setProfile(null);
            setRole('unknown');
            setSubscription(null);
            setIsPremium(false);
        }
        catch (error) {
            if (error instanceof Error) {
                setError(error.message);
            }
            else {
                setError('Failed to sign out');
            }
            throw error;
        }
        finally {
            setLoading(false);
        }
    };
    
    const resetPassword = async (email) => {
        try {
            setLoading(true);
            setError(null);
            const { error } = await supabase.auth.resetPasswordForEmail(email, {
                redirectTo: `${window.location.origin}/reset-password`,
            });
            if (error) {
                throw error;
            }
        }
        catch (error) {
            if (error instanceof Error) {
                setError(error.message);
            }
            else {
                setError('Failed to send password reset email');
            }
            throw error;
        }
        finally {
            setLoading(false);
        }
    };
    
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
            setSession(data.session);
            setUser(data.session?.user ?? null);
            if (data.session?.user) {
                await fetchProfile(data.session.user.id);
                await refreshSubscription(data.session.user.id);
            }
            else {
                setProfile(null);
                setRole('unknown');
                setSubscription(null);
                setIsPremium(false);
            }
            dbg('refreshSession: Session and profile successfully refreshed');
        }
        catch (error) {
            if (error instanceof Error) {
                setError(error.message);
            }
            else {
                setError('Failed to refresh session');
            }
            throw error;
        }
        finally {
            setLoading(false);
        }
    };
    
    const updateProfile = async (data) => {
        try {
            setLoading(true);
            setError(null);
            if (!user) {
                throw new Error('No user logged in');
            }
            const updates = {
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
        }
        catch (error) {
            if (error instanceof Error) {
                setError(error.message);
            }
            else {
                setError('Failed to update profile');
            }
            throw error;
        }
        finally {
            setLoading(false);
        }
    };
    
    const isAdmin = () => role === 'admin';
    // Superadmin helper
    const isSuperadmin = () => role === 'superadmin';
    // Update admin check to include superadmin
    const isAdminOrSuperadmin = () => role === 'admin' || role === 'superadmin';
    const isPastor = () => role === 'pastor' || role === 'admin';
    
    const value = {
        session,
        user,
        profile,
        role,
        loading,
        error,
        // Quick boolean for consumers
        isAuthenticated: !!user,
        // Premium status
        isPremium,
        subscription,
        refreshSubscription,
        // Role helpers
        isAdmin: isAdminOrSuperadmin,
        isSuperadmin,
        isPastor,
        signIn,
        signUp,
        signOut,
        resetPassword,
        updateProfile,
        refreshProfile: fetchProfile,
        refreshSession,
    };
    
    return _jsx(AuthContext.Provider, { value: value, children: children });
}

export function useAuth() {
    const context = useContext(AuthContext);
    if (context === undefined) {
        throw new Error('useAuth must be used within an AuthProvider');
    }
    return context;
}
