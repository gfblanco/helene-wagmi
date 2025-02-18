"use client"

import type { ComponentProps } from "react"

import { CloudUpload, FileType2, X } from "lucide-react"
import { forwardRef, useCallback, useRef, useState } from "react"
import { useObjectRef } from "react-aria"
import { ZodError, ZodType } from "zod"

import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"
import { cn } from "@/lib/utils"

export const FileUploader = forwardRef<
  HTMLInputElement,
  ComponentProps<"input"> & {
    description: string
    schema: ZodType
    onSchemaError: (error: ZodError<File>) => void
    onFileChange?: (file: File | null) => void
    onFileLoaded?: (content: string) => void
    onFileError?: () => void
  }
>(
  (
    {
      disabled,
      description,
      schema,
      onSchemaError,
      onFileChange,
      onFileLoaded,
      onFileError,
      ...props
    },
    ref,
  ) => {
    const inputRef = useObjectRef(ref)
    const readerRef = useRef(new FileReader())
    const [file, setFile] = useState<File | null>(null)
    const [fileContent, setFileContent] = useState<string | null>(null)
    const [isLoading, setIsLoading] = useState(false)

    const handleFilesChange = useCallback(
      async (files: FileList | null) => {
        readerRef.current.abort()

        const file = files?.[0] || null

        const result = schema.safeParse(file)

        if (result.success) {
          setFile(file)
          onFileChange?.(file)

          if (file) {
            setIsLoading(true)

            readerRef.current.onload = (event) => {
              const content = event.target?.result

              if (typeof content === "string") {
                setIsLoading(false)
                setFileContent(content)
                onFileLoaded?.(content)
              } else {
                setIsLoading(false)
                onFileError?.()
              }
            }

            readerRef.current.onabort = () => {
              setIsLoading(false)
              setFile(null)
              setFileContent(null)
            }

            readerRef.current.onerror = () => {
              setIsLoading(false)
              onFileError?.()
            }

            readerRef.current.readAsText(file)
          } else {
            setFileContent(null)
          }
        } else {
          onSchemaError(result.error)
        }
      },
      [onFileChange, onFileError, onFileLoaded, onSchemaError, schema],
    )

    const handleRemoveFile = useCallback(() => {
      readerRef.current.abort()

      setFile(null)
      setFileContent(null)
      onFileChange?.(null)
    }, [onFileChange])

    return (
      <div className="group flex items-center gap-4" data-file={!isLoading && fileContent !== null}>
        <Avatar className="relative size-14 overflow-visible border">
          <AvatarFallback className="group inline-grid text-muted-foreground [&_svg]:size-6 [&_svg]:shrink-0">
            <CloudUpload
              className={cn(
                "col-start-1 row-start-1 transition-opacity duration-700 ease-out group-data-[file=true]:opacity-0",
                isLoading && "animate-pulse duration-1000",
              )}
            />
            <FileType2 className="col-start-1 row-start-1 opacity-0 transition-opacity duration-700 ease-out group-data-[file=true]:opacity-100" />
          </AvatarFallback>
          {!disabled && !isLoading && fileContent !== null && (
            <TooltipProvider>
              <Tooltip delayDuration={0}>
                <TooltipTrigger
                  className="absolute -right-1 -top-1 flex size-5 items-center justify-center rounded-full border bg-muted hover:bg-accent disabled:pointer-events-none"
                  type="button"
                  onClick={handleRemoveFile}
                >
                  <X className="size-3 shrink-0" />
                  <span className="sr-only">Remove</span>
                </TooltipTrigger>
                <TooltipContent arrow className="flex min-h-8 items-center gap-3 text-sm leading-5">
                  <span>Remove</span>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
          )}
        </Avatar>
        <div className="flex w-full flex-col gap-2">
          <div className="flex flex-col gap-1">
            <p className="line-clamp-1 text-ellipsis text-sm">
              {isLoading
                ? "Uploading file..."
                : fileContent !== null
                  ? `${file?.name} uploaded`
                  : "Select a file to upload"}
            </p>
            <p className="text-sm text-muted-foreground">{description}</p>
          </div>
          <Button
            className="h-7 w-fit"
            disabled={disabled}
            size="sm"
            type="button"
            variant="secondary"
            onClick={() => {
              if (inputRef.current?.value) {
                inputRef.current.value = ""
              }

              inputRef.current?.click()
            }}
          >
            Upload file
          </Button>
          <input
            ref={inputRef}
            className="hidden"
            disabled={disabled}
            type="file"
            onChange={(event) => handleFilesChange(event.target.files)}
            {...props}
          />
        </div>
      </div>
    )
  },
)
FileUploader.displayName = "FileUploader"
