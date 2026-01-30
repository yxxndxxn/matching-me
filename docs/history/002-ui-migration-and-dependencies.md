# UI 마이그레이션 및 의존성 설치 기록

**작성일**: 2026-01-30  
**작업자**: 시니어 개발자 & AI 파트너 (Cursor)  
**작업 목적**: v0 UI 이식 및 shadcn/ui 컴포넌트 시스템 구축

---

## 📋 개요

이 문서는 매칭미? 프로젝트에서 v0에서 생성된 UI 컴포넌트를 이식하고, shadcn/ui 기반의 컴포넌트 시스템을 구축하기 위해 설치한 라이브러리 목록과 설치 이유를 기록합니다.

---

## 📦 설치된 라이브러리 목록

### 1. UI 컴포넌트 라이브러리 (Radix UI 기반)

#### shadcn/ui 핵심 컴포넌트
```json
{
  "@radix-ui/react-accordion": "1.2.2",
  "@radix-ui/react-alert-dialog": "1.1.4",
  "@radix-ui/react-aspect-ratio": "1.1.1",
  "@radix-ui/react-avatar": "1.1.2",
  "@radix-ui/react-checkbox": "1.1.3",
  "@radix-ui/react-collapsible": "1.1.2",
  "@radix-ui/react-context-menu": "2.2.4",
  "@radix-ui/react-dialog": "1.1.4",
  "@radix-ui/react-dropdown-menu": "2.1.4",
  "@radix-ui/react-hover-card": "1.1.4",
  "@radix-ui/react-label": "2.1.1",
  "@radix-ui/react-menubar": "1.1.4",
  "@radix-ui/react-navigation-menu": "1.2.3",
  "@radix-ui/react-popover": "1.1.4",
  "@radix-ui/react-progress": "1.1.1",
  "@radix-ui/react-radio-group": "1.2.2",
  "@radix-ui/react-scroll-area": "1.2.2",
  "@radix-ui/react-select": "2.1.4",
  "@radix-ui/react-separator": "1.1.1",
  "@radix-ui/react-slider": "1.2.2",
  "@radix-ui/react-slot": "1.1.1",
  "@radix-ui/react-switch": "1.1.2",
  "@radix-ui/react-tabs": "1.1.2",
  "@radix-ui/react-toast": "1.2.4",
  "@radix-ui/react-toggle": "1.1.1",
  "@radix-ui/react-toggle-group": "1.1.1",
  "@radix-ui/react-tooltip": "1.1.6"
}
```

**설치 이유**:
- shadcn/ui 컴포넌트 시스템의 기반이 되는 Radix UI 프리미티브 설치
- 접근성(A11y) 지원이 내장된 고품질 UI 컴포넌트 제공
- 키보드 네비게이션, ARIA 속성 자동 관리 등 웹 접근성 표준 준수
- v0에서 생성된 UI 컴포넌트들이 Radix UI 기반으로 구성되어 있어 필수 의존성

---

### 2. 스타일 유틸리티

#### `clsx` (v2.1.1)
```bash
pnpm add clsx
```

**설치 이유**:
- 조건부 CSS 클래스명 조합을 위한 유틸리티 라이브러리
- 컴포넌트에서 동적으로 클래스명을 생성할 때 사용
- 예: `clsx("base-class", { "active": isActive, "disabled": isDisabled })`

#### `tailwind-merge` (v3.3.1)
```bash
pnpm add tailwind-merge
```

**설치 이유**:
- Tailwind CSS 클래스명 충돌 해결을 위한 유틸리티
- 동일한 유틸리티 클래스가 중복될 때 마지막 클래스만 적용되도록 병합
- shadcn/ui 컴포넌트에서 기본 스타일과 커스텀 스타일을 안전하게 병합하기 위해 필수
- `cn()` 헬퍼 함수의 핵심 의존성

#### `class-variance-authority` (v0.7.1)
```bash
pnpm add class-variance-authority
```

**설치 이유**:
- 컴포넌트 variant 스타일링을 위한 타입 안전한 유틸리티
- shadcn/ui의 Button, Badge 등 컴포넌트에서 `variant` prop을 타입 안전하게 관리
- 예: `variant="default" | "destructive" | "outline" | "ghost"`

#### `tailwindcss-animate` (v1.0.7)
```bash
pnpm add tailwindcss-animate
```

**설치 이유**:
- Tailwind CSS에 애니메이션 유틸리티 클래스 추가
- `animate-spin`, `animate-pulse` 등 기본 애니메이션 제공
- shadcn/ui 컴포넌트의 로딩 상태, 스켈레톤 UI 등에 사용

---

### 3. 아이콘 라이브러리

#### `lucide-react` (v0.454.0)
```bash
pnpm add lucide-react
```

**설치 이유**:
- 경량화된 React 아이콘 라이브러리
- Tree-shaking 지원으로 사용하지 않는 아이콘은 번들에서 제외
- v0에서 생성된 컴포넌트들이 lucide-react 아이콘을 사용
- shadcn/ui의 기본 아이콘 라이브러리로 지정됨 (`components.json`의 `iconLibrary: "lucide"`)
- 일관된 디자인 시스템 유지

---

### 4. 애니메이션 라이브러리

#### `framer-motion` (v12.29.2)
```bash
pnpm add framer-motion
```

**설치 이유**:
- React 컴포넌트 애니메이션 라이브러리
- v0에서 생성된 컴포넌트들이 페이지 전환, 모달 애니메이션에 사용
- `AnimatePresence`, `motion.div` 등을 사용한 부드러운 UI 전환 효과
- 예: 프로필 상세 페이지 진입/퇴장 애니메이션

---

### 5. 폼 관리 라이브러리

#### `react-hook-form` (v7.60.0)
```bash
pnpm add react-hook-form
```

**설치 이유**:
- 성능 최적화된 React 폼 관리 라이브러리
- 불필요한 리렌더링 최소화
- 온보딩 폼, 프로필 수정 폼 등 복잡한 폼 처리에 사용 예정

#### `@hookform/resolvers` (v3.10.0)
```bash
pnpm add @hookform/resolvers
```

**설치 이유**:
- react-hook-form과 Zod 같은 스키마 검증 라이브러리를 연결하는 어댑터
- 폼 유효성 검사를 타입 안전하게 처리

#### `zod` (v3.25.76)
```bash
pnpm add zod
```

**설치 이유**:
- TypeScript-first 스키마 검증 라이브러리
- 런타임 타입 검증 및 타입 추론 제공
- 폼 입력값 검증 및 API 요청/응답 스키마 검증에 사용

---

### 6. 테마 관리

#### `next-themes` (v0.4.6)
```bash
pnpm add next-themes
```

**설치 이유**:
- Next.js App Router에서 다크 모드 지원을 위한 라이브러리
- 시스템 테마 감지, 테마 전환, SSR 호환성 제공
- `ThemeProvider` 컴포넌트로 앱 전체 테마 관리
- v0에서 생성된 `theme-provider.tsx` 컴포넌트에서 사용

---

### 7. 추가 UI 컴포넌트 라이브러리

#### `cmdk` (v1.0.4)
```bash
pnpm add cmdk
```

**설치 이유**:
- Command Palette (Cmd+K) UI 컴포넌트
- 키보드 단축키로 빠른 검색 및 액션 실행 인터페이스 제공
- 향후 검색 기능 확장 시 사용 예정

#### `sonner` (v1.7.4)
```bash
pnpm add sonner
```

**설치 이유**:
- Toast 알림 컴포넌트 라이브러리
- 사용자 액션 피드백 (성공, 에러, 정보 메시지) 표시
- shadcn/ui의 Toast 컴포넌트 대체 또는 보완용

#### `vaul` (v1.1.2)
```bash
pnpm add vaul
```

**설치 이유**:
- Drawer 컴포넌트 라이브러리 (모바일 친화적)
- 모바일에서 하단에서 올라오는 시트 형태의 UI 제공
- 프로필 상세, 필터 옵션 등에 사용 예정

#### `recharts` (v2.15.4)
```bash
pnpm add recharts
```

**설치 이유**:
- React 차트 라이브러리
- 매칭 통계, 사용자 활동 그래프 등 데이터 시각화에 사용 예정

#### `embla-carousel-react` (v8.5.1)
```bash
pnpm add embla-carousel-react
```

**설치 이유**:
- 경량화된 캐러셀 컴포넌트 라이브러리
- 프로필 이미지 갤러리, 추천 프로필 슬라이더 등에 사용 예정

#### `react-day-picker` (v9.8.0)
```bash
pnpm add react-day-picker
```

**설치 이유**:
- 날짜 선택 컴포넌트
- 캘린더 UI가 필요한 기능에 사용 예정

#### `date-fns` (v4.1.0)
```bash
pnpm add date-fns
```

**설치 이유**:
- 경량화된 날짜 유틸리티 라이브러리
- 날짜 포맷팅, 계산 등에 사용
- `react-day-picker`와 함께 사용

#### `input-otp` (v1.4.1)
```bash
pnpm add input-otp
```

**설치 이유**:
- OTP(One-Time Password) 입력 컴포넌트
- 인증 코드 입력 등에 사용 예정

#### `react-resizable-panels` (v2.1.7)
```bash
pnpm add react-resizable-panels
```

**설치 이유**:
- 리사이즈 가능한 패널 컴포넌트
- 데스크톱 레이아웃에서 사이드바 조절 등에 사용 예정

---

## 🔧 설치 과정 및 에러 해결

### 1. Radix UI 의존성 충돌

**문제**:
- 초기 설치 시 일부 Radix UI 패키지 버전 불일치로 인한 타입 에러 발생

**해결**:
- shadcn/ui CLI를 통해 컴포넌트를 추가할 때 자동으로 호환되는 버전 설치
- `components.json` 설정을 통해 일관된 버전 관리

### 2. Tailwind CSS 4.x 호환성

**문제**:
- Tailwind CSS 4.x는 설정 파일 구조가 변경되어 일부 플러그인과 호환성 이슈 발생 가능

**해결**:
- `tailwindcss-animate`는 Tailwind 4.x와 호환되는 버전 사용
- PostCSS 설정을 통해 Tailwind 4.x의 새로운 구조에 맞게 조정

### 3. Next.js 16 + React 19 호환성

**문제**:
- 일부 라이브러리가 React 19의 새로운 타입 시스템과 호환되지 않음

**해결**:
- 최신 버전의 라이브러리 사용 (Radix UI, framer-motion 등)
- TypeScript 타입 정의 업데이트 확인
- `@types/react` v19 사용

### 4. v0 UI 이식 시 컴포넌트 경로 불일치

**문제**:
- v0에서 생성된 컴포넌트의 import 경로가 프로젝트 구조와 불일치

**해결**:
- `tsconfig.json`의 path alias 설정 확인 (`@/components`, `@/lib` 등)
- `components.json`의 aliases 설정과 일치하도록 조정
- 모든 컴포넌트의 import 경로를 프로젝트 구조에 맞게 수정

### 5. 스타일 유틸리티 함수 통합

**문제**:
- `clsx`와 `tailwind-merge`를 함께 사용하는 `cn()` 헬퍼 함수 필요

**해결**:
- `lib/utils/cn.ts` 파일 생성하여 두 라이브러리를 통합한 유틸리티 함수 제공
```typescript
import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}
```

---

## 📝 설치 명령어 요약

전체 라이브러리를 한 번에 설치하는 경우:

```bash
# UI 컴포넌트 (Radix UI)
pnpm add @radix-ui/react-accordion @radix-ui/react-alert-dialog @radix-ui/react-aspect-ratio @radix-ui/react-avatar @radix-ui/react-checkbox @radix-ui/react-collapsible @radix-ui/react-context-menu @radix-ui/react-dialog @radix-ui/react-dropdown-menu @radix-ui/react-hover-card @radix-ui/react-label @radix-ui/react-menubar @radix-ui/react-navigation-menu @radix-ui/react-popover @radix-ui/react-progress @radix-ui/react-radio-group @radix-ui/react-scroll-area @radix-ui/react-select @radix-ui/react-separator @radix-ui/react-slider @radix-ui/react-slot @radix-ui/react-switch @radix-ui/react-tabs @radix-ui/react-toast @radix-ui/react-toggle @radix-ui/react-toggle-group @radix-ui/react-tooltip

# 스타일 유틸리티
pnpm add clsx tailwind-merge class-variance-authority tailwindcss-animate

# 아이콘 및 애니메이션
pnpm add lucide-react framer-motion

# 폼 관리
pnpm add react-hook-form @hookform/resolvers zod

# 테마 관리
pnpm add next-themes

# 추가 UI 컴포넌트
pnpm add cmdk sonner vaul recharts embla-carousel-react react-day-picker date-fns input-otp react-resizable-panels
```

---

## 🎯 라이브러리 사용 현황

### 현재 사용 중인 라이브러리
- ✅ **Radix UI**: 모든 shadcn/ui 컴포넌트의 기반
- ✅ **lucide-react**: 아이콘 시스템 전반
- ✅ **clsx + tailwind-merge**: 스타일 유틸리티 (`cn()` 함수)
- ✅ **framer-motion**: 페이지 전환 애니메이션
- ✅ **next-themes**: 다크 모드 지원
- ✅ **class-variance-authority**: Button, Badge 등 variant 관리

### 향후 사용 예정인 라이브러리
- 🔜 **react-hook-form + zod**: 온보딩 폼, 프로필 수정 폼
- 🔜 **sonner**: 사용자 액션 피드백 (Toast 알림)
- 🔜 **vaul**: 모바일 Drawer UI
- 🔜 **recharts**: 매칭 통계 시각화
- 🔜 **embla-carousel-react**: 프로필 이미지 갤러리

---

## 📚 참고 자료

- [shadcn/ui 공식 문서](https://ui.shadcn.com/)
- [Radix UI 공식 문서](https://www.radix-ui.com/)
- [Lucide Icons](https://lucide.dev/)
- [Framer Motion 문서](https://www.framer.com/motion/)
- [Next Themes 문서](https://github.com/pacocoursey/next-themes)

---

**다음 작업**: v0 UI 컴포넌트 이식 완료 후, 실제 데이터 연동 및 기능 구현 단계로 진행 예정
