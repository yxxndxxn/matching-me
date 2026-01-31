# tmp-v0 이식 후 확인 요약

## 1. package.json 추가된 의존성

**이번 이식에서 새로 추가한 패키지: 없음**

- tmp-v0에만 있던 패키지: `@emotion/is-prop-valid`, `@vercel/analytics`, `autoprefixer`  
  → 프로젝트에 이미 필요한 Radix/UI/빌드 설정이 있어 추가하지 않았습니다.
- 기존 프로젝트 의존성 유지 (next 16.1.6, react 19.2.3, tailwind 4 등).

Vercel Analytics를 쓰려면 수동 설치 후 사용하세요:

```bash
pnpm add @vercel/analytics
```

## 2. pnpm install 실행 필요 여부

**필요 없음.**  
의존성 목록을 바꾸지 않았으므로, 이미 `pnpm install`을 한 상태라면 다시 실행할 필요 없습니다.

## 3. 충돌된(백업된) 파일 목록

아래 파일들은 **backup/** 에 보관했고, 현재 프로젝트에는 V0 기준으로 덮어쓴 상태입니다.

| 백업 경로 | 비고 |
|-----------|------|
| `backup/app/page.tsx` | 기존 Next.js 기본 홈 → V0 단일 페이지 앱(로그인/온보딩/메인)으로 교체 |
| `backup/app/globals.css` | 기존 단순 테마 → V0 풀 테마(oklch, sidebar 변수 등)로 교체 |
| `backup/components/domain/feed/candidate-card.tsx` | 스텁 → V0 CandidateCard(매칭 점수, 찜 등)로 교체 |
| `backup/components/domain/feed/filter-bar.tsx` | 스텁 → V0 FilterBar(관/성별/계열/학년/흡연)로 교체 |
| `backup/components/domain/profile/profile-card.tsx` | 스텁 → V0 ProfileCard(범용 카드)로 교체 |
| `backup/components/domain/profile/profile-detail-view.tsx` | 스텁 → V0 ProfileDetailView(연락처 공개 등)로 교체 |
| `backup/components/providers/theme-provider.tsx` | 스텁 → next-themes ThemeProvider로 교체 |

원래 내용이 필요하면 `backup/` 에서 복원하면 됩니다.

## 4. 이식된 구조 요약

- **components/**  
  - V0: `bottom-nav`, `empty-state`, `home-view`, `login-screen`, `onboarding`, `profile-view`, `tab-menu`, `candidate-card`(domain/feed), `filter-bar`(domain/feed), `profile-card`(domain/profile), `profile-detail-view`(domain/profile), `theme-provider`(providers)  
  - 공통: `common/AppShell`, `common/Sidebar`, `common/BottomNav`(경로 기반) 유지
- **app/**  
  - `page.tsx`: V0 단일 페이지(로그인 → 온보딩 → 메인, activeTab 등 상태 유지)  
  - `layout.tsx`: 기존 AppShell + Toaster 병합  
  - `globals.css`: V0 풀 테마 적용
- **lib/**  
  - `lib/types.ts`: V0 UserProfile, 샘플 데이터, 헬퍼 추가
- **hooks/**  
  - `hooks/use-mobile.ts`: V0 useIsMobile 추가
- **public/**  
  - tmp-v0의 public 리소스 복사 시도(이미 있으면 유지)
- **styles/**  
  - `styles/globals.css`: V0 스타일용 복사본 생성
- **tsconfig.json / components.json**  
  - 기존 설정 유지(V0과 동일한 alias 등은 이미 반영된 상태)
- **tailwind.config**  
  - 양쪽 모두 Tailwind 4 + PostCSS 사용, 별도 tailwind.config 없음 → 병합 없음

## 5. 참고 사항

- **app/page.tsx**  
  - 루트 경로(`/`)는 V0 스타일 단일 페이지(로그인 → 온보딩 → 메인)입니다.  
  - 기존 (auth)/(onboarding)/(dashboard) 라우트는 그대로 두었으므로, 필요하면 라우팅 정책을 나중에 맞춰 조정하면 됩니다.
- **Sidebar / BottomNav**  
  - `common/Sidebar`, `common/BottomNav`(경로 기반)는 AppShell에서 사용.  
  - V0 단일 페이지용 `components/bottom-nav.tsx`(activeTab/onTabChange)는 `app/page.tsx`에서만 사용합니다.
- **lib/types.ts**  
  - `UserProfile`에 `university`, `personality` 필드는 없습니다.  
  - profile-view, profile-detail-view 등은 `getDormitoryLabel(profile.dormitory)` 등으로 표시하도록 맞춰 두었습니다.
