/**
 * AI 매칭 요약 생성 - Gemini 3 Flash 사용
 * - 온보딩: 유저 자기소개/강점 요약
 * - 상세 페이지: 두 사람 쌍별 시너지 요약 (DB 캐싱)
 */

import { GoogleGenAI } from "@google/genai";

/** 라이프스타일 패턴 데이터 (profiles 테이블 컬럼 기반) */
export interface LifePatternInput {
  chronotype: "morning" | "night" | null;
  sleeping_habit: "none" | "grinding" | "snoring" | null;
  smoking: boolean;
  cleanliness: number | null;
  noise_sensitivity: number | null;
  introduction: string | null;
}

const CHRONOTYPE_LABELS = {
  morning: "아침형",
  night: "밤형",
} as const;

const SLEEPING_HABIT_LABELS = {
  none: "없음",
  grinding: "이갈이",
  snoring: "코골이",
} as const;

/**
 * 유저 라이프스타일 데이터를 읽기 쉬운 문자열로 변환
 */
function formatLifePatternForPrompt(data: LifePatternInput): string {
  const parts: string[] = [];

  if (data.chronotype) {
    parts.push(`생활패턴: ${CHRONOTYPE_LABELS[data.chronotype]}`);
  }
  if (data.sleeping_habit) {
    parts.push(`잠버릇: ${SLEEPING_HABIT_LABELS[data.sleeping_habit]}`);
  }
  parts.push(`흡연: ${data.smoking ? "흡연" : "비흡연"}`);
  if (data.cleanliness != null) {
    parts.push(`청결도: ${data.cleanliness}/5`);
  }
  if (data.noise_sensitivity != null) {
    parts.push(`소음민감도: ${data.noise_sensitivity}/5`);
  }
  if (data.introduction?.trim()) {
    parts.push(`자기소개: ${data.introduction.trim()}`);
  }

  return parts.join(", ");
}

/**
 * 온보딩 저장 시 유저의 라이프스타일 데이터로 AI 자기소개 요약 생성
 * (비교 대상 없음 → 유저 강점을 드러내는 50자 내외 요약)
 */
export async function generateAiSummaryForProfile(
  lifePattern: LifePatternInput
): Promise<string | null> {
  const apiKey =
    process.env.GOOGLE_GEMINI_API_KEY ??
    process.env.GOOGLE_GENERATIVE_AI_API_KEY;

  if (!apiKey) {
    console.warn("[AI] GOOGLE_GEMINI_API_KEY 또는 GOOGLE_GENERATIVE_AI_API_KEY 미설정");
    return null;
  }

  try {
    const ai = new GoogleGenAI({ apiKey });
    const formatted = formatLifePatternForPrompt(lifePattern);

    const systemPrompt = `너는 룸메이트 매칭 전문가야. 아래 한 명의 라이프스타일 데이터를 분석해서, 이 사람이 룸메이트로서 가진 강점이나 어필 포인트를 딱 한 문장(50자 내외)으로 요약해줘. 긍정적이고 매칭에 도움이 되는 문구로 작성해.`;
    const userPrompt = `[라이프스타일 데이터]\n${formatted}`;

    const response = await ai.models.generateContent({
      model: "gemini-3-flash-preview",
      contents: `${systemPrompt}\n\n${userPrompt}`,
      config: {
        maxOutputTokens: 200,
        temperature: 0.5,
      },
    });

    const text = response.text?.trim();
    return text && text.length > 0 ? text.slice(0, 200) : null;
  } catch (err) {
    console.error("[AI] generateAiSummaryForProfile 실패:", err);
    return null;
  }
}

/** 쌍별 AI 요약용 - 생활패턴, 잠버릇, 청결도, 소음민감도, 흡연만 포맷 */
function formatPairLifePattern(data: LifePatternInput): string {
  const parts: string[] = [];
  if (data.chronotype) parts.push(`생활패턴: ${CHRONOTYPE_LABELS[data.chronotype]}`);
  if (data.sleeping_habit) parts.push(`잠버릇: ${SLEEPING_HABIT_LABELS[data.sleeping_habit]}`);
  parts.push(`흡연: ${data.smoking ? "흡연" : "비흡연"}`);
  if (data.cleanliness != null) parts.push(`청결도: ${data.cleanliness}/5`);
  if (data.noise_sensitivity != null) parts.push(`소음민감도: ${data.noise_sensitivity}/5`);
  return parts.join(", ");
}

/**
 * 두 사람의 라이프스타일을 비교하여 시너지 요약 생성 (상세 페이지용)
 * 프롬프트: "OO님과 OO님은 ~점에서 찰떡궁합이에요!" 형식
 */
export async function generatePairAiSummary(
  viewerLifePattern: LifePatternInput,
  targetLifePattern: LifePatternInput,
  viewerName: string,
  targetName: string
): Promise<string | null> {
  const apiKey =
    process.env.GOOGLE_GEMINI_API_KEY ??
    process.env.GOOGLE_GENERATIVE_AI_API_KEY;

  if (!apiKey) {
    console.warn("[AI] GOOGLE_GEMINI_API_KEY 또는 GOOGLE_GENERATIVE_AI_API_KEY 미설정");
    return null;
  }

  try {
    const ai = new GoogleGenAI({ apiKey });
    const viewerFormatted = formatPairLifePattern(viewerLifePattern);
    const targetFormatted = formatPairLifePattern(targetLifePattern);

    const systemPrompt = `너는 기숙사 생활 전문가야. 두 사용자의 [생활패턴, 잠버릇, 청결도, 소음민감도, 흡연] 데이터를 비교해서, 둘이 룸메이트로서 잘 맞을 수밖에 없는 이유를 '(이유)점에서 찰떡궁합이에요!' 형식으로 딱 한 문장만 완성해서 출력해줘. 이름은 넣지 말고, 이유만 넣어줘. 예: '비흡연에 청결도·소음민감도가 비슷한 점에서 찰떡궁합이에요!' 다른 설명 없이 문장 하나만 출력해.`;
    const userPrompt = `[사람 A - ${viewerName}]\n${viewerFormatted}\n\n[사람 B - ${targetName}]\n${targetFormatted}`;

    const models = ["gemini-2.5-flash", "gemini-2.0-flash", "gemini-3-flash-preview"];
    for (const model of models) {
      try {
        const response = await ai.models.generateContent({
          model,
          contents: `${systemPrompt}\n\n${userPrompt}`,
          config: {
            maxOutputTokens: 256,
            temperature: 0.3,
          },
        });
        const rawText = response.text?.trim() ?? "";
        const text = rawText.replace(/^["']|["']$/g, "").trim();
        // 불완전한 출력 필터: '찰떡궁합이에요!' 포함 + 최소 20자
        if (text.length >= 20 && text.includes("찰떡궁합이에요")) {
          return text.length > 150 ? text.slice(0, 150) : text;
        }
      } catch (modelErr) {
        if (model === models[models.length - 1]) throw modelErr;
        console.warn(`[AI] ${model} 실패, 다음 모델 시도:`, modelErr);
      }
    }
    return null;
  } catch (err) {
    console.error("[AI] generatePairAiSummary 실패:", err);
    return null;
  }
}
