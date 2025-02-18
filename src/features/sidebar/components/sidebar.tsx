"use client"

import type { LucideIcon } from "lucide-react"

import { CalendarClock, X } from "lucide-react"
import Link from "next/link"
import { usePathname } from "next/navigation"

import { Button } from "@/components/ui/button"
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarClose,
  SidebarGroup,
  SidebarGroupContent,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarRail,
  SidebarSeparator,
  SidebarTrigger,
  useSidebar,
} from "@/components/ui/sidebar"
import { BuyTokensForm } from "@/features/balance/components/buy-tokens-form"
import { cn } from "@/lib/utils"

const routes: {
  label: string
  url: string
  icon: LucideIcon
}[] = [
  {
    label: "Auctions",
    url: "/auctions",
    icon: CalendarClock,
  },
  {
    label: "Greeter",
    url: "/greeter",
    icon: CalendarClock,
  },
]

export const AppSidebar = () => {
  const { isMobile } = useSidebar()
  const pathname = usePathname()

  return (
    <Sidebar className="border-border" collapsible="icon">
      <SidebarHeader className="pt-3">
        <SidebarMenu className="flex-row items-center justify-between">
          <SidebarMenuItem>
            <Link
              className="flex min-h-10 select-none items-center gap-[3px] rounded-md font-medium focus-visible-ring"
              href="/auctions"
              scroll={false}
            >
              <span className="flex size-8 items-center justify-center rounded-lg bg-primary text-primary-foreground">
                H
              </span>
              <span className="text-lg tracking-wider transition-sidebar group-data-[collapsible=icon]:opacity-0">
                elene
              </span>
            </Link>
          </SidebarMenuItem>
          <SidebarMenuItem>
            {isMobile ? (
              <SidebarClose asChild>
                <Button
                  className="text-primary hover:bg-transparent hover:text-primary"
                  size="icon"
                  variant="ghost"
                >
                  <X />
                  <span className="sr-only">Close menu</span>
                </Button>
              </SidebarClose>
            ) : (
              <SidebarTrigger className="rounded-lg" hideOnState="collapsed" />
            )}
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarHeader>
      <SidebarContent className="scrollbar-hide">
        <SidebarGroup>
          <SidebarGroupContent>
            <SidebarMenu>
              {routes.map((route) => (
                <SidebarMenuItem key={route.url}>
                  <SidebarMenuButton
                    asChild
                    className={cn(
                      "rounded-lg",
                      "group-hover/menu-item:bg-[rgb(236,236,238)]",
                      "focus-visible:bg-[rgb(236,236,238)] group-has-[button:focus-visible]/menu-item:bg-[rgb(236,236,238)]",
                      "data-[active=true]:bg-[rgb(236,236,238)]",
                    )}
                    isActive={pathname === route.url}
                    tooltip={route.label}
                  >
                    <Link href={route.url} scroll={false}>
                      <route.icon />
                      <span>{route.label}</span>
                    </Link>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
              <SidebarSeparator className="border-b border-dashed border-border bg-transparent pt-1 group-data-[collapsible=icon]:hidden" />
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>
      <SidebarFooter className="pb-3">
        <SidebarMenu className="gap-0">
          <SidebarMenuItem className="opacity-0 transition-sidebar group-data-[collapsible=icon]:opacity-100">
            {!isMobile && <SidebarTrigger className="rounded-lg" hideOnState="expanded" />}
          </SidebarMenuItem>
          <SidebarMenuItem>
            <BuyTokensForm className="group-data-[collapsible=icon]:hidden" />
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarFooter>
      <SidebarRail />
    </Sidebar>
  )
}
