"use client";

// 연락처 공개 (Phase 2.14): API 호출 → view_logs + daily_limits 갱신 → 남은 횟수 refetch, 응답에 연락처 포함

import { useCallback, useState } from "react";
import { useDailyLimitContext } from "@/components/providers/daily-limit-provider";

export interface RevealedContact {
  otherContact: string;
  kakaoId: string;
}

export function useContactReveal(): {
  reveal: (postId: string) => Promise<{ success: boolean; error?: string; contact?: RevealedContact }>;
  loading: boolean;
} {
  const [loading, setLoading] = useState(false);
  const { refetch: refetchDaily } = useDailyLimitContext();

  const reveal = useCallback(
    async (postId: string): Promise<{ success: boolean; error?: string; contact?: RevealedContact }> => {
      setLoading(true);
      try {
        const res = await fetch("/api/matching/reveal-contact", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ postId }),
        });
        const json = await res.json().catch(() => ({}));
        if (!res.ok) {
          return { success: false, error: json.error ?? "연락처 공개에 실패했습니다." };
        }
        await refetchDaily();
        const contact =
          json.other_contact != null || json.kakao_id != null
            ? { otherContact: json.other_contact ?? "", kakaoId: json.kakao_id ?? "" }
            : undefined;
        return { success: true, contact };
      } catch (e) {
        return {
          success: false,
          error: e instanceof Error ? e.message : "연락처 공개에 실패했습니다.",
        };
      } finally {
        setLoading(false);
      }
    },
    [refetchDaily]
  );

  return { reveal, loading };
}
