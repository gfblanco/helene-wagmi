import { Container } from "@/components/container"
import { Navbar } from "@/components/navbar"
import {
  AuctionBrowser,
  AuctionBrowserPagination,
  AuctionBrowserFilters,
  AuctionBrowserProvider,
} from "@/features/auction/components/auction-browser"

export default function Page() {
  return (
    <AuctionBrowserProvider>
      <Navbar title="Auctions">
        <AuctionBrowserFilters />
      </Navbar>
      <Container>
        <AuctionBrowser />
      </Container>
      <Container asChild paddingBottom className="mt-auto">
        <footer>
          <AuctionBrowserPagination />
        </footer>
      </Container>
    </AuctionBrowserProvider>
  )
}
