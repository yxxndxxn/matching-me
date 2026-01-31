"use client"

import Link from "next/link"
import { Heart, Shield, Sparkles, Users, ChevronRight } from "lucide-react"

export default function AboutPage() {
  return (
    <div className="min-h-screen pb-24 bg-background">
      <div className="max-w-2xl mx-auto lg:max-w-4xl px-6 pt-12 pb-12">
        <div className="text-center mb-12">
          <h1 className="text-2xl font-bold text-foreground tracking-tight">매칭미?</h1>
          <p className="text-base text-muted-foreground mt-3 font-medium">
            남도학숙생을 위한 룸메이트 매칭 플랫폼
          </p>
          <p className="text-sm text-muted-foreground mt-2 max-w-md mx-auto leading-relaxed">
            같은 기숙사(동작관·은평관) 생활을 할 학숙생들과
            <br />
            나와 꼭 맞는 룸메이트를 찾을 수 있어요.
          </p>
        </div>

        <section className="space-y-6">
          <h2 className="text-sm font-semibold text-foreground uppercase tracking-wide">서비스 소개</h2>
          <div className="bg-card rounded-2xl border border-border/50 p-6 space-y-6">
            <div className="flex gap-4">
              <div className="shrink-0 size-12 rounded-xl bg-primary/10 flex items-center justify-center">
                <Users className="size-6 text-primary" />
              </div>
              <div>
                <h3 className="font-semibold text-foreground">같은 기숙사 내 매칭</h3>
                <p className="text-sm text-muted-foreground mt-1 leading-relaxed">
                  동작관·은평관 구분에 맞는 룸메이트 공고만 보여드려요. 같은 공간에서 생활할 학숙생들과 쉽게 연결할 수 있습니다.
                </p>
              </div>
            </div>

            <div className="flex gap-4">
              <div className="shrink-0 size-12 rounded-xl bg-primary/10 flex items-center justify-center">
                <Sparkles className="size-6 text-primary" />
              </div>
              <div>
                <h3 className="font-semibold text-foreground">라이프스타일 기반 매칭</h3>
                <p className="text-sm text-muted-foreground mt-1 leading-relaxed">
                  생활 패턴, 청결도, 소음 민감도 등을 기반으로 나와 잘 맞는 메이트를 찾을 수 있어요. AI 추천으로 궁합 좋은 학숙생을 만나보세요.
                </p>
              </div>
            </div>

            <div className="flex gap-4">
              <div className="shrink-0 size-12 rounded-xl bg-primary/10 flex items-center justify-center">
                <Heart className="size-6 text-primary" />
              </div>
              <div>
                <h3 className="font-semibold text-foreground">찜하기 & 연락처 공개</h3>
                <p className="text-sm text-muted-foreground mt-1 leading-relaxed">
                  마음에 드는 프로필은 찜해두고, 하루 3회까지 연락처를 확인할 수 있어요. 꼼꼼히 비교해 본 후 연락해 보세요.
                </p>
              </div>
            </div>

            <div className="flex gap-4">
              <div className="shrink-0 size-12 rounded-xl bg-primary/10 flex items-center justify-center">
                <Shield className="size-6 text-primary" />
              </div>
              <div>
                <h3 className="font-semibold text-foreground">안전하고 신뢰할 수 있는</h3>
                <p className="text-sm text-muted-foreground mt-1 leading-relaxed">
                  Google 로그인으로 본인 인증을 하고, 같은 기숙사 학숙생만 이용할 수 있어요. 개인정보는 안전하게 보호됩니다.
                </p>
              </div>
            </div>
          </div>
        </section>

        <section className="mt-10">
          <p className="text-xs text-muted-foreground text-center">
            매칭미?는 남도학숙 재학생을 위한 서비스예요.
            <br />
            궁금한 점이 있으시면 설정 &gt; 도움말 및 지원에서 문의해 주세요.
          </p>
          <div className="mt-6 flex justify-center">
            <Link
              href="/dashboard"
              className="inline-flex items-center gap-2 text-sm font-medium text-primary hover:underline"
            >
              룸메이트 찾기로 이동
              <ChevronRight className="size-4" />
            </Link>
          </div>
        </section>
      </div>
    </div>
  )
}
