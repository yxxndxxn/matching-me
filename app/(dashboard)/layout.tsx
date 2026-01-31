import { AppShell } from "@/components/common/AppShell"
import { RedirectToOnboarding } from "@/components/RedirectToOnboarding"

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <RedirectToOnboarding>
      <AppShell>{children}</AppShell>
    </RedirectToOnboarding>
  )
}
