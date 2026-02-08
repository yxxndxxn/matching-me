"use client";

// 대시보드 레이아웃에서 서버에서 조회한 user를 넘겨 클라이언트 getSession() 대기 없이 첫 페인트 (로딩 단축)

import { createContext, useContext, type ReactNode } from "react";
import type { User } from "@supabase/supabase-js";

type AuthInitialValue = { initialUser: User | null };

const AuthInitialContext = createContext<AuthInitialValue | undefined>(undefined);

export function AuthInitialProvider({
  initialUser,
  children,
}: {
  initialUser: User | null;
  children: ReactNode;
}) {
  return (
    <AuthInitialContext.Provider value={{ initialUser }}>
      {children}
    </AuthInitialContext.Provider>
  );
}

export function useAuthInitial(): User | null {
  const ctx = useContext(AuthInitialContext);
  return ctx?.initialUser ?? null;
}
