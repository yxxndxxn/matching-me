import { AppShell } from "@/components/common/AppShell"
import { DashboardNavProvider } from "@/components/providers/dashboard-nav-provider"
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
        <DashboardNavProvider>
          <AppShell>{children}</AppShell>
        </DashboardNavProvider>
      </DailyLimitProvider>
    </RedirectToOnboarding>
  )
}
