"use client"

import { useState } from "react"
import { BottomNav } from "@/components/bottom-nav"
import { HomeView } from "@/components/home-view"
import { ProfileView } from "@/components/profile-view"
import { Onboarding } from "@/components/onboarding"
import { LoginScreen } from "@/components/login-screen"
import type { UserProfile } from "@/lib/types"

type AppState = "login" | "onboarding" | "main"

export default function Home() {
  const [activeTab, setActiveTab] = useState<"home" | "profile">("home")
  const [appState, setAppState] = useState<AppState>("login")
  const [savedProfiles, setSavedProfiles] = useState<UserProfile[]>([])
  const [revealedProfiles, setRevealedProfiles] = useState<Set<number>>(new Set())
  const [dailyRevealsRemaining, setDailyRevealsRemaining] = useState(3)

  const handleLogout = () => {
    setAppState("login")
    setActiveTab("home")
  }

  const handleSaveProfile = (profile: UserProfile) => {
    if (!savedProfiles.find(p => p.id === profile.id)) {
      setSavedProfiles([...savedProfiles, profile])
    }
  }

  const handleUnsaveProfile = (profileId: number) => {
    setSavedProfiles(savedProfiles.filter(p => p.id !== profileId))
  }

  const handleRevealContact = (profile: UserProfile) => {
    setRevealedProfiles(prev => new Set([...prev, profile.id]))
    setDailyRevealsRemaining(prev => Math.max(0, prev - 1))
  }

  const isProfileSaved = (profileId: number) => savedProfiles.some(p => p.id === profileId)
  const isProfileRevealed = (profileId: number) => revealedProfiles.has(profileId)

  if (appState === "login") {
    return (
      <main className="min-h-screen bg-background flex items-center justify-center px-4">
        <div className="w-full max-w-md">
          <LoginScreen onLogin={() => setAppState("onboarding")} />
        </div>
      </main>
    )
  }

  if (appState === "onboarding") {
    return (
      <main className="min-h-screen bg-background flex items-center justify-center">
        <div className="w-full max-w-md md:max-w-lg lg:max-w-xl mx-auto">
          <Onboarding onComplete={() => setAppState("main")} />
        </div>
      </main>
    )
  }

  return (
    <main className="min-h-screen bg-background">
      {/* Desktop Sidebar - Hidden on Mobile */}
      <aside className="hidden lg:flex fixed left-0 top-0 bottom-0 w-64 bg-card border-r border-border flex-col z-40">
        <button 
          onClick={() => setActiveTab("home")} 
          className="w-full p-6 border-b border-border text-left hover:bg-muted/30 transition-colors"
        >
          <h1 className="text-xl font-bold text-primary">Matching Me?</h1>
          <p className="text-xs text-muted-foreground mt-1">나와 맞는 룸메이트를 찾아보세요</p>
        </button>
        <nav className="flex-1 p-4 space-y-1">
          <button
            onClick={() => setActiveTab("home")}
            className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-colors ${
              activeTab === "home"
                ? "bg-primary/10 text-primary"
                : "text-muted-foreground hover:bg-muted/50 hover:text-foreground"
            }`}
          >
            <svg className="size-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-5.197-5.197m0 0A7.5 7.5 0 105.196 5.196a7.5 7.5 0 0010.607 10.607z" />
            </svg>
            룸메찾기
          </button>
          <button
            onClick={() => setActiveTab("profile")}
            className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-colors ${
              activeTab === "profile"
                ? "bg-primary/10 text-primary"
                : "text-muted-foreground hover:bg-muted/50 hover:text-foreground"
            }`}
          >
            <svg className="size-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 6a3.75 3.75 0 11-7.5 0 3.75 3.75 0 017.5 0zM4.501 20.118a7.5 7.5 0 0114.998 0A17.933 17.933 0 0112 21.75c-2.676 0-5.216-.584-7.499-1.632z" />
            </svg>
            마이페이지
          </button>
        </nav>
        <div className="p-4 border-t border-border">
          <div className="flex items-center gap-3 px-4 py-3 bg-muted/30 rounded-xl">
            <div className="size-10 rounded-full bg-primary/20 flex items-center justify-center">
              <span className="text-sm font-medium text-primary">나</span>
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-foreground truncate">내 프로필</p>
              <p className="text-xs text-muted-foreground">연락처 공개 {dailyRevealsRemaining}/3</p>
            </div>
          </div>
        </div>
      </aside>

      {/* Main Content */}
      <div className="lg:ml-64">
        <div className="max-w-2xl mx-auto lg:max-w-4xl">
          {activeTab === "home" && (
            <HomeView 
              onSaveProfile={handleSaveProfile}
              onUnsaveProfile={handleUnsaveProfile}
              onRevealContact={handleRevealContact}
              dailyRevealsRemaining={dailyRevealsRemaining}
              isProfileSaved={isProfileSaved}
              isProfileRevealed={isProfileRevealed}
            />
          )}
          {activeTab === "profile" && (
            <ProfileView 
              onLogout={handleLogout} 
              savedProfiles={savedProfiles}
              onRevealContact={handleRevealContact}
              dailyRevealsRemaining={dailyRevealsRemaining}
              isProfileRevealed={isProfileRevealed}
            />
          )}
        </div>
      </div>
      
      {/* Mobile Bottom Nav - Hidden on Desktop */}
      <div className="lg:hidden">
        <BottomNav activeTab={activeTab} onTabChange={setActiveTab} />
      </div>
    </main>
  )
}
