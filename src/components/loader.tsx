import type { ComponentProps } from "react"

import { Loader } from "lucide-react"

import { cn } from "@/lib/utils"

export const LoaderContainer = ({ className, ...props }: ComponentProps<"div">) => {
  return (
    <div className={cn("flex h-[25vh] min-h-40 items-center justify-center", className)} {...props}>
      <Loader className="size-10 animate-spin text-muted-foreground" />
    </div>
  )
}
