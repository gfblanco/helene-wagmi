import { Container } from "@/components/container"
import { Navbar } from "@/components/navbar"
import {
  BidBrowser,
  BidBrowserFilters,
  BidBrowserPagination,
  BidBrowserProvider,
} from "@/features/bid/components/bid-browser"
import { truncateAddress } from "@/lib/utils"

type PageProps = {
  params: Promise<{ contractAddress: string }>
}

export default async function Page({ params }: PageProps) {
  const { contractAddress } = await params

  return (
    <BidBrowserProvider contractAddress={contractAddress}>
      <Navbar
        label="All auctions"
        title={`Auction ${truncateAddress(contractAddress)}`}
        url="/auctions"
      >
        <BidBrowserFilters />
      </Navbar>
      <Container>
        <BidBrowser />
      </Container>
      <Container asChild paddingBottom className="mt-auto">
        <footer>
          <BidBrowserPagination />
        </footer>
      </Container>
    </BidBrowserProvider>
  )
}
