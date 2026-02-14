"use client";

// 피드 목록 상태·UI 바인딩: getMatchingPosts(filters) → calculateMatchScore → 상태 → FeedList

import { createClient } from "@/lib/supabase/client";
import { getMatchingPosts, type FeedFilters } from "@/lib/supabase/queries/matching-posts";
import { getProfile } from "@/lib/supabase/queries/profiles";
import { feedItemToUserProfile } from "@/lib/types";
import type { UserProfile } from "@/lib/types";
import { calculateMatchScore } from "@/lib/matching/calculate-match-score";
import { getMatchingTags } from "@/lib/matching/get-matching-tags";
import { useCallback, useEffect, useRef, useState } from "react";
import { useAuth } from "./use-auth";

const PAGE_SIZE = 12;
const FETCH_ALL_PAGE_SIZE = 9999;

export function useMatchingFeed(filters?: FeedFilters, options?: { fetchAll?: boolean }): {
  profiles: UserProfile[];
  loading: boolean;
  error: Error | null;
  refetch: () => Promise<void>;
  page: number;
  setPage: (page: number) => void;
  totalPages: number;
  totalCount: number;
  pageSize: number;
  fetchAll: boolean;
} {
  const fetchAll = options?.fetchAll ?? false;
  const { user } = useAuth();
  const [profiles, setProfiles] = useState<UserProfile[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);
  const [page, setPage] = useState(1);
  const [totalCount, setTotalCount] = useState(0);
  const prevFiltersKeyRef = useRef(JSON.stringify(filters ?? {}));

  const fetchFeed = useCallback(async () => {
    if (!user?.id) {
      setProfiles([]);
      setTotalCount(0);
      setLoading(false);
      return;
    }
    const filtersKey = JSON.stringify(filters ?? {});
    const filtersChanged = prevFiltersKeyRef.current !== filtersKey;
    if (filtersChanged) {
      prevFiltersKeyRef.current = filtersKey;
      setPage(1);
    }
    const pageToFetch = filtersChanged ? 1 : page;
    const pageSize = fetchAll ? FETCH_ALL_PAGE_SIZE : PAGE_SIZE;

    setLoading(true);
    setError(null);
    try {
      const supabase = createClient();
      const [postsResult, viewerProfile] = await Promise.all([
        getMatchingPosts(supabase, {
          filters,
          excludeUserId: user.id,
          page: fetchAll ? 1 : pageToFetch,
          pageSize,
        }),
        getProfile(supabase, user.id),
      ]);
      if (postsResult.error) throw postsResult.error;
      const items = postsResult.data ?? [];
      setTotalCount(postsResult.totalCount ?? 0);

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
      setTotalCount(0);
    } finally {
      setLoading(false);
    }
  }, [user?.id, JSON.stringify(filters ?? {}), page, fetchAll]);

  useEffect(() => {
    void fetchFeed();
  }, [fetchFeed]);

  const totalPages = fetchAll ? 1 : Math.max(1, Math.ceil(totalCount / PAGE_SIZE));

  return {
    profiles,
    loading,
    error,
    refetch: fetchFeed,
    page,
    setPage,
    totalPages,
    totalCount,
    pageSize: PAGE_SIZE,
    fetchAll,
  };
}
