import type { Metadata } from "next"
import type { ReactNode } from "react"

import { CircleAlert, CircleCheck, CircleX, Info, Loader } from "lucide-react"
import { Sora } from "next/font/google"
import { headers } from "next/headers"
import { userAgent } from "next/server"

import { QueryProvider } from "@/components/query-provider"
import { ShortcutProvider } from "@/components/ui/shortcut"
import { Toaster } from "@/components/ui/sonner"
import { AccountListener } from "@/features/auth/components/account-listener"
import { cn } from "@/lib/utils"

import "@/app/globals.css"

const sora = Sora({ subsets: ["latin"] })

export const metadata: Metadata = {
  title: "Helene - Secure and sustainable digital health services",
  description:
    "Helene is an innovative digital health platform designed to address the challenges of privacy, sustainability, and healthcare in the post-pandemic era.",
}

type LayoutProps = {
  children: ReactNode
}

export default function Layout({ children }: LayoutProps) {
  const { os } = userAgent({ headers: headers() })

  return (
    <html className="scroll-smooth" lang="en">
      <body className={cn(sora.className, "antialiased")}>
        <ShortcutProvider os={os.name?.toLocaleLowerCase() as undefined}>
          <QueryProvider>
            {children}
            <AccountListener />
          </QueryProvider>
        </ShortcutProvider>
        <Toaster
          pauseWhenPageIsHidden
          duration={5000}
          icons={{
            success: <CircleCheck className="text-green-600" />,
            info: <Info className="text-blue-600" />,
            warning: <CircleAlert className="text-yellow-600" />,
            error: <CircleX className="text-red-600" />,
            loading: <Loader className="animate-spin text-gray-600" />,
          }}
          offset={58}
          position="top-right"
        />
      </body>
    </html>
  )
}
