import type { ReactNode } from "react"

import { notFound } from "next/navigation"

import { getAccount } from "@/features/auth/queries/server"

type LayoutProps = {
  laboratory: ReactNode
  patient: ReactNode
}

export default async function Layout({ laboratory, patient }: LayoutProps) {
  const user = await getAccount()

  if (user.role === "LABORATORY") {
    return laboratory
  }

  if (user.role === "PATIENT") {
    return patient
  }

  return notFound()
}
