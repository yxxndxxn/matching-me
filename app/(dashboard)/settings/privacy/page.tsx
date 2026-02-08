"use client"

import { useRouter } from "next/navigation"
import { PrivacyPage } from "@/components/privacy-page"

export default function SettingsPrivacyPage() {
  const router = useRouter()
  return <PrivacyPage onBack={() => router.back()} />
}
