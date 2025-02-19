"use client"

import { getDefaultConfig, RainbowKitProvider } from "@rainbow-me/rainbowkit"
import { QueryClient, QueryClientProvider } from "@tanstack/react-query"
import { ReactNode } from "react"
import { WagmiProvider } from "wagmi"
import { hardhat, sepolia } from "wagmi/chains"

import { NEXT_PUBLIC_RAINBOWKIT_PROJECT_ID } from "@/lib/constants"

const queryClient = new QueryClient()

const config = getDefaultConfig({
  appName: "Solidity Next.js Starter",
  projectId: NEXT_PUBLIC_RAINBOWKIT_PROJECT_ID ?? "",
  chains: [hardhat, sepolia],
  ssr: true,
})

const Providers = ({ children }: { children: ReactNode }) => (
  <WagmiProvider config={config}>
    <QueryClientProvider client={queryClient}>
      <RainbowKitProvider>{children}</RainbowKitProvider>
    </QueryClientProvider>
  </WagmiProvider>
)

export { Providers }
