"use client"

import { ErrorFallbackView } from "@/components/error-fallback-view"

/**
 * 전역 에러 바운더리 (세그먼트 이하 오류 시 표시)
 * - 부드러운 메시지 + 메인으로 돌아가기 버튼
 */
export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <ErrorFallbackView
      title="잠시 문제가 생겼어요"
      description="요청을 처리하는 중 문제가 발생했어요. 메인 화면으로 돌아가 다시 시도해 주세요."
      homeHref="/"
      onRetry={reset}
    />
  )
}
