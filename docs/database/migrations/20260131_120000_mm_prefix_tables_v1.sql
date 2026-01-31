-- ============================================================
-- Migration: MM_ 접두사 테이블 이름 통일
-- 파일: 20260131_120000_mm_prefix_tables_v1.sql
-- ============================================================
--
-- [변경 사유]
-- 프로젝트 정책상 정규화된 MM_ 접두사 기반 스키마를 사용하기 위해
-- 기존 테이블명(profiles, matching_posts 등)을 mm_* 로 증분 변경합니다.
--
-- [영향도 평가]
-- - 테이블: profiles → mm_profiles, matching_posts → mm_matching_posts,
--   view_logs → mm_view_logs, bookmarks → mm_bookmarks, daily_limits → mm_daily_limits
-- - RLS: matching_posts 정책 중 profiles를 참조하는 정책 1건 재생성 필요
-- - FK: PostgreSQL이 내부적으로 참조 유지하므로 추가 변경 없음
-- - 애플리케이션: types/database.ts 의 Tables 키 및 Supabase .from() 호출부를
--   mm_profiles, mm_matching_posts 등으로 변경해야 함
--
-- [실행 전 확인]
-- - 기존 테이블이 이미 존재하는 환경에서만 실행하세요. (신규 설치 시 스키마에서 mm_* 로 생성 권장)
-- - 실행 후 Verification Query 로 결과 확인 후, 타입/앱 코드 동기화를 진행하세요.
--
-- [Rollback] 아래 파일 하단의 -- ROLLBACK 섹션 참고
-- ============================================================

-- Step 1: matching_posts 의 RLS 정책 중 profiles 참조 정책 제거 (이름 변경 후 재생성)
DROP POLICY IF EXISTS "Users can view same dormitory active posts" ON matching_posts;

-- Step 2: 테이블 이름 변경 (증분 업데이트, 데이터 유지)
ALTER TABLE profiles RENAME TO mm_profiles;
ALTER TABLE matching_posts RENAME TO mm_matching_posts;
ALTER TABLE view_logs RENAME TO mm_view_logs;
ALTER TABLE bookmarks RENAME TO mm_bookmarks;
ALTER TABLE daily_limits RENAME TO mm_daily_limits;

-- Step 3: 제거한 RLS 정책을 새 테이블명 기준으로 재생성
CREATE POLICY "Users can view same dormitory active posts"
  ON mm_matching_posts FOR SELECT
  USING (
    user_id != auth.uid()
    AND is_active = TRUE
    AND dormitory = (SELECT dormitory FROM mm_profiles WHERE id = auth.uid())
  );

-- ============================================================
-- VERIFICATION QUERY (변경 적용 확인용)
-- ============================================================
-- 아래 쿼리를 SQL Editor에서 실행하여 mm_* 테이블이 보이면 성공입니다.
--
-- SELECT table_name
-- FROM information_schema.tables
-- WHERE table_schema = 'public'
--   AND table_name IN ('mm_profiles', 'mm_matching_posts', 'mm_view_logs', 'mm_bookmarks', 'mm_daily_limits')
-- ORDER BY table_name;

-- ============================================================
-- ROLLBACK (문제 발생 시 이전 상태로 복원)
-- ============================================================
-- 실행 순서를 지켜야 합니다. Supabase SQL Editor에 복사 후 실행하세요.
--
-- DROP POLICY IF EXISTS "Users can view same dormitory active posts" ON mm_matching_posts;
--
-- ALTER TABLE mm_profiles RENAME TO profiles;
-- ALTER TABLE mm_matching_posts RENAME TO matching_posts;
-- ALTER TABLE mm_view_logs RENAME TO view_logs;
-- ALTER TABLE mm_bookmarks RENAME TO bookmarks;
-- ALTER TABLE mm_daily_limits RENAME TO daily_limits;
--
-- CREATE POLICY "Users can view same dormitory active posts"
--   ON matching_posts FOR SELECT
--   USING (
--     user_id != auth.uid()
--     AND is_active = TRUE
--     AND dormitory = (SELECT dormitory FROM profiles WHERE id = auth.uid())
--   );
