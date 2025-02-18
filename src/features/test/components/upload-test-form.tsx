"use client"

import { zodResolver } from "@hookform/resolvers/zod"
import { useId } from "react"
import { useForm } from "react-hook-form"
import { z } from "zod"

import { CopyPassword } from "@/components/copy-password"
import { FileUploader } from "@/components/file-uploader"
import { NotFoundContainer } from "@/components/not-found"
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form"
import { Label } from "@/components/ui/label"
import { LoadingButton } from "@/components/ui/loading-button"
import { Skeleton } from "@/components/ui/skeleton"
import { useBid } from "@/features/bid/api/use-bid"
import { useUploadTest } from "@/features/test/api/use-upload-test"
import { TEST_MIME_TYPE } from "@/lib/constants"
import { evalContractError } from "@/lib/errors"
import { resolveMimeType } from "@/lib/utils"

// #region UploadTestLoader

type UploadTestLoaderProps = {
  contractAddress: string
}

export const UploadTestLoader = ({ contractAddress }: UploadTestLoaderProps) => {
  const { data, isLoading, isError } = useBid(contractAddress)

  if (!data || isLoading) {
    return (
      <div className="flex flex-col gap-6 md:max-w-lg">
        <div className="mt-2 space-y-3">
          <Skeleton className="h-4 w-16" />
          <Skeleton className="h-12 w-full" />
        </div>
        <div className="mt-2 space-y-3">
          <Skeleton className="h-4 w-24" />
          <Skeleton className="h-20 w-full" />
        </div>
        <Skeleton className="h-9 w-full bg-primary" />
      </div>
    )
  }

  if (isError || data.bid === null || data.auction.laboratoryAddress !== data.user.address) {
    return <NotFoundContainer />
  }

  return <UploadTestForm contractAddress={contractAddress} done={data.auction.results} />
}

// #endregion

// #region UploadTestForm

type UploadTestFormProps = {
  contractAddress: string
  done: boolean
}

const UploadTestForm = ({ contractAddress, done }: UploadTestFormProps) => {
  const {
    data: password,
    mutate,
    isPending,
  } = useUploadTest({
    onError: (error) => evalContractError(error),
  })

  const schema = z.object({
    file: z.string({
      required_error: "Select a file.",
      invalid_type_error: "Wait while the file is loading.",
    }),
  })

  type FormSchema = z.infer<typeof schema>
  const form = useForm<FormSchema>({
    resolver: zodResolver(schema),
    reValidateMode: "onSubmit",
  })

  const onSubmit = (values: FormSchema) => {
    const { file } = values

    mutate({ contractAddress, content: file })
  }

  const passwordId = useId()

  return (
    <div className="flex flex-col gap-6 md:max-w-lg">
      <div className="space-y-2">
        <Label className="font-normal text-gray-500" htmlFor={passwordId}>
          Password
        </Label>
        <CopyPassword
          id={passwordId}
          placeholder="Click on 'Upload' to generate a password"
          value={password}
        />
      </div>
      <Form {...form}>
        <form className="flex flex-col gap-6 md:max-w-lg" onSubmit={form.handleSubmit(onSubmit)}>
          <FormField
            control={form.control}
            name="file"
            render={({ field }) => (
              <FormItem>
                <FormLabel required>Test file</FormLabel>
                <FormControl>
                  <FileUploader
                    accept={TEST_MIME_TYPE}
                    description={`Only ${resolveMimeType(TEST_MIME_TYPE).toUpperCase()} (max 5MB)`}
                    disabled={isPending || password !== undefined || done}
                    schema={z
                      .instanceof(File, {
                        message: "Select a file.",
                      })
                      .refine((value) => value.size <= 5 * 1024 * 1024, {
                        message: "File size must be less than 5MB.",
                      })
                      .refine((value) => value.type === TEST_MIME_TYPE, {
                        message: `File must be a ${resolveMimeType(TEST_MIME_TYPE).toUpperCase()}.`,
                      })}
                    onFileChange={(file) => {
                      form.clearErrors("file")

                      if (file === null) {
                        field.onChange(undefined)
                      } else {
                        field.onChange(null)
                      }
                    }}
                    onFileError={() => {
                      field.onChange(undefined)
                      form.setError("file", {
                        type: "manual",
                        message: "An error occurred while reading the file.",
                      })
                    }}
                    onFileLoaded={field.onChange}
                    onSchemaError={(error) =>
                      form.setError("file", {
                        type: "manual",
                        message: error.errors[0].message,
                      })
                    }
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <LoadingButton
            className="w-full"
            disabled={password !== undefined || done}
            loading={isPending}
            type="submit"
          >
            Upload test
          </LoadingButton>
        </form>
      </Form>
    </div>
  )
}

// #endregion
