"use client"

import type { VariantProps } from "class-variance-authority"
import type { ComponentProps, ComponentPropsWithoutRef, ElementRef } from "react"

import * as SheetPrimitive from "@radix-ui/react-dialog"
import { cva } from "class-variance-authority"
import { forwardRef } from "react"

import { cn } from "@/lib/utils"

// #region Sheet

export const Sheet = SheetPrimitive.Root

// #endregion

// #region SheetTrigger

export const SheetTrigger = SheetPrimitive.Trigger

// #endregion

// #region SheetPortal

export const SheetPortal = SheetPrimitive.Portal

// #endregion

// #region SheetClose

export const SheetClose = SheetPrimitive.Close

// #endregion

// #region SheetOverlay

export const SheetOverlay = forwardRef<
  ElementRef<typeof SheetPrimitive.Overlay>,
  ComponentPropsWithoutRef<typeof SheetPrimitive.Overlay>
>(({ className, ...props }, ref) => {
  return (
    <SheetPrimitive.Overlay
      className={cn(
        "fixed inset-0 z-50 bg-black/30",
        "data-[state=open]:animate-in data-[state=open]:fade-in-0",
        "data-[state=closed]:animate-out data-[state=closed]:fade-out-0",
        className,
      )}
      {...props}
      ref={ref}
    />
  )
})
SheetOverlay.displayName = SheetPrimitive.Overlay.displayName

// #endregion

// #region SheetContent

export const sheetVariants = cva(
  [
    "fixed z-50 gap-4 bg-background p-6 shadow-lg transition ease-in-out",
    "data-[state=open]:duration-500 data-[state=open]:animate-in",
    "data-[state=closed]:duration-300 data-[state=closed]:animate-out",
  ],
  {
    variants: {
      side: {
        top: cn(
          "inset-x-0 top-0 border-b",
          "data-[state=open]:slide-in-from-top",
          "data-[state=closed]:slide-out-to-top",
        ),
        bottom: cn(
          "inset-x-0 bottom-0 border-t",
          "data-[state=open]:slide-in-from-bottom",
          "data-[state=closed]:slide-out-to-bottom",
        ),
        left: cn(
          "inset-y-0 left-0 h-full w-3/4 border-r sm:max-w-sm",
          "data-[state=open]:slide-in-from-left",
          "data-[state=closed]:slide-out-to-left",
        ),
        right: cn(
          "inset-y-0 right-0 h-full w-3/4 border-l sm:max-w-sm",
          "data-[state=open]:slide-in-from-right",
          "data-[state=closed]:slide-out-to-right",
        ),
      },
    },
    defaultVariants: {
      side: "right",
    },
  },
)

export const SheetContent = forwardRef<
  ElementRef<typeof SheetPrimitive.Content>,
  ComponentPropsWithoutRef<typeof SheetPrimitive.Content> & VariantProps<typeof sheetVariants>
>(({ className, children, side = "right", ...props }, ref) => {
  return (
    <SheetPortal>
      <SheetOverlay />
      <SheetPrimitive.Content
        ref={ref}
        className={cn(sheetVariants({ side }), className)}
        {...props}
      >
        {children}
      </SheetPrimitive.Content>
    </SheetPortal>
  )
})
SheetContent.displayName = SheetPrimitive.Content.displayName

// #endregion

// #region SheetHeader

export const SheetHeader = ({ className, ...props }: ComponentProps<"div">) => {
  return (
    <div className={cn("flex flex-col space-y-2 text-center sm:text-left", className)} {...props} />
  )
}

// #endregion

// #region SheetTitle

export const SheetTitle = forwardRef<
  ElementRef<typeof SheetPrimitive.Title>,
  ComponentPropsWithoutRef<typeof SheetPrimitive.Title>
>(({ className, ...props }, ref) => {
  return (
    <SheetPrimitive.Title
      ref={ref}
      className={cn("text-lg font-semibold text-foreground", className)}
      {...props}
    />
  )
})
SheetTitle.displayName = SheetPrimitive.Title.displayName

// #endregion

// #region SheetDescription

export const SheetDescription = forwardRef<
  ElementRef<typeof SheetPrimitive.Description>,
  ComponentPropsWithoutRef<typeof SheetPrimitive.Description>
>(({ className, ...props }, ref) => {
  return (
    <SheetPrimitive.Description
      ref={ref}
      className={cn("text-sm text-muted-foreground", className)}
      {...props}
    />
  )
})
SheetDescription.displayName = SheetPrimitive.Description.displayName

// #endregion

// #region SheetFooter

export const SheetFooter = ({ className, ...props }: ComponentProps<"div">) => {
  return (
    <div
      className={cn("flex flex-col-reverse sm:flex-row sm:justify-end sm:space-x-2", className)}
      {...props}
    />
  )
}
SheetFooter.displayName = "SheetFooter"

// #endregion
