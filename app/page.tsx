"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Onboarding } from "@/components/onboarding"
import { LoginScreen } from "@/components/login-screen"

type AppState = "login" | "onboarding"

export default function Home() {
  const router = useRouter()
  const [appState, setAppState] = useState<AppState>("login")

  const handleLogin = () => {
    setAppState("onboarding")
  }

  const handleOnboardingComplete = () => {
    router.push("/feed")
  }

  if (appState === "login") {
    return (
      <main className="min-h-screen bg-background flex items-center justify-center px-4">
        <div className="w-full max-w-md">
          <LoginScreen onLogin={handleLogin} />
        </div>
      </main>
    )
  }

  return (
    <main className="min-h-screen bg-background flex items-center justify-center">
      <div className="w-full max-w-md md:max-w-lg lg:max-w-xl mx-auto">
        <Onboarding onComplete={handleOnboardingComplete} />
      </div>
    </main>
  )
}
