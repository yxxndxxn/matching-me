// 이미 연락처를 공개한 글 ID 목록 (view_logs 기반) — 버튼 숨김·이미 공개 상태 표시용

import { createClient } from "@/lib/supabase/server";
import { getRevealedPostIds } from "@/lib/supabase/queries/view-logs";
import { NextResponse } from "next/server";

export async function GET() {
  try {
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    const { postIds, error } = await getRevealedPostIds(supabase, user.id);
    if (error) {
      return NextResponse.json(
        { error: "조회에 실패했습니다." },
        { status: 500 }
      );
    }
    return NextResponse.json({ postIds });
  } catch (e) {
    const msg = e instanceof Error ? e.message : String(e);
    if (msg.includes("Missing Supabase env") || msg.includes("NEXT_PUBLIC_SUPABASE")) {
      return NextResponse.json(
        { error: "서버 설정이 필요합니다." },
        { status: 503 }
      );
    }
    return NextResponse.json(
      { error: "목록 조회 중 오류가 발생했습니다." },
      { status: 500 }
    );
  }
}
