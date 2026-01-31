# 매칭미? (Matching Me?)

> 나와 맞는 룸메이트를 찾아보세요

매칭미?는 남도학숙 재사생생을 위한 룸메이트 매칭 플랫폼입니다. Google 소셜 로그인을 통해 간편하게 가입하고, AI가 분석한 매칭 포인트를 확인하여 나와 잘 맞는 룸메이트를 찾을 수 있습니다.

## ✨ 주요 기능

### Phase 1 (MVP) - 현재 구현 중

- 🔐 **Google 소셜 로그인**: 간편한 인증 및 가입
- 📝 **3단계 온보딩**: 기본 정보, 연락처, 라이프스타일 입력
- 🏠 **소속관 기반 데이터 격리**: 동작관/은평관 분리된 피드
- 🤖 **AI 매칭 요약**: 사용자 패턴 비교를 통한 "우리는 이런 점이 잘 맞아요" 자동 생성
- 📋 **필터링**: 관, 성별, 계열, 학년, 흡연여부로 필터링
- 🔍 **탭 전환**: 전체 매칭 / AI 추천 (matchScore >= 80)
- 👤 **프로필 상세 조회**: 상대방의 라이프 패턴 상세 정보 확인
- 📞 **연락처 공개**: 전화번호 및 카카오톡 ID 확인

### Phase 2 (고도화) - 예정

- ⏰ **조회권 시스템**: 일일 연락처 조회 횟수 제한 (최대 3회)
- ✅ **매칭 완료 상태 관리**: 매칭 완료 시 피드에서 숨기기
- 🔎 **상세 필터링**: 잠버릇, 청결도 등 복합 조건 필터
- ⭐ **찜하기**: 나중에 연락하고 싶은 유저 저장
- 📸 **이미지 업로드**: 프로필 사진 업로드 및 관리
- 🎨 **스켈레톤 UI**: 로딩 상태 개선
- 🔒 **개인정보 마스킹**: 조회권 사용 전 연락처 뒷자리 마스킹

## 🛠️ 기술 스택

### Frontend
- **Next.js 15** (App Router) - React 프레임워크
- **TypeScript** - 타입 안정성
- **Tailwind CSS 4.x** - 유틸리티 기반 스타일링
- **shadcn/ui** - UI 컴포넌트 라이브러리
- **Framer Motion** - 애니메이션
- **Lucide React** - 아이콘

### Backend & Database
- **Supabase** - PostgreSQL 데이터베이스 및 인증
- **Google OAuth 2.0** - 소셜 로그인
- **OpenAI API** - AI 매칭 요약 생성

### 배포
- **Vercel** - 호스팅 및 CI/CD

## 🚀 시작하기

### 사전 요구사항

- Node.js 18.x 이상
- pnpm (권장) 또는 npm/yarn
- Supabase 계정
- Google OAuth 클라이언트 ID
- OpenAI API 키

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
   
   `.env.local` 파일을 생성하고 다음 변수들을 설정하세요:
   ```env
   # Supabase
   NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
   NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
   SUPABASE_SERVICE_ROLE_KEY=your_service_role_key

   # Google OAuth
   GOOGLE_CLIENT_ID=your_google_client_id
   GOOGLE_CLIENT_SECRET=your_google_client_secret

   # OpenAI
   OPENAI_API_KEY=your_openai_api_key
   ```

4. **개발 서버 실행**
   ```bash
   pnpm dev
   ```

5. **브라우저에서 확인**
   
   [http://localhost:3000](http://localhost:3000)에서 애플리케이션을 확인할 수 있습니다.

## 📁 프로젝트 구조

```
matching-me/
├── app/                    # Next.js App Router
│   ├── (auth)/            # 인증 관련 라우트
│   ├── (dashboard)/       # 메인 앱 라우트
│   │   ├── feed/         # 매칭 피드
│   │   └── profile/      # 프로필 페이지
│   └── (onboarding)/     # 온보딩 라우트
├── components/
│   ├── ui/               # 공통 UI 컴포넌트 (shadcn/ui)
│   ├── domain/          # 도메인별 비즈니스 컴포넌트
│   │   ├── auth/        # 인증 컴포넌트
│   │   ├── feed/        # 피드 컴포넌트
│   │   ├── onboarding/ # 온보딩 컴포넌트
│   │   └── profile/     # 프로필 컴포넌트
│   └── common/          # 공통 레이아웃 컴포넌트
├── lib/
│   ├── supabase/        # Supabase 클라이언트 및 쿼리
│   ├── ai/              # AI 관련 유틸리티
│   └── utils/           # 유틸리티 함수
├── hooks/               # 커스텀 React 훅
├── types/               # TypeScript 타입 정의
└── docs/                # 프로젝트 문서
    ├── PRD.md           # 제품 요구사항 명세서
    ├── FLOW.md          # 사용자 플로우 및 아키텍처
    └── tech-stack.md    # 기술 스택 상세 명세
```

## 🎨 디자인 컨셉

- **컨셉**: Clean & Trust (신뢰)
- **컬러**: Blue & White 톤
- **레이아웃**: 수직 스크롤 피드 (에어비앤비/당근마켓 스타일)
- **카드 디자인**: 핵심 태그 + AI 매칭 포인트 요약

## 📊 데이터 모델

인증은 Supabase Auth(`auth.users`) 사용, 별도 `users` 테이블 없음.

주요 테이블:
- `profiles` - 사용자 프로필 (id = auth.uid())
- `matching_posts` - 매칭 게시글 및 AI 요약
- `view_logs` - 연락처 조회 로그 (Phase 2)
- `bookmarks` - 찜하기 목록 (Phase 2)
- `daily_limits` - 일일 조회권 관리 (Phase 2)

- 스키마/RLS: [docs/db-schema.md](./docs/db-schema.md), [docs/supabase-schema.sql](./docs/supabase-schema.sql)  
- 시드 데이터: [docs/seed_data_matching_me.sql](./docs/seed_data_matching_me.sql) (5개 테이블 샘플)

## 🔄 사용자 플로우

1. **로그인**: Google 소셜 로그인
2. **온보딩**: 3단계 프로필 등록
   - Step 1: 기본 정보 (이름, 성별, 계열, 학년, 소속관)
   - Step 2: 연락처 (전화번호, 카카오톡 ID)
   - Step 3: 라이프스타일 (생활패턴, 잠버릇, 흡연여부 등)
3. **메인 피드**: 소속관 기반 필터링된 매칭 카드 확인
4. **필터링**: 관, 성별, 계열, 학년, 흡연여부로 필터링
5. **프로필 상세**: 상대방의 상세 정보 확인 및 연락처 공개

자세한 플로우는 [FLOW.md](./docs/FLOW.md)를 참고하세요.

## 🧪 개발

### 빌드
```bash
pnpm build
```

### 프로덕션 실행
```bash
pnpm start
```

### 린트
```bash
pnpm lint
```

## 📚 문서

- [PRD.md](./docs/PRD.md) - 제품 요구사항 명세서
- [FLOW.md](./docs/FLOW.md) - 사용자 플로우 및 아키텍처 다이어그램
- [tech-stack.md](./docs/tech-stack.md) - 기술 스택 상세 명세
- [current-structure.md](./docs/current-structure.md) - 현재 프로젝트 구조

## 🚢 배포

### Vercel 배포

1. Vercel에 프로젝트 연결
2. 환경 변수 설정
3. 자동 배포 완료

자세한 배포 방법은 [Next.js 배포 문서](https://nextjs.org/docs/app/building-your-application/deploying)를 참고하세요.

## 📝 라이선스

이 프로젝트는 개인 프로젝트입니다.

## 👥 기여

이슈 및 개선 사항은 이슈 트래커를 통해 제안해주세요.

---

**작성일**: 2026-01-30  
**버전**: 1.0.0
