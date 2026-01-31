"use client"

// Phase 3.7: 피드 로딩·빈 목록·에러 (Skeleton, Empty state, 에러 시 toast) / Phase 3.8: 찜 추가·삭제 피드백 (toast)

import { useState, useMemo, useEffect } from "react"
import { AnimatePresence, motion } from "framer-motion"
import { FilterBar, type FilterState } from "@/components/domain/feed/filter-bar"
import { TabMenu } from "@/components/tab-menu"
import { CandidateCard } from "@/components/domain/feed/candidate-card"
import { EmptyState } from "@/components/empty-state"
import { ProfileDetailView } from "@/components/domain/profile/profile-detail-view"
import { useMatchingFeed } from "@/hooks/use-matching-feed"
import { useBookmarks } from "@/hooks/use-bookmarks"
import { useDailyLimitContext } from "@/components/providers/daily-limit-provider"
import { useContactReveal, type RevealedContact } from "@/hooks/use-contact-reveal"
import { useRevealedIds } from "@/hooks/use-revealed-ids"
import type { UserProfile } from "@/lib/types"
import { Skeleton } from "@/components/ui/skeleton"
import { Button } from "@/components/ui/button"
import { toast } from "sonner"
import { AlertCircle, RefreshCw, Loader2 } from "lucide-react"

const tabs = [
  { id: "all", label: "전체 매칭" },
  { id: "ai", label: "AI 추천" },
]

export function FeedList() {
  const [activeTab, setActiveTab] = useState("all")
  const [selectedCandidate, setSelectedCandidate] = useState<UserProfile | null>(null)
  const [filters, setFilters] = useState<FilterState>({
    dormitory: "all",
    gender: "all",
    majorCategory: "all",
    grade: "all",
    smoking: "all",
  })

  const feedFilters = useMemo(
    () => ({
      dormitory: filters.dormitory !== "all" ? filters.dormitory : undefined,
      gender: filters.gender !== "all" ? filters.gender : undefined,
      major_category: filters.majorCategory !== "all" ? filters.majorCategory : undefined,
      grade: filters.grade !== "all" ? filters.grade : undefined,
      smoking: filters.smoking !== "all" ? filters.smoking : undefined,
    }),
    [filters]
  )

  const { profiles, loading, error, refetch } = useMatchingFeed(feedFilters)
  const { add: addBookmark, remove: removeBookmark, isBookmarked } = useBookmarks()
  const { remaining: dailyRevealsRemaining } = useDailyLimitContext()
  const { reveal: revealContact } = useContactReveal()
  const { revealedIds, addRevealedId } = useRevealedIds()
  const [revealedContacts, setRevealedContacts] = useState<Record<string, RevealedContact>>({})

  useEffect(() => {
    if (error) {
      toast.error("피드를 불러오지 못했어요.", { description: "아래에서 다시 시도해 주세요." })
    }
  }, [error])

  const displayedCandidates = useMemo(() => {
    let list = profiles
    if (activeTab === "ai") list = list.filter((p) => (p.matchScore ?? 0) >= 80)
    return list
  }, [profiles, activeTab])

  const handleSaveProfile = async (profile: UserProfile) => {
    const postId = String(profile.id)
    const { error: err } = await addBookmark(postId)
    if (err) toast.error("찜 추가에 실패했어요")
    else toast.success("찜 목록에 추가했어요")
  }

  const handleUnsaveProfile = async (profileId: number | string) => {
    const { error: err } = await removeBookmark(String(profileId))
    if (err) toast.error("찜 해제에 실패했어요")
    else toast.success("찜 해제했어요")
  }

  const handleRevealContact = async (profile: UserProfile): Promise<boolean> => {
    const postId = String(profile.id)
    const { success, error: err, contact } = await revealContact(postId)
    if (success) {
      addRevealedId(postId)
      if (contact) setRevealedContacts((prev) => ({ ...prev, [postId]: contact }))
      toast.success("연락처가 공개되었어요.")
      return true
    }
    toast.error(err ?? "연락처 공개에 실패했어요")
    return false
  }

  const isProfileSaved = (profileId: number | string) => isBookmarked(String(profileId))
  const isProfileRevealed = (profileId: number | string) => revealedIds.has(String(profileId))

  const toggleSave = (profile: UserProfile) => {
    if (isProfileSaved(profile.id)) handleUnsaveProfile(profile.id)
    else handleSaveProfile(profile)
  }

  const handleViewProfile = (candidate: UserProfile) => setSelectedCandidate(candidate)
  const handleBackFromProfile = () => setSelectedCandidate(null)
  const handleFilterChange = (newFilters: FilterState) => setFilters(newFilters)

  if (selectedCandidate) {
    return (
      <AnimatePresence mode="wait">
        <motion.div key="profile-detail" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} transition={{ duration: 0.2 }}>
          <ProfileDetailView
            profile={selectedCandidate}
            onBack={handleBackFromProfile}
            dailyRevealsRemaining={dailyRevealsRemaining}
            maxDailyReveals={3}
            onRevealContact={handleRevealContact}
            isRevealed={isProfileRevealed(selectedCandidate.id)}
            revealedContact={revealedContacts[String(selectedCandidate.id)]}
          />
        </motion.div>
      </AnimatePresence>
    )
  }

  return (
    <div className="min-h-screen pb-24 lg:pb-8">
      <div className="lg:hidden bg-gradient-to-br from-primary/10 via-primary/5 to-background px-4 sm:px-6 pt-14 pb-6">
        <h1 className="text-2xl font-bold text-foreground tracking-tight">매칭미?</h1>
        <p className="text-sm text-muted-foreground mt-1.5">남도학숙생을 위한 룸메이트 매칭 플랫폼</p>
      </div>
      <div className="hidden lg:block px-4 sm:px-6 lg:px-6 pt-8 pb-4">
        <div className="max-w-2xl mx-auto lg:max-w-4xl">
          <h1 className="text-2xl font-bold text-foreground tracking-tight">남도학숙 룸메이트 찾기</h1>
          <p className="text-sm text-muted-foreground mt-1">남도학숙생을 위한 룸메이트 매칭 플랫폼 · 나와 꼭 맞는 룸메이트를 만나보세요</p>
        </div>
      </div>
      <FilterBar onFilterChange={handleFilterChange} />
      <TabMenu activeTab={activeTab} onTabChange={setActiveTab} tabs={tabs} />
      <main className="px-4 sm:px-6 lg:px-6 py-4">
        <div className="max-w-2xl mx-auto lg:max-w-4xl">
          {loading ? (
            <div className="flex flex-col items-center justify-center py-16 px-6 text-center">
              <div className="size-20 rounded-full bg-secondary flex items-center justify-center mb-6">
                <Loader2 className="size-10 text-muted-foreground animate-spin" />
              </div>
              <h3 className="text-lg font-semibold text-foreground mb-2">
                나와 맞는 룸메이트를 찾고 있어요 ✨
              </h3>
              <p className="text-sm text-muted-foreground mb-8 max-w-[340px]">
                잠시만 기다려 주세요.
              </p>
              <div className="space-y-4 lg:grid lg:grid-cols-2 lg:gap-4 lg:space-y-0 w-full">
                {[1, 2, 3, 4].map((i) => (
                  <div key={i} className="bg-card rounded-2xl p-6 border border-border/40 shadow-sm">
                    <div className="flex gap-5">
                      <Skeleton className="size-[72px] shrink-0 rounded-full bg-muted" />
                      <div className="flex-1 min-w-0 space-y-3">
                        <div className="flex justify-between gap-4">
                          <div className="space-y-2">
                            <Skeleton className="h-4 w-24 bg-muted" />
                            <Skeleton className="h-3 w-32 bg-muted" />
                          </div>
                          <Skeleton className="size-14 shrink-0 rounded-full bg-muted" />
                        </div>
                        <div className="flex flex-wrap gap-1.5">
                          <Skeleton className="h-6 w-16 rounded-full bg-muted" />
                          <Skeleton className="h-6 w-14 rounded-full bg-muted" />
                          <Skeleton className="h-6 w-20 rounded-full bg-muted" />
                        </div>
                        <Skeleton className="h-10 w-full rounded-lg bg-muted" />
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ) : error ? (
            <div className="flex flex-col items-center justify-center py-16 px-6 text-center">
              <div className="size-20 rounded-full bg-destructive/10 flex items-center justify-center mb-6">
                <AlertCircle className="size-10 text-destructive" />
              </div>
              <h3 className="text-lg font-semibold text-foreground mb-2">피드를 불러오지 못했어요</h3>
              <p className="text-sm text-muted-foreground mb-6 max-w-[320px] leading-relaxed">
                네트워크나 일시적인 오류일 수 있어요. 아래 버튼으로 다시 시도해 보세요.
              </p>
              <Button onClick={() => refetch()} variant="secondary" className="rounded-full px-6" size="lg">
                <RefreshCw className="size-4 mr-2" />
                다시 시도
              </Button>
            </div>
          ) : displayedCandidates.length > 0 ? (
            <div className="space-y-4 lg:grid lg:grid-cols-2 lg:gap-4 lg:space-y-0">
              {displayedCandidates.map((profile) => (
                <CandidateCard
                  key={profile.id}
                  profile={profile}
                  isSaved={isProfileSaved(profile.id)}
                  onSave={() => toggleSave(profile)}
                  onViewProfile={() => handleViewProfile(profile)}
                  isAiRecommended={activeTab === "ai"}
                />
              ))}
            </div>
          ) : (
            <EmptyState onUpdatePreferences={() => refetch()} />
          )}
        </div>
      </main>
    </div>
  )
}
