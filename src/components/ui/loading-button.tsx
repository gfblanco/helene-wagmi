import type { ComponentProps } from "react"

import { Loader } from "lucide-react"

import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"

type LoadingButtonProps = ComponentProps<typeof Button> & {
  loading?: boolean
}

export const LoadingButton = ({
  className,
  children,
  disabled,
  loading = false,
  ...props
}: LoadingButtonProps) => {
  return (
    <Button
      className={cn("disabled:opacity-100 data-[disabled=true]:opacity-50", className)}
      data-disabled={disabled && !loading}
      disabled={disabled || loading}
      {...props}
    >
      {loading && <Loader className="animate-spin" />}
      {!loading && children}
    </Button>
  )
}
