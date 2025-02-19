import { Greeting } from "../../../components/starter/Greeting"
import { Wrapper } from "../../../components/starter/Wrapper"

import "react-toastify/dist/ReactToastify.css"
import "@rainbow-me/rainbowkit/styles.css"
const Home = () => {
  return (
    <>
      <Wrapper>
        <Greeting />
      </Wrapper>
    </>
  )
}

export default Home
