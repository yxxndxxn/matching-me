# 데이터베이스 설계 가이드

## 📋 개요

매칭미? (Matching Me?) 프로젝트의 PostgreSQL 데이터베이스 스키마 설계 문서입니다. Supabase를 기반으로 구축되며, Row Level Security (RLS) 정책을 통한 데이터 보안을 강조합니다.

---

## 🗄️ 데이터베이스 스키마

### 1. `users` 테이블

Google OAuth를 통한 사용자 인증 정보를 저장합니다.

```sql
CREATE TABLE users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email TEXT UNIQUE NOT NULL,
  google_id TEXT UNIQUE NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  last_login TIMESTAMPTZ DEFAULT NOW()
);

-- 인덱스
CREATE INDEX idx_users_email ON users(email);
CREATE INDEX idx_users_google_id ON users(google_id);
```

**RLS 정책**:
- 사용자는 자신의 레코드만 조회 가능
- 서비스 역할 키로만 생성/수정 가능

---

### 2. `profiles` 테이블

온보딩 3단계에서 수집한 사용자의 상세 프로필 정보를 저장합니다.

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
  id UUID PRIMARY KEY REFERENCES users(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  gender gender_type NOT NULL,
  major_category major_category_type NOT NULL,
  grade TEXT NOT NULL CHECK (grade IN ('1학년', '2학년', '3학년', '4학년')),
  dormitory dormitory_type NOT NULL,
  phone TEXT,
  kakao_id TEXT,
  chronotype chronotype_type,
  sleeping_habit sleeping_habit_type DEFAULT 'none',
  smoking BOOLEAN DEFAULT FALSE,
  cleanliness INTEGER CHECK (cleanliness >= 1 AND cleanliness <= 5),
  noise_sensitivity INTEGER CHECK (noise_sensitivity >= 1 AND noise_sensitivity <= 5),
  introduction TEXT CHECK (char_length(introduction) <= 500),
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

-- 업데이트 시간 자동 갱신 트리거
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_profiles_updated_at
  BEFORE UPDATE ON profiles
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();
```

**RLS 정책**:
- 사용자는 자신의 프로필만 조회/수정 가능
- 다른 사용자의 프로필은 `matching_posts`를 통해서만 조회 가능 (간접 접근)

---

### 3. `matching_posts` 테이블

매칭용 게시글과 AI 생성 요약을 저장합니다. 데이터 격리(소속관 기반)의 핵심 테이블입니다.

```sql
CREATE TABLE matching_posts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  dormitory dormitory_type NOT NULL,
  ai_summary TEXT,
  match_score INTEGER CHECK (match_score >= 0 AND match_score <= 100),
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

-- 업데이트 시간 자동 갱신 트리거
CREATE TRIGGER update_matching_posts_updated_at
  BEFORE UPDATE ON matching_posts
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();
```

**RLS 정책**:
- 사용자는 자신의 게시글만 생성/수정/삭제 가능
- 다른 사용자의 게시글은 자신의 `dormitory`와 일치하는 경우만 조회 가능
- `is_active = FALSE`인 게시글은 작성자만 조회 가능 (매칭 완료 후 숨김)

---

### 4. `view_logs` 테이블 (Phase 2)

연락처 조회 기록을 저장하는 감사 로그 테이블입니다.

```sql
CREATE TABLE view_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  viewer_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  viewed_post_id UUID NOT NULL REFERENCES matching_posts(id) ON DELETE CASCADE,
  contact_revealed BOOLEAN DEFAULT FALSE,
  viewed_at TIMESTAMPTZ DEFAULT NOW()
);

-- 인덱스
CREATE INDEX idx_view_logs_viewer_id ON view_logs(viewer_id);
CREATE INDEX idx_view_logs_viewed_post_id ON view_logs(viewed_post_id);
CREATE INDEX idx_view_logs_viewed_at ON view_logs(viewed_at DESC);
CREATE INDEX idx_view_logs_viewer_date ON view_logs(viewer_id, DATE(viewed_at));
```

**RLS 정책**:
- 사용자는 자신의 조회 로그만 조회 가능
- 조회 로그는 서버 사이드에서만 생성 가능

---

### 5. `bookmarks` 테이블 (Phase 2)

사용자가 찜한 프로필을 저장합니다.

```sql
CREATE TABLE bookmarks (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
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

### 6. `daily_limits` 테이블 (Phase 2)

일일 연락처 조회 제한을 추적합니다.

```sql
CREATE TABLE daily_limits (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  limit_date DATE NOT NULL DEFAULT CURRENT_DATE,
  reveals_used INTEGER DEFAULT 0 CHECK (reveals_used >= 0 AND reveals_used <= 3),
  reveals_remaining INTEGER GENERATED ALWAYS AS (3 - reveals_used) STORED,
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
- 제한 정보는 서버 사이드에서만 업데이트 가능

---

## 🔒 Row Level Security (RLS) 정책 상세

### `profiles` 테이블 RLS

```sql
-- RLS 활성화
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;

-- 자신의 프로필 조회/수정 가능
CREATE POLICY "Users can view own profile"
  ON profiles FOR SELECT
  USING (auth.uid() = id);

CREATE POLICY "Users can update own profile"
  ON profiles FOR UPDATE
  USING (auth.uid() = id);

CREATE POLICY "Users can insert own profile"
  ON profiles FOR INSERT
  WITH CHECK (auth.uid() = id);
```

### `matching_posts` 테이블 RLS

```sql
-- RLS 활성화
ALTER TABLE matching_posts ENABLE ROW LEVEL SECURITY;

-- 자신의 게시글 조회/수정/삭제 가능
CREATE POLICY "Users can manage own posts"
  ON matching_posts FOR ALL
  USING (auth.uid() = user_id);

-- 같은 소속관의 활성 게시글만 조회 가능
CREATE POLICY "Users can view posts from same dormitory"
  ON matching_posts FOR SELECT
  USING (
    dormitory = (SELECT dormitory FROM profiles WHERE id = auth.uid())
    AND is_active = TRUE
  );
```

### `bookmarks` 테이블 RLS

```sql
-- RLS 활성화
ALTER TABLE bookmarks ENABLE ROW LEVEL SECURITY;

-- 자신의 찜 목록만 관리 가능
CREATE POLICY "Users can manage own bookmarks"
  ON bookmarks FOR ALL
  USING (auth.uid() = user_id);
```

### `daily_limits` 테이블 RLS

```sql
-- RLS 활성화
ALTER TABLE daily_limits ENABLE ROW LEVEL SECURITY;

-- 자신의 일일 제한 정보만 조회 가능
CREATE POLICY "Users can view own daily limits"
  ON daily_limits FOR SELECT
  USING (auth.uid() = user_id);
```

---

## 🔄 데이터 관계도 (ERD)

```
users (1) ──┐
            ├── (1:1) profiles
            │
            ├── (1:N) matching_posts
            │
            ├── (1:N) view_logs
            │
            ├── (1:N) bookmarks
            │
            └── (1:N) daily_limits

matching_posts (1) ── (N) view_logs
matching_posts (1) ── (N) bookmarks
```

---

## 📊 주요 쿼리 패턴

### 1. 소속관 기반 프로필 조회 (데이터 격리)

```sql
-- 현재 사용자의 소속관과 일치하는 활성 게시글 조회
SELECT 
  mp.*,
  p.name,
  p.gender,
  p.major_category,
  p.grade,
  p.avatar_url
FROM matching_posts mp
JOIN profiles p ON mp.user_id = p.id
WHERE 
  mp.dormitory = (SELECT dormitory FROM profiles WHERE id = auth.uid())
  AND mp.is_active = TRUE
ORDER BY mp.created_at DESC;
```

### 2. AI 추천 피드 (matchScore >= 80)

```sql
SELECT 
  mp.*,
  p.name,
  p.gender,
  p.major_category,
  p.grade,
  p.avatar_url
FROM matching_posts mp
JOIN profiles p ON mp.user_id = p.id
WHERE 
  mp.dormitory = (SELECT dormitory FROM profiles WHERE id = auth.uid())
  AND mp.is_active = TRUE
  AND mp.match_score >= 80
ORDER BY mp.match_score DESC, mp.created_at DESC;
```

### 3. 일일 조회권 확인 및 차감

```sql
-- 조회권 확인
SELECT reveals_remaining
FROM daily_limits
WHERE user_id = auth.uid() 
  AND limit_date = CURRENT_DATE;

-- 조회권 차감 (UPSERT)
INSERT INTO daily_limits (user_id, limit_date, reveals_used)
VALUES (auth.uid(), CURRENT_DATE, 1)
ON CONFLICT (user_id, limit_date)
DO UPDATE SET 
  reveals_used = daily_limits.reveals_used + 1,
  updated_at = NOW()
WHERE daily_limits.reveals_used < 3;
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
  b.created_at AS bookmarked_at
FROM bookmarks b
JOIN matching_posts mp ON b.post_id = mp.id
JOIN profiles p ON mp.user_id = p.id
WHERE b.user_id = auth.uid()
ORDER BY b.created_at DESC;
```

---

## 🚀 마이그레이션 전략

### Phase 1 (MVP) 마이그레이션
1. `users` 테이블 생성
2. `profiles` 테이블 생성
3. `matching_posts` 테이블 생성
4. 기본 RLS 정책 적용

### Phase 2 (고도화) 마이그레이션
1. `view_logs` 테이블 생성
2. `bookmarks` 테이블 생성
3. `daily_limits` 테이블 생성
4. 추가 RLS 정책 적용

---

## 🔍 성능 최적화

### 인덱스 전략
- 자주 조회되는 컬럼에 인덱스 생성 (`dormitory`, `is_active`, `match_score`)
- 복합 인덱스 활용 (`user_id, limit_date`)
- 정렬이 필요한 컬럼에 인덱스 생성 (`created_at DESC`)

### 쿼리 최적화
- JOIN 최소화
- 필요한 컬럼만 SELECT
- 페이지네이션 적용 (필요시)

---

## 📝 참고 사항

- 모든 타임스탬프는 `TIMESTAMPTZ` 사용 (타임존 고려)
- 외래 키 제약조건에 `ON DELETE CASCADE` 적용 (데이터 정합성)
- ENUM 타입 사용으로 데이터 무결성 보장
- CHECK 제약조건으로 비즈니스 로직 검증

---

**작성일**: 2026-01-29  
**버전**: 1.0.0
