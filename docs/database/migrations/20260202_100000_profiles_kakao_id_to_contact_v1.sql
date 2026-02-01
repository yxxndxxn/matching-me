-- ============================================================
-- Migration: profiles 테이블 kakao_id → contact 컬럼명 변경
-- ============================================================
-- 변경 이유: 카카오톡 ID 전용 → 연락 가능한 수단(카카오톡 ID, 전화번호 등)으로 확장
-- 영향 범위: profiles 테이블, 프로필 CRUD API, 온보딩/마이페이지/상세 UI
-- ============================================================

-- 1) kakao_id 컬럼을 contact로 이름 변경
ALTER TABLE profiles
  RENAME COLUMN kakao_id TO contact;

-- ============================================================
-- Verification
-- ============================================================
-- SELECT column_name, data_type FROM information_schema.columns
-- WHERE table_name = 'profiles' AND column_name IN ('kakao_id', 'contact');
-- → contact만 존재, kakao_id 없음 확인

-- ============================================================
-- Rollback (문제 발생 시)
-- ============================================================
-- ALTER TABLE profiles RENAME COLUMN contact TO kakao_id;
