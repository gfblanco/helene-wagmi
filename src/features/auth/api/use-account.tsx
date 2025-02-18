import { useQuery } from "@tanstack/react-query"

import { getAccount } from "@/features/auth/queries/server"

export const useAccount = () => {
  const query = useQuery({
    queryKey: ["account"],
    queryFn: async () => {
      const user = await getAccount()

      return user
    },
    retry: false,
  })

  return query
}
