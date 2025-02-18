import type { ContractError } from "@/lib/ethereum"

import { useMutation, useQueryClient } from "@tanstack/react-query"

import { getAuction } from "@/features/auction/queries/client"
import { updateReview } from "@/features/bid/queries/client"

type ResquestType = {
  contractAddress: string
  rating: number
  comment: string
}

export const useCreateOrUpdateReview = ({ onSuccess, onError }: TanstackQuery = {}) => {
  const queryClient = useQueryClient()

  const mutation = useMutation<string, ContractError, ResquestType>({
    mutationFn: async ({ contractAddress, rating, comment }) => {
      const auction = await getAuction(contractAddress)

      await updateReview(auction.laboratoryAddress, auction.contractAddress, rating, comment)

      return auction.contractAddress
    },
    onSuccess: (contractAddress) => {
      queryClient.invalidateQueries({
        queryKey: ["account", "auctions", "bids", contractAddress],
      })
      queryClient.invalidateQueries({
        queryKey: ["account", "bids", contractAddress],
      })

      onSuccess?.()
    },
    onError: (error) => {
      onError?.(error)
    },
  })

  return mutation
}
