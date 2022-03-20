// SPDX-License-Identifier: MIT

pragma solidity 0.6.12;

import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "@openzeppelin/contracts/token/ERC20/ERC20.sol";
import "@openzeppelin/contracts/math/SafeMath.sol";

// HotpotBar is the coolest bar in town. You come in with some Hotpot, and leave with more! The longer you stay, the more Hotpot you get.
//
// This contract handles swapping to and from xHotpot, HotpotSwap's staking token.
contract HotpotBar is ERC20("HotpotBar", "xHOTPOT"){
    using SafeMath for uint256;
    IERC20 public hotpot;

    // Define the Hotpot token contract
    constructor(IERC20 _hotpot) public {
        hotpot = _hotpot;
    }

    // Enter the bar. Pay some HOTPOTs. Earn some shares.
    // Locks Hotpot and mints xHotpot
    function enter(uint256 _amount) public {
        // Gets the amount of Hotpot locked in the contract
        uint256 totalHotpot = hotpot.balanceOf(address(this));
        // Gets the amount of xHotpot in existence
        uint256 totalShares = totalSupply();
        // If no xHotpot exists, mint it 1:1 to the amount put in
        if (totalShares == 0 || totalHotpot == 0) {
            _mint(msg.sender, _amount);
        } 
        // Calculate and mint the amount of xHotpot the Hotpot is worth. The ratio will change overtime, as xHotpot is burned/minted and Hotpot deposited + gained from fees / withdrawn.
        else {
            uint256 what = _amount.mul(totalShares).div(totalHotpot);
            _mint(msg.sender, what);
        }
        // Lock the Hotpot in the contract
        hotpot.transferFrom(msg.sender, address(this), _amount);
    }

    // Leave the bar. Claim back your HOTPOTs.
    // Unlocks the staked + gained Hotpot and burns xHotpot
    function leave(uint256 _share) public {
        // Gets the amount of xHotpot in existence
        uint256 totalShares = totalSupply();
        // Calculates the amount of Hotpot the xHotpot is worth
        uint256 what = _share.mul(hotpot.balanceOf(address(this))).div(totalShares);
        _burn(msg.sender, _share);
        hotpot.transfer(msg.sender, what);
    }
}
