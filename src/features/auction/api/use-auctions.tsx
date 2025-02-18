import type { Auction } from "@/features/auction/queries/client"
import type { Bid } from "@/features/bid/queries/client"

import { useQuery } from "@tanstack/react-query"

import { getAuctions, getAuctionsByUser } from "@/features/auction/queries/client"
import { getAccount } from "@/features/auth/queries/server"
import { getBids } from "@/features/bid/queries/client"

type AuctionWithBids = Auction & {
  bids: Bid[]
}

const mergeAuctionsAndBids = (auctions: Auction[], bids: Bid[]): AuctionWithBids[] => {
  const merged: Map<string, AuctionWithBids> = new Map()

  for (const auction of auctions) {
    merged.set(auction.contractAddress, { ...auction, bids: [] })
  }

  for (const bid of bids) {
    const auction = merged.get(bid.contractAddress)

    if (auction) {
      auction.bids.push(bid)
    }
  }

  return Array.from(merged.values())
}

export type AuctionBid = Auction & {
  bidded: boolean
  accepted: boolean
}

export const useAuctions = () => {
  const query = useQuery({
    queryKey: ["account", "auctions"],
    queryFn: async () => {
      const user = await getAccount()
      const bids = await getBids()

      if (user.role === "PATIENT") {
        const auctions = await getAuctionsByUser(user.address)
        const auctionsBids: AuctionBid[] = mergeAuctionsAndBids(auctions, bids).map((auction) => {
          const bidded = auction.bids.length > 0

          return {
            contractAddress: auction.contractAddress,
            userAddress: auction.userAddress,
            laboratoryAddress: auction.laboratoryAddress,
            startDate: auction.startDate,
            endDate: auction.endDate,
            type: auction.type,
            preference: auction.preference,
            done: auction.done,
            bidded,
            accepted: auction.accepted,
            paid: auction.paid,
            results: auction.results,
          }
        })

        return {
          user: user,
          auctions: auctionsBids,
        }
      } else {
        const auctions = await getAuctions()
        const auctionsBids: AuctionBid[] = mergeAuctionsAndBids(auctions, bids).map((auction) => {
          const bidded = auction.bids.some((bid) => bid.laboratoryAddress === user.address)

          return {
            contractAddress: auction.contractAddress,
            userAddress: auction.userAddress,
            laboratoryAddress: auction.laboratoryAddress,
            startDate: auction.startDate,
            endDate: auction.endDate,
            type: auction.type,
            preference: auction.preference,
            done: auction.done,
            bidded,
            accepted: auction.accepted,
            paid: auction.paid,
            results: auction.results,
          }
        })

        return {
          user: user,
          auctions: auctionsBids,
        }
      }
    },
    retry: false,
  })

  return query
}
