import { Container } from "@/components/container"
import { Navbar } from "@/components/navbar"
import { ReviewLoader } from "@/features/review/components/review-form"
import { DownloadTestLoader } from "@/features/test/components/download-test-form"

type PageProps = {
  params: Promise<{ contractAddress: string }>
}

export default async function Page({ params }: PageProps) {
  const { contractAddress } = await params

  return (
    <>
      <Navbar
        description="Download the test result for this auction."
        label="All bids"
        title="Download Test"
        url={`/auctions/${contractAddress}`}
      />
      <Container className="space-y-10">
        <DownloadTestLoader contractAddress={contractAddress} />
        <ReviewLoader contractAddress={contractAddress} />
      </Container>
    </>
  )
}
