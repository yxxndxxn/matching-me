"use client"

import { Button } from "@/components/ui/button"

interface LoginScreenProps {
  onLogin: () => void
}

export function LoginScreen({ onLogin }: LoginScreenProps) {
  return (
    <div className="min-h-screen bg-gradient-to-b from-background to-card flex flex-col items-center justify-center px-8">
      <div className="flex flex-col items-center gap-6 mb-16">
        <div className="w-24 h-24 rounded-3xl bg-gradient-to-br from-primary/20 to-primary/5 flex items-center justify-center shadow-lg border border-primary/10">
          <svg viewBox="0 0 24 24" fill="none" className="w-12 h-12 text-primary" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M19 14c1.49-1.46 3-3.21 3-5.5A5.5 5.5 0 0 0 16.5 3c-1.76 0-3 .5-4.5 2-1.5-1.5-2.74-2-4.5-2A5.5 5.5 0 0 0 2 8.5c0 2.3 1.5 4.05 3 5.5l7 7Z" />
            <path d="M12 5 9.04 7.96a2.17 2.17 0 0 0 0 3.08c.82.82 2.13.85 3 .07l2.07-1.9a2.82 2.82 0 0 1 3.79 0l2.96 2.66" />
            <path d="m18 15-2-2" />
            <path d="m15 18-2-2" />
          </svg>
        </div>
        <div className="text-center">
          <h1 className="text-3xl font-bold text-foreground tracking-tight">매칭미?</h1>
          <p className="text-muted-foreground mt-2 text-base">나에게 딱 맞는 룸메이트를 찾아보세요</p>
        </div>
      </div>
      <div className="w-full max-w-sm space-y-4">
        <Button onClick={onLogin} variant="outline" className="w-full h-14 text-base font-medium border-border hover:bg-secondary/50 gap-3 bg-card shadow-sm rounded-2xl bg-transparent">
          <svg viewBox="0 0 24 24" className="w-5 h-5">
            <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
            <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
            <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" />
            <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
          </svg>
          Google로 계속하기
        </Button>
        <p className="text-center text-xs text-muted-foreground px-4">계속 진행하면 서비스 이용약관 및 개인정보 처리방침에 동의하게 됩니다</p>
      </div>
      <div className="absolute bottom-8 text-center">
        <p className="text-xs text-muted-foreground/60">남도학숙 재사생생을 위한 룸메이트 매칭 서비스</p>
      </div>
    </div>
  )
}
