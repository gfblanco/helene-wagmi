import { z } from "zod"

export const AmountSchema = z.preprocess(
  (value) => {
    if (value === undefined || value === "") return undefined

    const amount = parseFloat(value as string)

    return isNaN(amount) ? undefined : amount
  },
  z
    .number({
      required_error: "Enter an amount.",
    })
    .multipleOf(1, {
      message: "Amount must be in increments of 1.",
    })
    .positive({
      message: "Amount must be a positive number.",
    }),
)

export const TestTypeSchema = z.string({
  required_error: "Select a test type.",
})

export const PreferenceSchema = z
  .string({
    required_error: "Select a preference.",
  })
  .min(1, {
    message: "Select a preference.",
  })

export const AccuracySchema = z
  .string({
    required_error: "Select an accuracy.",
  })
  .min(1, {
    message: "Select an accuracy.",
  })

export const DeliveryTimeSchema = z
  .string({
    required_error: "Select a delivery time.",
  })
  .min(1, {
    message: "Select a delivery time.",
  })

export const PriceSchema = z.preprocess(
  (value) => {
    if (value === undefined || value === "") return undefined

    const amount = parseFloat(value as string)

    return isNaN(amount) ? undefined : amount
  },
  z
    .number({
      required_error: "Enter an price.",
    })
    .multipleOf(1, {
      message: "Price must be in increments of 1.",
    })
    .positive({
      message: "Price must be a positive number.",
    }),
)

export const PasswordSchema = z
  .string({
    required_error: "Enter the test password.",
  })
  .trim()
  .min(1, {
    message: "Enter the test password.",
  })

export const RatingSchema = z.enum(["1", "2", "3", "4", "5"], {
  message: "Select your rating.",
})

export const CommentSchema = z
  .string({
    message: "Enter a comment.",
  })
  .max(500, {
    message: "Comment must be at most 500 characters.",
  })
  .optional()
