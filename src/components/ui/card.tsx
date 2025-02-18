import type { ComponentProps } from "react"

import { forwardRef } from "react"

import { cn } from "@/lib/utils"

// #region Card

export const Card = forwardRef<HTMLDivElement, ComponentProps<"div">>(
  ({ className, ...props }, ref) => {
    return (
      <div
        ref={ref}
        className={cn("rounded-xl border bg-card text-card-foreground shadow", className)}
        {...props}
      />
    )
  },
)
Card.displayName = "Card"

// #endregion

// #region CardHeader

export const CardHeader = forwardRef<HTMLDivElement, ComponentProps<"div">>(
  ({ className, ...props }, ref) => {
    return <div ref={ref} className={cn("flex flex-col space-y-1.5 p-6", className)} {...props} />
  },
)
CardHeader.displayName = "CardHeader"

// #endregion

// #region CardTitle

export const CardTitle = forwardRef<HTMLHeadingElement, ComponentProps<"h3">>(
  ({ className, ...props }, ref) => {
    return (
      // eslint-disable-next-line jsx-a11y/heading-has-content
      <h3
        ref={ref}
        className={cn("font-semibold leading-none tracking-tight", className)}
        {...props}
      />
    )
  },
)
CardTitle.displayName = "CardTitle"

// #endregion

// #region CardDescription

export const CardDescription = forwardRef<HTMLParagraphElement, ComponentProps<"p">>(
  ({ className, ...props }, ref) => {
    return <p ref={ref} className={cn("text-sm text-muted-foreground", className)} {...props} />
  },
)
CardDescription.displayName = "CardDescription"

// #endregion

// #region CardContent

export const CardContent = forwardRef<HTMLDivElement, ComponentProps<"div">>(
  ({ className, ...props }, ref) => {
    return <div ref={ref} className={cn("p-6 pt-0", className)} {...props} />
  },
)
CardContent.displayName = "CardContent"

// #endregion

// #region CardFooter

export const CardFooter = forwardRef<HTMLDivElement, ComponentProps<"div">>(
  ({ className, ...props }, ref) => {
    return <div ref={ref} className={cn("flex items-center p-6 pt-0", className)} {...props} />
  },
)
CardFooter.displayName = "CardFooter"

// #endregion
