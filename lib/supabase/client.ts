// Supabase 브라우저 클라이언트 (Client Component / 훅에서 사용)
// 요청 시점 → createBrowserClient() → 쿠키 기반 세션
// 406 방지: Supabase Auth/REST 요청에 Accept: application/json 명시 (content negotiation)
// 싱글톤: 로그인 버튼 연타/재시도 시 매번 새 인스턴스를 만들지 않아 체감 지연 완화

import { createBrowserClient } from "@supabase/ssr";

let clientInstance: ReturnType<typeof createBrowserClient> | null = null;

export function createClient() {
  if (clientInstance) {
    return clientInstance;
  }

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

  clientInstance = createBrowserClient(url, key, {
    global: { fetch: customFetch },
  });
  return clientInstance;
}
