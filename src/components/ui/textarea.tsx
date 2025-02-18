import type { ComponentProps } from "react"

import * as React from "react"
import { forwardRef, useState } from "react"

import { cn } from "@/lib/utils"

export const Textarea = forwardRef<HTMLTextAreaElement, ComponentProps<"textarea">>(
  ({ className, value, onChange, maxLength, ...props }, ref) => {
    const [length, setLength] = useState(typeof value === "string" ? value.length : 0)

    return (
      <div className="flex flex-col gap-1">
        <textarea
          ref={ref}
          className={cn(
            "flex min-h-[60px] w-full rounded-md border border-input bg-transparent px-3 py-2 text-base shadow-sm scrollbar-hide focus-visible-ring placeholder:text-muted-foreground md:text-sm",
            "disabled:cursor-not-allowed disabled:opacity-50",
            className,
          )}
          maxLength={maxLength}
          value={value}
          onChange={(e) => {
            setLength(e.target.value.length)
            onChange?.(e)
          }}
          {...props}
        />
        {maxLength && (
          <span className="flex justify-end text-xs text-gray-500">
            {length}/{maxLength}
          </span>
        )}
      </div>
    )
  },
)
Textarea.displayName = "Textarea"
