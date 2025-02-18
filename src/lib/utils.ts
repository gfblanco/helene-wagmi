import type { ClassValue } from "clsx"
import type { Duration } from "date-fns"

import { clsx } from "clsx"
import { twMerge } from "tailwind-merge"

export const cn = (...inputs: ClassValue[]) => {
  return twMerge(clsx(inputs))
}

export const truncateAddress = (address: string) => {
  return `${address.slice(0, 7)}...${address.slice(-5)}`
}

export const compactNumber = (number: number) => {
  const units = ["", "K", "M", "B", "T"]

  if (number === 0) return "0"

  const sign = number < 0 ? "-" : ""

  number = Math.abs(number)

  const range = Math.min(Math.floor(Math.log10(number) / 3), units.length - 1)

  const divisor = Math.pow(1000, range)
  const truncatedNumber = Math.floor(number / divisor)

  const isRounded = number / divisor !== truncatedNumber

  let result = `${sign}${truncatedNumber}${units[range]}`

  if (isRounded) result += "+"

  return result
}

export const resolveMimeType = (mimeType: string): string => {
  return (
    {
      "text/plain": "txt",
      "application/pdf": "pdf",
    }[mimeType] || "Unknown"
  )
}

export const durationToMilliseconds = (duration: Duration) => {
  return (
    (duration.years || 0) * 31556952000 +
    (duration.months || 0) * 2629746000 +
    (duration.weeks || 0) * 604800000 +
    (duration.days || 0) * 86400000 +
    (duration.hours || 0) * 3600000 +
    (duration.minutes || 0) * 60000 +
    (duration.seconds || 0) * 1000
  )
}

export const parseTestType = (type: string | number) => {
  return (
    {
      "0": "PCR",
      "1": "Antigen",
      "2": "Antibody",
    }[type.toString()] || "Unknown"
  )
}

export const parsePreference = (preference: string | number) => {
  return (
    {
      "0": "Accuracy",
      "1": "Delivery time",
      "2": "Price",
    }[preference.toString()] || "Unknown"
  )
}

export const parseStatus = (status: string | number) => {
  return (
    {
      "0": "Active",
      "1": "Closed",
      "2": "Bidded",
      "3": "Selected",
      "4": "Accepted",
      "5": "Paid",
      "6": "Done",
    }[status.toString()] || "Unknown"
  )
}

export const parseAccuracy = (accuracy: string | number) => {
  return (
    {
      "0": "High",
      "1": "Medium",
      "2": "Low",
    }[accuracy.toString()] || "Unknown"
  )
}

export const parseDeliveryTime = (deliveryTime: string | number) => {
  return (
    {
      "0": "Instant",
      "1": "Fast",
      "2": "Average",
      "3": "Slow",
    }[deliveryTime.toString()] || "Unknown"
  )
}
