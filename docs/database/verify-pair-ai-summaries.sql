-- ============================================================
-- pair_ai_summaries 테이블 완전성 검증 쿼리
-- Step 1에서 테이블이 존재함을 확인했으므로, 이제 RLS와 정책을 확인합니다.
-- ============================================================

-- 1. RLS 활성화 여부 확인
SELECT 
  tablename,
  rowsecurity as rls_enabled,
  CASE 
    WHEN rowsecurity = true THEN '✅ RLS 활성화됨'
    ELSE '❌ RLS 비활성화 - 보안 위험!'
  END as status
FROM pg_tables
WHERE schemaname = 'public' 
  AND tablename = 'pair_ai_summaries';

-- 2. RLS 정책 확인 (3개 정책이 있어야 함)
SELECT 
  schemaname,
  tablename,
  policyname,
  permissive,
  roles,
  cmd as command_type,
  qual as using_expression,
  with_check as with_check_expression
FROM pg_policies
WHERE schemaname = 'public' 
  AND tablename = 'pair_ai_summaries'
ORDER BY policyname;

-- 3. 인덱스 확인 (5개 = PK 1개 + UNIQUE 1개 + 명시적 인덱스 3개)
SELECT 
  indexname,
  indexdef
FROM pg_indexes
WHERE schemaname = 'public' 
  AND tablename = 'pair_ai_summaries'
ORDER BY indexname;

-- 4. 컬럼 구조 확인
SELECT 
  column_name,
  data_type,
  is_nullable,
  column_default
FROM information_schema.columns
WHERE table_schema = 'public' 
  AND table_name = 'pair_ai_summaries'
ORDER BY ordinal_position;
