"use client";

// 온보딩 메인: 3단계 완료 시 Server Action → profiles + matching_posts → /dashboard (AI 요약은 백필)

import { Onboarding, type OnboardingFormData } from "@/components/onboarding";
import { completeOnboarding } from "../actions";
import { createClient } from "@/lib/supabase/client";
import { hasProfile } from "@/lib/supabase/queries/profiles";
import { useAuth } from "@/hooks/use-auth";
import { useRouter } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { toast } from "sonner";

export default function OnboardingPage() {
  const { user } = useAuth();
  const router = useRouter();
  const [ready, setReady] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const submittingRef = useRef(false);

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
    if (submittingRef.current) return;
    submittingRef.current = true;
    setIsSubmitting(true);
    try {
      const result = await completeOnboarding(data);
      if (result.success) {
        window.location.href = "/dashboard";
        return;
      }
      toast.error("저장에 실패했어요.", {
        description: result.error || "다시 시도해 주세요.",
      });
    } finally {
      submittingRef.current = false;
      setIsSubmitting(false);
    }
  }

  if (!user || !ready) return null;
  return <Onboarding onComplete={handleComplete} isSubmitting={isSubmitting} />;
}
