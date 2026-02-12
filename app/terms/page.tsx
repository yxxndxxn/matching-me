"use client"

import { useRouter } from "next/navigation"
import { TermsPage } from "@/components/terms-page"

/** 공개 서비스 이용약관 (비로그인 사용자도 접근 가능) */
export default function PublicTermsPage() {
  const router = useRouter()
  return <TermsPage onBack={() => router.back()} />
}
