"use client"

import type { AuctionBid } from "@/features/auction/api/use-auctions"
import type { Auction } from "@/features/auction/queries/client"
import type { User } from "@/features/auth/queries/server"
import type { ReactNode } from "react"

import { useAutoAnimate } from "@formkit/auto-animate/react"
import { compareDesc, isFuture, isPast } from "date-fns"
import { Activity, Building2, Clock, File, CircleUserRound, CirclePlus } from "lucide-react"
import Link from "next/link"
import { createContext, useCallback, useContext, useEffect, useLayoutEffect, useState } from "react"
import { useMedia } from "react-use"

import { FacetedFilter } from "@/components/faceted-filter"
import { LoaderContainer } from "@/components/loader"
import { NoResults } from "@/components/no-results"
import { TimeDistanceUpdaterToNow } from "@/components/time-distance-updater-to-now"
import { Badge } from "@/components/ui/badge"
import { buttonVariants } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import {
  PaginationLast,
  PaginationInfo,
  PaginationNext,
  PaginationPrevious,
  PaginationContent,
  PaginationItem,
  Pagination,
  PaginationFirst,
} from "@/components/ui/pagination"
import { useAuctions } from "@/features/auction/api/use-auctions"
import { parsePreference, parseStatus, parseTestType } from "@/lib/utils"

type AuctionWithStatus = AuctionBid & {
  status: number
}

// #region AuctionBrowserContext

type AuctionBrowserContextState = {
  user: User | undefined
  auctions: AuctionWithStatus[]
  isLoading: boolean
  results: AuctionWithStatus[]
  setResults: (results: AuctionWithStatus[]) => void
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

const AuctionBrowserContext = createContext<AuctionBrowserContextState | null>(null)

const useAuctionBrowser = () => {
  const context = useContext(AuctionBrowserContext)

  if (!context) throw new Error("useAuctionBrowser must be used within a AuctionBrowserProvider")

  return context
}

// #endregion

// #region AuctionBrowserProvider

type AuctionBrowserProviderProps = {
  children: ReactNode
}

export const AuctionBrowserProvider = ({ children }: AuctionBrowserProviderProps) => {
  const { data } = useAuctions()
  const [auctions, setAuctions] = useState<AuctionWithStatus[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [results, setResults] = useState<AuctionWithStatus[]>(auctions)

  useLayoutEffect(() => {
    if (!data) return

    setIsLoading(false)

    const { user, auctions } = data

    const updateAuctions = () => {
      setAuctions(
        auctions
          .map((auction) => {
            let status

            if (auction.done || auction.results) {
              if (user.role === "LABORATORY") {
                if (user.address === auction.laboratoryAddress) {
                  status = 6
                } else {
                  status = 1
                }
              } else {
                status = 6
              }
            } else if (auction.paid) {
              if (user.role === "LABORATORY") {
                if (user.address === auction.laboratoryAddress) {
                  status = 5
                } else {
                  status = 1
                }
              } else {
                status = 5
              }
            } else if (auction.accepted) {
              if (user.role === "LABORATORY") {
                if (user.address === auction.laboratoryAddress) {
                  status = 4
                } else {
                  status = 1
                }
              } else {
                status = 4
              }
            } else if (auction.laboratoryAddress !== "0x0000000000000000000000000000000000000000") {
              if (user.role === "LABORATORY") {
                if (user.address === auction.laboratoryAddress) {
                  status = 3
                } else {
                  status = 1
                }
              } else {
                status = 3
              }
            } else if (auction.bidded) {
              status = 2
            } else if (isPast(auction.endDate)) {
              status = 1
            } else {
              status = 0
            }

            return {
              ...auction,
              status,
            }
          })
          .sort((a, b) => compareDesc(a.startDate, b.startDate)),
      )
    }

    updateAuctions()

    const timeouts = auctions
      .filter((auction) => isFuture(auction.endDate))
      .map((auction) => {
        const milliseconds = auction.endDate.getTime() - Date.now()
        const timeout = setTimeout(updateAuctions, milliseconds)

        return timeout
      })

    return () => timeouts.forEach((timeout) => clearTimeout(timeout))
  }, [data])

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
    <AuctionBrowserContext.Provider
      value={{
        user: data?.user,
        auctions,
        isLoading,
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
    </AuctionBrowserContext.Provider>
  )
}

// #endregion

// #region AuctionBrowserFilters

export const AuctionBrowserFilters = () => {
  const isLaptopL = useMedia("(min-width: 1440px)", false)
  const { user, isLoading, auctions, setResults, goToFirstPage } = useAuctionBrowser()
  const [query, setQuery] = useState("")

  // #region Test type

  const testTypeFacets = new Map([
    ["0", auctions.reduce((acc, auction) => (auction.type === 0 ? acc + 1 : acc), 0)],
    ["1", auctions.reduce((acc, auction) => (auction.type === 1 ? acc + 1 : acc), 0)],
    ["2", auctions.reduce((acc, auction) => (auction.type === 2 ? acc + 1 : acc), 0)],
  ])

  const testTypeOptions = [
    {
      value: "0",
      label: parseTestType(0),
    },
    {
      value: "1",
      label: parseTestType(1),
    },
    {
      value: "2",
      label: parseTestType(2),
    },
  ]

  const [selectedTestTypes, setSelectedTestTypes] = useState(new Set<string>())

  // #endregion

  // #region Preference

  const preferenceFacets = new Map([
    ["0", auctions.reduce((acc, auction) => (auction.preference === 0 ? acc + 1 : acc), 0)],
    ["1", auctions.reduce((acc, auction) => (auction.preference === 1 ? acc + 1 : acc), 0)],
    ["2", auctions.reduce((acc, auction) => (auction.preference === 2 ? acc + 1 : acc), 0)],
  ])

  const preferenceOptions = [
    {
      value: "0",
      label: parsePreference(0),
    },
    {
      value: "1",
      label: parsePreference(1),
    },
    {
      value: "2",
      label: parsePreference(2),
    },
  ]

  const [selectedPreferences, setSelectedPreferences] = useState(new Set<string>())

  // #endregion

  // #region Status

  const statusFacets = new Map([
    ["0", auctions.reduce((acc, auction) => (auction.status === 0 ? acc + 1 : acc), 0)],
    ["1", auctions.reduce((acc, auction) => (auction.status === 1 ? acc + 1 : acc), 0)],
    ["2", auctions.reduce((acc, auction) => (auction.status === 2 ? acc + 1 : acc), 0)],
    ["3", auctions.reduce((acc, auction) => (auction.status === 3 ? acc + 1 : acc), 0)],
    ["4", auctions.reduce((acc, auction) => (auction.status === 4 ? acc + 1 : acc), 0)],
    ["5", auctions.reduce((acc, auction) => (auction.status === 5 ? acc + 1 : acc), 0)],
    ["6", auctions.reduce((acc, auction) => (auction.status === 6 ? acc + 1 : acc), 0)],
  ])

  const statusOptions = [
    {
      value: "0",
      label: parseStatus(0),
    },
    {
      value: "1",
      label: parseStatus(1),
    },
    {
      value: "2",
      label: parseStatus(2),
    },
    {
      value: "3",
      label: parseStatus(3),
    },
    {
      value: "4",
      label: parseStatus(4),
    },
    {
      value: "5",
      label: parseStatus(5),
    },
    {
      value: "6",
      label: parseStatus(6),
    },
  ]

  const [selectedStatus, setSelectedStatus] = useState(new Set<string>())

  // #endregion

  useLayoutEffect(() => {
    setResults(
      auctions.filter(
        (auction) =>
          (auction.contractAddress.includes(query.trim()) ||
            auction.userAddress.includes(query.trim()) ||
            (auction.laboratoryAddress !== "0x0000000000000000000000000000000000000000" &&
              auction.laboratoryAddress.includes(query.trim()))) &&
          (!selectedTestTypes.size || selectedTestTypes.has(String(auction.type))) &&
          (!selectedPreferences.size || selectedPreferences.has(String(auction.preference))) &&
          (!selectedStatus.size || selectedStatus.has(String(auction.status))),
      ),
    )
  }, [auctions, query, selectedPreferences, selectedStatus, selectedTestTypes, setResults])

  return (
    <div className="flex justify-end">
      <div className="hidden flex-1 gap-2 lg:flex">
        <Input
          className="h-8 w-40 xl:w-60"
          placeholder="Filter auctions..."
          value={query}
          onChange={(event) => {
            setQuery(event.target.value)
            goToFirstPage()
          }}
        />
        <FacetedFilter
          disableDetails={!isLaptopL}
          facets={testTypeFacets}
          maxSelectedDetails={0}
          options={testTypeOptions}
          selectedValues={selectedTestTypes}
          title="Test type"
          onSelectedValuesChange={(selectedValues) => {
            setSelectedTestTypes(selectedValues)
            goToFirstPage()
          }}
        />
        <FacetedFilter
          disableDetails={!isLaptopL}
          facets={preferenceFacets}
          maxSelectedDetails={0}
          options={preferenceOptions}
          selectedValues={selectedPreferences}
          title="Preference"
          onSelectedValuesChange={(selectedValues) => {
            setSelectedPreferences(selectedValues)
            goToFirstPage()
          }}
        />
        <FacetedFilter
          disableDetails={!isLaptopL}
          facets={statusFacets}
          maxSelectedDetails={0}
          options={statusOptions}
          selectedValues={selectedStatus}
          title="Status"
          onSelectedValuesChange={(selectedValues) => {
            setSelectedStatus(selectedValues)
            goToFirstPage()
          }}
        />
      </div>
      {!isLoading && user && user.role === "PATIENT" && (
        <Link
          className={buttonVariants({ variant: "outline", size: "sm" })}
          href="/auctions/new"
          scroll={false}
        >
          <CirclePlus />
          Create auction
        </Link>
      )}
    </div>
  )
}

// #endregion

// #region AuctionBrowser

export const AuctionBrowser = () => {
  const [ref] = useAutoAnimate()
  const { isLoading, results, currentPage, itemsPerPage } = useAuctionBrowser()

  if (isLoading) return <LoaderContainer />

  return (
    <div ref={ref} className="grid grid-cols-1 gap-4 lg:grid-cols-2 xl:grid-cols-3">
      {results.length === 0 ? (
        <NoResults className="col-span-3" />
      ) : (
        results
          .slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage)
          .map((auction) => (
            <Link
              key={auction.contractAddress}
              className="rounded-xl focus-visible-ring"
              href={`/auctions/${auction.contractAddress}`}
              scroll={false}
            >
              <Auction auction={auction} />
            </Link>
          ))
      )}
    </div>
  )
}

// #endregion

// #region Auction

type AuctionProps = {
  auction: AuctionWithStatus
}

const Auction = ({ auction }: AuctionProps) => {
  auction.startDate.setSeconds(auction.startDate.getSeconds() - 2)

  return (
    <Card className="max-h-fit min-h-fit">
      <CardHeader className="space-y-1">
        <div className="flex items-start justify-between gap-2">
          <CardTitle className="line-clamp-1 text-start text-2xl font-bold">
            {parseTestType(auction.type)} Test
          </CardTitle>
          <Badge
            className={
              {
                0: "bg-green-600 hover:bg-green-600",
                1: "bg-slate-600 hover:bg-slate-600",
                2: "bg-yellow-600 hover:bg-yellow-600",
                3: "bg-blue-600 hover:bg-blue-600",
                4: "bg-teal-600 hover:bg-teal-600",
                5: "bg-pink-600 hover:bg-pink-600",
                6: "bg-stone-600 hover:bg-stone-600",
              }[auction.status]
            }
          >
            {parseStatus(auction.status)}
          </Badge>
        </div>
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <Activity className="size-4 shrink-0" />
          <span className="line-clamp-1 text-start">
            Preference: {parsePreference(auction.preference)}
          </span>
        </div>
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <File className="size-4 shrink-0" />
          <span className="overflow-hidden text-ellipsis font-mono">{auction.contractAddress}</span>
        </div>
      </CardHeader>
      <CardContent className="space-y-2">
        <div className="flex items-center gap-2 text-sm">
          <CircleUserRound className="size-4 shrink-0 text-muted-foreground" />
          <span className="overflow-hidden text-ellipsis font-mono">{auction.userAddress}</span>
        </div>
        <div className="flex items-center gap-2 text-sm">
          <Clock className="size-4 shrink-0 text-muted-foreground" />
          <TimeDistanceUpdaterToNow
            className="line-clamp-1 text-start"
            date={auction.startDate}
            dateTime={auction.startDate.toISOString()}
            prefix={"Created "}
          />
        </div>
        <div className="flex items-center gap-2 text-sm">
          <Clock className="size-4 shrink-0 text-muted-foreground" />
          <TimeDistanceUpdaterToNow
            className="line-clamp-1 text-start"
            date={auction.endDate}
            dateTime={auction.endDate.toISOString()}
            prefix={isFuture(auction.endDate) ? "Ends " : "Ended "}
          />
        </div>
        <div className="flex items-center gap-2 border-t pt-2 text-sm">
          <Building2 className="size-4 shrink-0 text-muted-foreground" />
          <span className="overflow-hidden text-ellipsis font-mono">
            {auction.laboratoryAddress === "0x0000000000000000000000000000000000000000"
              ? "No laboratory selected"
              : auction.laboratoryAddress}
          </span>
        </div>
      </CardContent>
    </Card>
  )
}

// #endregion

// #region AuctionBrowserPagination

export const AuctionBrowserPagination = () => {
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
  } = useAuctionBrowser()

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
