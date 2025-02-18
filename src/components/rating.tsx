"use client"

import type { ComponentPropsWithoutRef, ElementRef } from "react"

import * as RadioGroupPrimitive from "@radix-ui/react-radio-group"
import { Star } from "lucide-react"
import { forwardRef, useState } from "react"

import { cn } from "@/lib/utils"

export const Rating = forwardRef<
  ElementRef<typeof RadioGroupPrimitive.Root>,
  ComponentPropsWithoutRef<typeof RadioGroupPrimitive.Root>
>(({ className, disabled, defaultValue, value, onValueChange, ...props }, ref) => {
  const [rating, setRating] = useState(defaultValue ? parseInt(defaultValue) : 0)
  const [hoveredRating, setHoveredRating] = useState(0)

  return (
    <RadioGroupPrimitive.Root
      className={cn(
        "flex max-w-fit cursor-pointer items-center justify-center gap-2",
        disabled && "cursor-not-allowed",
        className,
      )}
      defaultValue={defaultValue}
      value={value}
      onValueChange={(value) => {
        setRating(parseInt(value))
        onValueChange?.(value)
      }}
      {...props}
      ref={ref}
      disabled={disabled}
      loop={false}
      onMouseLeave={() => setHoveredRating(0)}
    >
      {[1, 2, 3, 4, 5].map((star) => (
        <RadioGroupPrimitive.Item
          key={star}
          className={cn(
            "rounded-md focus-visible-ring",
            "disabled:cursor-not-allowed disabled:opacity-50",
          )}
          value={star.toString()}
          onMouseEnter={() => setHoveredRating(star)}
        >
          <Star
            className={cn(
              "size-6 text-input",
              star <= (hoveredRating || rating) && "fill-yellow-400 text-yellow-400",
            )}
          />
        </RadioGroupPrimitive.Item>
      ))}
    </RadioGroupPrimitive.Root>
  )
})
Rating.displayName = RadioGroupPrimitive.Root.displayName
