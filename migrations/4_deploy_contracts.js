require('dotenv').config();

let ThirdToken = artifacts.require("./Test/ThirdToken.sol");

module.exports = async function (deployer) {
    await deployer.deploy(ThirdToken);
}