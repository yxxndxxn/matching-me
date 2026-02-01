"use server";

/**
 * 온보딩 완료 Server Action
 * profiles + matching_posts 저장, Gemini AI 요약 생성
 */

import { createClient } from "@/lib/supabase/server";
import { createProfile, hasProfile } from "@/lib/supabase/queries/profiles";
import { createMatchingPost } from "@/lib/supabase/queries/matching-posts";
import { generateAiSummaryForProfile } from "@/lib/ai/matching-summary";
import type { OnboardingFormData } from "@/components/onboarding";

export type CompleteOnboardingResult =
  | { success: true }
  | { success: false; error: string };

export async function completeOnboarding(
  data: OnboardingFormData
): Promise<CompleteOnboardingResult> {
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
    kakao_id: data.kakao_id || null,
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

  // Gemini AI 요약 생성 (비교 대상 없음 → 유저 강점 요약)
  const lifePattern = {
    chronotype: profileInsert.chronotype,
    sleeping_habit: profileInsert.sleeping_habit,
    smoking: profileInsert.smoking,
    cleanliness: profileInsert.cleanliness,
    noise_sensitivity: profileInsert.noise_sensitivity,
    introduction: profileInsert.introduction,
  };
  const aiSummary = await generateAiSummaryForProfile(lifePattern);

  const { error: postError } = await createMatchingPost(supabase, {
    user_id: user.id,
    dormitory: profileInsert.dormitory,
    ai_summary: aiSummary,
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
}
