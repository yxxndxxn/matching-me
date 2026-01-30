"use client"

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Card } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { MessageCircle } from "lucide-react"
import type { UserProfile } from "@/lib/types"

interface MatchCardProps {
  profile: UserProfile
  isNew?: boolean
  lastMessage?: string
  onClick?: () => void
}

export function MatchCard({ profile, isNew = false, lastMessage, onClick }: MatchCardProps) {
  return (
    <Card
      className="p-4 cursor-pointer hover:shadow-md transition-all duration-200 border-border/50 hover:border-primary/30"
      onClick={onClick}
    >
      <div className="flex items-center gap-4">
        <div className="relative">
          <Avatar className="size-14 border-2 border-primary/20">
            <AvatarImage src={profile.avatarUrl || "/placeholder.svg"} alt={profile.name} />
            <AvatarFallback className="bg-secondary text-secondary-foreground font-medium">
              {profile.name.slice(0, 2).toUpperCase()}
            </AvatarFallback>
          </Avatar>
          {isNew && (
            <span className="absolute -top-1 -right-1 size-4 bg-primary rounded-full border-2 border-card" />
          )}
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2">
            <h4 className="font-semibold text-foreground truncate">{profile.name}</h4>
            <Badge variant="secondary" className="text-xs shrink-0 bg-primary/10 text-primary border-0">
              {profile.matchScore}%
            </Badge>
          </div>
          <p className="text-sm text-muted-foreground truncate">
            {profile.major} · {profile.grade}
          </p>
          {lastMessage && (
            <p className="text-xs text-muted-foreground/70 truncate mt-1 flex items-center gap-1">
              <MessageCircle className="size-3" />
              {lastMessage}
            </p>
          )}
        </div>
      </div>
    </Card>
  )
}
