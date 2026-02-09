import { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { User } from '@supabase/supabase-js';
import { supabase } from '../lib/supabase';
import type { UserRole } from '../types/database';

interface Profile {
  id: string;
  email: string;
  full_name: string;
  role: UserRole;
  phone: string | null;
}

interface AuthContextType {
  user: User | null;
  profile: Profile | null;
  loading: boolean;
  signIn: (email: string, password: string) => Promise<{ error: Error | null }>;
  signUp: (email: string, password: string, fullName: string) => Promise<{ error: Error | null }>;
  signOut: () => Promise<void>;
  updateProfile: (data: Partial<Profile>) => Promise<{ error: Error | null }>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setUser(session?.user ?? null);
      if (session?.user) {
        fetchProfile(session.user.id);
      } else {
        setLoading(false);
      }
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange((async () => {
      (async () => {
        const { data: { session } } = await supabase.auth.getSession();
        setUser(session?.user ?? null);
        if (session?.user) {
          await fetchProfile(session.user.id);
        } else {
          setProfile(null);
        }
        setLoading(false);
      })();
    }) as any);

    return () => subscription.unsubscribe();
  }, []);

  const fetchProfile = async (userId: string) => {
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', userId)
        .maybeSingle();

      if (error) throw error;
      setProfile(data);
    } catch (error) {
      console.error('Error fetching profile:', error);
    } finally {
      setLoading(false);
    }
  };

  const signIn = async (email: string, password: string) => {
    try {
      const { data: loginAttempt } = await supabase
        .from('login_attempts')
        .select('*')
        .eq('email', email)
        .maybeSingle();

      if (loginAttempt?.is_blocked && loginAttempt.blocked_until) {
        const blockedUntil = new Date(loginAttempt.blocked_until);
        if (blockedUntil > new Date()) {
          return { error: new Error('Account is temporarily blocked. Please try again later.') };
        }
      }

      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) {
        await updateLoginAttempt(email, true);
        return { error };
      }

      await updateLoginAttempt(email, false);

      if (data.user) {
        await fetchProfile(data.user.id);
      }

      return { error: null };
    } catch (error) {
      return { error: error as Error };
    }
  };

  const updateLoginAttempt = async (email: string, failed: boolean) => {
    const { data: attempt } = await supabase
      .from('login_attempts')
      .select('*')
      .eq('email', email)
      .maybeSingle();

    if (failed) {
      const newCount = (attempt?.attempt_count || 0) + 1;
      const isBlocked = newCount >= 5;
      const blockedUntil = isBlocked ? new Date(Date.now() + 15 * 60 * 1000).toISOString() : null;

      if (attempt) {
        await supabase
          .from('login_attempts')
          .update({
            attempt_count: newCount,
            is_blocked: isBlocked,
            blocked_until: blockedUntil,
            last_attempt_at: new Date().toISOString(),
          })
          .eq('email', email);
      } else {
        await supabase.from('login_attempts').insert({
          email,
          attempt_count: newCount,
          is_blocked: isBlocked,
          blocked_until: blockedUntil,
        });
      }
    } else {
      if (attempt) {
        await supabase
          .from('login_attempts')
          .update({
            attempt_count: 0,
            is_blocked: false,
            blocked_until: null,
          })
          .eq('email', email);
      }
    }
  };

  const signUp = async (email: string, password: string, fullName: string) => {
    try {
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            full_name: fullName,
          },
        },
      });

      if (error) return { error };

      if (data.user) {
        await fetchProfile(data.user.id);
      }

      return { error: null };
    } catch (error) {
      return { error: error as Error };
    }
  };

  const signOut = async () => {
    await supabase.auth.signOut();
    setUser(null);
    setProfile(null);
  };

  const updateProfile = async (data: Partial<Profile>) => {
    try {
      if (!user) return { error: new Error('No user logged in') };

      const { error } = await supabase
        .from('profiles')
        .update(data)
        .eq('id', user.id);

      if (error) return { error };

      await fetchProfile(user.id);
      return { error: null };
    } catch (error) {
      return { error: error as Error };
    }
  };

  const value = {
    user,
    profile,
    loading,
    signIn,
    signUp,
    signOut,
    updateProfile,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
