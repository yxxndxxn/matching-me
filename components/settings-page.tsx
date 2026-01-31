"use client"

import Link from "next/link"
import { useState } from "react"
import { ChevronLeft, HelpCircle, Shield, Info, UserX, BookOpen } from "lucide-react"
import { SUPPORT_KAKAO_OPEN_CHAT_URL } from "@/lib/utils/constants"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog"
import { toast } from "sonner"

const APP_VERSION = "0.1.0"

interface SettingsPageProps {
  onBack: () => void
  onOpenPrivacy: () => void
  onWithdrawSuccess: () => void
}

export function SettingsPage({ onBack, onOpenPrivacy, onWithdrawSuccess }: SettingsPageProps) {
  const [showWithdrawConfirm, setShowWithdrawConfirm] = useState(false)
  const [withdrawing, setWithdrawing] = useState(false)

  const handleWithdrawConfirm = async () => {
    setWithdrawing(true)
    try {
      const res = await fetch("/api/account/delete", { method: "POST" })
      const json = await res.json().catch(() => ({}))
      if (!res.ok) {
        toast.error("탈퇴에 실패했어요.", { description: (json.error as string) ?? "다시 시도해 주세요." })
        setShowWithdrawConfirm(false)
        return
      }
      setShowWithdrawConfirm(false)
      toast.success("회원 탈퇴가 완료되었어요.")
      onWithdrawSuccess()
    } catch {
      toast.error("탈퇴 처리 중 오류가 발생했어요.")
      setShowWithdrawConfirm(false)
    } finally {
      setWithdrawing(false)
    }
  }
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
          <h1 className="flex-1 text-center text-lg font-semibold text-foreground">설정</h1>
          <div className="w-10 shrink-0" />
        </div>

        <div className="px-6 py-6 space-y-4">
          <section className="bg-card rounded-2xl border border-border/50 overflow-hidden">
            <div className="px-4 py-3 border-b border-border/50">
              <h2 className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">앱 정보</h2>
            </div>
            <Link
              href="/about"
              className="flex items-center gap-3 px-4 py-4 hover:bg-muted/30 transition-colors"
            >
              <div className="flex items-center justify-center size-10 rounded-full bg-muted/50 shrink-0">
                <BookOpen className="size-5 text-muted-foreground" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-foreground">서비스 소개</p>
                <p className="text-xs text-muted-foreground">매칭미? 서비스에 대해 알아보기</p>
              </div>
              <ChevronLeft className="size-5 text-muted-foreground rotate-180 shrink-0" />
            </Link>
            <div className="flex items-center justify-between px-4 py-4 border-t border-border/50">
              <div className="flex items-center gap-3">
                <div className="flex items-center justify-center size-10 rounded-full bg-muted/50">
                  <Info className="size-5 text-muted-foreground" />
                </div>
                <div>
                  <p className="text-sm font-medium text-foreground">버전</p>
                  <p className="text-xs text-muted-foreground">매칭미? 앱 버전 정보</p>
                </div>
              </div>
              <span className="text-sm font-medium text-muted-foreground">{APP_VERSION}</span>
            </div>
          </section>

          <section className="bg-card rounded-2xl border border-border/50 overflow-hidden">
            <div className="px-4 py-3 border-b border-border/50">
              <h2 className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">지원</h2>
            </div>
            <button
              type="button"
              onClick={onOpenPrivacy}
              className="w-full flex items-center gap-3 px-4 py-4 hover:bg-muted/30 transition-colors text-left"
            >
              <div className="flex items-center justify-center size-10 rounded-full bg-muted/50 shrink-0">
                <Shield className="size-5 text-muted-foreground" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-foreground">개인정보 보호</p>
                <p className="text-xs text-muted-foreground">수집·이용 안내 및 보호 정책</p>
              </div>
              <ChevronLeft className="size-5 text-muted-foreground rotate-180 shrink-0" />
            </button>
            <a
              href={SUPPORT_KAKAO_OPEN_CHAT_URL}
              target="_blank"
              rel="noopener noreferrer"
              className="w-full flex items-center gap-3 px-4 py-4 hover:bg-muted/30 transition-colors text-left border-t border-border/50"
            >
              <div className="flex items-center justify-center size-10 rounded-full bg-muted/50 shrink-0">
                <HelpCircle className="size-5 text-muted-foreground" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-foreground">도움말 및 지원</p>
                <p className="text-xs text-muted-foreground">카카오톡 오픈채팅으로 문의하기</p>
              </div>
              <ChevronLeft className="size-5 text-muted-foreground rotate-180 shrink-0" />
            </a>
          </section>

          <section className="bg-card rounded-2xl border border-border/50 overflow-hidden">
            <div className="px-4 py-3 border-b border-border/50">
              <h2 className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">계정</h2>
            </div>
            <button
              type="button"
              onClick={() => setShowWithdrawConfirm(true)}
              className="w-full flex items-center gap-3 px-4 py-4 hover:bg-muted/50 transition-colors text-left text-foreground"
            >
              <div className="flex items-center justify-center size-10 rounded-full bg-muted shrink-0">
                <UserX className="size-5 text-foreground" />
              </div>
              <div className="flex-1 min-w-0 text-left">
                <p className="text-sm font-medium">회원 탈퇴</p>
                <p className="text-xs text-muted-foreground">계정 및 모든 데이터를 삭제합니다</p>
              </div>
              <ChevronLeft className="size-5 text-muted-foreground rotate-180 shrink-0" />
            </button>
          </section>
        </div>
      </div>

      <AlertDialog open={showWithdrawConfirm} onOpenChange={setShowWithdrawConfirm}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>회원 탈퇴</AlertDialogTitle>
            <AlertDialogDescription>
              탈퇴 시 프로필, 매칭 게시글, 찜 목록, 연락처 조회 기록 등 모든 데이터가 삭제되며 복구할 수 없습니다. 정말 탈퇴하시겠습니까?
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={withdrawing}>취소</AlertDialogCancel>
            <AlertDialogAction
              onClick={(e) => {
                e.preventDefault();
                void handleWithdrawConfirm();
              }}
              disabled={withdrawing}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              {withdrawing ? "처리 중…" : "탈퇴하기"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}
