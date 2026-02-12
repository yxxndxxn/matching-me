"use client";

// Phase 3.1: Google OAuth 로그인 + 로그인/OAuth 에러 처리 (toast)

import Image from "next/image";
import Link from "next/link";
import { createClient } from "@/lib/supabase/client";
import dogImage from "@/app/assets/dog_charactor_crop.png";
import { useSearchParams } from "next/navigation";
import { Suspense, useEffect, useRef, useState } from "react";
import { toast } from "sonner";
import { Loader2 } from "lucide-react";

function GoogleLogo({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
      <path
        d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
        fill="#4285F4"
      />
      <path
        d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
        fill="#34A853"
      />
      <path
        d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
        fill="#FBBC05"
      />
      <path
        d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
        fill="#EA4335"
      />
    </svg>
  );
}

const WITHDRAWN_TOAST_ID = "withdrawal-complete"

/** 구글 로그인 진행 중 전용 로딩 화면 */
function LoginLoadingScreen() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center px-8 bg-gradient-to-b from-background to-card">
      <div className="flex flex-col items-center gap-6">
        <Image src={dogImage} alt="" className="w-24 h-24 object-contain opacity-90" priority />
        <div className="text-center">
          <h1 className="text-2xl font-bold text-foreground tracking-tight">매칭미?</h1>
          <p className="text-muted-foreground mt-2 text-sm">로그인 중이에요</p>
        </div>
        <div className="flex flex-col items-center gap-3">
          <div className="size-14 rounded-full bg-primary/10 flex items-center justify-center">
            <Loader2 className="size-7 text-primary animate-spin" />
          </div>
          <p className="text-xs text-muted-foreground">Google로 이동하고 있어요...</p>
        </div>
      </div>
    </div>
  );
}

function LoginContent() {
  const searchParams = useSearchParams()
  const hasShownWithdrawnRef = useRef(false)
  const [isLoggingIn, setIsLoggingIn] = useState(false)

  useEffect(() => {
    const error = searchParams.get("error");
    const message = searchParams.get("message");
    if (error === "auth_callback_error") {
      toast.error("로그인에 실패했어요.", {
        description: "다시 시도해 주세요. 문제가 계속되면 관리자에게 문의해 주세요.",
      });
    }
    if (message === "withdrawn" && !hasShownWithdrawnRef.current) {
      hasShownWithdrawnRef.current = true
      toast.success("회원 탈퇴가 완료되었어요.", { id: WITHDRAWN_TOAST_ID })
    }
  }, [searchParams]);

  function handleGoogleLogin() {
    setIsLoggingIn(true);
    const baseUrl =
      process.env.NEXT_PUBLIC_APP_URL ||
      (typeof window !== "undefined" ? window.location.origin : "");
    const nextPath = searchParams.get("redirectTo") || "/dashboard";
    const redirectTo = `${baseUrl}/api/auth/callback?next=${encodeURIComponent(nextPath)}`;

    // 로딩 UI가 한 프레임이라도 그려진 뒤 OAuth 호출 (반응 없음 체감 완화)
    setTimeout(async () => {
      try {
        const supabase = createClient();
        const { error } = await supabase.auth.signInWithOAuth({
          provider: "google",
          options: { redirectTo },
        });
        if (error) {
          setIsLoggingIn(false);
          toast.error("로그인을 시작하지 못했어요.", { description: error.message });
        }
      } catch (e) {
        setIsLoggingIn(false);
        toast.error("로그인 중 오류가 발생했어요.", {
          description: e instanceof Error ? e.message : "다시 시도해 주세요.",
        });
      }
    }, 0);
  }

  if (isLoggingIn) {
    return <LoginLoadingScreen />;
  }

  return (
    <div className="flex min-h-screen flex-col items-center justify-center px-8 relative">
      <div className="flex flex-col items-center gap-6 mb-12">
        <Image src={dogImage} alt="매칭미 마스코트" className="w-24 h-24 object-contain" priority />
        <div className="text-center">
          <h1 className="text-3xl font-bold text-foreground tracking-tight">매칭미?</h1>
          <p className="text-muted-foreground mt-2 text-base">
            나에게 딱 맞는 룸메이트를 찾아보세요
          </p>
        </div>
      </div>
      <div className="w-full max-w-sm space-y-4">
        <button
          type="button"
          onClick={handleGoogleLogin}
          className="w-full h-14 flex items-center justify-center gap-3 rounded-2xl border border-border bg-card text-base font-medium shadow-sm hover:bg-muted/50 transition-colors"
        >
          <GoogleLogo className="size-5 shrink-0" />
          <span>Google로 계속하기</span>
        </button>
        <p className="text-center text-xs text-muted-foreground px-4">
          계속 진행하면{" "}
          <Link href="/terms" className="text-primary underline hover:no-underline">
            서비스 이용약관
          </Link>
          및{" "}
          <Link href="/privacy" className="text-primary underline hover:no-underline">
            개인정보 처리방침
          </Link>
          에 동의하게 됩니다
        </p>
      </div>
      <div className="absolute bottom-8 left-0 right-0 text-center">
        <p className="text-xs text-muted-foreground/60">남도학숙 재사생을 위한 룸메이트 매칭 서비스</p>
      </div>
    </div>
  );
}

export default function LoginPage() {
  return (
    <Suspense fallback={
      <div className="flex min-h-screen items-center justify-center">
        <Loader2 className="size-8 text-muted-foreground animate-spin" />
      </div>
    }>
      <LoginContent />
    </Suspense>
  );
}
