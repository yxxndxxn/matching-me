/**
 * 두 프로필 간 일치 항목을 태그로 반환
 * 예: ["잠버릇 일치", "비흡연자 동일", "생활패턴 일치"]
 */

import type { ProfileRow } from "@/types/database";

type LifePatternFields = Pick<
  ProfileRow,
  "chronotype" | "sleeping_habit" | "smoking" | "cleanliness" | "noise_sensitivity"
>;

/**
 * 두 프로필의 일치 항목을 태그 배열로 반환
 */
export function getMatchingTags(
  viewerProfile: LifePatternFields | null | undefined,
  targetProfile: LifePatternFields | null | undefined
): string[] {
  if (!viewerProfile || !targetProfile) return [];

  const tags: string[] = [];

  // 1. 생활패턴 (chronotype)
  if (viewerProfile.chronotype != null && targetProfile.chronotype != null) {
    if (viewerProfile.chronotype === targetProfile.chronotype) {
      tags.push("생활패턴 일치");
    }
  }

  // 2. 잠버릇 (sleeping_habit)
  if (
    viewerProfile.sleeping_habit != null &&
    targetProfile.sleeping_habit != null
  ) {
    if (viewerProfile.sleeping_habit === targetProfile.sleeping_habit) {
      tags.push("잠버릇 일치");
    }
  }

  // 3. 흡연 (smoking)
  if (viewerProfile.smoking === targetProfile.smoking) {
    tags.push(viewerProfile.smoking ? "흡연 여부 일치" : "비흡연자 동일");
  }

  // 4. 청결도 (cleanliness)
  if (
    viewerProfile.cleanliness != null &&
    targetProfile.cleanliness != null
  ) {
    const diff = Math.abs(viewerProfile.cleanliness - targetProfile.cleanliness);
    if (diff === 0) tags.push("청결도 일치");
    else if (diff <= 1) tags.push("청결도 유사");
  }

  // 5. 소음민감도 (noise_sensitivity)
  if (
    viewerProfile.noise_sensitivity != null &&
    targetProfile.noise_sensitivity != null
  ) {
    const diff = Math.abs(
      viewerProfile.noise_sensitivity - targetProfile.noise_sensitivity
    );
    if (diff === 0) tags.push("소음민감도 일치");
    else if (diff <= 1) tags.push("소음민감도 유사");
  }

  return tags;
}
