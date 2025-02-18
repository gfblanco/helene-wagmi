"use client"

import type { ComponentPropsWithoutRef, ElementRef } from "react"

import * as PopoverPrimitive from "@radix-ui/react-popover"
import { forwardRef } from "react"

import { cn } from "@/lib/utils"

// #region Popover

export const Popover = PopoverPrimitive.Root

// #endregion

// #region Popover

export const PopoverTrigger = PopoverPrimitive.Trigger

// #endregion

// #region PopoverAnchor

export const PopoverAnchor = PopoverPrimitive.Anchor

// #endregion

// #region PopoverContent

export const PopoverContent = forwardRef<
  ElementRef<typeof PopoverPrimitive.Content>,
  ComponentPropsWithoutRef<typeof PopoverPrimitive.Content>
>(({ className, align = "center", sideOffset = 4, ...props }, ref) => {
  return (
    <PopoverPrimitive.Portal>
      <PopoverPrimitive.Content
        ref={ref}
        align={align}
        className={cn(
          "z-50 max-h-[--radix-popover-content-available-height] w-72 overflow-y-auto rounded-md border bg-popover p-4 text-popover-foreground shadow-md outline-none",
          "data-[state=open]:animate-in data-[state=open]:fade-in-0 data-[state=open]:zoom-in-95",
          "data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=closed]:zoom-out-95",
          "data-[side=bottom]:slide-in-from-top-2 data-[side=left]:slide-in-from-right-2 data-[side=right]:slide-in-from-left-2 data-[side=top]:slide-in-from-bottom-2",
          className,
        )}
        sideOffset={sideOffset}
        {...props}
      />
    </PopoverPrimitive.Portal>
  )
})
PopoverContent.displayName = PopoverPrimitive.Content.displayName

// #endregion
