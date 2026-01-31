-- ============================================================
-- 매칭미? (Matching Me?) - Supabase DB 스키마
-- Supabase SQL Editor에 붙여넣어 실행하세요.
-- 인증은 auth.users (Supabase Auth) 사용, 별도 users 테이블 없음.
-- ============================================================

-- ------------------------------------------------------------
-- ENUM 타입
-- ------------------------------------------------------------
CREATE TYPE gender_type AS ENUM ('male', 'female');
CREATE TYPE major_category_type AS ENUM (
  'engineering', 'humanities', 'social',
  'natural', 'arts', 'education'
);
CREATE TYPE dormitory_type AS ENUM ('dongjak', 'eunpyeong');
CREATE TYPE chronotype_type AS ENUM ('morning', 'night');
CREATE TYPE sleeping_habit_type AS ENUM ('none', 'grinding', 'snoring');

-- ------------------------------------------------------------
-- 공통: updated_at 자동 갱신 함수
-- ------------------------------------------------------------
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- ------------------------------------------------------------
-- 1. profiles (auth.users와 1:1, id = auth.uid())
-- ------------------------------------------------------------
CREATE TABLE profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
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
  cleanliness INTEGER CHECK (cleanliness IS NULL OR (cleanliness >= 1 AND cleanliness <= 5)),
  noise_sensitivity INTEGER CHECK (noise_sensitivity IS NULL OR (noise_sensitivity >= 1 AND noise_sensitivity <= 5)),
  introduction TEXT CHECK (introduction IS NULL OR char_length(introduction) <= 500),
  avatar_url TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_profiles_dormitory ON profiles(dormitory);
CREATE INDEX idx_profiles_gender ON profiles(gender);
CREATE INDEX idx_profiles_major_category ON profiles(major_category);
CREATE INDEX idx_profiles_smoking ON profiles(smoking);
CREATE INDEX idx_profiles_updated_at ON profiles(updated_at);

CREATE TRIGGER update_profiles_updated_at
  BEFORE UPDATE ON profiles
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- ------------------------------------------------------------
-- 2. matching_posts
-- ------------------------------------------------------------
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

CREATE INDEX idx_matching_posts_user_id ON matching_posts(user_id);
CREATE INDEX idx_matching_posts_dormitory ON matching_posts(dormitory);
CREATE INDEX idx_matching_posts_is_active ON matching_posts(is_active);
CREATE INDEX idx_matching_posts_match_score ON matching_posts(match_score);
CREATE INDEX idx_matching_posts_created_at ON matching_posts(created_at DESC);

CREATE TRIGGER update_matching_posts_updated_at
  BEFORE UPDATE ON matching_posts
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- ------------------------------------------------------------
-- 3. view_logs (Phase 2 - 연락처 조회 로그)
-- ------------------------------------------------------------
CREATE TABLE view_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  viewer_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  viewed_post_id UUID NOT NULL REFERENCES matching_posts(id) ON DELETE CASCADE,
  contact_revealed BOOLEAN DEFAULT FALSE,
  viewed_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_view_logs_viewer_id ON view_logs(viewer_id);
CREATE INDEX idx_view_logs_viewed_post_id ON view_logs(viewed_post_id);
CREATE INDEX idx_view_logs_viewed_at ON view_logs(viewed_at DESC);
-- timestamptz::date 는 세션 타임존에 따라 달라져 인덱스에서 허용되지 않음 → UTC 기준 날짜로 고정
CREATE INDEX idx_view_logs_viewer_date ON view_logs(viewer_id, ((viewed_at AT TIME ZONE 'UTC')::date));

-- ------------------------------------------------------------
-- 4. bookmarks (Phase 2 - 찜하기)
-- ------------------------------------------------------------
CREATE TABLE bookmarks (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  post_id UUID NOT NULL REFERENCES matching_posts(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(user_id, post_id)
);

CREATE INDEX idx_bookmarks_user_id ON bookmarks(user_id);
CREATE INDEX idx_bookmarks_post_id ON bookmarks(post_id);
CREATE INDEX idx_bookmarks_created_at ON bookmarks(created_at DESC);

-- ------------------------------------------------------------
-- 5. daily_limits (Phase 2 - 일일 조회권)
-- ------------------------------------------------------------
CREATE TABLE daily_limits (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  limit_date DATE NOT NULL DEFAULT CURRENT_DATE,
  reveals_used INTEGER DEFAULT 0 CHECK (reveals_used >= 0 AND reveals_used <= 3),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(user_id, limit_date)
);

CREATE INDEX idx_daily_limits_user_id ON daily_limits(user_id);
CREATE INDEX idx_daily_limits_limit_date ON daily_limits(limit_date);
CREATE INDEX idx_daily_limits_user_date ON daily_limits(user_id, limit_date);

-- ============================================================
-- RLS (Row Level Security)
-- ============================================================

ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE matching_posts ENABLE ROW LEVEL SECURITY;
ALTER TABLE view_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE bookmarks ENABLE ROW LEVEL SECURITY;
ALTER TABLE daily_limits ENABLE ROW LEVEL SECURITY;

-- --- profiles ---
CREATE POLICY "Users can view own profile"
  ON profiles FOR SELECT
  USING (auth.uid() = id);

CREATE POLICY "Users can update own profile"
  ON profiles FOR UPDATE
  USING (auth.uid() = id);

CREATE POLICY "Users can insert own profile"
  ON profiles FOR INSERT
  WITH CHECK (auth.uid() = id);

-- --- matching_posts: 본인 글 전체, 타인은 같은 dormitory + is_active만 SELECT ---
CREATE POLICY "Users can manage own matching_posts"
  ON matching_posts FOR ALL
  USING (auth.uid() = user_id);

CREATE POLICY "Users can view same dormitory active posts"
  ON matching_posts FOR SELECT
  USING (
    user_id != auth.uid()
    AND is_active = TRUE
    AND dormitory = (SELECT dormitory FROM profiles WHERE id = auth.uid())
  );

-- --- view_logs: 본인 로그만 SELECT (INSERT는 서버/Service Role에서) ---
CREATE POLICY "Users can view own view_logs"
  ON view_logs FOR SELECT
  USING (auth.uid() = viewer_id);

-- --- bookmarks ---
CREATE POLICY "Users can manage own bookmarks"
  ON bookmarks FOR ALL
  USING (auth.uid() = user_id);

-- --- daily_limits: 본인만 SELECT (UPDATE는 서버/Service Role에서) ---
CREATE POLICY "Users can view own daily_limits"
  ON daily_limits FOR SELECT
  USING (auth.uid() = user_id);
