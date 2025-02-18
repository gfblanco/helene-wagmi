"use client"

import type { Auction } from "@/features/auction/queries/client"
import type { Bid } from "@/features/bid/queries/client"

import { zodResolver } from "@hookform/resolvers/zod"
import { useRouter } from "next/navigation"
import { useEffect, useMemo, useState } from "react"
import { useForm } from "react-hook-form"
import { z } from "zod"

import { Countdown, CountdownProvider, useCountdown } from "@/components/countdown"
import { NotFoundContainer } from "@/components/not-found"
import { Card } from "@/components/ui/card"
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
import { Skeleton } from "@/components/ui/skeleton"
import { useBid } from "@/features/bid/api/use-bid"
import { useCreateOrUpdateBid } from "@/features/bid/api/use-create-or-update-bid"
import { evalContractError } from "@/lib/errors"
import { AccuracySchema, DeliveryTimeSchema, PriceSchema } from "@/lib/schemas"
import { parseAccuracy, parseDeliveryTime } from "@/lib/utils"

// #region UpdateBidLoader

type UpdateBidLoaderProps = {
  contractAddress: string
}

export const UpdateBidLoader = ({ contractAddress }: UpdateBidLoaderProps) => {
  const { data, isLoading, isError } = useBid(contractAddress)

  if (!data || isLoading) {
    return (
      <div className="flex flex-col gap-6 md:max-w-lg">
        <Card className="bg-gradient-to-b from-blue-400 to-indigo-600">
          <div className="flex items-center justify-between p-4">
            <Skeleton className="size-6 bg-white/20" />
            <Skeleton className="h-8 w-24 bg-white/20" />
            <Skeleton className="h-4 w-20 bg-white/20" />
          </div>
        </Card>
        <div className="mt-1 space-y-3">
          <Skeleton className="h-4 w-16" />
          <Skeleton className="h-12 w-full" />
        </div>
        <div className="mt-1 space-y-3">
          <Skeleton className="h-4 w-24" />
          <Skeleton className="h-12 w-full" />
        </div>
        <div className="mt-1 space-y-3">
          <Skeleton className="h-4 w-16" />
          <Skeleton className="h-12 w-full" />
        </div>
        <Skeleton className="h-9 w-full bg-primary" />
      </div>
    )
  }

  if (
    isError ||
    data.bid === null ||
    data.auction.laboratoryAddress !== "0x0000000000000000000000000000000000000000"
  ) {
    return <NotFoundContainer />
  }

  const { auction, bid, preference } = data

  return (
    <CountdownProvider endDate={auction.endDate} startDate={auction.startDate}>
      <UpdateBidForm auction={auction} bid={bid} preference={preference} />
    </CountdownProvider>
  )
}

// #endregion

// #region UpdateBidForm

type UpdateBidFormProps = {
  auction: Auction
  bid: Bid
  preference: number
}

const UpdateBidForm = ({ auction, bid, preference }: UpdateBidFormProps) => {
  const { milliseconds } = useCountdown()

  const schema = z.object({
    accuracy: AccuracySchema,
    time: DeliveryTimeSchema,
    price: PriceSchema,
  })

  const defaultValues = useMemo(
    () => ({
      accuracy:
        auction.preference === 0 && preference !== Infinity
          ? preference.toString()
          : bid.accuracy.toString(),
      time:
        auction.preference === 1 && preference !== Infinity
          ? preference.toString()
          : bid.time.toString(),
      price: auction.preference === 2 && preference !== Infinity ? preference : bid.price,
    }),
    [auction, bid, preference],
  )

  type FormSchema = z.infer<typeof schema>
  const form = useForm<FormSchema>({
    resolver: zodResolver(schema),
    reValidateMode: "onSubmit",
    defaultValues,
  })

  const [isPending, setIsPending] = useState(false)

  useEffect(() => {
    if (isPending) return

    form.reset(defaultValues)
  }, [defaultValues, form, isPending])

  const router = useRouter()
  const { mutate } = useCreateOrUpdateBid({
    onSuccess: () => router.push(`/auctions/${auction.contractAddress}`, { scroll: false }),
    onError: (error) => {
      setIsPending(false)
      evalContractError(error)
    },
  })

  const onSubmit = (values: FormSchema) => {
    if (milliseconds === 0) return

    let error = false

    const accuracy = parseInt(values.accuracy)
    const time = parseInt(values.time)
    const { price } = values

    switch (auction.preference) {
      case 0: {
        if (preference !== Infinity && preference < accuracy) {
          error = true
          form.setError("accuracy", {
            type: "manual",
            message: `Accuracy must be greater than or equal to ${parseAccuracy(preference).toLocaleLowerCase()}.`,
          })
        }

        break
      }
      case 1: {
        if (preference !== Infinity && preference < time) {
          error = true
          form.setError("time", {
            type: "manual",
            message: `Delivery time must be greater than or equal to ${parseDeliveryTime(preference).toLocaleLowerCase()}.`,
          })
        }

        break
      }
      case 2: {
        if (preference !== Infinity && preference < price) {
          error = true
          form.setError("price", {
            type: "manual",
            message: `Price must be lower than or equal to ${preference}.`,
          })
        }

        break
      }
    }

    if (error) return

    const { contractAddress } = auction

    setIsPending(true)
    mutate({ contractAddress, accuracy, time, price })
  }

  return (
    <Form {...form}>
      <form className="flex flex-col gap-6 md:max-w-lg" onSubmit={form.handleSubmit(onSubmit)}>
        <Countdown dateTime={auction.endDate.toISOString()} label="bid time left" />
        <FormField
          control={form.control}
          name="accuracy"
          render={({ field }) => (
            <FormItem>
              <FormLabel required>Accuracy {auction.preference === 0 && "(preference)"}</FormLabel>
              <Select
                disabled={isPending || milliseconds === 0}
                value={field.value}
                onValueChange={field.onChange}
              >
                <FormControl>
                  <SelectTrigger disabled={auction.preference === 0 && preference === 0}>
                    <SelectValue placeholder="Select an accuracy" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  <SelectItem value="0">{parseAccuracy(0)}</SelectItem>
                  <SelectItem disabled={auction.preference === 0 && preference < 1} value="1">
                    {parseAccuracy(1)}
                  </SelectItem>
                  <SelectItem disabled={auction.preference === 0 && preference < 2} value="2">
                    {parseAccuracy(2)}
                  </SelectItem>
                </SelectContent>
              </Select>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="time"
          render={({ field }) => (
            <FormItem>
              <FormLabel required>
                Delivery time {auction.preference === 1 && "(preference)"}
              </FormLabel>
              <Select
                disabled={isPending || milliseconds === 0}
                value={field.value}
                onValueChange={field.onChange}
              >
                <FormControl>
                  <SelectTrigger disabled={auction.preference === 1 && preference === 0}>
                    <SelectValue placeholder="Select a delivery time" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  <SelectItem value="0">{parseDeliveryTime(0)}</SelectItem>
                  <SelectItem disabled={auction.preference === 1 && preference < 1} value="1">
                    {parseDeliveryTime(1)}
                  </SelectItem>
                  <SelectItem disabled={auction.preference === 1 && preference < 2} value="2">
                    {parseDeliveryTime(2)}
                  </SelectItem>
                  <SelectItem disabled={auction.preference === 1 && preference < 3} value="3">
                    {parseDeliveryTime(3)}
                  </SelectItem>
                </SelectContent>
              </Select>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="price"
          render={({ field }) => (
            <FormItem>
              <FormLabel required>Price {auction.preference === 2 && "(preference)"}</FormLabel>
              <FormControl>
                <Input
                  autoCapitalize="off"
                  autoComplete="off"
                  disabled={isPending || milliseconds === 0}
                  max={auction.preference === 2 ? preference : undefined}
                  min={0}
                  placeholder="5"
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
        <LoadingButton disabled={milliseconds === 0} loading={isPending} type="submit">
          Update bid
        </LoadingButton>
      </form>
    </Form>
  )
}

// #endregion
