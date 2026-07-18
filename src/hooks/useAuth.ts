import { useState, useEffect, useCallback, useRef } from 'react';
import type { User } from '@supabase/supabase-js';
import { getCurrentSession, signInAnonymously, signOut, onAuthStateChange } from '../lib/auth';

export interface AuthState {
  user: User | null;
  userId: string | null;
  loading: boolean;
  error: Error | null;
  signOut: () => Promise<void>;
}

export function useAuth(): AuthState {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);
  const unsubscribeRef = useRef<(() => void) | null>(null);

  useEffect(() => {

    let cancelled = false;

    async function init() {
  try {


    const session = await getCurrentSession();


    if (cancelled) return;

    if (session?.user) {

      setUser(session.user);
      setLoading(false);
      return;
    }

    const anonymousUser = await signInAnonymously();

    if (cancelled) return;

    setUser(anonymousUser);
    setLoading(false);

  } catch (err) {
    if (cancelled) return;

    setError(
      err instanceof Error
        ? err
        : new Error("Authentication failed")
    );

    setLoading(false);
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

  const handleSignOut = useCallback(async () => {
    try {
      await signOut();
      setUser(null);
    } catch (err) {
      setError(err instanceof Error ? err : new Error('Sign out failed'));
    }
  }, []);

  return {
    user,
    userId: user?.id ?? null,
    loading,
    error,
    signOut: handleSignOut,
  };
}
