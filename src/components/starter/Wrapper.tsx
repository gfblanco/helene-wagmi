import { ReactNode } from "react"

export const Wrapper = ({ children }: { children: ReactNode }) => (
  <div className="mx-auto max-w-xl px-6">{children}</div>
)
