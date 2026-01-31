"use client";

// 피드 목록 상태·UI 바인딩 (Phase 2.7, 2.8): getMatchingPosts(filters) → 상태 → FeedList

import { createClient } from "@/lib/supabase/client";
import { getMatchingPosts, type FeedFilters } from "@/lib/supabase/queries/matching-posts";
import { feedItemToUserProfile } from "@/lib/types";
import type { UserProfile } from "@/lib/types";
import { useCallback, useEffect, useState } from "react";
import { useAuth } from "./use-auth";

export function useMatchingFeed(filters?: FeedFilters): {
  profiles: UserProfile[];
  loading: boolean;
  error: Error | null;
  refetch: () => Promise<void>;
} {
  const { user } = useAuth();
  const [profiles, setProfiles] = useState<UserProfile[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  const fetchFeed = useCallback(async () => {
    if (!user?.id) {
      setProfiles([]);
      setLoading(false);
      return;
    }
    setLoading(true);
    setError(null);
    try {
      const supabase = createClient();
      const { data, error: err } = await getMatchingPosts(supabase, {
        filters,
        excludeUserId: user.id,
      });
      if (err) throw err;
      setProfiles((data ?? []).map(feedItemToUserProfile));
    } catch (e) {
      setError(e instanceof Error ? e : new Error(String(e)));
      setProfiles([]);
    } finally {
      setLoading(false);
    }
  }, [user?.id, JSON.stringify(filters ?? {})]);

  useEffect(() => {
    void fetchFeed();
  }, [fetchFeed]);

  return { profiles, loading, error, refetch: fetchFeed };
}
