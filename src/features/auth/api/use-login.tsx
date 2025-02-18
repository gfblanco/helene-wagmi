import type { User } from "@/features/auth/queries/server"
import type { JsonRpcError } from "@/lib/ethereum"

import { useMutation, useQueryClient } from "@tanstack/react-query"

import { setAccount } from "@/features/auth/queries/server"
import { TRUSTED_LABS } from "@/lib/constants"
import { getAccounts } from "@/lib/ethereum"

export const useLogin = ({ onSuccess, onError }: TanstackQuery = {}) => {
  const queryClient = useQueryClient()

  const mutation = useMutation<void, JsonRpcError>({
    mutationFn: async () => {
      const accounts = await getAccounts()
      const address = accounts[0].toLocaleLowerCase()
      const user: User = {
        address,
        role: TRUSTED_LABS.includes(address) ? "LABORATORY" : "PATIENT",
      }

      await setAccount(user)
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["account"] })

      onSuccess?.()
    },
    onError(error) {
      onError?.(error)
    },
  })

  return mutation
}
