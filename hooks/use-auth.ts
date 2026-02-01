"use client";

// 세션 상태 훅: getSession() + onAuthStateChange → user / session / signOut → 컴포넌트에서 사용

import { createClient } from "@/lib/supabase/client";
import { useRouter } from "next/navigation";
import { useCallback, useEffect, useState } from "react";
import type { Session, User } from "@supabase/supabase-js";

export function useAuth() {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    const supabase = createClient();

    void supabase.auth.getSession().then(({ data: { session: initialSession } }) => {
      setSession(initialSession ?? null);
      setUser(initialSession?.user ?? null);
      setLoading(false);
    });

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
      router.push(redirectTo ?? "/");
      router.refresh();
    },
    [router]
  );

  return { user, session, loading, signOut };
}
