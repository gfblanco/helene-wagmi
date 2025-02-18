"use client"

import { useEffect } from "react"

import { useAccount } from "@/features/auth/api/use-account"
import { useLogin } from "@/features/auth/api/use-login"
import { useLogout } from "@/features/auth/api/use-logout"

export const AccountListener = () => {
  const query = useAccount()
  const { mutate: login } = useLogin()
  const { mutate: logout } = useLogout()

  useEffect(() => {
    const handleAccountsChanged = (accounts: unknown) => {
      if (Array.isArray(accounts) && accounts.length > 0) {
        login()
      }

      logout()
    }

    window.ethereum!.on("accountsChanged", handleAccountsChanged)

    return () => window.ethereum!.removeListener("accountsChanged", handleAccountsChanged)
  }, [login, logout, query])

  return null
}
