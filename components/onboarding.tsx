"use client"

// Phase 3.5: 온보딩 폼 유효성 검사 — react-hook-form + @hookform/resolvers/zod, 필드별 에러 바인딩

import React from "react"
import { useState } from "react"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { motion, AnimatePresence } from "framer-motion"
import { ChevronLeft, ChevronDown, User, Users, Check, Loader2 } from "lucide-react"
import { Progress } from "@/components/ui/progress"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Button } from "@/components/ui/button"
import { Slider } from "@/components/ui/slider"
import { Label } from "@/components/ui/label"
import { cn } from "@/lib/utils/cn"
import { onboardingFormSchema, type OnboardingFormSchemaType } from "@/lib/utils/onboarding-schema"
import { majorCategories, dormitories, sleepingHabits, type MajorCategory, type Dormitory, type SleepingHabit } from "@/lib/types"

/** 온보딩 제출 데이터 (Phase 2.2, 2.3: profiles + matching_posts) */
export interface OnboardingFormData {
  name: string;
  gender: "male" | "female";
  major_category: string;
  grade: string;
  dormitory: string;
  other_contact: string;
  contact: string;
  chronotype: "morning" | "night";
  sleeping_habit: string;
  smoking: boolean;
  cleanliness: number;
  noise_sensitivity: number;
  introduction: string;
}

interface OnboardingProps {
  onComplete: (data: OnboardingFormData) => void | Promise<void>;
  /** 프로필 완성 제출 중이면 true (버튼 비활성화 + 스피너) */
  isSubmitting?: boolean;
}

const grades = ["1학년", "2학년", "3학년", "4학년"] as const

const defaultValues: Partial<OnboardingFormSchemaType> = {
  name: "",
  gender: undefined,
  major_category: undefined,
  grade: undefined,
  dormitory: undefined,
  other_contact: "",
  contact: "",
  chronotype: undefined,
  sleeping_habit: undefined,
  smoking: undefined,
  cleanliness: 3,
  noise_sensitivity: 3,
  introduction: "",
}

export function Onboarding({ onComplete, isSubmitting = false }: OnboardingProps) {
  const [step, setStep] = useState(1)
  const [direction, setDirection] = useState(1)
  const [showMajorDropdown, setShowMajorDropdown] = useState(false)

  const form = useForm<OnboardingFormSchemaType>({
    resolver: zodResolver(onboardingFormSchema),
    defaultValues,
    mode: "onTouched",
  })
  const { register, watch, setValue, formState: { errors } } = form
  const name = watch("name")
  const gender = watch("gender")
  const majorCategory = watch("major_category") as MajorCategory | ""
  const grade = watch("grade")
  const dormitory = watch("dormitory") as Dormitory | ""
  const contact = watch("contact")
  const chronotype = watch("chronotype")
  const sleepingHabit = watch("sleeping_habit") as SleepingHabit | ""
  const smoking = watch("smoking")
  const cleanliness = watch("cleanliness")
  const noiseSensitivity = watch("noise_sensitivity")
  const introduction = watch("introduction")

  const progress = (step / 3) * 100
  const onValid = (data: OnboardingFormSchemaType) => {
    void onComplete(data as OnboardingFormData)
  }
  const handleNext = () => {
    if (step < 3) {
      setDirection(1)
      setStep(step + 1)
    } else {
      form.handleSubmit(onValid)()
    }
  }
  const handleBack = () => { if (step > 1) { setDirection(-1); setStep(step - 1) } }
  const slideVariants = {
    enter: (direction: number) => ({ x: direction > 0 ? 300 : -300, opacity: 0 }),
    center: { x: 0, opacity: 1 },
    exit: (direction: number) => ({ x: direction > 0 ? -300 : 300, opacity: 0 }),
  }
  const getMajorCategoryLabel = () => {
    if (!majorCategory) return "계열을 선택하세요"
    const found = majorCategories.find((c) => c.value === majorCategory)
    return found?.label || "계열을 선택하세요"
  }

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <div className="sticky top-0 z-10 bg-background pt-6 px-6 pb-4">
        <div className="flex items-center justify-center mb-6">
          <h1 className="text-xl font-bold text-primary tracking-tight">매칭미?</h1>
        </div>
        <div className="flex items-center mb-4">
          <div className="w-10 shrink-0 flex items-center">
            {step > 1 ? (
              <button onClick={handleBack} className="p-1 -ml-1 text-muted-foreground hover:text-foreground transition-colors" aria-label="뒤로">
                <ChevronLeft className="w-6 h-6" />
              </button>
            ) : null}
          </div>
          <div className="flex-1 text-center">
            <h2 className="text-lg font-semibold text-foreground">
              {step === 1 && "기본 정보"}
              {step === 2 && "연락처"}
              {step === 3 && "라이프스타일"}
            </h2>
            <p className="text-sm text-muted-foreground">Step {step} of 3</p>
          </div>
          <div className="w-10 shrink-0" />
        </div>
        <Progress value={progress} className="h-1.5" />
      </div>
      <div className="flex-1 px-6 overflow-visible">
        <AnimatePresence mode="wait" custom={direction}>
          <motion.div key={step} custom={direction} variants={slideVariants} initial="enter" animate="center" exit="exit" transition={{ duration: 0.3, ease: "easeInOut" }} className="h-full">
            {step === 1 && (
              <div className="space-y-6 py-4">
                <div className="space-y-2">
                  <Label htmlFor="name" className="text-sm font-medium text-foreground">성명</Label>
                  <Input id="name" placeholder="이름을 입력하세요" {...register("name")} className="h-12 bg-card" />
                  {errors.name && <p className="text-xs text-destructive">{errors.name.message}</p>}
                </div>
                <div className="space-y-2">
                  <Label className="text-sm font-medium text-foreground">성별</Label>
                  <div className="grid grid-cols-2 gap-3">
                    <button type="button" onClick={() => setValue("gender", "male")} className={cn("flex flex-col items-center gap-2 p-4 rounded-xl border-2 transition-all duration-200", gender === "male" ? "border-primary bg-primary/5" : "border-border bg-card hover:border-primary/50")}>
                      <div className={cn("w-12 h-12 rounded-full flex items-center justify-center transition-colors", gender === "male" ? "bg-primary/10" : "bg-muted")}>
                        <User className={cn("w-6 h-6", gender === "male" ? "text-primary" : "text-muted-foreground")} />
                      </div>
                      <span className={cn("font-medium", gender === "male" ? "text-primary" : "text-foreground")}>남성</span>
                    </button>
                    <button type="button" onClick={() => setValue("gender", "female")} className={cn("flex flex-col items-center gap-2 p-4 rounded-xl border-2 transition-all duration-200", gender === "female" ? "border-primary bg-primary/5" : "border-border bg-card hover:border-primary/50")}>
                      <div className={cn("w-12 h-12 rounded-full flex items-center justify-center transition-colors", gender === "female" ? "bg-primary/10" : "bg-muted")}>
                        <Users className={cn("w-6 h-6", gender === "female" ? "text-primary" : "text-muted-foreground")} />
                      </div>
                      <span className={cn("font-medium", gender === "female" ? "text-primary" : "text-foreground")}>여성</span>
                    </button>
                  </div>
                </div>
                <div className="space-y-2">
                  <Label className="text-sm font-medium text-foreground">계열</Label>
                  <div className="relative">
                    <button type="button" onClick={() => setShowMajorDropdown(!showMajorDropdown)} className={cn("w-full h-12 px-4 flex items-center justify-between rounded-lg border bg-card text-left transition-colors", majorCategory ? "text-foreground" : "text-muted-foreground", showMajorDropdown ? "border-primary ring-2 ring-primary/20" : "border-input")}>
                      <span>{getMajorCategoryLabel()}</span>
                      <ChevronDown className={cn("size-4 text-muted-foreground transition-transform duration-200", showMajorDropdown && "rotate-180")} />
                    </button>
                    {showMajorDropdown && (
                      <div className="absolute top-full left-0 right-0 mt-1 bg-card border border-border rounded-xl shadow-lg z-[100] max-h-64 overflow-y-auto">
                        <div className="py-1">
                          {majorCategories.map((category) => {
                            const isSelected = majorCategory === category.value
                            return (
                              <button key={category.value} type="button" onClick={() => { setValue("major_category", category.value); setShowMajorDropdown(false) }} className={cn("w-full flex items-center justify-between px-4 py-3 text-sm transition-colors", isSelected ? "bg-primary/10 text-primary font-medium" : "text-foreground hover:bg-muted")}>
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
                <div className="space-y-2">
                  <Label className="text-sm font-medium text-foreground">학년</Label>
                  <div className="grid grid-cols-4 gap-2">
                    {grades.map((g) => (
                      <button key={g} type="button" onClick={() => setValue("grade", g)} className={cn("py-3 px-2 rounded-xl border-2 text-sm font-medium transition-all duration-200", grade === g ? "border-primary bg-primary/5 text-primary" : "border-border bg-card text-foreground hover:border-primary/50")}>
                        {g}
                      </button>
                    ))}
                  </div>
                </div>
                <div className="space-y-2">
                  <Label className="text-sm font-medium text-foreground">학숙구분</Label>
                  <div className="grid grid-cols-2 gap-3">
                    {dormitories.map((dorm) => (
                      <button key={dorm.value} type="button" onClick={() => setValue("dormitory", dorm.value)} className={cn("py-4 px-4 rounded-xl border-2 text-sm font-medium transition-all duration-200", dormitory === dorm.value ? "border-primary bg-primary/5 text-primary" : "border-border bg-card text-foreground hover:border-primary/50")}>
                        {dorm.label}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            )}
            {step === 2 && (
              <div className="space-y-6 py-4">
                <div className="space-y-2">
                  <Label htmlFor="contact" className="text-sm font-medium text-foreground">연락처</Label>
                  <Input id="contact" placeholder="카카오톡 ID, 전화번호 등 연락 가능한 수단을 입력하세요" {...register("contact")} className="h-12 bg-card" />
                  {errors.contact && <p className="text-xs text-destructive">{errors.contact.message}</p>}
                  <p className="text-xs text-muted-foreground">카카오톡 ID 입력 시, 설정에서 ID 검색 허용을 활성화해주세요</p>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="other_contact" className="text-sm font-medium text-foreground">기타 연락처</Label>
                  <Input id="other_contact" placeholder="추가로 연락받을 수단이 있다면 입력하세요 ex) 이메일, 카카오톡 오픈채팅 주소 등" {...register("other_contact")} className="h-12 bg-card" />
                  <p className="text-xs text-muted-foreground">선택 입력입니다.</p>
                </div>
                <div className="pt-4">
                  <div className="p-4 rounded-xl bg-primary/5 border border-primary/10">
                    <p className="text-sm text-foreground">연락처 정보는 하루 최대 <span className="font-bold">3명</span>의 룸메이트에게 즉시 공개할 수 있습니다.</p>
                  </div>
                </div>
              </div>
            )}
            {step === 3 && (
              <div className="space-y-6 py-4 pb-8">
                <div className="space-y-2">
                  <Label className="text-sm font-medium text-foreground">생활 패턴</Label>
                  <div className="grid grid-cols-2 gap-2">
                    <button type="button" onClick={() => setValue("chronotype", "morning")} className={cn("py-3 px-4 rounded-xl border-2 text-sm font-medium transition-all duration-200", chronotype === "morning" ? "border-primary bg-primary/5 text-primary" : "border-border bg-card text-foreground hover:border-primary/50")}>아침형</button>
                    <button type="button" onClick={() => setValue("chronotype", "night")} className={cn("py-3 px-4 rounded-xl border-2 text-sm font-medium transition-all duration-200", chronotype === "night" ? "border-primary bg-primary/5 text-primary" : "border-border bg-card text-foreground hover:border-primary/50")}>밤형</button>
                  </div>
                  {errors.chronotype && <p className="text-xs text-destructive">{errors.chronotype.message}</p>}
                </div>
                <div className="space-y-2">
                  <Label className="text-sm font-medium text-foreground">잠버릇</Label>
                  <div className="grid grid-cols-3 gap-2">
                    {sleepingHabits.map((habit) => (
                      <button key={habit.value} type="button" onClick={() => setValue("sleeping_habit", habit.value)} className={cn("py-3 px-3 rounded-xl border-2 text-sm font-medium transition-all duration-200", sleepingHabit === habit.value ? "border-primary bg-primary/5 text-primary" : "border-border bg-card text-foreground hover:border-primary/50")}>
                        {habit.label}
                      </button>
                    ))}
                  </div>
                  {errors.sleeping_habit && <p className="text-xs text-destructive">{errors.sleeping_habit.message}</p>}
                </div>
                <div className="space-y-2">
                  <Label className="text-sm font-medium text-foreground">흡연 여부</Label>
                  <div className="grid grid-cols-2 gap-2">
                    <button type="button" onClick={() => setValue("smoking", false)} className={cn("py-3 px-4 rounded-xl border-2 text-sm font-medium transition-all duration-200", smoking === false ? "border-primary bg-primary/5 text-primary" : "border-border bg-card text-foreground hover:border-primary/50")}>비흡연</button>
                    <button type="button" onClick={() => setValue("smoking", true)} className={cn("py-3 px-4 rounded-xl border-2 text-sm font-medium transition-all duration-200", smoking === true ? "border-primary bg-primary/5 text-primary" : "border-border bg-card text-foreground hover:border-primary/50")}>흡연</button>
                  </div>
                </div>
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <Label className="text-sm font-medium text-foreground">청결도</Label>
                    <span className="text-sm font-semibold text-primary">{cleanliness}/5</span>
                  </div>
                  <Slider value={[cleanliness]} onValueChange={(v) => setValue("cleanliness", v[0] ?? 3)} min={1} max={5} step={1} className="w-full" />
                  <div className="flex justify-between text-xs text-muted-foreground"><span>여유로운 편</span><span>매우 깔끔</span></div>
                  {errors.cleanliness && <p className="text-xs text-destructive">{errors.cleanliness.message}</p>}
                </div>
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <Label className="text-sm font-medium text-foreground">소음 민감도</Label>
                    <span className="text-sm font-semibold text-primary">{noiseSensitivity}/5</span>
                  </div>
                  <Slider value={[noiseSensitivity]} onValueChange={(v) => setValue("noise_sensitivity", v[0] ?? 3)} min={1} max={5} step={1} className="w-full" />
                  <div className="flex justify-between text-xs text-muted-foreground"><span>둔감한 편</span><span>매우 민감</span></div>
                  {errors.noise_sensitivity && <p className="text-xs text-destructive">{errors.noise_sensitivity.message}</p>}
                </div>
                <div className="space-y-2">
                  <Label htmlFor="introduction" className="text-sm font-medium text-foreground">자기소개</Label>
                  <Textarea id="introduction" placeholder="자신을 소개해주세요. 룸메이트에게 어필할 수 있는 내용을 적어보세요!" {...register("introduction")} className="min-h-[120px] bg-card resize-none" maxLength={500} />
                  {errors.introduction && <p className="text-xs text-destructive">{errors.introduction.message}</p>}
                  <p className="text-xs text-muted-foreground text-right">{introduction.length}/500</p>
                </div>
              </div>
            )}
          </motion.div>
        </AnimatePresence>
      </div>
      <div className="sticky bottom-0 px-6 py-4 bg-background border-t border-border">
        <Button
          onClick={handleNext}
          className="w-full h-12 text-base font-semibold"
          disabled={
            isSubmitting ||
            ((step === 1 && (!name || !gender || !majorCategory || !grade || !dormitory)) ||
              (step === 2 && !contact) ||
              (step === 3 && (chronotype === null || !sleepingHabit || smoking === null || !introduction)))
          }
        >
          {isSubmitting ? (
            <>
              <Loader2 className="size-5 shrink-0 animate-spin" />
              <span>저장 중...</span>
            </>
          ) : step === 3 ? (
            "프로필 완성하기"
          ) : (
            "다음"
          )}
        </Button>
      </div>
    </div>
  )
}
