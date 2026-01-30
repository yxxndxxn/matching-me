"use client"

import { MatchCard } from "@/components/match-card"
import { Search } from "lucide-react"
import { Input } from "@/components/ui/input"
import { sampleProfiles } from "@/lib/types"

// 샘플 매칭 데이터 (기존 프로필 기반)
const matches = sampleProfiles.slice(0, 5).map((profile, index) => ({
  profile,
  isNew: index < 2,
  lastMessage:
    index === 0
      ? "안녕하세요! 룸메이트 관련해서 이야기 나눠볼까요?"
      : index === 2
        ? "좋아요! 그렇게 해요!"
        : index === 3
          ? "만나서 반가워요"
          : undefined,
}))

export function MatchesView() {
  return (
    <div className="min-h-screen pb-24">
      {/* Header */}
      <header className="sticky top-0 z-40 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 border-b border-border/50">
        <div className="px-6 py-4 max-w-md mx-auto space-y-4">
          <div>
            <h1 className="text-xl font-bold text-foreground">매칭 목록</h1>
            <p className="text-xs text-muted-foreground">나와 맞는 룸메이트와 연결하세요</p>
          </div>
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
            <Input
              type="search"
              placeholder="매칭 검색..."
              className="pl-10 bg-secondary/50 border-border/50 focus:border-primary"
            />
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="px-6 py-6 max-w-md mx-auto space-y-6">
        {/* New Matches Section */}
        <section className="space-y-3">
          <div className="flex items-center justify-between">
            <h2 className="text-sm font-semibold text-foreground uppercase tracking-wide">새로운 매칭</h2>
            <span className="text-xs text-primary font-medium">
              {matches.filter((m) => m.isNew).length}개 신규
            </span>
          </div>
          <div className="space-y-3">
            {matches
              .filter((m) => m.isNew)
              .map((match) => (
                <MatchCard
                  key={match.profile.id}
                  profile={match.profile}
                  isNew={match.isNew}
                  lastMessage={match.lastMessage}
                  onClick={() => console.log("Clicked", match.profile.name)}
                />
              ))}
          </div>
        </section>

        {/* All Matches Section */}
        <section className="space-y-3">
          <h2 className="text-sm font-semibold text-foreground uppercase tracking-wide">전체 매칭</h2>
          <div className="space-y-3">
            {matches
              .filter((m) => !m.isNew)
              .map((match) => (
                <MatchCard
                  key={match.profile.id}
                  profile={match.profile}
                  isNew={match.isNew}
                  lastMessage={match.lastMessage}
                  onClick={() => console.log("Clicked", match.profile.name)}
                />
              ))}
          </div>
        </section>
      </main>
    </div>
  )
}
