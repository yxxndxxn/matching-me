"use client"

import Link from "next/link"
import { Button } from "@/components/ui/button"
import { AlertCircle } from "lucide-react"

export interface ErrorFallbackViewProps {
  /** 사용자에게 보여줄 부드러운 제목 (기본: "잠시 문제가 생겼어요") */
  title?: string
  /** 추가 안내 문구 (선택) */
  description?: string
  /** 메인으로 돌아가기 링크 (기본: "/") */
  homeHref?: string
  /** 다시 시도 버튼 클릭 시 호출 (없으면 버튼 숨김) */
  onRetry?: () => void
  /** 글로벌 에러용: Tailwind 없을 때 대비 인라인 스타일 사용 */
  useInlineFallback?: boolean
}

const DEFAULT_TITLE = "잠시 문제가 생겼어요"
const DEFAULT_DESCRIPTION =
  "요청을 처리하는 중 문제가 발생했어요. 메인 화면으로 돌아가 다시 시도해 주세요."

export function ErrorFallbackView({
  title = DEFAULT_TITLE,
  description = DEFAULT_DESCRIPTION,
  homeHref = "/",
  onRetry,
  useInlineFallback = false,
}: ErrorFallbackViewProps) {
  if (useInlineFallback) {
    return (
      <div
        style={{
          minHeight: "100vh",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          padding: "1.5rem",
          backgroundColor: "#f8fafc",
          color: "#1e293b",
          fontFamily: "system-ui, sans-serif",
        }}
      >
        <div
          style={{
            width: "4rem",
            height: "4rem",
            borderRadius: "50%",
            background: "#e0e7ff",
            color: "#4f46e5",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            marginBottom: "1.5rem",
          }}
        >
          <AlertCircle size={32} />
        </div>
        <h1 style={{ fontSize: "1.25rem", fontWeight: 600, marginBottom: "0.5rem", textAlign: "center" }}>
          {title}
        </h1>
        <p style={{ fontSize: "0.875rem", color: "#64748b", textAlign: "center", maxWidth: "20rem", marginBottom: "1.5rem" }}>
          {description}
        </p>
        <div style={{ display: "flex", flexDirection: "column", gap: "0.75rem", width: "100%", maxWidth: "16rem" }}>
          <a
            href={homeHref}
            style={{
              display: "block",
              padding: "0.75rem 1.5rem",
              backgroundColor: "#4f46e5",
              color: "white",
              borderRadius: "0.75rem",
              textAlign: "center",
              fontWeight: 500,
              textDecoration: "none",
            }}
          >
            메인으로 돌아가기
          </a>
          {onRetry && (
            <button
              type="button"
              onClick={onRetry}
              style={{
                padding: "0.75rem 1.5rem",
                backgroundColor: "transparent",
                color: "#64748b",
                border: "1px solid #e2e8f0",
                borderRadius: "0.75rem",
                fontWeight: 500,
              }}
            >
              다시 시도
            </button>
          )}
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-background flex flex-col items-center justify-center px-6 py-12">
      <div className="w-16 h-16 rounded-full bg-primary/10 text-primary flex items-center justify-center mb-6">
        <AlertCircle className="size-8" />
      </div>
      <h1 className="text-xl font-semibold text-foreground text-center mb-2">
        {title}
      </h1>
      <p className="text-sm text-muted-foreground text-center max-w-xs mb-8">
        {description}
      </p>
      <div className="flex flex-col gap-3 w-full max-w-64">
        <Button asChild size="lg" className="rounded-2xl">
          <Link href={homeHref}>메인으로 돌아가기</Link>
        </Button>
        {onRetry && (
          <Button variant="outline" size="lg" className="rounded-2xl" onClick={onRetry}>
            다시 시도
          </Button>
        )}
      </div>
    </div>
  )
}
