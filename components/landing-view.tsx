"use client"

import Image from "next/image"
import { useRouter, useSearchParams } from "next/navigation"
import { motion } from "framer-motion"
import { Suspense, useEffect } from "react"
import { Sparkles, Shield, Users, ChevronRight } from "lucide-react"
import { createClient } from "@/lib/supabase/client"
import { toast } from "sonner"
import { CandidateCard } from "@/components/domain/feed/candidate-card"
import { sampleProfiles } from "@/lib/types"
import { LoadingState } from "@/components/loading-state"
import dogImage from "@/app/assets/dog_charactor_sit.png"

const LANDING_SAMPLES = sampleProfiles.slice(0, 3).map((p, i) =>
  i === 0 ? { ...p, matchTags: ["잠버릇 일치", "비흡연자 동일"] as string[] } : p
)

const fadeUp = {
  hidden: { opacity: 0, y: 24 },
  visible: (i: number) => ({
    opacity: 1,
    y: 0,
    transition: { delay: i * 0.1, duration: 0.5 },
  }),
}

function GoogleLogo({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
      <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
      <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
      <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" />
      <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
    </svg>
  )
}

const WITHDRAWN_TOAST_ID = "withdrawal-complete"

function LandingContent() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const redirectTo = searchParams?.get("redirectTo") ?? "/dashboard"

  useEffect(() => {
    const error = searchParams?.get("error")
    const message = searchParams?.get("message")
    if (error === "auth_callback_error") {
      toast.error("로그인에 실패했어요.", {
        description: "다시 시도해 주세요. 문제가 계속되면 관리자에게 문의해 주세요.",
      })
      // URL에서 error 파라미터 제거 (새로고침 시 중복 토스트 방지)
      const url = new URL(window.location.href)
      url.searchParams.delete("error")
      router.replace(url.pathname + url.search)
    } else if (message === "withdrawn") {
      toast.success("회원 탈퇴가 완료되었어요.", { id: WITHDRAWN_TOAST_ID })
      // URL에서 message 파라미터 제거 (새로고침 시 중복 토스트 방지)
      const url = new URL(window.location.href)
      url.searchParams.delete("message")
      router.replace(url.pathname + url.search)
    }
  }, [searchParams, router])

  async function handleGoogleLogin() {
    try {
      const supabase = createClient()
      const baseUrl =
        process.env.NEXT_PUBLIC_APP_URL ||
        (typeof window !== "undefined" ? window.location.origin : "")
      const nextPath = redirectTo
      const redirectToUrl = `${baseUrl}/api/auth/callback?next=${encodeURIComponent(nextPath)}`

      const { error } = await supabase.auth.signInWithOAuth({
        provider: "google",
        options: { redirectTo: redirectToUrl },
      })
      if (error) {
        toast.error("로그인을 시작하지 못했어요.", { description: error.message })
      }
    } catch (e) {
      toast.error("로그인 중 오류가 발생했어요.", {
        description: e instanceof Error ? e.message : "다시 시도해 주세요.",
      })
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-background via-background to-primary/5">
      {/* Hero Section */}
      <section className="px-4 pt-16 pb-20 md:pt-24 md:pb-28">
        <div className="max-w-4xl mx-auto text-center">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.6 }}
            className="mb-8"
          >
            <Image src={dogImage} alt="매칭미 마스코트" className="w-28 h-auto md:w-32 md:h-auto mx-auto" priority />
          </motion.div>
          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2, duration: 0.5 }}
            className="text-3xl md:text-4xl lg:text-5xl font-bold text-foreground tracking-tight"
          >
            남도학숙 생활의 시작,<br />나와 딱 맞는 룸메이트 찾기
          </motion.h1>
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.35, duration: 0.5 }}
            className="mt-4 text-base md:text-lg text-muted-foreground max-w-xl mx-auto"
          >
            AI가 추천해주는 나와 잘 맞는 룸메이트를 만나보세요!
          </motion.p>
        </div>
      </section>

      {/* Feature Section */}
      <section className="px-4 py-16 md:py-24 bg-card/50">
        <div className="max-w-4xl mx-auto">
          <motion.h2
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
            className="text-2xl md:text-3xl font-bold text-foreground text-center mb-12"
          >
            매칭미가 특별한 이유
          </motion.h2>
          <div className="grid md:grid-cols-3 gap-6">
            {[
              { icon: Sparkles, title: "AI 매칭 요약", desc: "생활 패턴을 분석해 찰떡궁합 포인트를 한눈에" },
              { icon: Users, title: "라이프스타일 분석", desc: "아침형·밤형, 잠버릇, 청결도 등 꼼꼼히 비교" },
              { icon: Shield, title: "안전한 연락처 공유", desc: "일일 3회 한도로 마음에 든 인연만 연결" },
            ].map((item, i) => (
              <motion.div
                key={item.title}
                variants={fadeUp}
                initial="hidden"
                whileInView="visible"
                viewport={{ once: true }}
                custom={i}
                className="flex flex-col items-center p-6 rounded-2xl bg-background border border-border/50 shadow-sm"
              >
                <div className="w-14 h-14 rounded-2xl bg-primary/10 flex items-center justify-center mb-4">
                  <item.icon className="size-7 text-primary" />
                </div>
                <h3 className="font-semibold text-foreground text-lg mb-2">{item.title}</h3>
                <p className="text-sm text-muted-foreground text-center">{item.desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Live Preview (Mock) */}
      <section className="px-4 py-16 md:py-24">
        <div className="max-w-4xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
            className="text-center mb-10"
          >
            <span className="inline-block px-4 py-1.5 rounded-full bg-primary/10 text-primary text-xs font-semibold uppercase tracking-wide mb-4">
              미리보기
            </span>
            <h2 className="text-2xl md:text-3xl font-bold text-foreground mb-2">
              이런 매칭 카드를 만나볼 수 있어요
            </h2>
            <p className="text-muted-foreground">실제 서비스 화면의 일부를 샘플로 보여드려요</p>
          </motion.div>
          <div className="space-y-6">
            {LANDING_SAMPLES.map((profile, i) => (
              <motion.div
                key={profile.id}
                initial={{ opacity: 0, y: 24 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1, duration: 0.5 }}
              >
                <CandidateCard
                  profile={profile}
                  isAiRecommended={i === 0}
                  onViewProfile={() => {}}
                  onSave={() => {}}
                />
              </motion.div>
            ))}
          </div>
          <motion.p
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            className="text-center text-xs text-muted-foreground mt-6"
          >
            * 위 카드는 실제 매칭이 아닌 샘플입니다
          </motion.p>
        </div>
      </section>

      {/* Bottom CTA */}
      <section className="px-4 py-20 md:py-28 bg-gradient-to-b from-primary/10 to-primary/5">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="max-w-2xl mx-auto text-center"
        >
          <h2 className="text-2xl md:text-3xl font-bold text-foreground mb-4">
            나와 맞는 룸메이트, 지금 찾아보세요
          </h2>
          <p className="text-muted-foreground mb-8">
            Google 계정만 있으면 바로 시작할 수 있어요. 남도학숙 생활을 더 풍요롭게!
          </p>
          <button
            type="button"
            onClick={handleGoogleLogin}
            className="inline-flex items-center gap-3 px-8 py-4 rounded-2xl bg-primary text-primary-foreground text-base font-semibold hover:bg-primary/90 shadow-lg shadow-primary/25 transition-all hover:shadow-xl hover:shadow-primary/30"
          >
            <GoogleLogo className="size-5" />
            Google 계정으로 시작하기
            <ChevronRight className="size-5" />
          </button>
          <p className="text-center text-xs text-muted-foreground mt-4 px-4">
            계속 진행하면 서비스 이용약관 및 개인정보 처리방침에 동의하게 됩니다
          </p>
        </motion.div>
      </section>

      {/* Footer */}
      <footer className="py-8 text-center border-t border-border/50">
        <p className="text-xs text-muted-foreground/70">남도학숙 재사생을 위한 룸메이트 매칭 서비스, 매칭미?</p>
      </footer>
    </div>
  )
}

export function LandingView() {
  return (
    <Suspense fallback={<LoadingState message="잠시만 기다려 주세요" />}>
      <LandingContent />
    </Suspense>
  )
}
