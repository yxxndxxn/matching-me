"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { Search, User } from "lucide-react"

import { cn } from "@/lib/utils/cn"

const navItems = [
  { id: "home" as const, label: "룸메찾기", href: "/feed", icon: Search },
  { id: "profile" as const, label: "마이페이지", href: "/profile", icon: User },
] as const

export function BottomNav() {
  const pathname = usePathname()

  return (
    <nav className="fixed bottom-0 left-0 right-0 w-full lg:max-w-md lg:mx-auto z-40 bg-card/95 backdrop-blur-lg border-t border-border/50">
      <div className="flex w-full">
        {navItems.map((item) => {
          const Icon = item.icon
          const isActive =
            item.href === "/feed"
              ? pathname === "/feed" || pathname === "/" || pathname.startsWith("/feed/")
              : pathname.startsWith(item.href)
          return (
            <Link
              key={item.id}
              href={item.href}
              className={cn(
                "flex-1 flex flex-col items-center justify-center gap-1.5 py-3.5 transition-colors duration-200 relative",
                isActive
                  ? "text-primary"
                  : "text-muted-foreground hover:text-foreground"
              )}
            >
              {isActive && (
                <div className="absolute top-0 left-1/2 -translate-x-1/2 w-10 h-0.5 bg-primary rounded-full" />
              )}
              <Icon
                className="size-5"
                strokeWidth={isActive ? 2.5 : 2}
              />
              <span className="text-[10px] font-medium tracking-tight">
                {item.label}
              </span>
            </Link>
          )
        })}
      </div>
      <div 
        className="bg-card" 
        style={{ height: "var(--safe-area-inset-bottom, 0px)" }}
      />
    </nav>
  )
}
