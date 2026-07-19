import { supabase } from './supabase';
import type { User, Session } from '@supabase/supabase-js';

export interface UserProfile {
  id: string;
  email: string;
  display_name: string;
  currency: string;
  monthly_savings_goal: number;
  category_threshold: number;
  reminder_enabled: boolean;
  reminder_time: string;
  current_streak: number;
  longest_streak: number;
  last_logged_date: string | null;
  created_at: string;
  updated_at: string;
}

export async function getCurrentSession(): Promise<Session | null> {
  const { data } = await supabase.auth.getSession();
  return data.session;
}

export async function getCurrentUser(): Promise<User | null> {
  const { data } = await supabase.auth.getUser();
  return data.user;
}

export async function signInWithEmail(email: string, password: string) {
  const { data, error } = await supabase.auth.signInWithPassword({ email, password });
  if (error) throw error;
  return data;
}

export async function signUpWithEmail(email: string, password: string, displayName: string) {
  const { data, error } = await supabase.auth.signUp({
    email,
    password,
    options: { data: { display_name: displayName } }
  });
  if (error) throw error;
  return data;
}

export async function signInWithGoogle() {
  const { data, error } = await supabase.auth.signInWithOAuth({
    provider: 'google',
    options: { redirectTo: window.location.origin }
  });
  if (error) throw error;
  return data;
}

export async function signOutUser(): Promise<void> {
  const { error } = await supabase.auth.signOut();
  if (error) throw error;
}

export async function updatePassword(newPassword: string): Promise<void> {
  const { error } = await supabase.auth.updateUser({ password: newPassword });
  if (error) throw error;
}

export async function signInAnonymously(): Promise<User> {
  const { data, error } = await supabase.auth.signInAnonymously();

  if (error) throw error;

  if (!data.user) {
    throw new Error("Anonymous sign-in failed.");
  }

  return data.user;
}

export async function createProfile(profile: {
  id: string;
  display_name: string;
  email: string;
}): Promise<void> {
  const { error } = await supabase.from('users').upsert(
    {
      id: profile.id,
      email: profile.email,
      display_name: profile.display_name,
    },
    { onConflict: 'id' }
  );
  if (error) throw error;
}

export async function getProfile(userId: string): Promise<UserProfile | null> {
  const { data, error } = await supabase
    .from('users')
    .select('*')
    .eq('id', userId)
    .single();
  if (error && error.code === 'PGRST116') return null;
  if (error) throw error;
  return data;
}

export async function updateProfile(userId: string, updates: any): Promise<void> {
  console.log("Updating user:", userId);
  console.log("Updates:", updates);

  const { data, error, status } = await supabase
    .from("users")
    .update(updates)
    .eq("id", userId)
    .select();

  console.log("Status:", status);
  console.log("Returned rows:", data);
  console.log("Error:", error);

  if (error) throw error;
}

export function onAuthStateChange(
  callback: (user: User | null) => void
): () => void {
  const { data } = supabase.auth.onAuthStateChange((_event, session) => {
    callback(session?.user ?? null);
  });
  return () => data.subscription.unsubscribe();
}
