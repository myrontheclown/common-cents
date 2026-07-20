import { useState, useEffect, useCallback, useRef } from 'react';
import type { User } from '@supabase/supabase-js';
import { getCurrentSession, signOutUser, onAuthStateChange, signInWithEmail, signUpWithEmail, signInWithGoogle, getProfile, createProfile, type UserProfile } from '../lib/auth';
import { useFinanceStore } from '../store';

export interface OnboardingData {
  displayName: string;
  age?: number | null;
  currency?: string;
  monthlySavingsGoal?: number;
}

export interface AuthState {
  user: User | null;
  userId: string | null;
  profile: UserProfile | null;
  loading: boolean;
  error: Error | null;
  signOut: () => Promise<void>;
  signIn: (email: string, password: string) => Promise<void>;
  signUp: (email: string, password: string, onboarding: OnboardingData) => Promise<void>;
  signInWithGoogle: () => Promise<void>;
  refreshProfile: () => Promise<void>;
}

export function useAuth(): AuthState {
  const [user, setUser] = useState<User | null>(null);
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);
  const unsubscribeRef = useRef<(() => void) | null>(null);
  const pendingOnboardingRef = useRef<OnboardingData | null>(null);

  const syncProfileToStore = useCallback((p: UserProfile) => {
    useFinanceStore.getState().updatePreferences({
      name: p.display_name,
      age: p.age,
      currency: p.currency,
      monthlySavingsGoal: p.monthly_savings_goal,
    });
  }, []);

  const refreshProfile = useCallback(async () => {
    if (!user) {
      setProfile(null);
      return;
    }
    try {
      const existing = await getProfile(user.id);
      if (existing) {
        setProfile(existing);
        syncProfileToStore(existing);
      } else {
        const pending = pendingOnboardingRef.current;
        const displayName = user.user_metadata?.display_name || user.email?.split('@')[0] || 'User';
        const isGoogle = user.app_metadata?.provider === 'google';
        const newProfile = {
          id: user.id,
          display_name: pending?.displayName || displayName,
          email: user.email || '',
          age: pending?.age ?? null,
          currency: pending?.currency || 'INR',
          monthly_savings_goal: pending?.monthlySavingsGoal ?? 0,
          onboarding_completed: !isGoogle,
        };
        await createProfile(newProfile);
        const created: UserProfile = {
          id: newProfile.id,
          email: newProfile.email,
          display_name: newProfile.display_name,
          age: newProfile.age ?? null,
          currency: newProfile.currency,
          monthly_savings_goal: newProfile.monthly_savings_goal,
          category_threshold: 80,
          reminder_enabled: true,
          reminder_time: '21:30',
          current_streak: 0,
          longest_streak: 0,
          last_logged_date: null,
          onboarding_completed: newProfile.onboarding_completed!,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        };
        setProfile(created);
        syncProfileToStore(created);
        pendingOnboardingRef.current = null;
      }
    } catch {
      setProfile(null);
    }
  }, [user, syncProfileToStore]);

  useEffect(() => {
    let cancelled = false;

    async function init() {
      try {
        const session = await getCurrentSession();
        if (cancelled) return;

        if (session?.user) {
          setUser(session.user);
        }
      } catch (err) {
        if (!cancelled) {
          setError(err instanceof Error ? err : new Error('Authentication failed'));
        }
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    }

    init();

    unsubscribeRef.current = onAuthStateChange((updatedUser) => {
      if (!cancelled) {
        setUser(updatedUser);
      }
    });

    return () => {
      cancelled = true;
      unsubscribeRef.current?.();
    };
  }, []);

  useEffect(() => {
    refreshProfile();
  }, [user, refreshProfile]);

  const handleSignOut = useCallback(async () => {
    try {
      useFinanceStore.getState().resetAllData();
      useFinanceStore.persist.clearStorage();
      await signOutUser();
      setUser(null);
      setProfile(null);
    } catch (err) {
      setError(err instanceof Error ? err : new Error('Sign out failed'));
    }
  }, []);

  const handleSignIn = useCallback(async (email: string, password: string) => {
    setError(null);
    const { data, error: signInError } = await signInWithEmail(email, password).then(
      data => ({ data, error: null }),
      error => ({ data: null, error })
    );
    if (signInError) {
      setError(signInError instanceof Error ? signInError : new Error(signInError.message));
      throw signInError;
    }
    if (data?.user) {
      setUser(data.user);
    }
  }, []);

  const handleSignUp = useCallback(async (email: string, password: string, onboarding: OnboardingData) => {
    setError(null);
    pendingOnboardingRef.current = onboarding;
    const { data, error: signUpError } = await signUpWithEmail(email, password, onboarding.displayName).then(
      data => ({ data, error: null }),
      error => ({ data: null, error })
    );
    if (signUpError) {
      pendingOnboardingRef.current = null;
      setError(signUpError instanceof Error ? signUpError : new Error(signUpError.message));
      throw signUpError;
    }
    if (data?.user) {
      setUser(data.user);
    }
  }, []);

  const handleGoogleSignIn = useCallback(async () => {
    setError(null);
    try {
      await signInWithGoogle();
    } catch (err) {
      setError(err instanceof Error ? err : new Error('Google sign-in failed'));
      throw err;
    }
  }, []);

  return {
    user,
    userId: user?.id ?? null,
    profile,
    loading,
    error,
    signOut: handleSignOut,
    signIn: handleSignIn,
    signUp: handleSignUp,
    signInWithGoogle: handleGoogleSignIn,
    refreshProfile,
  };
}
