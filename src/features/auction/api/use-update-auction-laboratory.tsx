import type { ContractError } from "@/lib/ethereum"

import { useMutation, useQueryClient } from "@tanstack/react-query"

import { updateAuctionLaboratory } from "@/features/auction/queries/client"

type ResquestType = {
  contractAddress: string
  laboratoryAddress: string | undefined
}

export const useUpdateAuctionLaboratory = ({ onSuccess, onError }: TanstackQuery = {}) => {
  const queryClient = useQueryClient()

  const mutation = useMutation<void, ContractError, ResquestType>({
    mutationFn: async ({ contractAddress, laboratoryAddress }) => {
      await updateAuctionLaboratory(contractAddress, laboratoryAddress)
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
