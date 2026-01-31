"use client";

// 이미 연락처를 공개한 글 ID 목록 (서버 view_logs 기반) — 버튼 숨김·이미 공개 상태 표시용

import { useCallback, useEffect, useState } from "react";
import { useAuth } from "./use-auth";

export function useRevealedIds(): {
  revealedIds: Set<string>;
  addRevealedId: (postId: string) => void;
  refetch: () => Promise<void>;
  loading: boolean;
} {
  const { user } = useAuth();
  const [revealedIds, setRevealedIds] = useState<Set<string>>(new Set());
  const [loading, setLoading] = useState(true);

  const refetch = useCallback(async () => {
    if (!user?.id) {
      setRevealedIds(new Set());
      setLoading(false);
      return;
    }
    setLoading(true);
    try {
      const res = await fetch("/api/matching/revealed-ids");
      const json = await res.json().catch(() => ({}));
      if (res.ok && Array.isArray(json.postIds)) {
        setRevealedIds(new Set(json.postIds.map(String)));
      }
    } finally {
      setLoading(false);
    }
  }, [user?.id]);

  useEffect(() => {
    void refetch();
  }, [refetch]);

  const addRevealedId = useCallback((postId: string) => {
    setRevealedIds((prev) => new Set([...prev, postId]));
  }, []);

  return { revealedIds, addRevealedId, refetch, loading };
}
