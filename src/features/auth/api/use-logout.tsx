import { useMutation } from "@tanstack/react-query"

import { deleteAccount } from "@/features/auth/queries/server"

export const useLogout = ({ onSuccess }: TanstackQuery = {}) => {
  const mutation = useMutation({
    mutationFn: async () => {
      await deleteAccount()
    },
    onSuccess: () => {
      onSuccess?.()
    },
  })

  return mutation
}
