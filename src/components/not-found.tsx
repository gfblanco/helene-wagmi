import type { ComponentProps } from "react"

import { ArrowLeft } from "lucide-react"
import Link from "next/link"

import { buttonVariants } from "@/components/ui/button"
import { Separator } from "@/components/ui/separator"
import { cn } from "@/lib/utils"

// #region NotFound

export const NotFound = ({ className, ...props }: ComponentProps<"div">) => {
  return (
    <div className={cn("flex flex-col items-center gap-2", className)} {...props}>
      <div className="flex h-8 items-center gap-2">
        <h1 className="text-balance font-medium">404</h1>
        <Separator orientation="vertical" />
        <h2 className="line-clamp-1 text-balance">This page could not be found</h2>
      </div>
      <Link className={buttonVariants({ variant: "link" })} href="/" scroll={false}>
        <ArrowLeft />
        Go Back
      </Link>
    </div>
  )
}

// #endregion

// #region NotFoundContainer

export const NotFoundContainer = ({ className, ...props }: ComponentProps<"div">) => {
  return (
    <div className={cn("flex h-[25vh] min-h-40 items-center justify-center", className)} {...props}>
      <NotFound />
    </div>
  )
}

// #endregion
