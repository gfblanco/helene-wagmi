"use server"

import { cookies } from "next/headers"

export type Role = "LABORATORY" | "PATIENT"

export type User = {
  address: string
  role: Role
}

const ACCOUNT_COOKIE_NAME = "account:state"

export const hasActiveSession = async () => {
  const store = cookies()
  const cookie = store.get(ACCOUNT_COOKIE_NAME)

  return !!cookie
}

export const getAccount = async () => {
  const store = cookies()
  const cookie = store.get(ACCOUNT_COOKIE_NAME)

  if (!cookie) throw new Error("Account not found")

  const user: User = JSON.parse(cookie.value)

  return user
}

export const setAccount = async (user: User) => {
  const store = cookies()
  const value = JSON.stringify(user)

  store.set(ACCOUNT_COOKIE_NAME, value, {
    maxAge: 60 * 60 * 24 * 7,
    secure: true,
    sameSite: "strict",
    httpOnly: true,
  })
}

export const deleteAccount = async () => {
  const store = cookies()

  store.delete(ACCOUNT_COOKIE_NAME)
}
