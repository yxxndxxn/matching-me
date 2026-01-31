# 기술 스택 명세서

## 📋 개요

매칭미? (Matching Me?) 프로젝트는 Next.js 15 App Router와 Supabase를 기반으로 구축되는 룸메이트 매칭 플랫폼입니다. 이 문서는 프로젝트에서 사용되는 주요 기술 스택과 설계 원칙을 명시합니다.

---

## 🛠️ 기술 스택

### Frontend Framework
- **Next.js 15** (App Router)
  - 서버 컴포넌트 및 클라이언트 컴포넌트 분리
  - Route Groups를 활용한 라우팅 구조화
  - API Routes를 통한 서버 사이드 로직 처리

### 언어 및 타입 시스템
- **TypeScript 5.x**
  - 엄격한 타입 체크로 런타임 에러 방지
  - 타입 안정성 보장을 위한 구조적 타입 정의

### 스타일링
- **Tailwind CSS 4.x**
  - 유틸리티 기반 CSS 프레임워크
  - 반응형 디자인 및 다크 모드 지원
  - 커스텀 디자인 시스템 구축

### UI 컴포넌트 라이브러리
- **shadcn/ui**
  - 재사용 가능한 UI 컴포넌트 세트
  - Radix UI 기반 접근성 지원
  - Tailwind CSS와 완벽 통합
  - 주요 컴포넌트:
    - Button, Card, Input, Select, Tabs
    - Skeleton (로딩 상태), Badge

### 아이콘
- **Lucide React**
  - 경량화된 아이콘 라이브러리
  - Tree-shaking 지원으로 번들 크기 최적화
  - 일관된 디자인 시스템

### Backend & Database
- **Supabase**
  - PostgreSQL 데이터베이스
  - Row Level Security (RLS) 정책을 통한 데이터 보안
  - 실시간 구독 기능 (필요시)
  - Storage API (프로필 이미지 업로드용)

### 인증
- **Supabase Auth + Google OAuth 2.0**
  - Google 소셜 로그인 통합
  - 세션 관리 및 자동 토큰 갱신
  - 서버 사이드 인증 미들웨어

### AI 서비스
- **OpenAI API**
  - GPT 모델을 활용한 매칭 요약 생성
  - 사용자 패턴 비교 및 긍정적 매칭 포인트 추출

### 애니메이션 (선택사항)
- **Framer Motion**
  - 페이지 전환 및 컴포넌트 애니메이션
  - 스켈레톤 UI 로딩 효과

### 배포 및 호스팅
- **Vercel**
  - Next.js 최적화 배포 환경
  - 자동 CI/CD 파이프라인
  - 환경 변수 관리

---

## 🏗️ 아키텍처 설계 원칙

### 1. 컴포넌트 구조 분리

#### `components/ui/` - 공통 UI 컴포넌트
- **목적**: 재사용 가능한 순수 UI 컴포넌트
- **특징**:
  - 비즈니스 로직 없음
  - Props 기반 동작
  - shadcn/ui 기반 구현
- **예시**: `Button`, `Card`, `Input`, `Select`

#### `components/domain/` - 도메인별 비즈니스 컴포넌트
- **목적**: 특정 기능 영역의 비즈니스 로직 포함 컴포넌트
- **구조**:
  - `auth/`: 인증 관련 컴포넌트
  - `onboarding/`: 온보딩 폼 컴포넌트
  - `feed/`: 매칭 피드 관련 컴포넌트
  - `profile/`: 프로필 관련 컴포넌트
  - `layout/`: 레이아웃 컴포넌트
- **예시**: `GoogleLoginButton`, `CandidateCard`, `FilterBar`

### 2. 데이터 레이어 분리

#### `lib/supabase/queries/` - 데이터베이스 쿼리 함수
- **목적**: Supabase 쿼리 로직 캡슐화
- **원칙**:
  - 각 도메인별 파일 분리 (`profiles.ts`, `matching-posts.ts`)
  - 타입 안정성 보장
  - 에러 핸들링 통합
- **예시**:
  ```typescript
  // lib/supabase/queries/profiles.ts
  export async function getProfile(userId: string) { ... }
  export async function createProfile(data: ProfileInput) { ... }
  ```

#### `hooks/` - 커스텀 훅
- **목적**: 상태 관리 및 데이터 페칭 로직 재사용
- **원칙**:
  - 하나의 훅은 하나의 책임만 담당
  - 서버 상태는 React Query 또는 SWR 활용 (선택사항)
- **예시**: `useAuth()`, `useProfile()`, `useMatchingFeed()`

### 3. 타입 시스템

#### `types/` - 타입 정의
- **구조**:
  - `database.ts`: Supabase 자동 생성 타입
  - `profile.ts`: 프로필 관련 타입
  - `matching.ts`: 매칭 관련 타입
  - `api.ts`: API 응답 타입
  - `index.ts`: 타입 재export

### 4. 라우팅 구조 (App Router)

#### Route Groups 활용
- `(auth)/`: 인증 관련 라우트 (공통 레이아웃 없음)
- `(onboarding)/`: 온보딩 라우트 (온보딩 전용 레이아웃)
- `(dashboard)/`: 메인 앱 라우트 (탭 네비게이션 포함)

#### 동적 라우팅
- `feed/[id]/page.tsx`: 프로필 상세 페이지
- API Routes: `api/matching/`, `api/profile/`

---

## 📐 컴포넌트 설계 원칙

### 1. 컴포넌트 구성 원칙

#### Server Components 우선
- 기본적으로 모든 컴포넌트는 Server Component로 작성
- 클라이언트 상호작용이 필요한 경우에만 `"use client"` 사용

#### Props 인터페이스 명확화
- 모든 Props는 TypeScript 인터페이스로 정의
- Optional Props는 `?`로 명시
- 기본값은 `defaultProps` 대신 함수 파라미터 기본값 사용

### 2. 상태 관리

#### 로컬 상태
- `useState`를 통한 컴포넌트 내부 상태 관리
- 폼 상태는 React Hook Form 활용 (선택사항)

#### 전역 상태
- 인증 상태: Context API (`AuthProvider`)
- 서버 상태: Supabase 실시간 구독 또는 React Query

### 3. 에러 핸들링

#### 에러 바운더리
- `app/error.tsx`: 라우트 레벨 에러 처리
- 컴포넌트별 에러 상태 UI 제공

#### API 에러 처리
- `lib/errors/error-handler.ts`: 통합 에러 핸들링 유틸
- 사용자 친화적 에러 메시지 표시

---

## 🎨 UI/UX 가이드라인

### 디자인 시스템
- **컬러**: Blue & White 톤 (Clean & Trust 컨셉)
- **레이아웃**: 수직 스크롤 피드 (에어비앤비/당근마켓 스타일)
- **카드 디자인**: 핵심 태그 + AI 매칭 포인트 요약

### 반응형 디자인
- 모바일 우선 설계
- Tailwind CSS 브레이크포인트 활용:
  - `sm`: 640px
  - `md`: 768px
  - `lg`: 1024px

### 접근성 (A11y)
- shadcn/ui의 Radix UI 기반 접근성 지원
- 키보드 네비게이션 지원
- ARIA 레이블 적절히 사용

---

## 🔒 보안 고려사항

### 인증 및 권한
- Supabase RLS 정책을 통한 데이터 접근 제어
- 서버 사이드 인증 검증
- 클라이언트 사이드 인증 상태 관리

### 데이터 보호
- 개인정보 마스킹 (조회권 사용 전)
- 일일 조회 제한 (Phase 2)
- HTTPS 통신 강제

---

## 📦 의존성 관리

### 패키지 매니저
- **pnpm** (기본 설정)
- `pnpm-lock.yaml` 버전 관리

### 주요 의존성 설치 예정
```json
{
  "dependencies": {
    "next": "16.1.6",
    "react": "19.2.3",
    "react-dom": "19.2.3",
    "@supabase/supabase-js": "^2.x",
    "@supabase/ssr": "^0.x",
    "lucide-react": "^0.x",
    "clsx": "^2.x",
    "tailwind-merge": "^2.x",
    "openai": "^4.x"
  },
  "devDependencies": {
    "@types/node": "^20",
    "@types/react": "^19",
    "typescript": "^5",
    "tailwindcss": "^4",
    "eslint": "^9"
  }
}
```

---

## 🚀 개발 워크플로우

### 환경 설정
1. `.env.local.example`을 참고하여 `.env.local` 생성
2. Supabase 프로젝트 생성 및 환경 변수 설정
3. Google OAuth 클라이언트 ID 발급
4. OpenAI API 키 발급

### 개발 서버 실행
```bash
pnpm dev
```

### 빌드 및 배포
```bash
pnpm build
pnpm start
```

---

## 📚 참고 자료

- [Next.js 15 Documentation](https://nextjs.org/docs)
- [Supabase Documentation](https://supabase.com/docs)
- [shadcn/ui Components](https://ui.shadcn.com/)
- [Tailwind CSS Documentation](https://tailwindcss.com/docs)

---

**작성일**: 2026-01-29  
**버전**: 1.0.0
