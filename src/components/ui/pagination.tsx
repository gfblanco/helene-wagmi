import type { ComponentProps } from "react"

import { ChevronLeft, ChevronRight, ChevronsLeft, ChevronsRight } from "lucide-react"

import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"

// #region Pagination

export const Pagination = ({ className, ...props }: ComponentProps<"nav">) => {
  return (
    <nav
      aria-label="pagination"
      className={cn("flex w-full items-center justify-end", className)}
      role="navigation"
      {...props}
    />
  )
}

// #endregion

// #region PaginationButton

export const PaginationButton = ({
  className,
  variant = "outline",
  ...props
}: ComponentProps<typeof Button>) => {
  return <Button className={cn("size-8 p-0", className)} variant={variant} {...props} />
}

// #endregion

// #region PaginationContent

export const PaginationContent = ({ className, ...props }: ComponentProps<"ul">) => {
  return <ul className={cn("flex items-center gap-1", className)} {...props} />
}

// #endregion

// #region PaginationItem

export const PaginationItem = ({ className, ...props }: ComponentProps<"li">) => {
  return <li className={cn(className)} {...props} />
}

// #endregion

// #region PaginationFirst

export const PaginationFirst = ({ ...props }: ComponentProps<typeof PaginationButton>) => {
  return (
    <PaginationButton {...props}>
      <ChevronsLeft />
      <span className="sr-only">Go to first page</span>
    </PaginationButton>
  )
}

// #endregion

// #region PaginationPrevious

export const PaginationPrevious = ({ ...props }: ComponentProps<typeof PaginationButton>) => {
  return (
    <PaginationButton {...props}>
      <ChevronLeft />
      <span className="sr-only">Go to previous page</span>
    </PaginationButton>
  )
}

// #endregion

// #region PaginationNext

export const PaginationNext = ({ ...props }: ComponentProps<typeof PaginationButton>) => {
  return (
    <PaginationButton {...props}>
      <ChevronRight />
      <span className="sr-only">Go to next page</span>
    </PaginationButton>
  )
}

// #endregion

// #region PaginationLast

export const PaginationLast = ({ ...props }: ComponentProps<typeof PaginationButton>) => {
  return (
    <PaginationButton {...props}>
      <ChevronsRight />
      <span className="sr-only">Go to last page</span>
    </PaginationButton>
  )
}

// #endregion

// #region PaginationInfo

type PaginationInfoProps = ComponentProps<"div"> & {
  currentPage: number
  totalPages: number
}

export const PaginationInfo = ({
  className,
  currentPage,
  totalPages,
  ...props
}: PaginationInfoProps) => {
  return (
    <div
      className={cn(
        "line-clamp-1 flex w-24 items-center justify-center text-sm font-medium tabular-nums",
        className,
      )}
      {...props}
    >
      Page {totalPages === 0 ? 0 : currentPage} of {totalPages}
    </div>
  )
}

// #endregion
