"use client"

import { usePathname } from "next/navigation"

import { Sidebar } from "@/components/common/Sidebar"
import { BottomNav } from "@/components/common/BottomNav"
import { ScrollToTop } from "@/components/common/ScrollToTop"

export interface AppShellProps {
  children: React.ReactNode
  /** 연락처 공개 남은 횟수 (선택, 사이드바 사용자 영역에 표시) */
  dailyRevealsRemaining?: number
}

/** 로그인/온보딩이 아닌 메인 앱에서만 사이드바·하단 네비 표시 */
const HIDE_NAV_PATHS = ["/", "/login"]
const HIDE_NAV_PREFIXES = ["/onboarding"]

function shouldShowNav(pathname: string): boolean {
  if (HIDE_NAV_PATHS.some((p) => pathname === p)) return false
  if (HIDE_NAV_PREFIXES.some((p) => pathname.startsWith(p))) return false
  return true
}

export function AppShell({ children, dailyRevealsRemaining }: AppShellProps) {
  const pathname = usePathname()
  const showNav = shouldShowNav(pathname ?? "")

  if (!showNav) {
    return (
      <>
        <ScrollToTop />
        {children}
      </>
    )
  }

  return (
    <>
      <ScrollToTop />
      <Sidebar dailyRevealsRemaining={dailyRevealsRemaining} />
      <div className="min-h-screen bg-background pb-20 lg:pb-0 lg:ml-32">
        {children}
      </div>
      <div className="lg:hidden">
        <BottomNav />
      </div>
    </>
  )
}
