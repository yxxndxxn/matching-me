// 프로필 관련 데이터베이스 쿼리 함수

import type { PostgrestError } from "@supabase/supabase-js";
import type { SupabaseClient } from "@supabase/supabase-js";
import type { ProfileInsert, ProfileRow, ProfileUpdate } from "@/types/database";

/** 프로필 존재 여부 조회 결과 (에러 시 온보딩 리다이렉트 방지용) */
export type HasProfileResult = { exists: boolean; error: PostgrestError | null };

/**
 * 프로필 존재 여부 조회 (Phase 1.10)
 * auth.uid() → profiles id = uid 1건 SELECT → 존재 여부 + 에러 구분 (쿼리 실패 시 온보딩으로 보내지 않음)
 */
export async function hasProfile(
  supabase: SupabaseClient,
  userId: string
): Promise<HasProfileResult> {
  const { data, error } = await supabase
    .from("profiles")
    .select("id")
    .eq("id", userId)
    .maybeSingle();
  const exists = !error && data != null;
  return { exists: !!exists, error: error ?? null };
}

/**
 * 프로필 단건 조회 (Phase 2.1)
 * userId → profiles SELECT by id → ProfileRow | null
 */
export async function getProfile(
  supabase: SupabaseClient,
  userId: string
): Promise<ProfileRow | null> {
  const { data, error } = await supabase
    .from("profiles")
    .select("*")
    .eq("id", userId)
    .single();
  if (error || !data) return null;
  return data as ProfileRow;
}

/**
 * 프로필 생성 (Phase 2.2) - 온보딩 제출
 * id = auth.uid(), RLS: 본인만 INSERT
 */
export async function createProfile(
  supabase: SupabaseClient,
  data: ProfileInsert
): Promise<{ error: PostgrestError | null }> {
  const { error } = await supabase.from("profiles").insert(data);
  return { error: error ?? null };
}

/**
 * 프로필 수정 (Phase 2.4)
 * userId + 부분 필드 → profiles UPDATE, RLS: 본인만 UPDATE
 */
export async function updateProfile(
  supabase: SupabaseClient,
  userId: string,
  data: ProfileUpdate
): Promise<{ error: PostgrestError | null }> {
  const { error } = await supabase
    .from("profiles")
    .update(data)
    .eq("id", userId);
  return { error: error ?? null };
}
