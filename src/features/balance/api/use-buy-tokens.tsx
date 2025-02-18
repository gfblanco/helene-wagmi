import type { ContractError } from "@/lib/ethereum"

import { useMutation, useQueryClient } from "@tanstack/react-query"

import { buyTokens } from "@/lib/ethereum"

type ResquestType = {
  amount: number
}

export const useBuyTokens = ({ onSuccess, onError }: TanstackQuery = {}) => {
  const queryClient = useQueryClient()

  const mutation = useMutation<void, ContractError, ResquestType>({
    mutationFn: async ({ amount }) => {
      await buyTokens(amount)
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["account", "balance"] })

      onSuccess?.()
    },
    onError: (error) => {
      onError?.(error)
    },
  })

  return mutation
}
