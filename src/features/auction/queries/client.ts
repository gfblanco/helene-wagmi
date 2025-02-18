const AUCTIONS_KEY_NAME = "auctions:state"

export type Auction = {
  contractAddress: string
  userAddress: string
  laboratoryAddress: string
  startDate: Date
  endDate: Date
  type: number
  preference: number
  accepted: boolean
  paid: boolean
  results: boolean
  done: boolean
}

export const getAuctions = async () => {
  const item = window.sessionStorage.getItem(AUCTIONS_KEY_NAME)

  if (!item) return []

  const value = JSON.parse(item)
  const auctions: Auction[] = value.map((auction: Auction) => ({
    ...auction,
    startDate: new Date(auction.startDate),
    endDate: new Date(auction.endDate),
  }))

  return auctions
}

export const getAuctionsByUser = async (userAddress: string) => {
  const auctions = await getAuctions()
  const userAuctions = auctions.filter((auction) => auction.userAddress === userAddress)

  return userAuctions
}

const getAuctionIndex = async (contractAddress: string) => {
  const auctions = await getAuctions()
  const index = auctions.findIndex((auction) => auction.contractAddress === contractAddress)

  if (index === -1) throw new Error("Auction not found")

  return index
}

export const getAuction = async (contractAddress: string) => {
  const auctions = await getAuctions()
  const index = await getAuctionIndex(contractAddress)
  const auction = auctions[index]

  return auction
}

export const addAuction = async (auction: Auction) => {
  const auctions = await getAuctions()

  auctions.push(auction)

  const value = JSON.stringify(auctions)

  window.sessionStorage.setItem(AUCTIONS_KEY_NAME, value)
}

export const updateAuctionLaboratory = async (
  contractAddress: string,
  laboratoryAddress: string | undefined,
) => {
  const auctions = await getAuctions()
  const index = await getAuctionIndex(contractAddress)
  const auction = auctions[index]

  if (laboratoryAddress) {
    auction.laboratoryAddress = laboratoryAddress
  } else {
    auction.laboratoryAddress = "0x0000000000000000000000000000000000000000"
  }

  auctions[index] = auction

  const value = JSON.stringify(auctions)

  window.sessionStorage.setItem(AUCTIONS_KEY_NAME, value)
}

export const updateAuctionAck = async (contractAddress: string) => {
  const auctions = await getAuctions()
  const index = await getAuctionIndex(contractAddress)
  const auction = auctions[index]

  auction.accepted = true

  auctions[index] = auction

  const value = JSON.stringify(auctions)

  window.sessionStorage.setItem(AUCTIONS_KEY_NAME, value)
}

export const updateAuctionPaid = async (contractAddress: string) => {
  const auctions = await getAuctions()
  const index = await getAuctionIndex(contractAddress)
  const auction = auctions[index]

  auction.paid = true

  auctions[index] = auction

  const value = JSON.stringify(auctions)

  window.sessionStorage.setItem(AUCTIONS_KEY_NAME, value)
}

export const updateResultsReady = async (contractAddress: string) => {
  const auctions = await getAuctions()
  const index = await getAuctionIndex(contractAddress)
  const auction = auctions[index]

  auction.results = true

  auctions[index] = auction

  const value = JSON.stringify(auctions)

  window.sessionStorage.setItem(AUCTIONS_KEY_NAME, value)
}
