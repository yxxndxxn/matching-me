"use client"

import React, { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { AnimatePresence, motion } from "framer-motion"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import {
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
  UserX,
  AlertCircle,
  RefreshCw,
  Info,
} from "lucide-react"
import { getLifestyleTags, getMajorCategoryLabel, getDormitoryLabel, type UserProfile } from "@/lib/types"
import { SUPPORT_KAKAO_OPEN_CHAT_URL } from "@/lib/utils/constants"
import { ProfileDetailView } from "@/components/domain/profile/profile-detail-view"
import { useAuth } from "@/hooks/use-auth"
import { useProfile } from "@/hooks/use-profile"
import { useBookmarks } from "@/hooks/use-bookmarks"
import { useDailyLimitContext } from "@/components/providers/daily-limit-provider"
import { useContactReveal, type RevealedContact } from "@/hooks/use-contact-reveal"
import { useRevealedIds } from "@/hooks/use-revealed-ids"
import { LoadingState } from "@/components/loading-state"
import { Button } from "@/components/ui/button"
import { ProfileEditForm } from "@/components/profile-edit-form"
import { SettingsPage } from "@/components/settings-page"
import { PrivacyPage } from "@/components/privacy-page"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog"
import { toast } from "sonner"

type SubPage = "main" | "editProfile" | "notifications" | "settings" | "privacy" | "savedRoommates"

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
        <div className="flex items-center px-6 pt-12 pb-4 border-b border-border/50">
          <div className="w-10 shrink-0 flex items-center">
            <button onClick={onBack} className="p-2 -ml-2 rounded-full hover:bg-muted/50 transition-colors" aria-label="뒤로 가기">
              <ChevronLeft className="size-5 text-foreground" />
            </button>
          </div>
          <h1 className="flex-1 text-center text-lg font-semibold text-foreground">{title}</h1>
          <div className="w-10 shrink-0" />
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
        <div className="flex items-center px-6 pt-12 pb-4 border-b border-border/50">
          <div className="w-10 shrink-0 flex items-center">
            <button onClick={onBack} className="p-2 -ml-2 rounded-full hover:bg-muted/50 transition-colors" aria-label="뒤로 가기">
              <ChevronLeft className="size-5 text-foreground" />
            </button>
          </div>
          <h1 className="flex-1 text-center text-lg font-semibold text-foreground">내가 찜한 룸메이트</h1>
          <div className="w-10 shrink-0" />
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
}

export function ProfileView({ onLogout }: ProfileViewProps) {
  const router = useRouter()
  const { user, signOut } = useAuth()
  const { profile: profileData, loading: profileLoading, error: profileError, refetch: refetchProfile } = useProfile()
  const { bookmarks: savedProfiles } = useBookmarks()
  const { remaining: dailyRevealsRemaining } = useDailyLimitContext()
  const { reveal: revealContact } = useContactReveal()
  const { revealedIds, addRevealedId } = useRevealedIds()
  const [revealedContacts, setRevealedContacts] = useState<Record<string, RevealedContact>>({})

  const [currentPage, setCurrentPage] = useState<SubPage>("main")
  const [selectedProfile, setSelectedProfile] = useState<UserProfile | null>(null)
  const [showWithdrawConfirm, setShowWithdrawConfirm] = useState(false)
  const [withdrawing, setWithdrawing] = useState(false)

  // 설정, 개인정보 보호 등 서브 페이지 진입 시 스크롤 맨 위로
  useEffect(() => {
    if (currentPage !== "main") {
      window.scrollTo(0, 0)
    }
  }, [currentPage])

  const profile = profileData ?? null
  const googleAvatarUrl =
    (user?.user_metadata?.avatar_url as string | undefined) ??
    (user?.user_metadata?.picture as string | undefined)
  const currentUserAvatarUrl = profile?.avatarUrl ?? googleAvatarUrl ?? "/placeholder.svg"
  const lifestyleTags = profile ? getLifestyleTags(profile) : []
  const handleLogout = onLogout ?? signOut
  const handleWithdrawConfirm = async () => {
    setWithdrawing(true)
    try {
      const res = await fetch("/api/account/delete", { method: "POST" })
      const json = await res.json().catch(() => ({}))
      if (!res.ok) {
        toast.error("탈퇴에 실패했어요.", { description: (json.error as string) ?? "다시 시도해 주세요." })
        setShowWithdrawConfirm(false)
        return
      }
      setShowWithdrawConfirm(false)
      toast.success("회원 탈퇴가 완료되었어요.")
      signOut("/login?message=withdrawn")
    } catch {
      toast.error("탈퇴 처리 중 오류가 발생했어요.")
      setShowWithdrawConfirm(false)
    } finally {
      setWithdrawing(false)
    }
  }
  const handleRevealContact = async (p: UserProfile): Promise<boolean> => {
    const postId = String(p.id)
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
  const isProfileRevealed = (profileId: number | string) => revealedIds.has(String(profileId))
  const majorCategoryLabel = profile ? getMajorCategoryLabel(profile.majorCategory) : ""

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
            onRevealContact={handleRevealContact}
            isRevealed={isProfileRevealed(selectedProfile.id)}
            revealedContact={revealedContacts[String(selectedProfile.id)]}
          />
        </motion.div>
      </AnimatePresence>
    )
  }

  if (profileLoading && !profile) {
    return (
      <div className="min-h-screen pb-24 bg-background">
        <LoadingState message="프로필을 불러오는 중이에요" />
      </div>
    )
  }

  if (profileError) {
    return (
      <div className="min-h-screen pb-24 bg-background flex flex-col items-center justify-center px-6 py-16">
        <div className="max-w-2xl mx-auto flex flex-col items-center text-center">
          <div className="size-20 rounded-full bg-destructive/10 flex items-center justify-center mb-6">
            <AlertCircle className="size-10 text-destructive" />
          </div>
          <h3 className="text-lg font-semibold text-foreground mb-2">프로필을 불러올 수 없어요</h3>
          <p className="text-sm text-muted-foreground mb-6 max-w-[320px] leading-relaxed">
            네트워크나 일시적인 오류일 수 있어요. 아래 버튼으로 다시 시도해 보세요.
          </p>
          <Button onClick={() => void refetchProfile()} variant="secondary" className="rounded-full px-6" size="lg">
            <RefreshCw className="size-4 mr-2" />
            다시 시도
          </Button>
        </div>
      </div>
    )
  }

  if (!profileLoading && !profile) {
    return (
      <div className="min-h-screen pb-24 bg-background">
        <LoadingState message="확인 중이에요" />
      </div>
    )
  }

  if (!profile) return null

  if (currentPage === "editProfile") {
    return (
      <ProfileEditForm
        profile={profile}
        onSaved={() => {
          void refetchProfile();
          setCurrentPage("main");
        }}
        onCancel={handleBack}
      />
    );
  }
  if (currentPage === "notifications") return <PlaceholderPage title="알림 설정" onBack={handleBack} />
  if (currentPage === "settings") return <SettingsPage onBack={handleBack} onOpenPrivacy={() => setCurrentPage("privacy")} onWithdrawSuccess={() => signOut("/login?message=withdrawn")} />
  if (currentPage === "privacy") return <PrivacyPage onBack={handleBack} />
  if (currentPage === "savedRoommates") return <SavedRoommatesPage onBack={handleBack} savedProfiles={savedProfiles} onViewProfile={handleViewSavedProfile} />

  return (
    <div className="min-h-screen pb-24 bg-background">
      <div className="bg-gradient-to-br from-primary/10 via-primary/5 to-background px-6 pt-12 pb-6">
        <div className="max-w-2xl mx-auto lg:max-w-4xl">
        <div className="flex flex-col items-center text-center">
          <Avatar className="size-24 border-4 border-card shadow-lg">
            <AvatarImage src={currentUserAvatarUrl} alt={profile.name} />
            <AvatarFallback className="bg-muted text-foreground text-xl font-semibold">{profile.name.slice(0, 2).toUpperCase()}</AvatarFallback>
          </Avatar>
          <h2 className="text-lg font-bold text-foreground mt-4">{profile.name}</h2>
          <div className="flex items-center justify-center gap-1.5 text-muted-foreground text-sm mt-3">
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
                <span className="text-sm text-muted-foreground">카카오톡 ID</span>
                <span className="text-sm font-medium text-foreground">{profile.kakaoId}</span>
              </div>
              <div className="flex items-center justify-between py-2">
                <span className="text-sm text-muted-foreground">기타 연락처</span>
                <span className="text-sm font-medium text-foreground">{profile.otherContact || "—"}</span>
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
            <MenuItem icon={<Info className="size-5" />} label="서비스 소개" onClick={() => router.push("/about")} />
            <div className="h-px bg-border/50 mx-4" />
            <MenuItem icon={<Settings className="size-5" />} label="설정" onClick={() => setCurrentPage("settings")} />
            <div className="h-px bg-border/50 mx-4" />
            <MenuItem icon={<Shield className="size-5" />} label="개인정보 보호" onClick={() => setCurrentPage("privacy")} />
            <div className="h-px bg-border/50 mx-4" />
            <MenuItem icon={<HelpCircle className="size-5" />} label="도움말 및 지원" onClick={() => window.open(SUPPORT_KAKAO_OPEN_CHAT_URL, "_blank", "noopener,noreferrer")} />
          </div>
          <button onClick={() => void handleLogout()} className="w-full flex items-center justify-center gap-2 h-14 text-destructive hover:bg-destructive/5 rounded-2xl transition-colors border border-border/50 bg-card">
            <LogOut className="size-5" />
            <span className="text-sm font-medium">로그아웃</span>
          </button>
          <button
            onClick={() => setShowWithdrawConfirm(true)}
            className="w-full flex items-center justify-center gap-2 h-14 text-foreground hover:bg-muted/50 rounded-2xl transition-colors border border-border/50 bg-card mt-2"
          >
            <UserX className="size-5" />
            <span className="text-sm font-medium">회원 탈퇴</span>
          </button>
        </div>
      </main>

      <AlertDialog open={showWithdrawConfirm} onOpenChange={setShowWithdrawConfirm}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>회원 탈퇴</AlertDialogTitle>
            <AlertDialogDescription>
              탈퇴 시 프로필, 매칭 게시글, 찜 목록, 연락처 조회 기록 등 모든 데이터가 삭제되며 복구할 수 없습니다. 정말 탈퇴하시겠습니까?
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={withdrawing}>취소</AlertDialogCancel>
            <AlertDialogAction
              onClick={(e) => {
                e.preventDefault()
                void handleWithdrawConfirm()
              }}
              disabled={withdrawing}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              {withdrawing ? "처리 중…" : "탈퇴하기"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}
