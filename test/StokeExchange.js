const BN = require('bn.js');

let StokeExchange = artifacts.require("StokeExchange.sol");
let FirstToken = artifacts.require("FirstToken.sol");
let SecondToken = artifacts.require("SecondToken.sol");
let ThirdToken = artifacts.require("ThirdToken.sol");
let Agregator = artifacts.require("Agregator.sol");

contract("StokeExchange", async accounts =>{

    let stokeExchange;
    let firstToken;
    let secondToken;
    let thirdToken;
    let agregator;

    const MINT_AMOUNT = "1000000000000000000000";
    const POSTFIX_WEI = "000000000000000000";

    before(  async () => {
        stokeExchange=await StokeExchange.new();
        firstToken=await FirstToken.new();
        firstToken.mint(stokeExchange.address, new BN(MINT_AMOUNT));
        secondToken=await SecondToken.new();
        secondToken.mint(stokeExchange.address, new BN(MINT_AMOUNT));
        thirdToken=await ThirdToken.new();
        thirdToken.mint(stokeExchange.address, new BN(MINT_AMOUNT));
        agregator=await Agregator.new();
    });

    it("-> addToken() : Successful.", async () => {
        await stokeExchange.addToken(firstToken.address, agregator.address, accounts[0], accounts[0]);
        let balance = await firstToken.balanceOf.call(stokeExchange.address);
        assert.equal(balance,MINT_AMOUNT);

        await stokeExchange.addToken(secondToken.address, agregator.address, accounts[0], accounts[0]);
        balance = await secondToken.balanceOf.call(stokeExchange.address);
        assert.equal(balance,MINT_AMOUNT);

        await stokeExchange.addToken(thirdToken.address, agregator.address, accounts[0], accounts[0]);
        balance = await thirdToken.balanceOf.call(stokeExchange.address);
        assert.equal(balance,MINT_AMOUNT);
    });

    it("-> addToken() : Fail. This token is present!", async () => {
        await stokeExchange.addToken(firstToken.address, agregator.address, accounts[0], accounts[0]);
    });

    it("-> getTokensList() : Successful.", async () => {
        let len = await stokeExchange.getTokensListLength.call();
        console.log(`Token list length: ${len}`);

        for(let i=0; i<len; i++ )
        {
            let res =  await stokeExchange.getTokenInfo.call(i);
            console.log(`Token : ${res.token}, ${res.symbol}, ${res.name}`);
        }
    });

    it("-> getTokenPrice() : Successful.", async () => {
        let res = await stokeExchange.getTokenPrice.call(firstToken.address);
        console.log(`Token price and decimals: ${res.price}, ${res.decimals}`);
    });

    it("-> removeToken() : Successful.", async () => {
        let len = await stokeExchange.getTokensListLength.call();
        await stokeExchange.removeToken(secondToken.address, {from: accounts[0]});
        let _len = await stokeExchange.getTokensListLength.call();
        assert.equal(len-1,_len);
        for(let i=0; i<_len; i++ )
        {
            let res =  await stokeExchange.getTokenInfo.call(i);
            console.log(`Token : ${res.token}, ${res.symbol}, ${res.name}`);
        }
    });

    it("-> removeToken() : Fail. Token not found!", async () => {
        await stokeExchange.removeToken(secondToken.address, {from: accounts[0]});
    });

    it("-> removeToken() : Fail. You are not admin of this element!", async () => {
        await stokeExchange.removeToken(firstToken.address, {from: accounts[1]});
    });

    it("-> buyTokens() : Successful.", async () => {
        console.log(`accounts[0] balance   = ${await web3.eth.getBalance(accounts[0])}`);
        let estimatedGas = await stokeExchange.buyTokens.estimateGas(firstToken.address, {from: accounts[1], value: new BN("1"+POSTFIX_WEI)});
        console.log( `Estimate Gas buyTokens(): ${estimatedGas}` ); 
        
        let gasPrice = await web3.eth.getGasPrice();
        console.log( `web3.eth.gasPrice: ${gasPrice}` );

        let tokenBalance = await firstToken.balanceOf(accounts[1]);
        console.log(`accounts[1] balanceOf = ${tokenBalance}`);
        let ethBalance = await web3.eth.getBalance(accounts[1]);
        console.log(`accounts[1] balance   = ${ethBalance}`);

        await stokeExchange.buyTokens(firstToken.address, {from: accounts[1], value: new BN("1"+POSTFIX_WEI)});

        console.log(`estimatedGas*gasPriceInGwei = ${estimatedGas*gasPrice}`);
        let summ = ethBalance - (estimatedGas*gasPrice) - new BN("1"+POSTFIX_WEI);
        console.log(`accounts[1] balanceOf = ${await firstToken.balanceOf(accounts[1])}`);
        console.log(`summ                  = ${summ}`);
        console.log(`accounts[1] balance   = ${await web3.eth.getBalance(accounts[1])}`);
        console.log(`accounts[0] balance   = ${await web3.eth.getBalance(accounts[0])}`);
    });    

    it("-> buyTokens() : Fail. Too many request tokens. Revert eth.", async () => {
        console.log(`accounts[0] balance   = ${await web3.eth.getBalance(accounts[0])}`);
        let estimatedGas = await stokeExchange.buyTokens.estimateGas(firstToken.address, {from: accounts[2], value: new BN("70"+POSTFIX_WEI)});
        console.log( `Estimate Gas buyTokens(): ${estimatedGas}` ); 

        let tokenBalance = await firstToken.balanceOf(accounts[2]);
        console.log(`accounts[2 balanceOf = ${tokenBalance}`);
        let ethBalance = await web3.eth.getBalance(accounts[2]);
        console.log(`accounts[2] balance   = ${ethBalance}`);

        await stokeExchange.buyTokens(firstToken.address, {from: accounts[2], value: new BN("70"+POSTFIX_WEI)});

        let summ = ethBalance - estimatedGas - new BN("70"+POSTFIX_WEI);
        //.sun(new BN("1"+POSTFIX_WEI));
        console.log(`accounts[2] balanceOf = ${await firstToken.balanceOf(accounts[2])}`);
        console.log(`accounts[2] balance   = ${await web3.eth.getBalance(accounts[2])}`);
        console.log(`accounts[0] balance   = ${await web3.eth.getBalance(accounts[0])}`);
    });   

});