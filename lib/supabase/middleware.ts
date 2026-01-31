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

  const isAuthRoute =
    request.nextUrl.pathname.startsWith("/login") ||
    request.nextUrl.pathname === "/";
  const isProtectedRoute =
    request.nextUrl.pathname.startsWith("/feed") ||
    request.nextUrl.pathname.startsWith("/profile") ||
    request.nextUrl.pathname.startsWith("/onboarding");

  if (isProtectedRoute && !user) {
    const redirectUrl = new URL("/login", request.url);
    redirectUrl.searchParams.set("redirectTo", request.nextUrl.pathname);
    return NextResponse.redirect(redirectUrl);
  }

  if (request.nextUrl.pathname === "/") {
    if (!user) return NextResponse.redirect(new URL("/login", request.url));
    return NextResponse.redirect(new URL("/feed", request.url));
  }

  if (isAuthRoute && user && request.nextUrl.pathname === "/login") {
    return NextResponse.redirect(new URL("/feed", request.url));
  }

  // 이미 프로필이 있으면 온보딩 화면 대신 대시보드로
  if (request.nextUrl.pathname.startsWith("/onboarding") && user) {
    const { data } = await supabase
      .from("profiles")
      .select("id")
      .eq("id", user.id)
      .maybeSingle();
    if (data != null) {
      return NextResponse.redirect(new URL("/feed", request.url));
    }
  }

  return response;
}
