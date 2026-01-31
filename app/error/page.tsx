"use client"

import { useSearchParams } from "next/navigation"
import { Suspense } from "react"
import { ErrorFallbackView } from "@/components/error-fallback-view"

/**
 * 전역 오류 전용 페이지.
 * catch 블록 등에서 router.push("/error") 또는 router.push("/error?message=...") 로 이동해
 * 부드러운 메시지와 "메인으로 돌아가기" 버튼을 보여줄 수 있습니다.
 */
function ErrorPageContent() {
  const searchParams = useSearchParams()
  const message = searchParams.get("message")
  const title = searchParams.get("title") ?? "잠시 문제가 생겼어요"
  const description =
    message ?? "요청을 처리하는 중 문제가 발생했어요. 메인 화면으로 돌아가 다시 시도해 주세요."

  return (
    <ErrorFallbackView
      title={title}
      description={description}
      homeHref="/"
    />
  )
}

export default function ErrorPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen bg-background flex items-center justify-center">
          <p className="text-sm text-muted-foreground">로딩 중...</p>
        </div>
      }
    >
      <ErrorPageContent />
    </Suspense>
  )
}
