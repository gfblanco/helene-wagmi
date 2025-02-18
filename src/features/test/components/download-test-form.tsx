"use client"

import { zodResolver } from "@hookform/resolvers/zod"
import { useRef } from "react"
import { useForm } from "react-hook-form"
import { z } from "zod"

import { NotFoundContainer } from "@/components/not-found"
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import { LoadingButton } from "@/components/ui/loading-button"
import { Skeleton } from "@/components/ui/skeleton"
import { useBid } from "@/features/bid/api/use-bid"
import { useDownloadTest } from "@/features/test/api/use-download-test"
import { TEST_MIME_TYPE } from "@/lib/constants"
import { evalContractError } from "@/lib/errors"
import { PasswordSchema } from "@/lib/schemas"
import { resolveMimeType } from "@/lib/utils"

// #region DownloadTestLoader

type DownloadTestLoaderProps = {
  contractAddress: string
}

export const DownloadTestLoader = ({ contractAddress }: DownloadTestLoaderProps) => {
  const { data, isLoading, isError } = useBid(contractAddress)

  if (!data || isLoading) {
    return (
      <div className="flex flex-col gap-6 md:max-w-lg">
        <div className="mt-1 space-y-3">
          <Skeleton className="h-4 w-16" />
          <Skeleton className="h-12 w-full" />
        </div>
        <Skeleton className="h-9 w-full bg-primary" />
      </div>
    )
  }

  if (isError || data.auction.userAddress !== data.user.address || !data.auction.results) {
    return <NotFoundContainer />
  }

  return <DownloadTestForm contractAddress={contractAddress} />
}

// #endregion

// #region DownloadTestForm

type DownloadTestFormProps = {
  contractAddress: string
}

export const DownloadTestForm = ({ contractAddress }: DownloadTestFormProps) => {
  const { mutate, isPending } = useDownloadTest({
    onSuccess: (content) => {
      const file = new Blob([content as string], { type: TEST_MIME_TYPE })

      if (file.size > 0 && anchorRef.current !== null) {
        const url = URL.createObjectURL(file)

        anchorRef.current.href = url
        anchorRef.current.click()

        URL.revokeObjectURL(url)

        return
      }

      form.setError("password", {
        type: "manual",
        message: "Invalid password.",
      })
    },
    onError: (error) => evalContractError(error),
  })

  const schema = z.object({
    password: PasswordSchema,
  })

  type FormSchema = z.infer<typeof schema>
  const form = useForm<FormSchema>({
    resolver: zodResolver(schema),
    reValidateMode: "onSubmit",
    defaultValues: {
      password: "",
    },
  })

  const onSubmit = (values: FormSchema) => {
    const { password } = values

    mutate({ contractAddress, password })
  }

  const anchorRef = useRef<HTMLAnchorElement>(null)

  return (
    <div>
      {/* eslint-disable-next-line jsx-a11y/anchor-is-valid */}
      <a
        ref={anchorRef}
        aria-hidden="true"
        className="hidden"
        download={`test.${resolveMimeType(TEST_MIME_TYPE)}`}
        tabIndex={-1}
      >
        <span className="sr-only">Download test</span>
      </a>
      <Form {...form}>
        <form className="flex flex-col gap-6 md:max-w-lg" onSubmit={form.handleSubmit(onSubmit)}>
          <FormField
            control={form.control}
            name="password"
            render={({ field }) => (
              <FormItem>
                <FormLabel required>Password</FormLabel>
                <FormControl>
                  <Input
                    autoCapitalize="off"
                    autoComplete="off"
                    disabled={isPending}
                    placeholder="Enter your password"
                    spellCheck={false}
                    {...field}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <LoadingButton loading={isPending} type="submit">
            Download test
          </LoadingButton>
        </form>
      </Form>
    </div>
  )
}

// #endregion
