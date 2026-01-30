"use client"

import { SearchX, SlidersHorizontal } from "lucide-react"
import { Button } from "@/components/ui/button"

interface EmptyStateProps {
  onUpdatePreferences?: () => void
}

export function EmptyState({ onUpdatePreferences }: EmptyStateProps) {
  return (
    <div className="flex flex-col items-center justify-center py-16 px-6 text-center">
      <div className="size-20 rounded-full bg-secondary flex items-center justify-center mb-6">
        <SearchX className="size-10 text-muted-foreground" />
      </div>
      <h3 className="text-lg font-semibold text-foreground mb-2">
        No matches found
      </h3>
      <p className="text-sm text-muted-foreground mb-6 max-w-[260px] leading-relaxed">
        We couldn't find any roommates matching your current preferences. Try adjusting your filters.
      </p>
      <Button
        onClick={onUpdatePreferences}
        className="rounded-full px-6"
      >
        <SlidersHorizontal className="size-4 mr-2" />
        Update My Preferences
      </Button>
    </div>
  )
}
