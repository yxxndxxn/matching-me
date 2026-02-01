// Supabase 미들웨어용 클라이언트 (요청/응답으로 쿠키 갱신)
// 매 요청 → createServerClient(req, res) → 세션 갱신 → 쿠키 반영

import { createServerClient } from "@supabase/ssr";
import { type NextRequest, NextResponse } from "next/server";

export async function updateSession(request: NextRequest) {
  let response = NextResponse.next({ request });

  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  if (!url || !key) {
    return response;
  }

  const customFetch: typeof fetch = (input, init = {}) => {
    const requestUrl = typeof input === "string" ? input : (input as Request).url;
    const isSupabase = requestUrl.startsWith(url);
    const headers = new Headers(init.headers ?? {});
    if (isSupabase && !headers.has("Accept")) {
      headers.set("Accept", "application/json");
    }
    return fetch(input, { ...init, headers });
  };

  const supabase = createServerClient(url, key, {
    global: { fetch: customFetch },
    cookies: {
      getAll() {
        return request.cookies.getAll();
      },
      setAll(cookiesToSet) {
        cookiesToSet.forEach(({ name, value }) =>
          request.cookies.set(name, value)
        );
        response = NextResponse.next({ request });
        cookiesToSet.forEach(({ name, value, options }) =>
          response.cookies.set(name, value, options)
        );
      },
    },
  });

  // 세션 갱신 (만료 토큰 갱신 후 쿠키 반영) + 사용자 조회
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const isProtectedRoute =
    request.nextUrl.pathname.startsWith("/dashboard") ||
    request.nextUrl.pathname.startsWith("/profile") ||
    request.nextUrl.pathname.startsWith("/onboarding");

  // 보호 경로(/dashboard, /profile, /onboarding) 미로그인 시 랜딩(/)으로 리다이렉트
  if (isProtectedRoute && !user) {
    const redirectUrl = new URL("/", request.url);
    redirectUrl.searchParams.set("redirectTo", request.nextUrl.pathname);
    return NextResponse.redirect(redirectUrl);
  }

  // 루트(/) 로그인 시 대시보드로, 미로그인 시 랜딩 표시 (리다이렉트 안 함)
  if (request.nextUrl.pathname === "/" && user) {
    return NextResponse.redirect(new URL("/dashboard", request.url));
  }

  // /login 접속 시 랜딩(/)으로 리다이렉트 (쿼리 보존) — 로그인은 랜딩 하단 CTA에서 처리
  if (request.nextUrl.pathname === "/login") {
    if (user) return NextResponse.redirect(new URL("/dashboard", request.url));
    const redirectUrl = new URL("/", request.url);
    request.nextUrl.searchParams.forEach((v, k) => redirectUrl.searchParams.set(k, v));
    return NextResponse.redirect(redirectUrl);
  }

  // 이미 프로필이 있으면 온보딩 화면 대신 대시보드로
  if (request.nextUrl.pathname.startsWith("/onboarding") && user) {
    const { data } = await supabase
      .from("profiles")
      .select("id")
      .eq("id", user.id)
      .maybeSingle();
    if (data != null) {
      return NextResponse.redirect(new URL("/dashboard", request.url));
    }
  }

  return response;
}
