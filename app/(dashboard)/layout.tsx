import { AppShell } from "@/components/common/AppShell"

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return <AppShell dailyRevealsRemaining={3}>{children}</AppShell>
}
