"use client"

import type { ComponentProps, ReactNode } from "react"

import { differenceInSeconds, type Duration, intervalToDuration } from "date-fns"
import { Zap } from "lucide-react"
import { createContext, useCallback, useContext, useEffect, useMemo, useState } from "react"

import { Card, CardContent } from "@/components/ui/card"
import { durationToMilliseconds } from "@/lib/utils"

// #region CountdownContext

type CountdownContextState = {
  duration: Duration
  milliseconds: number
  progress: number
}

const CountdownContext = createContext<CountdownContextState | null>(null)

export const useCountdown = () => {
  const context = useContext(CountdownContext)

  if (!context) throw new Error("useCountdown must be used within a CountdownProvider")

  return context
}

// #endregion

// #region CountdownProvider

type CountdownProviderProps = {
  children: ReactNode
  startDate: Date
  endDate: Date
}

export const CountdownProvider = ({ children, startDate, endDate }: CountdownProviderProps) => {
  const calculateDuration = useCallback(() => {
    const now = new Date()
    const difference = differenceInSeconds(endDate, now)

    if (difference <= 0) return {}

    return intervalToDuration({ start: now, end: endDate })
  }, [endDate])

  const [duration, setDuration] = useState(calculateDuration())
  const [progress, setProgress] = useState(0)

  const milliseconds = durationToMilliseconds(duration)
  const totalTime = useMemo(() => endDate.getTime() - startDate.getTime(), [startDate, endDate])

  const calculateProgress = useCallback(() => {
    return (milliseconds / totalTime) * 100
  }, [milliseconds, totalTime])

  useEffect(() => {
    const interval = setInterval(() => {
      setDuration(calculateDuration())
      setProgress(calculateProgress())
    }, 1000)

    return () => clearInterval(interval)
  }, [calculateDuration, calculateProgress])

  useEffect(() => {
    const timeout = setTimeout(() => {
      setProgress(calculateProgress())
    }, 500)

    return () => clearTimeout(timeout)
  }, [calculateProgress])

  return (
    <CountdownContext.Provider
      value={{
        duration,
        milliseconds,
        progress,
      }}
    >
      {children}
    </CountdownContext.Provider>
  )
}

// #endregion

// #region Countdown

type CountdownProps = Omit<ComponentProps<"time">, "className" | "style" | "children"> & {
  label: string
}

export const Countdown = ({ label, ...props }: CountdownProps) => {
  const { duration, milliseconds, progress } = useCountdown()

  return (
    <Card className="overflow-hidden bg-gradient-to-b from-blue-400 to-indigo-600 text-white">
      <CardContent className="relative p-4">
        <div className="flex items-center justify-between">
          <Zap className="size-6 animate-pulse" />
          <time className="text-2xl font-bold tabular-nums" {...props}>
            {`${duration.minutes?.toString().padStart(2, "0") || "00"}:${duration.seconds?.toString().padStart(2, "0") || "00"}`}
          </time>
          <span className="text-sm">{milliseconds === 0 ? "expired" : label}</span>
        </div>
        <div className="absolute bottom-0 left-0 h-1 w-full bg-white/30">
          <div
            className="h-full bg-white transition-[width] duration-1000 ease-out"
            style={{ width: `${progress}%` }}
          />
        </div>
        {milliseconds === 0 && (
          <div className="absolute inset-0 left-[-23px] flex items-center justify-center bg-white/60">
            <span className="text-2xl font-bold text-destructive">Time&apos;s Up!</span>
          </div>
        )}
      </CardContent>
    </Card>
  )
}

// #endregion
