"use client"

import { Compass, User } from "lucide-react"
import { cn } from "@/lib/utils"

interface BottomNavProps {
  activeTab: "home" | "profile"
  onTabChange: (tab: "home" | "profile") => void
}

export function BottomNav({ activeTab, onTabChange }: BottomNavProps) {
  const navItems = [
    { id: "home" as const, label: "룸메찾기", icon: Compass },
    { id: "profile" as const, label: "마이페이지", icon: User },
  ]

  return (
    <nav className="fixed bottom-0 left-1/2 -translate-x-1/2 w-full max-w-md md:max-w-2xl lg:max-w-4xl z-40 bg-card/95 backdrop-blur-lg border-t border-border/50">
      <div className="flex w-full">
        {navItems.map((item) => {
          const Icon = item.icon
          const isActive = activeTab === item.id
          return (
            <button
              key={item.id}
              onClick={() => onTabChange(item.id)}
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
              <Icon className="size-5" strokeWidth={isActive ? 2.5 : 2} />
              <span className="text-[10px] font-medium tracking-tight">{item.label}</span>
            </button>
          )
        })}
      </div>
      <div className="h-safe-area-inset-bottom bg-card" />
    </nav>
  )
}
