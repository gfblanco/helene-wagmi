export type Bid = {
  contractAddress: string
  laboratoryAddress: string
  updateDate: Date
  accuracy: number
  time: number
  price: number
  rating: number
  comment: string
}

const BIDS_KEY_NAME = "bids:state"

export const getBids = async () => {
  const item = window.sessionStorage.getItem(BIDS_KEY_NAME)

  if (!item) return []

  const value = JSON.parse(item)
  const bids: Bid[] = value.map((bid: Bid) => ({
    ...bid,
    updateDate: new Date(bid.updateDate),
  }))

  return bids
}

export const getBidsByContract = async (contractAddress: string) => {
  const bids = await getBids()
  const contractBids = bids.filter((bid) => bid.contractAddress === contractAddress)

  return contractBids
}

export const getBidsByLaboratory = async (laboratoryAddress: string) => {
  const bids = await getBids()
  const laboratoryBids = bids.filter((bid) => bid.laboratoryAddress === laboratoryAddress)

  return laboratoryBids
}

const getBidIndex = async (laboratoryAddress: string, contractAddress: string) => {
  const bids = await getBids()
  const index = bids.findIndex(
    (bid) => bid.laboratoryAddress === laboratoryAddress && bid.contractAddress === contractAddress,
  )

  if (index === -1) throw new Error("Bid not found")

  return index
}

export const getBid = async (laboratoryAddress: string, contractAddress: string) => {
  const bids = await getBids()
  const index = await getBidIndex(laboratoryAddress, contractAddress)
  const bid = bids[index]

  return bid
}

export const getMinimumBidPreference = async (contractAddress: string, preference: number) => {
  const bids = await getBidsByContract(contractAddress)

  switch (preference) {
    case 0: {
      return Math.min(...bids.map((bid) => bid.accuracy), Infinity)
    }
    case 1: {
      return Math.min(...bids.map((bid) => bid.time), Infinity)
    }
    case 2: {
      return Math.min(...bids.map((bid) => bid.price), Infinity)
    }
    default: {
      return Infinity
    }
  }
}

export const addBid = async (bid: Bid) => {
  const bids = await getBids()

  bids.push(bid)

  const value = JSON.stringify(bids)

  window.sessionStorage.setItem(BIDS_KEY_NAME, value)
}

export const updateBid = async (bid: Bid) => {
  const bids = await getBids()
  const index = await getBidIndex(bid.laboratoryAddress, bid.contractAddress)

  bids[index] = bid

  const value = JSON.stringify(bids)

  window.sessionStorage.setItem(BIDS_KEY_NAME, value)
}

export const updateReview = async (
  laboratoryAddress: string,
  contractAddress: string,
  rating: number,
  comment: string,
) => {
  const bid = await getBid(laboratoryAddress, contractAddress)

  bid.rating = rating
  bid.comment = comment

  await updateBid(bid)
}
