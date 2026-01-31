"use client"

/**
 * 루트 레이아웃 오류 시 전체 앱을 대체하는 전역 에러 화면.
 * Next.js 요구사항에 따라 <html>, <body> 를 직접 포함합니다.
 * Tailwind/테마가 적용되지 않을 수 있으므로 인라인 스타일 폴백 사용.
 */
export default function GlobalError({
  error: _error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <html lang="ko">
      <body style={{ margin: 0 }}>
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
            fontFamily: "system-ui, -apple-system, sans-serif",
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
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="32"
              height="32"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <circle cx="12" cy="12" r="10" />
              <line x1="12" y1="8" x2="12" y2="12" />
              <line x1="12" y1="16" x2="12.01" y2="16" />
            </svg>
          </div>
          <h1
            style={{
              fontSize: "1.25rem",
              fontWeight: 600,
              marginBottom: "0.5rem",
              textAlign: "center",
            }}
          >
            잠시 문제가 생겼어요
          </h1>
          <p
            style={{
              fontSize: "0.875rem",
              color: "#64748b",
              textAlign: "center",
              maxWidth: "20rem",
              marginBottom: "1.5rem",
            }}
          >
            요청을 처리하는 중 문제가 발생했어요. 메인 화면으로 돌아가 다시 시도해 주세요.
          </p>
          <div
            style={{
              display: "flex",
              flexDirection: "column",
              gap: "0.75rem",
              width: "100%",
              maxWidth: "16rem",
            }}
          >
            {/* global-error는 루트 레이아웃 대체 시 사용되므로 Link 대신 a 사용 (전체 문서 새로고침) */}
            {/* eslint-disable-next-line @next/next/no-html-link-for-pages */}
            <a
              href="/"
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
            <button
              type="button"
              onClick={() => reset()}
              style={{
                padding: "0.75rem 1.5rem",
                backgroundColor: "transparent",
                color: "#64748b",
                border: "1px solid #e2e8f0",
                borderRadius: "0.75rem",
                fontWeight: 500,
                cursor: "pointer",
              }}
            >
              다시 시도
            </button>
          </div>
        </div>
      </body>
    </html>
  )
}
