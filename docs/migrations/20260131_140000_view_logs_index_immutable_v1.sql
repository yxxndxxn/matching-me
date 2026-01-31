-- ============================================================
-- Migration: view_logs 인덱스 IMMUTABLE 수정
-- 파일: 20260131_140000_view_logs_index_immutable_v1.sql
-- ============================================================
--
-- [변경 사유]
-- idx_view_logs_viewer_date 가 (viewed_at::date) 를 사용하면
-- "functions in index expression must be marked IMMUTABLE" 오류 발생.
-- timestamptz → date 를 UTC 기준으로 고정해 IMMUTABLE 하게 변경.
--
-- [영향도]
-- 테이블: view_logs (인덱스 1개만 변경, 데이터 변경 없음)
-- 쿼리: viewer별 일자별 조회 시 동일하게 사용 가능 (조건을 (viewed_at AT TIME ZONE 'UTC')::date 로 맞추면 인덱스 활용)
--
-- [실행 조건]
-- 이미 Supabase에 스키마가 적용된 상태. view_logs 테이블 존재.
-- Case A: idx_view_logs_viewer_date 가 없음 → Step 1만 실행
-- Case B: 기존 인덱스가 (viewed_at::date) 로 있음 → Step 1 + Step 2 실행
--
-- [Rollback] 하단 -- ROLLBACK 섹션 참고
-- ============================================================

-- Step 1: 기존 인덱스 제거 (없으면 무시)
DROP INDEX IF EXISTS idx_view_logs_viewer_date;

-- Step 2: 새 인덱스 생성 (UTC 기준 날짜, IMMUTABLE)
CREATE INDEX idx_view_logs_viewer_date
  ON view_logs(viewer_id, ((viewed_at AT TIME ZONE 'UTC')::date));

-- ============================================================
-- VERIFICATION
-- ============================================================
-- SELECT indexname, indexdef
-- FROM pg_indexes
-- WHERE tablename = 'view_logs' AND indexname = 'idx_view_logs_viewer_date';
-- indexdef 에 "AT TIME ZONE 'UTC'" 포함되면 적용됨.

-- ============================================================
-- ROLLBACK (필요 시에만, Supabase에 따라 (viewed_at::date) 는 오류 가능)
-- ============================================================
-- DROP INDEX IF EXISTS idx_view_logs_viewer_date;
-- CREATE INDEX idx_view_logs_viewer_date ON view_logs(viewer_id, (viewed_at::date));
