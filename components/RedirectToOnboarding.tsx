"use client";

// Phase 3.3: 프로필 없음 시 온보딩 유도 (보호 경로 진입 시 hasProfile false → /onboarding 리다이렉트)

import { createClient } from "@/lib/supabase/client";
import { hasProfile } from "@/lib/supabase/queries/profiles";
import { useAuth } from "@/hooks/use-auth";
import { usePathname, useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { LoadingState } from "@/components/loading-state";

const PROTECTED_PATHS = ["/dashboard", "/profile"];
const PROFILE_CHECKED_COOKIE = "profile_checked";

function readAndClearProfileCheckedCookie(): boolean {
  if (typeof document === "undefined") return false;
  const match = document.cookie.match(new RegExp(`(?:^|; )${PROFILE_CHECKED_COOKIE}=([^;]*)`));
  const value = match?.[1];
  if (value === "1") {
    document.cookie = `${PROFILE_CHECKED_COOKIE}=; path=/; max-age=0`;
    return true;
  }
  return false;
}

export function RedirectToOnboarding({ children }: { children: React.ReactNode }) {
  const { user, loading: authLoading } = useAuth();
  const router = useRouter();
  const pathname = usePathname();
  const [profileCheckDone, setProfileCheckDone] = useState(false);

  const isProtected = PROTECTED_PATHS.some((p) => pathname === p || pathname.startsWith(p + "/"));
  const checking = authLoading || (!!user && isProtected && !profileCheckDone);

  // 로그인 직후 auth 콜백에서 설정한 쿠키가 있으면 hasProfile 호출 생략 (로딩 단축)
  useEffect(() => {
    if (readAndClearProfileCheckedCookie()) setProfileCheckDone(true);
  }, []);

  useEffect(() => {
    if (authLoading || !user || !isProtected) return;
    if (profileCheckDone) return;
    const supabase = createClient();
    void hasProfile(supabase, user.id).then(({ exists, error }) => {
      setProfileCheckDone(true);
      // 쿼리 성공이고 프로필이 없을 때만 온보딩으로 (피드 로드 실패 등 에러 시에는 리다이렉트하지 않음)
      if (!exists && !error) {
        router.replace("/onboarding");
      }
    });
  }, [user, authLoading, pathname, isProtected, router, profileCheckDone]);

  if (checking) {
    return <LoadingState message="잠시만 기다려 주세요" />;
  }

  return <>{children}</>;
}
