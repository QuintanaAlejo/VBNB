import type React from "react"
import { SupabaseStatusChecker } from "@/components/supabase-status-checker"

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <>
      <SupabaseStatusChecker />
      {children}
    </>
  )
}
