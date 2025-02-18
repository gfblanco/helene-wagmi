# Instructions for getting the project up and running

This document describes the steps required to get the project up and running correctly, whether in development or production mode.

## Prerequisites

### Installing pnpm

It is recommended to use **pnpm** as a dependency manager due to its efficiency and speed. You can install it by following the instructions on its official page: [Installing pnpm](https://pnpm.io/en/installation).

## Installing dependencies

Once pnpm is installed, run the following command to install the necessary dependencies of the project:

```bash
pnpm install
```

## Downloading components

This repository contains a health platform DApp that was presented in the following paper *[pending]*. This platform needs four different subsystems in order to work:

1. An [Ethereum private network](https://gitlab.com/helene-project1/ethpnet)  of `N` Ethereum nodes and where the `/contracts`  will be deployed. Hardhat can be also used for development/testing.
2. An [IPFS private network](https://gitlab.com/helene-project1/ipfspnet) of `N` IPFS nodes that the DApp will use as an storage subsystem. Even though the current implementation uses the browser's session storage for demonstration purposes, these IPFS nodes are able to synchronize an OrbitDB database with the following [script](https://git.armriot.com/gtec/helene/orbitdb-initializer). 
3. An [Fortuna PRNG API](https://gitlab.com/helene-project1/fortuna-prng) that provides secure passwords generated with the Fortuna algorithm to encrypt the patients' data.
4. An [Oracle](https://gitlab.com/helene-project1/oracle) to store the encrypted patients' data in the IPFS network.

The deployment of each container only works if their folders are in the same location as this one. This can be changed in the `docker-compose.yml`. Your working area should look like this:

```
helene-platform
    ├── ethpnet
    ├── ipfspnet
    ├── oracle
    ├── fortuna-prng
    └── helene-dapp                   
        ├── docker-compose.yml          # Invokes the Dockerfiles of the outter folders    
        └── ...                
 ```

The deployment of each container is **automated**, meaning that only the below commands are necessary in order to set up the platform. For individual deployments, check the documentation of the specific implementations.

## Commands

The project commands and their purpose are explained below:

### pnpm compile

The system will utilize three smart contracts: one for managing auctions, another for payments using the platform's token, and a third for secure interaction with a decentralized storage system (IPFS) through an oracle. This command cleans and compiles the smart contracts using Hardhat:

```bash
pnpm compile
```

Description:

- Cleans the previously generated artifacts (`hardhat clean`).
- Compiles the contracts (`hardhat compile`).

Note: This command is only necessary if the contracts have not been compiled yet or if changes have been made to them.

### pnpm hardhat

This command starts a local Hardhat node to interact with the contracts:

```bash
pnpm hardhat
```

Description:

- Starts a simulated local blockchain on the localhost network.

### pnpm modules

This command deploys the contract modules on the local node:

```bash
pnpm modules
```

Description:

- Uses Hardhat Ignition to deploy the modules defined in the file [ignition/modules/helene.cjs](ignition/modules/helene.cjs) on the localhost network.

Note: Make sure the local node is running (using `pnpm hardhat`) before running this command.

### pnpm docker

This command manages the Docker services needed for the project:

```bash
pnpm docker
```

Description:

- Shuts down the active containers (docker-compose down).
- Starts the containers defined in docker-compose.yml (docker-compose up -d).

### Frontend

#### Development Mode

To start the frontend in development mode, use:

```bash
pnpm dev
```

Description:

- Starts the Next.js development server.

#### Production Mode

To get the frontend up in production mode, follow these steps:

Build the project:

```bash
pnpm build
```

Start the server:

```bash
pnpm start
```

Note: You only need to run `pnpm build` if you have made changes to the frontend code.

Alternative command: `pnpm preview`

This command combines the build and start steps into one:

```bash
pnpm preview
```


## Funding

This development has been funded by grant TED2021-129433A-C22 (HELENE) funded by MCIN and AEI (10.13039/501100011033) and by the European Union NextGenerationEU/ PRTR.

## License 

This work is licensed under the
[GNU General Public License v3.0][gpl].

[![GPL v3][gpl-shield]][gpl]

[![GPL v3][gpl-image]][gpl]

[gpl]: https://www.gnu.org/licenses/gpl-3.0
[gpl-image]: https://www.gnu.org/graphics/gplv3-127x51.png
[gpl-shield]: https://img.shields.io/badge/License-GPL%20v3-blue.svg