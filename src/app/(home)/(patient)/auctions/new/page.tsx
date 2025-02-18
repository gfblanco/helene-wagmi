import { Container } from "@/components/container"
import { Navbar } from "@/components/navbar"
import { CreateAuctionPatientForm } from "@/features/auction/components/create-auction-form"

export default function Page() {
  return (
    <>
      <Navbar
        description="Create a new auction to facilitate resource sharing and bidding among laboratories."
        label="All auctions"
        title="New Auction"
        url="/auctions"
      />
      <Container paddingBottom>
        <CreateAuctionPatientForm />
      </Container>
    </>
  )
}
