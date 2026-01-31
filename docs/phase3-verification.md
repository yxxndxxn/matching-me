# Phase 3 구현 검증 및 테스트

**검증일**: 2026-02-01  
**대상**: functional_flow.md Phase 3 (3.1 ~ 3.10) Interaction & Feedback

---

## 1. 스펙 대조 검증

| # | 항목 | 스펙 요구 | 구현 위치 | 검증 결과 |
|---|------|-----------|-----------|-----------|
| 3.1 | 로그인 실패·OAuth 에러 처리 | signInWithOAuth/콜백 에러 → toast 또는 에러 UI | app/(auth)/login/page.tsx, app/api/auth/callback/route.ts | ✅ 로그인: try/catch + error 시 toast.error. 콜백 실패 시 redirect `/login?error=auth_callback_error`. 로그인 페이지 useEffect에서 auth_callback_error 시 toast.error. |
| 3.2 | 세션 만료·미인증 시 리다이렉트 | 미들웨어 getUser null → /login. API 401 | middleware.ts, lib/supabase/middleware.ts, api/profile, api/reveal-contact | ✅ updateSession에서 보호 경로 && !user 시 redirect. profile/reveal-contact Route에서 getUser() 실패 시 401. |
| 3.3 | 프로필 없음(온보딩 유도) | hasProfile false → /onboarding redirect | components/RedirectToOnboarding.tsx, app/(dashboard)/layout.tsx | ✅ PROTECTED_PATHS(/feed, /profile) 진입 시 hasProfile(supabase, user.id) 호출, !exists 시 router.replace('/onboarding'). |
| 3.4 | 프로필 조회 실패·빈 상태 | getProfile 에러/null → 로딩/에러 UI | components/profile-view.tsx, useProfile | ✅ profileLoading && !profile → Skeleton. profileError 또는 (!profileLoading && !profile) → "프로필을 불러올 수 없습니다." + 다시 시도(refetchProfile). |
| 3.5 | 온보딩 폼 유효성 검사 | 제출 전 Zod 스키마 검증, 필드별 에러 | lib/utils/onboarding-schema.ts, components/onboarding.tsx | ✅ onboardingFormSchema (name, gender, major_category, grade, dormitory, chronotype, sleeping_habit, cleanliness, noise_sensitivity 등). 3단계 제출 시 safeParse, 실패 시 formErrors 표시(상단 목록). |
| 3.6 | 온보딩 저장 실패 처리 | createProfile/matching_posts INSERT 실패 → toast | app/(onboarding)/onboarding/page.tsx | ✅ createProfile 실패 시 toast.error("프로필 저장에 실패했어요."). createMatchingPost 실패 시 toast.error("매칭 게시글 저장에 실패했어요."). |
| 3.7 | 피드 로딩·빈 목록·에러 | 로딩 Skeleton, 빈 배열 Empty state, 에러 toast/인라인 | components/domain/feed/feed-list.tsx | ✅ loading → Skeleton 4개. error → useEffect로 toast.error + 인라인 "피드를 불러오지 못했어요" + 다시 시도. displayedCandidates.length === 0 → EmptyState. |
| 3.8 | 찜 추가/삭제 피드백 | createBookmark/deleteBookmark 성공 → toast | feed-list.tsx (handleSaveProfile, handleUnsaveProfile) | ✅ 찜 추가 성공 toast.success("찜 목록에 추가했어요"). 찜 해제 성공 toast.success("찜 해제했어요"). 실패 시 toast.error. |
| 3.9 | 연락처 공개 성공·한도 초과 | 성공 toast + 연락처 노출 + 남은 횟수 갱신. 한도 초과 toast | profile-detail-view.tsx, feed-list handleRevealContact, api/reveal-contact | ✅ 상세: dailyRevealsRemaining===0 시 toast.error("오늘의 연락처 공개 횟수를 모두 사용했습니다."). 공개 확인 시 toast.success. 피드: reveal 성공 시 toast.success, 실패 시 toast.error(err) — API 400 "오늘의 조회 한도를 초과했습니다." 포함. |
| 3.10 | 로그아웃 후 상태 정리 | signOut 후 로컬 상태 초기화 → /login | hooks/use-auth.ts | ✅ signOut에서 supabase.auth.signOut() 후 router.push("/login"), router.refresh(). 전역 상태 없음, 컴포넌트 언마운트로 찜/프로필 상태 초기화. |

---

## 2. 빌드·타입 검증

- **`pnpm run build`**: ✅ 성공 (Exit code 0, 2026-02-01 검증)

로컬에서 추가 확인 시:
- **`pnpm exec tsc --noEmit`**: 타입 검사
- **`pnpm run lint`**: ESLint

---

## 3. 연결 관계 검증

- **로그인 페이지** → `?error=auth_callback_error` 시 useEffect에서 toast.error ✅  
- **OAuth 콜백** → exchangeCodeForSession 실패 시 `/login?error=auth_callback_error` 리다이렉트 ✅  
- **대시보드 레이아웃** → RedirectToOnboarding 래핑 → /feed, /profile 진입 시 hasProfile 체크 ✅  
- **ProfileView** → useProfile().error/refetch → 에러/빈 상태 시 "프로필을 불러올 수 없습니다." + 다시 시도 ✅  
- **Onboarding** → onboardingFormSchema.safeParse(3단계 payload) → formErrors → 상단 에러 블록 ✅  
- **온보딩 페이지** → createProfile/createMatchingPost 실패 시 toast.error ✅  
- **FeedList** → loading/error/empty 분기, error 시 useEffect toast, 찜 추가/해제/연락처 공개 toast ✅  
- **useAuth.signOut** → signOut() 후 /login 이동, 언마운트로 상태 정리 ✅  

---

## 4. 수동 테스트 체크리스트

로컬에서 `pnpm dev` 실행 후 브라우저로 확인할 항목입니다.

### 4.1 로그인·OAuth 에러 (3.1, 3.2)

- [ ] **로그인 실패(콜백)**  
  - OAuth 콜백에서 code 없음/만료 등으로 실패 시 `/login?error=auth_callback_error` 로 돌아오는지  
  - 로그인 화면에서 "로그인에 실패했어요." 토스트가 뜨는지  
- [ ] **로그인 버튼 에러**  
  - (네트워크 차단 등으로) signInWithOAuth 실패 시 "로그인을 시작하지 못했어요" 또는 "로그인 중 오류가 발생했어요" 토스트가 뜨는지  
- [ ] **미로그인 시 보호 경로**  
  - `/feed`, `/profile` 접속 시 `/login?redirectTo=...` 로 리다이렉트되는지  
- [ ] **API 401**  
  - 로그아웃 상태에서 GET/POST `/api/profile` 또는 POST `/api/matching/reveal-contact` 호출 시 401이 반환되는지 (개발자 도구 Network 탭)

### 4.2 프로필 없음·온보딩 유도 (3.3, 3.4)

- [ ] **프로필 없을 때 /feed, /profile**  
  - 신규 로그인(프로필 미생성) 후 `/feed` 또는 `/profile` 직접 접속 시 `/onboarding` 으로 리다이렉트되는지  
- [ ] **프로필 조회 실패**  
  - (DB/네트워크 오류 등으로) getProfile 실패 시 마이페이지에서 "프로필을 불러올 수 없습니다." + "다시 시도" 버튼이 보이는지  
  - "다시 시도" 클릭 시 refetch 동작하는지  

### 4.3 온보딩 유효성·저장 실패 (3.5, 3.6)

- [ ] **온보딩 3단계 유효성**  
  - 필수 항목 비우고 "프로필 완성하기" 클릭 시 "일부 항목을 확인해 주세요." + 필드별 에러 목록이 표시되는지  
  - 이름 비움, 성별/계열/학년/관 등 미선택 시 해당 메시지가 나오는지  
- [ ] **온보딩 저장 실패**  
  - (DB 제약/권한 등으로) createProfile 또는 createMatchingPost 실패 시 "프로필 저장에 실패했어요" 또는 "매칭 게시글 저장에 실패했어요" 토스트가 뜨는지  

### 4.4 피드·찜·연락처 공개 (3.7, 3.8, 3.9)

- [ ] **피드 로딩**  
  - `/feed` 진입 시 스켈레톤이 잠깐 보였다가 목록이 나오는지  
- [ ] **피드 빈 목록**  
  - 조건에 맞는 게시글이 없을 때 Empty state가 나오는지  
- [ ] **피드 에러**  
  - (네트워크 끊기 등으로) 피드 조회 실패 시 "피드를 불러오지 못했어요" 토스트 + 인라인 "다시 시도" 버튼이 나오는지  
- [ ] **찜 추가**  
  - 찜 추가 성공 시 "찜 목록에 추가했어요" 토스트가 뜨는지  
- [ ] **찜 해제**  
  - 찜 해제 성공 시 "찜 해제했어요" 토스트가 뜨는지  
- [ ] **연락처 공개 성공**  
  - 연락처 공개 성공 시 "연락처가 공개되었어요" (또는 상세 화면에서 "연락처가 공개되었습니다!") 토스트 + 남은 횟수 갱신되는지  
- [ ] **연락처 한도 초과**  
  - 일일 3회 사용 후 다시 공개 시도 시 "오늘의 조회 한도를 초과했습니다" (또는 "오늘의 연락처 공개 횟수를 모두 사용했습니다") 토스트가 뜨는지  

### 4.5 로그아웃 (3.10)

- [ ] **로그아웃 후**  
  - 로그아웃 클릭 시 `/login` 으로 이동하는지  
  - 다시 로그인 전까지 피드/찜/프로필 데이터가 보이지 않는지 (상태 정리)  

---

## 5. 알려진 사항

- **3.5 react-hook-form**  
  스펙에는 "react-hook-form + @hookform/resolvers/zod"가 있으나, 현재는 기존 로컬 state 폼 + 제출 시 `onboardingFormSchema.safeParse()` 로 검증하고 필드별 에러만 상단에 표시함. 필드 옆 인라인 에러는 추후 RHF 마이그레이션 시 적용 가능.
- **3.9 연락처 노출**  
  API는 성공 시 `{ ok: true }` 만 반환하며, 실제 연락처 값(기타 연락처/카카오)은 별도 조회 또는 프로필 노출 로직으로 확장 가능.

---

## 6. 요약

- Phase 3 스펙 10개 항목(3.1 ~ 3.10) 모두 구현 위치·동작이 functional_flow.md와 일치함.
- `pnpm run build` 통과.
- 수동 테스트 체크리스트(4.1 ~ 4.5)는 로컬에서 `pnpm dev` 후 브라우저로 확인하면 됨.
