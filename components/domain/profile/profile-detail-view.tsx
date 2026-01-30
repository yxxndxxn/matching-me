"use client"

import { useState } from "react"
import { motion, AnimatePresence } from "framer-motion"
import {
  ArrowLeft,
  Phone,
  Copy,
  MessageCircle,
  MapPin,
  GraduationCap,
  Sparkles,
  User,
  Sun,
  Moon,
  Volume2,
  Eye,
  BookOpen,
} from "lucide-react"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
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
import { cn } from "@/lib/utils/cn"
import { toast } from "sonner"
import type { UserProfile } from "@/lib/types"
import { getLifestyleTags, getMajorCategoryLabel, getDormitoryLabel } from "@/lib/types"

interface ProfileDetailViewProps {
  profile: UserProfile
  onBack: () => void
  dailyRevealsRemaining?: number
  maxDailyReveals?: number
  onRevealContact?: (profile: UserProfile) => void
  isRevealed?: boolean
}

function CircularProgress({ value, size = 64 }: { value: number; size?: number }) {
  const strokeWidth = 3
  const radius = (size - strokeWidth) / 2
  const circumference = radius * 2 * Math.PI
  const offset = circumference - (value / 100) * circumference
  const gradientId = `detail-progress-gradient-${value}`

  return (
    <div className="relative" style={{ width: size, height: size }}>
      <svg className="transform -rotate-90" width={size} height={size}>
        <defs>
          <linearGradient id={gradientId} x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="rgb(129, 140, 248)" />
            <stop offset="100%" stopColor="rgb(99, 102, 241)" />
          </linearGradient>
        </defs>
        <circle cx={size / 2} cy={size / 2} r={radius} strokeWidth={strokeWidth} className="fill-none stroke-muted/30" />
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          strokeWidth={strokeWidth}
          strokeDasharray={circumference}
          strokeDashoffset={offset}
          strokeLinecap="round"
          stroke={`url(#${gradientId})`}
          className="fill-none transition-all duration-700 ease-out"
        />
      </svg>
      <div className="absolute inset-0 flex items-center justify-center">
        <span className="text-base font-bold text-indigo-600 dark:text-indigo-400">{value}%</span>
      </div>
    </div>
  )
}

export function ProfileDetailView({
  profile,
  onBack,
  dailyRevealsRemaining = 3,
  maxDailyReveals = 3,
  onRevealContact,
  isRevealed = false,
}: ProfileDetailViewProps) {
  const [contactRevealed, setContactRevealed] = useState(isRevealed)
  const [showConfirmDialog, setShowConfirmDialog] = useState(false)
  const lifestyleTags = getLifestyleTags(profile)
  const majorCategoryLabel = getMajorCategoryLabel(profile.majorCategory)

  const getInitials = (name: string) => name.slice(0, 2).toUpperCase()
  const maskPhone = (phoneNumber: string) => {
    const parts = phoneNumber.split("-")
    if (parts.length === 3) return `${parts[0]}-****-${parts[2]}`
    return phoneNumber.slice(0, 3) + "****" + phoneNumber.slice(-4)
  }
  const maskKakaoId = (id: string) => (id.length <= 4 ? "****" : id.slice(0, 2) + "****" + id.slice(-2))

  const handleRevealClick = () => {
    if (dailyRevealsRemaining === 0) {
      toast.error("오늘의 연락처 공개 횟수를 모두 사용했습니다.", { description: "내일 다시 시도해주세요." })
      return
    }
    setShowConfirmDialog(true)
  }
  const handleConfirmReveal = () => {
    setShowConfirmDialog(false)
    setContactRevealed(true)
    onRevealContact?.(profile)
    toast.success("연락처가 공개되었습니다!", { description: "마이페이지 찜 목록에서 다시 확인할 수 있어요." })
  }
  const handleCopy = async (text: string, label: string) => {
    await navigator.clipboard.writeText(text)
    toast.success(`${label} 복사 완료!`, { description: text, duration: 3000 })
    setTimeout(() => setContactRevealed(false), 2000)
  }

  return (
    <div className="min-h-screen bg-background pb-32">
      <header className="sticky top-0 z-50 bg-background/80 backdrop-blur-lg border-b border-border/50">
        <div className="w-full px-6">
          <div className="max-w-2xl mx-auto lg:max-w-4xl">
          <div className="flex items-center gap-3 h-14">
            <button onClick={onBack} className="flex items-center justify-center size-10 -ml-2 rounded-full hover:bg-secondary transition-colors">
              <ArrowLeft className="size-5 text-foreground" />
              <span className="sr-only">뒤로 가기</span>
            </button>
            <h1 className="font-semibold text-foreground">프로필</h1>
          </div>
          </div>
        </div>
      </header>

      <section className="pt-8 pb-6">
        <div className="w-full px-6">
          <div className="max-w-2xl mx-auto lg:max-w-4xl">
        <div className="flex flex-col items-center text-center">
          <Avatar className="size-28 border-4 border-indigo-500/20 shadow-lg">
            <AvatarImage src={profile.avatarUrl || "/placeholder.svg"} alt={profile.name} />
            <AvatarFallback className="bg-secondary text-secondary-foreground text-2xl font-semibold">{getInitials(profile.name)}</AvatarFallback>
          </Avatar>
          <h2 className="mt-5 text-xl font-bold text-foreground">{profile.name}</h2>
          <div className="flex items-center gap-1.5 mt-2 text-sm text-muted-foreground">
            <User className="size-4" />
            <span>{profile.gender === "male" ? "남성" : "여성"}</span>
          </div>
          <div className="flex items-center gap-1.5 mt-1 text-sm text-muted-foreground">
            <GraduationCap className="size-4" />
            <span>{getDormitoryLabel(profile.dormitory)} · {profile.grade}</span>
          </div>
          <div className="flex items-center gap-1.5 mt-1 text-sm text-muted-foreground">
            <BookOpen className="size-4" />
            <span>{majorCategoryLabel} 계열</span>
          </div>
          <div className="flex items-center gap-1.5 mt-1 text-sm text-muted-foreground">
            <MapPin className="size-4" />
            <span>{getDormitoryLabel(profile.dormitory)}</span>
          </div>
          <div className="mt-5 flex flex-col items-center gap-2">
            <CircularProgress value={profile.matchScore || 0} />
            <span className="text-xs text-muted-foreground font-medium">매칭률</span>
          </div>
          <div className="flex flex-wrap justify-center gap-2 mt-5">
            {lifestyleTags.map((tag) => (
              <span key={tag} className="inline-flex items-center px-3.5 py-1.5 rounded-full text-xs font-medium bg-secondary text-secondary-foreground">
                {tag}
              </span>
            ))}
          </div>
          </div>
          </div>
        </div>
      </section>

      <section className="py-4">
        <div className="w-full px-6">
          <div className="max-w-2xl mx-auto lg:max-w-4xl">
            <h3 className="text-sm font-semibold text-foreground mb-4">라이프스타일 지표</h3>
          <div className="bg-card rounded-2xl border border-border/50 p-5">
          <div className="grid grid-cols-2 gap-4">
            <div className="flex items-center gap-3 p-4 bg-muted/50 rounded-xl">
              {profile.chronotype === "morning" ? <Sun className="size-5 text-amber-500" /> : <Moon className="size-5 text-indigo-500" />}
              <div>
                <p className="text-[10px] text-muted-foreground uppercase tracking-wide">생활 패턴</p>
                <p className="text-sm font-medium text-foreground">{profile.chronotype === "morning" ? "아침형" : "밤형"}</p>
              </div>
            </div>
            <div className="flex items-center gap-3 p-4 bg-muted/50 rounded-xl">
              <Sparkles className="size-5 text-pink-500" />
              <div>
                <p className="text-[10px] text-muted-foreground uppercase tracking-wide">청결도</p>
                <p className="text-sm font-medium text-foreground">{profile.cleanliness}/5</p>
              </div>
            </div>
            <div className="flex items-center gap-3 p-4 bg-muted/50 rounded-xl">
              <Volume2 className="size-5 text-blue-500" />
              <div>
                <p className="text-[10px] text-muted-foreground uppercase tracking-wide">소음 민감도</p>
                <p className="text-sm font-medium text-foreground">{profile.noiseSensitivity}/5</p>
              </div>
            </div>
          </div>
          </div>
          </div>
        </div>
      </section>

      <section className="py-4">
        <div className="w-full px-6">
          <div className="max-w-2xl mx-auto lg:max-w-4xl">
            <div className="flex items-center gap-2 mb-4">
              <Sparkles className="size-4 text-primary" />
              <h3 className="text-sm font-semibold text-foreground">자기소개</h3>
            </div>
            <div className="bg-card rounded-2xl border border-border/50 p-5">
              <p className="text-sm text-muted-foreground leading-relaxed">{profile.introduction}</p>
            </div>
          </div>
        </div>
      </section>

      <div className="fixed bottom-0 left-0 right-0 lg:left-64 z-[60] bg-background/95 backdrop-blur-lg border-t border-border/50">
        <div className="max-w-2xl mx-auto lg:max-w-4xl px-6">
          <AnimatePresence mode="wait">
            {!contactRevealed ? (
              <motion.div key="reveal-button" initial={{ opacity: 1 }} exit={{ opacity: 0, y: 20 }} className="py-4">
                <Button
                  onClick={handleRevealClick}
                  disabled={dailyRevealsRemaining === 0}
                  className={cn("w-full h-14 rounded-2xl text-base font-semibold gap-2 transition-all duration-300", "bg-gradient-to-r from-indigo-500 to-indigo-600 hover:from-indigo-600 hover:to-indigo-700 text-white")}
                >
                  <Eye className="size-5" />
                  연락처 확인하기 ({dailyRevealsRemaining}회 남음)
                </Button>
                <p className="text-center text-xs text-muted-foreground mt-2">
                  오늘 남은 연락처 공개: {dailyRevealsRemaining}/{maxDailyReveals}
                </p>
              </motion.div>
            ) : (
              <motion.div key="contact-card" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.3 }} className="py-4">
                <div className="bg-card rounded-2xl border border-indigo-500/20 p-5 space-y-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="flex items-center justify-center size-11 rounded-full bg-indigo-500/10">
                        <Phone className="size-5 text-indigo-500" />
                      </div>
                      <div>
                        <p className="text-xs text-muted-foreground">전화번호</p>
                        <p className="text-sm font-medium text-foreground font-mono tracking-wide">{maskPhone(profile.phone)}</p>
                      </div>
                    </div>
                    <Button variant="default" size="sm" onClick={() => handleCopy(profile.phone, "전화번호")} className="h-10 px-4 rounded-xl text-xs font-semibold gap-2 bg-indigo-500 hover:bg-indigo-600">
                      <Copy className="size-4" /> 복사
                    </Button>
                  </div>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="flex items-center justify-center size-11 rounded-full bg-amber-500/10">
                        <MessageCircle className="size-5 text-amber-500" />
                      </div>
                      <div>
                        <p className="text-xs text-muted-foreground">카카오톡 ID</p>
                        <p className="text-sm font-medium text-foreground font-mono tracking-wide">{maskKakaoId(profile.kakaoId)}</p>
                      </div>
                    </div>
                    <Button variant="default" size="sm" onClick={() => handleCopy(profile.kakaoId, "카카오톡 ID")} className="h-10 px-4 rounded-xl text-xs font-semibold gap-2 bg-indigo-500 hover:bg-indigo-600">
                      <Copy className="size-4" /> 복사
                    </Button>
                  </div>
                  <p className="text-center text-xs text-muted-foreground pt-3 border-t border-border/30">연락 시 예의를 갖춰 주세요!</p>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>

      <AlertDialog open={showConfirmDialog} onOpenChange={setShowConfirmDialog}>
        <AlertDialogContent className="max-w-sm lg:left-[calc(50%+8rem)]">
          <AlertDialogHeader>
            <AlertDialogTitle>연락처를 확인할까요?</AlertDialogTitle>
            <AlertDialogDescription>
              오늘의 연락처 공개 횟수 중 1회를 사용하여 {profile.name}님의 연락처를 확인합니다.
              <br />
              <span className="font-medium text-foreground">남은 횟수: {dailyRevealsRemaining}/{maxDailyReveals}</span>
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>취소</AlertDialogCancel>
            <AlertDialogAction onClick={handleConfirmReveal} className="bg-indigo-500 hover:bg-indigo-600">확인하기</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}
