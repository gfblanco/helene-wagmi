import { Container } from "@/components/container"
import { Navbar } from "@/components/navbar"
import { UpdateBidLoader } from "@/features/bid/components/update-bid-form"

type PageProps = {
  params: Promise<{ contractAddress: string }>
}

export default async function Page({ params }: PageProps) {
  const { contractAddress } = await params

  return (
    <>
      <Navbar
        description="Update your bid for the current auction."
        label="All bids"
        title="Update Bid"
        url={`/auctions/${contractAddress}`}
      />
      <Container paddingBottom>
        <UpdateBidLoader contractAddress={contractAddress} />
      </Container>
    </>
  )
}
