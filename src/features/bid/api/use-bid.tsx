import { useQuery } from "@tanstack/react-query"

import { getAuction } from "@/features/auction/queries/client"
import { getAccount } from "@/features/auth/queries/server"
import { getBid, getMinimumBidPreference } from "@/features/bid/queries/client"

export const useBid = (contractAddress: string) => {
  const query = useQuery({
    queryKey: ["account", "bids", contractAddress],
    queryFn: async () => {
      const user = await getAccount()
      const auction = await getAuction(contractAddress)
      const preference = await getMinimumBidPreference(auction.contractAddress, auction.preference)

      try {
        const bid = await getBid(auction.laboratoryAddress, auction.contractAddress)

        return {
          user,
          auction,
          bid,
          preference,
        }
      } catch {
        return {
          user,
          auction,
          bid: null,
          preference,
        }
      }
    },
    retry: false,
    gcTime: Infinity,
  })

  return query
}
