import type { ReactNode } from "react"

import { redirect } from "next/navigation"

import { SidebarInset, SidebarProvider } from "@/components/ui/sidebar"
import { hasActiveSession } from "@/features/auth/queries/server"
import { AppSidebar } from "@/features/sidebar/components/sidebar"
import { changeSidebarState, getSidebarState } from "@/features/sidebar/queries/server"

type LayoutProps = {
  children: ReactNode
}

export default async function Layout({ children }: LayoutProps) {
  const session = await hasActiveSession()

  if (!session) redirect("/login")

  const open = await getSidebarState()

  return (
    <SidebarProvider defaultOpen={open} onOpenChange={changeSidebarState}>
      <AppSidebar />
      <SidebarInset>{children}</SidebarInset>
    </SidebarProvider>
  )
}
