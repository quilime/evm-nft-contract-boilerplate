# Ethereum (EVM) NFT Contract Boilerplate

This is a demo of a basic, yet fully featured [ERC-721](https://ethereum.org/en/developers/docs/standards/tokens/erc-721/). This project can be used as a tutorial, demo/reference or starting point for creating an NFT contract on an Ethereum, or other EVM blockchain such as Polygon, Avalanche, and others.

The included contract is not optomized for deployment gas costs. Rather, it's intended to be a basic yet comprehensive and clear starting point. For any optimization improvements or suggestions, submit pull requests or issue.

The contract code features

- Support for EIP-721 (Standard Token) [https://eips.ethereum.org/EIPS/eip-721]()
- Support for EIP 165 (Introspection) [https://eips.ethereum.org/EIPS/eip-165]()
- Support for EIP-2981 (Royalties) [https://eips.ethereum.org/EIPS/eip-2981]()
    - Set/Get Royalties Address
    - Set/Get Royalties Percentage
- Mint function, with max supply
- Rserved Mint function (restricted to contract owner) dev mints, with max reserved supply
- Per-Token ID Metadata
- Set/Get Contract Metadata (OpenSea)
- Set/Get Mint Open/Closed
- Set/Get Base Token Metadata URI
- Token Supply counters via [Open Zeppelin / Counters](https://github.com/OpenZeppelin/openzeppelin-contracts/blob/master/contracts/utils/Counters.sol)
- Access Control via [Open Zeppelin / Ownable](https://github.com/OpenZeppelin/openzeppelin-contracts/blob/master/contracts/access/Ownable.sol)



The front-end client example is built as a single html file with an accompanying js file.

VSCode is the intended IDE for this project, as it has some convenient plugins to aid development, but is not required. You can use the IDE of your choice.


## Build With

- [Node](https://nodejs.org/en/) - Javascript runtime
- [Truffle Suite](https://trufflesuite.com/) - Contract development suite.
- [ganache-cli](https://www.npmjs.com/package/ganache-cli) - A local command-line version of [Ganache](https://github.com/trufflesuite/ganache), an EVM blockchain part of the Truffle suite of Ethereum development tools.
- [Open Zeppelin](https://openzeppelin.com/) - A library of modular, reusable, secure contract code on which to base your contracts.

### Testing and Assertion

- [Mocha](https://www.npmjs.com/package/mocha) - JavaScript test runner
- [Chai](https://www.npmjs.com/package/chai) - JavaScript assertion library
- [Open Zeppelin Test Helpers](https://docs.openzeppelin.com/test-helpers/0.5/) - Assertion library for Ethereum contract testing

### Deployment Gateway API

- [Infura](https://infura.io/) - Gives access to the Ethereum and IPFS networks without running your own node

### Verification

- [truffle-plugin-verify](https://www.npmjs.com/package/truffle-plugin-verify) - A Truffle plugin to verify the contract on Etherscan, or equivilent EVM APIs


### Client / Frontend

- [Web3Modal](https://github.com/Web3Modal/web3modal) - A convenient selector modal popup for connecting various Ethereum wallets, including WalletConnect.

## Installation

1. Install [VSCode](https://code.visualstudio.com/)
1. Install [Solidity Extension](https://marketplace.visualstudio.com/items?itemName=JuanBlanco.solidity) for VSCode
1. Open terminal in vs code in project folder
1. Clone this repo and install via npm
```
git clone https://github.com/quilime/evm-nft-contract-boilerplate
cd evm-nft-contract-boilerplate
npm install
```

## Project Structure
```
.
├── README.md                   # this readme
├── .vscode
    ├── settings.json           # vscode settings
├── build
│   ├── contracts               # contract builds
├── client
    ├── artifacts
        ├── MyToken.json        # compiled contract ABI, included by the client
    ├── index.html              # client website
    ├── script.js               # client website js script
├── contracts
    ├── MyToken.json            # the token contract
├── ipfs                        # various infura ipfs convenience scripts
    ├── ipfs-pin.sh             # pin an existing ipfs url via infura
    ├── ipfs-upload-folder.sh   # upload an entire folder to ipfs via infura
    ├── ipfs-upload.sh          # upload and pin a file to ipfs via infura
├── migrations
    ├── 1_deploy.js             # contract deployment script
├── package.json
├── test                        # testing suite
    ├── MyToken.test.js         # test suite for MyToken contract
├── truffle-config.js           # truffle config


```

## Development

Dev scripts are defined in `./package.json`

Deploy the contracts to your local EVM via ganache:
```
npm run ganache-cli
```

Now, in a new terminal compile/deploy contracts to the local EVM
```
npm run migrate:dev
```

Copy compiled contract ABI's to client directory
```
npm run migrate:client
```

As you develop your contract, run the tests located in `./test/MyToken.test.js`. It is encouraged to continually be writing unit tests for each feature of the contract as with most blockchain development -- once you deploy to testnets or mainnets, the contract is immutable.
```
npm test
```


## Client Dev

### Set up HTTPS hosting

HTTPS is required for testing locally with Web3Modal. You can set this up how you prefer. The following steps are for VSCode and the Live Server plugin.

1. Set up local https testing, for example with [Live Server](https://marketplace.visualstudio.com/items?itemName=ritwickdey.LiveServer) with [mkcert](https://github.com/FiloSottile/mkcert)
1. Edit your `.vscode/settings.json` to point to the correct cert locations.
1. Host the `./client/index.html` file with Live Server (right click on `/client/index.html`, select Open WIth Live Server), or your local https server of you choice.

### Set up Metamask

In the Metamask extension with your browser, enabled `Show Test Networks` in your browser and/or add Ganache as your local EVM Chain

- Network Name: `Ganache Local`
- RPC URL: `http://localhost:8545`
- Chain ID: `1337`
- Currency Symbol: `ETH`

1. Click "connect" in the client example, and interact with the contract.
1. Add various accounts via their private keys (given to you by ganache-cli in the previous steps) to metamask to interact with the contract as various local accounts.
1. Keep an eye on the browser's developer console and the Ganache terminal window to see local activity.
1. If you reset Ganache, you may have to reset the nonce in metamask for a given account. Reset the nonce by going into `Settings > Advanced > Reset Account`. This is a non-destructive action, but it will remove all transaction history in Metamask for the selected account.




## Deployment to Testnets and Mainnets

Now that you are satisfied with your Contract and you've run extensive testing, you may be ready to deploy to testnets.

Deploy to rinkeby:
```
npx truffle migrate --network rinkeby
```

Deploy to mainnet:

Note: You must set your gas to match the current network.
At the top of `./truffle-config.js` you will notice a variable `gasPrice`, of which you can set in gwei to match the current gas price of the network. To garuntee the contract will deploy, it's wise to give it a little more gas than the average reported price.
```
npx truffle migrate --network mainnet
```

Verify contract on network of your deployment
```
npx truffle run verify MyToken --network <network>
```



## todo

- [ ] Add withdraw function to contract
- [ ] Add info on managing metadata with IPFS and/or Arweave