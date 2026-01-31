-- ============================================================
-- Migration: view_logs + daily_limits RLS - INSERT/UPDATE 정책 추가
-- 파일: 20260201_170000_view_logs_rls_insert_v1.sql
-- ============================================================
--
-- [변경 사유]
-- view_logs에 INSERT 정책이 없어 연락처 공개 시 "new row violates row-level
-- security policy for table view_logs" → 500 발생.
-- daily_limits에 INSERT/UPDATE 정책이 없어 같은 API에서 UPSERT 실패 가능.
-- 본인 행만 INSERT/UPDATE 허용 정책 추가.
--
-- [영향도]
-- 테이블: view_logs (INSERT 1개), daily_limits (INSERT 1개, UPDATE 1개)
-- 기능: 연락처 공개(연락처 확인하기) 정상 동작
--
-- [실행 조건]
-- view_logs, daily_limits 테이블 존재, RLS 활성화된 상태.
-- Supabase SQL Editor에서 실행.
--
-- [Rollback] 하단 참고
-- ============================================================

-- view_logs: 본인 viewer_id로만 INSERT
CREATE POLICY "Users can insert own view_logs"
  ON view_logs FOR INSERT
  WITH CHECK (auth.uid() = viewer_id);

-- daily_limits: 본인 user_id로만 INSERT/UPDATE (연락처 공개 시 UPSERT)
CREATE POLICY "Users can insert own daily_limits"
  ON daily_limits FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own daily_limits"
  ON daily_limits FOR UPDATE
  USING (auth.uid() = user_id);

-- ============================================================
-- ROLLBACK (필요 시 수동 실행)
-- ============================================================
-- DROP POLICY IF EXISTS "Users can insert own view_logs" ON view_logs;
-- DROP POLICY IF EXISTS "Users can insert own daily_limits" ON daily_limits;
-- DROP POLICY IF EXISTS "Users can update own daily_limits" ON daily_limits;
