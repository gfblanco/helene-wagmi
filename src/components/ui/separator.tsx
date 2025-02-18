"use client"

import type { ComponentPropsWithoutRef, ElementRef } from "react"

import * as SeparatorPrimitive from "@radix-ui/react-separator"
import { forwardRef } from "react"

import { cn } from "@/lib/utils"

export const Separator = forwardRef<
  ElementRef<typeof SeparatorPrimitive.Root>,
  ComponentPropsWithoutRef<typeof SeparatorPrimitive.Root>
>(({ className, orientation = "horizontal", decorative = true, ...props }, ref) => (
  <SeparatorPrimitive.Root
    ref={ref}
    className={cn(
      "shrink-0 bg-border",
      orientation === "horizontal" ? "h-px w-full" : "h-full w-px",
      className,
    )}
    decorative={decorative}
    orientation={orientation}
    {...props}
  />
))
Separator.displayName = SeparatorPrimitive.Root.displayName
