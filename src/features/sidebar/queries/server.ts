"use server"

import { cookies } from "next/headers"

const SIDEBAR_COOKIE = "sidebar:state"

export const getSidebarState = async () => {
  const store = cookies()
  const cookie = store.get(SIDEBAR_COOKIE)
  const isOpen = cookie ? cookie.value === "true" : true

  return isOpen
}

export const changeSidebarState = async () => {
  const store = cookies()
  const isOpen = await getSidebarState()

  store.set(SIDEBAR_COOKIE, String(!isOpen), {
    maxAge: 60 * 60 * 24 * 30,
    secure: true,
    sameSite: "strict",
    httpOnly: true,
  })
}
