"use client"

import type { BidRating } from "@/features/auction/api/use-auction-bids"
import type { Auction } from "@/features/auction/queries/client"
import type { User } from "@/features/auth/queries/server"
import type { Bid } from "@/features/bid/queries/client"
import type { ReactNode } from "react"

import { useAutoAnimate } from "@formkit/auto-animate/react"
import { compareDesc, format } from "date-fns"
import {
  BadgeCheck,
  CirclePlus,
  Coins,
  DollarSign,
  Edit,
  Ellipsis,
  Handshake,
  Star,
  TestTubeDiagonal,
  TrendingUp,
  Truck,
  Wallet,
} from "lucide-react"
import Link from "next/link"
import { createContext, useCallback, useContext, useEffect, useLayoutEffect, useState } from "react"
import { useMedia } from "react-use"
import { toast } from "sonner"

import { LoaderContainer } from "@/components/loader"
import { NoResults } from "@/components/no-results"
import { NotFoundContainer } from "@/components/not-found"
import { SorterSelector } from "@/components/sorter-selector"
import { Badge } from "@/components/ui/badge"
import { buttonVariants } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Input } from "@/components/ui/input"
import {
  Pagination,
  PaginationContent,
  PaginationFirst,
  PaginationInfo,
  PaginationItem,
  PaginationLast,
  PaginationNext,
  PaginationPrevious,
} from "@/components/ui/pagination"
import { useAuctionBids } from "@/features/auction/api/use-auction-bids"
import { usePayAuction } from "@/features/auction/api/use-pay-auction"
import { useUpdateAuctionAcknowledge } from "@/features/auction/api/use-update-auction-acknowledge"
import { useUpdateAuctionLaboratory } from "@/features/auction/api/use-update-auction-laboratory"
import { evalContractError } from "@/lib/errors"
import { cn, compactNumber, parseAccuracy, parseDeliveryTime } from "@/lib/utils"

// #region BidBrowserContext

type BidBrowserContextState = {
  user: User | undefined
  auction: Auction | undefined
  bids: BidRating[]
  isLoading: boolean
  isError: boolean
  results: BidRating[]
  setResults: (results: BidRating[]) => void
  currentPage: number
  hasNext: boolean
  hasPrevious: boolean
  isFirstPage: boolean
  isLastPage: boolean
  goToNextPage: () => void
  goToPreviousPage: () => void
  goToFirstPage: () => void
  goToLastPage: () => void
  itemsPerPage: number
  totalPages: number
}

const BidBrowserContext = createContext<BidBrowserContextState | null>(null)

const useBidBrowser = () => {
  const context = useContext(BidBrowserContext)

  if (!context) throw new Error("useBidBrowser must be used within a AuctionBrowserProvider")

  return context
}

// #endregion

// #region BidBrowserProvider

type BidBrowserProviderProps = {
  children: ReactNode
  contractAddress: string
}

export const BidBrowserProvider = ({ children, contractAddress }: BidBrowserProviderProps) => {
  const { data, isLoading: isLoadingData, isError } = useAuctionBids(contractAddress)
  const [bids, setBids] = useState<BidRating[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [results, setResults] = useState<BidRating[]>(bids)

  useLayoutEffect(() => {
    if (!data || isLoadingData) return

    setIsLoading(false)
    setBids(data.bids.sort((a, b) => compareDesc(a.updateDate, b.updateDate)))
  }, [data, isLoadingData])

  const isLaptop = useMedia("(min-width: 1024px)", true)
  const isLaptopL = useMedia("(min-width: 1440px)", false)
  const itemsPerPage = isLaptopL ? 12 : isLaptop ? 8 : 3
  const totalPages = Math.ceil(results.length / itemsPerPage)
  const [currentPage, setCurrentPage] = useState(1)
  const hasNext = currentPage < totalPages
  const hasPrevious = currentPage > 1
  const isFirstPage = currentPage === 1
  const isLastPage = currentPage === totalPages

  const goToNextPage = useCallback(
    () => hasNext && setCurrentPage(currentPage + 1),
    [currentPage, hasNext, setCurrentPage],
  )
  const goToPreviousPage = useCallback(
    () => hasPrevious && setCurrentPage(currentPage - 1),
    [currentPage, hasPrevious, setCurrentPage],
  )
  const goToFirstPage = useCallback(() => setCurrentPage(1), [setCurrentPage])
  const goToLastPage = useCallback(() => setCurrentPage(totalPages), [setCurrentPage, totalPages])

  useEffect(() => {
    const handleResize = () => {
      if (currentPage > totalPages) {
        goToLastPage()
      }
    }

    window.addEventListener("resize", handleResize)

    return () => window.removeEventListener("resize", handleResize)
  }, [currentPage, goToLastPage, totalPages])

  return (
    <BidBrowserContext.Provider
      value={{
        user: data?.user,
        auction: data?.auction,
        bids,
        isLoading,
        isError,
        results,
        setResults,
        currentPage,
        hasNext,
        hasPrevious,
        isFirstPage,
        isLastPage,
        goToNextPage,
        goToPreviousPage,
        goToFirstPage,
        goToLastPage,
        itemsPerPage,
        totalPages,
      }}
    >
      {children}
    </BidBrowserContext.Provider>
  )
}

// #endregion

// #region BidBrowserFilters

export const BidBrowserFilters = () => {
  const { user, auction, isLoading, bids, setResults, goToFirstPage } = useBidBrowser()
  const [query, setQuery] = useState("")

  const [sortRating, onSortRatingChange] = useState<"asc" | "desc" | undefined>(undefined)
  const [sortAccuracy, onSortAccuracyChange] = useState<"asc" | "desc" | undefined>(undefined)
  const [sortTime, onSortTimeChange] = useState<"asc" | "desc" | undefined>(undefined)
  const [sortPrice, onSortPriceChange] = useState<"asc" | "desc" | undefined>(undefined)

  useLayoutEffect(() => {
    if (!auction) return

    switch (auction.preference) {
      case 0: {
        onSortAccuracyChange("asc")

        break
      }

      case 1: {
        onSortTimeChange("asc")

        break
      }

      case 2: {
        onSortPriceChange("desc")

        break
      }
    }
  }, [auction])

  useLayoutEffect(() => {
    setResults(
      bids
        .filter((bid) => bid.laboratoryAddress.includes(query.trim()))
        .sort((a, b) => {
          if (sortRating) {
            return sortRating === "asc" ? a.rating - b.rating : b.rating - a.rating
          }

          if (sortAccuracy) {
            return sortAccuracy === "asc" ? a.accuracy - b.accuracy : b.accuracy - a.accuracy
          }

          if (sortTime) {
            return sortTime === "asc" ? a.time - b.time : b.time - a.time
          }

          if (sortPrice) {
            return sortPrice === "asc" ? b.price - a.price : a.price - b.price
          }

          return 0
        }),
    )
  }, [bids, query, setResults, sortAccuracy, sortPrice, sortRating, sortTime])

  return (
    <div className="flex justify-end">
      <div className="hidden flex-1 gap-2 lg:flex">
        <Input
          className="h-8 w-40 xl:w-60"
          placeholder="Filter bids..."
          value={query}
          onChange={(event) => {
            setQuery(event.target.value)
            goToFirstPage()
          }}
        />
        <SorterSelector
          sort={sortRating}
          title="Rating"
          onSortChange={(sort) => {
            onSortRatingChange(sort)
            onSortAccuracyChange(undefined)
            onSortTimeChange(undefined)
            onSortPriceChange(undefined)
            goToFirstPage()
          }}
        />
        <SorterSelector
          sort={sortAccuracy}
          title="Accuracy"
          onSortChange={(sort) => {
            onSortRatingChange(undefined)
            onSortAccuracyChange(sort)
            onSortTimeChange(undefined)
            onSortPriceChange(undefined)
            goToFirstPage()
          }}
        />
        <SorterSelector
          sort={sortTime}
          title="Delivery time"
          onSortChange={(sort) => {
            onSortRatingChange(undefined)
            onSortAccuracyChange(undefined)
            onSortTimeChange(sort)
            onSortPriceChange(undefined)
            goToFirstPage()
          }}
        />
        <SorterSelector
          sort={sortPrice}
          title="Price"
          onSortChange={(sort) => {
            onSortRatingChange(undefined)
            onSortAccuracyChange(undefined)
            onSortTimeChange(undefined)
            onSortPriceChange(sort)
            goToFirstPage()
          }}
        />
      </div>
      {!isLoading &&
        user &&
        user.role === "LABORATORY" &&
        auction &&
        auction.laboratoryAddress === "0x0000000000000000000000000000000000000000" &&
        !bids.some((bid) => user.address === bid.laboratoryAddress) && (
          <Link
            className={buttonVariants({ variant: "outline", size: "sm" })}
            href={`/auctions/${auction.contractAddress}/bid`}
            scroll={false}
          >
            <CirclePlus />
            Create bid
          </Link>
        )}
    </div>
  )
}

// #endregion

// #region BidBrowser

export const BidBrowser = () => {
  const [ref] = useAutoAnimate()
  const { user, auction, isLoading, isError, results, currentPage, itemsPerPage } = useBidBrowser()

  if (!user || !auction || isLoading) return <LoaderContainer />

  if (isError) return <NotFoundContainer />

  return (
    <div ref={ref} className="grid grid-cols-1 gap-4 lg:grid-cols-2 xl:grid-cols-3">
      {results.length === 0 ? (
        <NoResults className="col-span-3" />
      ) : (
        results
          .slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage)
          .map((bid) => <Bid key={bid.laboratoryAddress} auction={auction} bid={bid} user={user} />)
      )}
    </div>
  )
}

// #endregion

// #region Bid

type BidProps = {
  user: User
  auction: Auction
  bid: BidRating
}

const Bid = ({ user, auction, bid }: BidProps) => {
  const { mutate: updateAuctionLaboratory } = useUpdateAuctionLaboratory()
  const { mutate: updateAuctionAcknowledge } = useUpdateAuctionAcknowledge()
  const { mutate: payAuction } = usePayAuction({
    onError: (error) =>
      evalContractError(error, {
        malformed: () => {
          toast.warning("You don't have enough funds to pay", {
            description: "Please, deposit more funds to your account.",
          })
        },
      }),
  })

  return (
    <Card className="max-h-fit min-h-fit">
      <CardHeader className="flex flex-row items-center justify-between gap-2 space-y-0">
        <div className="flex h-9 items-center overflow-hidden">
          <CardTitle className="overflow-hidden text-ellipsis font-mono text-lg">
            {bid.laboratoryAddress}
          </CardTitle>
        </div>
        {((user.role === "LABORATORY" && user.address === bid.laboratoryAddress) ||
          user.role === "PATIENT") && (
          <DropdownMenu>
            <DropdownMenuTrigger
              className={cn(
                buttonVariants({ size: "icon", variant: "ghost" })
                  .split(" ")
                  .filter((className) => className !== "focus-visible-ring"),
              )}
            >
              <Ellipsis />
              <span className="sr-only">Options</span>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              {user.role === "LABORATORY" && (
                <>
                  <DropdownMenuItem
                    asChild
                    className="flex items-center gap-2"
                    disabled={
                      auction.laboratoryAddress !== "0x0000000000000000000000000000000000000000"
                    }
                  >
                    <Link
                      href={`/auctions/${bid.contractAddress}/bid/${user.address}`}
                      scroll={false}
                    >
                      <Edit className="size-4 shrink-0" />
                      Edit
                    </Link>
                  </DropdownMenuItem>
                  <DropdownMenuItem
                    className="flex items-center gap-2"
                    disabled={
                      auction.accepted || auction.laboratoryAddress !== bid.laboratoryAddress
                    }
                    onSelect={() =>
                      updateAuctionAcknowledge({
                        contractAddress: auction.contractAddress,
                      })
                    }
                  >
                    <Handshake className="size-4 shrink-0" />
                    Acknowledge
                  </DropdownMenuItem>
                  <DropdownMenuItem
                    asChild
                    className="flex items-center gap-2"
                    disabled={
                      !auction.paid ||
                      !auction.accepted ||
                      auction.laboratoryAddress !== bid.laboratoryAddress
                    }
                    onSelect={() => {}}
                  >
                    <Link href={`/auctions/${bid.contractAddress}/test`} scroll={false}>
                      <TestTubeDiagonal className="size-4 shrink-0" />
                      Test
                    </Link>
                  </DropdownMenuItem>
                </>
              )}
              {user.role === "PATIENT" && (
                <>
                  <DropdownMenuItem
                    className="flex items-center gap-2"
                    disabled={auction.accepted}
                    onSelect={() =>
                      updateAuctionLaboratory({
                        contractAddress: auction.contractAddress,
                        laboratoryAddress:
                          auction.laboratoryAddress === bid.laboratoryAddress
                            ? undefined
                            : bid.laboratoryAddress,
                      })
                    }
                  >
                    <BadgeCheck className="size-4 shrink-0" />
                    {auction.laboratoryAddress === bid.laboratoryAddress ? "Deselect" : "Select"}
                  </DropdownMenuItem>
                  <DropdownMenuItem
                    className="flex items-center gap-2"
                    disabled={
                      auction.paid ||
                      !auction.accepted ||
                      auction.laboratoryAddress !== bid.laboratoryAddress
                    }
                    onSelect={() =>
                      payAuction({
                        contractAddress: auction.contractAddress,
                        userAddress: user.address,
                        laboratoryAddress: auction.laboratoryAddress,
                        accuracy: bid.accuracy,
                        time: bid.time,
                        price: bid.price,
                      })
                    }
                  >
                    <Wallet className="size-4 shrink-0" />
                    Pay
                  </DropdownMenuItem>
                  <DropdownMenuItem
                    asChild
                    className="flex items-center gap-2"
                    disabled={
                      auction.laboratoryAddress !== bid.laboratoryAddress || !auction.results
                    }
                    onSelect={() => {}}
                  >
                    <Link href={`/auctions/${bid.contractAddress}/test`} scroll={false}>
                      <TestTubeDiagonal className="size-4 shrink-0" />
                      Test
                    </Link>
                  </DropdownMenuItem>
                </>
              )}
            </DropdownMenuContent>
          </DropdownMenu>
        )}
      </CardHeader>
      <CardContent className="flex flex-col">
        <div className="flex">
          <div className="flex-1 border-r pr-4">
            <div className="mb-2 flex items-center gap-1">
              <span className="text-lg font-medium">{bid.rating.toFixed(1)}</span>
              <Star className="mb-0.5 size-5 fill-current" />
            </div>
            <span className="text-sm">{compactNumber(bid.reviews)} reviews</span>
          </div>
          <div className="flex-1 space-y-2 pl-4">
            <div className="flex justify-between gap-2">
              <div className="flex items-center gap-2">
                <span className="hidden text-sm sm:flex">Accuracy</span>
                <TrendingUp className="size-4 shrink-0" />
                <span className="sr-only">Accuracy</span>
              </div>
              <Badge
                className={cn(
                  "border-none shadow-none",
                  bid.accuracy === 0 && "bg-green-200 text-green-900 hover:bg-green-200",
                  bid.accuracy === 1 && "bg-orange-200 text-orange-900 hover:bg-orange-200",
                  bid.accuracy === 2 && "bg-red-200 text-red-900 hover:bg-red-200",
                )}
              >
                {parseAccuracy(bid.accuracy)}
              </Badge>
            </div>
            <div className="flex justify-between gap-2">
              <div className="flex items-center gap-2">
                <span className="hidden text-sm sm:flex">Delivery</span>
                <Truck className="size-4 shrink-0" />
                <span className="sr-only">Delivery</span>
              </div>
              <span className="text-sm font-medium">{parseDeliveryTime(bid.time)}</span>
            </div>
            <div className="flex justify-between gap-2">
              <div className="flex items-center gap-2">
                <span className="hidden text-sm sm:flex">Price</span>
                <DollarSign className="size-4 shrink-0" />
                <span className="sr-only">Price</span>
              </div>
              <span className="flex items-center gap-1 text-sm font-medium">
                {bid.price}
                <Coins className="size-4 shrink-0" />
              </span>
            </div>
          </div>
        </div>
        <div className="mt-4 border-t">
          <div className="flex items-center justify-between pt-2">
            {user.role === "LABORATORY" &&
              (user.address === bid.laboratoryAddress ? (
                <Badge className="hover:bg-primary/100">
                  Your offer
                  {auction.laboratoryAddress === bid.laboratoryAddress &&
                    (auction.results
                      ? " | done"
                      : auction.paid
                        ? " | paid"
                        : auction.accepted
                          ? " | accepted"
                          : " | selected")}
                </Badge>
              ) : (
                <Badge
                  className={cn(
                    "invisible hover:bg-primary/100",
                    auction.laboratoryAddress === bid.laboratoryAddress && "visible",
                  )}
                >
                  Selected
                </Badge>
              ))}
            {user.role === "PATIENT" && (
              <Badge
                className={cn(
                  "invisible hover:bg-primary/100",
                  auction.laboratoryAddress === bid.laboratoryAddress && "visible",
                )}
              >
                {auction.results
                  ? "Results"
                  : auction.paid
                    ? "Paid"
                    : auction.accepted
                      ? "Accepted"
                      : "Selected"}
              </Badge>
            )}
            <time className="text-right text-sm" dateTime={bid.updateDate.toISOString()}>
              {format(bid.updateDate, "Pp")}
            </time>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}

// #endregion

// #region BidBrowserPagination

export const BidBrowserPagination = () => {
  const {
    currentPage,
    hasNext,
    hasPrevious,
    isFirstPage,
    isLastPage,
    goToNextPage,
    goToPreviousPage,
    goToFirstPage,
    goToLastPage,
    totalPages,
  } = useBidBrowser()

  return (
    <Pagination className="gap-x-6 lg:gap-x-8">
      <PaginationInfo currentPage={currentPage} totalPages={totalPages} />
      <PaginationContent>
        <PaginationItem className="hidden lg:flex">
          <PaginationFirst disabled={isFirstPage || totalPages === 0} onClick={goToFirstPage} />
        </PaginationItem>
        <PaginationItem>
          <PaginationPrevious disabled={!hasPrevious} onClick={goToPreviousPage} />
        </PaginationItem>
        <PaginationItem>
          <PaginationNext disabled={!hasNext} onClick={goToNextPage} />
        </PaginationItem>
        <PaginationItem className="hidden lg:flex">
          <PaginationLast disabled={isLastPage || totalPages === 0} onClick={goToLastPage} />
        </PaginationItem>
      </PaginationContent>
    </Pagination>
  )
}

// #endregion
