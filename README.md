# 매칭미? (Matching me?)

> 남도학숙생을 위한 룸메이트 매칭 플랫폼

매칭미?는 남도학숙 재학생을 위한 룸메이트 매칭 서비스입니다. 남도학숙(동작관·은평관) 학숙생들과 라이프스타일 기반으로 궁합이 맞는 룸메이트를 찾을 수 있습니다.

## ✨ 주요 기능

- 🔐 **Google 소셜 로그인** – 간편한 인증 및 가입
- 📝 **3단계 온보딩** – 기본 정보, 연락처, 라이프스타일 입력
- 🏠 **소속관 기반 매칭** – 동작관/은평관 구분, 남도학숙 학숙생만 노출
- 🤖 **AI 매칭 요약** – 생활 패턴 비교를 통한 매칭 포인트 자동 생성
- 📋 **필터링** – 관, 성별, 계열, 학년, 흡연 여부로 필터링
- 🔍 **AI 추천 탭** – 매칭률 80% 이상 우선 노출
- 👤 **프로필 상세 조회** – 상대방 라이프스타일 상세 확인
- ⭐ **찜하기** – 마음에 드는 프로필 저장
- 📞 **연락처 공개** – 일일 3회 제한, 카카오톡 ID 및 기타 연락처 확인
- 🔒 **개인정보 보호** – 조회 전 연락처 마스킹, RLS 기반 데이터 보안
- 📄 **서비스 소개** – 앱 내 서비스 설명 페이지 제공

## 🛠️ 기술 스택

- **Next.js 16** (App Router) – React 프레임워크
- **TypeScript** – 타입 안정성
- **Tailwind CSS** – 스타일링
- **shadcn/ui** – UI 컴포넌트
- **Supabase** – PostgreSQL, 인증, RLS
- **Framer Motion** – 애니메이션

## 🚀 시작하기

### 사전 요구사항

- Node.js 18.x 이상
- pnpm (권장) 또는 npm/yarn
- Supabase 계정
- Google OAuth 클라이언트 ID

### 설치 및 실행

1. **저장소 클론**
   ```bash
   git clone <repository-url>
   cd matching-me
   ```

2. **의존성 설치**
   ```bash
   pnpm install
   ```

3. **환경 변수 설정**
   
   `.env.local` 파일을 생성하고 다음 변수를 설정하세요:
   ```env
   NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
   NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
   ```

4. **개발 서버 실행**
   ```bash
   pnpm dev
   ```

5. **브라우저에서 확인**
   
   [http://localhost:3000](http://localhost:3000) 에서 앱을 확인할 수 있습니다. 로그인 시 `/dashboard`로 이동합니다.

## 📁 프로젝트 구조

```
matching-me/
├── app/
│   ├── (auth)/           # 로그인
│   ├── (dashboard)/      # 메인 앱
│   │   ├── dashboard/    # 룸메이트 피드 (메인)
│   │   ├── profile/      # 마이페이지
│   │   ├── about/        # 서비스 소개
│   │   └── api/          # API 라우트
│   └── (onboarding)/     # 프로필 등록
├── components/
│   ├── ui/               # shadcn/ui 컴포넌트
│   ├── domain/           # 도메인별 컴포넌트 (feed, profile)
│   └── common/           # 사이드바, 하단 네비 등
├── lib/supabase/         # Supabase 클라이언트, 쿼리
├── hooks/                # useAuth, useProfile, useBookmarks 등
├── types/                # TypeScript 타입
└── docs/                 # 문서
    ├── product/          # 제품·기획 (PRD, roadmap)
    ├── architecture/     # 흐름·아키텍처 (FLOW, functional_flow)
    ├── database/         # DB 스키마, 마이그레이션, 시드
    ├── technical/        # 기술 스택
    ├── verification/     # 검증 체크리스트
    ├── troubleshooting/  # 트러블슈팅
    └── history/          # 변경 이력
```

## 🔄 주요 라우트

| 경로 | 설명 |
|------|------|
| `/` | 리다이렉트 (로그인 여부에 따라 `/login` 또는 `/dashboard`) |
| `/login` | Google 로그인 |
| `/onboarding` | 3단계 프로필 등록 |
| `/dashboard` | 룸메이트 피드 (메인) |
| `/profile` | 마이페이지 |
| `/profile/bookmarks` | 찜한 룸메이트 목록 |
| `/about` | 서비스 소개 |

## 📚 문서

- [docs/README.md](./docs/README.md) – 문서 인덱스
- [PRD](./docs/product/PRD.md) – 제품 요구사항
- [FLOW](./docs/architecture/FLOW.md) – 사용자 플로우
- [db-schema](./docs/database/db-schema.md) – 데이터베이스 스키마
- [트러블슈팅](./docs/troubleshooting/) – 406, 피드 빈 상태, 연락처 공개 500 등

## 🧪 개발 명령어

```bash
pnpm dev    # 개발 서버
pnpm build  # 프로덕션 빌드
pnpm start  # 프로덕션 실행
pnpm lint   # 린트 검사
```

## 📝 라이선스

이 프로젝트는 개인 프로젝트입니다.
