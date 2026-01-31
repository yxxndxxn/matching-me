/**
 * 매칭 게시글 및 피드 관련 타입
 */

import type {
  MatchingPostRow,
  MatchingPostInsert,
  MatchingPostUpdate,
  ProfileRow,
} from "./database";
import type { ProfileUI } from "./profile";

export type MatchingPost = MatchingPostRow;
export type { MatchingPostInsert, MatchingPostUpdate };

/**
 * 피드/카드용 아이템: matching_posts 1행 + profiles 1행 조인 결과
 * id = matching_posts.id (post id, 찜/연락처 공개 식별자)
 */
export interface FeedItem {
  /** 게시글 ID (찜·연락처 공개 시 사용) */
  id: string;
  /** 게시글 작성자(user) ID */
  userId: string;
  name: string;
  gender: ProfileRow["gender"];
  majorCategory: ProfileRow["major_category"];
  grade: ProfileRow["grade"];
  dormitory: ProfileRow["dormitory"];
  phone: string;
  kakaoId: string;
  chronotype: NonNullable<ProfileRow["chronotype"]>;
  sleepingHabit: ProfileRow["sleeping_habit"];
  smoking: boolean;
  cleanliness: number;
  noiseSensitivity: number;
  introduction: string;
  avatarUrl?: string | null;
  /** AI 매칭 요약 (선택) */
  aiSummary?: string | null;
  /** 매칭 점수 0–100 (AI 추천 탭 필터용) */
  matchScore?: number | null;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

/** DB 조인 결과(post + profile) → FeedItem */
export function rowToFeedItem(
  post: MatchingPostRow,
  profile: ProfileRow
): FeedItem {
  return {
    id: post.id,
    userId: post.user_id,
    name: profile.name,
    gender: profile.gender,
    majorCategory: profile.major_category,
    grade: profile.grade,
    dormitory: post.dormitory,
    phone: profile.phone ?? "",
    kakaoId: profile.kakao_id ?? "",
    chronotype: profile.chronotype ?? "morning",
    sleepingHabit: profile.sleeping_habit,
    smoking: profile.smoking,
    cleanliness: profile.cleanliness ?? 3,
    noiseSensitivity: profile.noise_sensitivity ?? 3,
    introduction: profile.introduction ?? "",
    avatarUrl: profile.avatar_url,
    aiSummary: post.ai_summary,
    matchScore: post.match_score,
    isActive: post.is_active,
    createdAt: post.created_at,
    updatedAt: post.updated_at,
  };
}

/** 필터 조건 (UI FilterBar와 동일) */
export interface MatchingFilter {
  dormitory: string;
  gender: string;
  majorCategory: string;
  grade: string;
  smoking: string;
}
