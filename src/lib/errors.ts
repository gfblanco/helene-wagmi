import type { JsonRpcError, ContractError } from "@/lib/ethereum"

import { toast } from "sonner"

type EvalOptions = {
  malformed?: () => void
  rejected?: () => void
}

export const evalJsonRpcError = (error: JsonRpcError, options?: EvalOptions) => {
  switch (error.code) {
    case -32002: {
      toast.warning("Request already pending", {
        description: "Confirm or reject the pending request in MetaMask.",
      })

      return
    }
    case 4001: {
      options?.rejected?.()

      return
    }
    default: {
      toast.error(error.code, {
        description: error.message,
      })

      return
    }
  }
}

export const evalContractError = (error: ContractError, options?: EvalOptions) => {
  if (error.code === "UNKNOWN_ERROR" || error.message === "Internal JSON-RPC error.") {
    toast.warning("Clear activity and try again", {
      description:
        "Go to MetaMask > Settings > Advanced > Clear activity tab data and try again to fix this issue.",
    })

    return
  }

  switch (error.error.code) {
    case -32603: {
      options?.malformed?.()

      return
    }
    case 4001: {
      options?.rejected?.()

      return
    }
    default: {
      toast.error(error.error.code, {
        description: error.error.message,
      })

      return
    }
  }
}
