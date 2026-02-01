// 연락처 공개 (Phase 2.14): view_logs INSERT + daily_limits UPSERT(reveals_used +1, 상한 3)

import { createClient } from "@/lib/supabase/server";
import {
  createViewLog,
  getRemainingReveals,
  getRevealedPostIds,
  hasRevealedContact,
  incrementRevealsUsed,
} from "@/lib/supabase/queries/view-logs";
import { getMatchingPostById } from "@/lib/supabase/queries/matching-posts";
import { getProfile } from "@/lib/supabase/queries/profiles";
import { NextResponse } from "next/server";

function isRlsError(error: { message?: string; code?: string } | null): boolean {
  if (!error) return false;
  const msg = (error.message ?? "").toLowerCase();
  const code = error.code ?? "";
  return msg.includes("row-level security") || msg.includes("policy") || code === "42501";
}

export async function POST(request: Request) {
  try {
    const supabase = await createClient();
    const { data, error: authError } = await supabase.auth.getUser();
    const user = data?.user;
    if (authError || !user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    let body: { postId?: string };
    try {
      body = (await request.json()) as { postId?: string };
    } catch {
      return NextResponse.json({ error: "Invalid JSON body" }, { status: 400 });
    }
    const postId = body?.postId;
    if (!postId || typeof postId !== "string" || !postId.trim()) {
      return NextResponse.json({ error: "postId required" }, { status: 400 });
    }

    const alreadyRevealed = await hasRevealedContact(supabase, user.id, postId);
    if (!alreadyRevealed) {
      const { remaining } = await getRemainingReveals(supabase, user.id);
      if (remaining <= 0) {
        return NextResponse.json(
          { error: "오늘의 조회 한도를 초과했습니다." },
          { status: 400 }
        );
      }
      const { error: logError } = await createViewLog(
        supabase,
        user.id,
        postId,
        true
      );
      if (logError) {
        const message = isRlsError(logError)
          ? "데이터베이스 권한 설정이 필요합니다. docs/database/migrations/20260201_170000_view_logs_rls_insert_v1.sql 마이그레이션을 Supabase에 적용해 주세요."
          : logError.message;
        return NextResponse.json({ error: message }, { status: 500 });
      }
      const { error: limitError } = await incrementRevealsUsed(supabase, user.id);
      if (limitError) {
        const message = isRlsError(limitError)
          ? "데이터베이스 권한 설정이 필요합니다. docs/database/migrations/20260201_170000_view_logs_rls_insert_v1.sql 마이그레이션을 Supabase에 적용해 주세요."
          : limitError.message;
        return NextResponse.json({ error: message }, { status: 500 });
      }
    }

    const { data: post } = await getMatchingPostById(supabase, postId);
    if (post?.user_id) {
      const profile = await getProfile(supabase, post.user_id);
      if (profile) {
        return NextResponse.json({
          ok: true,
          other_contact: profile.other_contact ?? undefined,
          contact: profile.contact ?? undefined,
        });
      }
    }
    return NextResponse.json({ ok: true });
  } catch (e) {
    const msg = e instanceof Error ? e.message : String(e);
    console.error("[api/matching/reveal-contact]", e);
    if (msg.includes("Missing Supabase env") || msg.includes("NEXT_PUBLIC_SUPABASE")) {
      return NextResponse.json(
        { error: "서버 설정이 필요합니다. 관리자에게 문의해 주세요." },
        { status: 503 }
      );
    }
    const body: { error: string; detail?: string } = {
      error: "연락처 공개 처리 중 오류가 발생했습니다.",
    };
    if (process.env.NODE_ENV === "development") {
      body.detail = msg;
    }
    return NextResponse.json(body, { status: 500 });
  }
}
