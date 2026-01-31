"use client"

import { ChevronLeft, Shield } from "lucide-react"
import { SUPPORT_KAKAO_OPEN_CHAT_URL } from "@/lib/utils/constants"

interface PrivacyPageProps {
  onBack: () => void
}

export function PrivacyPage({ onBack }: PrivacyPageProps) {
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
          <h1 className="flex-1 text-center text-lg font-semibold text-foreground">개인정보 보호</h1>
          <div className="w-10 shrink-0" />
        </div>

        <div className="px-6 py-6 space-y-6">
          <div className="flex items-center gap-3 p-4 rounded-2xl bg-primary/5 border border-primary/10">
            <Shield className="size-8 text-primary shrink-0" />
            <div>
              <h2 className="text-sm font-semibold text-foreground">개인정보 수집·이용 안내</h2>
              <p className="text-xs text-muted-foreground mt-0.5">매칭미?(Matching me?) 서비스 이용 시 수집되는 정보입니다.</p>
            </div>
          </div>

          <section className="bg-card rounded-2xl border border-border/50 p-5 space-y-4">
            <h3 className="text-sm font-semibold text-foreground">1. 수집하는 개인정보 항목</h3>
            <ul className="text-sm text-muted-foreground space-y-2 list-disc list-inside">
              <li><strong className="text-foreground">필수:</strong> 이름, 성별, 학년, 학숙구분, 계열, 카카오톡 ID, 생활 패턴, 잠버릇, 흡연 여부, 청결도, 소음 민감도, 자기소개</li>
              <li><strong className="text-foreground">선택:</strong> 기타 연락처(이메일, SNS 등)</li>
              <li>Google 로그인 시: 이메일, 프로필 사진(선택 저장)</li>
            </ul>
          </section>

          <section className="bg-card rounded-2xl border border-border/50 p-5 space-y-4">
            <h3 className="text-sm font-semibold text-foreground">2. 수집 목적</h3>
            <p className="text-sm text-muted-foreground">
              룸메이트 매칭 서비스 제공, 본인 확인, 연락처 공개 제한(일 3회) 관리, 서비스 개선 및 문의 대응
            </p>
          </section>

          <section className="bg-card rounded-2xl border border-border/50 p-5 space-y-4">
            <h3 className="text-sm font-semibold text-foreground">3. 보관 기간</h3>
            <p className="text-sm text-muted-foreground">
              회원 탈퇴 시까지 보관하며, 탈퇴 후 지체 없이 파기합니다. 단, 관계 법령에 따라 보존이 필요한 경우 해당 기간 동안 보관합니다.
            </p>
          </section>

          <section className="bg-card rounded-2xl border border-border/50 p-5 space-y-4">
            <h3 className="text-sm font-semibold text-foreground">4. 제3자 제공</h3>
            <p className="text-sm text-muted-foreground">
              연락처 공개 기능을 통해 동의한 다른 회원에게만 카카오톡 ID·기타 연락처가 제한적으로 공개됩니다. 그 외에는 동의 없이 제3자에게 제공하지 않습니다.
            </p>
          </section>

          <section className="bg-card rounded-2xl border border-border/50 p-5 space-y-4">
            <h3 className="text-sm font-semibold text-foreground">5. 문의</h3>
            <p className="text-sm text-muted-foreground">
              개인정보 처리와 관련한 문의는 도움말 및 지원(카카오톡 오픈채팅)으로 연락해 주세요.
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
