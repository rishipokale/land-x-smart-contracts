// SPDX-License-Identifier: MIT
pragma solidity 0.8.16;

import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "@openzeppelin/contracts/access/AccessControl.sol";
import "@openzeppelin/contracts/token/ERC20/utils/SafeERC20.sol";
import "../interfaces/IxTokenRouter.sol";
import "../interfaces/IOraclePrices.sol";

using SafeERC20 for IERC20;


contract SellCToken is AccessControl {

    IERC20 public usdc;
    IxTokenRouter public xTokenRouter;
    IOraclePrices public oraclePrices;
    uint256 public feePercentage = 1000;

    event TokenSold(address seller, address token, uint256 amount);
   
    constructor(address _usdc, address _xTokenRouter, address _oraclePrices) {
        require(_usdc != address(0), "zero address provided");
        require(_xTokenRouter != address(0), "zero address provided");
        require(_oraclePrices != address(0), "zero address provided");
        usdc = IERC20(_usdc);
        xTokenRouter = IxTokenRouter(_xTokenRouter);
        oraclePrices = IOraclePrices(_oraclePrices);
        _grantRole(DEFAULT_ADMIN_ROLE, msg.sender);
    }

    function sellCTokens(string memory _type, uint256 _amount) public {
        address cToken = xTokenRouter.getCToken(_type);
        require(cToken != address(0), "unsupported type");
        
        require(IERC20(cToken).balanceOf(msg.sender) >= _amount, "inssuficient funds");
        
        uint256 price = oraclePrices.prices(_type);
        require(price > 0, "price isn't set");
        
        uint256 usdcAmount = price * _amount / 1e9;
        uint256 feeAmount = usdcAmount * feePercentage / 10000;

        IERC20(cToken).safeTransferFrom(msg.sender, address(this), _amount);
        IERC20(usdc).transfer(msg.sender, usdcAmount - feeAmount);

        emit TokenSold(msg.sender, cToken, _amount);
    }

    function sellCTokensPreview(string memory _type, uint256 _amount) public view returns(uint256, uint256) {
        uint256 price = oraclePrices.prices(_type);

        uint256 usdcAmount = price * _amount / 1e9;
        uint256 feeAmount = usdcAmount * feePercentage / 10000;
        return (usdcAmount, feeAmount);
    }

    function updateFeePercentage(uint256 _fee) public onlyRole(DEFAULT_ADMIN_ROLE) {
        feePercentage = _fee;
    }

     function updateOraclePrices(address _oraclePrices) public onlyRole(DEFAULT_ADMIN_ROLE) {
        require(_oraclePrices != address(0), "zero address provided");
        oraclePrices = IOraclePrices(_oraclePrices);
    }

    function reclaimUSDC() public onlyRole(DEFAULT_ADMIN_ROLE) {
        uint256 balance = usdc.balanceOf(address(this));
        usdc.transfer(msg.sender, balance);
    }

    function reclaimCTokens() public onlyRole(DEFAULT_ADMIN_ROLE) {
        address cWheat = xTokenRouter.getCToken("WHEAT");
        address cSoy = xTokenRouter.getCToken("SOY");
        address cRice = xTokenRouter.getCToken("RICE");
        address cCorn = xTokenRouter.getCToken("CORN");
        IERC20(cWheat).transfer(msg.sender, IERC20(cWheat).balanceOf(address(this)));
        IERC20(cSoy).transfer(msg.sender, IERC20(cSoy).balanceOf(address(this)));
        IERC20(cRice).transfer(msg.sender, IERC20(cRice).balanceOf(address(this)));
        IERC20(cCorn).transfer(msg.sender, IERC20(cCorn).balanceOf(address(this)));
    }
}
