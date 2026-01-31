import { AppShell } from "@/components/common/AppShell"
import { DailyLimitProvider } from "@/components/providers/daily-limit-provider"
import { RedirectToOnboarding } from "@/components/RedirectToOnboarding"

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <RedirectToOnboarding>
      <DailyLimitProvider>
        <AppShell>{children}</AppShell>
      </DailyLimitProvider>
    </RedirectToOnboarding>
  )
}
