// Supabase 브라우저 클라이언트 (Client Component / 훅에서 사용)
// 요청 시점 → createBrowserClient() → 쿠키 기반 세션
// 406 방지: Supabase Auth/REST 요청에 Accept: application/json 명시 (content negotiation)

import { createBrowserClient } from "@supabase/ssr";

export function createClient() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  if (!url || !key) {
    throw new Error(
      "Missing Supabase env: NEXT_PUBLIC_SUPABASE_URL, NEXT_PUBLIC_SUPABASE_ANON_KEY"
    );
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

  return createBrowserClient(url, key, {
    global: { fetch: customFetch },
  });
}
