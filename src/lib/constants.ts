import auctionJSON from "../../ignition/deployments/chain-31337/artifacts/HeleneModule#Auction.json" assert { type: "json" }
import oracleJSON from "../../ignition/deployments/chain-31337/artifacts/HeleneModule#Oracle.json" assert { type: "json" }
import tokenJSON from "../../ignition/deployments/chain-31337/artifacts/HeleneModule#Token.json" assert { type: "json" }
import greeterJSON from "../../ignition/deployments/chain-31337/artifacts/HeleneModule#Greeter.json" assert { type: "json" }
import addresses from "../../ignition/deployments/chain-31337/deployed_addresses.json" assert { type: "json" }

export const TRUSTED_LABS = process.env
  .NEXT_PUBLIC_TRUSTED_LABS!.split(",")
  .map((address) => address.toLowerCase())

export const AUCTION_BYTECODE = auctionJSON.bytecode

export const AUCTION_ADDRESS = addresses["HeleneModule#Auction"]

export const AUCTION_ABI = auctionJSON.abi

export const ORACLE_ADDRESS = addresses["HeleneModule#Oracle"]

export const ORACLE_ABI = oracleJSON.abi

export const TOKEN_ADDRESS = addresses["HeleneModule#Token"]

export const TOKEN_ABI = tokenJSON.abi

export const FORTUNA_API_URL = process.env.NEXT_PUBLIC_FORTUNA_API_URL!

export const GREETER_ADDRESS = addresses["HeleneModule#Greeter"]

export const GREETER_ABI = greeterJSON.abi

// TODO: Change the mime type to "application/pdf"
export const TEST_MIME_TYPE = "text/plain"
