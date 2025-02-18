import type { ContractError } from "@/lib/ethereum"

import { useMutation, useQueryClient } from "@tanstack/react-query"
import { AES } from "crypto-js"

import { updateResultsReady } from "@/features/auction/queries/client"
import { signMessage, uploadTest } from "@/lib/ethereum"
import { fortuna, generateMessage, login } from "@/lib/fortuna"

type UploadTestProps = {
  contractAddress: string
  content: string
}

export const useUploadTest = ({ onSuccess, onError }: TanstackQuery = {}) => {
  const queryClient = useQueryClient()

  const mutation = useMutation<string, ContractError, UploadTestProps>({
    mutationFn: async ({ contractAddress, content }) => {
      const { uuid, message } = await generateMessage()
      const { signature } = await signMessage(message)
      const token = await login(signature.substring(2), uuid)
      const password = await fortuna(token)
      const cipher = AES.encrypt(content, password).toString()

      await uploadTest(contractAddress, cipher)
      await updateResultsReady(contractAddress)

      return password
    },
    onSuccess: (_, { contractAddress }) => {
      queryClient.invalidateQueries({ queryKey: ["account", "auctions"] })
      queryClient.invalidateQueries({ queryKey: ["account", "auctions", "bids", contractAddress] })
      queryClient.invalidateQueries({ queryKey: ["account", "bids", contractAddress] })

      onSuccess?.()
    },
    onError: (error) => {
      onError?.(error)
    },
  })

  return mutation
}
