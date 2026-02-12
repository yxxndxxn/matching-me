"use client";

// 대시보드 진입 시, 온보딩 직후 ai_summary가 비어 있는 경우 백그라운드로 채움 (한 번만 호출)

import { useEffect, useRef } from "react";

const API = "/api/onboarding/backfill-ai-summary";

export function BackfillAiSummaryTrigger() {
  const fired = useRef(false);

  useEffect(() => {
    if (fired.current) return;
    fired.current = true;
    fetch(API, { method: "GET", credentials: "include" }).catch(() => {});
  }, []);

  return null;
}
