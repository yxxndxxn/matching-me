"use server";

/**
 * 온보딩 완료 Server Action
 * profiles + matching_posts 저장 후 즉시 성공 반환.
 * AI 요약은 대시보드 진입 후 /api/onboarding/backfill-ai-summary 에서 백그라운드로 채움.
 */

import { createClient } from "@/lib/supabase/server";
import { createProfile, hasProfile } from "@/lib/supabase/queries/profiles";
import { createMatchingPost } from "@/lib/supabase/queries/matching-posts";
import type { OnboardingFormData } from "@/components/onboarding";

export type CompleteOnboardingResult =
  | { success: true }
  | { success: false; error: string };

export async function completeOnboarding(
  data: OnboardingFormData
): Promise<CompleteOnboardingResult> {
  try {
    const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) {
    return { success: false, error: "로그인이 필요해요." };
  }

  const { exists: alreadyHasProfile } = await hasProfile(supabase, user.id);
  if (alreadyHasProfile) {
    return { success: true }; // 이미 있으면 성공으로 처리 (리다이렉트는 클라이언트)
  }

  const googleAvatarUrl =
    (user.user_metadata?.avatar_url as string | undefined) ??
    (user.user_metadata?.picture as string | undefined) ??
    null;

  const profileInsert = {
    id: user.id,
    name: data.name,
    gender: data.gender as "male" | "female",
    major_category: data.major_category as Parameters<
      typeof createProfile
    >[1]["major_category"],
    grade: data.grade as "1학년" | "2학년" | "3학년" | "4학년",
    dormitory: data.dormitory as "dongjak" | "eunpyeong",
    other_contact: data.other_contact || null,
    contact: data.contact || null,
    chronotype: data.chronotype as "morning" | "night",
    sleeping_habit: data.sleeping_habit as "none" | "grinding" | "snoring",
    smoking: data.smoking,
    cleanliness: data.cleanliness,
    noise_sensitivity: data.noise_sensitivity,
    introduction: data.introduction || null,
    avatar_url: googleAvatarUrl,
  };

  const { error: profileError } = await createProfile(supabase, profileInsert);
  if (profileError) {
    const isConflict =
      (profileError as { code?: string }).code === "23505" ||
      profileError.message?.toLowerCase().includes("duplicate") ||
      profileError.message?.toLowerCase().includes("unique");
    if (isConflict) {
      return { success: true };
    }
    return {
      success: false,
      error: profileError.message || "프로필 저장에 실패했어요.",
    };
  }

  // AI 요약은 백그라운드 백필로 미룸 → 대시보드로 즉시 이동
  const { error: postError } = await createMatchingPost(supabase, {
    user_id: user.id,
    dormitory: profileInsert.dormitory,
    ai_summary: null,
    match_score: null,
    is_active: true,
  });

  if (postError) {
    const isConflict =
      (postError as { code?: string }).code === "23505" ||
      postError.message?.toLowerCase().includes("duplicate") ||
      postError.message?.toLowerCase().includes("unique");
    if (isConflict) {
      return { success: true };
    }
    return {
      success: false,
      error: postError.message || "매칭 게시글 저장에 실패했어요.",
    };
  }

  return { success: true };
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err);
    console.error("[completeOnboarding]", err);
    return {
      success: false,
      error: message || "저장 중 오류가 발생했어요. 다시 시도해 주세요.",
    };
  }
}
