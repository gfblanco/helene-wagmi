import { type Eip1193Provider } from "ethers"

type MetaMaskProvider = Eip1193Provider & {
  on(eventName: string, listener: (...args: unknown[]) => void)
  removeListener(eventName: string, listener: (...args: unknown[]) => void)
}

declare global {
  interface Window {
    ethereum?: MetaMaskProvider
  }
}
