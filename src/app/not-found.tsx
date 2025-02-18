import { Container } from "@/components/container"
import { NotFound } from "@/components/not-found"

export default function Page() {
  return (
    <Container paddingBottom className="h-svh">
      <NotFound className="h-full justify-center" />
    </Container>
  )
}
