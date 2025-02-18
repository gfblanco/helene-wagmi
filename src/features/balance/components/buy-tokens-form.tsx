"use client"

import { zodResolver } from "@hookform/resolvers/zod"
import { useEffect } from "react"
import { useForm } from "react-hook-form"
import { z } from "zod"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form"
import { LoadingButton } from "@/components/ui/loading-button"
import { SidebarInput, useSidebar } from "@/components/ui/sidebar"
import { useBuyTokens } from "@/features/balance/api/use-buy-tokens"
import { evalContractError } from "@/lib/errors"
import { AmountSchema } from "@/lib/schemas"
import { cn } from "@/lib/utils"

type BuyTokensFormProps = {
  className?: string
}

export const BuyTokensForm = ({ className }: BuyTokensFormProps) => {
  const schema = z.object({
    amount: AmountSchema,
  })

  type FormSchema = z.infer<typeof schema>
  const form = useForm<FormSchema>({
    resolver: zodResolver(schema),
    reValidateMode: "onSubmit",
    defaultValues: {
      amount: "" as unknown as number,
    },
  })

  const { mutate, isPending } = useBuyTokens({
    onSuccess: () => {
      form.reset({ amount: "" as unknown as number })
    },
    onError: (error) =>
      evalContractError(error, {
        malformed: () =>
          form.setError("amount", {
            type: "manual",
            message: "Helene doesn't have enough funds to complete this transaction.",
          }),
      }),
  })

  const onSubmit = (values: FormSchema) => {
    mutate(values)
  }

  const { state } = useSidebar()

  useEffect(() => {
    form.reset({ amount: "" as unknown as number })
  }, [form, state])

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)}>
        <Card className={cn("min-h-[214px] shadow-none", className)}>
          <CardHeader className="p-4 pb-0">
            <CardTitle className="line-clamp-1 text-balance text-sm">
              Buy tokens on Helene
            </CardTitle>
            <CardDescription className="line-clamp-2 text-balance">
              Purchase tokens instantly and securely.
            </CardDescription>
          </CardHeader>
          <CardContent className="grid gap-2.5 p-4">
            <FormField
              control={form.control}
              name="amount"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="font-medium text-primary">Amount</FormLabel>
                  <FormControl>
                    <SidebarInput
                      autoCapitalize="off"
                      autoComplete="off"
                      disabled={isPending}
                      min={0}
                      placeholder="200"
                      spellCheck={false}
                      step={1}
                      type="number"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <LoadingButton loading={isPending} size="sm" type="submit">
              Buy tokens
            </LoadingButton>
          </CardContent>
        </Card>
      </form>
    </Form>
  )
}
