# 데이터베이스 설계 가이드

## 📋 개요

매칭미? (Matching Me?) 프로젝트의 PostgreSQL 데이터베이스 스키마 설계 문서입니다. Supabase를 기반으로 구축되며, **인증은 `auth.users`(Supabase Auth)** 를 사용하고 별도 `users` 테이블은 두지 않습니다. Row Level Security (RLS) 정책을 통한 데이터 보안을 강조합니다.

- **적용용 SQL**: Supabase SQL Editor에서 바로 실행하려면 [`docs/supabase-schema.sql`](./supabase-schema.sql) 사용
- **이미 적용된 DB에 변경분만 반영**: [`docs/supabase-update-guide.md`](./supabase-update-guide.md) 참고

---

## 🗄️ 데이터베이스 스키마

### 인증: `auth.users` (Supabase Auth)

Google OAuth를 통한 사용자 인증은 Supabase Auth가 관리하며, 사용자 정보는 `auth.users`에 저장됩니다. `profiles.id`는 `auth.users(id)`와 1:1로 대응합니다.

---

### 1. `profiles` 테이블

온보딩 3단계에서 수집한 사용자의 상세 프로필 정보를 저장합니다. `id = auth.uid()` 로 인증 사용자와 1:1입니다.

```sql
CREATE TYPE gender_type AS ENUM ('male', 'female');
CREATE TYPE major_category_type AS ENUM (
  'engineering', 'humanities', 'social',
  'natural', 'arts', 'education'
);
CREATE TYPE dormitory_type AS ENUM ('dongjak', 'eunpyeong');
CREATE TYPE chronotype_type AS ENUM ('morning', 'night');
CREATE TYPE sleeping_habit_type AS ENUM ('none', 'grinding', 'snoring');

CREATE TABLE profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  gender gender_type NOT NULL,
  major_category major_category_type NOT NULL,
  grade TEXT NOT NULL CHECK (grade IN ('1학년', '2학년', '3학년', '4학년')),
  dormitory dormitory_type NOT NULL,
  other_contact TEXT,
  kakao_id TEXT,
  chronotype chronotype_type,
  sleeping_habit sleeping_habit_type DEFAULT 'none',
  smoking BOOLEAN DEFAULT FALSE,
  cleanliness INTEGER CHECK (cleanliness IS NULL OR (cleanliness >= 1 AND cleanliness <= 5)),
  noise_sensitivity INTEGER CHECK (noise_sensitivity IS NULL OR (noise_sensitivity >= 1 AND noise_sensitivity <= 5)),
  introduction TEXT CHECK (introduction IS NULL OR char_length(introduction) <= 500),
  avatar_url TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 인덱스
CREATE INDEX idx_profiles_dormitory ON profiles(dormitory);
CREATE INDEX idx_profiles_gender ON profiles(gender);
CREATE INDEX idx_profiles_major_category ON profiles(major_category);
CREATE INDEX idx_profiles_smoking ON profiles(smoking);
CREATE INDEX idx_profiles_updated_at ON profiles(updated_at);
```

**RLS 정책**:
- 사용자는 자신의 프로필만 조회/수정/생성 가능 (`id = auth.uid()`)

---

### 2. `matching_posts` 테이블

매칭용 게시글과 AI 생성 요약을 저장합니다. 데이터 격리(소속관 기반)의 핵심 테이블입니다.

```sql
CREATE TABLE matching_posts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  dormitory dormitory_type NOT NULL,
  ai_summary TEXT,
  match_score INTEGER CHECK (match_score IS NULL OR (match_score >= 0 AND match_score <= 100)),
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 인덱스
CREATE INDEX idx_matching_posts_user_id ON matching_posts(user_id);
CREATE INDEX idx_matching_posts_dormitory ON matching_posts(dormitory);
CREATE INDEX idx_matching_posts_is_active ON matching_posts(is_active);
CREATE INDEX idx_matching_posts_match_score ON matching_posts(match_score);
CREATE INDEX idx_matching_posts_created_at ON matching_posts(created_at DESC);
```

**RLS 정책**:
- 사용자는 자신의 게시글만 생성/수정/삭제 가능
- 다른 사용자의 게시글은 자신의 `dormitory`와 일치하고 `is_active = TRUE`인 경우만 조회 가능

---

### 3. `view_logs` 테이블 (Phase 2)

연락처 조회 기록을 저장하는 감사 로그 테이블입니다.

```sql
CREATE TABLE view_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  viewer_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  viewed_post_id UUID NOT NULL REFERENCES matching_posts(id) ON DELETE CASCADE,
  contact_revealed BOOLEAN DEFAULT FALSE,
  viewed_at TIMESTAMPTZ DEFAULT NOW()
);

-- 인덱스
CREATE INDEX idx_view_logs_viewer_id ON view_logs(viewer_id);
CREATE INDEX idx_view_logs_viewed_post_id ON view_logs(viewed_post_id);
CREATE INDEX idx_view_logs_viewed_at ON view_logs(viewed_at DESC);
-- 인덱스 표현식은 IMMUTABLE 필요: timestamptz→date 시 UTC 기준 사용
CREATE INDEX idx_view_logs_viewer_date ON view_logs(viewer_id, ((viewed_at AT TIME ZONE 'UTC')::date));
```

**RLS 정책**:
- 사용자는 자신의 조회 로그만 조회 가능
- 조회 로그 INSERT는 서버/Service Role에서 수행

---

### 4. `bookmarks` 테이블 (Phase 2)

사용자가 찜한 게시글(프로필)을 저장합니다.

```sql
CREATE TABLE bookmarks (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  post_id UUID NOT NULL REFERENCES matching_posts(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(user_id, post_id)
);

-- 인덱스
CREATE INDEX idx_bookmarks_user_id ON bookmarks(user_id);
CREATE INDEX idx_bookmarks_post_id ON bookmarks(post_id);
CREATE INDEX idx_bookmarks_created_at ON bookmarks(created_at DESC);
```

**RLS 정책**:
- 사용자는 자신의 찜 목록만 조회/생성/삭제 가능

---

### 5. `daily_limits` 테이블 (Phase 2)

일일 연락처 조회 제한을 추적합니다. 남은 횟수는 애플리케이션에서 `3 - reveals_used` 로 계산합니다.

```sql
CREATE TABLE daily_limits (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  limit_date DATE NOT NULL DEFAULT CURRENT_DATE,
  reveals_used INTEGER DEFAULT 0 CHECK (reveals_used >= 0 AND reveals_used <= 3),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(user_id, limit_date)
);

-- 인덱스
CREATE INDEX idx_daily_limits_user_id ON daily_limits(user_id);
CREATE INDEX idx_daily_limits_limit_date ON daily_limits(limit_date);
CREATE INDEX idx_daily_limits_user_date ON daily_limits(user_id, limit_date);
```

**RLS 정책**:
- 사용자는 자신의 일일 제한 정보만 조회 가능
- 제한 정보 갱신은 서버/Service Role에서 수행

---

## 🔒 Row Level Security (RLS) 정책 상세

전체 RLS 정의는 [`supabase-schema.sql`](./supabase-schema.sql) 참고.

- **profiles**: 본인만 SELECT / INSERT / UPDATE
- **matching_posts**: 본인 글은 ALL; 타인 글은 같은 dormitory + is_active 만 SELECT
- **view_logs**: 본인 로그만 SELECT
- **bookmarks**: 본인만 ALL
- **daily_limits**: 본인만 SELECT

---

## 🔄 데이터 관계도 (ERD)

```
auth.users (Supabase Auth)
     │
     ├── (1:1) profiles
     │
     ├── (1:N) matching_posts
     │
     ├── (1:N) view_logs (viewer_id)
     │
     ├── (1:N) bookmarks
     │
     └── (1:N) daily_limits

matching_posts (1) ── (N) view_logs
matching_posts (1) ── (N) bookmarks
```

---

## 📊 주요 쿼리 패턴

### 1. 소속관 기반 피드 조회 (데이터 격리)

```sql
SELECT
  mp.id,
  mp.user_id,
  mp.dormitory,
  mp.ai_summary,
  mp.match_score,
  mp.is_active,
  mp.created_at,
  p.name,
  p.gender,
  p.major_category,
  p.grade,
  p.other_contact,
  p.kakao_id,
  p.chronotype,
  p.sleeping_habit,
  p.smoking,
  p.cleanliness,
  p.noise_sensitivity,
  p.introduction,
  p.avatar_url
FROM matching_posts mp
JOIN profiles p ON mp.user_id = p.id
WHERE
  mp.dormitory = (SELECT dormitory FROM profiles WHERE id = auth.uid())
  AND mp.is_active = TRUE
ORDER BY mp.created_at DESC;
```

### 2. AI 추천 피드 (match_score >= 80)

위 쿼리에 `AND mp.match_score >= 80` 조건 추가, 정렬에 `mp.match_score DESC` 활용.

### 3. 일일 조회권 확인 및 차감

```sql
-- 조회권 확인 (남은 횟수 = 3 - reveals_used)
SELECT reveals_used
FROM daily_limits
WHERE user_id = auth.uid()
  AND limit_date = CURRENT_DATE;

-- 조회권 차감 (UPSERT) — 서버/Service Role에서 실행
INSERT INTO daily_limits (user_id, limit_date, reveals_used)
VALUES (auth.uid(), CURRENT_DATE, 1)
ON CONFLICT (user_id, limit_date)
DO UPDATE SET
  reveals_used = LEAST(daily_limits.reveals_used + 1, 3),
  updated_at = NOW();
```

### 4. 찜한 목록 조회

```sql
SELECT
  mp.*,
  p.name,
  p.gender,
  p.major_category,
  p.grade,
  p.avatar_url,
  p.introduction,
  b.created_at AS bookmarked_at
FROM bookmarks b
JOIN matching_posts mp ON b.post_id = mp.id
JOIN profiles p ON mp.user_id = p.id
WHERE b.user_id = auth.uid()
ORDER BY b.created_at DESC;
```

---

## 🚀 마이그레이션 전략

### Phase 1 (MVP)
1. ENUM 및 `update_updated_at_column()` 함수 생성
2. `profiles` 테이블 생성 (auth.users 참조)
3. `matching_posts` 테이블 생성
4. RLS 활성화 및 정책 적용

### Phase 2 (고도화)
1. `view_logs` 테이블 생성
2. `bookmarks` 테이블 생성
3. `daily_limits` 테이블 생성
4. 해당 테이블 RLS 정책 적용

**한 번에 적용**: [`docs/supabase-schema.sql`](./supabase-schema.sql) 파일을 Supabase SQL Editor에 붙여 넣어 실행하면 위 단계가 모두 적용됩니다.

---

## 🌱 시드 데이터 (Seed Data)

테스트용 샘플 데이터는 [`docs/seed_data_matching_me.sql`](./seed_data_matching_me.sql)에서 관리합니다.

| 테이블 | 시드 포함 | 비고 |
|--------|-----------|------|
| **profiles** | ✅ 10명 | auth.users id와 1:1 (실행 전 auth 사용자 10명 필요) |
| **matching_posts** | ✅ 10건 | 사용자당 1건 활성 게시글 |
| **view_logs** | ✅ 7건 | 연락처 조회 로그 샘플 (Optional) |
| **bookmarks** | ✅ 18건 | 동성만 관심 표시 |
| **daily_limits** | ✅ 70건 | 10명×7일 (Optional, service role 권장) |

실행 순서: 스키마 적용 후 → auth 사용자 생성 → 시드 SQL 실행. 상세는 시드 파일 상단 주석 참고.

---

## 🔍 성능 최적화

- 자주 조회되는 컬럼 인덱스: `dormitory`, `is_active`, `match_score`
- 복합 인덱스: `(user_id, limit_date)` 등
- 정렬용 인덱스: `created_at DESC`

---

## 📝 참고 사항

- 타임스탬프는 `TIMESTAMPTZ` 사용
- 외래 키에 `ON DELETE CASCADE` 적용
- ENUM 및 CHECK로 데이터 무결성 보장
- 상세 분석: [`docs/db-schema-analysis.md`](./db-schema-analysis.md)

---

**작성일**: 2026-01-29  
**수정일**: 2026-01-31 (view_logs 인덱스 IMMUTABLE 반영, 시드 데이터 섹션 추가)  
**버전**: 1.2.0
