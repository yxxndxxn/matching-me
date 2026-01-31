"use client"

import { useEffect } from "react"
import { usePathname } from "next/navigation"

/** 페이지 이동 시 스크롤을 맨 위로 이동 */
export function ScrollToTop() {
  const pathname = usePathname()

  useEffect(() => {
    window.scrollTo(0, 0)
  }, [pathname])

  return null
}
