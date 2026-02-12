// 온보딩 직후 대시보드 진입 시, ai_summary가 비어 있는 matching_post에 대해 AI 요약을 백그라운드로 채움

import { createClient } from "@/lib/supabase/server";
import { getProfile } from "@/lib/supabase/queries/profiles";
import { generateAiSummaryForProfile } from "@/lib/ai/matching-summary";
import type { LifePatternInput } from "@/lib/ai/matching-summary";
import type { MatchingPostRow } from "@/types/database";
import { NextResponse } from "next/server";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) {
      return NextResponse.json({ ok: false }, { status: 401 });
    }

    const { data: post } = await supabase
      .from("matching_posts")
      .select("*")
      .eq("user_id", user.id)
      .is("ai_summary", null)
      .maybeSingle();

    if (!post) {
      return NextResponse.json({ ok: true, filled: false });
    }

    const profile = await getProfile(supabase, user.id);
    if (!profile) {
      return NextResponse.json({ ok: true, filled: false });
    }

    const lifePattern: LifePatternInput = {
      chronotype: profile.chronotype as "morning" | "night" | null,
      sleeping_habit: profile.sleeping_habit as "none" | "grinding" | "snoring",
      smoking: profile.smoking,
      cleanliness: profile.cleanliness,
      noise_sensitivity: profile.noise_sensitivity,
      introduction: profile.introduction,
    };

    const aiSummary = await generateAiSummaryForProfile(lifePattern);
    if (!aiSummary) {
      return NextResponse.json({ ok: true, filled: false });
    }

    const { error } = await supabase
      .from("matching_posts")
      .update({
        ai_summary: aiSummary,
        updated_at: new Date().toISOString(),
      })
      .eq("id", (post as MatchingPostRow).id);

    if (error) {
      console.error("[backfill-ai-summary] update failed:", error);
      return NextResponse.json({ ok: false }, { status: 500 });
    }

    return NextResponse.json({ ok: true, filled: true });
  } catch (e) {
    console.error("[backfill-ai-summary]", e);
    return NextResponse.json({ ok: false }, { status: 500 });
  }
}
