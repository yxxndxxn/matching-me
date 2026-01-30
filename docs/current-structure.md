# 현재 프로젝트 구조 (이식 전)

## components/ 폴더

```
components/
├── common/           # 공통 레이아웃
│   ├── AppShell.tsx
│   ├── BottomNav.tsx
│   └── Sidebar.tsx
├── domain/            # 도메인별 컴포넌트
│   ├── auth/
│   │   ├── auth-guard.tsx
│   │   └── google-login-button.tsx
│   ├── feed/
│   │   ├── ai-summary-badge.tsx
│   │   ├── candidate-card.tsx
│   │   ├── feed-list.tsx
│   │   └── filter-bar.tsx
│   ├── layout/
│   │   ├── dashboard-nav.tsx
│   │   └── header.tsx
│   ├── onboarding/
│   │   ├── basic-info-form.tsx
│   │   ├── contact-form.tsx
│   │   ├── lifestyle-form.tsx
│   │   └── step-form-wrapper.tsx
│   └── profile/
│       ├── contact-reveal-button.tsx
│       ├── profile-card.tsx
│       ├── profile-detail-view.tsx
│       └── profile-tags.tsx
├── providers/
│   ├── auth-provider.tsx
│   └── theme-provider.tsx
└── ui/                # shadcn/ui 기반 (50+ 파일)
    ├── button.tsx, card.tsx, input.tsx, ...
```

## app/ 폴더

```
app/
├── (auth)/
│   ├── layout.tsx
│   └── login/page.tsx
├── (dashboard)/
│   ├── api/... (auth, matching, profile)
│   ├── feed/page.tsx, feed/[id], feed/ai-recommended
│   ├── layout.tsx
│   ├── page.tsx
│   └── profile/page.tsx, profile/edit, profile/bookmarks
├── (onboarding)/
│   ├── layout.tsx
│   └── onboarding/..., step-1, step-2, step-3
├── error.tsx
├── favicon.ico
├── globals.css
├── layout.tsx         # 루트 레이아웃 (AppShell 사용)
└── page.tsx           # 기본 Next.js 홈
```

## package.json 의존성 (dependencies)

- @hookform/resolvers, @radix-ui/* (accordion, alert-dialog, aspect-ratio, avatar, checkbox, collapsible, context-menu, dialog, dropdown-menu, hover-card, label, menubar, navigation-menu, popover, progress, radio-group, scroll-area, select, separator, slider, slot, switch, tabs, toast, toggle, toggle-group, tooltip)
- class-variance-authority, clsx, cmdk, date-fns, embla-carousel-react, framer-motion, input-otp, lucide-react, next, next-themes, react, react-day-picker, react-dom, react-hook-form, react-resizable-panels, recharts, sonner, tailwind-merge, tailwindcss-animate, vaul, zod

## package.json devDependencies

- @tailwindcss/postcss, @types/node, @types/react, @types/react-dom, eslint, eslint-config-next, postcss, tailwindcss, tw-animate-css, typescript
