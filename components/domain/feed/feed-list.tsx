"use client"

import { useState, useMemo } from "react"
import { AnimatePresence, motion } from "framer-motion"
import { FilterBar, type FilterState } from "@/components/domain/feed/filter-bar"
import { TabMenu } from "@/components/tab-menu"
import { CandidateCard } from "@/components/domain/feed/candidate-card"
import { EmptyState } from "@/components/empty-state"
import { ProfileDetailView } from "@/components/domain/profile/profile-detail-view"
import { sampleProfiles, type UserProfile } from "@/lib/types"

const tabs = [
  { id: "all", label: "전체 매칭" },
  { id: "ai", label: "AI 추천" },
]

export function FeedList() {
  const [activeTab, setActiveTab] = useState("all")
  const [showEmpty, setShowEmpty] = useState(false)
  const [selectedCandidate, setSelectedCandidate] = useState<UserProfile | null>(null)
  const [savedProfiles, setSavedProfiles] = useState<UserProfile[]>([])
  const [revealedProfiles, setRevealedProfiles] = useState<Set<number | string>>(new Set())
  const [dailyRevealsRemaining, setDailyRevealsRemaining] = useState(3)
  const [filters, setFilters] = useState<FilterState>({
    dormitory: "all",
    gender: "all",
    majorCategory: "all",
    grade: "all",
    smoking: "all",
  })

  const handleSaveProfile = (profile: UserProfile) => {
    if (!savedProfiles.find((p) => p.id === profile.id)) {
      setSavedProfiles([...savedProfiles, profile])
    }
  }

  const handleUnsaveProfile = (profileId: number | string) => {
    setSavedProfiles(savedProfiles.filter((p) => p.id !== profileId))
  }

  const handleRevealContact = (profile: UserProfile) => {
    setRevealedProfiles((prev) => new Set([...prev, profile.id]))
    setDailyRevealsRemaining((prev) => Math.max(0, prev - 1))
  }

  const isProfileSaved = (profileId: number | string) => savedProfiles.some((p) => p.id === profileId)
  const isProfileRevealed = (profileId: number | string) => revealedProfiles.has(profileId)

  const toggleSave = (profile: UserProfile) => {
    if (isProfileSaved(profile.id)) handleUnsaveProfile(profile.id)
    else handleSaveProfile(profile)
  }

  const handleViewProfile = (candidate: UserProfile) => setSelectedCandidate(candidate)
  const handleBackFromProfile = () => setSelectedCandidate(null)
  const handleFilterChange = (newFilters: FilterState) => setFilters(newFilters)

  const displayedCandidates = useMemo(() => {
    if (showEmpty) return []
    let candidates = sampleProfiles
    if (activeTab === "ai") candidates = candidates.filter((p) => (p.matchScore || 0) >= 80)
    if (filters.dormitory !== "all") candidates = candidates.filter((p) => (filters.dormitory === "dongjak" ? p.dormitory === "dongjak" : p.dormitory === "eunpyeong"))
    if (filters.gender !== "all") candidates = candidates.filter((p) => p.gender === filters.gender)
    if (filters.majorCategory !== "all") candidates = candidates.filter((p) => p.majorCategory === filters.majorCategory)
    if (filters.grade !== "all") candidates = candidates.filter((p) => p.grade === filters.grade)
    if (filters.smoking !== "all") candidates = candidates.filter((p) => (filters.smoking === "smoker" ? p.smoking : !p.smoking))
    return candidates
  }, [activeTab, showEmpty, filters])

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
          />
        </motion.div>
      </AnimatePresence>
    )
  }

  return (
    <div className="min-h-screen pb-24 lg:pb-8">
      <div className="lg:hidden bg-gradient-to-br from-primary/10 via-primary/5 to-background px-4 sm:px-6 pt-14 pb-6">
        <h1 className="text-2xl font-bold text-foreground tracking-tight">매칭미?</h1>
        <p className="text-sm text-muted-foreground mt-1.5">나와 맞는 룸메이트를 찾아보세요</p>
      </div>
      <div className="hidden lg:block px-4 sm:px-6 lg:px-6 pt-8 pb-4">
        <div className="max-w-2xl mx-auto lg:max-w-4xl">
          <h1 className="text-2xl font-bold text-foreground tracking-tight">룸메이트 찾기</h1>
          <p className="text-sm text-muted-foreground mt-1">조건에 맞는 룸메이트를 찾아보세요</p>
        </div>
      </div>
      <FilterBar onFilterChange={handleFilterChange} />
      <TabMenu activeTab={activeTab} onTabChange={setActiveTab} tabs={tabs} />
      <main className="px-4 sm:px-6 lg:px-6 py-4">
        <div className="max-w-2xl mx-auto lg:max-w-4xl">
          {displayedCandidates.length > 0 ? (
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
            <EmptyState onUpdatePreferences={() => setShowEmpty(false)} />
          )}
        </div>
      </main>
    </div>
  )
}
