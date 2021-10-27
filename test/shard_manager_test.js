const { expect, assert } = require("chai")
const { web3, ethers } = require("hardhat")
const { BN, time, balance, expectEvent, expectRevert } = require("@openzeppelin/test-helpers")
const ether = require("@openzeppelin/test-helpers/src/ether")

let shardManager, theNFT
let owner, acc1, acc2

describe("Shard Manager", function () {
	beforeEach(async function () {
		;[owner, acc1, acc2, acc3] = await ethers.getSigners()

		let NFTContract = await ethers.getContractFactory("LandXNFT")
		theNFT = await NFTContract.deploy()
		await theNFT.deployed()

		let ShardManagerContract = await ethers.getContractFactory("ShardManager")
		shardManager = await ShardManagerContract.deploy(theNFT.address)
		await shardManager.deployed()
	})

	it("simple test...", async function () {
		expect(await shardManager.totalSupply()).to.equal(0)
	})

	it("only initial owner can redeem the NFT", async function () {
		await theNFT.setDetailsAndMint(10, 3000000, 300, 0, shardManager.address, acc1.address)
		await theNFT.setDetailsAndMint(11, 3000000, 3000, 0, shardManager.address, acc2.address)
		expect(await theNFT.balanceOf(acc1.address, 10)).to.equal(1)
		expect(await theNFT.balanceOf(acc2.address, 11)).to.equal(1)
		await theNFT.connect(acc1).setApprovalForAll(shardManager.address, true)
		await theNFT.connect(acc2).setApprovalForAll(shardManager.address, true)
		expect(await shardManager.connect(acc1).getShards(10))
		expect(await shardManager.connect(acc2).getShards(11))
		expect(await shardManager.balanceOf(acc1.address)).to.equal(web3.utils.toWei("87300", "ether"))
		expect(await shardManager.balanceOf(acc2.address)).to.equal(web3.utils.toWei("873000", "ether"))
		expect(await shardManager.balanceOf(shardManager.address)).to.equal(web3.utils.toWei("29700", "ether"))

		//set allowance
		await shardManager
			.connect(acc1)
			.approve(shardManager.address, web3.utils.toWei("999999999", "ether"))
		await shardManager
			.connect(acc2)
			.approve(shardManager.address, web3.utils.toWei("999999999", "ether"))

		//acc2 will try to get the NFT from acc1
		await expect(shardManager.connect(acc2).getTheNFT(10)).to.be.revertedWith(
			"only initial owner can redeem the NFT"
		)

		expect(await theNFT.balanceOf(acc2.address, 10)).to.equal(0)
	})

	it("you can't get the NFT if you don't have enough shards", async function () {
		await theNFT.setDetailsAndMint(10, 3000000, 300, 0, shardManager.address, acc1.address)
		expect(await theNFT.balanceOf(acc1.address, 10)).to.equal(1)
		await theNFT.connect(acc1).setApprovalForAll(shardManager.address, true)
		expect(await shardManager.connect(acc1).getShards(10))
		expect(await shardManager.balanceOf(acc1.address)).to.equal(web3.utils.toWei("87300", "ether"))

		//await shardManager.connect(acc1).transfer(acc2.address, web3.utils.toWei("10000", "ether"))

		//expect(await shardManager.balanceOf(acc1.address)).to.equal(web3.utils.toWei("80000", "ether"))

		expect(await theNFT.balanceOf(acc1.address, 10)).to.equal(0)

		//set allowance
		await shardManager
			.connect(acc1)
			.approve(shardManager.address, web3.utils.toWei("87300", "ether"))

		await expect(shardManager.connect(acc1).getTheNFT(10)).to.be.revertedWith(
			"burn amount exceeds balance"
		)
		expect(await theNFT.balanceOf(acc1.address, 10)).to.equal(0)
	})

	it("shards would be gone when you get your NFT back", async function () {
		await theNFT.setDetailsAndMint(10, 3000000, 300, 0, shardManager.address, acc1.address)
		expect(await theNFT.balanceOf(acc1.address, 10)).to.equal(1)
		await theNFT.connect(acc1).setApprovalForAll(shardManager.address, true)
		expect(await shardManager.connect(acc1).getShards(10))
		expect(await shardManager.balanceOf(acc1.address)).to.equal(web3.utils.toWei("87300", "ether"))
		expect(await shardManager.balanceOf(shardManager.address)).to.equal(web3.utils.toWei("2700", "ether"))
		expect(await shardManager.totalSupply()).to.equal(web3.utils.toWei("90000", "ether"))
		
		await theNFT.setDetailsAndMint(11, 3000000, 300, 0, shardManager.address, acc2.address)
		await theNFT.connect(acc2).setApprovalForAll(shardManager.address, true)
		expect(await shardManager.connect(acc2).getShards(11))
		await shardManager.connect(acc2).transfer(acc1.address, ethers.utils.parseEther("2700"))

		expect(await theNFT.balanceOf(acc1.address, 10)).to.equal(0)
		//set allowance
		await shardManager
			.connect(acc1)
			.approve(shardManager.address, web3.utils.toWei("99999999999", "ether"))

		//now deposit the shards back to get the NFT
		await shardManager.connect(acc1).getTheNFT(10)
		expect(await theNFT.balanceOf(acc1.address, 10)).to.equal(1)

		expect(await shardManager.balanceOf(acc1.address)).to.equal(0)
		expect(await shardManager.totalSupply()).to.equal(web3.utils.toWei("90000", "ether"))
	})

	it("you should get NFT when you deposit the shards back", async function () {
		await theNFT.setDetailsAndMint(10, 3000000, 300, 0, shardManager.address, acc1.address)
		expect(await theNFT.balanceOf(acc1.address, 10)).to.equal(1)
		await theNFT.connect(acc1).setApprovalForAll(shardManager.address, true)
		expect(await shardManager.connect(acc1).getShards(10))
		expect(await shardManager.balanceOf(acc1.address)).to.equal(web3.utils.toWei("87300", "ether"))

		expect(await theNFT.balanceOf(acc1.address, 10)).to.equal(0)

		await theNFT.setDetailsAndMint(11, 3000000, 300, 0, shardManager.address, acc2.address)
		await theNFT.connect(acc2).setApprovalForAll(shardManager.address, true)
		expect(await shardManager.connect(acc2).getShards(11))
		await shardManager.connect(acc2).transfer(acc1.address, ethers.utils.parseEther("2700"))

		//set allowance
		await shardManager
			.connect(acc1)
			.approve(shardManager.address, web3.utils.toWei("90000", "ether"))

		//now deposit the shards back to get the NFT
		await shardManager.connect(acc1).getTheNFT(10)

		expect(await theNFT.balanceOf(acc1.address, 10)).to.equal(1)
	})

	it("you should get correct shards when you transfer an NFT", async function () {
		// uint256 _index,
		// uint256 _landArea,
		// uint256 _rent,
		// address _to
		await theNFT.setDetailsAndMint(10, 3000000, 300, 0, shardManager.address, acc1.address)
		expect(await theNFT.balanceOf(acc1.address, 10)).to.equal(1)
		await theNFT.connect(acc1).setApprovalForAll(shardManager.address, true)
		expect(await shardManager.connect(acc1).getShards(10))
		expect(await shardManager.balanceOf(acc1.address)).to.equal(web3.utils.toWei("87300", "ether"))
	})

	it("you must approve the NFT before getting the shards", async function () {
		await theNFT.setDetailsAndMint(10, 3000000, 300, 0, shardManager.address, acc1.address)
		expect(await theNFT.balanceOf(acc1.address, 10)).to.equal(1)
		await expect(shardManager.connect(acc1).getShards(10)).to.be.revertedWith(
			"caller is not owner nor approved"
		)
	})

	it("you must own this NFT", async function () {
		await theNFT.setDetailsAndMint(123, 3000000, 300, 0, shardManager.address, acc2.address)
		await expect(shardManager.connect(acc1).getShards(123)).to.be.revertedWith(
			"you must own this NFT"
		)
	})
})
