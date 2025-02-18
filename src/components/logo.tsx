import type { ComponentProps } from "react"

import { cn } from "@/lib/utils"

export const Logo = ({ className, ...props }: ComponentProps<"div">) => {
  return (
    <div className={cn("flex items-center gap-2 text-lg font-medium", className)} {...props}>
      <svg
        className="size-6"
        fill="none"
        stroke="currentColor"
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth="2"
        viewBox="0 0 24 24"
      >
        <path d="M15 6v12a3 3 0 1 0 3-3H6a3 3 0 1 0 3 3V6a3 3 0 1 0-3 3h12a3 3 0 1 0-3-3" />
      </svg>
      <span>Helene</span>
    </div>
  )
}
