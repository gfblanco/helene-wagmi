import type { ContractError } from "@/lib/ethereum"

import { useMutation, useQueryClient } from "@tanstack/react-query"

import { updateAuctionAck } from "@/features/auction/queries/client"

type ResquestType = {
  contractAddress: string
}

export const useUpdateAuctionAcknowledge = ({ onSuccess, onError }: TanstackQuery = {}) => {
  const queryClient = useQueryClient()

  const mutation = useMutation<void, ContractError, ResquestType>({
    mutationFn: async ({ contractAddress }) => {
      await updateAuctionAck(contractAddress)
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
