"use client"

import { ChevronLeft, FileText } from "lucide-react"
import { SUPPORT_KAKAO_OPEN_CHAT_URL } from "@/lib/utils/constants"

interface TermsPageProps {
  onBack: () => void
}

export function TermsPage({ onBack }: TermsPageProps) {
  return (
    <div className="min-h-screen pb-24 bg-background">
      <div className="max-w-2xl mx-auto lg:max-w-4xl">
        <div className="flex items-center px-6 pt-12 pb-4 border-b border-border/50">
          <div className="w-10 shrink-0 flex items-center">
            <button
              type="button"
              onClick={onBack}
              className="p-2 -ml-2 rounded-full hover:bg-muted/50 transition-colors"
              aria-label="뒤로 가기"
            >
              <ChevronLeft className="size-5 text-foreground" />
            </button>
          </div>
          <h1 className="flex-1 text-center text-lg font-semibold text-foreground">서비스 이용약관</h1>
          <div className="w-10 shrink-0" />
        </div>

        <div className="px-6 py-6 space-y-6">
          <div className="flex items-center gap-3 p-4 rounded-2xl bg-primary/5 border border-primary/10">
            <FileText className="size-8 text-primary shrink-0" />
            <div>
              <h2 className="text-sm font-semibold text-foreground">매칭미? 서비스 이용약관</h2>
              <p className="text-xs text-muted-foreground mt-0.5">서비스를 이용하시기 전에 아래 내용을 확인해 주세요.</p>
            </div>
          </div>

          <section className="bg-card rounded-2xl border border-border/50 p-5 space-y-4">
            <h3 className="text-sm font-semibold text-foreground">제1조 (목적)</h3>
            <p className="text-sm text-muted-foreground">
              본 약관은 매칭미?(이하 &quot;서비스&quot;)가 제공하는 룸메이트 매칭 서비스의 이용 조건 및 절차, 이용자와 서비스 운영자의 권리·의무를 규정함을 목적으로 합니다.
            </p>
          </section>

          <section className="bg-card rounded-2xl border border-border/50 p-5 space-y-4">
            <h3 className="text-sm font-semibold text-foreground">제2조 (서비스의 이용)</h3>
            <p className="text-sm text-muted-foreground">
              이용자는 본인 확인(Google 로그인 등)을 거친 후 서비스에 가입할 수 있습니다. 서비스는 남도학숙 재사생을 위한 룸메이트 매칭 기능, 프로필 조회, 연락처 공개(일 제한 적용) 등을 제공합니다.
            </p>
          </section>

          <section className="bg-card rounded-2xl border border-border/50 p-5 space-y-4">
            <h3 className="text-sm font-semibold text-foreground">제3조 (금지 행위)</h3>
            <ul className="text-sm text-muted-foreground space-y-2 list-disc list-inside">
              <li>타인의 정보 도용 또는 허위 정보 입력</li>
              <li>다른 이용자에 대한 비방·허위 사실 유포</li>
              <li>서비스 운영 방해 또는 시스템 부정 이용</li>
              <li>기타 관계 법령 및 서비스 정책에 위배되는 행위</li>
            </ul>
          </section>

          <section className="bg-card rounded-2xl border border-border/50 p-5 space-y-4">
            <h3 className="text-sm font-semibold text-foreground">제4조 (서비스 변경·중단)</h3>
            <p className="text-sm text-muted-foreground">
              서비스는 필요한 경우 사전 안내 후 서비스 내용을 변경하거나 중단할 수 있습니다. 중대한 변경 시 서비스 내 공지 또는 연락처를 통해 안내합니다.
            </p>
          </section>

          <section className="bg-card rounded-2xl border border-border/50 p-5 space-y-4">
            <h3 className="text-sm font-semibold text-foreground">제5조 (약관의 효력 및 변경)</h3>
            <p className="text-sm text-muted-foreground">
              본 약관은 서비스 이용 시 효력이 발생합니다. 약관이 변경되는 경우 시행일 전에 서비스 내 공지하며, 변경된 약관은 공지 후 시행일부터 적용됩니다.
            </p>
          </section>

          <section className="bg-card rounded-2xl border border-border/50 p-5 space-y-4">
            <h3 className="text-sm font-semibold text-foreground">제6조 (문의)</h3>
            <p className="text-sm text-muted-foreground">
              이용약관 및 서비스 이용과 관련한 문의는 아래 채널로 연락해 주세요.
            </p>
            <a
              href={SUPPORT_KAKAO_OPEN_CHAT_URL}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 text-sm font-medium text-primary hover:underline"
            >
              카카오톡 오픈채팅으로 문의하기
            </a>
          </section>
        </div>
      </div>
    </div>
  )
}
