-- ============================================================
-- Migration: daily_limits + view_logs RLS - SELECT 정책 추가
-- 파일: 20260201_175000_daily_limits_view_logs_select_v1.sql
-- ============================================================
--
-- [변경 사유]
-- 클라이언트(useDailyLimit)가 daily_limits를 SELECT하여 남은 연락처 횟수를 표시함.
-- SELECT 정책이 없으면 RLS로 인해 행이 반환되지 않아 항상 "3회 남음"으로 보임.
-- view_logs SELECT는 /api/matching/revealed-ids 등에서 사용.
-- 본인 행만 SELECT 허용 정책 추가. 이미 정책이 있으면 무시(duplicate_object).
--
-- [영향도]
-- 테이블: daily_limits (SELECT 1개), view_logs (SELECT 1개)
-- 기능: 연락처 남은 횟수 UI 갱신, 이미 공개한 글 목록 조회
--
-- [실행 조건]
-- daily_limits, view_logs 테이블 존재, RLS 활성화된 상태.
-- Supabase SQL Editor에서 실행.
--
-- [Rollback] 하단 참고
-- ============================================================

DO $$
BEGIN
  CREATE POLICY "Users can view own daily_limits"
    ON daily_limits FOR SELECT
    USING (auth.uid() = user_id);
EXCEPTION
  WHEN duplicate_object THEN NULL;
END $$;

DO $$
BEGIN
  CREATE POLICY "Users can view own view_logs"
    ON view_logs FOR SELECT
    USING (auth.uid() = viewer_id);
EXCEPTION
  WHEN duplicate_object THEN NULL;
END $$;

-- ============================================================
-- ROLLBACK (필요 시 수동 실행)
-- ============================================================
-- DROP POLICY IF EXISTS "Users can view own daily_limits" ON daily_limits;
-- DROP POLICY IF EXISTS "Users can view own view_logs" ON view_logs;
