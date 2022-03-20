// SPDX-License-Identifier: MIT

pragma solidity 0.6.12;

import "../uniswapv2/UniswapV2Factory.sol";

contract HotpotSwapFactoryMock is UniswapV2Factory {
    constructor(address _feeToSetter) public UniswapV2Factory(_feeToSetter) {}
}