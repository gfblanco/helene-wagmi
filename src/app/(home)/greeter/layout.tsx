import "./globals.css"
import "@rainbow-me/rainbowkit/styles.css"
import "react-toastify/dist/ReactToastify.css"
import type { Metadata } from "next"

import { Inter } from "next/font/google"
import { ToastContainer } from "react-toastify"

import { Header } from "../../../components/starter/Header"
import { Providers } from "../../../components/starter/Providers"

const inter = Inter({ subsets: ["latin"] })

export const metadata: Metadata = {
  title: "Solidity Next.js Starter",
  description: "A starter kit for building full stack Ethereum dApps with Solidity and Next.js",
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <Providers>
        <Header />
        {children}
      </Providers>
      <ToastContainer />
    </>
  )
}
