"use client";

// 온보딩 메인: 3단계 완료 시 Server Action → profiles + AI 요약 + matching_posts → /dashboard

import { Onboarding, type OnboardingFormData } from "@/components/onboarding";
import { completeOnboarding } from "../actions";
import { createClient } from "@/lib/supabase/client";
import { hasProfile } from "@/lib/supabase/queries/profiles";
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

    const result = await completeOnboarding(data);

    if (result.success) {
      router.replace("/dashboard");
      router.refresh();
      return;
    }

    toast.error("저장에 실패했어요.", {
      description: result.error || "다시 시도해 주세요.",
    });
  }

  if (!user || !ready) return null;
  return <Onboarding onComplete={handleComplete} />;
}
