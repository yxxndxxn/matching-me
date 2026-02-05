// 매칭 게시글 관련 데이터베이스 쿼리 함수

import type { PostgrestError } from "@supabase/supabase-js";
import type { SupabaseClient } from "@supabase/supabase-js";
import type { MatchingPostInsert, MatchingPostRow } from "@/types/database";
import type { ProfileRow } from "@/types/database";

export interface FeedFilters {
  dormitory?: string;
  gender?: string;
  major_category?: string;
  grade?: string;
  smoking?: string;
}

export interface FeedItem {
  post: MatchingPostRow;
  profile: ProfileRow;
}

export interface GetMatchingPostsOptions {
  filters?: FeedFilters;
  /** 대시보드 피드에서 제외할 사용자 ID (본인 제외용) */
  excludeUserId?: string;
}

/**
 * 피드 목록 조회 (Phase 2.6) - 소속관 격리
 * RLS: 동일 dormitory & is_active = true만 조회
 * matching_posts + profiles 조인 (두 쿼리로 수행)
 * excludeUserId 가 있으면 해당 사용자의 게시글은 결과에서 제외 (본인 정보가 피드에 나오지 않도록)
 */
export async function getMatchingPosts(
  supabase: SupabaseClient,
  options?: FeedFilters | GetMatchingPostsOptions
): Promise<{ data: FeedItem[]; error: PostgrestError | null }> {
  const filters: FeedFilters | undefined =
    options && "filters" in options ? options.filters : (options as FeedFilters | undefined);
  const excludeUserId = options && "excludeUserId" in options ? options.excludeUserId : undefined;

  const { data: posts, error: postsError } = await supabase
    .from("matching_posts")
    .select("*")
    .eq("is_active", true)
    .order("created_at", { ascending: false });

  if (postsError || !posts || posts.length === 0) {
    return { data: [], error: postsError ?? null };
  }

  let postList = posts as MatchingPostRow[];
  if (excludeUserId) {
    postList = postList.filter((p) => p.user_id !== excludeUserId);
  }
  if (postList.length === 0) {
    return { data: [], error: null };
  }

  const userIds = [...new Set(postList.map((p) => p.user_id))];
  const { data: profiles, error: profilesError } = await supabase
    .from("profiles")
    .select("*")
    .in("id", userIds);

  if (profilesError) return { data: [], error: profilesError };
  const profileMap = new Map<string, ProfileRow>();
  (profiles ?? []).forEach((p) => profileMap.set(p.id, p as ProfileRow));

  let items: FeedItem[] = postList
    .map((post) => {
      const profile = profileMap.get(post.user_id);
      return profile ? { post, profile } : null;
    })
    .filter((x): x is FeedItem => x != null);

  if (filters) {
    if (filters.dormitory && filters.dormitory !== "all")
      items = items.filter((i) => i.profile.dormitory === filters.dormitory);
    if (filters.gender && filters.gender !== "all")
      items = items.filter((i) => i.profile.gender === filters.gender);
    if (filters.major_category && filters.major_category !== "all")
      items = items.filter((i) => i.profile.major_category === filters.major_category);
    if (filters.grade && filters.grade !== "all")
      items = items.filter((i) => i.profile.grade === filters.grade);
    if (filters.smoking && filters.smoking !== "all")
      items = items.filter((i) =>
        filters.smoking === "smoker" ? i.profile.smoking : !i.profile.smoking
      );
  }

  return { data: items, error: null };
}

/**
 * 매칭 게시글 1건 생성 (Phase 2.3) - 온보딩 완료 시
 * RLS: 본인만 INSERT
 */
export async function createMatchingPost(
  supabase: SupabaseClient,
  data: MatchingPostInsert
): Promise<{ error: PostgrestError | null }> {
  const { error } = await supabase.from("matching_posts").insert(data);
  return { error: error ?? null };
}

/**
 * 매칭 게시글 단건 조회 (post id 기준)
 */
export async function getMatchingPostById(
  supabase: SupabaseClient,
  postId: string
): Promise<{ data: MatchingPostRow | null; error: PostgrestError | null }> {
  const { data, error } = await supabase
    .from("matching_posts")
    .select("*")
    .eq("id", postId)
    .single();
  return { data: (data as MatchingPostRow) ?? null, error: error ?? null };
}
