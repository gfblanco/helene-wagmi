"use client"

import { LogOut, Loader } from "lucide-react"
import { useRouter } from "next/navigation"

import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Separator } from "@/components/ui/separator"
import { useAccount } from "@/features/auth/api/use-account"
import { useLogout } from "@/features/auth/api/use-logout"
import { truncateAddress } from "@/lib/utils"

export const UserButton = () => {
  const { data: user, isLoading } = useAccount()
  const router = useRouter()
  const { mutate } = useLogout({
    onSuccess: () => router.push("/login", { scroll: false }),
  })

  if (!user || isLoading) {
    return (
      <div className="flex size-10 items-center justify-center rounded-full border border-neutral-300 bg-neutral-200">
        <Loader className="size-4 animate-spin text-muted-foreground" />
      </div>
    )
  }

  const avatarFallback = user.role.charAt(0).toUpperCase()
  const address = truncateAddress(user.address)
  const role = user.role.toLocaleLowerCase()

  return (
    <DropdownMenu>
      <DropdownMenuTrigger className="rounded-full">
        <Avatar className="size-10 transition hover:opacity-75">
          <AvatarFallback className="flex items-center justify-center bg-neutral-200 font-medium text-neutral-500">
            {avatarFallback}
          </AvatarFallback>
        </Avatar>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" sideOffset={8}>
        <DropdownMenuLabel className="flex items-center gap-2 px-2.5 py-2 text-base font-normal">
          <Avatar className="size-10">
            <AvatarFallback className="flex items-center justify-center bg-neutral-200 font-medium text-neutral-500">
              {avatarFallback}
            </AvatarFallback>
          </Avatar>
          <div className="space-y-1">
            <p className="text-sm font-semibold leading-none">{address}</p>
            <p className="text-sm capitalize leading-none text-muted-foreground">{role}</p>
          </div>
        </DropdownMenuLabel>
        <Separator className="my-1" />
        <DropdownMenuItem
          className="flex h-10 cursor-pointer items-center gap-2 px-4 font-medium"
          onSelect={() => mutate()}
        >
          <LogOut className="size-4" />
          Log out
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
