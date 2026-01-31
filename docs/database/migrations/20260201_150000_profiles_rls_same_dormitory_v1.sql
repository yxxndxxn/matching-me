-- ============================================================
-- Migration: profiles RLS - 같은 학숙구분(dormitory) 프로필 조회 허용
-- 파일: 20260201_150000_profiles_rls_same_dormitory_v1.sql
-- ============================================================
--
-- [변경 사유]
-- 기존 "Users can view own profile" 정책은 본인 프로필만 SELECT 가능해,
-- 매칭 피드에서 다른 사용자 프로필을 불러오지 못해 목록이 비어 보이는 문제 발생.
-- 같은 dormitory 내 다른 사용자 프로필 조회를 허용하도록 정책 확장.
--
-- [영향도]
-- 테이블: profiles (RLS 정책만 변경, 데이터 변경 없음)
-- 기능: 매칭 피드(getMatchingPosts → 프로필 조회)에서 같은 학숙구분 사용자 노출 가능
--
-- [실행 조건]
-- profiles 테이블에 RLS가 활성화된 상태.
-- Supabase SQL Editor 또는 migration 도구로 실행.
--
-- [Rollback] 하단 -- ROLLBACK 섹션 참고
-- ============================================================

-- Step 1: 기존 SELECT 정책 제거 (이름이 다를 수 있음)
DROP POLICY IF EXISTS "Users can view own profile" ON profiles;
DROP POLICY IF EXISTS "Users can view own profile and other profiles in same dormitory" ON profiles;

-- Step 2: 새 정책 생성 (본인 + 같은 dormitory 타인 프로필 SELECT 허용)
CREATE POLICY "Users can view own profile and other profiles in same dormitory"
  ON profiles FOR SELECT
  USING (
    auth.uid() = id
    OR (
      dormitory = (SELECT dormitory FROM profiles WHERE id = auth.uid())
      AND id != auth.uid()
    )
  );

-- ============================================================
-- ROLLBACK (필요 시 수동 실행)
-- ============================================================
-- DROP POLICY IF EXISTS "Users can view own profile and other profiles in same dormitory" ON profiles;
-- CREATE POLICY "Users can view own profile" ON profiles FOR SELECT USING (auth.uid() = id);
