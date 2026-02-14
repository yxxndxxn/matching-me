"use client"

import React from "react"

import { Bookmark, Calendar, Check, ChevronRight, Sparkles } from "lucide-react"
import { cn } from "@/lib/utils/cn"
import { formatPostedAt } from "@/lib/utils/format"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import type { UserProfile } from "@/lib/types"
import { getLifestyleTags, getMajorCategoryLabel, getDormitoryLabel, getGenderLabel } from "@/lib/types"
interface CandidateCardProps {
  profile: UserProfile
  isSaved?: boolean
  onSave?: () => void
  onViewProfile?: () => void
  isAiRecommended?: boolean
}

function CircularProgress({ value, size = 56 }: { value: number; size?: number }) {
  const strokeWidth = 2.5
  const radius = (size - strokeWidth) / 2
  const circumference = radius * 2 * Math.PI
  const offset = circumference - (value / 100) * circumference
  const gradientId = `progress-gradient-${value}`

  return (
    <div className="relative" style={{ width: size, height: size }}>
      <svg className="transform -rotate-90" width={size} height={size}>
        <defs>
          <linearGradient id={gradientId} x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="rgb(129, 140, 248)" />
            <stop offset="100%" stopColor="rgb(99, 102, 241)" />
          </linearGradient>
        </defs>
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          strokeWidth={strokeWidth}
          className="fill-none stroke-muted/30"
        />
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
        <span className="text-sm font-bold text-indigo-600 dark:text-indigo-400">{value}%</span>
      </div>
    </div>
  )
}

export function CandidateCard({
  profile,
  isSaved = false,
  onSave,
  onViewProfile,
  isAiRecommended = false,
}: CandidateCardProps) {
  const getInitials = (name: string) => name.slice(0, 2).toUpperCase()
  const lifestyleTags = getLifestyleTags(profile)
  const majorCategoryLabel = getMajorCategoryLabel(profile.majorCategory)
  const dormitoryLabel = getDormitoryLabel(profile.dormitory)
  const genderLabel = getGenderLabel(profile.gender)

  const handleSave = (e: React.MouseEvent) => {
    e.stopPropagation()
    onSave?.()
  }

  return (
    <article
      className="bg-card rounded-2xl p-6 border border-border/40 shadow-sm cursor-pointer hover:border-primary/30 hover:shadow-md transition-all duration-200"
      onClick={onViewProfile}
    >
      {isAiRecommended && (
        <div className="flex items-center gap-1.5 mb-4 -mt-1">
          <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-gradient-to-r from-indigo-500/10 to-purple-500/10 border border-indigo-500/20">
            <Sparkles className="size-3.5 text-indigo-500" />
            <span className="text-[11px] font-semibold text-indigo-600 dark:text-indigo-400 uppercase tracking-wide">AI 추천</span>
          </div>
        </div>
      )}

      <div className="flex gap-5">
        <Avatar className="size-18 shrink-0 border-2 border-primary/20">
          <AvatarImage src={profile.avatarUrl || "/placeholder.svg"} alt={profile.name} />
          <AvatarFallback className="bg-secondary text-secondary-foreground font-medium text-lg">
            {getInitials(profile.name)}
          </AvatarFallback>
        </Avatar>

        <div className="flex-1 min-w-0">
          <div className="flex items-start justify-between gap-4 mb-4">
            <div className="min-w-0 space-y-1.5">
              <h3 className="font-semibold text-foreground text-base truncate">{profile.name}</h3>
              <p className="text-xs text-muted-foreground truncate">
                {majorCategoryLabel} · {dormitoryLabel} · {genderLabel}
              </p>
              <div className="flex flex-wrap items-center gap-x-2 gap-y-0.5">
                <p className="text-xs text-muted-foreground truncate">{profile.grade}</p>
                {profile.postedAt && (
                  <span className="flex items-center gap-1 text-xs text-muted-foreground">
                    <Calendar className="size-3 shrink-0" />
                    {formatPostedAt(profile.postedAt)}
                  </span>
                )}
              </div>
            </div>
            <div className="shrink-0">
              <CircularProgress value={profile.matchScore || 0} />
            </div>
          </div>

          <div className="flex flex-wrap gap-2 mb-4">
            {lifestyleTags.map((tag) => (
              <span
                key={tag}
                className="inline-flex items-center px-3 py-1.5 rounded-full text-[11px] font-medium bg-secondary/80 text-secondary-foreground"
              >
                #{tag}
              </span>
            ))}
          </div>

          <p className="text-sm text-muted-foreground line-clamp-2 leading-relaxed">
            {profile.introduction}
          </p>
        </div>
      </div>

      {isAiRecommended && profile.matchTags && profile.matchTags.length > 0 && (
        <div className="flex flex-wrap items-center gap-x-2 gap-y-2 mt-4 pt-4 border-t border-border/30">
          {profile.matchTags.map((tag) => (
            <span
              key={tag}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-[11px] font-medium bg-gradient-to-r from-indigo-500/10 to-purple-500/10 border border-indigo-500/20 text-indigo-600 dark:text-indigo-400"
            >
              <Check className="size-3 shrink-0" strokeWidth={2.5} />
              {tag}
            </span>
          ))}
        </div>
      )}

      <div className="flex items-center justify-between mt-5 pt-4 border-t border-border/30">
        <span className="flex items-center gap-1 text-xs text-muted-foreground">
          탭해서 상세보기
          <ChevronRight className="size-4" />
        </span>
        <button
          onClick={handleSave}
          className={cn(
            "flex items-center gap-2 px-5 py-2.5 rounded-full transition-all duration-200",
            isSaved ? "bg-primary/10 text-primary" : "text-muted-foreground hover:bg-secondary hover:text-foreground"
          )}
        >
          <Bookmark className="size-4" fill={isSaved ? "currentColor" : "none"} />
          <span className="text-xs font-medium">찜하기</span>
        </button>
      </div>
    </article>
  )
}
