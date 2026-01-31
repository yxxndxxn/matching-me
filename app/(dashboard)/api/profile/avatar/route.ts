// 프로필 사진 업로드: multipart/form-data → Supabase Storage avatars → public URL 반환

import { createClient } from "@/lib/supabase/server";
import { NextResponse } from "next/server";

const ALLOWED_TYPES = ["image/jpeg", "image/png", "image/webp"];
const MAX_SIZE_BYTES = 2 * 1024 * 1024; // 2MB

export async function POST(request: Request) {
  try {
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const formData = await request.formData();
    const file = formData.get("file") as File | null;
    if (!file) {
      return NextResponse.json({ error: "파일이 없습니다." }, { status: 400 });
    }

    if (!ALLOWED_TYPES.includes(file.type)) {
      return NextResponse.json(
        { error: "JPEG, PNG, WebP 형식만 업로드할 수 있어요." },
        { status: 400 }
      );
    }
    if (file.size > MAX_SIZE_BYTES) {
      return NextResponse.json(
        { error: "파일 크기는 2MB 이하여야 해요." },
        { status: 400 }
      );
    }

    const ext = file.type === "image/webp" ? "webp" : file.type === "image/png" ? "png" : "jpg";
    const path = `${user.id}/avatar.${ext}`;

    const buffer = await file.arrayBuffer();
    const { error } = await supabase.storage
      .from("avatars")
      .upload(path, buffer, { contentType: file.type, upsert: true });

    if (error) {
      if (error.message?.toLowerCase().includes("bucket") || error.message?.toLowerCase().includes("not found")) {
        return NextResponse.json(
          {
            error: "이미지 저장소가 설정되지 않았어요. Supabase 대시보드에서 'avatars' 버킷을 생성해 주세요.",
          },
          { status: 503 }
        );
      }
      return NextResponse.json({ error: error.message }, { status: 400 });
    }

    const {
      data: { publicUrl },
    } = supabase.storage.from("avatars").getPublicUrl(path);
    return NextResponse.json({ avatar_url: publicUrl });
  } catch (e) {
    const msg = e instanceof Error ? e.message : String(e);
    if (msg.includes("Missing Supabase env")) {
      return NextResponse.json({ error: "서버 설정이 필요합니다." }, { status: 503 });
    }
    return NextResponse.json({ error: "업로드 중 오류가 발생했어요." }, { status: 500 });
  }
}
