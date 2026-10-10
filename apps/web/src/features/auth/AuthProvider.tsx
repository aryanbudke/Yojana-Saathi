"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import type { User } from "@supabase/supabase-js";
import type { ProfileFacts } from "@/lib/api/contracts";
import {
  getSupabaseBrowserClient,
  isSupabaseConfigured,
} from "@/lib/supabase/client";

export type StoredYojanaProfile = {
  version: 1;
  facts: ProfileFacts;
  confirmed_at: string;
};

type AuthContextValue = {
  user: User | null;
  loading: boolean;
  signOut: () => Promise<void>;
  saveProfileFacts: (facts: ProfileFacts) => Promise<void>;
  clearProfileFacts: () => Promise<void>;
};

const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(isSupabaseConfigured);

  useEffect(() => {
    const supabase = getSupabaseBrowserClient();
    if (!supabase) return;

    let active = true;
    void supabase.auth.getUser().then(({ data }) => {
      if (!active) return;
      setUser(data.user ?? null);
      setLoading(false);
    });

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      if (!active) return;
      setUser(session?.user ?? null);
      setLoading(false);
    });

    return () => {
      active = false;
      subscription.unsubscribe();
    };
  }, []);

  const signOut = useCallback(async () => {
    const supabase = getSupabaseBrowserClient();
    if (!supabase) return;
    const { error } = await supabase.auth.signOut();
    if (error) throw error;
    setUser(null);
  }, []);

  const saveProfileFacts = useCallback(async (facts: ProfileFacts) => {
    const supabase = getSupabaseBrowserClient();
    if (!supabase) throw new Error("Supabase Auth is not configured");

    const profile: StoredYojanaProfile = {
      version: 1,
      facts,
      confirmed_at: new Date().toISOString(),
    };
    const { data, error } = await supabase.auth.updateUser({
      data: { yojana_profile: profile },
    });
    if (error) throw error;
    setUser(data.user);
  }, []);

  const clearProfileFacts = useCallback(async () => {
    const supabase = getSupabaseBrowserClient();
    if (!supabase) throw new Error("Supabase Auth is not configured");
    const { data, error } = await supabase.auth.updateUser({
      data: { yojana_profile: null },
    });
    if (error) throw error;
    setUser(data.user);
  }, []);

  const value = useMemo(
    () => ({ user, loading, signOut, saveProfileFacts, clearProfileFacts }),
    [user, loading, signOut, saveProfileFacts, clearProfileFacts],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth(): AuthContextValue {
  const value = useContext(AuthContext);
  if (!value) throw new Error("AuthProvider is missing");
  return value;
}
