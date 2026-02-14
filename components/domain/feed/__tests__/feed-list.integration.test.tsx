/**
 * FeedList 통합 테스트
 * - 페이지네이션 UI 표시 및 동작
 * - 스크롤 맨 위로 버튼 표시 및 동작
 */

import { describe, it, expect, vi, beforeEach } from "vitest"
import { render, screen, waitFor, act } from "@testing-library/react"
import userEvent from "@testing-library/user-event"
import { FeedList } from "../feed-list"
import type { UserProfile } from "@/lib/types"

const mockProfile: UserProfile = {
  id: "1",
  name: "테스트",
  gender: "male",
  majorCategory: "engineering",
  grade: "2",
  dormitory: "dongjak",
  otherContact: "",
  contact: "010-0000-0000",
  chronotype: "morning",
  sleepingHabit: "none",
  smoking: false,
  cleanliness: 3,
  noiseSensitivity: 3,
  introduction: "테스트 소개",
  matchScore: 80,
}

const mockSetPage = vi.fn()
const mockRefetch = vi.fn()
const mockRegisterClearFeedSelection = vi.fn(() => () => {})

vi.mock("@/hooks/use-matching-feed", () => ({
  useMatchingFeed: () => ({
    profiles: [mockProfile],
    loading: false,
    error: null,
    refetch: mockRefetch,
    page: 1,
    setPage: mockSetPage,
    totalPages: 3,
    totalCount: 25,
    pageSize: 12,
    fetchAll: false,
  }),
}))

vi.mock("@/hooks/use-bookmarks", () => ({
  useBookmarks: () => ({
    add: vi.fn(),
    remove: vi.fn(),
    isBookmarked: () => false,
  }),
}))

vi.mock("@/components/providers/daily-limit-provider", () => ({
  useDailyLimitContext: () => ({
    remaining: 3,
  }),
}))

vi.mock("@/hooks/use-contact-reveal", () => ({
  useContactReveal: () => ({
    reveal: vi.fn().mockResolvedValue({ success: false }),
  }),
}))

vi.mock("@/hooks/use-revealed-ids", () => ({
  useRevealedIds: () => ({
    revealedIds: new Set(),
    addRevealedId: vi.fn(),
  }),
}))

vi.mock("@/components/providers/dashboard-nav-provider", () => ({
  useDashboardNav: () => ({
    registerClearFeedSelection: mockRegisterClearFeedSelection,
  }),
}))

vi.mock("sonner", () => ({
  toast: {
    error: vi.fn(),
    success: vi.fn(),
  },
}))

describe("FeedList 통합 테스트", () => {
  beforeEach(() => {
    vi.clearAllMocks()
    Object.defineProperty(window, "scrollTo", { value: vi.fn(), writable: true })
    Object.defineProperty(window, "scrollY", { value: 0, writable: true })
  })

  it("피드 목록을 렌더링한다", async () => {
    render(<FeedList />)
    expect(screen.getByText("테스트")).toBeInTheDocument()
  })

  it("totalPages > 1일 때 페이지네이션 UI를 표시한다", async () => {
    render(<FeedList />)
    expect(screen.getByRole("navigation", { name: "페이지 네비게이션" })).toBeInTheDocument()
  })

  it("페이지 2 버튼 클릭 시 setPage(2)를 호출한다", async () => {
    const user = userEvent.setup()
    render(<FeedList />)
    const page2Button = screen.getByRole("button", { name: "2페이지" })
    await user.click(page2Button)
    expect(mockSetPage).toHaveBeenCalledWith(2)
  })

  it("이전 버튼 클릭 시 setPage(0)을 호출하지 않는다 (page 1에서 disabled)", async () => {
    render(<FeedList />)
    const prevButton = screen.getByRole("button", { name: "이전 페이지" })
    expect(prevButton).toBeDisabled()
  })

  it("다음 버튼 클릭 시 setPage(2)를 호출한다", async () => {
    const user = userEvent.setup()
    render(<FeedList />)
    const nextButton = screen.getByRole("button", { name: "다음 페이지" })
    await user.click(nextButton)
    expect(mockSetPage).toHaveBeenCalledWith(2)
  })

  it("스크롤 300px 이상일 때 맨 위로 버튼이 표시된다", async () => {
    render(<FeedList />)
    expect(screen.queryByRole("button", { name: "맨 위로" })).not.toBeInTheDocument()

    Object.defineProperty(window, "scrollY", { value: 400, writable: true })
    await act(async () => {
      window.dispatchEvent(new Event("scroll"))
    })

    await waitFor(() => {
      expect(screen.getByRole("button", { name: "맨 위로" })).toBeInTheDocument()
    })
  })

  it("맨 위로 버튼 클릭 시 window.scrollTo가 호출된다", async () => {
    const user = userEvent.setup()
    const scrollToMock = vi.fn()
    Object.defineProperty(window, "scrollTo", { value: scrollToMock, writable: true })
    Object.defineProperty(window, "scrollY", { value: 400, writable: true })

    render(<FeedList />)
    await act(async () => {
      window.dispatchEvent(new Event("scroll"))
    })

    const scrollTopButton = await screen.findByRole("button", { name: "맨 위로" })
    await user.click(scrollTopButton)

    expect(scrollToMock).toHaveBeenCalledWith({ top: 0, behavior: "smooth" })
  })
})
