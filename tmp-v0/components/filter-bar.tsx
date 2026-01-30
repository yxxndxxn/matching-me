"use client"

import { useState } from "react"
import { SlidersHorizontal, Check, X } from "lucide-react"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"

interface FilterBarProps {
  onFilterChange?: (filters: FilterState) => void
}

export interface FilterState {
  dormitory: string
  gender: string
  majorCategory: string
  grade: string
  smoking: string
}

const dormitories = [
  { label: "전체", value: "all" },
  { label: "동작관", value: "dongjak" },
  { label: "은평관", value: "eunpyeong" },
]

const detailedFilters = {
  gender: {
    label: "성별",
    options: [
      { label: "전체", value: "all" },
      { label: "남성", value: "male" },
      { label: "여성", value: "female" },
    ],
  },
  majorCategory: {
    label: "계열",
    options: [
      { label: "전체", value: "all" },
      { label: "공학", value: "engineering" },
      { label: "인문", value: "humanities" },
      { label: "사회", value: "social" },
      { label: "자연", value: "natural" },
      { label: "예체능", value: "arts" },
      { label: "교육", value: "education" },
    ],
  },
  grade: {
    label: "학년",
    options: [
      { label: "전체", value: "all" },
      { label: "1학년", value: "1학년" },
      { label: "2학년", value: "2학년" },
      { label: "3학년", value: "3학년" },
      { label: "4학년", value: "4학년" },
    ],
  },
  smoking: {
    label: "흡연",
    options: [
      { label: "전체", value: "all" },
      { label: "비흡연", value: "non-smoker" },
      { label: "흡연", value: "smoker" },
    ],
  },
}

export function FilterBar({ onFilterChange }: FilterBarProps) {
  const [selectedDormitory, setSelectedDormitory] = useState("all")
  const [showDetailedFilter, setShowDetailedFilter] = useState(false)
  const [detailedSelections, setDetailedSelections] = useState<Record<string, string>>({
    gender: "all",
    majorCategory: "all",
    grade: "all",
    smoking: "all",
  })

  const handleDormitoryChange = (value: string) => {
    setSelectedDormitory(value)
    onFilterChange?.({
      dormitory: value,
      ...detailedSelections,
    })
  }

  const handleDetailedFilterChange = (key: string, value: string) => {
    const newSelections = { ...detailedSelections, [key]: value }
    setDetailedSelections(newSelections)
  }

  const applyDetailedFilters = () => {
    onFilterChange?.({
      dormitory: selectedDormitory,
      ...detailedSelections,
    })
    setShowDetailedFilter(false)
  }

  const resetDetailedFilters = () => {
    const resetSelections = {
      gender: "all",
      majorCategory: "all",
      grade: "all",
      smoking: "all",
    }
    setDetailedSelections(resetSelections)
  }

  const hasActiveDetailedFilters = Object.values(detailedSelections).some(v => v !== "all")

  return (
    <>
      <div className="flex items-center justify-between px-4 py-3 border-b border-border/30">
        {/* Left: Dormitory Toggle Chips */}
        <div className="flex items-center gap-2">
          {dormitories.map((dorm) => (
            <button
              key={dorm.value}
              onClick={() => handleDormitoryChange(dorm.value)}
              className={cn(
                "h-9 px-4 rounded-full text-sm font-medium transition-all duration-200",
                selectedDormitory === dorm.value
                  ? "bg-primary text-primary-foreground shadow-sm"
                  : "bg-muted/50 text-foreground hover:bg-muted border border-border/50"
              )}
            >
              {dorm.label}
            </button>
          ))}
        </div>

        {/* Right: Detailed Filter Button */}
        <button
          onClick={() => setShowDetailedFilter(true)}
          className={cn(
            "flex items-center gap-2 h-9 px-4 rounded-full text-sm font-medium transition-all border",
            hasActiveDetailedFilters
              ? "bg-primary/10 text-primary border-primary/30"
              : "bg-card text-foreground border-border hover:bg-muted/50"
          )}
        >
          <SlidersHorizontal className="size-4" />
          <span>상세 필터</span>
          {hasActiveDetailedFilters && (
            <span className="size-5 rounded-full bg-primary text-primary-foreground text-xs flex items-center justify-center">
              {Object.values(detailedSelections).filter(v => v !== "all").length}
            </span>
          )}
        </button>
      </div>

      {/* Detailed Filter Modal */}
      {showDetailedFilter && (
        <div className="fixed inset-0 z-[100] flex items-end sm:items-center justify-center">
          {/* Backdrop */}
          <div 
            className="absolute inset-0 bg-black/50 backdrop-blur-sm"
            onClick={() => setShowDetailedFilter(false)}
          />
          
          {/* Modal Content */}
          <div className="relative w-full max-w-md bg-card rounded-t-3xl sm:rounded-2xl shadow-2xl animate-in slide-in-from-bottom-4 duration-300 max-h-[85vh] overflow-hidden">
            {/* Header */}
            <div className="flex items-center justify-between px-5 py-4 border-b border-border/50">
              <h2 className="text-lg font-semibold text-foreground">상세 필터</h2>
              <button
                onClick={() => setShowDetailedFilter(false)}
                className="p-2 -mr-2 rounded-full hover:bg-muted transition-colors"
              >
                <X className="size-5 text-muted-foreground" />
              </button>
            </div>

            {/* Filter Options */}
            <div className="px-5 py-4 space-y-6 overflow-y-auto max-h-[60vh]">
              {Object.entries(detailedFilters).map(([key, filter]) => (
                <div key={key}>
                  <h3 className="text-sm font-medium text-foreground mb-3">{filter.label}</h3>
                  <div className="flex flex-wrap gap-2">
                    {filter.options.map((option) => (
                      <button
                        key={option.value}
                        onClick={() => handleDetailedFilterChange(key, option.value)}
                        className={cn(
                          "h-9 px-4 rounded-full text-sm font-medium transition-all duration-200",
                          detailedSelections[key] === option.value
                            ? "bg-primary text-primary-foreground"
                            : "bg-muted/50 text-foreground hover:bg-muted border border-border/50"
                        )}
                      >
                        {option.label}
                      </button>
                    ))}
                  </div>
                </div>
              ))}
            </div>

            {/* Footer Actions */}
            <div className="flex items-center gap-3 px-5 py-4 border-t border-border/50 bg-card">
              <Button
                variant="outline"
                onClick={resetDetailedFilters}
                className="flex-1 h-12 rounded-xl font-medium bg-transparent"
              >
                초기화
              </Button>
              <Button
                onClick={applyDetailedFilters}
                className="flex-1 h-12 rounded-xl font-medium"
              >
                적용하기
              </Button>
            </div>
          </div>
        </div>
      )}
    </>
  )
}
