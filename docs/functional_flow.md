# 기능적 흐름 리스트 (Data Binding 단계)

화면이 아닌 **데이터 흐름** 중심으로 정리한 실전 로직 구현 체크리스트입니다.  
각 항목은 "데이터 소스 → 페칭 → 상태 관리 → UI 바인딩" 순서로 기술하며, 단계별 컨펌 후 구현할 수 있도록 번호를 부여했습니다.

**기준 문서**: PRD, FLOW, db-schema, roadmap, 현재 소스 구조

---

## Phase 1: Foundation (공통 유틸리티 및 기본 데이터 연결)

| # | 항목 | 데이터 흐름 | 기술 상세 |
|---|------|-------------|-----------|
| **1.1** | Supabase 패키지 및 환경 변수 | (설정) → 앱 전역에서 Supabase 호출 가능 | `pnpm add @supabase/supabase-js @supabase/ssr`. `.env.local`: `NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY`, `NEXT_PUBLIC_APP_URL`. |
| **1.2** | 브라우저용 Supabase 클라이언트 | 요청 시점 → `createBrowserClient()` → 클라이언트 인스턴스 → Client Component/훅에서 사용 | `lib/supabase/client.ts`. `@supabase/ssr` 의 `createBrowserClient`, 쿠키 기반 세션. |
| **1.3** | 서버용 Supabase 클라이언트 | 요청 시점 → `createServerClient(cookies)` → 서버 인스턴스 → Server Component / Route Handler / API에서 사용 | `lib/supabase/server.ts`. Next.js `cookies()` 읽기/쓰기. |
| **1.4** | 미들웨어용 Supabase 클라이언트 | 요청/응답 → `createServerClient(req, res)` → 세션 갱신 → 쿠키 반영 | `lib/supabase/middleware.ts`. 요청/응답 객체로 쿠키 갱신. |
| **1.5** | 테이블명·타입 정합성 | DB 실제 테이블명 → `types/database.ts` Tables 키와 일치 | 현재 DB는 `profiles`, `matching_posts` 등. `mm_*` 미적용 시 타입 키를 `profiles` 등으로 통일. |
| **1.6** | Google OAuth 로그인 트리거 | 사용자 클릭 → `signInWithOAuth({ provider: 'google', redirectTo })` → 브라우저 리다이렉트 | **Client Component** (`LoginScreen` 또는 `(auth)/login/page.tsx`). Supabase **Browser Client**. Google OAuth. |
| **1.7** | OAuth 콜백·세션 저장 | `GET /api/auth/callback?code=...` → `exchangeCodeForSession(code)` → 쿠키에 세션 저장 → redirect | **Route Handler** (`app/api/auth/callback/route.ts`). Supabase **Server Client** (`createServerClient`). Google OAuth 콜백. |
| **1.8** | 미들웨어 세션 갱신·라우트 보호 | 매 요청 → `getUser()` / 세션 갱신 → 보호 경로면 미로그인 시 `/login` redirect | **Root `middleware.ts`**. Supabase **Middleware Client**. `/feed`, `/profile`, `/onboarding` 등 보호. |
| **1.9** | 세션 상태 훅 (useAuth) | 마운트/인증 이벤트 → `getSession()` + `onAuthStateChange` → `user` / `session` / `signOut` 상태 → 컴포넌트 소비 | **Client**. `hooks/use-auth.ts`. Supabase **Browser Client**. |
| **1.10** | 프로필 존재 여부 조회 | `auth.uid()` → `profiles` 테이블 `id = uid` 1건 SELECT → 존재 여부 boolean → 라우팅 분기(온보딩 vs 피드) | Server 또는 Client. Supabase `.from('profiles').select().eq('id', uid).single()`. RLS로 본인만 조회. |
| **1.11** | 로그아웃 | 사용자 클릭 → `signOut()` → 세션 제거 → `/login` redirect | **Client**. `useAuth().signOut` + `router.push('/login')`. Supabase **Browser Client**. |

---

## Phase 2: Core Logic (주요 비즈니스 기능의 Read/Write)

| # | 항목 | 데이터 흐름 | 기술 상세 |
|---|------|-------------|-----------|
| **2.1** | 프로필 단건 조회 (getProfile) | `userId` → `profiles` SELECT by id → `ProfileRow` | `lib/supabase/queries/profiles.ts`. Server/Client 공통. `.from('profiles').select().eq('id', userId).single()`. |
| **2.2** | 프로필 생성 (온보딩 제출) | 폼 데이터 → `profiles` INSERT (id=auth.uid()) → 성공/실패 | **Client** (온보딩) 또는 API Route. Supabase **Browser/Server Client**. `.from('profiles').insert()`. RLS: 본인만 INSERT. |
| **2.3** | 매칭 게시글 1건 생성 (온보딩 연동) | `user_id`, `dormitory`, `ai_summary`(nullable) → `matching_posts` INSERT → 성공/실패 | 온보딩 완료 시 함께 호출. `.from('matching_posts').insert()`. RLS: 본인만 INSERT. |
| **2.4** | 프로필 수정 (updateProfile) | `userId` + 부분 필드 → `profiles` UPDATE → 갱신된 행 | `lib/supabase/queries/profiles.ts`. `.from('profiles').update().eq('id', userId)`. RLS: 본인만 UPDATE. |
| **2.5** | 마이페이지 프로필 바인딩 | `session.user.id` → getProfile(uid) → 상태 → `ProfileView`에 반영 (currentUserProfile 대체) | **Client**. `useAuth` + `useProfile`(또는 직접 getProfile). `profile-view.tsx`에서 DB 데이터 바인딩. |
| **2.6** | 피드 목록 조회 (소속관 격리) | `auth.uid()` → 내 `profiles.dormitory` → `matching_posts` + `profiles` 조인, 동일 dormitory & is_active → 목록 | `lib/supabase/queries/matching-posts.ts` 또는 전용 feed 쿼리. RLS가 dormitory 격리 보장하므로 `.from('matching_posts').select(..., profiles(*))` 등. Server 또는 Client. |
| **2.7** | 피드 목록 상태·UI 바인딩 | 피드 쿼리 결과 → `useMatchingFeed` 등 상태 → `FeedList` / `CandidateCard` 리스트 렌더 | **Client**. `hooks/use-matching-feed.ts`. `home-view.tsx`, `feed-list.tsx`에 바인딩. |
| **2.8** | 필터 조건 반영 (관/성별/계열/학년/흡연) | 필터 상태 → 쿼리 `.eq()/.in()` 추가 → 재페칭 → 동일 UI 바인딩 | Client. `FilterBar` 상태 + `getMatchingPosts`(또는 feed 쿼리) 파라미터화. Supabase `.eq('dormitory', ...)` 등. |
| **2.9** | 찜 목록 조회 (getBookmarks) | `auth.uid()` → `bookmarks` WHERE user_id → post_id 목록 → 해당 `matching_posts`+`profiles` 조인 | `lib/supabase/queries/bookmarks.ts`. `.from('bookmarks').select(..., matching_posts(...), profiles(...))`. RLS: 본인만 SELECT. |
| **2.10** | 찜 추가 (createBookmark) | `user_id`, `post_id` → `bookmarks` INSERT → 목록 상태 갱신 | **Client**. `useBookmarks` 또는 직접. `.from('bookmarks').insert({ user_id, post_id })`. UNIQUE(user_id, post_id) → ON CONFLICT 처리. |
| **2.11** | 찜 삭제 (deleteBookmark) | `user_id`, `post_id` → `bookmarks` DELETE → 목록 상태 갱신 | **Client**. `.from('bookmarks').delete().eq('user_id', uid).eq('post_id', postId). |
| **2.12** | 찜 목록 UI 바인딩 | getBookmarks 결과 → 상태 → `ProfileView` 내 "내가 찜한 룸메이트" / `SavedRoommatesPage` | **Client**. `useBookmarks` + `profile-view.tsx`, `SavedRoommatesPage`. |
| **2.13** | 일일 조회권 남은 횟수 조회 | `auth.uid()` + `CURRENT_DATE` → `daily_limits` SELECT → `reveals_used` → 남은 횟수 = 3 - reveals_used | Server 또는 Client. `.from('daily_limits').select().eq('user_id', uid).eq('limit_date', today).single()`. RLS: 본인만 SELECT. |
| **2.14** | 연락처 공개 시 로그·조회권 차감 | "연락처 확인" 클릭 → `view_logs` INSERT + `daily_limits` UPSERT(reveals_used +1, 상한 3) → 남은 횟수 상태 갱신 | **Server API** 권장 (`api/reveal-contact`). Service Role 또는 Server Client. `view_logs` INSERT, `daily_limits` ON CONFLICT DO UPDATE. |
| **2.15** | 프로필 API (GET/POST/PUT) | 요청 → 세션 검증 → `profiles` SELECT/INSERT/UPDATE → JSON 응답 | **Route Handler** `app/(dashboard)/api/profile/route.ts`. Supabase **Server Client**, `getUser()`로 uid 검증 후 CRUD. |

---

## Phase 3: Interaction & Feedback (상태 변경, 알림, 에러 핸들링)

| # | 항목 | 데이터 흐름 | 기술 상세 |
|---|------|-------------|-----------|
| **3.1** | 로그인 실패·OAuth 에러 처리 | `signInWithOAuth` / 콜백 `exchangeCodeForSession` 에러 → 에러 상태 또는 toast → 로그인 화면에 메시지 | **Client** (로그인 버튼), **Route Handler** (콜백). `toast.error()` 또는 에러 UI. |
| **3.2** | 세션 만료·미인증 시 리다이렉트 | 미들웨어에서 `getUser()` null → `/login` redirect. API에서 401 반환 | **Root middleware**. API Route: `getUser()` 실패 시 `Response.json(..., { status: 401 })`. |
| **3.3** | 프로필 없음(온보딩 유도) | 1.10 프로필 존재 여부 = false → `/onboarding` redirect (또는 랜딩에서 온보딩 노출) | Server Component 또는 middleware 보조. 리다이렉트 또는 조건부 렌더. |
| **3.4** | 프로필 조회 실패·빈 상태 | getProfile 에러 또는 null → 로딩/에러 UI 또는 빈 프로필 폼 | **Client**. `profile-view.tsx`, `useProfile`. Skeleton 또는 "프로필을 불러올 수 없습니다" 메시지. |
| **3.5** | 온보딩 폼 유효성 검사 | 제출 전 → Zod 등 스키마 검증 → 실패 시 필드별 에러 메시지 바인딩 | **Client**. `components/onboarding.tsx`, `react-hook-form` + `@hookform/resolvers/zod`. db-schema ENUM/CHECK와 동일 규칙. |
| **3.6** | 온보딩 저장 실패 처리 | createProfile / matching_posts INSERT 실패 → toast 또는 인라인 에러 → 재시도 유도 | **Client**. `toast.error()`, 폼 상단 에러 메시지. |
| **3.7** | 피드 로딩·빈 목록·에러 | 쿼리 로딩 → Skeleton UI. 빈 배열 → Empty state. 에러 → toast 또는 인라인 메시지 | **Client**. `feed-list.tsx`, `useMatchingFeed`. 스켈레톤 컴포넌트, empty state UI. |
| **3.8** | 찜 추가/삭제 피드백 | createBookmark/deleteBookmark 성공 → toast ("찜 목록에 추가했어요" 등) → 목록 상태 갱신 | **Client**. `candidate-card.tsx`, `useBookmarks`. `toast.success()`. |
| **3.9** | 연락처 공개 성공·한도 초과 | 성공 → toast + 연락처 노출 + 남은 횟수 갱신. 한도 초과 → toast ("오늘의 조회 한도를 초과했습니다") | **Client**. `profile-detail-view.tsx`, `useContactReveal` / `useDailyLimit`. API 응답에 따라 분기. |
| **3.10** | 로그아웃 후 상태 정리 | signOut 후 → 로컬 상태(찜 목록, 프로필 등) 초기화 → `/login` 화면 | **Client**. `ProfileView` onLogout, 전역 상태 초기화(있을 경우). |

---

## 구현 체크리스트

구현 완료 시 `[ ]` 를 `[x]` 로 바꿔서 체크하세요.

### Phase 1: Foundation

- [x] **1.1** Supabase 패키지 및 환경 변수
- [x] **1.2** 브라우저용 Supabase 클라이언트
- [x] **1.3** 서버용 Supabase 클라이언트
- [x] **1.4** 미들웨어용 Supabase 클라이언트
- [x] **1.5** 테이블명·타입 정합성
- [x] **1.6** Google OAuth 로그인 트리거
- [x] **1.7** OAuth 콜백·세션 저장
- [x] **1.8** 미들웨어 세션 갱신·라우트 보호
- [x] **1.9** 세션 상태 훅 (useAuth)
- [x] **1.10** 프로필 존재 여부 조회
- [x] **1.11** 로그아웃

### Phase 2: Core Logic

- [x] **2.1** 프로필 단건 조회 (getProfile)
- [x] **2.2** 프로필 생성 (온보딩 제출)
- [x] **2.3** 매칭 게시글 1건 생성 (온보딩 연동)
- [x] **2.4** 프로필 수정 (updateProfile)
- [x] **2.5** 마이페이지 프로필 바인딩
- [x] **2.6** 피드 목록 조회 (소속관 격리)
- [x] **2.7** 피드 목록 상태·UI 바인딩
- [x] **2.8** 필터 조건 반영 (관/성별/계열/학년/흡연)
- [x] **2.9** 찜 목록 조회 (getBookmarks)
- [x] **2.10** 찜 추가 (createBookmark)
- [x] **2.11** 찜 삭제 (deleteBookmark)
- [x] **2.12** 찜 목록 UI 바인딩
- [x] **2.13** 일일 조회권 남은 횟수 조회
- [x] **2.14** 연락처 공개 시 로그·조회권 차감
- [x] **2.15** 프로필 API (GET/POST/PUT)

### Phase 3: Interaction & Feedback

- [x] **3.1** 로그인 실패·OAuth 에러 처리
- [x] **3.2** 세션 만료·미인증 시 리다이렉트
- [x] **3.3** 프로필 없음(온보딩 유도)
- [x] **3.4** 프로필 조회 실패·빈 상태
- [x] **3.5** 온보딩 폼 유효성 검사
- [x] **3.6** 온보딩 저장 실패 처리
- [x] **3.7** 피드 로딩·빈 목록·에러
- [x] **3.8** 찜 추가/삭제 피드백
- [x] **3.9** 연락처 공개 성공·한도 초과
- [x] **3.10** 로그아웃 후 상태 정리

---

## 구현 순서 권장 (컨펌용)

- **Phase 1**  
  **1.1** → **1.2** → **1.3** → **1.4** → **1.5** → **1.6** → **1.7** → **1.8** → **1.9** → **1.10** → **1.11**

- **Phase 2**  
  **2.1** → **2.2** → **2.3** → **2.4** → **2.5** → **2.6** → **2.7** → **2.8** → **2.9** → **2.10** → **2.11** → **2.12** → **2.13** → **2.14** → **2.15**

- **Phase 3**  
  **3.1** ~ **3.10** 은 Phase 2 항목과 병행하거나, 해당 기능 구현 직후에 붙여서 컨펌.

---

## 참고

- **DB 테이블**: `profiles`, `matching_posts`, `view_logs`, `bookmarks`, `daily_limits` (docs/supabase-schema.sql, db-schema.md)
- **인증**: Supabase Auth + Google OAuth. 세션은 쿠키, Server/Middleware/Browser 클라이언트로 일관 갱신.
- **RLS**: profiles 본인만, matching_posts 동일 dormitory+is_active, bookmarks/view_logs/daily_limits 본인만.
- **로드맵**: `docs/roadmap.md` (Supabase SDK + Google OAuth 단계별 계획)

---

**문서 버전**: 1.0  
**작성일**: 2026-01-31  
**용도**: Data Binding 단계 기능적 흐름 리스트, 단계별 컨펌 후 구현
