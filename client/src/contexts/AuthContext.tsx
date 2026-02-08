import React, { createContext, useContext, useEffect, useState, useMemo, useCallback } from "react";
import { authClient } from "../../../lib/auth-client";

export interface AuthUser {
  id: string;
  email: string;
  name: string | null;
  image?: string | null;
}

interface AuthContextType {
  user: AuthUser | null;
  loading: boolean;
  credits: number | null;
  refreshCredits: () => Promise<void>;
  signOut: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [loading, setLoading] = useState(true);
  const [credits, setCredits] = useState<number | null>(null);

  // Fetch session on mount
  useEffect(() => {
    authClient.getSession().then(({ data }) => {
      if (data?.user) {
        setUser(data.user as AuthUser);
      }
      setLoading(false);
    }).catch(() => {
      setLoading(false);
    });
  }, []);

  // Fetch credits when user changes
  const refreshCredits = useCallback(async () => {
    if (!user) {
      setCredits(null);
      return;
    }
    try {
      const res = await fetch("/api/credits/balance", { credentials: "include" });
      const data = await res.json();
      if (data.success) {
        setCredits(data.credits);
      }
    } catch {
      // Silently fail — credits will show as null
    }
  }, [user]);

  useEffect(() => {
    if (user) {
      refreshCredits();
    } else {
      setCredits(null);
    }
  }, [user, refreshCredits]);

  const handleSignOut = useCallback(async () => {
    await authClient.signOut();
    setUser(null);
    setCredits(null);
  }, []);

  // Listen to auth state changes from better-auth
  useEffect(() => {
    // better-auth/react useSession doesn't emit events in non-hook mode,
    // so we rely on manual state updates from login/signup pages
  }, []);

  const value = useMemo(
    () => ({ user, loading, credits, refreshCredits, signOut: handleSignOut }),
    [user, loading, credits, refreshCredits, handleSignOut]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within AuthProvider");
  }
  return context;
}

/**
 * Update the auth state after login/signup. Call this from Login/Signup pages
 * after a successful auth operation, since we can't use better-auth's reactive
 * session inside the context (it would cause circular re-renders).
 */
export function useAuthActions() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuthActions must be used within AuthProvider");
  }

  const setUser = useCallback(async () => {
    const { data } = await authClient.getSession();
    if (data?.user) {
      // Trigger a re-render by updating the context indirectly
      window.location.reload();
    }
  }, []);

  return { setUser };
}
