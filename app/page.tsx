"use client"

// 루트 "/" 는 미들웨어에서 미로그인 시 /login, 로그인 시 /dashboard 로 리다이렉트됨.
// 아래는 미들웨어를 거치지 않은 경우(예: 클라이언트 네비)를 위한 폴백.

import { useEffect } from "react"
import { useRouter } from "next/navigation"

export default function Home() {
  const router = useRouter()

  useEffect(() => {
    router.replace("/login")
  }, [router])

  return (
    <main className="min-h-screen bg-background flex items-center justify-center">
      <p className="text-sm text-muted-foreground">리다이렉트 중...</p>
    </main>
  )
}
