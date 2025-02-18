import type { ContractError } from "@/lib/ethereum"

import { useMutation, useQueryClient } from "@tanstack/react-query"

import { updateAuctionPaid } from "@/features/auction/queries/client"
import { payTest } from "@/lib/ethereum"

type ResquestType = {
  contractAddress: string
  userAddress: string
  laboratoryAddress: string
  accuracy: number
  time: number
  price: number
}

export const usePayAuction = ({ onSuccess, onError }: TanstackQuery = {}) => {
  const queryClient = useQueryClient()

  const mutation = useMutation<void, ContractError, ResquestType>({
    mutationFn: async ({
      contractAddress,
      userAddress,
      laboratoryAddress,
      accuracy,
      time,
      price,
    }) => {
      await payTest(contractAddress, userAddress, laboratoryAddress, accuracy, time, price)
      await updateAuctionPaid(contractAddress)
    },
    onSuccess: (_, { contractAddress }) => {
      queryClient.invalidateQueries({ queryKey: ["account", "balance"] })
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
