# 통합 검증 (상용화 준비)

**검증일**: 2026-02-01  
**목적**: 전체 기능 정상 작동 확인 및 에러 방지

---

## 1. 적용한 수정 사항

### 1.1 라우팅·미들웨어

- **루트 "/" 리다이렉트**: 미들웨어에서 `pathname === "/"` 일 때  
  - 미로그인 → `/login`  
  - 로그인 → `/feed`  
  로 리다이렉트하도록 추가.
- **루트 페이지 폴백**: `app/page.tsx`는 미들웨어를 거치지 않은 경우를 위해 "리다이렉트 중..." 표시 후 클라이언트에서 `/login`으로 `replace`.

### 1.2 사이드바 조회권 표시

- **Sidebar**: `dailyRevealsRemaining` prop 제거, 내부에서 `useDailyLimit()`로 실제 남은 횟수 조회.
- **Dashboard layout**: `AppShell`에 `dailyRevealsRemaining={3}` 전달 제거.

### 1.3 API 에러 처리

- **POST/PUT /api/profile**: `request.json()` try/catch, 잘못된 JSON 시 400. POST 시 `name` 필수 검증.
- **POST /api/matching/reveal-contact**: `request.json()` try/catch, `postId` 빈 문자열 검증 추가.
- **GET /api/auth/callback**: `createClient()` 및 `exchangeCodeForSession` try/catch, 실패 시 `/login?error=auth_callback_error` 리다이렉트 유지.

### 1.4 훅 안정성

- **useDailyLimit**: `getRemainingReveals` 실패 시 `remaining`을 3으로 유지하도록 catch 추가 (Sidebar 등에서 크래시 방지).

---

## 2. 빌드·타입·린트 검증

- **`pnpm run build`**: ✅ 성공 (Exit code 0)
- **`pnpm run lint`**: ✅ 통과 (에러 0, 경고만 존재. tmp-v0는 레거시 참고용으로 ESLint 제외)

로컬 추가 확인:

- **`pnpm exec tsc --noEmit`**: 타입 검사

---

## 3. 주요 플로우 검증

| 플로우 | 검증 내용 |
|--------|-----------|
| **미로그인 접근** | `/`, `/feed`, `/profile` → 미들웨어에서 `/login?redirectTo=...` 리다이렉트 |
| **로그인 후 "/"** | 미들웨어에서 `/feed` 리다이렉트 |
| **로그인 후 /feed, /profile** | RedirectToOnboarding에서 hasProfile false 시 `/onboarding` 리다이렉트 |
| **OAuth 콜백** | code 없음/실패 시 `/login?error=auth_callback_error`, 성공 시 next 파라미터 또는 `/feed` |
| **프로필 API** | 미인증 401, 잘못된 JSON 400, POST name 필수 |
| **연락처 공개 API** | 미인증 401, postId 없음/빈 문자열 400, 한도 초과 400 |
| **사이드바** | useDailyLimit()으로 실제 남은 조회권 표시, 에러 시 3으로 폴백 |

---

## 4. 환경 변수 (상용화 필수)

- **NEXT_PUBLIC_SUPABASE_URL**: Supabase 프로젝트 URL  
- **NEXT_PUBLIC_SUPABASE_ANON_KEY**: Supabase anon key  
- **NEXT_PUBLIC_APP_URL**: 앱 URL (예: `https://your-domain.com`), OAuth 콜백 및 로그인 리다이렉트에 사용  

누락 시 `createClient()`(client/server)에서 throw 되므로, 배포 전 반드시 설정.

---

## 5. DB 마이그레이션

- **profiles**: `phone` → `other_contact` 적용 시 [database/migrations/20260201_120000_profiles_phone_to_other_contact_v1.sql](../database/migrations/20260201_120000_profiles_phone_to_other_contact_v1.sql) 실행.
- 신규 설치 시 `docs/database/supabase-schema.sql` 기준으로 `other_contact` 컬럼 사용.

---

## 6. 수동 테스트 체크리스트 (상용화 전 권장)

1. **미로그인**  
   - [ ] `/` → `/login` 리다이렉트  
   - [ ] `/dashboard`, `/profile` → `/login?redirectTo=...` 리다이렉트  

2. **Google 로그인**  
   - [ ] 로그인 성공 후 `/dashboard` 또는 next 파라미터로 이동  
   - [ ] 로그인 실패 시 `/login?error=auth_callback_error` + 토스트  

3. **온보딩**  
   - [ ] 프로필 없을 때 `/dashboard` 접근 시 `/onboarding` 리다이렉트  
   - [ ] 3단계 제출 후 `/dashboard` 이동, profiles + matching_posts 저장  

4. **피드·찜·연락처**  
   - [ ] 피드 목록 로딩/빈 목록/에러 시 UI 및 토스트  
   - [ ] 찜 추가/해제 토스트  
   - [ ] 연락처 공개 성공/한도 초과 토스트, 사이드바 "연락처 공개 N/3" 갱신  

5. **마이페이지**  
   - [ ] 프로필/기타 연락처/카카오 ID 표시, 찜 목록 이동  

6. **API**  
   - [ ] 미인증 시 GET/POST /api/profile, POST reveal-contact → 401  
   - [ ] POST /api/profile body 잘못된 JSON → 400  

---

## 7. 요약

- 루트 리다이렉트, 사이드바 실제 조회권, API·콜백·훅 예외 처리를 반영해 상용 환경에서 동작하도록 정리함.
- `pnpm run build` 통과.
- 배포 전 위 환경 변수·DB 마이그레이션·수동 체크리스트 확인 권장.
