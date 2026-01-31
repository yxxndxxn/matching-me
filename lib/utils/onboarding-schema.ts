// Phase 3.5: 온보딩 폼 유효성 검사 (Zod) - db-schema ENUM/CHECK와 동일 규칙

import { z } from "zod";

const gradeValues = ["1학년", "2학년", "3학년", "4학년"] as const;
const dormitoryValues = ["dongjak", "eunpyeong"] as const;
const sleepingHabitValues = ["none", "grinding", "snoring"] as const;
const majorCategoryValues = [
  "engineering",
  "humanities",
  "social",
  "natural",
  "arts",
  "education",
] as const;

export const onboardingFormSchema = z.object({
  name: z.string().min(1, "이름을 입력해 주세요.").max(50, "이름은 50자 이하여야 해요."),
  gender: z.enum(["male", "female"], { required_error: "성별을 선택해 주세요." }),
  major_category: z.enum(majorCategoryValues, { required_error: "계열을 선택해 주세요." }),
  grade: z.enum(gradeValues, { required_error: "학년을 선택해 주세요." }),
  dormitory: z.enum(dormitoryValues, { required_error: "학숙구분을 선택해 주세요." }),
  other_contact: z.string().max(200),
  kakao_id: z.string().min(1, "카카오톡 ID를 입력해 주세요.").max(50),
  chronotype: z.enum(["morning", "night"], { required_error: "생활 패턴을 선택해 주세요." }),
  sleeping_habit: z.enum(sleepingHabitValues, { required_error: "잠버릇을 선택해 주세요." }),
  smoking: z.boolean(),
  cleanliness: z.number().min(1, "1~5 사이로 선택해 주세요.").max(5),
  noise_sensitivity: z.number().min(1, "1~5 사이로 선택해 주세요.").max(5),
  introduction: z.string().min(1, "자기소개를 입력해 주세요.").max(500),
});

export type OnboardingFormSchemaType = z.infer<typeof onboardingFormSchema>;
