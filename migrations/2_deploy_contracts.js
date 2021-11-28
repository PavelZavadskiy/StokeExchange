require('dotenv').config();

let FirstToken = artifacts.require("./Test/FirstToken.sol");

module.exports = async function (deployer) {
    await deployer.deploy(FirstToken);
}