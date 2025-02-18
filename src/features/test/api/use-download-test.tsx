import type { ContractError } from "@/lib/ethereum"

import { useMutation } from "@tanstack/react-query"
import { AES, enc } from "crypto-js"

import { downloadTest } from "@/lib/ethereum"

type DownloadTestProps = {
  contractAddress: string
  password: string
}

export const useDownloadTest = ({ onSuccess, onError }: TanstackQuery = {}) => {
  const mutation = useMutation<string, ContractError, DownloadTestProps>({
    mutationFn: async ({ contractAddress, password }) => {
      const cipher = await downloadTest(contractAddress)
      const content = AES.decrypt(cipher, password).toString(enc.Utf8)

      return content
    },
    onSuccess: (data) => {
      onSuccess?.(data)
    },
    onError: (error) => {
      onError?.(error)
    },
  })

  return mutation
}
