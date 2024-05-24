// SPDX-License-Identifier: MIT
pragma solidity 0.8.16;


import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "@openzeppelin/contracts/utils/Context.sol";
import "@openzeppelin/contracts/access/AccessControlEnumerable.sol";
import "@uniswap/v3-core/contracts/interfaces/IUniswapV3Factory.sol";
import "@uniswap/v3-core/contracts/interfaces/IUniswapV3Pool.sol";
import "../interfaces/IOraclePrices.sol";

contract OraclePrices is IOraclePrices, Context, AccessControlEnumerable {
    bytes32 public constant PRICE_SETTER_ROLE = keccak256("PRICE_SETTER_ROLE");

    mapping(string => uint256) public prices;

    IUniswapV3Factory public uniswapFactory;
    address public immutable usdc; 

    constructor() {
        _setupRole(DEFAULT_ADMIN_ROLE, msg.sender);
        prices["SOY"] = 457827341;
        prices["WHEAT"] = 281375850;
        prices["RICE"] = 367109363;
        prices["CORN"] = 181594488;
        uniswapFactory = IUniswapV3Factory(0x1F98431c8aD98523631AE4a59f267346ea31F984);
        usdc = 0xaf88d065e77c8cC2239327C5EDb3A432268e5831;
    }

    function setGrainPrice(uint256 _soyPrice, uint256 _wheatPrice, uint256 _ricePrice, uint256 _cornPrice) public {
        require(hasRole(PRICE_SETTER_ROLE, msg.sender), "not price setter");
        require(_soyPrice > 0 && _soyPrice < 999999999, "Invalid values");
        require(_wheatPrice > 0 && _wheatPrice < 999999999, "Invalid values");
        require(_ricePrice > 0 && _ricePrice < 999999999, "Invalid values");
        require(_cornPrice > 0 && _cornPrice < 999999999, "Invalid values");
        prices["SOY"] = _soyPrice;
        prices["WHEAT"] = _wheatPrice;
        prices["RICE"] = _ricePrice;
        prices["CORN"] = _cornPrice;
    }

    function getXTokenPrice(address xToken) public view returns (uint256) {
        address pool = getXtokenPool(xToken);
        if (pool == address(0)) {
            return 0;
        }

        address poolToken0 = IUniswapV3Pool(pool).token0();
        uint160 sqrtPriceX96;

        (sqrtPriceX96, , , , , , ) = IUniswapV3Pool(pool).slot0();
        if (poolToken0 == usdc) {
            return
                1e12 /
                ((uint256(sqrtPriceX96) * uint256(sqrtPriceX96) * 1e6) >> // USDC and xToken has 6 deciamls
                    (96 * 2));
        }
        return ((uint256(sqrtPriceX96) * uint256(sqrtPriceX96) * 1e6) >> // USDC and xToken has 6 deciamls
            (96 * 2));
    }

    function getXtokenPool(address xToken) public view returns (address) {
        return IUniswapV3Factory(uniswapFactory).getPool(usdc, xToken, 3000);
    }
}
