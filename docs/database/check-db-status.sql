-- ============================================================
-- Production DB 상태 확인 쿼리
-- Supabase SQL Editor에서 실행하여 현재 상태를 확인하세요.
-- ============================================================

-- 1. 테이블 존재 여부 확인
SELECT 
  table_name,
  CASE 
    WHEN table_name IN ('profiles', 'matching_posts', 'view_logs', 'bookmarks', 'daily_limits', 'pair_ai_summaries')
    THEN '✅ 존재'
    ELSE '⚠️ 없음'
  END as status
FROM information_schema.tables
WHERE table_schema = 'public'
  AND table_name IN ('profiles', 'matching_posts', 'view_logs', 'bookmarks', 'daily_limits', 'pair_ai_summaries')
ORDER BY table_name;

-- 2. RLS 활성화 여부 확인
SELECT 
  schemaname,
  tablename,
  rowsecurity as rls_enabled
FROM pg_tables
WHERE schemaname = 'public'
  AND tablename IN ('profiles', 'matching_posts', 'view_logs', 'bookmarks', 'daily_limits', 'pair_ai_summaries')
ORDER BY tablename;

-- 3. pair_ai_summaries 테이블 존재 여부 (최근 추가된 테이블)
SELECT 
  CASE 
    WHEN EXISTS (
      SELECT 1 FROM information_schema.tables 
      WHERE table_schema = 'public' AND table_name = 'pair_ai_summaries'
    )
    THEN '✅ pair_ai_summaries 테이블 존재'
    ELSE '❌ pair_ai_summaries 테이블 없음 - 마이그레이션 필요'
  END as pair_ai_summaries_status;
