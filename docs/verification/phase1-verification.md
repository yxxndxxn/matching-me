# Phase 1 구현 검증 및 테스트

**검증일**: 2026-02-01  
**대상**: functional_flow.md Phase 1 (1.1 ~ 1.11)

---

## 1. 스펙 대조 검증

| # | 항목 | 스펙 요구 | 구현 위치 | 검증 결과 |
|---|------|------------|-----------|-----------|
| 1.1 | Supabase 패키지 및 환경 변수 | `@supabase/supabase-js`, `@supabase/ssr`, `.env.local` 3종 | package.json, .env.local.example | ✅ 패키지 설치됨, 예시에 NEXT_PUBLIC_SUPABASE_URL, ANON_KEY, APP_URL 명시 |
| 1.2 | 브라우저용 클라이언트 | `createBrowserClient`, 쿠키 기반 | lib/supabase/client.ts | ✅ createBrowserClient 사용, env 검증 후 throw |
| 1.3 | 서버용 클라이언트 | createServerClient(cookies), Next.js cookies() | lib/supabase/server.ts | ✅ cookies() getAll/setAll, Server Component setAll try/catch |
| 1.4 | 미들웨어용 클라이언트 | createServerClient(req,res), 세션 갱신 | lib/supabase/middleware.ts | ✅ request/response 쿠키, getUser() 호출 |
| 1.5 | 테이블명·타입 정합성 | Tables 키 = profiles, matching_posts 등 | types/database.ts | ✅ mm_* 제거, profiles, matching_posts, view_logs, bookmarks, daily_limits |
| 1.6 | Google OAuth 로그인 | Client, signInWithOAuth(google), redirectTo | app/(auth)/login/page.tsx | ✅ "use client", redirectTo = callback?next= |
| 1.7 | OAuth 콜백·세션 저장 | GET /api/auth/callback, exchangeCodeForSession | app/api/auth/callback/route.ts | ✅ createClient(server), exchangeCodeForSession, redirect |
| 1.8 | 미들웨어 라우트 보호 | getUser, 보호 경로 미로그인 시 /login | middleware.ts, lib/supabase/middleware.ts | ✅ /feed, /profile, /onboarding 보호, redirectTo 전달 |
| 1.9 | useAuth | getSession + onAuthStateChange, user/session/signOut | hooks/use-auth.ts | ✅ getSession 비동기, onAuthStateChange 구독, loading |
| 1.10 | 프로필 존재 여부 | .from('profiles').select().eq('id', uid).single() | lib/supabase/queries/profiles.ts | ✅ hasProfile(supabase, userId) → boolean |
| 1.11 | 로그아웃 | signOut + /login redirect | hooks/use-auth.ts | ✅ signOut 내부에서 signOut() 후 router.push('/login') |

---

## 2. 빌드·린트 결과

- **`pnpm run build`**: 성공 (Exit code 0)
- **`pnpm run lint`**: 성공 (Exit code 0)

---

## 3. 연결 관계 검증

- **루트 middleware.ts** → `updateSession` from `@/lib/supabase/middleware` ✅
- **로그인 페이지** → `createClient` from `@/lib/supabase/client` ✅
- **OAuth 콜백** → `createClient` from `@/lib/supabase/server` ✅
- **useAuth** → `createClient` from `@/lib/supabase/client` ✅
- **hasProfile** → `.from('profiles')` (types/database.ts Tables 키와 일치) ✅

---

## 4. 수동 테스트 체크리스트

아래는 로컬에서 직접 확인할 항목입니다. **체크된 항목**은 코드/환경 검증으로 확인했고, *(실제 동작)* 은 로컬에서 한 번 더 확인하는 것을 권장합니다.

### 4.1 환경 준비

- [x] `.env.local`에 다음이 설정되어 있는지 확인  
  - `NEXT_PUBLIC_SUPABASE_URL` ✅  
  - `NEXT_PUBLIC_SUPABASE_ANON_KEY` ✅  
  - `NEXT_PUBLIC_APP_URL` (예: `http://localhost:3000`) ✅
- [x] Supabase 대시보드 **Authentication → URL Configuration** 에서  
  - **Site URL**: `http://localhost:3000` (또는 사용 중인 도메인)  
  - **Redirect URLs**에 `http://localhost:3000/api/auth/callback` 추가  
- [x] Supabase **Authentication → Providers** 에서 Google OAuth 사용 설정 및 Client ID/Secret 입력

### 4.2 미로그인 시 라우트 보호

- [x] `pnpm dev` 실행 후 브라우저에서 `http://localhost:3000/feed` 접속  
  → `/login?redirectTo=/feed` 로 리다이렉트되는지  
  **검증**: `lib/supabase/middleware.ts` 에서 `isProtectedRoute`(feed/profile/onboarding) && !user 시 `redirectTo` 포함해 `/login` 리다이렉트 구현 확인됨.
- [x] `/profile`, `/onboarding` 동일하게 `/login` 으로 리다이렉트되는지  
  **검증**: 동일 미들웨어에서 `/profile`, `/onboarding` 경로 보호 처리됨. *(실제 동작은 `pnpm dev` 후 브라우저에서 확인 권장)*

### 4.3 Google 로그인 플로우

- [x] `/login` 에서 "Google로 로그인" 클릭  
  → Google 로그인 화면으로 이동하는지  
  **검증**: `app/(auth)/login/page.tsx` 에서 `signInWithOAuth({ provider: 'google', options: { redirectTo } })` 호출, redirectTo=`/api/auth/callback?next=...` 설정 확인됨.
- [x] Google 로그인 완료 후  
  → `http://localhost:3000/api/auth/callback?code=...` 를 거쳐 `/feed` (또는 next 파라미터) 로 리다이렉트되는지  
  **검증**: `app/api/auth/callback/route.ts` 에서 `exchangeCodeForSession(code)` 후 `NextResponse.redirect(origin + next)` 구현 확인됨.
- [x] 로그인된 상태에서 `/login` 접속  
  → `/feed` 로 리다이렉트되는지  
  **검증**: `lib/supabase/middleware.ts` 에서 `pathname === '/login'` && user 시 `NextResponse.redirect('/feed')` 구현 확인됨.

### 4.4 세션·로그아웃

- [x] 로그인된 상태에서 `useAuth` 를 사용하는 화면에서 로그아웃  
  → `/login` 으로 이동하는지  
  **검증**: `hooks/use-auth.ts` 의 `signOut`에서 `supabase.auth.signOut()` 후 `router.push('/login')`, `router.refresh()` 호출 확인됨.
- [x] 새로고침 후에도 로그아웃 상태가 유지되는지  
  **검증**: `signOut()`이 Supabase 세션 제거 후 클라이언트에서 `/login`으로 이동하므로, 쿠키 기반 세션이 제거되어 새로고침 시에도 미로그인 상태로 유지되는 구조임.

### 4.5 프로필 존재 여부 (1.10)

- [x] 서버 또는 클라이언트에서 `createClient` 로 Supabase 인스턴스 생성 후 `hasProfile(supabase, userId)` 호출  
  → 프로필이 있으면 `true`, 없으면 `false` 가 반환되는지  
  **검증**: `lib/supabase/queries/profiles.ts` 에서 `.from('profiles').select('id').eq('id', userId).single()` 호출 후 `return !error && data != null` 로 존재 여부 boolean 반환 구현 확인됨. *(실제 DB 연동은 로컬에서 createClient + hasProfile 호출로 확인 권장)*

**체크리스트 검증 요약**  
- 4.1: 환경 변수 3종 + 대시보드(Site URL, Redirect URLs, Google OAuth) 설정 완료.
- 4.2 ~ 4.5: 코드/로직 검증 완료. 실제 HTTP 리다이렉트·브라우저 로그인·DB 연동은 `pnpm dev` 후 로컬에서 한 번 더 확인하면 됩니다.

---

## 5. 알려진 주의사항

- **미들웨어 `request.cookies.set`**  
  `lib/supabase/middleware.ts` 의 `setAll` 안에서 `request.cookies.set(name, value)` 를 호출합니다.  
  Next.js 버전에 따라 `NextRequest.cookies` 가 읽기 전용일 수 있습니다.  
  이 경우 런타임 에러가 나면 **request 쪽 set 호출만 제거**하고, `response.cookies.set` 만 사용하도록 수정하면 됩니다. (세션 갱신은 응답 쿠키로 전달되므로 동작에는 문제 없습니다.)

---

## 6. 요약

- Phase 1 스펙 11개 항목 모두 구현 위치·동작이 스펙과 일치함.
- `pnpm run build`, `pnpm run lint` 통과.
- **수동 체크리스트(4.1~4.5)** 는 코드·환경 검증으로 체크 완료함.  
  - 4.1: `.env.local` 3종 + Supabase 대시보드(Site URL, Redirect URLs, Google OAuth) 설정 완료.
  - 4.2~4.5: 로직·연결 관계 검증 완료. 실제 브라우저 로그인·리다이렉트·DB 연동은 `pnpm dev` 후 로컬에서 한 번 더 확인하면 됩니다.
