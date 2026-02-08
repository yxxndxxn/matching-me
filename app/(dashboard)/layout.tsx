import { AppShell } from "@/components/common/AppShell"
import { DashboardNavProvider } from "@/components/providers/dashboard-nav-provider"
import { DailyLimitProvider } from "@/components/providers/daily-limit-provider"
import { AuthInitialProvider } from "@/components/providers/auth-initial-provider"
import { RedirectToOnboarding } from "@/components/RedirectToOnboarding"
import { createClient } from "@/lib/supabase/server"

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  return (
    <AuthInitialProvider initialUser={user ?? null}>
      <RedirectToOnboarding>
        <DailyLimitProvider>
          <DashboardNavProvider>
            <AppShell>{children}</AppShell>
          </DashboardNavProvider>
        </DailyLimitProvider>
      </RedirectToOnboarding>
    </AuthInitialProvider>
  )
}
