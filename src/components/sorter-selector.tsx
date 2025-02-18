"use client"

import { ArrowUp, ArrowDown, ChevronsUpDown } from "lucide-react"

import { buttonVariants } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { cn } from "@/lib/utils"

type SorterSelectorProps = {
  title: string
  sort: "asc" | "desc" | undefined
  onSortChange: (value: "asc" | "desc" | undefined) => void
}

export const SorterSelector = ({ title, sort, onSortChange }: SorterSelectorProps) => {
  return (
    <DropdownMenu>
      <DropdownMenuTrigger
        className={cn(
          buttonVariants({ size: "sm", variant: "outline" })
            .split(" ")
            .filter((className) => className !== "focus-visible-ring"),
          "border-dashed",
        )}
      >
        {sort === "asc" && <ArrowUp />}
        {sort === "desc" && <ArrowDown />}
        {!sort && <ChevronsUpDown />}
        {title}
      </DropdownMenuTrigger>
      <DropdownMenuContent align="start" className="w-32" sideOffset={8}>
        <DropdownMenuItem className="flex items-center gap-2" onClick={() => onSortChange("asc")}>
          <ArrowUp className="size-4 shrink-0 text-muted-foreground" />
          <span>Asc</span>
        </DropdownMenuItem>
        <DropdownMenuItem className="flex items-center gap-2" onSelect={() => onSortChange("desc")}>
          <ArrowDown className="size-4 shrink-0 text-muted-foreground" />
          <span>Desc</span>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
