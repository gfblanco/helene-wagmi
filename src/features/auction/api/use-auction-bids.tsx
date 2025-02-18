import type { Bid } from "@/features/bid/queries/client"

import { useQuery } from "@tanstack/react-query"

import { getAuction } from "@/features/auction/queries/client"
import { getAccount } from "@/features/auth/queries/server"
import { getBidsByContract, getBidsByLaboratory } from "@/features/bid/queries/client"

export type BidRating = Omit<Bid, "rating" | "comment"> & {
  rating: number
  reviews: number
}

export const useAuctionBids = (contractAddress: string) => {
  const query = useQuery({
    queryKey: ["account", "auctions", "bids", contractAddress],
    queryFn: async () => {
      const user = await getAccount()
      const auction = await getAuction(contractAddress)

      if (user.role === "PATIENT" && user.address !== auction.userAddress) {
        throw new Error("Unauthorized")
      }

      const contractBids = await getBidsByContract(auction.contractAddress)
      const laboratoryBids = await getBidsByLaboratory(auction.laboratoryAddress)
      const reviews = laboratoryBids.filter((b) => b.rating > 0).length
      const rating = laboratoryBids.reduce((acc, b) => acc + b.rating || 0, 0) / reviews
      const bids: BidRating[] = contractBids.map((bid) => ({
        ...bid,
        rating: isNaN(rating) ? 0 : rating,
        reviews,
      }))

      return {
        user,
        auction,
        bids,
      }
    },
    retry: false,
  })

  return query
}
