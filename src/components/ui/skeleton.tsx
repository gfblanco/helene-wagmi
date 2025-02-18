import type { ComponentProps } from "react"

import { cn } from "@/lib/utils"

export const Skeleton = ({ className, ...props }: ComponentProps<"div">) => {
  return <div className={cn("animate-pulse rounded-md bg-primary/10", className)} {...props} />
}
