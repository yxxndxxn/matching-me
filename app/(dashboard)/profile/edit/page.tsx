"use client"

import { ProfileEditForm } from "@/components/profile-edit-form"
import { useProfile } from "@/hooks/use-profile"
import { useRouter } from "next/navigation"
import { Skeleton } from "@/components/ui/skeleton"

export default function ProfileEditPage() {
  const router = useRouter()
  const { profile, loading, error } = useProfile()

  if (loading || !profile) {
    return (
      <div className="min-h-screen pb-24 bg-background px-6 pt-12">
        <div className="max-w-2xl mx-auto lg:max-w-4xl space-y-4">
          <Skeleton className="h-12 w-48" />
          <Skeleton className="h-64 w-full rounded-xl" />
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="min-h-screen pb-24 bg-background px-6 pt-12">
        <div className="max-w-2xl mx-auto lg:max-w-4xl text-center text-muted-foreground">
          <p>프로필을 불러올 수 없습니다.</p>
          <button type="button" onClick={() => router.push("/profile")} className="mt-2 text-primary underline">
            마이페이지로 돌아가기
          </button>
        </div>
      </div>
    )
  }

  return (
    <ProfileEditForm
      profile={profile}
      onSaved={() => router.push("/profile")}
      onCancel={() => router.push("/profile")}
    />
  )
}
