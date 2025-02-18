"use client"

import { zodResolver } from "@hookform/resolvers/zod"
import { useRouter } from "next/navigation"
import { useForm } from "react-hook-form"
import { z } from "zod"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from "@/components/ui/card"
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { useCreateAuction } from "@/features/auction/api/use-create-auction"
import { evalContractError } from "@/lib/errors"
import { PriceSchema, TestTypeSchema, PreferenceSchema } from "@/lib/schemas"
import { parseTestType, parsePreference } from "@/lib/utils"

// #region CreateAuctionLaboratoryForm

export const CreateAuctionLaboratoryForm = () => {
  const schema = z.object({
    type: TestTypeSchema,
    amount: PriceSchema,
  })

  type FormSchema = z.infer<typeof schema>

  const form = useForm<FormSchema>({
    resolver: zodResolver(schema),
    reValidateMode: "onSubmit",
  })

  const { mutate, isPending } = useCreateAuction({
    onSuccess: close,
    onError: (error) =>
      evalContractError(error, {
        rejected: close,
      }),
  })

  const onSubmit = (values: FormSchema) => {}

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)}>
        <Card className="size-full border-none shadow-none">
          <CardHeader>
            <CardTitle className="text-balance text-xl font-bold uppercase">
              Request test results for your research
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <FormField
              control={form.control}
              name="type"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Test type</FormLabel>
                  <Select value={field.value} onValueChange={field.onChange}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Select a test type" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value="0">{parseTestType(0)}</SelectItem>
                      <SelectItem value="1">{parseTestType(1)}</SelectItem>
                      <SelectItem value="2">{parseTestType(2)}</SelectItem>
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="amount"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Amount</FormLabel>
                  <FormControl>
                    <Input autoComplete="off" placeholder="200" type="number" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </CardContent>
          <CardFooter className="justify-between">
            <Button className="px-4" size="lg" type="button" variant="ghost" onClick={close}>
              Cancel
            </Button>
            <LoadingButton className="w-[117px]" loading={isPending} size="lg" type="submit">
              Submit
            </LoadingButton>
          </CardFooter>
        </Card>
      </form>
    </Form>
  )
}

// #endregion

// #region CreateAuctionPatientForm

export const CreateAuctionPatientForm = () => {
  const schema = z.object({
    type: TestTypeSchema,
    preference: PreferenceSchema,
  })

  type FormSchema = z.infer<typeof schema>
  const form = useForm<FormSchema>({
    resolver: zodResolver(schema),
    reValidateMode: "onSubmit",
  })

  const router = useRouter()
  const { mutate, isPending } = useCreateAuction({
    onSuccess: () => router.push("/auctions", { scroll: false }),
    onError: (error) => evalContractError(error),
  })

  const onSubmit = (values: FormSchema) => {
    const type = parseInt(values.type)
    const preference = parseInt(values.preference)

    mutate({ type, preference })
  }

  return (
    <Form {...form}>
      <form className="flex flex-col gap-6 md:max-w-lg" onSubmit={form.handleSubmit(onSubmit)}>
        <FormField
          control={form.control}
          name="type"
          render={({ field }) => (
            <FormItem>
              <FormLabel required>Test type</FormLabel>
              <Select disabled={isPending} value={field.value} onValueChange={field.onChange}>
                <FormControl>
                  <SelectTrigger>
                    <SelectValue placeholder="Select a test type" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  <SelectItem value="0">{parseTestType(0)}</SelectItem>
                  <SelectItem value="1">{parseTestType(1)}</SelectItem>
                  <SelectItem value="2">{parseTestType(2)}</SelectItem>
                </SelectContent>
              </Select>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="preference"
          render={({ field }) => (
            <FormItem>
              <FormLabel required>Preference</FormLabel>
              <Select
                defaultValue={field.value}
                disabled={isPending}
                onValueChange={field.onChange}
              >
                <FormControl>
                  <SelectTrigger>
                    <SelectValue placeholder="Select a preference" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  <SelectItem value="0">{parsePreference(0)}</SelectItem>
                  <SelectItem value="1">{parsePreference(1)}</SelectItem>
                  <SelectItem value="2">{parsePreference(2)}</SelectItem>
                </SelectContent>
              </Select>
              <FormMessage />
            </FormItem>
          )}
        />
        <LoadingButton loading={isPending} type="submit">
          Create auction
        </LoadingButton>
      </form>
    </Form>
  )
}

// #endregion
