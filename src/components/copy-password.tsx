"use client"

import type { ComponentProps } from "react"

import { Copy } from "lucide-react"
import { useCallback, useState } from "react"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { cn } from "@/lib/utils"

export const CopyPassword = ({ className, value, ...props }: ComponentProps<"input">) => {
  const [copied, setCopied] = useState(false)

  const handleCopyPassword = useCallback(() => {
    if (value !== undefined) {
      navigator.clipboard.writeText(value.toString())
      setCopied(true)
      setTimeout(() => setCopied(false), 1000)
    }
  }, [value])

  return (
    <div className="relative overflow-hidden rounded-md bg-muted p-2 font-mono">
      <div className="flex items-center gap-2">
        <Button
          className="hover:bg-muted"
          disabled={!value}
          size="icon"
          variant="ghost"
          onClick={handleCopyPassword}
        >
          <Copy />
          <span className="sr-only">Copy password</span>
        </Button>
        <Input
          readOnly
          className={cn("h-10 grow pl-4 disabled:cursor-default", className)}
          disabled={!value}
          value={value}
          {...props}
        />
      </div>
      {copied && (
        <span className="absolute inset-0 flex animate-fade-up items-center justify-center bg-green-500 font-bold text-primary-foreground">
          Copied!
        </span>
      )}
    </div>
  )
}
