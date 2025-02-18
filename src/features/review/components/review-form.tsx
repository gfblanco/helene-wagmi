"use client"

import type { Bid } from "@/features/bid/queries/client"

import { zodResolver } from "@hookform/resolvers/zod"
import { useForm } from "react-hook-form"
import { z } from "zod"

import { Rating } from "@/components/rating"
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form"
import { LoadingButton } from "@/components/ui/loading-button"
import { Skeleton } from "@/components/ui/skeleton"
import { Textarea } from "@/components/ui/textarea"
import { useBid } from "@/features/bid/api/use-bid"
import { useCreateOrUpdateReview } from "@/features/review/api/use-create-or-update-review"
import { CommentSchema, RatingSchema } from "@/lib/schemas"

// #region ReviewLoader

type ReviewLoaderProps = {
  contractAddress: string
}

export const ReviewLoader = ({ contractAddress }: ReviewLoaderProps) => {
  const { data, isLoading, isError } = useBid(contractAddress)

  if (!data || isLoading) {
    return (
      <div className="flex flex-col gap-6 md:max-w-lg">
        <div className="mt-1 space-y-3">
          <Skeleton className="h-4 w-16" />
          <Skeleton className="h-6 w-40" />
        </div>
        <div className="mt-1 space-y-3">
          <Skeleton className="h-4 w-28" />
          <Skeleton className="h-20 w-full" />
        </div>
        <Skeleton className="h-9 w-full bg-primary" />
      </div>
    )
  }

  if (
    isError ||
    data.auction.userAddress !== data.user.address ||
    !data.auction.results ||
    !data.bid
  ) {
    return null
  }

  return <ReviewForm bid={data.bid} contractAddress={contractAddress} />
}

// #endregion

// #region ReviewForm

type ReviewFormProps = {
  contractAddress: string
  bid: Bid
}

const ReviewForm = ({ contractAddress, bid }: ReviewFormProps) => {
  const schema = z.object({
    rating: RatingSchema,
    comment: CommentSchema,
  })

  type FormSchema = z.infer<typeof schema>
  const form = useForm<FormSchema>({
    resolver: zodResolver(schema),
    reValidateMode: "onSubmit",
    defaultValues: {
      rating: bid.rating?.toString() as FormSchema["rating"],
      comment: bid.comment,
    },
  })

  const { mutate, isPending } = useCreateOrUpdateReview()

  const onSubmit = (values: FormSchema) => {
    const rating = parseInt(values.rating)
    const { comment } = values

    mutate({
      contractAddress,
      rating: rating as Bid["rating"],
      comment: comment || "",
    })
  }

  return (
    <Form {...form}>
      <form className="flex flex-col gap-6 md:max-w-lg" onSubmit={form.handleSubmit(onSubmit)}>
        <FormField
          control={form.control}
          name="rating"
          render={({ field }) => (
            <FormItem>
              <FormLabel required>Rate the test</FormLabel>
              <FormControl>
                <Rating
                  defaultValue={field.value}
                  disabled={isPending}
                  onValueChange={field.onChange}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="comment"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Your opinion</FormLabel>
              <FormControl>
                <Textarea
                  disabled={isPending}
                  maxLength={500}
                  placeholder="Describe your experience (optional)"
                  {...field}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <LoadingButton loading={isPending} type="submit">
          Submit review
        </LoadingButton>
      </form>
    </Form>
  )
}

// #endregion
