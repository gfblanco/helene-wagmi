import type { ComponentProps } from "react"

import { Coffee } from "lucide-react"

import { cn } from "@/lib/utils"

export const NoResults = ({ className, ...props }: ComponentProps<"div">) => {
  return (
    <div
      className={cn("flex h-[25vh] min-h-40 flex-col items-center justify-center gap-6", className)}
      {...props}
    >
      <Coffee className="size-6 shrink-0" />
      <h4>No results found</h4>
    </div>
  )
}
