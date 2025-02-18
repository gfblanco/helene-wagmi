import { Container } from "@/components/container"
import { Navbar } from "@/components/navbar"
import { CreateBidLoader } from "@/features/bid/components/create-bid-form"

type PageProps = {
  params: Promise<{ contractAddress: string }>
}

export default async function Page({ params }: PageProps) {
  const { contractAddress } = await params

  return (
    <>
      <Navbar
        description="Create a new bid for the current auction."
        label="All bids"
        title="New Bid"
        url={`/auctions/${contractAddress}`}
      />
      <Container paddingBottom>
        <CreateBidLoader contractAddress={contractAddress} />
      </Container>
    </>
  )
}
