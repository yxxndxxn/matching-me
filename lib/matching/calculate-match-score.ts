/**
 * 균등 가중치 매칭 점수 알고리즘 (Equal Weight)
 * 두 사용자의 라이프스타일 패턴을 비교하여 0~100점 산출
 */

import type { ProfileRow } from "@/types/database";

/** 비교에 사용되는 라이프스타일 항목 타입 */
type LifePatternFields = Pick<
  ProfileRow,
  "chronotype" | "sleeping_habit" | "smoking" | "cleanliness" | "noise_sensitivity"
>;

/** 5개 항목 × 20점 = 100점 만점 (균등 가중치) */
const ITEMS_COUNT = 5;
const POINTS_PER_ITEM = 100 / ITEMS_COUNT;

/**
 * 두 프로필의 매칭 점수 계산 (0~100 또는 null)
 * - 데이터 부족 시 null 반환
 * - 각 항목: 완전 일치 시 만점, 차이 클수록 감점
 */
export function calculateMatchScore(
  viewerProfile: LifePatternFields | null | undefined,
  targetProfile: LifePatternFields | null | undefined
): number | null {
  if (!viewerProfile || !targetProfile) return null;

  let totalScore = 0;
  let validItems = 0;

  // 1. chronotype (아침형/밤형) - 카테고리: 일치 20점, 불일치 0점
  if (viewerProfile.chronotype != null && targetProfile.chronotype != null) {
    totalScore +=
      viewerProfile.chronotype === targetProfile.chronotype ? POINTS_PER_ITEM : 0;
    validItems++;
  }

  // 2. sleeping_habit (잠버릇) - 카테고리: 일치 20점, 불일치 0점
  if (
    viewerProfile.sleeping_habit != null &&
    targetProfile.sleeping_habit != null
  ) {
    totalScore +=
      viewerProfile.sleeping_habit === targetProfile.sleeping_habit
        ? POINTS_PER_ITEM
        : 0;
    validItems++;
  }

  // 3. smoking (흡연 여부) - boolean: 일치 20점, 불일치 0점
  totalScore +=
    viewerProfile.smoking === targetProfile.smoking ? POINTS_PER_ITEM : 0;
  validItems++;

  // 4. cleanliness (청결도 1~5) - 숫자: 차이에 비례 감점
  if (
    viewerProfile.cleanliness != null &&
    targetProfile.cleanliness != null
  ) {
    const diff = Math.abs(viewerProfile.cleanliness - targetProfile.cleanliness);
    const itemScore = Math.max(0, POINTS_PER_ITEM - (diff / 4) * POINTS_PER_ITEM);
    totalScore += itemScore;
    validItems++;
  }

  // 5. noise_sensitivity (소음 민감도 1~5) - 숫자: 차이에 비례 감점
  if (
    viewerProfile.noise_sensitivity != null &&
    targetProfile.noise_sensitivity != null
  ) {
    const diff = Math.abs(
      viewerProfile.noise_sensitivity - targetProfile.noise_sensitivity
    );
    const itemScore = Math.max(0, POINTS_PER_ITEM - (diff / 4) * POINTS_PER_ITEM);
    totalScore += itemScore;
    validItems++;
  }

  // 최소 1개 항목 이상 있어야 유효
  if (validItems === 0) return null;

  // 균등 가중치: 유효한 항목 수로 정규화
  const normalized = Math.round((totalScore / (validItems * POINTS_PER_ITEM)) * 100);
  return Math.min(100, Math.max(0, normalized));
}
