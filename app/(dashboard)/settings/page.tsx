"use client"

import { useRouter } from "next/navigation"
import { SettingsPage } from "@/components/settings-page"
import { useAuth } from "@/hooks/use-auth"

export default function SettingsRoutePage() {
  const router = useRouter()
  const { signOut } = useAuth()

  return (
    <SettingsPage
      onBack={() => router.back()}
      onOpenPrivacy={() => router.push("/settings/privacy")}
      onWithdrawSuccess={() => signOut("/login?message=withdrawn")}
    />
  )
}
