"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { Search, User } from "lucide-react"

import { cn } from "@/lib/utils/cn"

export interface SidebarProps {
  /** 연락처 공개 남은 횟수 (선택, 없으면 사용자 영역 숨김) */
  dailyRevealsRemaining?: number
}

export function Sidebar({ dailyRevealsRemaining }: SidebarProps) {
  const pathname = usePathname()
  const isHome = pathname === "/feed" || pathname === "/" || pathname.startsWith("/feed/")
  const isProfile = pathname.startsWith("/profile")

  return (
    <aside className="hidden lg:flex fixed left-0 top-0 bottom-0 w-64 bg-card border-r border-border flex-col z-40">
      <Link
        href="/feed"
        className="w-full p-6 border-b border-border text-left hover:bg-muted/30 transition-colors"
      >
        <h1 className="text-xl font-bold text-primary">매칭미?</h1>
        <p className="text-xs text-muted-foreground mt-1">
          나와 맞는 룸메이트를 찾아보세요
        </p>
      </Link>
      <nav className="flex-1 p-4 space-y-1">
        <Link
          href="/feed"
          className={cn(
            "w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-colors",
            isHome
              ? "bg-primary/10 text-primary"
              : "text-muted-foreground hover:bg-muted/50 hover:text-foreground"
          )}
        >
          <Search className="size-5 shrink-0" />
          룸메찾기
        </Link>
        <Link
          href="/profile"
          className={cn(
            "w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-colors",
            isProfile
              ? "bg-primary/10 text-primary"
              : "text-muted-foreground hover:bg-muted/50 hover:text-foreground"
          )}
        >
          <User className="size-5 shrink-0" />
          마이페이지
        </Link>
      </nav>
      {dailyRevealsRemaining !== undefined && (
        <div className="p-4 border-t border-border">
          <div className="flex items-center gap-3 px-4 py-3 bg-muted/30 rounded-xl">
            <div className="size-10 rounded-full bg-primary/20 flex items-center justify-center shrink-0">
              <span className="text-sm font-medium text-primary">나</span>
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-foreground truncate">
                내 프로필
              </p>
              <p className="text-xs text-muted-foreground">
                연락처 공개 {dailyRevealsRemaining}/3
              </p>
            </div>
          </div>
        </div>
      )}
    </aside>
  )
}
