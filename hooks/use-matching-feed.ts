"use client";

// 피드 목록 상태·UI 바인딩: getMatchingPosts(filters) → calculateMatchScore → 상태 → FeedList

import { createClient } from "@/lib/supabase/client";
import { getMatchingPosts, type FeedFilters } from "@/lib/supabase/queries/matching-posts";
import { getProfile } from "@/lib/supabase/queries/profiles";
import { feedItemToUserProfile } from "@/lib/types";
import type { UserProfile } from "@/lib/types";
import { calculateMatchScore } from "@/lib/matching/calculate-match-score";
import { getMatchingTags } from "@/lib/matching/get-matching-tags";
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
      const [postsResult, viewerProfile] = await Promise.all([
        getMatchingPosts(supabase, { filters, excludeUserId: user.id }),
        getProfile(supabase, user.id),
      ]);
      if (postsResult.error) throw postsResult.error;
      const items = postsResult.data ?? [];

      const profilesWithScore: UserProfile[] = items.map((item) => {
        const profile = feedItemToUserProfile(item);
        const matchScore = calculateMatchScore(viewerProfile, item.profile);
        const matchTags = getMatchingTags(viewerProfile, item.profile);
        return {
          ...profile,
          matchScore: matchScore ?? undefined,
          matchTags: matchTags.length > 0 ? matchTags : undefined,
        };
      });

      setProfiles(profilesWithScore);
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
