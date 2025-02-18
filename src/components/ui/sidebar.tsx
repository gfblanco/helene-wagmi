"use client"

import type { ComponentProps, CSSProperties, ElementRef } from "react"

import { Slot } from "@radix-ui/react-slot"
import { useControllableState } from "@radix-ui/react-use-controllable-state"
import { PanelLeft } from "lucide-react"
import {
  createContext,
  forwardRef,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react"
import { useMedia } from "react-use"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Separator } from "@/components/ui/separator"
import {
  Sheet,
  SheetClose,
  SheetContent,
  SheetDescription,
  SheetTitle,
} from "@/components/ui/sheet"
import { KeyCombo, Keys } from "@/components/ui/shortcut"
import { Skeleton } from "@/components/ui/skeleton"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"
import { cn } from "@/lib/utils"

// #region SidebarContext

type SidebarContextState = {
  state: "expanded" | "collapsed"
  open: boolean
  isMobile: boolean
  setOpen: (open: boolean) => void
  openMobile: boolean
  setOpenMobile: (open: boolean) => void
  toggleSidebar: () => void
}

const SidebarContext = createContext<SidebarContextState | null>(null)

export const useSidebar = () => {
  const context = useContext(SidebarContext)

  if (!context) throw new Error("useSidebar must be used within a SidebarProvider")

  return context
}

// #endregion

// #region SidebarProvider

export const SidebarProvider = forwardRef<
  HTMLDivElement,
  ComponentProps<"div"> & {
    defaultOpen?: boolean
    open?: boolean
    onOpenChange?: (open: boolean) => void
  }
>(
  (
    { style, className, defaultOpen = true, open: openProp, onOpenChange: setOpenProp, ...props },
    ref,
  ) => {
    const [open = false, setOpen] = useControllableState({
      defaultProp: defaultOpen,
      prop: openProp,
      onChange: setOpenProp,
    })

    const isMobile = useMedia(`(max-width: 639px)`, false)
    const [openMobile, setOpenMobile] = useState(false)

    const toggleSidebar = useCallback(() => {
      return isMobile ? setOpenMobile((open) => !open) : setOpen((open) => !open)
    }, [isMobile, setOpen])

    useEffect(() => {
      const handleKeyDown = (event: KeyboardEvent) => {
        if (event.key === "b" && (event.metaKey || event.ctrlKey)) {
          event.preventDefault()
          toggleSidebar()
        }
      }

      window.addEventListener("keydown", handleKeyDown)

      return () => window.removeEventListener("keydown", handleKeyDown)
    }, [toggleSidebar])

    const state = open ? "expanded" : "collapsed"

    const context = useMemo<SidebarContextState>(
      () => ({
        state,
        open,
        isMobile,
        setOpen,
        openMobile,
        setOpenMobile,
        toggleSidebar,
      }),
      [state, open, setOpen, isMobile, openMobile, setOpenMobile, toggleSidebar],
    )

    return (
      <SidebarContext.Provider value={context}>
        <TooltipProvider delayDuration={0}>
          <div
            ref={ref}
            className={cn("flex min-h-svh w-full has-[[data-variant=inset]]:bg-muted", className)}
            style={
              {
                "--sidebar-width": "231px",
                "--sidebar-width-icon": "49px",
                ...style,
              } as CSSProperties
            }
            {...props}
          />
        </TooltipProvider>
      </SidebarContext.Provider>
    )
  },
)
SidebarProvider.displayName = "SidebarProvider"

// #endregion

// #region Sidebar

export const Sidebar = forwardRef<
  HTMLDivElement,
  ComponentProps<"div"> & {
    side?: "left" | "right"
    variant?: "sidebar" | "floating" | "inset"
    collapsible?: "offcanvas" | "icon" | "none"
  }
>(
  (
    {
      side = "left",
      variant = "sidebar",
      collapsible = "offcanvas",
      className,
      children,
      ...props
    },
    ref,
  ) => {
    const { isMobile, state, openMobile, setOpenMobile } = useSidebar()

    if (collapsible === "none") {
      return (
        <div
          ref={ref}
          className={cn(
            "flex h-full w-[--sidebar-width] flex-col bg-muted text-primary",
            className,
          )}
          {...props}
        >
          {children}
        </div>
      )
    }

    if (isMobile) {
      return (
        <Sheet open={openMobile} onOpenChange={setOpenMobile} {...props}>
          <SheetContent
            className="w-[--sidebar-width] bg-muted p-0 text-primary [&>button]:hidden"
            side={side}
            style={
              {
                "--sidebar-width": "281px",
              } as CSSProperties
            }
          >
            <SheetTitle className="sr-only">Menu</SheetTitle>
            <SheetDescription className="sr-only">
              Menu for navigating the application
            </SheetDescription>
            <div className="flex size-full flex-col">{children}</div>
          </SheetContent>
        </Sheet>
      )
    }

    return (
      <aside
        ref={ref}
        className="group hidden text-primary sm:flex"
        data-collapsible={state === "collapsed" ? collapsible : ""}
        data-side={side}
        data-state={state}
        data-variant={variant}
      >
        <div
          className={cn(
            "relative h-svh w-[--sidebar-width] bg-transparent transition-sidebar",
            "group-data-[side=right]:rotate-180",
            "group-data-[collapsible=offcanvas]:w-0",
            variant === "floating" || variant === "inset"
              ? "group-data-[collapsible=icon]:w-[calc(var(--sidebar-width-icon)_+_theme(spacing.4))]"
              : "group-data-[collapsible=icon]:w-[--sidebar-width-icon]",
          )}
        />
        <div
          className={cn(
            "fixed inset-y-0 z-20 h-svh w-[--sidebar-width] transition-sidebar",
            side === "left"
              ? "left-0 group-data-[collapsible=offcanvas]:left-[calc(var(--sidebar-width)*-1)]"
              : "right-0 group-data-[collapsible=offcanvas]:right-[calc(var(--sidebar-width)*-1)]",
            variant === "floating" || variant === "inset"
              ? "p-2 group-data-[collapsible=icon]:w-[calc(var(--sidebar-width-icon)_+_theme(spacing.4)_+2px)]"
              : "border-foreground/5 group-data-[collapsible=icon]:w-[--sidebar-width-icon] group-data-[side=left]:border-r group-data-[side=right]:border-l",
            className,
          )}
          {...props}
        >
          <div className="flex size-full flex-col bg-muted group-data-[variant=floating]:rounded-lg group-data-[variant=floating]:border group-data-[variant=floating]:border-border group-data-[variant=floating]:shadow">
            {children}
          </div>
        </div>
      </aside>
    )
  },
)
Sidebar.displayName = "Sidebar"

// #endregion

// #region SidebarTrigger

export const SidebarTrigger = forwardRef<
  ElementRef<typeof Button>,
  ComponentProps<typeof Button> & {
    hideOnState?: "expanded" | "collapsed"
  }
>(({ className, onClick, hideOnState, ...props }, ref) => {
  const { state, isMobile, toggleSidebar } = useSidebar()
  const [isOpen, setIsOpen] = useState(false)

  useEffect(() => {
    const handleKeyPress = (event: KeyboardEvent) => {
      if (event.ctrlKey && event.key === "b" && (event.metaKey || event.ctrlKey)) {
        event.preventDefault()
        setIsOpen(false)
      }
    }

    document.addEventListener("keydown", handleKeyPress)

    return () => document.removeEventListener("keydown", handleKeyPress)
  }, [])

  const button = (
    <Button
      ref={ref}
      className={cn("size-8 disabled:hidden", className)}
      disabled={isMobile || hideOnState === state}
      size="icon"
      variant="ghost"
      onClick={(event) => {
        onClick?.(event)
        toggleSidebar()
      }}
      {...props}
    >
      <PanelLeft />
      <span className="sr-only">Toggle sidebar</span>
    </Button>
  )

  if (isMobile || hideOnState === state) return button

  return (
    <Tooltip open={isOpen} onOpenChange={setIsOpen}>
      <TooltipTrigger asChild>{button}</TooltipTrigger>
      <TooltipContent
        arrow
        hideWhenDetached
        className="flex min-h-8 items-center gap-3 text-sm leading-5"
        side="right"
        sideOffset={16}
      >
        <span>Toggle sidebar</span>
        <KeyCombo
          disableTooltips
          className="h-4 min-w-4 border-none bg-muted/15 text-primary-foreground"
          keyNames={[Keys.Control, "B"]}
        />
      </TooltipContent>
    </Tooltip>
  )
})
SidebarTrigger.displayName = "SidebarTrigger"

// #endregion

// #region SidebarClose

export const SidebarClose = SheetClose

// #endregion

// #region SidebarRail

export const SidebarRail = forwardRef<HTMLButtonElement, ComponentProps<"button">>(
  ({ className, ...props }, ref) => {
    const { toggleSidebar } = useSidebar()

    return (
      <button
        ref={ref}
        aria-label="Toggle sidebar"
        className={cn(
          "absolute inset-y-0 hidden w-4 -translate-x-1/2 transition-all ease-linear sm:flex",
          "after:absolute after:inset-y-0 after:left-[calc(50%_-_1px)] after:w-[3px] hover:after:bg-border",
          "group-data-[side=left]:-right-4 [[data-side=left][data-collapsible=offcanvas]_&]:-right-2 [[data-side=left][data-state=collapsed]_&]:cursor-e-resize [[data-side=left]_&]:cursor-w-resize",
          "group-data-[side=right]:left-0 [[data-side=right][data-collapsible=offcanvas]_&]:-left-2 [[data-side=right][data-state=collapsed]_&]:cursor-w-resize [[data-side=right]_&]:cursor-e-resize",
          "group-data-[collapsible=offcanvas]:translate-x-0 group-data-[collapsible=offcanvas]:after:left-full group-data-[collapsible=offcanvas]:hover:bg-muted",
          className,
        )}
        tabIndex={-1}
        title="Toggle sidebar"
        onClick={toggleSidebar}
        {...props}
      />
    )
  },
)
SidebarRail.displayName = "SidebarRail"

// #endregion

// #region SidebarInset

export const SidebarInset = forwardRef<HTMLDivElement, ComponentProps<"main">>(
  ({ className, ...props }, ref) => {
    return (
      <main
        ref={ref}
        className={cn(
          "relative flex min-h-svh flex-1 flex-col bg-background",
          "peer-data-[variant=inset]:min-h-[calc(100svh-theme(spacing.4))] md:peer-data-[variant=inset]:m-2 md:peer-data-[state=collapsed]:peer-data-[variant=inset]:ml-2 md:peer-data-[variant=inset]:ml-0 md:peer-data-[variant=inset]:rounded-xl md:peer-data-[variant=inset]:shadow",
          className,
        )}
        {...props}
      />
    )
  },
)
SidebarInset.displayName = "SidebarInset"

// #endregion

// #region SidebarInput

export const SidebarInput = forwardRef<ElementRef<typeof Input>, ComponentProps<typeof Input>>(
  ({ className, ...props }, ref) => {
    return (
      <Input
        ref={ref}
        className={cn("h-8 w-full bg-background shadow-none focus-visible-ring", className)}
        {...props}
      />
    )
  },
)
SidebarInput.displayName = "SidebarInput"

// #endregion

// #region SidebarSeparator

export const SidebarSeparator = forwardRef<
  ElementRef<typeof Separator>,
  ComponentProps<typeof Separator>
>(({ className, ...props }, ref) => {
  return <Separator ref={ref} className={cn("mx-2 w-auto bg-border", className)} {...props} />
})
SidebarSeparator.displayName = "SidebarSeparator"

// #endregion

// #region SidebarHeader

export const SidebarHeader = forwardRef<HTMLDivElement, ComponentProps<"div">>(
  ({ className, ...props }, ref) => {
    return <div ref={ref} className={cn("flex flex-col gap-2 p-2", className)} {...props} />
  },
)
SidebarHeader.displayName = "SidebarHeader"

// #endregion

// #region SidebarContent

export const SidebarContent = forwardRef<HTMLDivElement, ComponentProps<"div">>(
  ({ className, ...props }, ref) => {
    return (
      <div
        ref={ref}
        className={cn(
          "flex min-h-0 flex-1 flex-col gap-2 overflow-auto group-data-[collapsible=icon]:overflow-hidden",
          className,
        )}
        {...props}
      />
    )
  },
)
SidebarContent.displayName = "SidebarContent"

// #endregion

// #region SidebarFooter

export const SidebarFooter = forwardRef<HTMLDivElement, ComponentProps<"div">>(
  ({ className, ...props }, ref) => {
    return <div ref={ref} className={cn("flex flex-col gap-2 p-2", className)} {...props} />
  },
)
SidebarFooter.displayName = "SidebarFooter"

// #endregion

// #region SidebarMenu

export const SidebarMenu = forwardRef<HTMLUListElement, ComponentProps<"ul">>(
  ({ className, ...props }, ref) => (
    <ul ref={ref} className={cn("flex w-full min-w-0 flex-col gap-1", className)} {...props} />
  ),
)
SidebarMenu.displayName = "SidebarMenu"

// #endregion

// #region SidebarMenuItem

export const SidebarMenuItem = forwardRef<HTMLLIElement, ComponentProps<"li">>(
  ({ className, ...props }, ref) => (
    <li ref={ref} className={cn("group/menu-item relative", className)} {...props} />
  ),
)
SidebarMenuItem.displayName = "SidebarMenuItem"

// #endregion

// #region SidebarMenuButton

export const SidebarMenuButton = forwardRef<
  HTMLButtonElement,
  ComponentProps<"button"> & {
    variant?: "default" | "outline"
    size?: "default" | "sm" | "lg"
    asChild?: boolean
    isActive?: boolean
    tooltip?: string | ComponentProps<typeof TooltipContent>
  }
>(
  (
    {
      className,
      onClick,
      variant = "default",
      size = "default",
      asChild = false,
      isActive = false,
      tooltip,
      ...props
    },
    ref,
  ) => {
    const Comp = asChild ? Slot : "button"

    const { isMobile, state, setOpenMobile } = useSidebar()

    const button = (
      <Comp
        ref={ref}
        className={cn(
          "peer/menu-button flex h-8 w-full items-center gap-2 overflow-hidden rounded-md p-2 text-left text-sm text-secondary-foreground transition-[width,height,padding] focus-visible-ring [&>span:last-child]:truncate",
          "[&>svg]:size-4 [&>svg]:shrink-0",
          "group-hover/menu-item:bg-secondary",
          "focus-visible:bg-secondary group-has-[button:focus-visible]/menu-item:bg-secondary",
          "data-[active=true]:bg-secondary data-[active=true]:font-medium",
          "disabled:pointer-events-none disabled:opacity-50",
          "group-data-[collapsible=icon]:!size-8 group-data-[collapsible=icon]:!p-2",
          "group-has-[[data-menu-action]]/menu-item:pr-8",
          variant === "outline" && "bg-background shadow-[0_0_0_1px_hsl(var(--border))]",
          size === "sm" && "h-7 text-xs",
          size === "lg" && "h-10 group-data-[collapsible=icon]:!p-0",
          className,
        )}
        data-active={isActive}
        data-size={size}
        onClick={(event) => {
          onClick?.(event)

          if (isMobile) {
            setOpenMobile(false)
          }
        }}
        {...props}
      />
    )

    if (!tooltip || isMobile || state === "expanded") return button

    if (typeof tooltip === "string") {
      tooltip = {
        children: tooltip,
      }
    }

    return (
      <Tooltip>
        <TooltipTrigger asChild>{button}</TooltipTrigger>
        <TooltipContent
          arrow
          hideWhenDetached
          className="flex min-h-8 items-center gap-3 text-sm leading-5"
          side="right"
          sideOffset={16}
          {...tooltip}
        />
      </Tooltip>
    )
  },
)
SidebarMenuButton.displayName = "SidebarMenuButton"

// #endregion

// #region SidebarMenuAction

export const SidebarMenuAction = forwardRef<
  HTMLButtonElement,
  ComponentProps<"button"> & {
    asChild?: boolean
    showOnHover?: boolean
    tooltip?: string | ComponentProps<typeof TooltipContent>
  }
>(({ className, onClick, asChild = false, showOnHover = false, tooltip, ...props }, ref) => {
  const Comp = asChild ? Slot : "button"

  const { isMobile, setOpenMobile } = useSidebar()

  const button = (
    <Comp
      ref={ref}
      data-menu-action
      className={cn(
        "absolute right-1 top-1.5 flex aspect-square w-6 items-center justify-center rounded-md p-0 text-secondary-foreground transition-transform focus-visible-ring",
        "[&>svg]:size-5 [&>svg]:shrink-0",
        "hover:bg-black/5 focus-visible:bg-black/5",
        "group-data-[collapsible=icon]:hidden",
        "peer-data-[size=default]/menu-button:top-1 peer-data-[size=lg]/menu-button:top-2 peer-data-[size=sm]/menu-button:top-0.5",
        // Increases the hit area of the button on mobile
        "after:absolute after:-inset-2 after:md:hidden",
        showOnHover &&
          "group-focus-within/menu-item:opacity-100 group-hover/menu-item:opacity-100 md:opacity-0",
        className,
      )}
      onClick={(event) => {
        onClick?.(event)

        if (isMobile) {
          setOpenMobile(false)
        }
      }}
      {...props}
    />
  )

  if (!tooltip || isMobile) return button

  if (typeof tooltip === "string") {
    tooltip = {
      children: tooltip,
    }
  }

  return (
    <Tooltip>
      <TooltipTrigger asChild>{button}</TooltipTrigger>
      <TooltipContent
        arrow
        hideWhenDetached
        className="flex min-h-8 items-center gap-3 text-sm leading-5"
        side="right"
        sideOffset={20}
        {...tooltip}
      />
    </Tooltip>
  )
})
SidebarMenuAction.displayName = "SidebarMenuAction"

// #endregion

// #region SidebarMenuBadge

export const SidebarMenuBadge = forwardRef<HTMLDivElement, ComponentProps<"div">>(
  ({ className, ...props }, ref) => (
    <div
      ref={ref}
      className={cn(
        "pointer-events-none absolute right-1 flex h-5 min-w-5 select-none items-center justify-center rounded-md px-1 text-xs font-medium tabular-nums text-secondary-foreground",
        "peer-hover/menu-button:text-secondary-foreground peer-data-[active=true]/menu-button:text-secondary-foreground",
        "peer-data-[size=default]/menu-button:top-1.5 peer-data-[size=lg]/menu-button:top-2.5 peer-data-[size=sm]/menu-button:top-1",
        "group-data-[collapsible=icon]:hidden",
        className,
      )}
      {...props}
    />
  ),
)
SidebarMenuBadge.displayName = "SidebarMenuBadge"

// #endregion

// #region SidebarMenuSkeleton

export const SidebarMenuSkeleton = forwardRef<
  HTMLDivElement,
  ComponentProps<"div"> & {
    showIcon?: boolean
  }
>(({ className, showIcon = false, ...props }, ref) => {
  const width = useMemo(() => {
    return `${Math.floor(Math.random() * 40) + 50}%`
  }, [])

  return (
    <div
      ref={ref}
      className={cn("flex h-8 items-center gap-2 rounded-md px-2", className)}
      {...props}
    >
      {showIcon && <Skeleton className="size-4 rounded-md" />}
      <Skeleton
        className="h-4 max-w-[--skeleton-width] flex-1"
        style={
          {
            "--skeleton-width": width,
          } as CSSProperties
        }
      />
    </div>
  )
})
SidebarMenuSkeleton.displayName = "SidebarMenuSkeleton"

// #endregion

// #region SidebarMenuSub

export const SidebarMenuSub = forwardRef<HTMLUListElement, ComponentProps<"ul">>(
  ({ className, ...props }, ref) => (
    <ul
      ref={ref}
      className={cn(
        "mx-3.5 flex min-w-0 translate-x-px flex-col gap-1 border-l border-border px-2.5 py-0.5",
        "group-data-[collapsible=icon]:hidden",
        className,
      )}
      {...props}
    />
  ),
)
SidebarMenuSub.displayName = "SidebarMenuSub"

// #endregion

// #region SidebarMenuSubItem

export const SidebarMenuSubItem = forwardRef<HTMLLIElement, ComponentProps<"li">>(
  ({ ...props }, ref) => {
    return <li ref={ref} {...props} />
  },
)
SidebarMenuSubItem.displayName = "SidebarMenuSubItem"

// #endregion

// #region SidebarMenuSubButton

export const SidebarMenuSubButton = forwardRef<
  HTMLAnchorElement,
  ComponentProps<"a"> & {
    asChild?: boolean
    size?: "sm" | "md"
    isActive?: boolean
  }
>(({ asChild = false, size = "md", isActive, className, ...props }, ref) => {
  const Comp = asChild ? Slot : "a"

  return (
    <Comp
      ref={ref}
      className={cn(
        "flex h-7 min-w-0 -translate-x-px items-center gap-2 overflow-hidden rounded-md px-2 text-secondary-foreground focus-visible-ring [&>span:last-child]:truncate",
        "[&>svg]:size-4 [&>svg]:shrink-0 [&>svg]:text-secondary-foreground",
        "hover:bg-secondary",
        "data-[active=true]:bg-secondary",
        "disabled:pointer-events-none disabled:opacity-50",
        "group-data-[collapsible=icon]:hidden",
        size === "sm" && "text-xs",
        size === "md" && "text-sm",
        className,
      )}
      data-active={isActive}
      data-size={size}
      {...props}
    />
  )
})
SidebarMenuSubButton.displayName = "SidebarMenuSubButton"

// #endregion

// #region SidebarGroup

export const SidebarGroup = forwardRef<HTMLDivElement, ComponentProps<"div">>(
  ({ className, ...props }, ref) => {
    return (
      <div
        ref={ref}
        className={cn("relative flex w-full min-w-0 flex-col p-2", className)}
        {...props}
      />
    )
  },
)
SidebarGroup.displayName = "SidebarGroup"

// #endregion

// #region SidebarGroupLabel

export const SidebarGroupLabel = forwardRef<
  HTMLDivElement,
  ComponentProps<"div"> & {
    asChild?: boolean
  }
>(({ className, asChild = false, ...props }, ref) => {
  const Comp = asChild ? Slot : "div"

  return (
    <Comp
      ref={ref}
      className={cn(
        "flex h-8 shrink-0 items-center rounded-md px-2 text-xs font-medium text-secondary-foreground/70 transition-[margin,opacity] duration-200 ease-linear focus-visible-ring",
        "[&>svg]:size-4 [&>svg]:shrink-0",
        "group-data-[collapsible=icon]:-mt-8 group-data-[collapsible=icon]:opacity-0",
        className,
      )}
      {...props}
    />
  )
})

SidebarGroupLabel.displayName = "SidebarGroupLabel"

// #endregion

// #region SidebarGroupAction

export const SidebarGroupAction = forwardRef<
  HTMLButtonElement,
  ComponentProps<"button"> & {
    asChild?: boolean
    tooltip?: string | ComponentProps<typeof TooltipContent>
  }
>(({ className, onClick, asChild = false, tooltip, ...props }, ref) => {
  const Comp = asChild ? Slot : "button"

  const { isMobile, setOpenMobile } = useSidebar()

  const button = (
    <Comp
      ref={ref}
      className={cn(
        "absolute right-3 top-3.5 flex aspect-square w-5 items-center justify-center rounded-md p-0 text-secondary-foreground transition-transform focus-visible-ring",
        "[&>svg]:size-4 [&>svg]:shrink-0",
        "hover:bg-secondary",
        "group-data-[collapsible=icon]:hidden",
        // Increases the hit area of the button on mobile
        "after:absolute after:-inset-2 after:md:hidden",
        className,
      )}
      onClick={(event) => {
        onClick?.(event)

        if (isMobile) {
          setOpenMobile(false)
        }
      }}
      {...props}
    />
  )

  if (!tooltip || isMobile) return button

  if (typeof tooltip === "string") {
    tooltip = {
      children: tooltip,
    }
  }

  return (
    <Tooltip>
      <TooltipTrigger asChild>{button}</TooltipTrigger>
      <TooltipContent
        arrow
        hideWhenDetached
        className="flex min-h-8 items-center gap-3 text-sm leading-5"
        side="right"
        sideOffset={20}
        {...tooltip}
      />
    </Tooltip>
  )
})
SidebarGroupAction.displayName = "SidebarGroupAction"

// #endregion

// #region SidebarGroupContent

export const SidebarGroupContent = forwardRef<HTMLDivElement, ComponentProps<"div">>(
  ({ className, ...props }, ref) => (
    <div ref={ref} className={cn("w-full text-sm", className)} {...props} />
  ),
)
SidebarGroupContent.displayName = "SidebarGroupContent"

// #endregion
