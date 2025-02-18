import type { ComponentProps } from "react"

import { Slot } from "@radix-ui/react-slot"

import { cn } from "@/lib/utils"

type ContainerProps = ComponentProps<"section"> & {
  asChild?: boolean
  paddingBottom?: boolean
}

export const Container = ({
  className,
  children,
  asChild,
  paddingBottom = false,
}: ContainerProps) => {
  const Comp = asChild ? Slot : "section"

  return (
    <Comp
      className={cn(
        "mx-auto w-full max-w-screen-2xl px-3 pt-4 sm:px-6",
        paddingBottom && "pb-4",
        className,
      )}
    >
      {children}
    </Comp>
  )
}
