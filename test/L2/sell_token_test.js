const { deployMockContract, provider } = waffle;
const { expect } = require("chai");
const { zeroAddress, isZeroAddress } = require("ethereumjs-util");
const { constants, BigNumber } = require("ethers");
const { ethers } = require("hardhat")

let mockedOraclePricesContract, mockedUSDCContract, mockedXTokenRouterContract, mockedCTokenContract, sellToken
let owner, acc1

describe("SellCToken", function () {
	beforeEach(async function () {
		;[owner, acc1, acc2, minter] = await ethers.getSigners()

        xTokenRouterContract = require("../../artifacts/contracts/xTokenRouter.sol/xTokenRouter.json")
		mockedXTokenRouterContract = await deployMockContract(owner, xTokenRouterContract.abi)

        const cTokenContract = require("../artifacts/contracts/cToken.sol/CToken.json")
        mockedCTokenContract = await deployMockContract(owner, cTokenContract.abi)

        const ERC20Contract = require("../artifacts/@openzeppelin/contracts/token/ERC20/ERC20.sol/ERC20.json")
        mockedUSDCContract = await deployMockContract(owner, ERC20Contract.abi)

        const oraclePricesContract = require("../artifacts/contracts/L2/OraclePrices.sol/OraclePrices.json")
        mockedOraclePricesContract = await deployMockContract(owner, oraclePricesContract.abi)

        let sellTokenContract = await ethers.getContractFactory("contracts/L2/SellToken.sol:SellCToken")
		sellToken = await sellTokenContract.deploy(mockedUSDCContract.address, mockedXTokenRouterContract.address, mockedOraclePricesContract.address)
		await sellToken.deployed()
    })

    it("Only minter role can mint, success", async function () {
        await cToken.connect(minter).mint(acc1.address, 100000000)
        expect(await cToken.balanceOf(acc1.address)).to.equal(100000000)
    })

    it("Not minter can't mint, revert", async function () {
        await expect(cToken.connect(acc2).mint(acc1.address, 100000000)).to.be.reverted
        expect(await cToken.balanceOf(acc1.address)).to.equal(0)
    })

    it("Burn From, success", async function () {
        await cToken.connect(minter).mint(acc1.address, 100000000)
        expect(await cToken.balanceOf(acc1.address)).to.equal(100000000)

        await cToken.connect(acc1).approve(acc2.address, 100000000)
        await cToken.connect(acc2).burnFrom(acc1.address, 100000000)
        expect(await cToken.balanceOf(acc1.address)).to.equal(0)
    })

    it("Burn From, revert", async function () {
        await cToken.connect(minter).mint(acc1.address, 100000000)
        expect(await cToken.balanceOf(acc1.address)).to.equal(100000000)

        await expect(cToken.connect(acc2).burnFrom(acc1.address, 100000000)).to.be.reverted
        expect(await cToken.balanceOf(acc1.address)).to.equal(100000000)
    })

    it("Sell no work: not enough balance", async function () {     
        await cToken.connect(minter).mint(acc1.address, 100000000)
        expect(await cToken.balanceOf(acc1.address)).to.equal(100000000)
    
        await expect(cToken.connect(acc1).stake(1000000)).not.to.reverted
        expect(await cToken.balanceOf(acc1.address)).to.equal(99000000)
        expect((await cToken.Staked(acc1.address))[0]).to.equal(1000000)
        expect((await cToken.TotalStaked())[0]).to.equal(1000000)
        expect((await cToken.NonStakedTokens())[0]).to.equal(0)
    })

    it("Sell no work: not approved", async function () {
        await cToken.connect(minter).mint(acc1.address, 100000000)
        expect(await cToken.balanceOf(acc1.address)).to.equal(100000000)
    
        await expect(cToken.connect(acc1).stake(10000000000)).to.be.reverted
        expect((await cToken.Staked(acc1.address))[0]).to.equal(0)
        expect((await cToken.TotalStaked())[0]).to.equal(0)
    })

})