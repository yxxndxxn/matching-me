// 프로필 API (Phase 2.15): GET/POST/PUT, 세션 검증 후 profiles CRUD

import { createClient } from "@/lib/supabase/server";
import { getProfile, createProfile, updateProfile } from "@/lib/supabase/queries/profiles";
import type { ProfileInsert, ProfileUpdate } from "@/types/database";
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
    const row = await getProfile(supabase, user.id);
    if (!row) {
      return NextResponse.json(null, { status: 200 });
    }
    return NextResponse.json(row);
  } catch (e) {
    const msg = e instanceof Error ? e.message : String(e);
    if (msg.includes("Missing Supabase env") || msg.includes("NEXT_PUBLIC_SUPABASE")) {
      return NextResponse.json(
        { error: "서버 설정이 필요합니다. 관리자에게 문의해 주세요." },
        { status: 503 }
      );
    }
    return NextResponse.json(
      { error: "프로필을 불러오는 중 오류가 발생했습니다." },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  try {
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    let body: Record<string, unknown>;
    try {
      body = (await request.json()) as Record<string, unknown>;
    } catch {
      return NextResponse.json({ error: "Invalid JSON body" }, { status: 400 });
    }
    if (!body || typeof body.name !== "string" || !body.name.trim()) {
      return NextResponse.json({ error: "name is required" }, { status: 400 });
    }
    const data: ProfileInsert = {
      id: user.id,
      name: body.name as string,
      gender: body.gender as ProfileInsert["gender"],
      major_category: body.major_category as ProfileInsert["major_category"],
      grade: body.grade as ProfileInsert["grade"],
      dormitory: body.dormitory as ProfileInsert["dormitory"],
      other_contact: (body.other_contact as string) ?? null,
      kakao_id: (body.kakao_id as string) ?? null,
      chronotype: (body.chronotype as ProfileInsert["chronotype"]) ?? null,
      sleeping_habit: (body.sleeping_habit as ProfileInsert["sleeping_habit"]) ?? "none",
      smoking: (body.smoking as boolean) ?? false,
      cleanliness: (body.cleanliness as number) ?? null,
      noise_sensitivity: (body.noise_sensitivity as number) ?? null,
      introduction: (body.introduction as string) ?? null,
      avatar_url: (body.avatar_url as string) ?? null,
    };
    const { error } = await createProfile(supabase, data);
    if (error) {
      return NextResponse.json({ error: error.message }, { status: 400 });
    }
    return NextResponse.json({ ok: true });
  } catch (e) {
    const msg = e instanceof Error ? e.message : String(e);
    if (msg.includes("Missing Supabase env") || msg.includes("NEXT_PUBLIC_SUPABASE")) {
      return NextResponse.json(
        { error: "서버 설정이 필요합니다. 관리자에게 문의해 주세요." },
        { status: 503 }
      );
    }
    return NextResponse.json(
      { error: "프로필 저장 중 오류가 발생했습니다." },
      { status: 500 }
    );
  }
}

export async function PUT(request: Request) {
  try {
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    let body: Record<string, unknown>;
    try {
      body = (await request.json()) as Record<string, unknown>;
    } catch {
      return NextResponse.json({ error: "Invalid JSON body" }, { status: 400 });
    }
    const data: ProfileUpdate = {};
    if (body.name != null) data.name = body.name as string;
    if (body.gender != null) data.gender = body.gender as ProfileUpdate["gender"];
    if (body.major_category != null) data.major_category = body.major_category as ProfileUpdate["major_category"];
    if (body.grade != null) data.grade = body.grade as ProfileUpdate["grade"];
    if (body.dormitory != null) data.dormitory = body.dormitory as ProfileUpdate["dormitory"];
    if (body.other_contact != null) data.other_contact = body.other_contact as string | null;
    if (body.contact != null) data.contact = body.contact as string | null;
    if (body.chronotype != null) data.chronotype = body.chronotype as ProfileUpdate["chronotype"];
    if (body.sleeping_habit != null) data.sleeping_habit = body.sleeping_habit as ProfileUpdate["sleeping_habit"];
    if (body.smoking != null) data.smoking = body.smoking as boolean;
    if (body.cleanliness != null) data.cleanliness = body.cleanliness as number | null;
    if (body.noise_sensitivity != null) data.noise_sensitivity = body.noise_sensitivity as number | null;
    if (body.introduction != null) data.introduction = body.introduction as string | null;
    if (body.avatar_url != null) data.avatar_url = body.avatar_url as string | null;
    const { error } = await updateProfile(supabase, user.id, data);
    if (error) {
      return NextResponse.json({ error: error.message }, { status: 400 });
    }
    return NextResponse.json({ ok: true });
  } catch (e) {
    const msg = e instanceof Error ? e.message : String(e);
    if (msg.includes("Missing Supabase env") || msg.includes("NEXT_PUBLIC_SUPABASE")) {
      return NextResponse.json(
        { error: "서버 설정이 필요합니다. 관리자에게 문의해 주세요." },
        { status: 503 }
      );
    }
    return NextResponse.json(
      { error: "프로필 저장 중 오류가 발생했습니다." },
      { status: 500 }
    );
  }
}
