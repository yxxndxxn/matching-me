# 배포 전 진단 리포트 (Pre-Flight Check)

**생성일**: 2026-02-05  
**목적**: Vercel + Supabase Production 배포 전 Critical Issue 및 환경 변수 점검

---

## 🔴 TASK 1: 환경 변수 점검

### 1.1 `process.env` 사용 현황

| 파일 경로 | 환경 변수 | 용도 | 클라이언트/서버 |
|-----------|----------|------|----------------|
| `lib/supabase/client.ts` | `NEXT_PUBLIC_SUPABASE_URL` | Supabase 브라우저 클라이언트 | 클라이언트 |
| `lib/supabase/client.ts` | `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Supabase 브라우저 클라이언트 | 클라이언트 |
| `lib/supabase/server.ts` | `NEXT_PUBLIC_SUPABASE_URL` | Supabase 서버 클라이언트 | 서버 |
| `lib/supabase/server.ts` | `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Supabase 서버 클라이언트 | 서버 |
| `lib/supabase/middleware.ts` | `NEXT_PUBLIC_SUPABASE_URL` | 미들웨어 세션 갱신 | 서버 |
| `lib/supabase/middleware.ts` | `NEXT_PUBLIC_SUPABASE_ANON_KEY` | 미들웨어 세션 갱신 | 서버 |
| `lib/supabase/admin.ts` | `NEXT_PUBLIC_SUPABASE_URL` | Admin 클라이언트 (회원 탈퇴) | 서버 전용 |
| `lib/supabase/admin.ts` | `SUPABASE_SERVICE_ROLE_KEY` | Admin 클라이언트 (회원 탈퇴) | 서버 전용 ⚠️ |
| `lib/ai/matching-summary.ts` | `GOOGLE_GEMINI_API_KEY` | AI 요약 생성 | 서버 전용 |
| `lib/ai/matching-summary.ts` | `GOOGLE_GENERATIVE_AI_API_KEY` | AI 요약 생성 (fallback) | 서버 전용 |
| `app/(auth)/login/page.tsx` | `NEXT_PUBLIC_APP_URL` | OAuth 콜백 URL | 클라이언트 |
| `app/(dashboard)/api/matching/reveal-contact/route.ts` | `NODE_ENV` | 개발 모드 체크 | 서버 |

### 1.2 Vercel 환경 변수 체크리스트 (필수)

#### 클라이언트 노출 변수 (`NEXT_PUBLIC_*`)
```
✅ NEXT_PUBLIC_SUPABASE_URL
✅ NEXT_PUBLIC_SUPABASE_ANON_KEY
✅ NEXT_PUBLIC_APP_URL
```

#### 서버 전용 변수 (절대 클라이언트 노출 금지)
```
✅ SUPABASE_SERVICE_ROLE_KEY
✅ GOOGLE_GEMINI_API_KEY (또는 GOOGLE_GENERATIVE_AI_API_KEY)
```

**주의사항**:
- `NEXT_PUBLIC_APP_URL`은 Production에서는 실제 도메인으로 설정 (예: `https://your-domain.vercel.app`)
- `SUPABASE_SERVICE_ROLE_KEY`는 **절대 클라이언트 코드에 노출되지 않도록** 확인됨 (admin.ts에서만 사용)

### 1.3 클라이언트/서버 구분 검증 결과

✅ **올바르게 구분됨**:
- `NEXT_PUBLIC_*` 접두사는 클라이언트 번들에 포함됨
- `SUPABASE_SERVICE_ROLE_KEY`는 서버 전용 (`lib/supabase/admin.ts`에서만 사용)
- `GOOGLE_GEMINI_API_KEY`는 서버 전용 (`lib/ai/matching-summary.ts`에서만 사용)

---

## 🔴 TASK 2: 빌드 및 타입 안정성

### 2.1 빌드 검증 결과

✅ **`pnpm run build` 성공** (이전 검증 완료)
- TypeScript 컴파일 통과
- 23개 라우트 정상 생성
- 타입 에러 없음

### 2.2 타입 불일치 검사

#### ⚠️ **Critical Issue #1: `pair_ai_summaries` 테이블 스키마 불일치**

**문제점**:
- `types/database.ts`에 `PairAiSummaryRow` 타입 정의 존재
- `docs/database/supabase-schema.sql` (메인 스키마)에는 `pair_ai_summaries` 테이블 정의 없음
- 마이그레이션 파일 `docs/database/migrations/20260201_190000_pair_ai_summaries_v1.sql`에만 존재

**영향**:
- Production DB에 `pair_ai_summaries` 테이블이 없으면 관련 API 호출 실패 가능
- 타입 정의와 실제 DB 스키마 불일치로 런타임 에러 가능

**수정 필요**:
1. `docs/database/supabase-schema.sql`에 `pair_ai_summaries` 테이블 정의 추가
2. 또는 Production DB에 마이그레이션 파일 실행 확인

### 2.3 미사용 변수 검사

✅ **ESLint 에러 없음** (검증 완료)

### 2.4 Database 타입 일치성 검증

✅ **일반적인 타입 정의는 일치함**:
- `ProfileRow`, `MatchingPostRow`, `ViewLogRow`, `BookmarkRow`, `DailyLimitRow` 모두 스키마와 일치
- ⚠️ `PairAiSummaryRow`는 스키마 파일에 없음 (위 Critical Issue #1 참조)

---

## 🔴 TASK 3: 보안 및 RLS 점검

### 3.1 RLS 활성화 확인

#### ✅ 메인 스키마 (`supabase-schema.sql`)에 RLS 활성화된 테이블:
1. ✅ `profiles` - `ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;` (Line 152)
2. ✅ `matching_posts` - `ALTER TABLE matching_posts ENABLE ROW LEVEL SECURITY;` (Line 153)
3. ✅ `view_logs` - `ALTER TABLE view_logs ENABLE ROW LEVEL SECURITY;` (Line 154)
4. ✅ `bookmarks` - `ALTER TABLE bookmarks ENABLE ROW LEVEL SECURITY;` (Line 155)
5. ✅ `daily_limits` - `ALTER TABLE daily_limits ENABLE ROW LEVEL SECURITY;` (Line 156)

#### ⚠️ **Critical Issue #2: `pair_ai_summaries` RLS 확인 필요**

**상태**:
- 마이그레이션 파일에는 RLS 활성화됨 (`ALTER TABLE pair_ai_summaries ENABLE ROW LEVEL SECURITY;`)
- 메인 스키마 파일에는 테이블 정의 자체가 없음

**조치 필요**:
- Production DB에 마이그레이션 실행 여부 확인 또는 메인 스키마에 추가

### 3.2 RLS 정책 검토

#### ✅ `profiles` 테이블
- **SELECT**: 본인 프로필 또는 같은 소속관 프로필만 조회 가능
- **UPDATE/INSERT**: 본인만 가능 (`auth.uid() = id`)

#### ✅ `matching_posts` 테이블
- **SELECT**: 본인 게시글 전체 또는 같은 소속관 활성 게시글만 조회
- **ALL (INSERT/UPDATE/DELETE)**: 본인만 가능 (`auth.uid() = user_id`)

#### ✅ `view_logs` 테이블
- **SELECT/INSERT**: 본인 로그만 (`auth.uid() = viewer_id`)

#### ✅ `bookmarks` 테이블
- **ALL**: 본인만 (`auth.uid() = user_id`)

#### ✅ `daily_limits` 테이블
- **SELECT/INSERT/UPDATE**: 본인만 (`auth.uid() = user_id`)

#### ✅ `pair_ai_summaries` 테이블 (마이그레이션 기준)
- **SELECT/INSERT/UPDATE**: 본인만 (`auth.uid() = viewer_id`)

### 3.3 익명 유저 취약점 검토

✅ **익명 유저 접근 차단 확인**:
- 모든 RLS 정책은 `auth.uid()`를 사용하므로 익명 유저는 접근 불가
- 미들웨어에서 보호된 라우트(`/dashboard`, `/profile`, `/onboarding`)는 인증 필수
- API 라우트는 `supabase.auth.getUser()`로 인증 검증 후 처리

⚠️ **주의사항**:
- `lib/supabase/middleware.ts`에서 환경 변수 없을 시 `return response`로 처리 → 미인증 유저가 보호된 라우트 접근 가능
- **권장**: 환경 변수 없을 시 에러 로깅 및 기본 리다이렉트 처리

---

## 📋 배포 전 반드시 수정해야 할 Critical Issues

### 🔴 Critical Issue #1: `pair_ai_summaries` 테이블 스키마 불일치

**우선순위**: HIGH  
**영향**: 런타임 에러 가능성

**조치 방법**:
1. **Option A (권장)**: Production Supabase에서 마이그레이션 파일 실행
   ```sql
   -- docs/database/migrations/20260201_190000_pair_ai_summaries_v1.sql 실행
   ```
2. **Option B**: 메인 스키마 파일에 추가
   - `docs/database/supabase-schema.sql`에 `pair_ai_summaries` 테이블 정의 및 RLS 정책 추가

**검증 쿼리**:
```sql
SELECT table_name FROM information_schema.tables 
WHERE table_schema = 'public' AND table_name = 'pair_ai_summaries';
```

### 🔴 Critical Issue #2: 미들웨어 환경 변수 실패 시 처리

**우선순위**: MEDIUM  
**영향**: 보안 취약점 가능성

**현재 코드** (`lib/supabase/middleware.ts:13-15`):
```typescript
if (!url || !key) {
  return response; // ⚠️ 환경 변수 없을 시 그냥 통과
}
```

**권장 수정**:
```typescript
if (!url || !key) {
  console.error("[Middleware] Missing Supabase env vars");
  // Production에서는 로그인 페이지로 리다이렉트
  if (process.env.NODE_ENV === "production") {
    return NextResponse.redirect(new URL("/login?error=config", request.url));
  }
  return response;
}
```

---

## ✅ Vercel 환경 변수 체크리스트

### 필수 환경 변수 (배포 전 반드시 설정)

| 변수명 | 설명 | 예시 값 | 노출 여부 |
|--------|------|---------|----------|
| `NEXT_PUBLIC_SUPABASE_URL` | Supabase 프로젝트 URL | `https://xxx.supabase.co` | 클라이언트 |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Supabase Anon Key | `eyJhbGc...` | 클라이언트 |
| `SUPABASE_SERVICE_ROLE_KEY` | Supabase Service Role Key | `eyJhbGc...` | 서버 전용 ⚠️ |
| `NEXT_PUBLIC_APP_URL` | 앱 Production URL | `https://your-app.vercel.app` | 클라이언트 |
| `GOOGLE_GEMINI_API_KEY` | Google Gemini API Key | `AIzaSy...` | 서버 전용 |

**설정 방법**:
1. Vercel Dashboard → Project Settings → Environment Variables
2. 각 변수를 Production, Preview, Development 환경에 설정
3. `SUPABASE_SERVICE_ROLE_KEY`는 **Production에만** 설정 권장 (보안)

---

## 🚀 배포 성공률 향상을 위한 최적화 제안

### 1. 환경 변수 검증 강화

**현재**: 런타임 에러 발생 시에만 감지  
**권장**: 빌드 타임 검증 추가

```typescript
// lib/env.ts (신규 파일)
const requiredEnvVars = {
  NEXT_PUBLIC_SUPABASE_URL: process.env.NEXT_PUBLIC_SUPABASE_URL,
  NEXT_PUBLIC_SUPABASE_ANON_KEY: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
  // ...
};

if (process.env.NODE_ENV === "production") {
  for (const [key, value] of Object.entries(requiredEnvVars)) {
    if (!value) {
      throw new Error(`Missing required env var: ${key}`);
    }
  }
}
```

### 2. Health Check 엔드포인트 추가

**권장**: `/api/health` 엔드포인트 생성
- 환경 변수 존재 여부 확인
- Supabase 연결 테스트
- DB 스키마 버전 확인

### 3. 에러 모니터링 설정

**권장**: Vercel Analytics 또는 Sentry 연동
- Production 에러 추적
- 환경 변수 누락 알림

### 4. 스키마 동기화 자동화

**권장**: Supabase CLI를 사용한 스키마 동기화
```bash
# 배포 전 스키마 검증
supabase db diff --schema public
```

---

## 📊 검증 완료 체크리스트

- [x] 환경 변수 사용 현황 파악
- [x] 클라이언트/서버 구분 확인
- [x] 빌드 성공 확인
- [x] 타입 불일치 검사 (Critical Issue #1 발견)
- [x] RLS 활성화 확인 (Critical Issue #2 발견)
- [x] 익명 유저 취약점 검토
- [ ] **Critical Issue #1 수정** (배포 전 필수)
- [ ] **Critical Issue #2 수정** (권장)
- [ ] Vercel 환경 변수 설정
- [ ] Production DB 마이그레이션 실행 확인

---

**다음 단계**: Critical Issues 수정 후 재검증 및 배포 진행
