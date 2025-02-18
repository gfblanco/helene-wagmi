"use client"

import { useConnectModal } from "@rainbow-me/rainbowkit"
import { useState, useRef, useEffect } from "react"
import { toast } from "react-toastify"

import { useGreeting } from "../../features/greeter/api/useGreeting"

export const Greeting = () => {
  const [newGreeting, setNewGreeting] = useState<string>("")
  const newGreetingInputRef = useRef<HTMLInputElement>(null)

  const onSetGreetingSuccess = () => {
    toast.success(`Successfully set your new greeting`, {
      position: toast.POSITION.BOTTOM_CENTER,
      autoClose: 3000,
      hideProgressBar: true,
      closeOnClick: true,
      pauseOnHover: true,
      theme: "light",
      className: "text-sm",
    })
    setNewGreeting("")
    newGreetingInputRef.current?.blur()
  }

  const {
    address,
    greeting,
    getGreetingLoading,
    getGreetingError,
    setGreeting,
    setGreetingLoading,
    prepareSetGreetingError,
    setGreetingError,
  } = useGreeting({ newGreeting, onSetGreetingSuccess })

  useEffect(() => {
    if (!address) {
      setNewGreeting("")
    }
  }, [address])

  const { openConnectModal } = useConnectModal()

  return (
    <div className="space-y-8">
      <div className="flex flex-col space-y-4">
        <p className="text-center text-sm text-gray-500">Greeting from the blockchain:</p>
        {getGreetingLoading ? (
          <p className="text-center text-lg italic text-gray-500">Loading...</p>
        ) : (
          <p
            className={
              !getGreetingError ? `text-center text-lg` : `text-center text-lg text-red-500`
            }
          >
            {!getGreetingError ? greeting : `There was an error getting the greeting`}
          </p>
        )}
      </div>
      <div className="space-y-8">
        <div className="flex flex-col space-y-4">
          <input
            ref={newGreetingInputRef}
            className="border p-4 text-center"
            disabled={!address}
            placeholder="Write a new greeting"
            value={newGreeting}
            onChange={(e) => setNewGreeting(e.target.value)}
          />
          <button
            className="rounded-md bg-blue-600 px-8 py-4 text-white hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-50"
            disabled={!address || !newGreeting || setGreetingLoading || prepareSetGreetingError}
            onClick={setGreeting}
          >
            {!setGreetingLoading
              ? `Set your new greeting on the blockchain`
              : `Setting greeting...`}
          </button>
          {!address && (
            <button
              className="text-center text-sm text-gray-500 underline hover:opacity-80"
              onClick={openConnectModal}
            >
              Connect your wallet to set a new greeting
            </button>
          )}
          {address && !newGreeting && (
            <p className="text-center text-sm text-gray-500">
              Type something to set a new greeting
            </p>
          )}
          {setGreetingError && (
            <p className="text-center text-sm text-red-500">
              There was an error setting your new greeting
            </p>
          )}
          {newGreeting && prepareSetGreetingError && (
            <p className="text-center text-sm text-red-500">
              Sorry, only the contract owner can set a greeting
            </p>
          )}
        </div>
      </div>
    </div>
  )
}
