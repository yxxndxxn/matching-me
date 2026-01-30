"use client"

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Heart, X, MessageCircle, MapPin, GraduationCap } from "lucide-react"

interface ProfileCardProps {
  name: string
  age: number
  major: string
  university: string
  location: string
  bio: string
  traits: string[]
  matchScore: number
  imageUrl: string
  onLike?: () => void
  onPass?: () => void
  onMessage?: () => void
}

export function ProfileCard({
  name,
  age,
  major,
  university,
  location,
  bio,
  traits,
  matchScore,
  imageUrl,
  onLike,
  onPass,
  onMessage,
}: ProfileCardProps) {
  return (
    <Card className="overflow-hidden border-0 shadow-lg">
      <div className="relative">
        <div className="aspect-[4/3] bg-secondary overflow-hidden">
          <img
            src={imageUrl || "/placeholder.svg"}
            alt={`${name}'s profile`}
            className="w-full h-full object-cover"
          />
        </div>
        <div className="absolute top-4 right-4 bg-primary text-primary-foreground px-3 py-1.5 rounded-full text-sm font-semibold">
          {matchScore}% Match
        </div>
      </div>
      <CardContent className="p-6 space-y-4">
        <div className="flex items-start justify-between">
          <div>
            <h3 className="text-xl font-semibold text-foreground">
              {name}, {age}
            </h3>
            <div className="flex items-center gap-1.5 text-muted-foreground text-sm mt-1">
              <GraduationCap className="size-4" />
              <span>{major}</span>
            </div>
            <div className="flex items-center gap-1.5 text-muted-foreground text-sm mt-0.5">
              <MapPin className="size-4" />
              <span>{university} • {location}</span>
            </div>
          </div>
          <Avatar className="size-12 border-2 border-primary/20">
            <AvatarImage src={imageUrl || "/placeholder.svg"} alt={name} />
            <AvatarFallback className="bg-secondary text-secondary-foreground">
              {name.slice(0, 2).toUpperCase()}
            </AvatarFallback>
          </Avatar>
        </div>

        <p className="text-foreground/80 text-sm leading-relaxed">{bio}</p>

        <div className="flex flex-wrap gap-2">
          {traits.map((trait) => (
            <Badge
              key={trait}
              variant="secondary"
              className="text-xs font-medium"
            >
              {trait}
            </Badge>
          ))}
        </div>

        <div className="flex items-center gap-3 pt-2">
          <Button
            variant="outline"
            size="icon"
            className="rounded-full size-12 border-border hover:border-destructive hover:bg-destructive/10 hover:text-destructive bg-transparent"
            onClick={onPass}
          >
            <X className="size-5" />
            <span className="sr-only">Pass</span>
          </Button>
          <Button
            className="flex-1 rounded-full h-12 bg-primary hover:bg-primary/90"
            onClick={onLike}
          >
            <Heart className="size-5 mr-2" />
            Like Profile
          </Button>
          <Button
            variant="outline"
            size="icon"
            className="rounded-full size-12 border-border hover:border-accent hover:bg-accent/10 hover:text-accent bg-transparent"
            onClick={onMessage}
          >
            <MessageCircle className="size-5" />
            <span className="sr-only">Message</span>
          </Button>
        </div>
      </CardContent>
    </Card>
  )
}
