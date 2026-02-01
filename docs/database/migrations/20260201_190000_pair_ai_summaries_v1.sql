-- ============================================================
-- pair_ai_summaries 테이블 생성
-- 상세 페이지 진입 시 (viewer, target) 쌍별 AI 시너지 요약 캐싱
-- ============================================================
-- 변경 사유: 두 사용자 쌍별 AI 요약을 DB에 캐싱하여 API 호출 비용 절감
-- 영향: 신규 테이블 추가, RLS 정책, 관련 API/타입 추가 필요
-- ============================================================

-- ------------------------------------------------------------
-- pair_ai_summaries: viewer_id + target_post_id → ai_summary
-- ------------------------------------------------------------
CREATE TABLE pair_ai_summaries (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  viewer_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  target_post_id UUID NOT NULL REFERENCES matching_posts(id) ON DELETE CASCADE,
  ai_summary TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(viewer_id, target_post_id)
);

CREATE INDEX idx_pair_ai_summaries_viewer_id ON pair_ai_summaries(viewer_id);
CREATE INDEX idx_pair_ai_summaries_target_post_id ON pair_ai_summaries(target_post_id);
CREATE INDEX idx_pair_ai_summaries_viewer_target ON pair_ai_summaries(viewer_id, target_post_id);

ALTER TABLE pair_ai_summaries ENABLE ROW LEVEL SECURITY;

-- 본인 viewer_id로만 SELECT/INSERT/UPDATE (본인이 조회한 쌍의 요약만 접근)
CREATE POLICY "Users can view own pair summaries"
  ON pair_ai_summaries FOR SELECT
  USING (auth.uid() = viewer_id);

CREATE POLICY "Users can insert own pair summaries"
  ON pair_ai_summaries FOR INSERT
  WITH CHECK (auth.uid() = viewer_id);

CREATE POLICY "Users can update own pair summaries"
  ON pair_ai_summaries FOR UPDATE
  USING (auth.uid() = viewer_id);

-- ============================================================
-- Verification Query
-- ============================================================
-- SELECT table_name, column_name FROM information_schema.columns WHERE table_name = 'pair_ai_summaries';

-- ============================================================
-- Rollback
-- ============================================================
-- DROP POLICY IF EXISTS "Users can view own pair summaries" ON pair_ai_summaries;
-- DROP POLICY IF EXISTS "Users can insert own pair summaries" ON pair_ai_summaries;
-- DROP POLICY IF EXISTS "Users can update own pair summaries" ON pair_ai_summaries;
-- DROP TABLE IF EXISTS pair_ai_summaries;
