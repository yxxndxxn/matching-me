"use client";

// 연락처 공개 남은 횟수 단일 소스 — Sidebar·피드·프로필 등 모든 구독자가 동일 값·refetch 공유

import { createContext, useContext, type ReactNode } from "react";
import { useDailyLimit } from "@/hooks/use-daily-limit";

type DailyLimitValue = {
  remaining: number;
  loading: boolean;
  refetch: () => Promise<void>;
};

const defaultDailyLimit: DailyLimitValue = {
  remaining: 3,
  loading: false,
  refetch: () => Promise.resolve(),
};

const DailyLimitContext = createContext<DailyLimitValue | undefined>(undefined);

export function DailyLimitProvider({ children }: { children: ReactNode }) {
  const value = useDailyLimit();
  return (
    <DailyLimitContext.Provider value={value}>
      {children}
    </DailyLimitContext.Provider>
  );
}

export function useDailyLimitContext(): DailyLimitValue {
  const ctx = useContext(DailyLimitContext);
  return ctx ?? defaultDailyLimit;
}
