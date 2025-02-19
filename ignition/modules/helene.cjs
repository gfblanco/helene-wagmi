/* eslint-disable @typescript-eslint/no-require-imports */

const { buildModule } = require("@nomicfoundation/hardhat-ignition/modules")

module.exports = buildModule("HeleneModule", (module) => {
  const auctionContract = module.contract("Auction")
  const oracleContract = module.contract("Oracle")
  const tokenContract = module.contract("Token")
  const greeterContract = module.contract("Greeter", ["Hello!"])

  return {
    auction: auctionContract,
    oracle: oracleContract,
    token: tokenContract,
    greeter: greeterContract,
  }
})
