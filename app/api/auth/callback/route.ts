// OAuth 콜백: GET /api/auth/callback?code=... → exchangeCodeForSession → 쿠키에 세션 저장 → 프로필 유무에 따라 /onboarding 또는 next로 redirect

import { createClient } from "@/lib/supabase/server";
import { hasProfile } from "@/lib/supabase/queries/profiles";
import { NextResponse } from "next/server";

export async function GET(request: Request) {
  const { searchParams, origin } = new URL(request.url);
  const code = searchParams.get("code");
  const next = searchParams.get("next") ?? "/dashboard";

  if (!code) {
    return NextResponse.redirect(`${origin}/login?error=auth_callback_error`);
  }

  try {
    const supabase = await createClient();
    const { error } = await supabase.auth.exchangeCodeForSession(code);
    if (error) {
      return NextResponse.redirect(`${origin}/login?error=auth_callback_error`);
    }
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) {
      return NextResponse.redirect(`${origin}${next}`);
    }
    const { exists } = await hasProfile(supabase, user.id);
    const redirectPath = exists ? next : "/onboarding";
    const res = NextResponse.redirect(`${origin}${redirectPath}`);
    // 로그인 직후 대시보드 진입 시 클라이언트에서 hasProfile 재호출 생략용 (60초 후 만료)
    if (exists && next.startsWith("/dashboard")) {
      res.cookies.set("profile_checked", "1", { path: "/", maxAge: 60, sameSite: "lax" });
    }
    return res;
  } catch (e) {
    const msg = e instanceof Error ? e.message : String(e);
    if (msg.includes("Missing Supabase env") || msg.includes("NEXT_PUBLIC_SUPABASE")) {
      return NextResponse.redirect(`${origin}/login?error=server_config`);
    }
  }
  return NextResponse.redirect(`${origin}/login?error=auth_callback_error`);
}
