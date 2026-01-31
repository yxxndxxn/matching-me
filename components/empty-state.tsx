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
      <h3 className="text-lg font-semibold text-foreground mb-3">
        나와 꼭 맞는 메이트를 찾기 위해 매칭미가 준비 중이에요! ✨
      </h3>
      <div className="space-y-2 mb-6 max-w-[340px] text-center">
        <p className="text-sm text-muted-foreground leading-relaxed">
          현재 조건에 맞는 룸메이트 공고가 아직 없네요.
        </p>
        <p className="text-sm text-muted-foreground leading-relaxed">
          곧 찾아올 새로운 인연을 놓치지 않도록 필터를 조금 넓게 조정해 보세요.
        </p>
      </div>
      <Button onClick={onUpdatePreferences} variant="secondary" className="rounded-full px-6">
        <SlidersHorizontal className="size-4 mr-2" />
        필터 다시 살펴보기
      </Button>
    </div>
  )
}
