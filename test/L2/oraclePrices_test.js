const { deployMockContract, provider } = waffle;
const { expect } = require("chai");
const { zeroAddress, isZeroAddress } = require("ethereumjs-util");
const { constants, BigNumber } = require("ethers");
const { ethers } = require("hardhat")

let oraclePrices, mockedUniswapV3FactoryContract, mockedUSDCContract
let owner, acc1
describe("Oracle Prices", function () {
	beforeEach(async function () {
        console.log("", '\n')
		;[owner, acc1] = await ethers.getSigners()
        const xTokenContract = require("../artifacts/contracts/xToken.sol/XToken.json")
		mockedXTokenContract = await deployMockContract(owner, xTokenContract.abi)
        const ERC20Contract = require("../artifacts/@openzeppelin/contracts/token/ERC20/ERC20.sol/ERC20.json")
        mockedUSDCContract = await deployMockContract(owner, ERC20Contract.abi)
        const uniswapV3FactoryContract = require("../node_modules/@uniswap/v3-core/artifacts/contracts/interfaces/IUniswapV3Factory.sol/IUniswapV3Factory.json")
		mockedUniswapV3FactoryContract = await deployMockContract(owner, uniswapV3FactoryContract.abi)
		let oraclePricesContract = await ethers.getContractFactory("contracts/L2/OraclePrices.sol:OraclePrices")
		oraclePrices = await oraclePricesContract.deploy(
		)
		await oraclePrices.deployed()
        await oraclePrices.grantRole("0x04824fcb60e7cc526d70b264caa65b62ed44d9c8e5d230e8ff6b0c7373843b8a", acc1.address)
    })

    it("setGrainPrice works ", async function () {
        console.log("set price=500000000 (USDC per megatone) for SOY")
        await oraclePrices.connect(acc1).setGrainPrice("SOY", 500000000)
        expect(await oraclePrices.prices("SOY")).to.equal(500000000)
    })

    it("setGrainPrice doesn't work (has no role)", async function () {
        console.log("try to set price for SOY by address with no PRICE_SETTER role")
        expect(oraclePrices.setGrainPrice("SOY", 500000000)).to.be.revertedWith("not price setter")
    })

    it("setGrainPrice doesn't work (invalid value)", async function () {
        console.log("try to set TOO HIGH price for SOY")
        expect(oraclePrices.connect(acc1).setGrainPrice("SOY", 10000000000)).to.be.revertedWith("Invalid values")
    })
})