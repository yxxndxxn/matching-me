# 매칭미? (Matching Me?) 구현 로드맵

Supabase SDK + Google OAuth 기준 **실제 구현을 위한 Step-by-step 로직 구현 계획**입니다.  
문서(PRD, FLOW, db-schema, tech-stack) 및 현재 소스 분석 결과를 반영했습니다.

---

## 현재 상태 요약

| 구분 | 상태 | 비고 |
|------|------|------|
| **Supabase 패키지** | 미설치 | `@supabase/supabase-js`, `@supabase/ssr` 필요 |
| **lib/supabase/client.ts** | 스텁 | `createClient()` → `return null` |
| **lib/supabase/server.ts** | 스텁 | `createClient()` → `return null` |
| **lib/supabase/middleware.ts** | 스텁 | `createMiddlewareClient()` → `return null` |
| **로그인 UI** | UI만 존재 | `LoginScreen` → 버튼 클릭 시 `onLogin()` 호출, 실제 OAuth 없음 |
| **앱 플로우** | 단일 페이지 | `app/page.tsx`에서 login → onboarding → feed 를 로컬 state로만 전환 |
| **OAuth 콜백** | 501 | `app/(dashboard)/api/auth/callback/route.ts` → 미구현 |
| **미들웨어** | 없음 | 프로젝트 루트에 `middleware.ts` 없음, 라우트 보호 없음 |
| **프로필 API** | 501 | GET/POST/PUT/DELETE 모두 미구현 |
| **useAuth / AuthProvider** | 스텁 | `return null` |
| **lib/supabase/queries/*** | 스텁 | `getProfile` 등 `return null` |
| **DB 스키마** | 적용됨 | `docs/database/supabase-schema.sql` 기준 profiles, matching_posts 등 (테이블명: profiles, not mm_*) |
| **타입** | `types/database.ts` | Tables 키는 `mm_profiles` 등 → 실제 DB는 `profiles` 사용 시 키 불일치 가능 |

---

## Step-by-Step 구현 계획 (Supabase SDK + Google OAuth)

### Phase 0: 환경 및 패키지

| Step | 작업 | 상세 |
|------|------|------|
| 0.1 | Supabase 패키지 설치 | `pnpm add @supabase/supabase-js @supabase/ssr` |
| 0.2 | 환경 변수 정리 | `.env.local` 에 `NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY`, `NEXT_PUBLIC_APP_URL` 확인. Google OAuth는 Supabase Dashboard에서 설정하므로 클라이언트 시크릿 등은 서버용만 필요 시 추가. |
| 0.3 | 테이블명 정합성 | 앱에서 사용할 테이블명 결정: 현재 DB가 `profiles` 이면 `types/database.ts` 의 Tables 키를 `profiles` 로 맞추거나, MM_ 마이그레이션 적용 후 `mm_profiles` 로 통일. |

---

### Phase 1: Supabase 클라이언트 구현

| Step | 작업 | 상세 |
|------|------|------|
| 1.1 | 브라우저용 클라이언트 | `lib/supabase/client.ts` 에서 `createBrowserClient(@supabase/ssr)` 로 클라이언트 생성, 쿠키 기반 세션 저장. |
| 1.2 | 서버용 클라이언트 | `lib/supabase/server.ts` 에서 `createServerClient` (쿠키 읽기/쓰기) 구현. Next.js App Router 에서 `cookies()` 사용. |
| 1.3 | 미들웨어용 클라이언트 | `lib/supabase/middleware.ts` 에서 `createServerClient` 로 미들웨어 전용 클라이언트 생성 (요청/응답에서 쿠키 갱신). |

참고: [Supabase Auth Helpers - Next.js App Router](https://supabase.com/docs/guides/auth/auth-helpers/nextjs-app-router)

---

### Phase 2: Google OAuth 설정 (Supabase Dashboard)

| Step | 작업 | 상세 |
|------|------|------|
| 2.1 | Supabase에서 Google Provider 활성화 | Authentication → Providers → Google → Enable. Client ID / Client Secret 은 Google Cloud Console에서 발급. |
| 2.2 | Redirect URL 등록 | Supabase Auth URL 설정: `https://<project>.supabase.co/auth/v1/callback`. 앱 측 콜백 URL: `{NEXT_PUBLIC_APP_URL}/api/auth/callback` (또는 사용할 경로) 를 Google Cloud Console의 "승인된 리디렉션 URI"에 추가. |
| 2.3 | 콜백 URL 통일 | Supabase Dashboard 의 "Redirect URLs" 에 `http://localhost:3000/api/auth/callback`, 배포 시 `https://<도메인>/api/auth/callback` 추가. |

---

### Phase 3: 로그인 플로우 (Google OAuth)

| Step | 작업 | 상세 |
|------|------|------|
| 3.1 | 로그인 진입점 | `LoginScreen` (또는 `(auth)/login/page.tsx`) 에서 "Google로 계속하기" 클릭 시 `supabase.auth.signInWithOAuth({ provider: 'google', options: { redirectTo: `${APP_URL}/api/auth/callback` } })` 호출. |
| 3.2 | OAuth 콜백 라우트 | `app/(dashboard)/api/auth/callback/route.ts` (또는 `app/api/auth/callback/route.ts`) 에서 `GET` 요청 처리: `nextUrl.searchParams.get('code')`, `supabase.auth.exchangeCodeForSession(code)` 호출 후 성공 시 `/` 또는 `/feed` 로 redirect. |
| 3.3 | 세션 갱신 | 콜백에서 사용하는 Supabase 클라이언트는 서버용(`createServerClient`)으로 쿠키에 세션 저장. 미들웨어(Phase 4)에서 매 요청마다 `getUser()` / 세션 갱신으로 쿠키 유지. |

---

### Phase 4: 미들웨어 및 라우트 보호

| Step | 작업 | 상세 |
|------|------|------|
| 4.1 | 루트 미들웨어 추가 | 프로젝트 루트에 `middleware.ts` 생성. `createMiddlewareClient` 로 요청/응답에 대해 `supabase.auth.getUser()` 호출, 세션 갱신 후 응답 반환. |
| 4.2 | 보호할 경로 정의 | 로그인 필요: `/feed`, `/profile`, `/onboarding` 등. 미로그인 시 `/login` 또는 `/` 로 redirect. |
| 4.3 | 로그인 후 리다이렉트 | 이미 로그인된 사용자가 `/login` 접근 시 `/feed` 또는 `/` 로 redirect (선택). |

---

### Phase 5: 라우팅 구조 정리

| Step | 작업 | 상세 |
|------|------|------|
| 5.1 | 진입점 통일 | 현재: `app/page.tsx` 단일 페이지에서 state로 login/onboarding 전환. 변경: 로그인 여부는 미들웨어+세션으로 판단, `/` → 로그인 여부에 따라 `/login` 또는 `/feed`(또는 온보딩 미완료 시 `/onboarding`) 로 redirect. |
| 5.2 | (auth) 라우트 그룹 | `/login` 은 `(auth)/login/page.tsx` 에서 실제 Google OAuth 버튼 연결. |
| 5.3 | (onboarding) 라우트 그룹 | 세션 있으나 프로필 미등록 사용자는 `/onboarding` 으로 유도. 프로필 등록 완료 후 `/feed` 로 이동. |
| 5.4 | (dashboard) 라우트 그룹 | `/feed`, `/profile` 등은 세션 필수. 미들웨어에서 미로그인 시 `/login` 리다이렉트. |

---

### Phase 6: 프로필(온보딩) 및 DB 연동

| Step | 작업 | 상세 |
|------|------|------|
| 6.1 | 프로필 존재 여부 조회 | 로그인 후 `profiles` 테이블에서 `id = auth.uid()` 인 행 조회. 없으면 온보딩 필요. |
| 6.2 | 쿼리 함수 구현 | `lib/supabase/queries/profiles.ts` 에서 `getProfile(userId)`, `createProfile(data)`, `updateProfile(userId, data)` 구현. DB 테이블명이 `profiles` 이면 `.from('profiles')` 사용. |
| 6.3 | 온보딩 완료 시 저장 | 온보딩 3단계 제출 시 `createProfile` (또는 upsert) 호출. 동시에 `matching_posts` 1건 생성(필요 시). |
| 6.4 | 마이페이지 프로필 조회 | `profile-view.tsx` 에서 `currentUserProfile` 대신 `getProfile(session.user.id)` 결과 사용. (useAuth 등으로 session 노출 후 조회) |

---

### Phase 7: 인증 상태 훅 및 Provider

| Step | 작업 | 상세 |
|------|------|------|
| 7.1 | useAuth 구현 | `hooks/use-auth.ts` 에서 브라우저용 Supabase 클라이언트로 `getSession()` / `onAuthStateChange` 구독, `user`, `session`, `signOut` 반환. |
| 7.2 | AuthProvider (선택) | 전역에 세션/유저를 넘기려면 `components/providers/auth-provider.tsx` 에서 Context 로 `user`/`session` 제공. |
| 7.3 | 로그아웃 | `supabase.auth.signOut()` 호출 후 `/login` 또는 `/` 로 redirect. |

---

### Phase 8: 피드·API 연동 (이후 단계)

| Step | 작업 | 상세 |
|------|------|------|
| 8.1 | 피드 목록 조회 | `matching_posts` + `profiles` 조인, RLS 기준(동일 dormitory, is_active)으로 조회. |
| 8.2 | 프로필 API | `app/(dashboard)/api/profile/route.ts` 에서 GET/POST/PUT 구현, 서버용 Supabase 클라이언트로 세션 검증 후 profiles CRUD. |
| 8.3 | 연락처 공개 / 조회권 | Phase 2 고도화: `view_logs`, `daily_limits` 연동. |
| 8.4 | AI 매칭 요약 | `api/matching/generate-summary` 등에서 OpenAI 호출 후 `matching_posts.ai_summary` 업데이트. |

---

## 구현 순서 요약 (권장)

1. **Phase 0** → 패키지·env·테이블명 정리  
2. **Phase 1** → Supabase 클라이언트 3종(browser, server, middleware) 구현  
3. **Phase 2** → Supabase + Google Cloud 에서 Google OAuth 설정  
4. **Phase 3** → 로그인 버튼 → `signInWithOAuth` → 콜백 라우트에서 `exchangeCodeForSession`  
5. **Phase 4** → `middleware.ts` 로 세션 갱신 및 라우트 보호  
6. **Phase 5** → `/`, `/login`, `/onboarding`, `/feed` 라우팅 정리  
7. **Phase 6** → 프로필 조회/생성/수정, 온보딩 저장, 마이페이지에 DB 데이터 반영  
8. **Phase 7** → useAuth / AuthProvider 로 세션 노출  
9. **Phase 8** → 피드, 프로필 API, 조회권, AI 요약 등

---

## 참고 문서

- [Supabase Auth - Next.js App Router](https://supabase.com/docs/guides/auth/auth-helpers/nextjs-app-router)
- [Supabase Auth - Google OAuth](https://supabase.com/docs/guides/auth/social-login/auth-google)
- [Row Level Security](https://supabase.com/docs/guides/auth/row-level-security) — [db-schema.md](../database/db-schema.md), [supabase-schema.sql](../database/supabase-schema.sql)
- 프로젝트: [PRD.md](./PRD.md), [FLOW.md](../architecture/FLOW.md), [tech-stack.md](../technical/tech-stack.md), [db-schema.md](../database/db-schema.md), [supabase-update-guide.md](../database/supabase-update-guide.md)

---

**문서 버전**: 1.0  
**작성일**: 2026-01-31  
**기준**: 현재 소스 및 문서 분석 결과, Supabase SDK + Google OAuth 구현 관점
