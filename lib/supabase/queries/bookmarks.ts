// 찜하기 관련 데이터베이스 쿼리 함수 (Phase 2)

import type { PostgrestError } from "@supabase/supabase-js";
import type { SupabaseClient } from "@supabase/supabase-js";
import type { BookmarkRow } from "@/types/database";
import type { MatchingPostRow } from "@/types/database";
import type { ProfileRow } from "@/types/database";

export interface BookmarkWithPostAndProfile {
  bookmark: BookmarkRow;
  matching_post: MatchingPostRow;
  profile: ProfileRow;
}

/**
 * 찜 목록 조회 (Phase 2.9)
 * auth.uid() → bookmarks WHERE user_id → matching_posts 조인 후 profiles 별도 조회
 * RLS: 본인만 SELECT
 */
export async function getBookmarks(
  supabase: SupabaseClient,
  userId: string
): Promise<{ data: BookmarkWithPostAndProfile[]; error: PostgrestError | null }> {
  const { data: bookmarkRows, error } = await supabase
    .from("bookmarks")
    .select("*, matching_posts(*)")
    .eq("user_id", userId)
    .order("created_at", { ascending: false });

  if (error || !bookmarkRows?.length) return { data: [], error: error ?? null };

  const posts = bookmarkRows
    .map((r) => (r as { matching_posts: MatchingPostRow | null }).matching_posts)
    .filter((p): p is MatchingPostRow => p != null);
  const userIds = [...new Set(posts.map((p) => p.user_id))];

  const { data: profiles } = await supabase
    .from("profiles")
    .select("*")
    .in("id", userIds);
  const profileMap = new Map<string, ProfileRow>();
  (profiles ?? []).forEach((p) => profileMap.set(p.id, p as ProfileRow));

  const items: BookmarkWithPostAndProfile[] = bookmarkRows
    .map((r) => {
      const row = r as BookmarkRow & { matching_posts: MatchingPostRow | null };
      const post = row.matching_posts;
      const profile = post ? profileMap.get(post.user_id) : null;
      if (!post || !profile) return null;
      return {
        bookmark: {
          id: row.id,
          user_id: row.user_id,
          post_id: row.post_id,
          created_at: row.created_at,
        },
        matching_post: post,
        profile,
      };
    })
    .filter((x): x is BookmarkWithPostAndProfile => x != null);

  return { data: items, error: null };
}

/**
 * 찜 추가 (Phase 2.10)
 * UNIQUE(user_id, post_id) → ON CONFLICT DO NOTHING 또는 upsert
 */
export async function createBookmark(
  supabase: SupabaseClient,
  userId: string,
  postId: string
): Promise<{ error: PostgrestError | null }> {
  const { error } = await supabase.from("bookmarks").insert({
    user_id: userId,
    post_id: postId,
  });
  return { error: error ?? null };
}

/**
 * 찜 삭제 (Phase 2.11)
 */
export async function deleteBookmark(
  supabase: SupabaseClient,
  userId: string,
  postId: string
): Promise<{ error: PostgrestError | null }> {
  const { error } = await supabase
    .from("bookmarks")
    .delete()
    .eq("user_id", userId)
    .eq("post_id", postId);
  return { error: error ?? null };
}
