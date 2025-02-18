import type { ContractError } from "@/lib/ethereum"

import { useMutation, useQueryClient } from "@tanstack/react-query"

import { addAuction } from "@/features/auction/queries/client"
import { startAuction } from "@/lib/ethereum"

type ResquestType = {
  type: number
  preference: number
}

export const useCreateAuction = ({ onSuccess, onError }: TanstackQuery = {}) => {
  const queryClient = useQueryClient()

  const mutation = useMutation<string, ContractError, ResquestType>({
    mutationFn: async ({ type, preference }) => {
      const contractAuction = await startAuction(type)

      const auction = {
        ...contractAuction,
        preference,
        accepted: false,
        paid: false,
        results: false,
      }

      await addAuction(auction)

      return auction.contractAddress
    },
    onSuccess: (contractAddress) => {
      queryClient.invalidateQueries({ queryKey: ["account", "auctions"] })
      queryClient.invalidateQueries({ queryKey: ["account", "auctions", contractAddress] })

      onSuccess?.()
    },
    onError: (error) => {
      onError?.(error)
    },
  })

  return mutation
}
