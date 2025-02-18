import { Container } from "@/components/container"
import { Navbar } from "@/components/navbar"
import { NotFoundContainer } from "@/components/not-found"

export default function Page() {
  return (
    <>
      <Navbar title="Not Found" />
      <Container paddingBottom>
        <NotFoundContainer />
      </Container>
    </>
  )
}
