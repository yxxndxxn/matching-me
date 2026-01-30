"use client"

import { useState, useMemo } from "react"
import { AnimatePresence, motion } from "framer-motion"
import { FilterBar, type FilterState } from "@/components/filter-bar"
import { TabMenu } from "@/components/tab-menu"
import { CandidateCard } from "@/components/candidate-card"
import { EmptyState } from "@/components/empty-state"
import { ProfileDetailView } from "@/components/profile-detail-view"
import { sampleProfiles, type UserProfile } from "@/lib/types"

const tabs = [
  { id: "all", label: "전체 매칭" },
  { id: "ai", label: "AI 추천" },
]

interface HomeViewProps {
  onSaveProfile?: (profile: UserProfile) => void
  onUnsaveProfile?: (profileId: number) => void
  onRevealContact?: (profile: UserProfile) => void
  dailyRevealsRemaining?: number
  isProfileSaved?: (profileId: number) => boolean
  isProfileRevealed?: (profileId: number) => boolean
}

export function HomeView({ 
  onSaveProfile,
  onUnsaveProfile,
  onRevealContact,
  dailyRevealsRemaining = 3,
  isProfileSaved = () => false,
  isProfileRevealed = () => false,
}: HomeViewProps) {
  const [activeTab, setActiveTab] = useState("all")
  const [showEmpty, setShowEmpty] = useState(false)
  const [selectedCandidate, setSelectedCandidate] = useState<UserProfile | null>(null)
  const [filters, setFilters] = useState<FilterState>({
    dormitory: "all",
    gender: "all",
    majorCategory: "all",
    grade: "all",
    smoking: "all",
  })

  const toggleSave = (profile: UserProfile) => {
    if (isProfileSaved(profile.id)) {
      onUnsaveProfile?.(profile.id)
    } else {
      onSaveProfile?.(profile)
    }
  }

  const handleViewProfile = (candidate: UserProfile) => {
    setSelectedCandidate(candidate)
  }

  const handleBackFromProfile = () => {
    setSelectedCandidate(null)
  }

  const handleRevealContact = (profile: UserProfile) => {
    onRevealContact?.(profile)
  }

  const handleFilterChange = (newFilters: FilterState) => {
    setFilters(newFilters)
  }

  // Filter candidates based on active tab and filters
  const displayedCandidates = useMemo(() => {
    if (showEmpty) return []
    
    let candidates = sampleProfiles

    // Filter by AI recommendation (80%+ match score)
    if (activeTab === "ai") {
      candidates = candidates.filter((profile) => (profile.matchScore || 0) >= 80)
    }

    // Apply dormitory filter
    if (filters.dormitory !== "all") {
      candidates = candidates.filter((profile) => 
        profile.dormitory.toLowerCase().includes(
          filters.dormitory === "dongjak" ? "동작" : "은평"
        )
      )
    }

    // Apply gender filter
    if (filters.gender !== "all") {
      candidates = candidates.filter((profile) => profile.gender === filters.gender)
    }

    // Apply major category filter
    if (filters.majorCategory !== "all") {
      candidates = candidates.filter((profile) => profile.majorCategory === filters.majorCategory)
    }

    // Apply grade filter
    if (filters.grade !== "all") {
      candidates = candidates.filter((profile) => profile.grade === filters.grade)
    }

    // Apply smoking filter
    if (filters.smoking !== "all") {
      candidates = candidates.filter((profile) => profile.smoking === filters.smoking)
    }
    
    return candidates
  }, [activeTab, showEmpty, filters])

  if (selectedCandidate) {
    return (
      <AnimatePresence mode="wait">
        <motion.div
          key="profile-detail"
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: -20 }}
          transition={{ duration: 0.2 }}
        >
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
      {/* Header Banner - Hidden on Desktop (shown in sidebar) */}
      <div className="lg:hidden bg-gradient-to-br from-primary/10 via-primary/5 to-background px-6 pt-14 pb-6">
        <h1 className="text-2xl font-bold text-foreground tracking-tight">Matching Me?</h1>
        <p className="text-sm text-muted-foreground mt-1.5">나와 맞는 룸메이트를 찾아보세요</p>
      </div>

      {/* Desktop Header */}
      <div className="hidden lg:block px-6 pt-8 pb-4">
        <h1 className="text-2xl font-bold text-foreground tracking-tight">룸메이트 찾기</h1>
        <p className="text-sm text-muted-foreground mt-1">조건에 맞는 룸메이트를 찾아보세요</p>
      </div>

      {/* Filter Bar */}
      <FilterBar onFilterChange={handleFilterChange} />

      {/* Tab Menu */}
      <TabMenu activeTab={activeTab} onTabChange={setActiveTab} tabs={tabs} />

      {/* Candidate List */}
      <main className="px-4 py-4 lg:px-6">
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
      </main>
    </div>
  )
}
