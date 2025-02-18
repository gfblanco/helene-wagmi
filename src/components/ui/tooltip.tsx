"use client"

import type { ComponentProps, ElementRef } from "react"

import * as TooltipPrimitive from "@radix-ui/react-tooltip"
import { forwardRef, useMemo } from "react"

import { cn } from "@/lib/utils"

// #region TooltipProvider

export const TooltipProvider = TooltipPrimitive.Provider

// #endregion

// #region Tooltip

export const Tooltip = TooltipPrimitive.Root

// #endregion

// #region TooltipTrigger

export const TooltipTrigger = TooltipPrimitive.Trigger

// #endregion

// #region TooltipContent

export const TooltipContent = forwardRef<
  ElementRef<typeof TooltipPrimitive.Content>,
  ComponentProps<typeof TooltipPrimitive.Content> & {
    arrow?: boolean
  }
>(({ className, children, sideOffset, arrow = false, ...props }, ref) => {
  const backgroundColor = useMemo(
    () => className?.split(" ").find((className) => className.startsWith("bg-")),
    [className],
  )

  const offset = useMemo(() => {
    if (sideOffset === undefined) {
      return arrow ? -2 : 4
    }

    return arrow ? sideOffset - 6 : sideOffset
  }, [arrow, sideOffset])

  return (
    <TooltipPrimitive.Portal>
      <TooltipPrimitive.Content
        ref={ref}
        className={cn(
          "z-50 rounded-md bg-primary px-3 py-1.5 text-xs text-primary-foreground animate-in fade-in-0 zoom-in-95",
          "data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=closed]:zoom-out-95",
          "data-[side=bottom]:slide-in-from-top-2 data-[side=left]:slide-in-from-right-2 data-[side=right]:slide-in-from-left-2 data-[side=top]:slide-in-from-bottom-2",
          className,
        )}
        sideOffset={offset}
        {...props}
      >
        {children}
        {arrow && (
          <TooltipPrimitive.Arrow asChild>
            <svg
              className={cn(
                "z-50 translate-y-[calc(-50%_-_2px)] rotate-45 rounded-[3px] bg-primary",
                backgroundColor,
              )}
              height={10}
              style={{
                clipPath: "polygon(0 100%, 100% 0, 100% 100%)",
              }}
              width={10}
            />
          </TooltipPrimitive.Arrow>
        )}
      </TooltipPrimitive.Content>
    </TooltipPrimitive.Portal>
  )
})
TooltipContent.displayName = TooltipPrimitive.Content.displayName

// #endregion
