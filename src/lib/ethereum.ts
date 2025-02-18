import type { ContractReceipt, ContractTransaction } from "ethers"

import { Contract, ContractFactory, providers, utils } from "ethers"

import {
  TOKEN_ADDRESS,
  TOKEN_ABI,
  AUCTION_ADDRESS,
  AUCTION_ABI,
  ORACLE_ABI,
  ORACLE_ADDRESS,
  AUCTION_BYTECODE,
} from "@/lib/constants"

export type JsonRpcError = {
  code: number
  message: string
}

export type ContractError = {
  code: string
  message: string
  error: JsonRpcError
}

type RequestArguments = {
  method: string
  params?: unknown[] | Record<string, unknown>
}

const ethereumRequest = async (args: RequestArguments) => {
  if (typeof window.ethereum === "undefined") {
    throw Error("MetaMask is not installed.")
  }

  const response = await window.ethereum.request(args)

  return response
}

const getSigner = async () => {
  if (typeof window.ethereum === "undefined") {
    throw Error("MetaMask is not installed.")
  }

  const provider = new providers.Web3Provider(window.ethereum)
  const signer = provider.getSigner()

  return signer
}

export const getAccounts = async () => {
  const accounts: string[] = await ethereumRequest({
    method: "eth_requestAccounts",
  })

  return accounts
}

export const signMessage = async (message: string) => {
  const signer = await getSigner()
  const signature = await signer.signMessage(message)
  const address = await signer.getAddress()

  return {
    message,
    signature,
    address,
  }
}

const getContract = async (target: "auction" | "oracle" | "token") => {
  const signer = await getSigner()

  switch (target) {
    case "auction": {
      return new Contract(AUCTION_ADDRESS, AUCTION_ABI, signer)
    }
    case "oracle": {
      return new Contract(ORACLE_ADDRESS, ORACLE_ABI, signer)
    }
    case "token": {
      return new Contract(TOKEN_ADDRESS, TOKEN_ABI, signer)
    }
  }
}

const getContractFromFactory = async (target: "auction", address: string | null = null) => {
  const signer = await getSigner()

  switch (target) {
    case "auction": {
      const factory = new ContractFactory(AUCTION_ABI, AUCTION_BYTECODE, signer)

      if (address) {
        const contract = factory.attach(address)

        return contract as Contract
      }

      const contract = await factory.deploy()

      return contract as Contract
    }
  }
}

export const getBalance = async (address: string) => {
  const tokenContract = await getContract("token")
  const wei = await tokenContract.balances(address)
  const balanceString = utils.formatEther(wei)
  const balance = parseFloat(balanceString)

  return balance
}

export const buyTokens = async (amount: number) => {
  const tokenContract = await getContract("token")
  const wei = utils.parseUnits(amount.toString(), "ether")

  await tokenContract
    .buy({
      value: wei,
    })
    .then((transaction: ContractTransaction) => transaction.wait())
}

export const startAuction = async (type: number) => {
  const auctionContract = await getContractFromFactory("auction")
  const auction = await auctionContract
    .start(type)
    .then((transaction: ContractTransaction) => transaction.wait())
    .then((receipt: ContractReceipt) => {
      const event = receipt.events![0] as unknown as {
        address: string
        args: {
          userRequest: {
            userAddress: string
            labAddress: string
            startDate: bigint
            timeLimit: bigint
            testType: bigint
            done: boolean
          }
        }
      }

      return {
        contractAddress: event.address.toLocaleLowerCase(),
        userAddress: event.args.userRequest.userAddress.toLocaleLowerCase(),
        laboratoryAddress: event.args.userRequest.labAddress.toLocaleLowerCase(),
        startDate: new Date(Number(event.args.userRequest.startDate) * 1000),
        endDate: new Date(Number(event.args.userRequest.timeLimit) * 1000),
        type: Number(event.args.userRequest.testType),
        done: event.args.userRequest.done,
      }
    })

  return auction
}

export const payTest = async (
  contractAddress: string,
  userAddress: string,
  laboratoryAddress: string,
  accuracy: number,
  time: number,
  price: number,
) => {
  const wei = utils.parseUnits(price.toString(), "ether")
  const tokenContract = await getContract("token")

  await tokenContract
    .transferWithData(laboratoryAddress, wei, "0x01")
    .then((transaction: ContractTransaction) => transaction.wait())

  const auctionContract = await getContractFromFactory("auction", contractAddress)

  await auctionContract
    .end(laboratoryAddress, accuracy, time, price, {
      from: userAddress,
      value: wei,
    })
    .then((transaction: ContractTransaction) => transaction.wait())
}

export const uploadTest = async (address: string, test: string) => {
  const oracleContract = await getContract("oracle")

  await oracleContract
    .trigger_IPFS_Add_Event(address, test)
    .then((transaction: ContractTransaction) => transaction.wait())
}

export const downloadTest = async (address: string) => {
  const oracleContract = await getContract("oracle")
  const test = await oracleContract
    .trigger_IPFS_Cat_Event(address)
    .then((transaction: ContractTransaction) => transaction.wait())
    .then((receipt: ContractReceipt) => {
      const test = receipt.events![1].args![0] as string

      return test
    })

  return test
}
