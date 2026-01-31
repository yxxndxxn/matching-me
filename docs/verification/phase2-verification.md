# Phase 2 구현 검증 및 테스트

**검증일**: 2026-02-01  
**대상**: functional_flow.md Phase 2 (2.1 ~ 2.15) Core Logic

---

## 1. 스펙 대조 검증

| # | 항목 | 스펙 요구 | 구현 위치 | 검증 결과 |
|---|------|-----------|-----------|-----------|
| 2.1 | 프로필 단건 조회 | `profiles` SELECT by id → ProfileRow | lib/supabase/queries/profiles.ts `getProfile()` | ✅ `.from('profiles').select('*').eq('id', userId).single()` |
| 2.2 | 프로필 생성 (온보딩) | 폼 데이터 → profiles INSERT, id=auth.uid() | profiles.ts `createProfile()`, onboarding/page.tsx | ✅ createProfile(profileInsert), RLS 본인 INSERT |
| 2.3 | 매칭 게시글 1건 생성 | user_id, dormitory, ai_summary(nullable) → matching_posts INSERT | matching-posts.ts `createMatchingPost()`, onboarding/page.tsx | ✅ 온보딩 완료 시 createProfile 후 createMatchingPost 호출 |
| 2.4 | 프로필 수정 | userId + 부분 필드 → profiles UPDATE | profiles.ts `updateProfile()` | ✅ `.update(data).eq('id', userId)` |
| 2.5 | 마이페이지 프로필 바인딩 | session.user.id → getProfile → ProfileView | hooks/use-profile.ts, components/profile-view.tsx | ✅ useProfile() → profile/loading/error, ProfileView에 profile 바인딩 |
| 2.6 | 피드 목록 조회 (소속관 격리) | matching_posts + profiles 조인, is_active, RLS dormitory | lib/supabase/queries/matching-posts.ts `getMatchingPosts()` | ✅ posts 조회 후 profiles 별도 조회, FeedItem[] 반환 |
| 2.7 | 피드 목록 상태·UI 바인딩 | 쿼리 결과 → useMatchingFeed → FeedList/CandidateCard | hooks/use-matching-feed.ts, feed-list.tsx | ✅ useMatchingFeed(feedFilters), displayedCandidates → CandidateCard |
| 2.8 | 필터 조건 반영 | FilterBar 상태 → getMatchingPosts(filters) 재페칭 | filter-bar.tsx FilterState, feed-list feedFilters → useMatchingFeed | ✅ dormitory/gender/major_category/grade/smoking 필터, useMemo로 feedFilters 전달 |
| 2.9 | 찜 목록 조회 | bookmarks WHERE user_id → matching_posts+profiles 조인 | lib/supabase/queries/bookmarks.ts `getBookmarks()` | ✅ `.from('bookmarks').select('*, matching_posts(*)')`, profiles 별도 조회 |
| 2.10 | 찜 추가 | user_id, post_id → bookmarks INSERT | bookmarks.ts `createBookmark()`, useBookmarks().add | ✅ insert({ user_id, post_id }), add(postId) 후 refetch |
| 2.11 | 찜 삭제 | user_id, post_id → bookmarks DELETE | bookmarks.ts `deleteBookmark()`, useBookmarks().remove | ✅ .delete().eq().eq() |
| 2.12 | 찜 목록 UI 바인딩 | getBookmarks → useBookmarks → SavedRoommatesPage / bookmarks 페이지 | profile-view.tsx SavedRoommatesPage, profile/bookmarks/page.tsx | ✅ useBookmarks, bookmarks 페이지에서 리스트 + ProfileDetailView |
| 2.13 | 일일 조회권 남은 횟수 | auth.uid() + today → daily_limits SELECT, 3 - reveals_used | lib/supabase/queries/view-logs.ts `getRemainingReveals()`, useDailyLimit | ✅ .from('daily_limits').eq().eq().single(), MAX_DAILY_REVEALS=3 |
| 2.14 | 연락처 공개 시 로그·조회권 차감 | POST reveal-contact → view_logs INSERT + daily_limits UPSERT | api/matching/reveal-contact/route.ts, view-logs.ts, useContactReveal | ✅ getRemainingReveals 검사 후 createViewLog, incrementRevealsUsed, refetchDaily |
| 2.15 | 프로필 API (GET/POST/PUT) | 세션 검증 → profiles SELECT/INSERT/UPDATE → JSON | app/(dashboard)/api/profile/route.ts | ✅ getUser(), getProfile/createProfile/updateProfile, 401/400 처리 |

---

## 2. 빌드·린트·타입 검증

- **`pnpm run build`**: ✅ 성공 (Exit code 0, 2026-02-01 검증)
- 검증 중 수정한 사항:
  - **onboarding/page.tsx**: `createMatchingPost` 호출 시 `MatchingPostInsert` 필수 필드 `match_score: null`, `is_active: true` 추가
  - **profile-view.tsx**: `profile`이 null일 수 있으므로 `majorCategoryLabel` 계산 시 `profile ? getMajorCategoryLabel(profile.majorCategory) : ""` 로 null 체크
  - **login/page.tsx**: `useSearchParams()` 사용으로 인한 prerender 오류 → `LoginContent`를 `Suspense`로 감싸서 해결

로컬에서 추가 확인 시:
- **`pnpm exec tsc --noEmit`**: 타입 검사
- **`pnpm run lint`**: ESLint

---

## 3. 연결 관계 검증

- **온보딩 페이지** → `createClient`(client) → `createProfile` + `createMatchingPost` ✅  
- **ProfileView** → `useAuth` + `useProfile` → getProfile(uid) → DB 데이터 바인딩 ✅  
- **FeedList** → `useMatchingFeed(feedFilters)` → `getMatchingPosts(supabase, filters)` ✅  
- **FilterBar** → `onFilterChange` → feed-list의 `setFilters` → `feedFilters` 변경 시 useMatchingFeed 재페칭 ✅  
- **찜 추가/삭제** → `useBookmarks().add/remove` → createBookmark/deleteBookmark → refetch ✅  
- **연락처 공개** → `useContactReveal().reveal(postId)` → `POST /api/matching/reveal-contact` → createViewLog + incrementRevealsUsed ✅  
- **프로필 API** → `createClient`(server) → getUser → getProfile/createProfile/updateProfile ✅  

---

## 4. 수동 테스트 체크리스트

아래는 로컬에서 `pnpm dev` 실행 후 브라우저·DB로 확인할 항목입니다.

### 4.1 환경 준비

- [ ] Phase 1 검증 완료 (로그인·세션·라우트 보호 동작)
- [ ] `.env.local` 3종 설정 확인
- [ ] Supabase에 테이블 `profiles`, `matching_posts`, `bookmarks`, `view_logs`, `daily_limits` 및 RLS 정책 적용됨

### 4.2 프로필·온보딩 (2.1, 2.2, 2.3, 2.4)

- [ ] **신규 로그인** 후 프로필 없으면 `/onboarding`으로 이동하는지
- [ ] 온보딩 3단계 제출 시  
  - [ ] `profiles` 테이블에 1건 INSERT되는지 (Supabase Table Editor에서 확인)  
  - [ ] `matching_posts` 테이블에 해당 user_id로 1건 INSERT되는지  
  - [ ] `/feed`로 리다이렉트되는지
- [ ] **마이페이지(/profile)** 접속 시  
  - [ ] 본인 프로필(이름, 관, 계열 등)이 DB 데이터로 표시되는지  
  - [ ] 프로필 없으면 로딩/에러 처리되는지
- [ ] **프로필 수정** (편집 후 저장) 시 `profiles` UPDATE가 반영되는지

### 4.3 피드·필터 (2.6, 2.7, 2.8)

- [ ] `/feed` 접속 시  
  - [ ] 동일 dormitory(RLS 기준)의 매칭 게시글 목록이 보이는지  
  - [ ] 로딩 시 스켈레톤/빈 목록/에러 UI가 적절히 나오는지
- [ ] **필터** (관/성별/계열/학년/흡연) 변경 시 목록이 필터 조건에 맞게 갱신되는지
- [ ] 탭 "AI 추천" 선택 시 match_score >= 80 등 필터가 적용되는지

### 4.4 찜 (2.9, 2.10, 2.11, 2.12)

- [ ] 피드에서 **찜 추가** 시  
  - [ ] "찜 목록에 추가했어요" 토스트 노출  
  - [ ] `bookmarks` 테이블에 1건 INSERT되는지  
  - [ ] 카드/UI에서 찜 상태가 반영되는지
- [ ] **찜 해제** 시 bookmarks DELETE 및 UI에서 제거되는지
- [ ] **프로필 → 내가 찜한 룸메이트** (또는 `/profile/bookmarks`) 접속 시  
  - [ ] 찜한 프로필 목록이 DB 기준으로 표시되는지  
  - [ ] 항목 클릭 시 상세(ProfileDetailView)로 이동하는지

### 4.5 일일 조회권·연락처 공개 (2.13, 2.14)

- [ ] **연락처 확인** 버튼 클릭 시  
  - [ ] 남은 횟수가 있으면 연락처가 노출되고, "오늘 N회 남음" 등 갱신되는지  
  - [ ] `view_logs`에 1건 INSERT, `daily_limits`에 reveals_used가 증가하는지 (Table Editor 확인)
- [ ] **일일 3회 사용 후** 다시 연락처 확인 시도 시  
  - [ ] "오늘의 조회 한도를 초과했습니다" 메시지(또는 400 응답)가 나오는지  
  - [ ] 연락처가 추가로 공개되지 않는지

### 4.6 프로필 API (2.15)

- [ ] **GET /api/profile** (로그인 상태): 200 + 본인 프로필 JSON 또는 null
- [ ] **GET /api/profile** (미로그인): 401
- [ ] **POST /api/profile** (본인 프로필 생성): 200 + { ok: true }
- [ ] **PUT /api/profile** (본인 프로필 수정): 200 + { ok: true }
- [ ] 미로그인 시 POST/PUT: 401

*(API 테스트는 브라우저 개발자 도구 Network 탭 또는 curl/Postman으로 확인)*

---

## 5. 알려진 주의사항

- **필터 적용 위치**: `getMatchingPosts`는 서버에서 `matching_posts` 전체(is_active) 조회 후, 조인한 profiles 기준으로 **클라이언트 측 필터링**을 수행합니다. RLS가 dormitory 격리를 보장하므로, 대량 데이터 시에는 필터를 쿼리 파라미터로 넘겨 서버에서 `.eq()` 등으로 조회하도록 개선할 수 있습니다.
- **찜 UNIQUE**: `bookmarks (user_id, post_id)` 중복 INSERT 시 DB 제약으로 에러가 날 수 있습니다. 필요 시 `upsert` 또는 ON CONFLICT DO NOTHING 처리 검토.
- **연락처 공개**: 현재 API는 연락처 값(기타 연락처/카카오)을 응답에 포함하지 않습니다. 클라이언트에서 "공개됨" 상태만 표시하고, 실제 연락처 노출은 별도 API(예: GET reveal-contact?postId=) 또는 프로필 조회 시 contact_revealed 플래그에 따른 필드 노출로 확장할 수 있습니다.

---

## 6. 요약

- Phase 2 스펙 15개 항목(2.1 ~ 2.15) 모두 구현 위치·데이터 흐름이 functional_flow.md와 일치함.
- 빌드·린트·타입 검증은 로컬에서 `tsc --noEmit`, `pnpm run lint`, `pnpm run build` 실행으로 확인 권장.
- 수동 테스트 체크리스트(4.1 ~ 4.6)는 로컬에서 `pnpm dev` 후 브라우저 및 Supabase Table Editor로 확인하면 됨.
