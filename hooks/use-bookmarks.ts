"use client";

// 찜 목록·추가·삭제 (Phase 2.9–2.12): getBookmarks, createBookmark, deleteBookmark → 상태

import { createClient } from "@/lib/supabase/client";
import {
  createBookmark as createBookmarkQuery,
  deleteBookmark as deleteBookmarkQuery,
  getBookmarks as getBookmarksQuery,
} from "@/lib/supabase/queries/bookmarks";
import { profileRowToUserProfile } from "@/lib/types";
import type { UserProfile } from "@/lib/types";
import { useCallback, useEffect, useState } from "react";
import { useAuth } from "./use-auth";

export function useBookmarks(): {
  bookmarks: UserProfile[];
  loading: boolean;
  error: Error | null;
  refetch: () => Promise<void>;
  add: (postId: string) => Promise<{ error: Error | null }>;
  remove: (postId: string) => Promise<{ error: Error | null }>;
  isBookmarked: (postId: string) => boolean;
} {
  const { user } = useAuth();
  const [bookmarks, setBookmarks] = useState<UserProfile[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  const fetchBookmarks = useCallback(async () => {
    if (!user?.id) {
      setBookmarks([]);
      setLoading(false);
      return;
    }
    setLoading(true);
    setError(null);
    try {
      const supabase = createClient();
      const { data, error: err } = await getBookmarksQuery(supabase, user.id);
      if (err) throw err;
      setBookmarks(
        (data ?? []).map((item) =>
          profileRowToUserProfile(item.profile, { id: item.matching_post.id, matchScore: item.matching_post.match_score ?? undefined })
        )
      );
    } catch (e) {
      setError(e instanceof Error ? e : new Error(String(e)));
      setBookmarks([]);
    } finally {
      setLoading(false);
    }
  }, [user?.id]);

  useEffect(() => {
    void fetchBookmarks();
  }, [fetchBookmarks]);

  const add = useCallback(
    async (postId: string) => {
      if (!user?.id) return { error: new Error("Not authenticated") };
      const supabase = createClient();
      const { error: err } = await createBookmarkQuery(supabase, user.id, postId);
      if (!err) void fetchBookmarks();
      return { error: err ?? null };
    },
    [user?.id, fetchBookmarks]
  );

  const remove = useCallback(
    async (postId: string) => {
      if (!user?.id) return { error: new Error("Not authenticated") };
      const supabase = createClient();
      const { error: err } = await deleteBookmarkQuery(supabase, user.id, postId);
      if (!err) void fetchBookmarks();
      return { error: err ?? null };
    },
    [user?.id, fetchBookmarks]
  );

  const isBookmarked = useCallback(
    (postId: string) => bookmarks.some((p) => p.id === postId),
    [bookmarks]
  );

  return {
    bookmarks,
    loading,
    error,
    refetch: fetchBookmarks,
    add,
    remove,
    isBookmarked,
  };
}
