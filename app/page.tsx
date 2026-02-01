"use client"

// 루트 "/" : 미로그인 시 랜딩 페이지, 로그인 시 미들웨어가 /dashboard로 리다이렉트

import { LandingView } from "@/components/landing-view"

export default function Home() {
  return <LandingView />
}
