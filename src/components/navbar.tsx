"use client"

import type { ReactNode } from "react"

import { ArrowLeft, Menu } from "lucide-react"
import Link from "next/link"

import { Button, buttonVariants } from "@/components/ui/button"
import { Separator } from "@/components/ui/separator"
import { useSidebar } from "@/components/ui/sidebar"
import { UserButton } from "@/features/auth/components/user-button"
import { UserBalance } from "@/features/balance/components/user-balance"
import { cn } from "@/lib/utils"

// #region Navbar

type NavbarProps = {
  children?: ReactNode
  title: string
  description?: string
  label?: string
  url?: string
}

export const Navbar = ({ children, title, description, label, url }: NavbarProps) => {
  const { toggleSidebar } = useSidebar()

  const link = label && url

  return (
    <div className="sticky top-0 z-10">
      <div className="border-b border-border transition-scroll">
        <header className="mx-auto max-w-screen-2xl space-y-2 px-3 pb-4 pt-3 sm:px-6">
          <div className="flex items-center justify-between gap-4">
            <div className="flex items-center gap-2">
              <Button
                className={cn("sm:hidden [&_svg]:size-6")}
                size="icon"
                variant="ghost"
                onClick={toggleSidebar}
              >
                <Menu />
                <span className="sr-only">Show menu</span>
              </Button>
              <Separator className="mr-1 h-6 sm:hidden" orientation="vertical" />
              {link ? (
                <Link
                  className={cn(
                    buttonVariants({ variant: "link" }),
                    "text-balance px-0 font-medium text-gray-500",
                  )}
                  href={url}
                  scroll={false}
                >
                  <ArrowLeft />
                  {label}
                </Link>
              ) : (
                <h1 className="text-balance text-xl font-semibold">{title}</h1>
              )}
            </div>
            <div className="flex items-center gap-3">
              <UserBalance />
              <UserButton />
            </div>
          </div>
          {link && (
            <div className="flex flex-col items-start justify-center gap-3">
              <h1 className="text-balance text-xl font-semibold">{title}</h1>
              {description && <p className="text-pretty text-sm text-gray-500">{description}</p>}
            </div>
          )}
          {children}
        </header>
      </div>
    </div>
  )
}

// #endregion
