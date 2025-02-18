import type { ReactNode } from "react"

import { notFound } from "next/navigation"

import { getAccount } from "@/features/auth/queries/server"

type LayoutProps = {
  children: ReactNode
}

export default async function Layout({ children }: LayoutProps) {
  const user = await getAccount()

  if (user.role === "PATIENT") notFound()

  return children
}
