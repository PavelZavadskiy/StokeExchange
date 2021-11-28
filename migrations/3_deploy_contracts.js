require('dotenv').config();

let SecondToken = artifacts.require("./Test/SecondToken.sol");

module.exports = async function (deployer) {
    await deployer.deploy(SecondToken);
}