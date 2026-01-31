-- ============================================================
-- Migration: RLS 무한 재귀 제거 — get_my_dormitory() SECURITY DEFINER
-- 파일: 20260201_160000_rls_get_my_dormitory_v1.sql
-- ============================================================
--
-- [변경 사유]
-- profiles / matching_posts RLS 정책에서 (SELECT dormitory FROM profiles WHERE id = auth.uid())
-- 를 사용하면, profiles SELECT 시 같은 테이블을 다시 읽어 무한 재귀가 발생하고
-- PostgREST가 500 Internal Server Error 를 반환함.
-- SECURITY DEFINER 함수로 현재 사용자 dormitory만 조회해 재귀를 제거함.
--
-- [영향도]
-- 테이블: profiles, matching_posts (RLS 정책만 변경)
-- 기능: 동작은 동일, 500 에러 해소
--
-- [실행 조건]
-- profiles, matching_posts 테이블과 기존 RLS 정책이 적용된 상태.
-- Supabase SQL Editor에서 실행.
--
-- [Rollback] 하단 참고
-- ============================================================

-- Step 1: 현재 사용자 dormitory 반환 (RLS 우회로 재귀 방지)
CREATE OR REPLACE FUNCTION public.get_my_dormitory()
RETURNS dormitory_type
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT dormitory FROM profiles WHERE id = auth.uid() LIMIT 1;
$$;

-- Step 2: profiles SELECT 정책 교체 (서브쿼리 → 함수)
DROP POLICY IF EXISTS "Users can view own profile and other profiles in same dormitory" ON profiles;
CREATE POLICY "Users can view own profile and other profiles in same dormitory"
  ON profiles FOR SELECT
  USING (
    auth.uid() = id
    OR (
      dormitory = get_my_dormitory()
      AND id != auth.uid()
    )
  );

-- Step 3: matching_posts SELECT 정책 교체 (서브쿼리 → 함수)
DROP POLICY IF EXISTS "Users can view same dormitory active posts" ON matching_posts;
CREATE POLICY "Users can view same dormitory active posts"
  ON matching_posts FOR SELECT
  USING (
    user_id != auth.uid()
    AND is_active = TRUE
    AND dormitory = get_my_dormitory()
  );

-- ============================================================
-- ROLLBACK (필요 시 수동 실행)
-- ============================================================
-- DROP POLICY IF EXISTS "Users can view own profile and other profiles in same dormitory" ON profiles;
-- CREATE POLICY "Users can view own profile and other profiles in same dormitory"
--   ON profiles FOR SELECT USING (auth.uid() = id OR (dormitory = (SELECT dormitory FROM profiles WHERE id = auth.uid()) AND id != auth.uid()));
-- DROP POLICY IF EXISTS "Users can view same dormitory active posts" ON matching_posts;
-- CREATE POLICY "Users can view same dormitory active posts" ON matching_posts FOR SELECT USING (user_id != auth.uid() AND is_active = TRUE AND dormitory = (SELECT dormitory FROM profiles WHERE id = auth.uid()));
-- DROP FUNCTION IF EXISTS public.get_my_dormitory();
