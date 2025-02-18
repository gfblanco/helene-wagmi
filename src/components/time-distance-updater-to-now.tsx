"use client"

import type { ComponentProps } from "react"

import { formatDistanceToNowStrict } from "date-fns"
import { useCallback, useEffect, useState } from "react"

type SecondUpdaterProps = ComponentProps<"time"> & {
  date: Date
  prefix?: string
  suffix?: string
}

export const TimeDistanceUpdaterToNow = ({
  date,
  prefix = "",
  suffix = "",
  ...props
}: SecondUpdaterProps) => {
  const calculateTimeLeft = useCallback(() => {
    return formatDistanceToNowStrict(date, { addSuffix: true })
  }, [date])

  const [time, setTime] = useState(calculateTimeLeft())

  useEffect(() => {
    const interval = setInterval(() => {
      setTime(calculateTimeLeft())
    }, 1000)

    return () => clearInterval(interval)
  }, [calculateTimeLeft])

  return <time {...props}>{prefix + time + suffix}</time>
}
