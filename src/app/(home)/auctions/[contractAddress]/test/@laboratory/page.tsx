import { Container } from "@/components/container"
import { Navbar } from "@/components/navbar"
import { UploadTestLoader } from "@/features/test/components/upload-test-form"

type PageProps = {
  params: Promise<{ contractAddress: string }>
}

export default async function Page({ params }: PageProps) {
  const { contractAddress } = await params

  return (
    <>
      <Navbar
        description="Upload the test result for this auction."
        label="All bids"
        title="Upload Test"
        url={`/auctions/${contractAddress}`}
      />
      <Container>
        <UploadTestLoader contractAddress={contractAddress} />
      </Container>
    </>
  )
}
