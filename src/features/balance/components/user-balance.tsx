"use client"

import { Coins } from "lucide-react"

import { useBalance } from "@/features/balance/api/use-balance"

export const UserBalance = () => {
  const { data: balance, isLoading } = useBalance()

  if (balance === undefined || isLoading) return null

  return (
    <div className="flex h-10 items-center gap-1 text-sm font-semibold">
      {balance}
      <Coins className="size-4 shrink-0" />
    </div>
  )
}
