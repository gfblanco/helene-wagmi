import { ConnectButton } from "@rainbow-me/rainbowkit"

import { Wrapper } from "./Wrapper"

const Header = () => {
  return (
    <header className="mb-10 border-b py-8">
      <Wrapper>
        <div className="flex items-center justify-between">
          <h1 className="text-lg font-bold md:text-xl">Solidity Next.js Starter</h1>
          <ConnectButton accountStatus="address" label="Connect" showBalance={false} />
        </div>
      </Wrapper>
    </header>
  )
}

export { Header }
