"use client"

import { Heart } from "lucide-react"
import { cn } from "@/lib/utils"

interface PostCardProps {
  title: string
  description: string
  timeAgo: string
  author: string
  imageUrl?: string
  isLiked?: boolean
  onLike?: () => void
}

export function PostCard({
  title,
  description,
  timeAgo,
  author,
  imageUrl,
  isLiked = false,
  onLike,
}: PostCardProps) {
  return (
    <article className="bg-card rounded-2xl p-4 border border-border/50">
      <div className="flex gap-4">
        <div className="flex-1 min-w-0">
          <h3 className="font-semibold text-foreground text-[15px] leading-tight mb-2">
            {title}
          </h3>
          <p className="text-sm text-muted-foreground line-clamp-2 leading-relaxed mb-3">
            {description}
          </p>
          <p className="text-xs text-muted-foreground/70">
            {timeAgo} | {author}
          </p>
        </div>
        <div className="flex flex-col items-end gap-2 shrink-0">
          <div className="w-20 h-20 bg-muted rounded-xl overflow-hidden">
            {imageUrl ? (
              <img
                src={imageUrl || "/placeholder.svg"}
                alt=""
                className="w-full h-full object-cover"
                crossOrigin="anonymous"
              />
            ) : (
              <div className="w-full h-full bg-muted" />
            )}
          </div>
          <button
            onClick={onLike}
            className={cn(
              "p-2 rounded-full transition-colors",
              isLiked
                ? "text-primary"
                : "text-muted-foreground/50 hover:text-primary/70"
            )}
          >
            <Heart
              className="size-5"
              fill={isLiked ? "currentColor" : "none"}
            />
            <span className="sr-only">{isLiked ? "Unlike" : "Like"}</span>
          </button>
        </div>
      </div>
    </article>
  )
}
