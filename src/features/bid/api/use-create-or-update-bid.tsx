import type { ContractError } from "@/lib/ethereum"

import { useMutation, useQueryClient } from "@tanstack/react-query"

import { getAuction } from "@/features/auction/queries/client"
import { getAccount } from "@/features/auth/queries/server"
import { addBid, getBid, updateBid } from "@/features/bid/queries/client"

type ResquestType = {
  contractAddress: string
  accuracy: number
  time: number
  price: number
}

export const useCreateOrUpdateBid = ({ onSuccess, onError }: TanstackQuery = {}) => {
  const queryClient = useQueryClient()

  const mutation = useMutation<string, ContractError, ResquestType>({
    mutationFn: async ({ contractAddress, accuracy, time, price }) => {
      const user = await getAccount()
      const auction = await getAuction(contractAddress)

      try {
        const bid = await getBid(user.address, auction.contractAddress)

        bid.accuracy = accuracy
        bid.time = time
        bid.price = price
        bid.updateDate = new Date()

        await updateBid(bid)

        return auction.contractAddress
      } catch {
        const bid = {
          contractAddress,
          laboratoryAddress: user.address,
          updateDate: new Date(),
          accuracy,
          time,
          price,
          rating: 0,
          comment: "",
        }

        await addBid(bid)

        return auction.contractAddress
      }
    },
    onSuccess: (contractAddress) => {
      queryClient.invalidateQueries({ queryKey: ["account", "auctions"] })
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
