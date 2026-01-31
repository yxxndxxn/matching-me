// 조회 로그 및 일일 조회권 관련 (Phase 2)

import type { PostgrestError } from "@supabase/supabase-js";
import type { SupabaseClient } from "@supabase/supabase-js";

const MAX_DAILY_REVEALS = 3;

/**
 * 일일 조회권 남은 횟수 (Phase 2.13)
 * auth.uid() + CURRENT_DATE → daily_limits SELECT → reveals_used → 3 - reveals_used
 */
export async function getRemainingReveals(
  supabase: SupabaseClient,
  userId: string
): Promise<{ remaining: number; error: PostgrestError | null }> {
  const today = new Date().toISOString().slice(0, 10);
  const { data, error } = await supabase
    .from("daily_limits")
    .select("reveals_used")
    .eq("user_id", userId)
    .eq("limit_date", today)
    .maybeSingle();

  if (error) return { remaining: MAX_DAILY_REVEALS, error };
  if (!data) return { remaining: MAX_DAILY_REVEALS, error: null };
  const used = (data as { reveals_used: number }).reveals_used ?? 0;
  return { remaining: Math.max(0, MAX_DAILY_REVEALS - used), error: null };
}

/**
 * 이미 해당 글에 대해 연락처를 공개했는지 여부
 */
export async function hasRevealedContact(
  supabase: SupabaseClient,
  viewerId: string,
  viewedPostId: string
): Promise<boolean> {
  const { data, error } = await supabase
    .from("view_logs")
    .select("id")
    .eq("viewer_id", viewerId)
    .eq("viewed_post_id", viewedPostId)
    .eq("contact_revealed", true)
    .limit(1);
  return !error && Array.isArray(data) && data.length > 0;
}

/**
 * 현재 사용자가 연락처를 이미 공개한 글 ID 목록 (버튼 숨김·이미 공개 상태 표시용)
 */
export async function getRevealedPostIds(
  supabase: SupabaseClient,
  userId: string
): Promise<{ postIds: string[]; error: PostgrestError | null }> {
  const { data, error } = await supabase
    .from("view_logs")
    .select("viewed_post_id")
    .eq("viewer_id", userId)
    .eq("contact_revealed", true);
  if (error) return { postIds: [], error };
  const postIds = (data ?? []).map((r) => String((r as { viewed_post_id: string }).viewed_post_id));
  return { postIds, error: null };
}

/**
 * 연락처 공개 시 view_logs INSERT (Phase 2.14 - 로그 부분)
 */
export async function createViewLog(
  supabase: SupabaseClient,
  viewerId: string,
  viewedPostId: string,
  contactRevealed: boolean
): Promise<{ error: PostgrestError | null }> {
  const { error } = await supabase.from("view_logs").insert({
    viewer_id: viewerId,
    viewed_post_id: viewedPostId,
    contact_revealed: contactRevealed,
  });
  return { error: error ?? null };
}

/**
 * daily_limits UPSERT: reveals_used + 1, 상한 3 (Phase 2.14 - 조회권 차감)
 * ON CONFLICT (user_id, limit_date) DO UPDATE
 */
export async function incrementRevealsUsed(
  supabase: SupabaseClient,
  userId: string
): Promise<{ error: PostgrestError | null }> {
  const today = new Date().toISOString().slice(0, 10);
  const { data: existing } = await supabase
    .from("daily_limits")
    .select("reveals_used")
    .eq("user_id", userId)
    .eq("limit_date", today)
    .maybeSingle();

  const nextUsed = existing
    ? Math.min(MAX_DAILY_REVEALS, (existing as { reveals_used: number }).reveals_used + 1)
    : 1;

  const { error } = await supabase.from("daily_limits").upsert(
    {
      user_id: userId,
      limit_date: today,
      reveals_used: nextUsed,
      updated_at: new Date().toISOString(),
    },
    { onConflict: "user_id,limit_date" }
  );
  return { error: error ?? null };
}
