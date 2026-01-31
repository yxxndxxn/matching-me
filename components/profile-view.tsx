"use client"

import React, { useState } from "react"
import { AnimatePresence, motion } from "framer-motion"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import {
  Edit3,
  MapPin,
  GraduationCap,
  Moon,
  Sun,
  Volume2,
  Sparkles,
  User,
  ChevronRight,
  ChevronLeft,
  LogOut,
  Bell,
  Shield,
  HelpCircle,
  Settings,
  Bookmark,
  Eye,
  BookOpen,
} from "lucide-react"
import { currentUserProfile, getLifestyleTags, getMajorCategoryLabel, getDormitoryLabel, type UserProfile } from "@/lib/types"
import { ProfileDetailView } from "@/components/domain/profile/profile-detail-view"

type SubPage = "main" | "editProfile" | "notifications" | "settings" | "privacy" | "help" | "savedRoommates"

function MenuItem({ icon, label, onClick, badge }: { icon: React.ReactNode; label: string; onClick?: () => void; badge?: number }) {
  return (
    <button onClick={onClick} className="w-full flex items-center h-14 px-4 hover:bg-muted/30 transition-colors">
      <span className="flex items-center justify-center size-6 text-muted-foreground">{icon}</span>
      <span className="flex-1 text-sm text-foreground text-left ml-3">{label}</span>
      {badge !== undefined && badge > 0 && (
        <span className="mr-2 px-2 py-0.5 text-xs font-medium bg-primary/10 text-primary rounded-full">{badge}</span>
      )}
      <ChevronRight className="size-5 text-muted-foreground" />
    </button>
  )
}

function PlaceholderPage({ title, onBack }: { title: string; onBack: () => void }) {
  return (
    <div className="min-h-screen pb-24 bg-background">
      <div className="max-w-2xl mx-auto lg:max-w-4xl">
        <div className="flex items-center gap-3 px-6 pt-12 pb-4 border-b border-border/50">
        <button onClick={onBack} className="p-2 -ml-2 rounded-full hover:bg-muted/50 transition-colors">
          <ChevronLeft className="size-5 text-foreground" />
        </button>
        <h1 className="text-lg font-semibold text-foreground">{title}</h1>
      </div>
      <div className="flex flex-col items-center justify-center px-6 py-20">
        <div className="size-16 rounded-full bg-muted/50 flex items-center justify-center mb-4">
          <Settings className="size-8 text-muted-foreground" />
        </div>
        <h2 className="text-lg font-medium text-foreground mb-2">{title}</h2>
        <p className="text-sm text-muted-foreground text-center max-w-xs">이 페이지는 현재 준비 중입니다. 곧 업데이트될 예정이에요.</p>
      </div>
      </div>
    </div>
  )
}

function SavedRoommatesPage({ onBack, savedProfiles, onViewProfile }: { onBack: () => void; savedProfiles: UserProfile[]; onViewProfile: (profile: UserProfile) => void }) {
  return (
    <div className="min-h-screen pb-24 bg-background">
      <div className="max-w-2xl mx-auto lg:max-w-4xl">
        <div className="flex items-center gap-3 px-6 pt-12 pb-4 border-b border-border/50">
          <button onClick={onBack} className="p-2 -ml-2 rounded-full hover:bg-muted/50 transition-colors">
            <ChevronLeft className="size-5 text-foreground" />
          </button>
          <h1 className="text-lg font-semibold text-foreground">내가 찜한 룸메이트</h1>
        </div>
        <div className="px-6 py-4 space-y-3">
        {savedProfiles.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20">
            <div className="size-16 rounded-full bg-muted/50 flex items-center justify-center mb-4">
              <Bookmark className="size-8 text-muted-foreground" />
            </div>
            <h2 className="text-lg font-medium text-foreground mb-2">아직 찜한 룸메이트가 없어요</h2>
            <p className="text-sm text-muted-foreground text-center max-w-xs">메인 피드에서 마음에 드는 프로필을 찜해보세요.</p>
          </div>
        ) : (
          savedProfiles.map((profile) => (
            <button
              key={profile.id}
              onClick={() => onViewProfile(profile)}
              className="w-full bg-card rounded-2xl p-5 border border-border/50 hover:border-primary/30 hover:shadow-md transition-all duration-200 text-left"
            >
              <div className="flex items-center gap-4">
                <Avatar className="size-14 border-2 border-primary/20">
                  <AvatarImage src={profile.avatarUrl || "/placeholder.svg"} alt={profile.name} />
                  <AvatarFallback className="bg-secondary text-secondary-foreground font-medium">{profile.name.slice(0, 2).toUpperCase()}</AvatarFallback>
                </Avatar>
                <div className="flex-1 min-w-0">
                  <h3 className="font-semibold text-foreground truncate">{profile.name}</h3>
                  <p className="text-xs text-muted-foreground truncate">
                    {getDormitoryLabel(profile.dormitory)} · {getMajorCategoryLabel(profile.majorCategory)} · {profile.grade}
                  </p>
                  <div className="flex items-center gap-2 mt-2">
                    <span className="text-xs text-muted-foreground">{getDormitoryLabel(profile.dormitory)}</span>
                    <span className="text-xs text-indigo-500 font-medium">{profile.matchScore}% 매칭</span>
                  </div>
                </div>
                <ChevronRight className="size-5 text-muted-foreground shrink-0" />
              </div>
            </button>
          ))
        )}
        </div>
      </div>
    </div>
  )
}

interface ProfileViewProps {
  onLogout?: () => void
  savedProfiles?: UserProfile[]
  onRevealContact?: (profile: UserProfile) => void
  dailyRevealsRemaining?: number
  isProfileRevealed?: (profileId: number | string) => boolean
}

export function ProfileView({
  onLogout,
  savedProfiles = [],
  onRevealContact,
  dailyRevealsRemaining = 3,
  isProfileRevealed = () => false,
}: ProfileViewProps) {
  const [currentPage, setCurrentPage] = useState<SubPage>("main")
  const [selectedProfile, setSelectedProfile] = useState<UserProfile | null>(null)
  const profile = currentUserProfile
  const lifestyleTags = getLifestyleTags(profile)
  const majorCategoryLabel = getMajorCategoryLabel(profile.majorCategory)

  const handleBack = () => {
    setCurrentPage("main")
    setSelectedProfile(null)
  }
  const handleViewSavedProfile = (profileToView: UserProfile) => setSelectedProfile(profileToView)
  const handleBackFromProfile = () => setSelectedProfile(null)

  if (selectedProfile) {
    return (
      <AnimatePresence mode="wait">
        <motion.div key="saved-profile-detail" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} transition={{ duration: 0.2 }}>
          <ProfileDetailView
            profile={selectedProfile}
            onBack={handleBackFromProfile}
            dailyRevealsRemaining={dailyRevealsRemaining}
            maxDailyReveals={3}
            onRevealContact={onRevealContact}
            isRevealed={isProfileRevealed(selectedProfile.id)}
          />
        </motion.div>
      </AnimatePresence>
    )
  }

  if (currentPage === "editProfile") return <PlaceholderPage title="프로필 수정" onBack={handleBack} />
  if (currentPage === "notifications") return <PlaceholderPage title="알림 설정" onBack={handleBack} />
  if (currentPage === "settings") return <PlaceholderPage title="설정" onBack={handleBack} />
  if (currentPage === "privacy") return <PlaceholderPage title="개인정보 보호" onBack={handleBack} />
  if (currentPage === "help") return <PlaceholderPage title="도움말 및 지원" onBack={handleBack} />
  if (currentPage === "savedRoommates") return <SavedRoommatesPage onBack={handleBack} savedProfiles={savedProfiles} onViewProfile={handleViewSavedProfile} />

  return (
    <div className="min-h-screen pb-24 bg-background">
      <div className="bg-gradient-to-br from-primary/10 via-primary/5 to-background px-6 pt-12 pb-6">
        <div className="max-w-2xl mx-auto lg:max-w-4xl">
        <div className="flex flex-col items-center text-center">
          <div className="relative">
            <Avatar className="size-24 border-4 border-card shadow-lg">
              <AvatarImage src={profile.avatarUrl || "/placeholder.svg"} alt={profile.name} />
              <AvatarFallback className="bg-muted text-foreground text-xl font-semibold">{profile.name.slice(0, 2).toUpperCase()}</AvatarFallback>
            </Avatar>
            <Button variant="secondary" size="icon" onClick={() => setCurrentPage("editProfile")} className="absolute -bottom-1 -right-1 size-8 rounded-full shadow-md border border-border">
              <Edit3 className="size-3.5" />
              <span className="sr-only">프로필 수정</span>
            </Button>
          </div>
          <h2 className="text-lg font-bold text-foreground mt-4">{profile.name}</h2>
          <div className="flex items-center justify-center gap-1.5 text-muted-foreground text-sm mt-1">
            <User className="size-4" />
            <span>{profile.gender === "male" ? "남성" : "여성"}</span>
          </div>
          <div className="flex items-center justify-center gap-1.5 text-muted-foreground text-sm mt-0.5">
            <GraduationCap className="size-4" />
            <span>{getDormitoryLabel(profile.dormitory)} · {profile.grade}</span>
          </div>
          <div className="flex items-center justify-center gap-1.5 text-muted-foreground text-sm mt-0.5">
            <BookOpen className="size-4" />
            <span>{majorCategoryLabel} 계열</span>
          </div>
          <div className="flex items-center justify-center gap-1.5 text-muted-foreground text-sm mt-0.5">
            <MapPin className="size-4" />
            <span>{getDormitoryLabel(profile.dormitory)}</span>
          </div>
        </div>
        <div className="flex items-center justify-center mt-6 py-4 bg-card rounded-2xl border border-border/50">
          <div className="flex items-center gap-3">
            <Eye className="size-5 text-indigo-500" />
            <div>
              <p className="text-sm font-medium text-foreground">오늘 남은 연락처 공개</p>
              <p className="text-xs text-muted-foreground">{dailyRevealsRemaining}/3회</p>
            </div>
          </div>
        </div>
      </div>
      </div>
      <main className="px-6 py-4 space-y-4">
        <div className="max-w-2xl mx-auto lg:max-w-4xl space-y-4">
          <div className="bg-card rounded-2xl p-5 border border-border/50">
            <h3 className="text-sm font-semibold text-foreground mb-3">자기소개</h3>
            <p className="text-sm text-muted-foreground leading-relaxed">{profile.introduction}</p>
          </div>
          <div className="bg-card rounded-2xl p-5 border border-border/50">
            <h3 className="text-sm font-semibold text-foreground mb-4">라이프스타일</h3>
            <div className="grid grid-cols-2 gap-3">
              <div className="flex items-center gap-3 p-3.5 bg-muted/50 rounded-xl">
                {profile.chronotype === "morning" ? <Sun className="size-4 text-amber-500" /> : <Moon className="size-4 text-indigo-500" />}
                <div>
                  <p className="text-[10px] text-muted-foreground uppercase">생활 패턴</p>
                  <p className="text-sm font-medium text-foreground">{profile.chronotype === "morning" ? "아침형" : "밤형"}</p>
                </div>
              </div>
              <div className="flex items-center gap-3 p-3.5 bg-muted/50 rounded-xl">
                <Sparkles className="size-4 text-pink-500" />
                <div>
                  <p className="text-[10px] text-muted-foreground uppercase">청결도</p>
                  <p className="text-sm font-medium text-foreground">{profile.cleanliness}/5</p>
                </div>
              </div>
              <div className="flex items-center gap-3 p-3.5 bg-muted/50 rounded-xl">
                <Volume2 className="size-4 text-blue-500" />
                <div>
                  <p className="text-[10px] text-muted-foreground uppercase">소음 민감도</p>
                  <p className="text-sm font-medium text-foreground">{profile.noiseSensitivity}/5</p>
                </div>
              </div>
            </div>
          </div>
          <div className="bg-card rounded-2xl p-5 border border-border/50">
            <h3 className="text-sm font-semibold text-foreground mb-4">나의 특성</h3>
            <div className="flex flex-wrap gap-2">
              {lifestyleTags.map((tag) => (
                <Badge key={tag} variant="secondary" className="text-xs font-medium py-1.5 px-3 bg-muted/70">
                  {tag}
                </Badge>
              ))}
            </div>
          </div>
          <div className="bg-card rounded-2xl p-5 border border-border/50">
            <h3 className="text-sm font-semibold text-foreground mb-4">연락처</h3>
            <div className="space-y-3">
              <div className="flex items-center justify-between py-2">
                <span className="text-sm text-muted-foreground">전화번호</span>
                <span className="text-sm font-medium text-foreground">{profile.phone}</span>
              </div>
              <div className="flex items-center justify-between py-2">
                <span className="text-sm text-muted-foreground">카카오톡 ID</span>
                <span className="text-sm font-medium text-foreground">{profile.kakaoId}</span>
              </div>
            </div>
          </div>
          <div className="bg-card rounded-2xl border border-border/50 overflow-hidden">
            <div className="px-4 py-3 border-b border-border/50">
              <h3 className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">매칭</h3>
            </div>
            <MenuItem icon={<Bookmark className="size-5" />} label="내가 찜한 룸메이트" onClick={() => setCurrentPage("savedRoommates")} badge={savedProfiles.length} />
          </div>
          <div className="bg-card rounded-2xl border border-border/50 overflow-hidden">
            <div className="px-4 py-3 border-b border-border/50">
              <h3 className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">계정</h3>
            </div>
            <MenuItem icon={<User className="size-5" />} label="프로필 수정" onClick={() => setCurrentPage("editProfile")} />
            <div className="h-px bg-border/50 mx-4" />
            <MenuItem icon={<Bell className="size-5" />} label="알림 설정" onClick={() => setCurrentPage("notifications")} />
          </div>
          <div className="bg-card rounded-2xl border border-border/50 overflow-hidden">
            <div className="px-4 py-3 border-b border-border/50">
              <h3 className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">지원</h3>
            </div>
            <MenuItem icon={<Settings className="size-5" />} label="설정" onClick={() => setCurrentPage("settings")} />
            <div className="h-px bg-border/50 mx-4" />
            <MenuItem icon={<Shield className="size-5" />} label="개인정보 보호" onClick={() => setCurrentPage("privacy")} />
            <div className="h-px bg-border/50 mx-4" />
            <MenuItem icon={<HelpCircle className="size-5" />} label="도움말 및 지원" onClick={() => setCurrentPage("help")} />
          </div>
          <button onClick={onLogout} className="w-full flex items-center justify-center gap-2 h-14 text-destructive hover:bg-destructive/5 rounded-2xl transition-colors border border-border/50 bg-card">
            <LogOut className="size-5" />
            <span className="text-sm font-medium">로그아웃</span>
          </button>
        </div>
      </main>
    </div>
  )
}
