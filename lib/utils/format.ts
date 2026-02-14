// 날짜/숫자 포맷팅 유틸리티 함수

import { format, formatDistanceToNow } from "date-fns"
import { ko } from "date-fns/locale"

/** 포스트 등록일 표시 (예: "3일 전", "2월 14일") */
export function formatPostedAt(isoString: string | undefined): string {
  if (!isoString) return ""
  const date = new Date(isoString)
  const now = new Date()
  const diffDays = Math.floor((now.getTime() - date.getTime()) / (1000 * 60 * 60 * 24))
  if (diffDays < 7) {
    return formatDistanceToNow(date, { addSuffix: true, locale: ko })
  }
  return format(date, "M월 d일", { locale: ko })
}
