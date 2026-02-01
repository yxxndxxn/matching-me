/**
 * 쌍별 AI 매칭 요약 - 상세 페이지 진입 시 호출
 * DB 캐시 우선, 없으면 Gemini API 호출 후 저장
 */

import { createClient } from "@/lib/supabase/server";
import { getProfile } from "@/lib/supabase/queries/profiles";
import { getMatchingPostById } from "@/lib/supabase/queries/matching-posts";
import { getPairSummary, upsertPairSummary } from "@/lib/supabase/queries/pair-ai-summaries";
import { generatePairAiSummary } from "@/lib/ai/matching-summary";
import { calculateMatchScore } from "@/lib/matching/calculate-match-score";
import { NextResponse } from "next/server";

/** LifePatternInput으로 변환 */
function toLifePattern(profile: {
  chronotype: "morning" | "night" | null;
  sleeping_habit: "none" | "grinding" | "snoring" | null;
  smoking: boolean;
  cleanliness: number | null;
  noise_sensitivity: number | null;
  introduction: string | null;
}) {
  return {
    chronotype: profile.chronotype,
    sleeping_habit: profile.sleeping_habit,
    smoking: profile.smoking,
    cleanliness: profile.cleanliness,
    noise_sensitivity: profile.noise_sensitivity,
    introduction: profile.introduction,
  };
}

export async function POST(request: Request) {
  try {
    const supabase = await createClient();
    const { data, error: authError } = await supabase.auth.getUser();
    const user = data?.user;
    if (authError || !user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    let body: { targetPostId?: string };
    try {
      body = (await request.json()) as { targetPostId?: string };
    } catch {
      return NextResponse.json({ error: "Invalid JSON body" }, { status: 400 });
    }
    const targetPostId = body?.targetPostId?.trim();
    if (!targetPostId) {
      return NextResponse.json({ error: "targetPostId required" }, { status: 400 });
    }

    // 1. 캐시 조회
    const { data: cached } = await getPairSummary(supabase, user.id, targetPostId);
    if (cached?.ai_summary) {
      return NextResponse.json({ aiSummary: cached.ai_summary });
    }

    // 2. viewer, target 프로필 조회
    const [viewerProfile, postResult] = await Promise.all([
      getProfile(supabase, user.id),
      getMatchingPostById(supabase, targetPostId),
    ]);
    if (!viewerProfile || !postResult.data?.user_id) {
      return NextResponse.json({ aiSummary: null });
    }
    const targetProfile = await getProfile(supabase, postResult.data.user_id);
    if (!targetProfile) {
      return NextResponse.json({ aiSummary: null });
    }

    // 3. 점수 75점 이상에만 API 호출 (비용 절감)
    const matchScore = calculateMatchScore(viewerProfile, targetProfile);
    if (matchScore != null && matchScore < 75) {
      return NextResponse.json({ aiSummary: null });
    }

    // 4. Gemini API 호출
    const aiSummary = await generatePairAiSummary(
      toLifePattern(viewerProfile),
      toLifePattern(targetProfile),
      viewerProfile.name,
      targetProfile.name
    );

    // 5. 캐시 저장
    if (aiSummary) {
      await upsertPairSummary(supabase, user.id, targetPostId, aiSummary);
    }

    return NextResponse.json({ aiSummary });
  } catch (e) {
    const msg = e instanceof Error ? e.message : String(e);
    console.error("[api/matching/pair-summary]", e);
    return NextResponse.json(
      { error: msg.includes("Missing") ? "서버 설정이 필요합니다." : "AI 요약 생성 중 오류가 발생했습니다." },
      { status: 500 }
    );
  }
}
