"use client";

// 일일 조회권 남은 횟수 (Phase 2.13)

import { createClient } from "@/lib/supabase/client";
import { getRemainingReveals } from "@/lib/supabase/queries/view-logs";
import { useCallback, useEffect, useState } from "react";
import { useAuth } from "./use-auth";

export function useDailyLimit(): {
  remaining: number;
  loading: boolean;
  refetch: () => Promise<void>;
} {
  const { user } = useAuth();
  const [remaining, setRemaining] = useState(3);
  const [loading, setLoading] = useState(true);

  const fetchRemaining = useCallback(async () => {
    if (!user?.id) {
      setRemaining(3);
      setLoading(false);
      return;
    }
    setLoading(true);
    try {
      const supabase = createClient();
      const { remaining: r } = await getRemainingReveals(supabase, user.id);
      setRemaining(r);
    } catch {
      setRemaining(3);
    } finally {
      setLoading(false);
    }
  }, [user?.id]);

  useEffect(() => {
    void fetchRemaining();
  }, [fetchRemaining]);

  return { remaining, loading, refetch: fetchRemaining };
}
