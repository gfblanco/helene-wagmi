import { useQuery } from "@tanstack/react-query"

import { getAccount } from "@/features/auth/queries/server"
import { getBalance } from "@/lib/ethereum"

export const useBalance = () => {
  const query = useQuery({
    queryKey: ["account", "balance"],
    queryFn: async () => {
      const user = await getAccount()
      const balance = await getBalance(user.address)

      return balance
    },
  })

  return query
}
