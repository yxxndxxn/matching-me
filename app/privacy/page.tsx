"use client"

import { useRouter } from "next/navigation"
import { PrivacyPage } from "@/components/privacy-page"

/** 공개 개인정보처리방침 (비로그인 사용자도 접근 가능) */
export default function PublicPrivacyPage() {
  const router = useRouter()
  return <PrivacyPage onBack={() => router.back()} />
}
