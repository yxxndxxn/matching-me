"use client";

// 세션 상태 훅: getSession() + onAuthStateChange → user / session / signOut → 컴포넌트에서 사용

import { createClient } from "@/lib/supabase/client";
import { useAuthInitial } from "@/components/providers/auth-initial-provider";
import { useRouter } from "next/navigation";
import { useCallback, useEffect, useState } from "react";
import type { Session, User } from "@supabase/supabase-js";

export function useAuth() {
  const initialUser = useAuthInitial();
  const [user, setUser] = useState<User | null>(initialUser ?? null);
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(initialUser == null);
  const router = useRouter();

  useEffect(() => {
    const supabase = createClient();

    void supabase.auth
      .getSession()
      .then((res: { data: { session: Session | null } }) => {
        const initialSession = res.data.session;
        setSession(initialSession ?? null);
        setUser(initialSession?.user ?? null);
      })
      .catch(() => {
        setSession(null);
        setUser(null);
      })
      .finally(() => setLoading(false));

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, newSession) => {
      setSession(newSession ?? null);
      setUser(newSession?.user ?? null);
    });

    return () => subscription.unsubscribe();
  }, []);

  const signOut = useCallback(
    async (redirectTo?: string) => {
      const supabase = createClient();
      await supabase.auth.signOut();
      router.push(redirectTo ?? "/login");
      router.refresh();
    },
    [router]
  );

  return { user, session, loading, signOut };
}
