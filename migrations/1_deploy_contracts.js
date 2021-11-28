require('dotenv').config();

//const BN = require('bn.js');

let StokeExchange = artifacts.require("./StokeExchange.sol");
//let FirstToken = artifacts.require("./Test/FirstToken.sol");
//let SecondToken = artifacts.require("./Test/SecondToken.sol");
//let ThirdToken = artifacts.require("./Test/ThirdToken.sol");

module.exports = async function (deployer) {
    await deployer.deploy(StokeExchange);
//    await deployer.deploy(FirstToken);
//    await deployer.deploy(SecondToken);
//    await deployer.deploy(ThirdToken);
}