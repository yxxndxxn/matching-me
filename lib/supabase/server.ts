// Supabase 서버 클라이언트 (Server Component / Route Handler / API에서 사용)
// 요청 시점 → createServerClient(cookies) → Next.js cookies() 읽기/쓰기

import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";

export async function createClient() {
  const cookieStore = await cookies();

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

  return createServerClient(url, key, {
    global: { fetch: customFetch },
    cookies: {
      getAll() {
        return cookieStore.getAll();
      },
      setAll(cookiesToSet) {
        try {
          cookiesToSet.forEach(({ name, value, options }) =>
            cookieStore.set(name, value, options)
          );
        } catch {
          // Server Component에서 호출된 경우 무시 (미들웨어에서 세션 갱신)
        }
      },
    },
  });
}
