-- =====================================================
-- Matching Me? (매칭미?) - Seed Data
-- =====================================================
-- Generated: 2026-01-31
-- Purpose: 초기 테스트 데이터 생성 (UI/매칭 기능 검증용)
-- Note: 실제 서비스 데이터가 아닌 테스트용 샘플 데이터
-- Schema: docs/database/supabase-schema.sql 기준 (profiles, matching_posts, view_logs, bookmarks, daily_limits)
-- =====================================================
--
-- [실행 전 필수]
-- 1. 스키마(supabase-schema.sql)가 이미 적용된 상태여야 합니다.
-- 2. 아래 10명의 사용자 UUID에 해당하는 계정이 auth.users에 있어야 합니다.
--    → Supabase Dashboard > Authentication > Users 에서 테스트 계정 10개 생성 후,
--      해당 사용자들의 id(UUID)를 아래 USER_UUID_1 ~ USER_UUID_10 자리로 교체하세요.
--    → 또는 Supabase SQL Editor에서 auth.users에 삽입한 뒤 이 스크립트를 실행할 수 있습니다.
--
-- =====================================================

-- -----------------------------------------------------
-- [0] 실행 전: auth.users에 10명의 테스트 사용자 필요
-- -----------------------------------------------------
-- 이 스크립트의 profiles/matching_posts/bookmarks는 UUID a0000001... ~ a000000a 를 사용합니다.
-- Supabase Dashboard > Authentication > Users 에서 테스트 계정 10명 생성 후,
-- 각 사용자의 id(UUID)를 이 파일의 a0000001... 등과 동일하게 맞추거나, 이 파일의 UUID를 실제 id로 일괄 교체하세요.

-- -----------------------------------------------------
-- [1] Profiles - 10명 (성별·학과·학년·기숙사·생활패턴 다양)
-- -----------------------------------------------------
-- id = auth.users(id). gender_type: male|female, grade: 1학년~4학년, dormitory_type: dongjak|eunpyeong

INSERT INTO profiles (
  id, name, gender, major_category, grade, dormitory, other_contact, kakao_id,
  chronotype, sleeping_habit, smoking, cleanliness, noise_sensitivity, introduction, created_at, updated_at
) VALUES
  ('a0000001-0001-4000-8000-000000000001', '김서연', 'female', 'humanities', '2학년', 'dongjak', NULL, 'kim_seoyeon', 'morning', 'none', false, 4, 3, '아침형이라 새벽에 조용히 공부하는 편이에요. 깔끔한 방 선호해요!', NOW() - (random() * INTERVAL '7 days'), NOW()),
  ('a0000002-0002-4000-8000-000000000002', '박지훈', 'male', 'engineering', '3학년', 'eunpyeong', NULL, 'park_jh', 'night', 'none', false, 3, 4, '밤에 코딩할 때가 많아서 새벽까지 불 켜둘 수 있으면 좋겠어요.', NOW() - (random() * INTERVAL '7 days'), NOW()),
  ('a0000003-0003-4000-8000-000000000003', '이민지', 'female', 'social', '1학년', 'dongjak', NULL, 'lee_minji', 'morning', 'none', false, 5, 2, '청결도는 최고로 맞추고 싶어요. 주말엔 친구들이랑 놀러 다녀요.', NOW() - (random() * INTERVAL '7 days'), NOW()),
  ('a0000004-0004-4000-8000-000000000004', '최도윤', 'male', 'natural', '4학년', 'eunpyeong', NULL, 'choi_dy', 'morning', 'grinding', false, 3, 5, '이갈이 있어서 미리 말씀드려요. 귀마개 있으시면 좋겠어요.', NOW() - (random() * INTERVAL '7 days'), NOW()),
  ('a0000005-0005-4000-8000-000000000005', '정하은', 'female', 'arts', '2학년', 'dongjak', NULL, 'jung_haeun', 'night', 'none', false, 4, 3, '예체능이라 밤에 작업할 때가 많아요. 서로 존중하면서 지내요.', NOW() - (random() * INTERVAL '7 days'), NOW()),
  ('a0000006-0006-4000-8000-000000000006', '강태민', 'male', 'engineering', '1학년', 'dongjak', NULL, 'kang_taemin', 'night', 'none', false, 2, 3, '게임 가끔 해요. 밤에 헤드셋 쓰고 할게요.', NOW() - (random() * INTERVAL '7 days'), NOW()),
  ('a0000007-0007-4000-8000-000000000007', '윤서진', 'female', 'education', '3학년', 'eunpyeong', NULL, 'yoon_sj', 'morning', 'snoring', false, 4, 4, '코를 살짝 곤다는데, 칸막이 있으면 좋을 것 같아요.', NOW() - (random() * INTERVAL '7 days'), NOW()),
  ('a0000008-0008-4000-8000-000000000008', '임준혁', 'male', 'social', '2학년', 'eunpyeong', NULL, 'lim_jh', 'morning', 'none', false, 3, 2, '아침에 일어나서 조용히 책 읽는 걸 좋아해요.', NOW() - (random() * INTERVAL '7 days'), NOW()),
  ('a0000009-0009-4000-8000-000000000009', '송유나', 'female', 'humanities', '4학년', 'dongjak', NULL, 'song_yna', 'night', 'none', false, 5, 5, '소음에 예민한 편이라 조용한 분이면 좋겠어요.', NOW() - (random() * INTERVAL '7 days'), NOW()),
  ('a000000a-000a-4000-8000-00000000000a', '한지우', 'male', 'natural', '1학년', 'dongjak', NULL, 'han_jiwoo', 'night', 'none', false, 3, 3, '주말에 운동하고 야식 자주 먹어요. 같이 먹을 분 환영해요.', NOW() - (random() * INTERVAL '7 days'), NOW())
ON CONFLICT (id) DO NOTHING;

-- -----------------------------------------------------
-- [2] Matching Posts - 사용자당 1개 활성 게시글 (user_id = profiles.id)
-- -----------------------------------------------------
-- match_score: INTEGER 0~100 (스키마 기준). 고정 id로 재실행 시 중복 방지.

INSERT INTO matching_posts (id, user_id, dormitory, ai_summary, match_score, is_active, created_at, updated_at)
VALUES
  ('b0000001-0001-4000-8000-000000000001', 'a0000001-0001-4000-8000-000000000001', 'dongjak', '아침형 인간이에요! 깔끔한 환경을 선호하고 조용한 분위기에서 공부하는 걸 좋아해요. 주말엔 도서관 가는 편이에요.', 72, true, NOW() - INTERVAL '3 days', NOW()),
  ('b0000002-0002-4000-8000-000000000002', 'a0000002-0002-4000-8000-000000000002', 'eunpyeong', '밤에 코딩할 때가 많아서 새벽까지 불 켜둬도 되는 분이면 좋겠어요. 헤드폰 쓰고 지낼게요.', 68, true, NOW() - INTERVAL '5 days', NOW()),
  ('b0000003-0003-4000-8000-000000000003', 'a0000003-0003-4000-8000-000000000003', 'dongjak', '청결 최고로 맞추고 싶어요. 정리 정돈 좋아하고, 주말에 친구들이랑 카페 가는 걸 좋아해요.', 85, true, NOW() - INTERVAL '2 days', NOW()),
  ('b0000004-0004-4000-8000-000000000004', 'a0000004-0004-4000-8000-000000000004', 'eunpyeong', '이갈이 있어서 미리 말씀드려요. 귀마개 있으시면 감사할게요. 아침형이라 일찍 자요.', 61, true, NOW() - INTERVAL '4 days', NOW()),
  ('b0000005-0005-4000-8000-000000000005', 'a0000005-0005-4000-8000-000000000005', 'dongjak', '예체능이라 밤에 작업할 때가 많아요. 서로 시간 존중하면서 지내요. 깔끔한 편이에요.', 77, true, NOW() - INTERVAL '1 days', NOW()),
  ('b0000006-0006-4000-8000-000000000006', 'a0000006-0006-4000-8000-000000000006', 'dongjak', '게임 가끔 해요. 밤에 헤드셋 쓰고 할게요. 청결도는 보통으로 맞추면 될 것 같아요.', 55, true, NOW() - INTERVAL '6 days', NOW()),
  ('b0000007-0007-4000-8000-000000000007', 'a0000007-0007-4000-8000-000000000007', 'eunpyeong', '코를 살짝 곤다는데 칸막이 있으면 좋을 것 같아요. 아침형이고 깔끔한 방 선호해요.', 80, true, NOW() - INTERVAL '2 days', NOW()),
  ('b0000008-0008-4000-8000-000000000008', 'a0000008-0008-4000-8000-000000000008', 'eunpyeong', '아침에 일어나서 조용히 책 읽는 걸 좋아해요. 깔끔하고 조용한 분이면 좋겠어요.', 70, true, NOW() - INTERVAL '4 days', NOW()),
  ('b0000009-0009-4000-8000-000000000009', 'a0000009-0009-4000-8000-000000000009', 'dongjak', '소음에 예민한 편이라 조용한 분이면 좋겠어요. 밤에 독서하는 걸 좋아해요.', 88, true, NOW() - INTERVAL '3 days', NOW()),
  ('b000000a-000a-4000-8000-00000000000a', 'a000000a-000a-4000-8000-00000000000a', 'dongjak', '주말에 운동하고 야식 자주 먹어요. 같이 먹을 분 환영! 밤형이라 새벽에 잘 자요.', 63, true, NOW() - INTERVAL '5 days', NOW())
ON CONFLICT (id) DO NOTHING;

-- -----------------------------------------------------
-- [2.5] View Logs (Optional) - 연락처 조회 로그 테스트용
-- -----------------------------------------------------
-- viewer_id(FK auth.users), viewed_post_id(FK matching_posts), contact_revealed, viewed_at
-- INSERT는 일반적으로 서버/Service Role에서 수행. 시드용 샘플만 삽입.

INSERT INTO view_logs (id, viewer_id, viewed_post_id, contact_revealed, viewed_at)
VALUES
  (gen_random_uuid(), 'a0000001-0001-4000-8000-000000000001', 'b0000003-0003-4000-8000-000000000003', true, NOW() - INTERVAL '2 days'),
  (gen_random_uuid(), 'a0000001-0001-4000-8000-000000000001', 'b0000007-0007-4000-8000-000000000007', false, NOW() - INTERVAL '3 days'),
  (gen_random_uuid(), 'a0000003-0003-4000-8000-000000000003', 'b0000001-0001-4000-8000-000000000001', true, NOW() - INTERVAL '1 days'),
  (gen_random_uuid(), 'a0000002-0002-4000-8000-000000000002', 'b0000008-0008-4000-8000-000000000008', true, NOW() - INTERVAL '2 days'),
  (gen_random_uuid(), 'a0000002-0002-4000-8000-000000000002', 'b000000a-000a-4000-8000-00000000000a', false, NOW() - INTERVAL '4 days'),
  (gen_random_uuid(), 'a0000008-0008-4000-8000-000000000008', 'b0000002-0002-4000-8000-000000000002', true, NOW() - INTERVAL '1 days'),
  (gen_random_uuid(), 'a000000a-000a-4000-8000-00000000000a', 'b0000006-0006-4000-8000-000000000006', false, NOW() - INTERVAL '3 days');

-- -----------------------------------------------------
-- [3] Bookmarks - 18개 관심 표시 (동성만, post_id = matching_posts 고정 id)
-- -----------------------------------------------------
-- 같은 성별끼리만 북마크. UNIQUE(user_id, post_id) → ON CONFLICT (user_id, post_id) DO NOTHING.

INSERT INTO bookmarks (id, user_id, post_id, created_at)
VALUES
  -- female → female (김서연1, 이민지3, 정하은5, 윤서진7, 송유나9)
  (gen_random_uuid(), 'a0000001-0001-4000-8000-000000000001', 'b0000003-0003-4000-8000-000000000003', NOW() - INTERVAL '2 days'),
  (gen_random_uuid(), 'a0000001-0001-4000-8000-000000000001', 'b0000005-0005-4000-8000-000000000005', NOW() - INTERVAL '3 days'),
  (gen_random_uuid(), 'a0000003-0003-4000-8000-000000000003', 'b0000001-0001-4000-8000-000000000001', NOW() - INTERVAL '1 days'),
  (gen_random_uuid(), 'a0000003-0003-4000-8000-000000000003', 'b0000009-0009-4000-8000-000000000009', NOW() - INTERVAL '4 days'),
  (gen_random_uuid(), 'a0000005-0005-4000-8000-000000000005', 'b0000007-0007-4000-8000-000000000007', NOW() - INTERVAL '2 days'),
  (gen_random_uuid(), 'a0000007-0007-4000-8000-000000000007', 'b0000001-0001-4000-8000-000000000001', NOW() - INTERVAL '3 days'),
  (gen_random_uuid(), 'a0000009-0009-4000-8000-000000000009', 'b0000003-0003-4000-8000-000000000003', NOW() - INTERVAL '1 days'),
  (gen_random_uuid(), 'a0000009-0009-4000-8000-000000000009', 'b0000007-0007-4000-8000-000000000007', NOW() - INTERVAL '5 days'),
  -- male → male (박지훈2, 최도윤4, 강태민6, 임준혁8, 한지우10)
  (gen_random_uuid(), 'a0000002-0002-4000-8000-000000000002', 'b0000008-0008-4000-8000-000000000008', NOW() - INTERVAL '2 days'),
  (gen_random_uuid(), 'a0000002-0002-4000-8000-000000000002', 'b000000a-000a-4000-8000-00000000000a', NOW() - INTERVAL '4 days'),
  (gen_random_uuid(), 'a0000004-0004-4000-8000-000000000004', 'b0000008-0008-4000-8000-000000000008', NOW() - INTERVAL '3 days'),
  (gen_random_uuid(), 'a0000006-0006-4000-8000-000000000006', 'b000000a-000a-4000-8000-00000000000a', NOW() - INTERVAL '1 days'),
  (gen_random_uuid(), 'a0000008-0008-4000-8000-000000000008', 'b0000002-0002-4000-8000-000000000002', NOW() - INTERVAL '2 days'),
  (gen_random_uuid(), 'a0000008-0008-4000-8000-000000000008', 'b0000004-0004-4000-8000-000000000004', NOW() - INTERVAL '4 days'),
  (gen_random_uuid(), 'a000000a-000a-4000-8000-00000000000a', 'b0000006-0006-4000-8000-000000000006', NOW() - INTERVAL '3 days'),
  (gen_random_uuid(), 'a000000a-000a-4000-8000-00000000000a', 'b0000002-0002-4000-8000-000000000002', NOW() - INTERVAL '5 days'),
  (gen_random_uuid(), 'a0000005-0005-4000-8000-000000000005', 'b0000001-0001-4000-8000-000000000001', NOW() - INTERVAL '4 days'),
  (gen_random_uuid(), 'a0000004-0004-4000-8000-000000000004', 'b000000a-000a-4000-8000-00000000000a', NOW() - INTERVAL '2 days')
ON CONFLICT (user_id, post_id) DO NOTHING;

-- -----------------------------------------------------
-- [4] Daily Limits (Optional) - 일일 조회권 테스트용
-- -----------------------------------------------------
-- limit_date: DATE, reveals_used: 0~3 (스키마 CHECK). 10명×7일 = 70행.
-- RLS가 켜진 경우, 70행 모두 넣으려면 SQL Editor에서 service role로 실행하세요.

INSERT INTO daily_limits (id, user_id, limit_date, reveals_used, updated_at)
SELECT gen_random_uuid(), p.id, CURRENT_DATE + d.n, floor(random() * 4)::int, NOW()
FROM profiles p
CROSS JOIN (SELECT generate_series(0, 6) AS n) d
ON CONFLICT (user_id, limit_date) DO NOTHING;

-- =====================================================
-- Verification Queries (실행 후 확인용)
-- =====================================================

-- 사용자 수 확인
SELECT COUNT(*) AS total_users FROM profiles;

-- 활성 게시글 수 확인
SELECT COUNT(*) AS active_posts FROM matching_posts WHERE is_active = true;

-- 관심 표시 관계 확인
SELECT COUNT(*) AS total_bookmarks FROM bookmarks;

-- 연락처 조회 로그 수 확인
SELECT COUNT(*) AS total_view_logs FROM view_logs;

-- 기숙사별 사용자 분포
SELECT dormitory, COUNT(*) AS user_count FROM profiles GROUP BY dormitory ORDER BY user_count DESC;

-- 성별 분포
SELECT gender, COUNT(*) AS user_count FROM profiles GROUP BY gender;

-- =====================================================
-- Schema Compliance (supabase-schema.sql 기준 재점검)
-- =====================================================
-- [x] profiles: id(FK auth.users), name, gender(gender_type), major_category(major_category_type),
--     grade(TEXT '1학년'~'4학년'), dormitory(dormitory_type), other_contact, kakao_id, chronotype, sleeping_habit,
--     smoking, cleanliness(1-5), noise_sensitivity(1-5), introduction(≤500), created_at, updated_at
-- [x] matching_posts: id, user_id(FK auth.users), dormitory, ai_summary, match_score(INTEGER 0-100), is_active, created_at, updated_at
-- [x] view_logs: id, viewer_id(FK auth.users), viewed_post_id(FK matching_posts), contact_revealed, viewed_at
-- [x] bookmarks: id, user_id(FK auth.users), post_id(FK matching_posts), created_at, UNIQUE(user_id, post_id)
-- [x] daily_limits: id, user_id(FK auth.users), limit_date(DATE), reveals_used(0-3), updated_at, UNIQUE(user_id, limit_date)
--
-- Quality: 한국인 이름, 010-XXXX-XXXX, 동성만 북마크, FK 무결성, ON CONFLICT 적용
