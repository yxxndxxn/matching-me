/**
 * Supabase 데이터베이스 타입 정의
 * docs/database/supabase-schema.sql 및 docs/database/db-schema.md와 동기화
 */

export type GenderType = "male" | "female";
export type MajorCategoryType =
  | "engineering"
  | "humanities"
  | "social"
  | "natural"
  | "arts"
  | "education";
export type DormitoryType = "dongjak" | "eunpyeong";
export type ChronotypeType = "morning" | "night";
export type SleepingHabitType = "none" | "grinding" | "snoring";

export type Grade = "1학년" | "2학년" | "3학년" | "4학년";

export interface Database {
  public: {
    Tables: {
      profiles: {
        Row: ProfileRow;
        Insert: ProfileInsert;
        Update: ProfileUpdate;
      };
      matching_posts: {
        Row: MatchingPostRow;
        Insert: MatchingPostInsert;
        Update: MatchingPostUpdate;
      };
      view_logs: {
        Row: ViewLogRow;
        Insert: ViewLogInsert;
        Update: ViewLogUpdate;
      };
      bookmarks: {
        Row: BookmarkRow;
        Insert: BookmarkInsert;
        Update: BookmarkUpdate;
      };
      daily_limits: {
        Row: DailyLimitRow;
        Insert: DailyLimitInsert;
        Update: DailyLimitUpdate;
      };
    };
    Enums: {
      gender_type: GenderType;
      major_category_type: MajorCategoryType;
      dormitory_type: DormitoryType;
      chronotype_type: ChronotypeType;
      sleeping_habit_type: SleepingHabitType;
    };
  };
}

// --- profiles (snake_case = DB 컬럼) ---
export interface ProfileRow {
  id: string;
  name: string;
  gender: GenderType;
  major_category: MajorCategoryType;
  grade: Grade;
  dormitory: DormitoryType;
  other_contact: string | null;
  kakao_id: string | null;
  chronotype: ChronotypeType | null;
  sleeping_habit: SleepingHabitType;
  smoking: boolean;
  cleanliness: number | null;
  noise_sensitivity: number | null;
  introduction: string | null;
  avatar_url: string | null;
  created_at: string;
  updated_at: string;
}

export type ProfileInsert = Omit<ProfileRow, "created_at" | "updated_at"> & {
  created_at?: string;
  updated_at?: string;
};

export type ProfileUpdate = Partial<Omit<ProfileRow, "id" | "created_at">> & {
  updated_at?: string;
};

// --- matching_posts ---
export interface MatchingPostRow {
  id: string;
  user_id: string;
  dormitory: DormitoryType;
  ai_summary: string | null;
  match_score: number | null;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export type MatchingPostInsert = Omit<MatchingPostRow, "id" | "created_at" | "updated_at"> & {
  id?: string;
  created_at?: string;
  updated_at?: string;
};

export type MatchingPostUpdate = Partial<
  Omit<MatchingPostRow, "id" | "user_id" | "created_at">
> & {
  updated_at?: string;
};

// --- view_logs ---
export interface ViewLogRow {
  id: string;
  viewer_id: string;
  viewed_post_id: string;
  contact_revealed: boolean;
  viewed_at: string;
}

export type ViewLogInsert = Omit<ViewLogRow, "id" | "viewed_at"> & {
  id?: string;
  viewed_at?: string;
};

export type ViewLogUpdate = Partial<Omit<ViewLogRow, "id">>;

// --- bookmarks ---
export interface BookmarkRow {
  id: string;
  user_id: string;
  post_id: string;
  created_at: string;
}

export type BookmarkInsert = Omit<BookmarkRow, "id" | "created_at"> & {
  id?: string;
  created_at?: string;
};

export type BookmarkUpdate = Partial<Omit<BookmarkRow, "id" | "user_id" | "post_id" | "created_at">>;

// --- daily_limits ---
export interface DailyLimitRow {
  id: string;
  user_id: string;
  limit_date: string;
  reveals_used: number;
  updated_at: string;
}

export type DailyLimitInsert = Omit<DailyLimitRow, "id" | "updated_at"> & {
  id?: string;
  updated_at?: string;
};

export type DailyLimitUpdate = Partial<
  Omit<DailyLimitRow, "id" | "user_id" | "limit_date">
> & {
  updated_at?: string;
};
