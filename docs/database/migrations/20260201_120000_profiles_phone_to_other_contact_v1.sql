-- ============================================================
-- Migration: profiles 테이블 phone → other_contact 교체
-- ============================================================
-- 변경 이유: 전화번호(phone)는 개인정보 민감도가 높아 제거하고,
--           이메일/SNS 등 연락 수단을 담는 other_contact(기타 연락처)로 대체
-- 영향 범위: profiles 테이블, 프로필 CRUD API, 온보딩/마이페이지/상세 UI
-- ============================================================
-- [실행 전] 기존 phone 데이터가 필요하면 백업 후 진행
-- [Rollback] 아래 Rollback 구문으로 복원 가능 (other_contact 데이터는 유실)
-- ============================================================

-- 1) 새 컬럼 추가
ALTER TABLE profiles
  ADD COLUMN IF NOT EXISTS other_contact TEXT;

-- 2) 기존 phone 값을 other_contact로 복사 (선택: 필요 시 실행)
-- UPDATE profiles SET other_contact = phone WHERE phone IS NOT NULL;

-- 3) phone 컬럼 제거
ALTER TABLE profiles
  DROP COLUMN IF EXISTS phone;

-- ============================================================
-- Verification
-- ============================================================
-- SELECT column_name, data_type FROM information_schema.columns
-- WHERE table_name = 'profiles' AND column_name IN ('phone', 'other_contact');
-- → other_contact만 존재, phone 없음 확인

-- ============================================================
-- Rollback (문제 발생 시)
-- ============================================================
-- ALTER TABLE profiles ADD COLUMN IF NOT EXISTS phone TEXT;
-- ALTER TABLE profiles DROP COLUMN IF EXISTS other_contact;
