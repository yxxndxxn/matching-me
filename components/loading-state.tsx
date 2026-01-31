"use client"

import { Loader2 } from "lucide-react"

interface LoadingStateProps {
  /** 전체 화면 기준 (min-h-screen, 중앙 배치) */
  fullScreen?: boolean
  /** 하단에 표시할 메시지 */
  message?: string
}

/** 톤앤매너에 맞는 로딩 UI (EmptyState, 에러 상태와 일관된 스타일) */
export function LoadingState({ fullScreen = true, message = "잠시만 기다려 주세요" }: LoadingStateProps) {
  return (
    <div
      className={
        fullScreen
          ? "flex min-h-screen flex-col items-center justify-center px-6"
          : "flex flex-col items-center justify-center py-16 px-6"
      }
    >
      <div className="size-20 rounded-full bg-secondary flex items-center justify-center mb-6">
        <Loader2 className="size-10 text-muted-foreground animate-spin" />
      </div>
      <p className="text-sm text-muted-foreground">{message}</p>
    </div>
  )
}
