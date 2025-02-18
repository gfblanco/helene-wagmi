"use client"

import type { ComponentProps } from "react"

import { useRouter } from "next/navigation"

import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { LoadingButton } from "@/components/ui/loading-button"
import { useLogin } from "@/features/auth/api/use-login"
import { evalJsonRpcError } from "@/lib/errors"
import { cn } from "@/lib/utils"

export const LoginCard = ({ className, ...props }: ComponentProps<typeof Card>) => {
  const router = useRouter()
  const { mutate, isPending } = useLogin({
    onSuccess: () => router.push("/", { scroll: false }),
    onError: (error) => evalJsonRpcError(error),
  })

  return (
    <Card className={cn("size-full border-none shadow-none", className)} {...props}>
      <CardHeader className="flex items-center">
        <CardTitle className="text-balance text-2xl">Log in to your account</CardTitle>
        <CardDescription className="text-balance text-base">
          Connect your wallet to continue
        </CardDescription>
      </CardHeader>
      <CardContent className="flex justify-center">
        <img alt="MetaMask" className="h-[66px] w-[344px]" src="metamask.svg" />
      </CardContent>
      <CardFooter>
        <LoadingButton className="w-full" loading={isPending} size="lg" onClick={() => mutate()}>
          Connect with MetaMask
        </LoadingButton>
      </CardFooter>
    </Card>
  )
}
