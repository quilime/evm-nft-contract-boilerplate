// get .env vars
require("dotenv").config();

const contract = artifacts.require("MyToken");
const name = process.env.TOKEN_NAME;
const symbol = process.env.TOKEN_SYMBOL;
const baseURI = process.env.TOKEN_BASEURI;
const contractURI = process.env.TOKEN_CONTRACTURI;

module.exports = async function (deployer) {
    await deployer.deploy(
        contract,
        name,
        symbol,
        baseURI,
        contractURI
    );
}
