"use client"

import { useEffect } from "react"
import { useAccount, useReadContract, useWriteContract, useWaitForTransactionReceipt } from "wagmi"

import { GREETER_ABI, GREETER_ADDRESS } from "@/lib/constants"

const useGreeting = ({
  newGreeting,
  onSetGreetingSuccess,
}: {
  newGreeting?: string
  onSetGreetingSuccess?: () => void
}): {
  address: `0x${string}` | undefined
  greeting: string | null
  getGreetingLoading: boolean
  getGreetingError: boolean
  setGreeting: (() => void) | undefined
  setGreetingLoading: boolean
  prepareSetGreetingError: boolean
  setGreetingError: boolean
} => {
  const { address } = useAccount()

  const {
    data: greeting,
    isLoading: getGreetingLoading,
    isError: getGreetingError,
    refetch: refetchGreeting,
  } = useReadContract({
    address: GREETER_ADDRESS as `0x${string}`,
    abi: GREETER_ABI,
    functionName: "getGreeting",
  })

  const {
    data: setGreetingHash,
    writeContract: setGreeting,
    isPending: setGreetingLoading,
    isError: setGreetingError,
  } = useWriteContract()

  const { isSuccess: txSuccess, isLoading: txLoading } = useWaitForTransactionReceipt({
    hash: setGreetingHash,
    query: {
      enabled: Boolean(setGreetingHash),
    },
  })

  useEffect(() => {
    if (txSuccess) {
      onSetGreetingSuccess?.()
      refetchGreeting()
    }
  }, [txSuccess]) // eslint-disable-line react-hooks/exhaustive-deps

  return {
    address,
    greeting: greeting as string,
    getGreetingLoading,
    getGreetingError,
    setGreeting: () =>
      setGreeting?.({
        address: GREETER_ADDRESS as `0x${string}`,
        abi: GREETER_ABI,
        functionName: "setGreeting",
        args: [newGreeting],
      }),
    setGreetingLoading: setGreetingLoading || txLoading,
    prepareSetGreetingError: newGreeting === undefined,
    setGreetingError,
  }
}

export { useGreeting }
