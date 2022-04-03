const { expect, assert } = require("chai");

// Import utilities from Test Helpers
const { BN, expectEvent, expectRevert } = require("@openzeppelin/test-helpers");
const { web3 } = require("@openzeppelin/test-helpers/src/setup");

// Load compiled artifacts
require("dotenv").config();
const contractName = "MyToken";
const MyToken = artifacts.require(contractName);
const name = process.env.TOKEN_NAME;
const symbol = process.env.TOKEN_SYMBOL;
const baseURI = process.env.TOKEN_BASEURI;
const contractURI = process.env.TOKEN_CONTRACTURI;

// console colors
const ansi_clear = "\x1b[0m";
const c = {
    r: 31,
    g: 32,
    y: 33,
    b: 34,
    m: 35,
    c: 36,
    w: 37,
};
const _c = (str, color) => {
    return "\x1b[" + color + "m" + str + ansi_clear;
};

// Start test block
contract(contractName, (accounts) => {
    // get random account that is not owner account (0)
    const _randAccount = () => {
        const randAccountIndex = Math.floor(Math.random() * (accounts.length - 1)) + 1; // not owner account (0)
        return accounts[randAccountIndex];
    };

    // dev mint convenience method
    const _mintDev = async (contract, _to) => {
        console.log("Minting Dev Token to account", _c(_to, c.g));
        const mintEvent = await contract.devMint(_to);
        const { receipt, logs } = mintEvent;
        const tokenId = logs[1].args.tokenId.toString();
        expectEvent(mintEvent, "Mint", {
            tokenId: tokenId,
        });
        console.log(" > Success! tokenId", _c(tokenId, c.y));
        return mintEvent;
    };

    // mint conveninence method
    const _mint = async (contract, _from) => {
        console.log("Minting with account", _c(_from, c.g));
        const price = parseInt((await contract.price()).toString());
        const mintEvent = await contract.mint({
            value: price,
            from: _from,
        });
        const { receipt, logs } = mintEvent;
        const tokenId = logs[1].args.tokenId.toString();
        expectEvent(mintEvent, "Mint", {
            tokenId: tokenId,
        });
        console.log(" > Success! tokenId", _c(tokenId, c.y));
        return mintEvent;
    };

    // create new contract before each test
    beforeEach(async () => {
        this.contract = await MyToken.new(name, symbol, baseURI, contractURI);
    });

    it("should confirm contract ownership transference", async () => {
        const contract = this.contract;
        const oldOwner = await contract.owner();
        const newOwner = accounts[4];
        const res = "Ownable: caller is not the owner";
        const tx = contract.transferOwnership(newOwner);
        // set from non-owner
        try {
            await contract.setBaseTokenURI("<url>", {
                from: oldOwner,
            });
        } catch (error) {
            assert(error.reason == res);
            assert(error, "Expected an error but did not get one");
        }
    });

    it("should only allow mutable functions to be hit by owner", async () => {
        const contract = this.contract;
        const owner = await contract.owner();
        const res = "Ownable: caller is not the owner";

        // set from non-owner
        try {
            await contract.setBaseTokenURI("this is a test", {
                from: accounts[1],
            });
        } catch (error) {
            assert(error.reason == res);
            assert(error, "Expected an error but did not get one");
        }
        // set from owner
        const newBaseURI = "https://anotherurl.com/";
        const tx = await contract.setBaseTokenURI(newBaseURI);
        assert(tx.receipt.status, "Confirm transaction went through");
        {
            const acct1 = accounts[1];
            const mintEvent = await contract.devMint(acct1);
            const { receipt, logs } = mintEvent;
            const tokenId = logs[1].args.tokenId.toString();
            expectEvent(mintEvent, "Mint", { tokenId: tokenId });
            const tokenURI = await this.contract.tokenURI(tokenId);
            assert.equal(
                tokenURI,
                newBaseURI + tokenId + ".json",
                "Base Token URL is being set correctly"
            );
        }
    });

    it("should confirm payment goes to owner", async () => {
        const price = await this.contract.price();
        const priceToEth = web3.utils.fromWei(price, "ether");
        console.log("price:", _c(priceToEth, c.g), "ETH");

        // store starting balance as BN
        const sb = await web3.eth.getBalance(accounts[0]);
        const startingBalance = new BN(sb);

        // mint
        const mintEvent = await _mint(this.contract, accounts[1]);

        // store ending balance as BN
        const eb = await web3.eth.getBalance(accounts[0]);
        const endingBalance = new BN(eb);

        // assert ending balance is greater than starting balance
        assert(endingBalance.gt(startingBalance));

        // assert that starting balance plus price eq ending balance
        assert(startingBalance.add(price).eq(endingBalance));

        // assert that ending balance minus price equals starting balance
        assert(endingBalance.sub(price).eq(startingBalance));
    });

    it("should Get Total supply and price variables", async () => {
        const maxSupply = parseInt((await this.contract.maxSupply()).toString());
        const price = parseInt((await this.contract.price()).toString());
        console.log("maxSupply:", _c(maxSupply, c.y));
        console.log("price:", _c(price, c.y));
        await assert.isNumber(maxSupply, "max supply is readable");
        await assert.isNumber(price, "price is readable");
    });

    it("should emit Mint event", async () => {
        const price = parseInt((await this.contract.price()).toString());
        const mintEvent = await this.contract.mint({ value: price });
        const { logs } = mintEvent;
        const tokenId = logs[1].args.tokenId.toString();
        expectEvent(mintEvent, "Mint", {
            tokenId: tokenId,
        });
    });

    it("should expect mint fee", async () => {
        const res = "Must pay for minting";
        await expectRevert(this.contract.mint({ value: 0 }), res);
    });

    it("should Mint dev mint", async () => {
        const mintEvent = await _mintDev(this.contract, accounts[1]);
        const { logs } = mintEvent;
        const tokenId = logs[1].args.tokenId.toString();
        expectEvent(mintEvent, "Mint", {
            tokenId: tokenId,
        });
    });

    it("should test gas used", async () => {
        const ethValue = 2700.0;
        console.log(`Assuming Eth Value of $USD ${_c(ethValue, c.y)}`);
        const gasPrice = new BN(60000000000);
        console.log("  gasPrice wei", _c(gasPrice.toString(), c.y));
        const price = parseInt((await this.contract.price()).toString());
        const _from = accounts[0];
        const mintEvent = await this.contract.mint({
            value: price,
            from: _from,
        });
        const { receipt } = mintEvent;
        const gasUsed = new BN(receipt.cumulativeGasUsed);
        const gasCost = gasPrice.mul(gasUsed);
        const gasCostInEth = web3.utils.fromWei(gasCost, "ether");
        console.log("");
        console.log("  gasUsed wei:", _c(gasUsed.toString(), c.y));
        console.log("  gasCost wei:", _c(gasCost.toString(), c.y));
        console.log("  ETH:", _c(gasCostInEth, c.y));
        console.log("  USD:", _c(gasCostInEth * ethValue, c.y));
    });

    it("should test tokenURI", async () => {
        for (let i = 0; i < 5; i++) {
            const mintEvent = await _mint(this.contract, _randAccount());
            const { receipt, logs } = mintEvent;
            const tokenId = logs[1].args.tokenId.toString();
            const tokenURI = await this.contract.tokenURI(tokenId);
            assert.equal(
                tokenURI,
                `${baseURI}${tokenId}.json`,
                "Token URI isn't being set correctly"
            );
        }
    });

    it("should set royalties address", async () => {
        const newRoyaltiesAddress = accounts[3];
        await this.contract.setRoyaltiesAddress(newRoyaltiesAddress);
        assert.equal(
            await this.contract.royaltiesAddress(),
            newRoyaltiesAddress,
            "Royalties address isn't being set"
        );
    });

    it("should set royalties percentage", async () => {
        const newPercentage = 34;
        await this.contract.setRoyaltiesPercentage(newPercentage);
        assert.equal(
            await this.contract.royaltiesPercentage(),
            newPercentage,
            "Royalties percentage isn't being set"
        );
    });

    it("should test contractURI", async () => {
        const newContractURI = "https://example.com/contract.json";
        await this.contract.setContractURI(newContractURI);
        assert.equal(
            await this.contract.contractURI(),
            newContractURI,
            "Contract URI isn't being set"
        );
    });

    it("should test if minting open and closed", async () => {
        await this.contract.setMintOpen(false);
        const res = "Minting is closed";
        await expectRevert(_mint(this.contract, _randAccount()), res);

        await this.contract.setMintOpen(true);
        const mintEvent = await _mint(this.contract, _randAccount());

        const mintOpen = await this.contract.getMintOpen();
        assert.isTrue(mintOpen, "Mint closed should true");

        await this.contract.setMintOpen(false);
        const mintClosed = await this.contract.getMintOpen();
        assert.isFalse(mintClosed, "Mint closed should false");
    });

    it("should Mint total supply", async () => {
        const maxSupply = parseInt((await this.contract.maxSupply()).toString());
        const maxDevMints = parseInt((await this.contract.maxDevMints()).toString());
        const price = parseInt((await this.contract.price()).toString());

        {
            for (let i = 1; i <= maxSupply - maxDevMints; i++) {
                console.log(`Minting ${_c(i, c.y)} of ${maxSupply - maxDevMints}`);
                const mintEvent = await _mint(this.contract, _randAccount());
                const { receipt, logs } = mintEvent;
                const tokenId = logs[1].args.tokenId.toString();
            }

            // attempt to mint an extra to test total supply limit
            const res = "Supply Depleted";
            console.log(_c(`Expecting revert for "${res}"`, c.g));
            await expectRevert(
                this.contract.mint({
                    value: price,
                    from: _randAccount(),
                }),
                res
            );
        }

        {
            for (let k = 1; k <= maxDevMints; k++) {
                console.log(`Minting ${_c(k, c.y)} of ${maxDevMints}`);
                const mintEvent = await _mintDev(this.contract, _randAccount());
                const { receipt, logs } = mintEvent;
                const tokenId = logs[1].args.tokenId.toString();
            }

            // attempt to mint an extra dev to test token limit
            const res = "Dev Mint Supply Depleted";
            console.log(_c(`Expecting revert for "${res}"`, c.g));
            await expectRevert(this.contract.devMint(_randAccount()), res);
        }

        // attempt to mint an extra to test total supply limit
        const res = "Supply Depleted";
        console.log(_c(`Expecting revert for "${res}"`, c.g));
        await expectRevert(
            this.contract.mint({
                value: price,
                from: _randAccount(),
            }),
            res
        );
    });
});
