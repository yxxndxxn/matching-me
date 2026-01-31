// 회원 탈퇴: 현재 사용자 검증 후 Auth Admin으로 삭제 (DB CASCADE로 연관 데이터 정리)

import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { NextResponse } from "next/server";

export async function POST() {
  try {
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const admin = createAdminClient();
    const { error } = await admin.auth.admin.deleteUser(user.id);

    if (error) {
      return NextResponse.json(
        { error: error.message || "탈퇴 처리에 실패했습니다." },
        { status: 500 }
      );
    }

    return NextResponse.json({ ok: true });
  } catch (e) {
    if (
      e instanceof Error &&
      e.message.includes("SUPABASE_SERVICE_ROLE_KEY")
    ) {
      return NextResponse.json(
        { error: "서버 설정이 필요합니다. 관리자에게 문의해 주세요." },
        { status: 503 }
      );
    }
    return NextResponse.json(
      { error: "탈퇴 처리 중 오류가 발생했습니다." },
      { status: 500 }
    );
  }
}
