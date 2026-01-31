/**
 * 프로필 관련 타입 (DB profiles 테이블 기준)
 * UI/API에서는 camelCase로 매핑하여 사용
 */

import type { ProfileRow, ProfileInsert, ProfileUpdate } from "./database";

export type Profile = ProfileRow;
export type { ProfileInsert, ProfileUpdate };

/** DB 행 → UI용 camelCase 프로필 (id는 사용자 UUID) */
export interface ProfileUI {
  id: string;
  name: string;
  gender: Profile["gender"];
  majorCategory: Profile["major_category"];
  grade: Profile["grade"];
  dormitory: Profile["dormitory"];
  otherContact: string;
  kakaoId: string;
  chronotype: NonNullable<Profile["chronotype"]>;
  sleepingHabit: Profile["sleeping_habit"];
  smoking: boolean;
  cleanliness: number;
  noiseSensitivity: number;
  introduction: string;
  avatarUrl?: string | null;
  createdAt: string;
  updatedAt: string;
}

export function profileRowToUI(row: ProfileRow): ProfileUI {
  return {
    id: row.id,
    name: row.name,
    gender: row.gender,
    majorCategory: row.major_category,
    grade: row.grade,
    dormitory: row.dormitory,
    otherContact: row.other_contact ?? "",
    kakaoId: row.kakao_id ?? "",
    chronotype: row.chronotype ?? "morning",
    sleepingHabit: row.sleeping_habit,
    smoking: row.smoking,
    cleanliness: row.cleanliness ?? 3,
    noiseSensitivity: row.noise_sensitivity ?? 3,
    introduction: row.introduction ?? "",
    avatarUrl: row.avatar_url,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
}
