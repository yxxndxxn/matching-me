// Unified User Profile Type for Matching Me App

// Major Category options
export const majorCategories = [
  { value: "engineering", label: "공학" },
  { value: "humanities", label: "인문" },
  { value: "social", label: "사회" },
  { value: "natural", label: "자연" },
  { value: "arts", label: "예체능" },
  { value: "education", label: "교육" },
] as const

export type MajorCategory = typeof majorCategories[number]["value"]

// Dormitory options (학숙구분)
export const dormitories = [
  { value: "dongjak", label: "동작관" },
  { value: "eunpyeong", label: "은평관" },
] as const

export type Dormitory = typeof dormitories[number]["value"]

// Sleeping habit options (잠버릇)
export const sleepingHabits = [
  { value: "none", label: "없음" },
  { value: "grinding", label: "이갈이" },
  { value: "snoring", label: "코골이" },
] as const

export type SleepingHabit = typeof sleepingHabits[number]["value"]

export interface UserProfile {
  id: number
  // 기본 정보
  name: string                    // 성명
  gender: "male" | "female"       // 성별
  majorCategory: MajorCategory    // 계열 (Major Category)
  grade: string                   // 학년 (e.g., "1학년", "2학년", "3학년", "4학년")
  dormitory: Dormitory            // 학숙구분 (동작관/은평관)
  
  // 연락처
  phone: string                   // 전화번호 (하이픈 포함, e.g., "010-1234-5678")
  kakaoId: string                 // 카카오톡 ID
  
  // 라이프스타일 태그
  chronotype: "morning" | "night" // 아침형/밤형
  sleepingHabit: SleepingHabit    // 잠버릇 (없음/이갈이/코골이)
  smoking: boolean                // 흡연/비흡연
  
  // 수치형 지표
  cleanliness: number             // 청결도 (1-5)
  noiseSensitivity: number        // 소음 민감도 (1-5)
  
  // 기타
  introduction: string            // 자기소개
  
  // 앱 내부용
  avatarUrl?: string              // 프로필 이미지 URL
  matchScore?: number             // 매칭 점수 (다른 사용자에게 표시될 때)
}

// Get Major Category label from value
export function getMajorCategoryLabel(category: MajorCategory): string {
  const found = majorCategories.find((c) => c.value === category)
  return found?.label || category
}

// Get Dormitory label from value
export function getDormitoryLabel(dormitory: Dormitory): string {
  const found = dormitories.find((d) => d.value === dormitory)
  return found?.label || dormitory
}

// Get Sleeping Habit label from value
export function getSleepingHabitLabel(habit: SleepingHabit): string {
  const found = sleepingHabits.find((h) => h.value === habit)
  return found?.label || habit
}

// 라이프스타일 태그 헬퍼 함수
export function getLifestyleTags(profile: UserProfile): string[] {
  const tags: string[] = []
  
  // 아침형/밤형
  tags.push(profile.chronotype === "morning" ? "아침형" : "밤형")
  
  // 잠버릇
  const sleepingHabitLabel = getSleepingHabitLabel(profile.sleepingHabit)
  if (profile.sleepingHabit !== "none") {
    tags.push(sleepingHabitLabel)
  }
  
  // 흡연/비흡연
  tags.push(profile.smoking ? "흡연" : "비흡연")
  
  return tags
}

// 샘플 데이터
export const sampleProfiles: UserProfile[] = [
  {
    id: 1,
    name: "김서연",
    gender: "female",
    majorCategory: "engineering",
    grade: "2학년",
    dormitory: "dongjak",
    phone: "010-1234-5678",
    kakaoId: "seoyeon_kim",
    chronotype: "morning",
    sleepingHabit: "none",
    smoking: false,
    cleanliness: 4,
    noiseSensitivity: 4,
    introduction: "안녕하세요! 컴퓨터공학을 전공하고 있는 2학년 김서연입니다. 조용한 환경을 좋아하고, 아침에 일찍 일어나는 편이에요. 정리정돈을 잘 하는 룸메이트를 찾고 있습니다!",
    avatarUrl: "",
    matchScore: 95,
  },
  {
    id: 2,
    name: "박민준",
    gender: "male",
    majorCategory: "social",
    grade: "3학년",
    dormitory: "dongjak",
    phone: "010-2345-6789",
    kakaoId: "minjun_park",
    chronotype: "night",
    sleepingHabit: "snoring",
    smoking: false,
    cleanliness: 3,
    noiseSensitivity: 2,
    introduction: "경영학과 3학년 박민준입니다. 밤에 공부하는 걸 좋아하고, 주말에는 친구들과 어울리는 걸 즐겨요. 서로 존중하며 지낼 수 있는 룸메이트를 찾습니다.",
    avatarUrl: "",
    matchScore: 88,
  },
  {
    id: 3,
    name: "이지은",
    gender: "female",
    majorCategory: "humanities",
    grade: "1학년",
    dormitory: "eunpyeong",
    phone: "010-3456-7890",
    kakaoId: "jieun_lee",
    chronotype: "morning",
    sleepingHabit: "none",
    smoking: false,
    cleanliness: 5,
    noiseSensitivity: 3,
    introduction: "새내기 심리학과 이지은이에요! 아침형 인간이고, 깔끔한 환경을 좋아해요. 같이 운동하거나 맛집 탐방할 룸메이트 구해요!",
    avatarUrl: "",
    matchScore: 82,
  },
  {
    id: 4,
    name: "최준호",
    gender: "male",
    majorCategory: "engineering",
    grade: "4학년",
    dormitory: "dongjak",
    phone: "010-4567-8901",
    kakaoId: "junho_choi",
    chronotype: "night",
    sleepingHabit: "grinding",
    smoking: false,
    cleanliness: 4,
    noiseSensitivity: 5,
    introduction: "전기공학과 4학년 최준호입니다. 조용히 각자 생활하는 스타일을 선호해요. 소음에 민감한 편이라 조용한 룸메이트를 찾고 있습니다.",
    avatarUrl: "",
    matchScore: 78,
  },
  {
    id: 5,
    name: "정하늘",
    gender: "female",
    majorCategory: "humanities",
    grade: "2학년",
    dormitory: "eunpyeong",
    phone: "010-5678-9012",
    kakaoId: "haneul_jung",
    chronotype: "morning",
    sleepingHabit: "none",
    smoking: false,
    cleanliness: 3,
    noiseSensitivity: 2,
    introduction: "영문과 2학년 정하늘입니다. 아침에 일어나서 운동하는 걸 좋아해요. 활발하고 밝은 성격이라 재미있게 지낼 룸메이트를 찾습니다!",
    avatarUrl: "",
    matchScore: 75,
  },
]

// 현재 사용자 프로필 (마이페이지용)
export const currentUserProfile: UserProfile = {
  id: 0,
  name: "홍길동",
  gender: "male",
  majorCategory: "engineering",
  grade: "3학년",
  dormitory: "dongjak",
  phone: "010-9876-5432",
  kakaoId: "gildong_hong",
  chronotype: "night",
  sleepingHabit: "none",
  smoking: false,
  cleanliness: 4,
  noiseSensitivity: 3,
  introduction: "안녕하세요! 컴퓨터공학과 3학년 홍길동입니다. 밤에 공부하는 걸 좋아하고, 조용한 환경을 선호해요. 서로 배려하며 지낼 수 있는 룸메이트를 찾고 있습니다.",
  avatarUrl: "",
}
