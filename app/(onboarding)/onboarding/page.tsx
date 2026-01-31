"use client";

// 온보딩 메인: 3단계 완료 시 createProfile + createMatchingPost → /dashboard (Phase 2.2, 2.3 / Phase 3.6 저장 실패 toast)

import { Onboarding, type OnboardingFormData } from "@/components/onboarding";
import { createClient } from "@/lib/supabase/client";
import { createProfile, hasProfile } from "@/lib/supabase/queries/profiles";
import { createMatchingPost } from "@/lib/supabase/queries/matching-posts";
import { useAuth } from "@/hooks/use-auth";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { toast } from "sonner";

export default function OnboardingPage() {
  const { user } = useAuth();
  const router = useRouter();
  const [ready, setReady] = useState(false);

  useEffect(() => {
    if (!user) return;
    const supabase = createClient();
    void hasProfile(supabase, user.id).then(({ exists }) => {
      if (exists) router.replace("/dashboard");
      else setReady(true);
    });
  }, [user, router]);

  async function handleComplete(data: OnboardingFormData) {
    if (!user) return;
    const supabase = createClient();

    // 이미 프로필이 있으면 대시보드로 (중복 제출·새로고침 시 409 방지)
    const { exists: alreadyHasProfile } = await hasProfile(supabase, user.id);
    if (alreadyHasProfile) {
      router.replace("/dashboard");
      router.refresh();
      return;
    }

    const googleAvatarUrl =
      (user.user_metadata?.avatar_url as string | undefined) ??
      (user.user_metadata?.picture as string | undefined) ??
      null;

    const profileInsert = {
      id: user.id,
      name: data.name,
      gender: data.gender as "male" | "female",
      major_category: data.major_category as Parameters<typeof createProfile>[1]["major_category"],
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
      // 409 / unique violation = 이미 프로필 있음 → 대시보드로
      const isConflict =
        (profileError as { code?: string }).code === "23505" ||
        profileError.message?.toLowerCase().includes("duplicate") ||
        profileError.message?.toLowerCase().includes("unique");
      if (isConflict) {
        toast.info("이미 프로필이 등록되어 있어요. 대시보드로 이동합니다.");
        router.replace("/dashboard");
        router.refresh();
        return;
      }
      toast.error("프로필 저장에 실패했어요.", {
        description: profileError.message || "다시 시도해 주세요.",
      });
      return;
    }

    const { error: postError } = await createMatchingPost(supabase, {
      user_id: user.id,
      dormitory: profileInsert.dormitory,
      ai_summary: null,
      match_score: null,
      is_active: true,
    });
    if (postError) {
      // 매칭 게시글 중복 등 409면 이미 있다고 보고 대시보드로
      const isConflict =
        (postError as { code?: string }).code === "23505" ||
        postError.message?.toLowerCase().includes("duplicate") ||
        postError.message?.toLowerCase().includes("unique");
      if (isConflict) {
        router.replace("/dashboard");
        router.refresh();
        return;
      }
      toast.error("매칭 게시글 저장에 실패했어요.", {
        description: postError.message || "다시 시도해 주세요.",
      });
      return;
    }

    router.replace("/dashboard");
    router.refresh();
  }

  if (!user || !ready) return null;
  return <Onboarding onComplete={handleComplete} />;
}
