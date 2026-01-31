"use client";

// 마이페이지 프로필 바인딩 (Phase 2.5): session.user.id → getProfile(uid) → 상태

import { createClient } from "@/lib/supabase/client";
import { getProfile } from "@/lib/supabase/queries/profiles";
import { profileRowToUserProfile } from "@/lib/types";
import type { UserProfile } from "@/lib/types";
import { useCallback, useEffect, useState } from "react";
import { useAuth } from "./use-auth";

export function useProfile(): {
  profile: UserProfile | null;
  loading: boolean;
  error: Error | null;
  refetch: () => Promise<void>;
} {
  const { user } = useAuth();
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  const fetchProfile = useCallback(async () => {
    if (!user?.id) {
      setProfile(null);
      setLoading(true);
      return;
    }
    setLoading(true);
    setError(null);
    try {
      const supabase = createClient();
      const row = await getProfile(supabase, user.id);
      setProfile(row ? profileRowToUserProfile(row) : null);
    } catch (e) {
      setError(e instanceof Error ? e : new Error(String(e)));
      setProfile(null);
    } finally {
      setLoading(false);
    }
  }, [user?.id]);

  useEffect(() => {
    void fetchProfile();
  }, [fetchProfile]);

  return { profile, loading, error, refetch: fetchProfile };
}
