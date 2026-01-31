"use client";

// 찜 목록 페이지 (Phase 2.12): useBookmarks → SavedRoommatesPage UI

import { useBookmarks } from "@/hooks/use-bookmarks";
import { useRouter } from "next/navigation";
import { ProfileDetailView } from "@/components/domain/profile/profile-detail-view";
import { useDailyLimit } from "@/hooks/use-daily-limit";
import { useContactReveal, type RevealedContact } from "@/hooks/use-contact-reveal";
import { useRevealedIds } from "@/hooks/use-revealed-ids";
import { useState } from "react";
import type { UserProfile } from "@/lib/types";
import { getDormitoryLabel, getMajorCategoryLabel } from "@/lib/types";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";

export default function BookmarksPage() {
  const router = useRouter();
  const { bookmarks, loading } = useBookmarks();
  const { remaining: dailyRevealsRemaining } = useDailyLimit();
  const { reveal } = useContactReveal();
  const { revealedIds, addRevealedId } = useRevealedIds();
  const [selectedProfile, setSelectedProfile] = useState<UserProfile | null>(null);
  const [revealedContacts, setRevealedContacts] = useState<Record<string, RevealedContact>>({});

  const handleReveal = async (p: UserProfile) => {
    const postId = String(p.id);
    const { success, contact } = await reveal(postId);
    if (success) {
      addRevealedId(postId);
      if (contact) setRevealedContacts((prev) => ({ ...prev, [postId]: contact }));
    }
  };
  const isRevealed = (id: number | string) => revealedIds.has(String(id));

  if (selectedProfile) {
    return (
      <div className="min-h-screen pb-24 bg-background">
        <ProfileDetailView
          profile={selectedProfile}
          onBack={() => setSelectedProfile(null)}
          dailyRevealsRemaining={dailyRevealsRemaining}
          maxDailyReveals={3}
          onRevealContact={handleReveal}
          isRevealed={isRevealed(selectedProfile.id)}
          revealedContact={revealedContacts[String(selectedProfile.id)]}
        />
      </div>
    );
  }

  return (
    <div className="min-h-screen pb-24 bg-background">
      <div className="max-w-2xl mx-auto lg:max-w-4xl">
        <div className="flex items-center gap-3 px-6 pt-12 pb-4 border-b border-border/50">
          <button
            type="button"
            onClick={() => router.back()}
            className="p-2 -ml-2 rounded-full hover:bg-muted/50 transition-colors"
          >
            <ChevronLeft className="size-5 text-foreground" />
          </button>
          <h1 className="text-lg font-semibold text-foreground">내가 찜한 룸메이트</h1>
        </div>
        <div className="px-6 py-4 space-y-3">
          {loading ? (
            <Skeleton className="h-24 rounded-2xl" />
          ) : bookmarks.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-20">
              <p className="text-muted-foreground">아직 찜한 룸메이트가 없어요.</p>
              <p className="text-sm text-muted-foreground mt-1">메인 피드에서 마음에 드는 프로필을 찜해보세요.</p>
            </div>
          ) : (
            bookmarks.map((profile) => (
              <button
                key={profile.id}
                type="button"
                onClick={() => setSelectedProfile(profile)}
                className="w-full bg-card rounded-2xl p-5 border border-border/50 hover:border-primary/30 hover:shadow-md transition-all duration-200 text-left"
              >
                <div className="flex items-center gap-4">
                  <Avatar className="size-14 border-2 border-primary/20">
                    <AvatarImage src={profile.avatarUrl || "/placeholder.svg"} alt={profile.name} />
                    <AvatarFallback className="bg-secondary text-secondary-foreground font-medium">
                      {profile.name.slice(0, 2).toUpperCase()}
                    </AvatarFallback>
                  </Avatar>
                  <div className="flex-1 min-w-0">
                    <h3 className="font-semibold text-foreground truncate">{profile.name}</h3>
                    <p className="text-xs text-muted-foreground truncate">
                      {getDormitoryLabel(profile.dormitory)} · {getMajorCategoryLabel(profile.majorCategory)} · {profile.grade}
                    </p>
                    {profile.matchScore != null && (
                      <span className="text-xs text-indigo-500 font-medium">{profile.matchScore}% 매칭</span>
                    )}
                  </div>
                  <ChevronRight className="size-5 text-muted-foreground shrink-0" />
                </div>
              </button>
            ))
          )}
        </div>
      </div>
    </div>
  );
}
