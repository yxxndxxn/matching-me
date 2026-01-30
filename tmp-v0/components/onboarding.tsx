"use client"

import React from "react"

import { useState } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { ChevronLeft, ChevronDown, User, Users, Check } from "lucide-react"
import { Progress } from "@/components/ui/progress"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Button } from "@/components/ui/button"
import { Slider } from "@/components/ui/slider"
import { Label } from "@/components/ui/label"
import { cn } from "@/lib/utils/cn"
import { majorCategories, dormitories, sleepingHabits, type MajorCategory, type Dormitory, type SleepingHabit } from "@/lib/types"

interface OnboardingProps {
  onComplete: () => void
}

const grades = ["1학년", "2학년", "3학년", "4학년"]

export function Onboarding({ onComplete }: OnboardingProps) {
  const [step, setStep] = useState(1)
  const [direction, setDirection] = useState(1)

  // Step 1: 기본 정보
  const [name, setName] = useState("")
  const [gender, setGender] = useState<"male" | "female" | null>(null)
  const [majorCategory, setMajorCategory] = useState<MajorCategory | "">("")
  const [showMajorDropdown, setShowMajorDropdown] = useState(false)
  const [grade, setGrade] = useState("")
  const [dormitory, setDormitory] = useState<Dormitory | "">("")

  // Step 2: 연락처
  const [phone, setPhone] = useState("")
  const [kakaoId, setKakaoId] = useState("")

  // Step 3: 라이프스타일 & 자기소개
  const [chronotype, setChronotype] = useState<"morning" | "night" | null>(null)
  const [sleepingHabit, setSleepingHabit] = useState<SleepingHabit | "">("")
  const [smoking, setSmoking] = useState<boolean | null>(null)
  const [cleanliness, setCleanliness] = useState([3])
  const [noiseSensitivity, setNoiseSensitivity] = useState([3])
  const [introduction, setIntroduction] = useState("")

  const progress = (step / 3) * 100

  const formatPhoneNumber = (value: string) => {
    const numbers = value.replace(/\D/g, "")
    if (numbers.length <= 3) return numbers
    if (numbers.length <= 7) return `${numbers.slice(0, 3)}-${numbers.slice(3)}`
    return `${numbers.slice(0, 3)}-${numbers.slice(3, 7)}-${numbers.slice(7, 11)}`
  }

  const handlePhoneChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const formatted = formatPhoneNumber(e.target.value)
    if (formatted.replace(/-/g, "").length <= 11) {
      setPhone(formatted)
    }
  }

  const handleNext = () => {
    if (step < 3) {
      setDirection(1)
      setStep(step + 1)
    } else {
      onComplete()
    }
  }

  const handleBack = () => {
    if (step > 1) {
      setDirection(-1)
      setStep(step - 1)
    }
  }

  const slideVariants = {
    enter: (direction: number) => ({
      x: direction > 0 ? 300 : -300,
      opacity: 0,
    }),
    center: {
      x: 0,
      opacity: 1,
    },
    exit: (direction: number) => ({
      x: direction > 0 ? -300 : 300,
      opacity: 0,
    }),
  }

  const getMajorCategoryLabel = () => {
    if (!majorCategory) return "계열을 선택하세요"
    const found = majorCategories.find((c) => c.value === majorCategory)
    return found?.label || "계열을 선택하세요"
  }

  return (
    <div className="min-h-screen bg-background flex flex-col">
      {/* Header */}
      <div className="sticky top-0 z-10 bg-background pt-6 px-6 pb-4">
        <div className="flex items-center gap-4 mb-6">
          {step > 1 && (
            <button
              onClick={handleBack}
              className="p-1 -ml-1 text-muted-foreground hover:text-foreground transition-colors"
            >
              <ChevronLeft className="w-6 h-6" />
            </button>
          )}
          <div className="flex-1">
            <h1 className="text-xl font-semibold text-foreground">
              {step === 1 && "기본 정보"}
              {step === 2 && "연락처"}
              {step === 3 && "라이프스타일"}
            </h1>
            <p className="text-sm text-muted-foreground">Step {step} of 3</p>
          </div>
        </div>
        <Progress value={progress} className="h-1.5" />
      </div>

      {/* Content */}
      <div className="flex-1 px-6 overflow-visible">
        <AnimatePresence mode="wait" custom={direction}>
          <motion.div
            key={step}
            custom={direction}
            variants={slideVariants}
            initial="enter"
            animate="center"
            exit="exit"
            transition={{ duration: 0.3, ease: "easeInOut" }}
            className="h-full"
          >
            {step === 1 && (
              <div className="space-y-6 py-4">
                {/* 성명 */}
                <div className="space-y-2">
                  <Label htmlFor="name" className="text-sm font-medium text-foreground">
                    성명
                  </Label>
                  <Input
                    id="name"
                    placeholder="이름을 입력하세요"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="h-12 bg-card"
                  />
                </div>

                {/* 성별 */}
                <div className="space-y-2">
                  <Label className="text-sm font-medium text-foreground">성별</Label>
                  <div className="grid grid-cols-2 gap-3">
                    <button
                      onClick={() => setGender("male")}
                      className={cn(
                        "flex flex-col items-center gap-2 p-4 rounded-xl border-2 transition-all duration-200",
                        gender === "male"
                          ? "border-primary bg-primary/5"
                          : "border-border bg-card hover:border-primary/50"
                      )}
                    >
                      <div
                        className={cn(
                          "w-12 h-12 rounded-full flex items-center justify-center transition-colors",
                          gender === "male" ? "bg-primary/10" : "bg-muted"
                        )}
                      >
                        <User
                          className={cn(
                            "w-6 h-6",
                            gender === "male" ? "text-primary" : "text-muted-foreground"
                          )}
                        />
                      </div>
                      <span
                        className={cn("font-medium", gender === "male" ? "text-primary" : "text-foreground")}
                      >
                        남성
                      </span>
                    </button>
                    <button
                      onClick={() => setGender("female")}
                      className={cn(
                        "flex flex-col items-center gap-2 p-4 rounded-xl border-2 transition-all duration-200",
                        gender === "female"
                          ? "border-primary bg-primary/5"
                          : "border-border bg-card hover:border-primary/50"
                      )}
                    >
                      <div
                        className={cn(
                          "w-12 h-12 rounded-full flex items-center justify-center transition-colors",
                          gender === "female" ? "bg-primary/10" : "bg-muted"
                        )}
                      >
                        <Users
                          className={cn(
                            "w-6 h-6",
                            gender === "female" ? "text-primary" : "text-muted-foreground"
                          )}
                        />
                      </div>
                      <span
                        className={cn("font-medium", gender === "female" ? "text-primary" : "text-foreground")}
                      >
                        여성
                      </span>
                    </button>
                  </div>
                </div>

                {/* 계열 (Major Category) - Dropdown */}
                <div className="space-y-2">
                  <Label className="text-sm font-medium text-foreground">
                    계열
                  </Label>
                  <div className="relative">
                    <button
                      type="button"
                      onClick={() => setShowMajorDropdown(!showMajorDropdown)}
                      className={cn(
                        "w-full h-12 px-4 flex items-center justify-between rounded-lg border bg-card text-left transition-colors",
                        majorCategory ? "text-foreground" : "text-muted-foreground",
                        showMajorDropdown ? "border-primary ring-2 ring-primary/20" : "border-input"
                      )}
                    >
                      <span>{getMajorCategoryLabel()}</span>
                      <ChevronDown
                        className={cn(
                          "size-4 text-muted-foreground transition-transform duration-200",
                          showMajorDropdown && "rotate-180"
                        )}
                      />
                    </button>
                    {showMajorDropdown && (
                      <div className="absolute top-full left-0 right-0 mt-1 bg-card border border-border rounded-xl shadow-lg z-[100] max-h-64 overflow-y-auto">
                        <div className="py-1">
                          {majorCategories.map((category) => {
                            const isSelected = majorCategory === category.value
                            return (
                              <button
                                key={category.value}
                                onClick={() => {
                                  setMajorCategory(category.value)
                                  setShowMajorDropdown(false)
                                }}
                                className={cn(
                                  "w-full flex items-center justify-between px-4 py-3 text-sm transition-colors",
                                  isSelected
                                    ? "bg-primary/10 text-primary font-medium"
                                    : "text-foreground hover:bg-muted"
                                )}
                              >
                                <span>{category.label}</span>
                                {isSelected && <Check className="size-4" />}
                              </button>
                            )
                          })}
                        </div>
                      </div>
                    )}
                  </div>
                </div>

                {/* 학년 */}
                <div className="space-y-2">
                  <Label className="text-sm font-medium text-foreground">학년</Label>
                  <div className="grid grid-cols-4 gap-2">
                    {grades.map((g) => (
                      <button
                        key={g}
                        onClick={() => setGrade(g)}
                        className={cn(
                          "py-3 px-2 rounded-xl border-2 text-sm font-medium transition-all duration-200",
                          grade === g
                            ? "border-primary bg-primary/5 text-primary"
                            : "border-border bg-card text-foreground hover:border-primary/50"
                        )}
                      >
                        {g}
                      </button>
                    ))}
                  </div>
                </div>

                {/* 학숙구분 (기숙사) - Toggle */}
                <div className="space-y-2">
                  <Label className="text-sm font-medium text-foreground">학숙구분</Label>
                  <div className="grid grid-cols-2 gap-3">
                    {dormitories.map((dorm) => (
                      <button
                        key={dorm.value}
                        onClick={() => setDormitory(dorm.value)}
                        className={cn(
                          "py-4 px-4 rounded-xl border-2 text-sm font-medium transition-all duration-200",
                          dormitory === dorm.value
                            ? "border-primary bg-primary/5 text-primary"
                            : "border-border bg-card text-foreground hover:border-primary/50"
                        )}
                      >
                        {dorm.label}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {step === 2 && (
              <div className="space-y-6 py-4">
                {/* 전화번호 */}
                <div className="space-y-2">
                  <Label htmlFor="phone" className="text-sm font-medium text-foreground">
                    전화번호
                  </Label>
                  <Input
                    id="phone"
                    type="tel"
                    placeholder="010-0000-0000"
                    value={phone}
                    onChange={handlePhoneChange}
                    className="h-12 bg-card"
                  />
                </div>

                {/* 카카오톡 ID */}
                <div className="space-y-2">
                  <Label htmlFor="kakaoId" className="text-sm font-medium text-foreground">
                    카카오톡 ID
                  </Label>
                  <Input
                    id="kakaoId"
                    placeholder="카카오톡 ID를 입력하세요"
                    value={kakaoId}
                    onChange={(e) => setKakaoId(e.target.value)}
                    className="h-12 bg-card"
                  />
                  <p className="text-xs text-muted-foreground">
                    카카오톡 설정에서 ID 검색 허용을 활성화해주세요
                  </p>
                </div>

                <div className="pt-4">
                  <div className="p-4 rounded-xl bg-primary/5 border border-primary/10">
                    <p className="text-sm text-foreground">
                      연락처 정보는 하루 최대 3명의 룸메이트에게 즉시 공개할 수 있습니다.
                    </p>
                  </div>
                </div>
              </div>
            )}

            {step === 3 && (
              <div className="space-y-6 py-4 pb-8">
                {/* 아침형/밤형 */}
                <div className="space-y-3">
                  <Label className="text-sm font-medium text-foreground">생활 패턴</Label>
                  <div className="grid grid-cols-2 gap-2">
                    <button
                      onClick={() => setChronotype("morning")}
                      className={cn(
                        "py-3 px-4 rounded-xl border-2 text-sm font-medium transition-all duration-200",
                        chronotype === "morning"
                          ? "border-primary bg-primary/5 text-primary"
                          : "border-border bg-card text-foreground hover:border-primary/50"
                      )}
                    >
                      아침형
                    </button>
                    <button
                      onClick={() => setChronotype("night")}
                      className={cn(
                        "py-3 px-4 rounded-xl border-2 text-sm font-medium transition-all duration-200",
                        chronotype === "night"
                          ? "border-primary bg-primary/5 text-primary"
                          : "border-border bg-card text-foreground hover:border-primary/50"
                      )}
                    >
                      밤형
                    </button>
                  </div>
                </div>

                {/* 잠버릇 */}
                <div className="space-y-3">
                  <Label className="text-sm font-medium text-foreground">잠버릇</Label>
                  <div className="grid grid-cols-3 gap-2">
                    {sleepingHabits.map((habit) => (
                      <button
                        key={habit.value}
                        onClick={() => setSleepingHabit(habit.value)}
                        className={cn(
                          "py-3 px-3 rounded-xl border-2 text-sm font-medium transition-all duration-200",
                          sleepingHabit === habit.value
                            ? "border-primary bg-primary/5 text-primary"
                            : "border-border bg-card text-foreground hover:border-primary/50"
                        )}
                      >
                        {habit.label}
                      </button>
                    ))}
                  </div>
                </div>

                {/* 흡연/비흡연 */}
                <div className="space-y-3">
                  <Label className="text-sm font-medium text-foreground">흡연 여부</Label>
                  <div className="grid grid-cols-2 gap-2">
                    <button
                      onClick={() => setSmoking(false)}
                      className={cn(
                        "py-3 px-4 rounded-xl border-2 text-sm font-medium transition-all duration-200",
                        smoking === false
                          ? "border-primary bg-primary/5 text-primary"
                          : "border-border bg-card text-foreground hover:border-primary/50"
                      )}
                    >
                      비흡연
                    </button>
                    <button
                      onClick={() => setSmoking(true)}
                      className={cn(
                        "py-3 px-4 rounded-xl border-2 text-sm font-medium transition-all duration-200",
                        smoking === true
                          ? "border-primary bg-primary/5 text-primary"
                          : "border-border bg-card text-foreground hover:border-primary/50"
                      )}
                    >
                      흡연
                    </button>
                  </div>
                </div>

                {/* 청결도 */}
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <Label className="text-sm font-medium text-foreground">청결도</Label>
                    <span className="text-sm font-semibold text-primary">{cleanliness[0]}/5</span>
                  </div>
                  <Slider
                    value={cleanliness}
                    onValueChange={setCleanliness}
                    min={1}
                    max={5}
                    step={1}
                    className="w-full"
                  />
                  <div className="flex justify-between text-xs text-muted-foreground">
                    <span>여유로운 편</span>
                    <span>매우 깔끔</span>
                  </div>
                </div>

                {/* 소음 민감도 */}
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <Label className="text-sm font-medium text-foreground">소음 민감도</Label>
                    <span className="text-sm font-semibold text-primary">{noiseSensitivity[0]}/5</span>
                  </div>
                  <Slider
                    value={noiseSensitivity}
                    onValueChange={setNoiseSensitivity}
                    min={1}
                    max={5}
                    step={1}
                    className="w-full"
                  />
                  <div className="flex justify-between text-xs text-muted-foreground">
                    <span>둔감한 편</span>
                    <span>매우 민감</span>
                  </div>
                </div>

                {/* 자기소개 */}
                <div className="space-y-2">
                  <Label htmlFor="introduction" className="text-sm font-medium text-foreground">
                    자기소개
                  </Label>
                  <Textarea
                    id="introduction"
                    placeholder="자신을 소개해주세요. 룸메이트에게 어필할 수 있는 내용을 적어보세요!"
                    value={introduction}
                    onChange={(e) => setIntroduction(e.target.value)}
                    className="min-h-[120px] bg-card resize-none"
                    maxLength={500}
                  />
                  <p className="text-xs text-muted-foreground text-right">{introduction.length}/500</p>
                </div>
              </div>
            )}
          </motion.div>
        </AnimatePresence>
      </div>

      {/* Footer */}
      <div className="sticky bottom-0 px-6 py-4 bg-background border-t border-border">
        <Button
          onClick={handleNext}
          className="w-full h-12 text-base font-semibold"
          disabled={
            (step === 1 && (!name || !gender || !majorCategory || !grade || !dormitory)) ||
            (step === 2 && (!phone || !kakaoId)) ||
            (step === 3 && (chronotype === null || !sleepingHabit || smoking === null || !introduction))
          }
        >
          {step === 3 ? "프로필 완성하기" : "다음"}
        </Button>
      </div>
    </div>
  )
}
