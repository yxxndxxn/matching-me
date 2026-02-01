// pair_ai_summaries 테이블 쿼리 - (viewer, target) 쌍별 AI 요약 캐싱

import type { SupabaseClient } from "@supabase/supabase-js";
import type { PairAiSummaryRow } from "@/types/database";

/**
 * 캐시된 쌍별 AI 요약 조회
 */
export async function getPairSummary(
  supabase: SupabaseClient,
  viewerId: string,
  targetPostId: string
): Promise<{ data: PairAiSummaryRow | null; error: unknown }> {
  const { data, error } = await supabase
    .from("pair_ai_summaries")
    .select("*")
    .eq("viewer_id", viewerId)
    .eq("target_post_id", targetPostId)
    .maybeSingle();
  return {
    data: (data as PairAiSummaryRow | null) ?? null,
    error: error ?? null,
  };
}

/**
 * 쌍별 AI 요약 저장 (캐시)
 */
export async function upsertPairSummary(
  supabase: SupabaseClient,
  viewerId: string,
  targetPostId: string,
  aiSummary: string
): Promise<{ error: unknown }> {
  const { error } = await supabase.from("pair_ai_summaries").upsert(
    {
      viewer_id: viewerId,
      target_post_id: targetPostId,
      ai_summary: aiSummary,
    },
    {
      onConflict: "viewer_id,target_post_id",
    }
  );
  return { error: error ?? null };
}
