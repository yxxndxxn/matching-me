"use client";

// 로고(매칭미?) 클릭 시 피드 상세 선택 해제 — 같은 /dashboard URL이라 상태만 초기화

import { createContext, useCallback, useContext, useRef, type ReactNode } from "react";

type DashboardNavContextValue = {
  registerClearFeedSelection: (fn: () => void) => () => void;
  clearFeedSelection: () => void;
};

const noop = () => {};

const DashboardNavContext = createContext<DashboardNavContextValue>({
  registerClearFeedSelection: noop,
  clearFeedSelection: noop,
});

export function DashboardNavProvider({ children }: { children: ReactNode }) {
  const clearRef = useRef<() => void>(noop);

  const registerClearFeedSelection = useCallback((fn: () => void) => {
    clearRef.current = fn;
    return () => {
      clearRef.current = noop;
    };
  }, []);

  const clearFeedSelection = useCallback(() => {
    clearRef.current();
  }, []);

  return (
    <DashboardNavContext.Provider value={{ registerClearFeedSelection, clearFeedSelection }}>
      {children}
    </DashboardNavContext.Provider>
  );
}

export function useDashboardNav() {
  return useContext(DashboardNavContext);
}
