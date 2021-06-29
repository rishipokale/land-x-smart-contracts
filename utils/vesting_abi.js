const VESTING_ABI = [
	{
		inputs: [{ internalType: "contract IERC20", name: "_token", type: "address" }],
		stateMutability: "nonpayable",
		type: "constructor",
	},
	{
		anonymous: false,
		inputs: [{ indexed: true, internalType: "address", name: "recipient", type: "address" }],
		name: "GrantAdded",
		type: "event",
	},
	{
		anonymous: false,
		inputs: [
			{ indexed: false, internalType: "address", name: "recipient", type: "address" },
			{ indexed: false, internalType: "uint256", name: "amountVested", type: "uint256" },
			{ indexed: false, internalType: "uint256", name: "amountNotVested", type: "uint256" },
		],
		name: "GrantRevoked",
		type: "event",
	},
	{
		anonymous: false,
		inputs: [
			{ indexed: true, internalType: "address", name: "recipient", type: "address" },
			{ indexed: false, internalType: "uint256", name: "amountClaimed", type: "uint256" },
		],
		name: "GrantTokensClaimed",
		type: "event",
	},
	{
		anonymous: false,
		inputs: [
			{ indexed: true, internalType: "address", name: "previousOwner", type: "address" },
			{ indexed: true, internalType: "address", name: "newOwner", type: "address" },
		],
		name: "OwnershipTransferred",
		type: "event",
	},
	{
		inputs: [
			{ internalType: "address", name: "_recipient", type: "address" },
			{ internalType: "uint256", name: "_amount", type: "uint256" },
			{ internalType: "uint16", name: "_vestingDurationInDays", type: "uint16" },
			{ internalType: "uint16", name: "_vestingCliffInDays", type: "uint16" },
		],
		name: "addTokenGrant",
		outputs: [],
		stateMutability: "nonpayable",
		type: "function",
	},
	{
		inputs: [],
		name: "claimVestedTokens",
		outputs: [],
		stateMutability: "nonpayable",
		type: "function",
	},
	{
		inputs: [{ internalType: "address", name: "_recipient", type: "address" }],
		name: "getGrantAmount",
		outputs: [{ internalType: "uint256", name: "", type: "uint256" }],
		stateMutability: "view",
		type: "function",
	},
	{
		inputs: [{ internalType: "address", name: "_recipient", type: "address" }],
		name: "getGrantStartTime",
		outputs: [{ internalType: "uint256", name: "", type: "uint256" }],
		stateMutability: "view",
		type: "function",
	},
	{
		inputs: [],
		name: "owner",
		outputs: [{ internalType: "address", name: "", type: "address" }],
		stateMutability: "view",
		type: "function",
	},
	{
		inputs: [],
		name: "renounceOwnership",
		outputs: [],
		stateMutability: "nonpayable",
		type: "function",
	},
	{
		inputs: [],
		name: "token",
		outputs: [{ internalType: "contract IERC20", name: "", type: "address" }],
		stateMutability: "view",
		type: "function",
	},
	{
		inputs: [{ internalType: "address", name: "newOwner", type: "address" }],
		name: "transferOwnership",
		outputs: [],
		stateMutability: "nonpayable",
		type: "function",
	},
]

module.exports = VESTING_ABI
