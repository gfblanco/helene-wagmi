"use client"

import type { ComponentProps, ComponentPropsWithoutRef, ElementRef } from "react"
import type { ControllerProps, FieldPath, FieldValues } from "react-hook-form"

import * as LabelPrimitive from "@radix-ui/react-label"
import { Slot } from "@radix-ui/react-slot"
import { createContext, forwardRef, useContext, useId } from "react"
import { Controller, FormProvider, useFormContext } from "react-hook-form"

import { Label } from "@/components/ui/label"
import { cn } from "@/lib/utils"

// #region FormFieldContext

type FormFieldState<
  TFieldValues extends FieldValues = FieldValues,
  TName extends FieldPath<TFieldValues> = FieldPath<TFieldValues>,
> = {
  name: TName
}

const FormFieldContext = createContext<FormFieldState>({} as FormFieldState)

// #endregion

// #region FormItemContext

type FormItemState = {
  id: string
}

const FormItemContext = createContext<FormItemState>({} as FormItemState)

// #endregion

// #region Form

export const Form = FormProvider

// #endregion

// #region FormField

export const FormField = <
  TFieldValues extends FieldValues = FieldValues,
  TName extends FieldPath<TFieldValues> = FieldPath<TFieldValues>,
>({
  ...props
}: ControllerProps<TFieldValues, TName>) => {
  return (
    <FormFieldContext.Provider value={{ name: props.name }}>
      <Controller {...props} />
    </FormFieldContext.Provider>
  )
}

export const useFormField = () => {
  const fieldContext = useContext(FormFieldContext)
  const itemContext = useContext(FormItemContext)
  const { getFieldState, formState } = useFormContext()

  const fieldState = getFieldState(fieldContext.name, formState)

  if (!fieldContext) throw new Error("useFormField should be used within <FormField>")

  const { id } = itemContext

  return {
    id,
    name: fieldContext.name,
    formItemId: `${id}-form-item`,
    formDescriptionId: `${id}-form-item-description`,
    formMessageId: `${id}-form-item-message`,
    ...fieldState,
  }
}

// #endregion

// #region FormItem

export const FormItem = forwardRef<HTMLDivElement, ComponentProps<"div">>(
  ({ className, ...props }, ref) => {
    const id = useId()

    return (
      <FormItemContext.Provider value={{ id }}>
        <div ref={ref} className={cn("space-y-2", className)} {...props} />
      </FormItemContext.Provider>
    )
  },
)
FormItem.displayName = "FormItem"

// #endregion

// #region FormLabel

export const FormLabel = forwardRef<
  ElementRef<typeof LabelPrimitive.Root>,
  ComponentPropsWithoutRef<typeof LabelPrimitive.Root> & {
    required?: boolean
  }
>(({ className, children, required = false, ...props }, ref) => {
  const { formItemId } = useFormField()

  return (
    <Label
      ref={ref}
      className={cn("font-normal text-gray-500", className)}
      htmlFor={formItemId}
      {...props}
    >
      {children}
      <span className={cn("font-sans font-bold text-destructive", !required && "hidden")}>
        &nbsp;*
      </span>
    </Label>
  )
})
FormLabel.displayName = "FormLabel"

// #endregion

// #region FormControl

export const FormControl = forwardRef<
  ElementRef<typeof Slot>,
  ComponentPropsWithoutRef<typeof Slot>
>(({ ...props }, ref) => {
  const { error, formItemId, formDescriptionId, formMessageId } = useFormField()

  return (
    <Slot
      ref={ref}
      aria-describedby={!error ? `${formDescriptionId}` : `${formDescriptionId} ${formMessageId}`}
      aria-invalid={!!error}
      id={formItemId}
      {...props}
    />
  )
})
FormControl.displayName = "FormControl"

// #endregion

// #region FormDescription

export const FormDescription = forwardRef<HTMLParagraphElement, ComponentProps<"p">>(
  ({ className, ...props }, ref) => {
    const { formDescriptionId } = useFormField()

    return (
      <p
        ref={ref}
        className={cn("text-balance text-xs text-muted-foreground", className)}
        id={formDescriptionId}
        {...props}
      />
    )
  },
)
FormDescription.displayName = "FormDescription"

// #endregion

// #region FormMessage

export const FormMessage = forwardRef<HTMLParagraphElement, ComponentProps<"p">>(
  ({ className, children, ...props }, ref) => {
    const { error, formMessageId } = useFormField()
    const body = error ? String(error?.message) : children

    if (!body) return null

    return (
      <p
        ref={ref}
        className={cn("text-balance text-xs font-medium italic text-destructive", className)}
        id={formMessageId}
        {...props}
      >
        {body}
      </p>
    )
  },
)
FormMessage.displayName = "FormMessage"

// #endregion
