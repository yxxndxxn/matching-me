"use client"

// 프로필 수정 폼: 현재 프로필 데이터로 폼 채움 → PUT /api/profile → 저장 후 콜백

import React, { useState, useRef } from "react"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { ChevronLeft, ChevronDown, User, Users, Check, Camera } from "lucide-react"
import { Input } from "@/components/ui/input"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Textarea } from "@/components/ui/textarea"
import { Button } from "@/components/ui/button"
import { Slider } from "@/components/ui/slider"
import { Label } from "@/components/ui/label"
import { cn } from "@/lib/utils/cn"
import { onboardingFormSchema, type OnboardingFormSchemaType } from "@/lib/utils/onboarding-schema"
import { majorCategories, dormitories, sleepingHabits, getMajorCategoryLabel, type MajorCategory, type Dormitory, type SleepingHabit } from "@/lib/types"
import type { UserProfile } from "@/lib/types"
import { toast } from "sonner"

const grades = ["1학년", "2학년", "3학년", "4학년"]

interface ProfileEditFormProps {
  profile: UserProfile
  onSaved: () => void
  onCancel: () => void
}

function profileToDefaultValues(profile: UserProfile): Partial<OnboardingFormSchemaType> {
  return {
    name: profile.name,
    gender: profile.gender,
    major_category: profile.majorCategory,
    grade: profile.grade,
    dormitory: profile.dormitory,
    other_contact: profile.otherContact ?? "",
    kakao_id: profile.kakaoId ?? "",
    chronotype: profile.chronotype,
    sleeping_habit: profile.sleepingHabit,
    smoking: profile.smoking,
    cleanliness: profile.cleanliness ?? 3,
    noise_sensitivity: profile.noiseSensitivity ?? 3,
    introduction: profile.introduction ?? "",
  }
}

export function ProfileEditForm({ profile, onSaved, onCancel }: ProfileEditFormProps) {
  const [showMajorDropdown, setShowMajorDropdown] = useState(false)
  const [saving, setSaving] = useState(false)
  const [avatarUrl, setAvatarUrl] = useState<string | undefined>(profile.avatarUrl)
  const [uploadingAvatar, setUploadingAvatar] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const form = useForm<OnboardingFormSchemaType>({
    resolver: zodResolver(onboardingFormSchema),
    defaultValues: profileToDefaultValues(profile),
    mode: "onTouched",
  })
  const { register, watch, setValue, formState: { errors } } = form
  const name = watch("name")
  const gender = watch("gender")
  const majorCategory = watch("major_category") as MajorCategory | ""
  const grade = watch("grade")
  const dormitory = watch("dormitory") as Dormitory | ""
  const kakaoId = watch("kakao_id")
  const chronotype = watch("chronotype")
  const sleepingHabit = watch("sleeping_habit") as SleepingHabit | ""
  const smoking = watch("smoking")
  const cleanliness = watch("cleanliness")
  const noiseSensitivity = watch("noise_sensitivity")
  const introduction = watch("introduction")

  const handleAvatarChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return
    setUploadingAvatar(true)
    try {
      const formData = new FormData()
      formData.append("file", file)
      const res = await fetch("/api/profile/avatar", { method: "POST", body: formData })
      const json = await res.json().catch(() => ({}))
      if (!res.ok) {
        toast.error("사진 업로드에 실패했어요.", { description: (json.error as string) ?? "다시 시도해 주세요." })
        return
      }
      const url = json.avatar_url as string
      if (url) setAvatarUrl(url)
      toast.success("사진이 변경되었어요. 저장하기를 눌러 반영해 주세요.")
    } catch {
      toast.error("사진 업로드에 실패했어요.", { description: "네트워크를 확인해 주세요." })
    } finally {
      setUploadingAvatar(false)
      e.target.value = ""
    }
  }

  const onSubmit = async (data: OnboardingFormSchemaType) => {
    setSaving(true)
    try {
      const res = await fetch("/api/profile", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: data.name,
          avatar_url: avatarUrl ?? null,
          gender: data.gender,
          major_category: data.major_category,
          grade: data.grade,
          dormitory: data.dormitory,
          other_contact: data.other_contact || null,
          kakao_id: data.kakao_id || null,
          chronotype: data.chronotype,
          sleeping_habit: data.sleeping_habit,
          smoking: data.smoking,
          cleanliness: data.cleanliness,
          noise_sensitivity: data.noise_sensitivity,
          introduction: data.introduction || null,
        }),
      })
      const json = await res.json().catch(() => ({}))
      if (!res.ok) {
        toast.error("저장에 실패했어요.", { description: (json.error as string) ?? "다시 시도해 주세요." })
        return
      }
      toast.success("프로필이 저장되었어요.")
      onSaved()
    } catch {
      toast.error("저장에 실패했어요.", { description: "네트워크를 확인해 주세요." })
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className="min-h-screen pb-24 bg-background flex flex-col">
      <div className="max-w-2xl mx-auto lg:max-w-4xl w-full flex flex-col flex-1">
        <div className="sticky top-0 z-10 bg-background border-b border-border px-6 py-4 flex items-center">
          <div className="w-10 shrink-0 flex items-center">
            <button type="button" onClick={onCancel} className="p-1 -ml-1 text-muted-foreground hover:text-foreground transition-colors" aria-label="뒤로">
              <ChevronLeft className="w-6 h-6" />
            </button>
          </div>
          <h1 className="flex-1 text-center text-lg font-semibold text-foreground">프로필 수정</h1>
          <div className="w-10 shrink-0" />
        </div>
        <form onSubmit={form.handleSubmit(onSubmit)} className="flex-1 px-6 py-6 space-y-8">
        <section className="space-y-4">
          <h2 className="text-sm font-semibold text-muted-foreground uppercase tracking-wide">프로필 사진</h2>
          <div className="flex flex-col items-center gap-3">
            <input
              ref={fileInputRef}
              type="file"
              accept="image/jpeg,image/png,image/webp"
              className="hidden"
              onChange={handleAvatarChange}
            />
            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              disabled={uploadingAvatar}
              className="relative group rounded-full focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2"
              aria-label="프로필 사진 변경"
            >
              <Avatar className="size-24 border-4 border-primary/20">
                <AvatarImage src={avatarUrl || "/placeholder.svg"} alt={name} />
                <AvatarFallback className="bg-secondary text-secondary-foreground text-2xl font-semibold">
                  {name?.slice(0, 2).toUpperCase() ?? "?"}
                </AvatarFallback>
              </Avatar>
              <span className="absolute inset-0 flex items-center justify-center rounded-full bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity">
                <Camera className="size-8 text-white" />
              </span>
            </button>
            <p className="text-xs text-muted-foreground">클릭하여 사진 변경 (JPEG, PNG, WebP, 2MB 이하)</p>
          </div>
        </section>

        <section className="space-y-4">
          <h2 className="text-sm font-semibold text-muted-foreground uppercase tracking-wide">기본 정보</h2>
          <div className="space-y-2">
            <Label htmlFor="edit-name">성명</Label>
            <Input id="edit-name" placeholder="이름을 입력하세요" {...register("name")} className="h-12 bg-card" />
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
                <span>{majorCategory ? getMajorCategoryLabel(majorCategory) : "계열을 선택하세요"}</span>
                <ChevronDown className={cn("size-4 text-muted-foreground transition-transform duration-200", showMajorDropdown && "rotate-180")} />
              </button>
              {showMajorDropdown && (
                <div className="absolute top-full left-0 right-0 mt-1 bg-card border border-border rounded-xl shadow-lg z-[100] max-h-64 overflow-y-auto">
                  <div className="py-1">
                    {majorCategories.map((category) => (
                      <button key={category.value} type="button" onClick={() => { setValue("major_category", category.value); setShowMajorDropdown(false) }} className={cn("w-full flex items-center justify-between px-4 py-3 text-sm transition-colors", majorCategory === category.value ? "bg-primary/10 text-primary font-medium" : "text-foreground hover:bg-muted")}>
                        <span>{category.label}</span>
                        {majorCategory === category.value && <Check className="size-4" />}
                      </button>
                    ))}
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
        </section>

        <section className="space-y-4">
          <h2 className="text-sm font-semibold text-muted-foreground uppercase tracking-wide">연락처</h2>
          <div className="space-y-2">
            <Label htmlFor="edit-kakao_id">카카오톡 ID</Label>
            <Input id="edit-kakao_id" placeholder="카카오톡 ID" {...register("kakao_id")} className="h-12 bg-card" />
            {errors.kakao_id && <p className="text-xs text-destructive">{errors.kakao_id.message}</p>}
          </div>
          <div className="space-y-2">
            <Label htmlFor="edit-other_contact">기타 연락처</Label>
            <Input id="edit-other_contact" placeholder="이메일, SNS 등" {...register("other_contact")} className="h-12 bg-card" />
          </div>
        </section>

        <section className="space-y-4">
          <h2 className="text-sm font-semibold text-muted-foreground uppercase tracking-wide">라이프스타일</h2>
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
            {errors.cleanliness && <p className="text-xs text-destructive">{errors.cleanliness.message}</p>}
          </div>
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <Label className="text-sm font-medium text-foreground">소음 민감도</Label>
              <span className="text-sm font-semibold text-primary">{noiseSensitivity}/5</span>
            </div>
            <Slider value={[noiseSensitivity]} onValueChange={(v) => setValue("noise_sensitivity", v[0] ?? 3)} min={1} max={5} step={1} className="w-full" />
            {errors.noise_sensitivity && <p className="text-xs text-destructive">{errors.noise_sensitivity.message}</p>}
          </div>
          <div className="space-y-2">
            <Label htmlFor="edit-introduction">자기소개</Label>
            <Textarea id="edit-introduction" placeholder="자신을 소개해주세요" {...register("introduction")} className="min-h-[120px] bg-card resize-none" maxLength={500} />
            {errors.introduction && <p className="text-xs text-destructive">{errors.introduction.message}</p>}
            <p className="text-xs text-muted-foreground text-right">{introduction.length}/500</p>
          </div>
        </section>

        <div className="flex gap-3 pt-4">
          <Button type="button" variant="outline" onClick={onCancel} className="flex-1 h-12">
            취소
          </Button>
          <Button type="submit" disabled={saving} className="flex-1 h-12">
            {saving ? "저장 중…" : "저장하기"}
          </Button>
        </div>
        </form>
      </div>
    </div>
  )
}
