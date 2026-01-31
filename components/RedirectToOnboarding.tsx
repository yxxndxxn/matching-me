"use client";

// Phase 3.3: 프로필 없음 시 온보딩 유도 (보호 경로 진입 시 hasProfile false → /onboarding 리다이렉트)

import { createClient } from "@/lib/supabase/client";
import { hasProfile } from "@/lib/supabase/queries/profiles";
import { useAuth } from "@/hooks/use-auth";
import { usePathname, useRouter } from "next/navigation";
import { useEffect, useState } from "react";

const PROTECTED_PATHS = ["/dashboard", "/profile"];

export function RedirectToOnboarding({ children }: { children: React.ReactNode }) {
  const { user, loading: authLoading } = useAuth();
  const router = useRouter();
  const pathname = usePathname();
  const [profileCheckDone, setProfileCheckDone] = useState(false);

  const isProtected = PROTECTED_PATHS.some((p) => pathname === p || pathname.startsWith(p + "/"));
  const checking = authLoading || (!!user && isProtected && !profileCheckDone);

  useEffect(() => {
    if (authLoading || !user || !isProtected) return;
    const supabase = createClient();
    void hasProfile(supabase, user.id).then(({ exists, error }) => {
      setProfileCheckDone(true);
      // 쿼리 성공이고 프로필이 없을 때만 온보딩으로 (피드 로드 실패 등 에러 시에는 리다이렉트하지 않음)
      if (!exists && !error) {
        router.replace("/onboarding");
      }
    });
  }, [user, authLoading, pathname, isProtected, router]);

  if (checking) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <span className="text-sm text-muted-foreground">로딩 중...</span>
      </div>
    );
  }

  return <>{children}</>;
}
