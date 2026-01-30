"use client"

import { cn } from "@/lib/utils/cn"

interface TabMenuProps {
  activeTab: string
  onTabChange: (tab: string) => void
  tabs: { id: string; label: string }[]
}

export function TabMenu({ activeTab, onTabChange, tabs }: TabMenuProps) {
  return (
    <div className="px-4 sm:px-6 lg:px-6 border-b border-border">
      <div className="flex items-center gap-6 max-w-2xl mx-auto lg:max-w-4xl">
        {tabs.map((tab) => {
          const isActive = activeTab === tab.id
          return (
            <button
              key={tab.id}
              onClick={() => onTabChange(tab.id)}
              className={cn(
                "relative py-3 text-sm font-medium transition-colors",
                isActive ? "text-foreground" : "text-muted-foreground hover:text-foreground/80"
              )}
            >
              {tab.label}
              {isActive && (
                <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-foreground rounded-full" />
              )}
            </button>
          )
        })}
      </div>
    </div>
  )
}
